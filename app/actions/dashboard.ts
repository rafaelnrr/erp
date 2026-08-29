"use server";

import { createClient } from "@/utils/supabase/server";
import type { ProposalSnapshot } from "./propostas";

const STATUS_FINALIZADOS = ["gerada", "enviada", "aceita", "recusada", "expirada"];
const STATUS_PIPELINE_ABERTO = ["enviada", "aceita"];

interface PropostaResumo {
  id: string;
  status: string | null;
  valor_total: number | null;
  criado_em: string | null;
  snapshot: ProposalSnapshot | null;
  clientes: { nome: string } | null;
}

function inicioDoMes(offsetMeses: number) {
  const agora = new Date();
  return new Date(Date.UTC(agora.getUTCFullYear(), agora.getUTCMonth() + offsetMeses, 1));
}

function variacaoPct(atual: number, anterior: number): number | null {
  if (anterior === 0) return atual === 0 ? null : 100;
  return ((atual - anterior) / anterior) * 100;
}

function potenciaKwp(p: PropostaResumo): number {
  return p.snapshot?.dimensionamento?.potencia_instalada_kwp ?? 0;
}

export async function obterDashboardStats() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("propostas")
    .select("id, status, valor_total, criado_em, snapshot, clientes(nome)")
    .order("criado_em", { ascending: false });

  const lista = ((data as any[]) || []) as PropostaResumo[];

  const inicioAtual = inicioDoMes(0);
  const inicioAnterior = inicioDoMes(-1);
  const inicioProximo = inicioDoMes(1);

  const noPeriodo = (p: PropostaResumo, inicio: Date, fim: Date) => {
    if (!p.criado_em) return false;
    const data = new Date(p.criado_em);
    return data >= inicio && data < fim;
  };

  const mesAtual = lista.filter((p) => noPeriodo(p, inicioAtual, inicioProximo));
  const mesAnterior = lista.filter((p) => noPeriodo(p, inicioAnterior, inicioAtual));

  const finalizadasNoGrupo = (grupo: PropostaResumo[]) => grupo.filter((p) => STATUS_FINALIZADOS.includes(p.status ?? ""));
  const aceitasNoGrupo = (grupo: PropostaResumo[]) => grupo.filter((p) => p.status === "aceita");

  const finalizadasAtual = finalizadasNoGrupo(mesAtual);
  const finalizadasAnterior = finalizadasNoGrupo(mesAnterior);

  const taxaConversaoAtual = finalizadasAtual.length ? (aceitasNoGrupo(mesAtual).length / finalizadasAtual.length) * 100 : 0;
  const taxaConversaoAnterior = finalizadasAnterior.length ? (aceitasNoGrupo(mesAnterior).length / finalizadasAnterior.length) * 100 : 0;

  const potenciaAtual = finalizadasAtual.reduce((acc, p) => acc + potenciaKwp(p), 0);
  const potenciaAnterior = finalizadasAnterior.reduce((acc, p) => acc + potenciaKwp(p), 0);

  const pipelineAberto = lista.filter((p) => STATUS_PIPELINE_ABERTO.includes(p.status ?? ""));
  const faturamentoPrevisto = pipelineAberto.reduce((acc, p) => acc + Number(p.valor_total ?? 0), 0);

  const kpis = {
    propostasGeradas: { valor: mesAtual.length, variacaoPct: variacaoPct(mesAtual.length, mesAnterior.length) },
    potenciaVendidaKwp: { valor: potenciaAtual, variacaoPct: variacaoPct(potenciaAtual, potenciaAnterior) },
    taxaConversaoPct: { valor: taxaConversaoAtual, variacaoPct: variacaoPct(taxaConversaoAtual, taxaConversaoAnterior) },
    faturamentoPrevisto: { valor: faturamentoPrevisto, propostasEmAberto: pipelineAberto.length },
  };

  const ultimasPropostas = lista.slice(0, 5).map((p) => ({
    id: p.id,
    cliente: p.clientes?.nome ?? "—",
    potenciaKwp: potenciaKwp(p) || null,
    valorTotal: p.valor_total,
    status: p.status ?? "rascunho",
  }));

  return { ok: !error, kpis, ultimasPropostas, error: error?.message };
}
