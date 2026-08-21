"use server";

import { createClient } from "@/utils/supabase/server";

interface CatalogoItem {
  id: string;
  sku: string;
  fabricante: string;
  modelo: string;
  potencia_w: number;
  num_fases?: number;
}

export type TipoLigacao = "monofasico" | "bifasico" | "trifasico";

export interface DimensionarInput {
  cliente_id?: string;
  consumo_kwh_mes: number;
  hsp: number;
  perdas_pct: number;
  compensacao_pct: number;
  crescimento_pct: number;
  modulo_id?: string;
  inversor_id?: string;
  tipo_ligacao?: TipoLigacao;
}

export interface Combinacao {
  modulo: CatalogoItem;
  inversor: CatalogoItem;
  qtde_modulos: number;
  qtde_inversores: number;
  potencia_instalada_kwp: number;
  dcac_real: number;
  score: number;
}

export interface DimensionamentoResultado {
  potencia_necessaria_kwp: number;
  consumo_projeto_kwh: number;
  geracao_mensal_kwh: number;
  area_estimada_m2: number;
  sugestao: Combinacao;
  alternativas: Combinacao[];
  avisos: string[];
}

type DimensionarResult =
  | { ok: true; data: DimensionamentoResultado; dimensionamento_id: string | null }
  | { ok: false; erros: string[] };

// Relação DC/AC fora desta faixa não é considerada uma combinação válida
const DCAC_MIN_ACEITAVEL = 0.5;
const DCAC_MAX_ACEITAVEL = 1.5;
const DCAC_IDEAL = 1.2;

function extrairAtributos(atributos: unknown): Record<string, any> {
  return (atributos as Record<string, any>) || {};
}

function melhorQtdeInversores(potenciaInstaladaKwp: number, potenciaInversorW: number) {
  let melhorQtd = 1;
  let melhorDiferenca = Infinity;

  for (let i = 1; i <= 20; i++) {
    const potAcTemp = (i * potenciaInversorW) / 1000;
    if (potAcTemp > potenciaInstaladaKwp * 2 && i > 1) break;

    const dcacTemp = potenciaInstaladaKwp / potAcTemp;
    let diferenca = Math.abs(dcacTemp - DCAC_IDEAL);
    if (dcacTemp > DCAC_MAX_ACEITAVEL) diferenca += 10;
    if (dcacTemp < DCAC_MIN_ACEITAVEL) diferenca += 10;

    if (diferenca < melhorDiferenca) {
      melhorDiferenca = diferenca;
      melhorQtd = i;
    }
  }

  return melhorQtd;
}

