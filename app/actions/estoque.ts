"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export interface EstoquePrecoLinha {
  id: string;
  produto_id: string | null;
  cd_id: string;
  preco: number;
  quantidade: number;
  produtos: {
    sku: string;
    categoria: string;
    atributos: Record<string, any> | null;
    fabricantes: { nome: string } | null;
  } | null;
}

export async function listarEstoquePreco() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("estoque_preco")
    .select("id, produto_id, cd_id, preco, quantidade, produtos(sku, categoria, atributos, fabricantes(nome))")
    .order("cd_id", { ascending: true });

  return { ok: !error, data: (data as unknown as EstoquePrecoLinha[]) || [], error: error?.message };
}

export async function criarPrecoEstoque(input: { produto_id: string; cd_id: string; preco: number; quantidade: number }) {
  const supabase = await createClient();
  const { error } = await supabase.from("estoque_preco").insert(input);

  if (error) return { error: error.message };
  revalidatePath("/admin/estoque");
  return { success: true };
}

export async function atualizarPrecoEstoque(id: string, campos: { preco?: number; quantidade?: number; cd_id?: string }) {
  const supabase = await createClient();
  const { error } = await supabase.from("estoque_preco").update(campos).eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/estoque");
  return { success: true };
}

export async function excluirPrecoEstoque(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("estoque_preco").delete().eq("id", id).select("id");

  if (error) return { error: error.message };
  if (!data || data.length === 0) {
    return { error: "Não foi possível excluir: você não tem permissão para excluir registros de estoque." };
  }

  revalidatePath("/admin/estoque");
  return { success: true };
}
