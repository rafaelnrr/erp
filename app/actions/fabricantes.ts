"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export interface Fabricante {
  id: string;
  nome: string;
}

export async function listarFabricantes(): Promise<{ ok: true; data: Fabricante[] } | { ok: false; error: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("fabricantes").select("id, nome").order("nome", { ascending: true });

  if (error) return { ok: false, error: error.message };
  return { ok: true, data: data as Fabricante[] };
}

export async function criarFabricante(nome: string): Promise<{ ok: true; data: Fabricante } | { ok: false; error: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("fabricantes").insert({ nome }).select("id, nome").single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, data: data as Fabricante };
}

export async function atualizarFabricante(id: string, nome: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("fabricantes").update({ nome }).eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/fabricantes");
  return { success: true };
}

/** Exclui um fabricante. O banco bloqueia (erro de FK) se ele tiver produtos vinculados. */
export async function excluirFabricante(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("fabricantes").delete().eq("id", id).select("id");

  if (error) {
    if (error.code === "23503") {
      return { error: "Não é possível excluir: este fabricante tem produtos vinculados no catálogo." };
    }
    return { error: error.message };
  }
  if (!data || data.length === 0) {
    return { error: "Não foi possível excluir: você não tem permissão para excluir fabricantes." };
  }

  revalidatePath("/admin/fabricantes");
  return { success: true };
}
