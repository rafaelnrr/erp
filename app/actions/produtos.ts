"use server";

import { createClient } from "@/utils/supabase/server";
import type { Database } from "@/types/supabase";

export type Produto = Database["public"]["Tables"]["produtos"]["Row"];

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
    .select(
      "id, sku, categoria, atributos"
    )
    .order("categoria", { ascending: true });

  if (categoria) {
    query = query.eq("categoria", categoria);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Erro ao listar produtos:", error.message);
    return { ok: false, error: "Não foi possível carregar o catálogo." };
  }

  return { ok: true, data: data as Produto[] };
}