export async function calcularDimensionamento(
  input: DimensionarInput
): Promise<DimensionarResult> {
  const erros: string[] = [];

  if (
    [input.consumo_kwh_mes, input.hsp, input.perdas_pct, input.compensacao_pct, input.crescimento_pct].some(
      (v) => typeof v !== "number" || Number.isNaN(v)
    )
  ) {
    erros.push("Preencha todos os campos numéricos com valores válidos.");
  }
  if (input.hsp <= 0) erros.push("HSP deve ser maior que zero.");
  if (input.consumo_kwh_mes <= 0) erros.push("Consumo deve ser maior que zero.");
  if (input.perdas_pct >= 100 || input.perdas_pct < 0) erros.push("Perdas globais devem estar entre 0% e 99%.");

  if (erros.length > 0) return { ok: false, erros };

  const supabase = await createClient();

  const { data: produtos, error: errProdutos } = await supabase
    .from("produtos")
    .select("id, sku, categoria, atributos, fabricantes(nome)")
    .in("categoria", ["modulo", "inversor"]);

  if (errProdutos) {
    return { ok: false, erros: ["Não foi possível consultar o catálogo de produtos."] };
  }

  const nomeFabricante = (p: any) => p.fabricantes?.nome ?? "—";

  const todosModulos: CatalogoItem[] = (produtos || [])
    .filter((p) => p.categoria === "modulo")
    .map((p) => {
      const a = extrairAtributos(p.atributos);
      return { id: p.id, sku: p.sku, fabricante: nomeFabricante(p), modelo: a.modelo ?? "—", potencia_w: Number(a.potencia_w) || 0 };
    })
    .filter((m) => m.potencia_w > 0);

  const todosInversores: CatalogoItem[] = (produtos || [])
    .filter((p) => p.categoria === "inversor")
    .map((p) => {
      const a = extrairAtributos(p.atributos);
      return {
        id: p.id,
        sku: p.sku,
        fabricante: nomeFabricante(p),
        modelo: a.modelo ?? "—",
        potencia_w: Number(a.potencia_w) || 0,
        num_fases: Number(a.num_fases) || undefined,
      };
    })
    .filter((i) => i.potencia_w > 0);

  if (todosModulos.length === 0 || todosInversores.length === 0) {
    return {
      ok: false,
      erros: ["Catálogo sem módulos e/ou inversores cadastrados com potência definida. Cadastre produtos antes de dimensionar."],
    };
  }

  const modulosCandidatos = input.modulo_id ? todosModulos.filter((m) => m.id === input.modulo_id) : todosModulos;
  const inversoresCandidatos = input.inversor_id ? todosInversores.filter((i) => i.id === input.inversor_id) : todosInversores;

  if (modulosCandidatos.length === 0 || inversoresCandidatos.length === 0) {
    return { ok: false, erros: ["Módulo ou inversor selecionado não foi encontrado no catálogo."] };
  }

  const consumoProjeto = input.consumo_kwh_mes * (input.compensacao_pct / 100) * (1 + input.crescimento_pct / 100);
  const eficiencia = 1 - input.perdas_pct / 100;
  const potenciaNecessariaKwp = consumoProjeto / (30 * input.hsp * eficiencia);

  const combinacoes: Combinacao[] = [];

  for (const modulo of modulosCandidatos) {
    const qtdeModulos = Math.ceil((potenciaNecessariaKwp * 1000) / modulo.potencia_w);
    const potenciaInstaladaKwp = (qtdeModulos * modulo.potencia_w) / 1000;

    for (const inversor of inversoresCandidatos) {
      // Hard Stop real: inversor trifásico não pode ser instalado em ligação
      // mono/bifásica — incompatibilidade física, não recomendação técnica.
      if (input.tipo_ligacao && input.tipo_ligacao !== "trifasico" && inversor.num_fases === 3) {
        continue;
      }

      const qtdeInversores = melhorQtdeInversores(potenciaInstaladaKwp, inversor.potencia_w);
      const potAcTotalKwp = (qtdeInversores * inversor.potencia_w) / 1000;
      const dcacReal = potenciaInstaladaKwp / potAcTotalKwp;

      if (dcacReal < DCAC_MIN_ACEITAVEL || dcacReal > DCAC_MAX_ACEITAVEL) continue;

      combinacoes.push({
        modulo,
        inversor,
        qtde_modulos: qtdeModulos,
        qtde_inversores: qtdeInversores,
        potencia_instalada_kwp: potenciaInstaladaKwp,
        dcac_real: dcacReal,
        // penaliza inversor monofásico acima de 5 kWp: mesmo sem ser um Hard Stop,
        // a sugestão automática deve preferir trifásico nesse caso, não só empatar por DC/AC
        score:
          Math.abs(dcacReal - DCAC_IDEAL) +
          (potenciaInstaladaKwp > 5 && inversor.num_fases === 1 ? 0.5 : 0),
      });
    }
  }

  if (combinacoes.length === 0) {
    if (input.tipo_ligacao && input.tipo_ligacao !== "trifasico") {
      return {
        ok: false,
        erros: [
          `Nenhum inversor do catálogo é compatível com ligação ${input.tipo_ligacao}. Inversores trifásicos não podem ser instalados nesse tipo de ligação — cadastre um inversor monofásico/bifásico ou revise a ligação informada.`,
        ],
      };
    }
    return {
      ok: false,
      erros: [
        "Nenhuma combinação de módulo e inversor do catálogo resulta em uma relação DC/AC utilizável (entre 0.5 e 1.5). Revise o catálogo ou os parâmetros de entrada.",
      ],
    };
  }

  combinacoes.sort((a, b) => a.score - b.score);
  const sugestao = combinacoes[0];
  const alternativas = combinacoes.slice(1, 4);

  const geracaoMensalKwh = sugestao.potencia_instalada_kwp * input.hsp * 30 * eficiencia;
  const areaEstimadaM2 = sugestao.potencia_instalada_kwp * (2.7 / 0.55) * 1.15;

  const avisos: string[] = [];
  if (sugestao.dcac_real > 1.3) {
    avisos.push(
      `Atenção (Clipping): relação DC/AC de ${sugestao.dcac_real.toFixed(2)} indica perda de geração em dias de sol pleno.`
    );
  } else if (sugestao.dcac_real < 0.7) {
    avisos.push(`Inversor subutilizado: relação DC/AC de ${sugestao.dcac_real.toFixed(2)} indica superdimensionamento do inversor.`);
  }
  if (sugestao.potencia_instalada_kwp > 5 && sugestao.inversor.num_fases === 1) {
    avisos.push("Atenção à Fase: para sistemas acima de 5 kWp em baixa tensão, recomenda-se inversor trifásico para evitar desbalanceamento na rede da distribuidora.");
  }
  if (sugestao.potencia_instalada_kwp > 75) {
    avisos.push("Sistemas acima de 75 kWp geralmente requerem conexão em Média Tensão (Grupo A) e estudo de acesso junto à distribuidora.");
  }

  let dimensionamentoId: string | null = null;

  if (input.cliente_id) {
    const { data: inserted, error: errInsert } = await supabase
      .from("dimensionamentos")
      .insert({
        cliente_id: input.cliente_id,
        consumo_alvo: input.consumo_kwh_mes,
        geracao_estimada: geracaoMensalKwh,
        modulo_id: sugestao.modulo.id,
        inversor_id: sugestao.inversor.id,
        qtde_modulos: sugestao.qtde_modulos,
        qtde_inversores: sugestao.qtde_inversores,
        tipo_ligacao: input.tipo_ligacao ?? null,
      })
      .select("id")
      .single();

    if (!errInsert && inserted) {
      dimensionamentoId = inserted.id;
    }
  }

  return {
    ok: true,
    dimensionamento_id: dimensionamentoId,
    data: {
      potencia_necessaria_kwp: potenciaNecessariaKwp,
      consumo_projeto_kwh: consumoProjeto,
      geracao_mensal_kwh: geracaoMensalKwh,
      area_estimada_m2: areaEstimadaM2,
      sugestao,
      alternativas,
      avisos,
    },
  };
}

export async function listarCatalogoParaDimensionamento() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("produtos")
    .select("id, sku, categoria, atributos, fabricantes(nome)")
    .in("categoria", ["modulo", "inversor"])
    .order("categoria", { ascending: true });

  if (error) return { ok: false as const, error: error.message, modulos: [], inversores: [] };

  const comFabricante = (p: any) => ({ id: p.id, sku: p.sku, fabricante: p.fabricantes?.nome ?? "—", ...extrairAtributos(p.atributos) });
  const modulos = (data || []).filter((p) => p.categoria === "modulo").map(comFabricante);
  const inversores = (data || []).filter((p) => p.categoria === "inversor").map(comFabricante);

  return { ok: true as const, modulos, inversores };
}
