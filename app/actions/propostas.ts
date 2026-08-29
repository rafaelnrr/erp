"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import type { Json } from "@/types/supabase";

export interface SnapshotItem {
  categoria: string;
  descricao: string;
  unidade: string;
  quantidade: number;
  preco_unitario: number;
  subtotal: number;
}

export interface SnapshotServico {
  nome: string;
  recorrencia: "unico" | "mensal" | "anual";
  preco: number;
}

export interface ProposalSnapshot {
  titulo: string | null;
  cliente: {
    nome: string;
    documento: string | null;
    cidade: string | null;
    uf: string | null;
    grupo_tarifario: string | null;
    classe_b: string | null;
    subgrupo_a: string | null;
  };
  dimensionamento: {
    consumo_alvo: number;
    geracao_estimada: number;
    qtde_modulos: number;
    potencia_instalada_kwp: number | null;
    tipo_ligacao: string | null;
    hsp: number | null;
    perdas_pct: number | null;
    area_estimada_m2: number | null;
    modulo_potencia_w: number | null;
    modulo_fabricante: string | null;
    inversor_potencia_w: number | null;
    inversor_fabricante: string | null;
    qtde_inversores: number | null;
    estrutura_fabricante: string | null;
  } | null;
  itens: SnapshotItem[];
  servicos: SnapshotServico[];
  valor_itens: number;
  valor_servicos_unicos: number;
  valor_total: number;
  desconto_avista_pct: number;
  valor_avista: number;
  condicoes_pagamento: string | null;
  forma_pagamento: string | null;
  parcelas: number | null;
  validade_dias: number;
  prazo_instalacao_dias: number | null;
  economia_estimada_ano1: number | null;
  economia_mensal: number | null;
  economia_total_30_anos: number | null;
  payback_meses: number | null;
  nome_vendedor: string | null;
  gerado_em: string;
}

async function precoDoProduto(supabase: any, produtoId: string): Promise<number> {
  const { data } = await supabase.from("estoque_preco").select("preco").eq("produto_id", produtoId).order("preco", { ascending: true }).limit(1);
  return data && data[0] ? Number(data[0].preco) : 0;
}

async function montarItensDoDimensionamento(supabase: any, dim: any, propostaId: string) {
  const { data: modulo } = await supabase.from("produtos").select("id, atributos, fabricantes(nome)").eq("id", dim.modulo_id).single();
  const { data: inversor } = await supabase.from("produtos").select("id, atributos, fabricantes(nome)").eq("id", dim.inversor_id).single();

  const itens = [];
  if (modulo) {
    const preco = await precoDoProduto(supabase, modulo.id);
    itens.push({
      proposta_id: propostaId,
      produto_id: modulo.id,
      categoria: "modulo",
      descricao: `${(modulo as any).fabricantes?.nome ?? ""} ${(modulo.atributos as any)?.modelo ?? ""}`.trim(),
      quantidade: dim.qtde_modulos,
      preco_unitario: preco,
      ordem: 0,
    });
  }
  if (inversor) {
    const preco = await precoDoProduto(supabase, inversor.id);
    itens.push({
      proposta_id: propostaId,
      produto_id: inversor.id,
      categoria: "inversor",
      descricao: `${(inversor as any).fabricantes?.nome ?? ""} ${(inversor.atributos as any)?.modelo ?? ""}`.trim(),
      quantidade: dim.qtde_inversores ?? 1,
      preco_unitario: preco,
      ordem: 1,
    });
  }
  return itens;
}

