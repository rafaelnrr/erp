"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export interface Concessionaria {
  id: string;
  nome: string;
}

export async function listarConcessionarias(): Promise<{ ok: true; data: Concessionaria[] } | { ok: false; error: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("concessionarias").select("id, nome").order("nome", { ascending: true });

  if (error) return { ok: false, error: error.message };
  return { ok: true, data: data as Concessionaria[] };
}

/** Criação aberta a admin/editor — quem cadastra um cliente pode adicionar uma concessionária nova na hora. */
export async function criarConcessionaria(nome: string): Promise<{ ok: true; data: Concessionaria } | { ok: false; error: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("concessionarias").insert({ nome }).select("id, nome").single();

  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/concessionarias");
  return { ok: true, data: data as Concessionaria };
}

export async function atualizarConcessionaria(id: string, nome: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("concessionarias").update({ nome }).eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/concessionarias");
  return { success: true };
}

/** Exclui uma concessionária. O banco bloqueia (erro de FK) se algum cliente ainda a referenciar. */
export async function excluirConcessionaria(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("concessionarias").delete().eq("id", id).select("id");

  if (error) {
    if (error.code === "23503") {
      return { error: "Não é possível excluir: existem clientes usando esta concessionária." };
    }
    return { error: error.message };
  }
  if (!data || data.length === 0) {
    return { error: "Não foi possível excluir: você não tem permissão para excluir concessionárias." };
  }

  revalidatePath("/admin/concessionarias");
  return { success: true };
}
