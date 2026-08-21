"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export interface SnapshotItem {
  categoria: "modulo" | "inversor";
  sku: string;
  fabricante: string;
  modelo: string;
  quantidade: number;
  preco_unitario: number;
  subtotal: number;
}

export interface ProposalSnapshot {
  cliente: { nome: string; documento: string | null; cidade: string | null; uf: string | null };
  dimensionamento: { consumo_alvo: number; geracao_estimada: number; qtde_modulos: number; tipo_ligacao: string | null };
  itens: SnapshotItem[];
  valor_total: number;
  gerado_em: string;
}

async function precoDoProduto(supabase: any, produtoId: string): Promise<number> {
  const { data } = await supabase.from("estoque_preco").select("preco").eq("produto_id", produtoId).order("preco", { ascending: true }).limit(1);
  return data && data[0] ? Number(data[0].preco) : 0;
}

export async function criarProposta(dimensionamentoId: string) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return { error: "Não autorizado" };

  const { data: dim, error: errDim } = await supabase
    .from("dimensionamentos")
    .select("id, cliente_id, consumo_alvo, geracao_estimada, qtde_modulos, tipo_ligacao, modulo_id, inversor_id")
    .eq("id", dimensionamentoId)
    .single();

  if (errDim || !dim) return { error: "Dimensionamento não encontrado." };

  const { data: cliente } = await supabase.from("clientes").select("nome, documento, cidade, uf").eq("id", dim.cliente_id).single();

  const { data: modulo } = await supabase.from("produtos").select("sku, atributos, fabricantes(nome)").eq("id", dim.modulo_id).single();
  const { data: inversor } = await supabase.from("produtos").select("sku, atributos, fabricantes(nome)").eq("id", dim.inversor_id).single();

  if (!cliente || !modulo || !inversor) return { error: "Dados incompletos para gerar a proposta (cliente ou catálogo)." };

  const precoModulo = await precoDoProduto(supabase, dim.modulo_id);
  const precoInversor = await precoDoProduto(supabase, dim.inversor_id);

  // qtde de inversores não é persistida em dimensionamentos hoje — estimamos 1
  // unidade por padrão; o valor exato foi mostrado na tela de cálculo.
  const qtdeInversores = 1;

  const itens: SnapshotItem[] = [
    {
      categoria: "modulo",
      sku: modulo.sku,
      fabricante: (modulo as any).fabricantes?.nome ?? "—",
      modelo: (modulo.atributos as any)?.modelo ?? "—",
      quantidade: dim.qtde_modulos,
      preco_unitario: precoModulo,
      subtotal: precoModulo * dim.qtde_modulos,
    },
    {
      categoria: "inversor",
      sku: inversor.sku,
      fabricante: (inversor as any).fabricantes?.nome ?? "—",
      modelo: (inversor.atributos as any)?.modelo ?? "—",
      quantidade: qtdeInversores,
      preco_unitario: precoInversor,
      subtotal: precoInversor * qtdeInversores,
    },
  ];

  const valorTotal = itens.reduce((acc, i) => acc + i.subtotal, 0);

  const snapshot: ProposalSnapshot = {
    cliente: { nome: cliente.nome, documento: cliente.documento, cidade: cliente.cidade, uf: cliente.uf },
    dimensionamento: {
      consumo_alvo: dim.consumo_alvo,
      geracao_estimada: dim.geracao_estimada,
      qtde_modulos: dim.qtde_modulos,
      tipo_ligacao: dim.tipo_ligacao,
    },
    itens,
    valor_total: valorTotal,
    gerado_em: new Date().toISOString(),
  };

  const { data: proposta, error: errInsert } = await supabase
    .from("propostas")
    .insert({
      vendedor_id: authData.user.id,
      cliente_id: dim.cliente_id,
      dimensionamento_id: dim.id,
      snapshot,
      valor_total: valorTotal,
      status: "gerada",
    })
    .select("id, numero")
    .single();

  if (errInsert || !proposta) return { error: errInsert?.message ?? "Falha ao criar proposta." };

  revalidatePath("/admin/propostas");
  return { success: true, id: proposta.id, numero: proposta.numero };
}

export async function listarPropostas() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("propostas")
    .select("id, numero, status, valor_total, criado_em, clientes(nome)")
    .order("criado_em", { ascending: false });

  return { ok: !error, data: (data as any[]) || [], error: error?.message };
}

const STATUS_VALIDOS = ["gerada", "enviada", "aceita", "recusada", "expirada"];

export async function atualizarStatusProposta(id: string, status: string) {
  if (!STATUS_VALIDOS.includes(status)) return { error: "Status inválido." };
  const supabase = await createClient();
  const { error } = await supabase.from("propostas").update({ status }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/propostas");
  return { success: true };
}

export async function buscarPropostaParaPdf(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("propostas").select("numero, snapshot, criado_em").eq("id", id).single();
  if (error || !data) return null;
  return data as { numero: number; snapshot: ProposalSnapshot; criado_em: string };
}
