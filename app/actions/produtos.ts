"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import type { Database } from "@/types/supabase";

export type Produto = Database["public"]["Tables"]["produtos"]["Row"] & {
  fabricante_id: string | null;
  fabricantes: { nome: string } | null;
};

type ListarProdutosResult =
  | { ok: true; data: Produto[] }
  | { ok: false; error: string };

/**
 * Busca produtos ativos do catálogo, opcionalmente filtrados por categoria.
 * Usa o client Supabase server-side — o RLS garante que qualquer usuário
 * autenticado (Comercial ou Administrador) pode ler, mas apenas
 * Administrador pode escrever (ver policies na migration 00001).
 */
export async function listarProdutos(
  categoria?: Produto["categoria"]
): Promise<ListarProdutosResult> {
  const supabase = await createClient();

  let query = supabase
    .from("produtos")
    .select("id, sku, categoria, atributos, fabricante_id, fabricantes(nome)")
    .order("categoria", { ascending: true });

  if (categoria) {
    query = query.eq("categoria", categoria);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Erro ao listar produtos:", error.message);
    return { ok: false, error: "Não foi possível carregar o catálogo." };
  }

  return { ok: true, data: data as unknown as Produto[] };
}

export async function criarProduto(formData: FormData) {
  const supabase = await createClient();
  const sku = formData.get("sku") as string;
  const categoria = formData.get("categoria") as string;
  const fabricanteId = formData.get("fabricante_id") as string;
  const modelo = formData.get("modelo") as string;
  const potencia = Number(formData.get("potencia_w"));

  const atributos = {
    modelo,
    ...(potencia > 0 && { potencia_w: potencia }),
  };

  const { error } = await supabase.from("produtos").insert({
    sku,
    categoria: categoria as any,
    fabricante_id: fabricanteId || null,
    atributos,
  });

  if (error) return { error: error.message };

  return { success: true };
}

export async function buscarProduto(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("produtos")
    .select("id, sku, categoria, atributos, fabricante_id, fabricantes(nome)")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as unknown as Produto;
}

export async function atualizarProduto(id: string, formData: FormData) {
  const supabase = await createClient();
  const sku = formData.get("sku") as string;
  const categoria = formData.get("categoria") as string;
  const fabricanteId = formData.get("fabricante_id") as string;
  const modelo = formData.get("modelo") as string;
  const potencia = Number(formData.get("potencia_w"));

  const { data: atual } = await supabase.from("produtos").select("atributos").eq("id", id).single();
  const atributosAtuais = (atual?.atributos as Record<string, any>) ?? {};

  const atributos: Record<string, any> = { ...atributosAtuais, modelo };
  if (potencia > 0) atributos.potencia_w = potencia;
  else delete atributos.potencia_w;

  const { error } = await supabase
    .from("produtos")
    .update({
      sku,
      categoria: categoria as any,
      fabricante_id: fabricanteId || null,
      atributos,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/catalogo");
  return { success: true };
}

/** Exclui um produto. O banco bloqueia (erro de FK) se ele estiver em uso em dimensionamentos ou itens de proposta. */
export async function excluirProduto(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("produtos").delete().eq("id", id).select("id");

  if (error) {
    if (error.code === "23503") {
      return { error: "Não é possível excluir: este produto está em uso em dimensionamentos ou propostas." };
    }
    return { error: error.message };
  }
  if (!data || data.length === 0) {
    return { error: "Não foi possível excluir: você não tem permissão para excluir produtos." };
  }

  revalidatePath("/admin/catalogo");
  return { success: true };
}
