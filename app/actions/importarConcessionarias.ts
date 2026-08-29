"use server";

import ExcelJS from "exceljs";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { mapearCabecalhos } from "@/utils/planilha";
import { lerPlanilha } from "@/utils/lerPlanilha";
import type { LinhaResultado, ResultadoImportacao } from "@/app/actions/importarProdutos";

function textoCelula(valor: ExcelJS.CellValue): string {
  if (valor == null) return "";
  if (typeof valor === "object" && "text" in (valor as any)) return String((valor as any).text ?? "").trim();
  if (typeof valor === "object" && "result" in (valor as any)) return String((valor as any).result ?? "").trim();
  return String(valor).trim();
}

export async function importarPlanilhaConcessionarias(formData: FormData): Promise<ResultadoImportacao> {
  const arquivo = formData.get("arquivo") as File | null;
  if (!arquivo || arquivo.size === 0) {
    return { ok: false, erro: "Nenhum arquivo enviado.", linhas: [], criados: 0, atualizados: 0, comErro: 0 };
  }
  if (!/\.(xlsx|csv)$/i.test(arquivo.name)) {
    return { ok: false, erro: "Formato não suportado. Envie um arquivo .xlsx ou .csv.", linhas: [], criados: 0, atualizados: 0, comErro: 0 };
  }

  const supabase = await createClient();

  let planilha: ExcelJS.Worksheet | null;
  try {
    const buffer = Buffer.from(await arquivo.arrayBuffer());
    planilha = await lerPlanilha(buffer, arquivo.name);
  } catch {
    return { ok: false, erro: "Não foi possível ler o arquivo. Confira se o .xlsx/.csv não está corrompido.", linhas: [], criados: 0, atualizados: 0, comErro: 0 };
  }

  if (!planilha || planilha.rowCount < 2) {
    return { ok: false, erro: "A planilha está vazia ou não tem linhas de dados.", linhas: [], criados: 0, atualizados: 0, comErro: 0 };
  }

  const cabecalhos: (string | undefined)[] = [];
  planilha.getRow(1).eachCell({ includeEmpty: true }, (cell, colNumero) => {
    cabecalhos[colNumero] = textoCelula(cell.value);
  });
  const col = mapearCabecalhos(cabecalhos);

  if (col.nome === undefined) {
    return {
      ok: false,
      erro: "A planilha precisa ter uma coluna 'Nome'. Baixe o modelo para conferir o formato esperado.",
      linhas: [],
      criados: 0,
      atualizados: 0,
      comErro: 0,
    };
  }

  const { data: existentes } = await supabase.from("concessionarias").select("id, nome");
  const porNome = new Set((existentes || []).map((c) => c.nome.trim().toLowerCase()));

  const linhas: LinhaResultado[] = [];
  let criados = 0;
  const atualizados = 0;
  let comErro = 0;

  for (let i = 2; i <= planilha.rowCount; i++) {
    const row = planilha.getRow(i);
    const nome = col.nome !== undefined ? textoCelula(row.getCell(col.nome).value) : "";
    if (!nome) continue; // linha em branco

    const chave = nome.toLowerCase();
    if (porNome.has(chave)) {
      linhas.push({ linha: i, sku: nome, status: "atualizado", mensagem: "Já existia — nenhuma alteração (concessionária tem só o nome)." });
      continue;
    }

    const { error } = await supabase.from("concessionarias").insert({ nome });
    if (error) {
      comErro++;
      linhas.push({ linha: i, sku: nome, status: "erro", mensagem: error.message });
      continue;
    }
    porNome.add(chave);
    criados++;
    linhas.push({ linha: i, sku: nome, status: "criado" });
  }

  revalidatePath("/admin/concessionarias");

  return { ok: true, linhas, criados, atualizados, comErro };
}
