"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export interface Servico {
  id: string;
  nome: string;
  descricao: string | null;
  recorrencia_padrao: "unico" | "mensal" | "anual";
  tempo_execucao_valor: number | null;
  tempo_execucao_unidade: "horas" | "dias" | null;
  custo_interno: number | null;
  preco_padrao: number;
  ativo: boolean;
}

const CAMPOS = "id, nome, descricao, recorrencia_padrao, tempo_execucao_valor, tempo_execucao_unidade, custo_interno, preco_padrao, ativo";

/** Para seletores dentro de propostas — só serviços ativos. */
export async function listarServicos() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("servicos").select(CAMPOS).eq("ativo", true).order("nome", { ascending: true });

  return { ok: !error, data: (data as Servico[]) || [], error: error?.message };
}

/** Para a tela de administração do catálogo — inclui inativos. */
export async function listarTodosServicos() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("servicos").select(CAMPOS).order("nome", { ascending: true });

  return { ok: !error, data: (data as Servico[]) || [], error: error?.message };
}

export interface ServicoInput {
  nome: string;
  descricao?: string | null;
  recorrencia_padrao: "unico" | "mensal" | "anual";
  tempo_execucao_valor?: number | null;
  tempo_execucao_unidade?: "horas" | "dias" | null;
  custo_interno?: number | null;
  preco_padrao: number;
  ativo?: boolean;
}

export async function criarServico(input: ServicoInput) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("servicos").insert(input).select(CAMPOS).single();

  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/admin/servicos");
  return { ok: true as const, data: data as Servico };
}

export async function atualizarServico(id: string, input: Partial<ServicoInput>) {
  const supabase = await createClient();
  const { error } = await supabase.from("servicos").update(input).eq("id", id);

  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/admin/servicos");
  return { ok: true as const };
}
