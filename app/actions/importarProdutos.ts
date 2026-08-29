"use server";

import ExcelJS from "exceljs";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { mapearCabecalhos, normalizarCategoria } from "@/utils/planilha";

export interface LinhaResultado {
  linha: number;
  sku: string;
  status: "criado" | "atualizado" | "erro";
  mensagem?: string;
}

export interface ResultadoImportacao {
  ok: boolean;
  erro?: string;
  linhas: LinhaResultado[];
  criados: number;
  atualizados: number;
  comErro: number;
}

function textoCelula(valor: ExcelJS.CellValue): string {
  if (valor == null) return "";
  if (typeof valor === "object" && "text" in (valor as any)) return String((valor as any).text ?? "").trim();
  if (typeof valor === "object" && "result" in (valor as any)) return String((valor as any).result ?? "").trim();
  return String(valor).trim();
}

function numeroCelula(valor: ExcelJS.CellValue): number | null {
  const texto = textoCelula(valor).replace(",", ".");
  if (!texto) return null;
  const n = Number(texto);
  return Number.isFinite(n) ? n : null;
}

export async function importarPlanilhaProdutos(formData: FormData): Promise<ResultadoImportacao> {
  const arquivo = formData.get("arquivo") as File | null;
  if (!arquivo || arquivo.size === 0) {
    return { ok: false, erro: "Nenhum arquivo enviado.", linhas: [], criados: 0, atualizados: 0, comErro: 0 };
  }

  const supabase = await createClient();

  let workbook: ExcelJS.Workbook;
  try {
    const buffer = Buffer.from(await arquivo.arrayBuffer());
    workbook = new ExcelJS.Workbook();
    // exceljs traz sua própria cópia de @types/node, com um tipo Buffer incompatível em compilação (mas idêntico em runtime)
    await workbook.xlsx.load(buffer as any);
  } catch {
    return { ok: false, erro: "Não foi possível ler o arquivo. Envie um .xlsx válido.", linhas: [], criados: 0, atualizados: 0, comErro: 0 };
  }

  const planilha = workbook.worksheets[0];
  if (!planilha || planilha.rowCount < 2) {
    return { ok: false, erro: "A planilha está vazia ou não tem linhas de dados.", linhas: [], criados: 0, atualizados: 0, comErro: 0 };
  }

  const cabecalhos: (string | undefined)[] = [];
  planilha.getRow(1).eachCell({ includeEmpty: true }, (cell, colNumero) => {
    cabecalhos[colNumero] = textoCelula(cell.value);
  });
  const col = mapearCabecalhos(cabecalhos);

  if (col.sku === undefined || col.categoria === undefined) {
    return {
      ok: false,
      erro: "A planilha precisa ter, no mínimo, as colunas 'SKU' e 'Categoria'. Baixe o modelo para conferir o formato esperado.",
      linhas: [],
      criados: 0,
      atualizados: 0,
      comErro: 0,
    };
  }

  const { data: fabricantesExistentes } = await supabase.from("fabricantes").select("id, nome");
  const fabricantePorNome = new Map((fabricantesExistentes || []).map((f) => [f.nome.trim().toLowerCase(), f.id] as const));

  const linhas: LinhaResultado[] = [];
  let criados = 0;
  let atualizados = 0;
  let comErro = 0;

  for (let i = 2; i <= planilha.rowCount; i++) {
    const row = planilha.getRow(i);
    const sku = col.sku !== undefined ? textoCelula(row.getCell(col.sku).value) : "";
    const categoriaTexto = col.categoria !== undefined ? textoCelula(row.getCell(col.categoria).value) : "";

    if (!sku && !categoriaTexto) continue; // linha em branco

    if (!sku) {
      comErro++;
      linhas.push({ linha: i, sku: "", status: "erro", mensagem: "SKU vazio." });
      continue;
    }

    const categoria = normalizarCategoria(categoriaTexto);
    if (!categoria) {
      comErro++;
      linhas.push({ linha: i, sku, status: "erro", mensagem: `Categoria "${categoriaTexto}" não reconhecida.` });
      continue;
    }

    const fabricanteNome = col.fabricante !== undefined ? textoCelula(row.getCell(col.fabricante).value) : "";
    let fabricanteId: string | null = null;
    if (fabricanteNome) {
      const chave = fabricanteNome.toLowerCase();
      fabricanteId = fabricantePorNome.get(chave) ?? null;
      if (!fabricanteId) {
        const { data: novoFabricante, error } = await supabase.from("fabricantes").insert({ nome: fabricanteNome }).select("id").single();
        if (!error && novoFabricante) {
          fabricanteId = novoFabricante.id;
          fabricantePorNome.set(chave, novoFabricante.id);
        }
      }
    }

    const modelo = col.modelo !== undefined ? textoCelula(row.getCell(col.modelo).value) : "";
    const potencia = col.potencia !== undefined ? numeroCelula(row.getCell(col.potencia).value) : null;

    const { data: existente } = await supabase.from("produtos").select("id, atributos").eq("sku", sku).maybeSingle();

    const atributosAtuais = (existente?.atributos as Record<string, any>) ?? {};
    const atributos: Record<string, any> = { ...atributosAtuais };
    if (modelo) atributos.modelo = modelo;
    if (potencia !== null && potencia > 0) atributos.potencia_w = potencia;

    let produtoId: string;
    if (existente) {
      const { error } = await supabase
        .from("produtos")
        .update({ categoria, fabricante_id: fabricanteId, atributos })
        .eq("id", existente.id);
      if (error) {
        comErro++;
        linhas.push({ linha: i, sku, status: "erro", mensagem: error.message });
        continue;
      }
      produtoId = existente.id;
      atualizados++;
      linhas.push({ linha: i, sku, status: "atualizado" });
    } else {
      const { data: novo, error } = await supabase
        .from("produtos")
        .insert({ sku, categoria, fabricante_id: fabricanteId, atributos })
        .select("id")
        .single();
      if (error || !novo) {
        comErro++;
        linhas.push({ linha: i, sku, status: "erro", mensagem: error?.message ?? "Falha ao criar produto." });
        continue;
      }
      produtoId = novo.id;
      criados++;
      linhas.push({ linha: i, sku, status: "criado" });
    }

    const cdId = col.cd !== undefined ? textoCelula(row.getCell(col.cd).value) : "";
    const preco = col.preco !== undefined ? numeroCelula(row.getCell(col.preco).value) : null;
    const quantidade = col.quantidade !== undefined ? numeroCelula(row.getCell(col.quantidade).value) : null;

    if (cdId && preco !== null && preco >= 0 && quantidade !== null && quantidade >= 0) {
      const { data: estoqueExistente } = await supabase
        .from("estoque_preco")
        .select("id")
        .eq("produto_id", produtoId)
        .eq("cd_id", cdId)
        .maybeSingle();

      if (estoqueExistente) {
        await supabase.from("estoque_preco").update({ preco, quantidade }).eq("id", estoqueExistente.id);
      } else {
        await supabase.from("estoque_preco").insert({ produto_id: produtoId, cd_id: cdId, preco, quantidade });
      }
    }
  }

  revalidatePath("/admin/catalogo");
  revalidatePath("/admin/estoque");
  revalidatePath("/admin/fabricantes");

  return { ok: true, linhas, criados, atualizados, comErro };
}
