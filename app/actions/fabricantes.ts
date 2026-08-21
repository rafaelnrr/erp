"use server";

import { createClient } from "@/utils/supabase/server";

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
