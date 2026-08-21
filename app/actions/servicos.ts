"use server";

import { createClient } from "@/utils/supabase/server";

export interface Servico {
  id: string;
  nome: string;
  descricao: string | null;
  recorrencia_padrao: "unico" | "mensal" | "anual";
  preco_padrao: number;
}

export async function listarServicos() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("servicos")
    .select("id, nome, descricao, recorrencia_padrao, preco_padrao")
    .eq("ativo", true)
    .order("nome", { ascending: true });

  return { ok: !error, data: (data as Servico[]) || [], error: error?.message };
}

export async function criarServico(input: {
  nome: string;
  descricao?: string;
  recorrencia_padrao: "unico" | "mensal" | "anual";
  preco_padrao: number;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("servicos").insert(input).select("id, nome, descricao, recorrencia_padrao, preco_padrao").single();

  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const, data: data as Servico };
}
