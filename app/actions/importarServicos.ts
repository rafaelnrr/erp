"use server";

import ExcelJS from "exceljs";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { mapearCabecalhos, normalizarRecorrencia, normalizarBooleano } from "@/utils/planilha";
import { lerPlanilha } from "@/utils/lerPlanilha";
import type { LinhaResultado, ResultadoImportacao } from "@/app/actions/importarProdutos";

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

export async function importarPlanilhaServicos(formData: FormData): Promise<ResultadoImportacao> {
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

  if (col.nome === undefined || col.precovenda === undefined) {
    return {
      ok: false,
      erro: "A planilha precisa ter, no mínimo, as colunas 'Nome' e 'Preço de Venda'. Baixe o modelo para conferir o formato esperado.",
      linhas: [],
      criados: 0,
      atualizados: 0,
      comErro: 0,
    };
  }

  const { data: servicosExistentes } = await supabase.from("servicos").select("id, nome");
  const servicoPorNome = new Map((servicosExistentes || []).map((s) => [s.nome.trim().toLowerCase(), s.id] as const));

  const linhas: LinhaResultado[] = [];
  let criados = 0;
  let atualizados = 0;
  let comErro = 0;

  for (let i = 2; i <= planilha.rowCount; i++) {
    const row = planilha.getRow(i);
    const nome = col.nome !== undefined ? textoCelula(row.getCell(col.nome).value) : "";
    const precoVendaTexto = col.precovenda !== undefined ? textoCelula(row.getCell(col.precovenda).value) : "";

    if (!nome && !precoVendaTexto) continue; // linha em branco

    if (!nome) {
      comErro++;
      linhas.push({ linha: i, sku: "", status: "erro", mensagem: "Nome vazio." });
      continue;
    }

    const precoVenda = col.precovenda !== undefined ? numeroCelula(row.getCell(col.precovenda).value) : null;
    if (precoVenda === null || precoVenda < 0) {
      comErro++;
      linhas.push({ linha: i, sku: nome, status: "erro", mensagem: "Preço de Venda inválido ou vazio." });
      continue;
    }

    const recorrenciaTexto = col.recorrencia !== undefined ? textoCelula(row.getCell(col.recorrencia).value) : "unico";
    const recorrencia = normalizarRecorrencia(recorrenciaTexto || "unico");
    if (!recorrencia) {
      comErro++;
      linhas.push({ linha: i, sku: nome, status: "erro", mensagem: `Recorrência "${recorrenciaTexto}" não reconhecida (use único, mensal ou anual).` });
      continue;
    }

    const descricao = col.modelo !== undefined ? textoCelula(row.getCell(col.modelo).value) : "";
    const tempoValor = col.tempovalor !== undefined ? numeroCelula(row.getCell(col.tempovalor).value) : null;
    const tempoUnidadeTexto = col.tempounidade !== undefined ? textoCelula(row.getCell(col.tempounidade).value).toLowerCase() : "";
    const tempoUnidade = tempoUnidadeTexto.startsWith("dia") ? "dias" : tempoValor !== null ? "horas" : null;
    const custoInterno = col.custointerno !== undefined ? numeroCelula(row.getCell(col.custointerno).value) : null;
    const ativoTexto = col.ativo !== undefined ? textoCelula(row.getCell(col.ativo).value) : "";
    const ativo = normalizarBooleano(ativoTexto, true);

    const payload = {
      nome,
      descricao: descricao || null,
      recorrencia_padrao: recorrencia,
      tempo_execucao_valor: tempoValor,
      tempo_execucao_unidade: tempoUnidade,
      custo_interno: custoInterno,
      preco_padrao: precoVenda,
      ativo,
    };

    const chave = nome.toLowerCase();
    const existenteId = servicoPorNome.get(chave);

    if (existenteId) {
      const { error } = await supabase.from("servicos").update(payload).eq("id", existenteId);
      if (error) {
        comErro++;
        linhas.push({ linha: i, sku: nome, status: "erro", mensagem: error.message });
        continue;
      }
      atualizados++;
      linhas.push({ linha: i, sku: nome, status: "atualizado" });
    } else {
      const { data: novo, error } = await supabase.from("servicos").insert(payload).select("id").single();
      if (error || !novo) {
        comErro++;
        linhas.push({ linha: i, sku: nome, status: "erro", mensagem: error?.message ?? "Falha ao criar serviço." });
        continue;
      }
      servicoPorNome.set(chave, novo.id);
      criados++;
      linhas.push({ linha: i, sku: nome, status: "criado" });
    }
  }

  revalidatePath("/admin/servicos");

  return { ok: true, linhas, criados, atualizados, comErro };
}
