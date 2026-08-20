"use server";

import { createClient } from "@/utils/supabase/server";
import type { Database } from "@/types/supabase";

type Produto = Database["public"]["Tables"]["produtos"]["Row"];

interface DimensionamentoParams {
  consumo_kwh_mes: number;
  irradiacao_diaria: number; // Ex: 4.5
  rendimento_sistema: number; // Ex: 0.75 (75%)
}

export async function calcularDimensionamento(params: DimensionamentoParams) {
  const supabase = await createClient();

  // 1. Calcula a Potência DC (Wp) necessária
  // Wp = (Consumo Mensal / 30) / (Irradiação * Rendimento) * 1000
  const energiaDiaria = params.consumo_kwh_mes / 30;
  const wp_necessario = (energiaDiaria / (params.irradiacao_diaria * params.rendimento_sistema)) * 1000;

  // 2. Busca módulos ativos
  const { data: modulos, error: errModulos } = await supabase
    .from("produtos")
    .select("id, sku, atributos")
    .eq("categoria", "modulo");

  if (errModulos || !modulos || modulos.length === 0) {
    return { ok: false, error: "Nenhum módulo disponível no catálogo." };
  }

  // 3. Simulação (Hard Stop: Módulos incompatíveis não são sugeridos)
  const sugestoes = modulos.map((modulo) => {
    const attrs = (modulo.atributos as Record<string, any>) || {};
    const potencia_w = Number(attrs.potencia_w) || 0;

    if (potencia_w <= 0) return null;

    const qtde_modulos = Math.ceil(wp_necessario / potencia_w);
    const potencia_total_dc = qtde_modulos * potencia_w;

    return {
      modulo_id: modulo.id,
      sku: modulo.sku,
      qtde_modulos,
      potencia_total_dc,
    };
  }).filter(Boolean);

  return { ok: true, data: { wp_necessario, sugestoes } };
}