/** Cria a proposta em rascunho e importa os itens do dimensionamento para o Construtor. */
export async function criarPropostaRascunho(dimensionamentoId: string) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return { error: "Não autorizado" };

  const { data: dim, error: errDim } = await supabase
    .from("dimensionamentos")
    .select("id, cliente_id, modulo_id, inversor_id, qtde_modulos, qtde_inversores")
    .eq("id", dimensionamentoId)
    .single();

  if (errDim || !dim) return { error: "Dimensionamento não encontrado." };

  const { data: proposta, error: errInsert } = await supabase
    .from("propostas")
    .insert({ vendedor_id: authData.user.id, cliente_id: dim.cliente_id, dimensionamento_id: dim.id, status: "rascunho" })
    .select("id")
    .single();

  if (errInsert || !proposta) return { error: errInsert?.message ?? "Falha ao criar proposta." };

  const itensParaInserir = await montarItensDoDimensionamento(supabase, dim, proposta.id);
  if (itensParaInserir.length > 0) {
    await supabase.from("proposta_itens").insert(itensParaInserir);
  }

  return { success: true, id: proposta.id };
}

/** Cria uma proposta vazia a partir do fluxo "Nova Proposta" (cliente + título), sem dimensionamento ainda. */
export async function criarPropostaVazia(clienteId: string, titulo?: string) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return { error: "Não autorizado" };

  const { data: proposta, error } = await supabase
    .from("propostas")
    .insert({ vendedor_id: authData.user.id, cliente_id: clienteId, titulo: titulo || null, status: "rascunho" })
    .select("id")
    .single();

  if (error || !proposta) return { error: error?.message ?? "Falha ao criar proposta." };
  return { success: true as const, id: proposta.id };
}

/**
 * Usado pelo botão "Dimensionar Sistema" dentro do Construtor: pega o resultado
 * de um dimensionamento já salvo e adiciona módulo+inversor como itens na
 * proposta que já está aberta, sem criar uma proposta nova.
 */
export async function adicionarItensDoDimensionamento(propostaId: string, dimensionamentoId: string) {
  const supabase = await createClient();

  const { data: dim, error: errDim } = await supabase
    .from("dimensionamentos")
    .select("id, modulo_id, inversor_id, qtde_modulos, qtde_inversores")
    .eq("id", dimensionamentoId)
    .single();
  if (errDim || !dim) return { error: "Dimensionamento não encontrado." };

  const itens = await montarItensDoDimensionamento(supabase, dim, propostaId);
  if (itens.length === 0) return { error: "Não foi possível montar os itens do dimensionamento." };

  const { data: inseridos, error: errInsert } = await supabase.from("proposta_itens").insert(itens).select("*");
  if (errInsert) return { error: errInsert.message };

  // vincula a proposta a este dimensionamento (usado depois pra calcular
  // potência instalada e economia/payback na finalização)
  await supabase.from("propostas").update({ dimensionamento_id: dimensionamentoId }).eq("id", propostaId).is("dimensionamento_id", null);

  return { success: true as const, itens: inseridos };
}

export async function listarPropostaCompleta(propostaId: string) {
  const supabase = await createClient();

  const { data: proposta, error } = await supabase
    .from("propostas")
    .select("*, clientes(nome, documento, cidade, uf, consumo_kwh_mes, grupo_tarifario, classe_b, subgrupo_a, tarifa_kwh, tarifa_kwh_fora_ponta), dimensionamentos(consumo_alvo, geracao_estimada, qtde_modulos, qtde_inversores, tipo_ligacao, hsp, perdas_pct, area_estimada_m2)")
    .eq("id", propostaId)
    .single();

  if (error || !proposta) return null;

  const { data: itens } = await supabase.from("proposta_itens").select("*").eq("proposta_id", propostaId).order("ordem");
  const { data: servicos } = await supabase.from("proposta_servicos").select("*").eq("proposta_id", propostaId).order("ordem");

  return { proposta, itens: itens || [], servicos: servicos || [] };
}

export async function adicionarItemProposta(propostaId: string, item: { produto_id?: string; categoria: string; descricao: string; quantidade: number; preco_unitario: number }) {
  const supabase = await createClient();
  const { error } = await supabase.from("proposta_itens").insert({ proposta_id: propostaId, ...item });
  if (error) return { error: error.message };
  revalidatePath(`/admin/propostas/${propostaId}/construtor`);
  return { success: true };
}

