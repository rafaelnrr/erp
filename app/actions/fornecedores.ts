"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export interface Fornecedor {
  id: string;
  nome: string;
  documento: string | null;
  telefone: string | null;
  email: string | null;
}

export async function listarFornecedores(): Promise<{ ok: true; data: Fornecedor[] } | { ok: false; error: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("fornecedores").select("id, nome, documento, telefone, email").order("nome", { ascending: true });

  if (error) return { ok: false, error: error.message };
  return { ok: true, data: data as Fornecedor[] };
}

export async function criarFornecedor(input: { nome: string; documento?: string; telefone?: string; email?: string }) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("fornecedores")
    .insert({ nome: input.nome, documento: input.documento || null, telefone: input.telefone || null, email: input.email || null })
    .select("id, nome, documento, telefone, email")
    .single();

  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/admin/fornecedores");
  return { ok: true as const, data: data as Fornecedor };
}

export async function atualizarFornecedor(id: string, input: { nome: string; documento?: string; telefone?: string; email?: string }) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("fornecedores")
    .update({ nome: input.nome, documento: input.documento || null, telefone: input.telefone || null, email: input.email || null })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/fornecedores");
  return { success: true };
}

/** Exclui um fornecedor. */
export async function excluirFornecedor(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("fornecedores").delete().eq("id", id).select("id");

  if (error) return { error: error.message };
  if (!data || data.length === 0) {
    return { error: "Não foi possível excluir: você não tem permissão para excluir fornecedores." };
  }

  revalidatePath("/admin/fornecedores");
  return { success: true };
}