export async function atualizarItemProposta(itemId: string, campos: { quantidade?: number; preco_unitario?: number }) {
  const supabase = await createClient();
  const { error } = await supabase.from("proposta_itens").update(campos).eq("id", itemId);
  if (error) return { error: error.message };
  return { success: true };
}

export async function removerItemProposta(itemId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("proposta_itens").delete().eq("id", itemId);
  if (error) return { error: error.message };
  return { success: true };
}

export async function adicionarServicoProposta(propostaId: string, servico: { servico_id?: string; nome: string; recorrencia: "unico" | "mensal" | "anual"; preco: number }) {
  const supabase = await createClient();
  const { error } = await supabase.from("proposta_servicos").insert({ proposta_id: propostaId, ...servico });
  if (error) return { error: error.message };
  return { success: true };
}

export async function removerServicoProposta(servicoPropostaId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("proposta_servicos").delete().eq("id", servicoPropostaId);
  if (error) return { error: error.message };
  return { success: true };
}

export async function atualizarCondicoesProposta(
  propostaId: string,
  campos: {
    condicoes_pagamento?: string;
    forma_pagamento?: string;
    parcelas?: number | null;
    validade_dias?: number;
    prazo_instalacao_dias?: number;
    desconto_avista_pct?: number;
  }
) {
  const supabase = await createClient();
  const { error } = await supabase.from("propostas").update(campos).eq("id", propostaId);
  if (error) return { error: error.message };
  return { success: true };
}

function calcularEconomiaEPayback(cliente: any, geracaoMensalKwh: number | undefined, valorTotal: number) {
  if (!geracaoMensalKwh) return { economiaAno1: null, paybackMeses: null };

  const tarifa = cliente?.grupo_tarifario === "A" ? cliente?.tarifa_kwh_fora_ponta : cliente?.tarifa_kwh;
  if (!tarifa) return { economiaAno1: null, paybackMeses: null };

  const economiaMensal = geracaoMensalKwh * Number(tarifa);
  const economiaAno1 = economiaMensal * 12;
  const paybackMeses = economiaMensal > 0 ? valorTotal / economiaMensal : null;

  return { economiaAno1, paybackMeses };
}

/** Congela o rascunho num snapshot imutável e muda o status para "gerada". */
export async function finalizarProposta(propostaId: string) {
  const supabase = await createClient();

  const completa = await listarPropostaCompleta(propostaId);
  if (!completa) return { error: "Proposta não encontrada." };
  const { proposta, itens, servicos } = completa;

  if (itens.length === 0) return { error: "Adicione ao menos um item antes de finalizar a proposta." };

  const cliente = (proposta as any).clientes;
  const dimensionamento = (proposta as any).dimensionamentos;

  const itemModulo = itens.find((i) => i.categoria === "modulo" && i.produto_id);
  const itemInversor = itens.find((i) => i.categoria === "inversor" && i.produto_id);
  const itemEstrutura = itens.find((i) => i.categoria === "estrutura" && i.produto_id);
  const idsProdutosTecnicos = [itemModulo?.produto_id, itemInversor?.produto_id, itemEstrutura?.produto_id].filter(
    (id): id is string => !!id
  );

  const { data: produtosTecnicos } = idsProdutosTecnicos.length
    ? await supabase.from("produtos").select("id, atributos, fabricantes(nome)").in("id", idsProdutosTecnicos)
    : { data: [] as any[] };

  const produtoPorId = new Map((produtosTecnicos ?? []).map((p: any) => [p.id, p]));
  const produtoModulo = itemModulo?.produto_id ? produtoPorId.get(itemModulo.produto_id) : null;
  const produtoInversor = itemInversor?.produto_id ? produtoPorId.get(itemInversor.produto_id) : null;
  const produtoEstrutura = itemEstrutura?.produto_id ? produtoPorId.get(itemEstrutura.produto_id) : null;

  const moduloPotenciaW = Number(produtoModulo?.atributos?.potencia_w) || 0;
  let potenciaInstaladaKwp: number | null = null;
  if (itemModulo && moduloPotenciaW > 0) {
    potenciaInstaladaKwp = (moduloPotenciaW * Number(itemModulo.quantidade)) / 1000;
  }

  const UNIDADE_POR_CATEGORIA: Record<string, string> = { cabo: "m" };

  const snapshotItens: SnapshotItem[] = itens.map((i) => ({
    categoria: i.categoria,
    descricao: i.descricao,
    unidade: UNIDADE_POR_CATEGORIA[i.categoria] ?? "un",
    quantidade: Number(i.quantidade),
    preco_unitario: Number(i.preco_unitario),
    subtotal: Number(i.quantidade) * Number(i.preco_unitario),
  }));
  const snapshotServicos: SnapshotServico[] = servicos.map((s) => ({ nome: s.nome, recorrencia: s.recorrencia as any, preco: Number(s.preco) }));

  const valorItens = snapshotItens.reduce((acc, i) => acc + i.subtotal, 0);
  const valorServicosUnicos = snapshotServicos.filter((s) => s.recorrencia === "unico").reduce((acc, s) => acc + s.preco, 0);
  const valorTotal = valorItens + valorServicosUnicos;

  const { economiaAno1, paybackMeses } = calcularEconomiaEPayback(cliente, dimensionamento?.geracao_estimada, valorTotal);

  const descontoAvistaPct = Number(proposta.desconto_avista_pct ?? 0);
  const valorAvista = valorTotal * (1 - descontoAvistaPct / 100);

  const economiaMensal = economiaAno1 ? economiaAno1 / 12 : null;
  // projeção de 30 anos com reajuste anual de 4% sobre a economia (série geométrica)
  const economiaTotal30Anos = economiaAno1 ? economiaAno1 * ((Math.pow(1.04, 30) - 1) / 0.04) : null;

  const { data: perfilVendedor } = proposta.vendedor_id
    ? await supabase.from("perfis").select("nome").eq("id", proposta.vendedor_id).single()
    : { data: null };

  const snapshot: ProposalSnapshot = {
    titulo: proposta.titulo ?? null,
    cliente: {
      nome: cliente?.nome ?? "—",
      documento: cliente?.documento ?? null,
      cidade: cliente?.cidade ?? null,
      uf: cliente?.uf ?? null,
      grupo_tarifario: cliente?.grupo_tarifario ?? null,
      classe_b: cliente?.classe_b ?? null,
      subgrupo_a: cliente?.subgrupo_a ?? null,
    },
    dimensionamento: dimensionamento
      ? {
          consumo_alvo: dimensionamento.consumo_alvo,
          geracao_estimada: dimensionamento.geracao_estimada,
          qtde_modulos: dimensionamento.qtde_modulos,
          potencia_instalada_kwp: potenciaInstaladaKwp,
          tipo_ligacao: dimensionamento.tipo_ligacao,
          hsp: dimensionamento.hsp ?? null,
          perdas_pct: dimensionamento.perdas_pct ?? null,
          area_estimada_m2: dimensionamento.area_estimada_m2 ?? null,
          modulo_potencia_w: moduloPotenciaW || null,
          modulo_fabricante: produtoModulo?.fabricantes?.nome ?? null,
          inversor_potencia_w: Number(produtoInversor?.atributos?.potencia_w) || null,
          inversor_fabricante: produtoInversor?.fabricantes?.nome ?? null,
          qtde_inversores: itemInversor ? Number(itemInversor.quantidade) : dimensionamento.qtde_inversores ?? null,
          estrutura_fabricante: produtoEstrutura?.fabricantes?.nome ?? null,
        }
      : null,
    itens: snapshotItens,
    servicos: snapshotServicos,
    valor_itens: valorItens,
    valor_servicos_unicos: valorServicosUnicos,
    valor_total: valorTotal,
    desconto_avista_pct: descontoAvistaPct,
    valor_avista: valorAvista,
    condicoes_pagamento: proposta.condicoes_pagamento,
    forma_pagamento: proposta.forma_pagamento,
    parcelas: proposta.parcelas,
    validade_dias: proposta.validade_dias,
    prazo_instalacao_dias: proposta.prazo_instalacao_dias,
    economia_estimada_ano1: economiaAno1,
    economia_mensal: economiaMensal,
    economia_total_30_anos: economiaTotal30Anos,
    payback_meses: paybackMeses,
    nome_vendedor: perfilVendedor?.nome ?? null,
    gerado_em: new Date().toISOString(),
  };

  const { error: errUpdate } = await supabase
    .from("propostas")
    .update({
      snapshot: snapshot as unknown as Json,
      status: "gerada",
      valor_total: valorTotal,
      economia_estimada_ano1: economiaAno1,
      payback_meses: paybackMeses,
      finalizada_em: new Date().toISOString(),
    })
    .eq("id", propostaId);

  if (errUpdate) return { error: errUpdate.message };

  revalidatePath("/admin/propostas");
  return { success: true };
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

/** Duplica uma proposta (itens e serviços) como um novo rascunho, sem snapshot/valor congelados. */
export async function duplicarProposta(propostaId: string) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return { error: "Não autorizado" };

  const completa = await listarPropostaCompleta(propostaId);
  if (!completa) return { error: "Proposta não encontrada." };
  const { proposta, itens, servicos } = completa;

  const { data: nova, error: errInsert } = await supabase
    .from("propostas")
    .insert({
      vendedor_id: authData.user.id,
      cliente_id: proposta.cliente_id,
      dimensionamento_id: proposta.dimensionamento_id,
      titulo: proposta.titulo ? `${proposta.titulo} (cópia)` : null,
      status: "rascunho",
      condicoes_pagamento: proposta.condicoes_pagamento,
      forma_pagamento: proposta.forma_pagamento,
      parcelas: proposta.parcelas,
      validade_dias: proposta.validade_dias,
      prazo_instalacao_dias: proposta.prazo_instalacao_dias,
      desconto_avista_pct: proposta.desconto_avista_pct,
    })
    .select("id")
    .single();

  if (errInsert || !nova) return { error: errInsert?.message ?? "Falha ao duplicar proposta." };

  if (itens.length > 0) {
    await supabase.from("proposta_itens").insert(
      itens.map((i) => ({
        proposta_id: nova.id,
        produto_id: i.produto_id,
        categoria: i.categoria,
        descricao: i.descricao,
        quantidade: i.quantidade,
        preco_unitario: i.preco_unitario,
        ordem: i.ordem,
      }))
    );
  }

  if (servicos.length > 0) {
    await supabase.from("proposta_servicos").insert(
      servicos.map((s) => ({
        proposta_id: nova.id,
        servico_id: s.servico_id,
        nome: s.nome,
        recorrencia: s.recorrencia,
        preco: s.preco,
        ordem: s.ordem,
      }))
    );
  }

  revalidatePath("/admin/propostas");
  return { success: true as const, id: nova.id };
}

/** Exclui uma proposta em rascunho (a policy de RLS bloqueia qualquer outro status ou usuário sem permissão). */
export async function excluirProposta(propostaId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("propostas").delete().eq("id", propostaId).select("id");

  if (error) return { error: error.message };
  if (!data || data.length === 0) {
    return { error: "Não foi possível excluir: a proposta precisa estar em rascunho e você precisa ter permissão." };
  }

  revalidatePath("/admin/propostas");
  return { success: true as const };
}

export async function buscarPropostaParaPdf(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("propostas").select("numero, snapshot, criado_em").eq("id", id).single();
  if (error || !data || !data.snapshot) return null;
  return { ...data, snapshot: data.snapshot as unknown as ProposalSnapshot };
}
