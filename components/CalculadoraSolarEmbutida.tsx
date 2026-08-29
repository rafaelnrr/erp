"use client";

import { useState } from "react";
import {
  calcularDimensionamento,
  type DimensionamentoResultado,
} from "@/app/actions/dimensionar";
import { adicionarItensDoDimensionamento } from "@/app/actions/propostas";
import { CamposEntrada, type ValoresDimensionamento } from "@/components/dimensionamento/CamposEntrada";
import { ErrosBloqueantes, AvisosTecnicos } from "@/components/dimensionamento/AvisosErros";

interface CalculadoraSolarEmbutidaProps {
  propostaId: string;
  clienteId: string;
  consumoInicial?: number | null;
  onFechar: () => void;
  onConcluir: (itensNovos: any[]) => void;
}

export function CalculadoraSolarEmbutida({ propostaId, clienteId, consumoInicial, onFechar, onConcluir }: CalculadoraSolarEmbutidaProps) {
  const [valores, setValores] = useState<ValoresDimensionamento>({
    consumo: consumoInicial ?? 1600,
    hsp: 5.2,
    perdas: 20,
    compensacao: 100,
    crescimento: 0,
    tipoLigacao: "monofasico",
  });

  const [loading, setLoading] = useState(false);
  const [erros, setErros] = useState<string[]>([]);
  const [resultado, setResultado] = useState<DimensionamentoResultado | null>(null);
  const [dimensionamentoId, setDimensionamentoId] = useState<string | null>(null);
  const [concluindo, setConcluindo] = useState(false);

  const fmt = (n: number, dec = 2) => Number(n).toLocaleString("pt-BR", { minimumFractionDigits: dec, maximumFractionDigits: dec });

  async function handleCalcular() {
    setLoading(true);
    setDimensionamentoId(null);
    const res = await calcularDimensionamento({
      cliente_id: clienteId,
      consumo_kwh_mes: valores.consumo,
      hsp: valores.hsp,
      perdas_pct: valores.perdas,
      compensacao_pct: valores.compensacao,
      crescimento_pct: valores.crescimento,
      tipo_ligacao: valores.tipoLigacao,
    });
    setLoading(false);

    if (!res.ok) {
      setErros(res.erros);
      setResultado(null);
      return;
    }
    setErros([]);
    setResultado(res.data);
    setDimensionamentoId(res.dimensionamento_id);
  }

  async function handleConcluir() {
    if (!dimensionamentoId) return;
    setConcluindo(true);
    const res = await adicionarItensDoDimensionamento(propostaId, dimensionamentoId);
    setConcluindo(false);
    if (res.success) onConcluir(res.itens);
  }

  return (
    <div className="min-h-full bg-[#0f172a] text-[#f8fafc] p-6">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .calc-embutida input, .calc-embutida select {
          width: 100%; padding: 10px 12px; border-radius: 10px; border: 1px solid #334155;
          background: #0b1220; color: white; outline: none; font-size: 14px;
        }
        .calc-embutida input:focus, .calc-embutida select:focus { border-color: #22c55e; }
      `,
        }}
      />
      <div className="calc-embutida">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold">⚡ Dimensionar Sistema</h2>
          <button onClick={onFechar} className="text-[#94a3b8] hover:text-white">✕</button>
        </div>

        <div className="mb-4">
          <CamposEntrada valores={valores} onChange={(patch) => setValores((v) => ({ ...v, ...patch }))} />
        </div>

        <button
          onClick={handleCalcular}
          disabled={loading}
          className="w-full p-3 rounded-[11px] bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white font-bold text-[14px] disabled:opacity-60"
        >
          {loading ? "Calculando..." : "Calcular"}
        </button>

        {erros.length > 0 && (
          <div className="mt-4">
            <ErrosBloqueantes erros={erros} />
          </div>
        )}

        {resultado && (
          <div className="mt-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#052e16] border border-[#166534] rounded-xl p-3">
                <span className="block text-[#94a3b8] text-[11px] mb-1">Potência necessária</span>
                <strong className="text-[18px] text-[#86efac]">{fmt(resultado.potencia_necessaria_kwp)} kWp</strong>
              </div>
              <div className="bg-[#0b1220] border border-[#334155] rounded-xl p-3">
                <span className="block text-[#94a3b8] text-[11px] mb-1">DC/AC Real</span>
                <strong className="text-[18px]">{fmt(resultado.sugestao.dcac_real)}</strong>
              </div>
            </div>
            <div className="mt-3 p-3.5 rounded-xl bg-[#172033] text-[13px]">
              <p><b>{resultado.sugestao.qtde_modulos}x</b> {resultado.sugestao.modulo.fabricante} {resultado.sugestao.modulo.modelo}</p>
              <p className="mt-1"><b>{resultado.sugestao.qtde_inversores}x</b> {resultado.sugestao.inversor.fabricante} {resultado.sugestao.inversor.modelo}</p>
            </div>
            <div className="mt-2 flex flex-col gap-2">
              <AvisosTecnicos avisos={resultado.avisos} />
            </div>

            <button
              onClick={handleConcluir}
              disabled={concluindo}
              className="w-full mt-4 p-3 rounded-[11px] bg-white text-[#0f172a] font-bold text-[14px] disabled:opacity-60"
            >
              {concluindo ? "Adicionando..." : "Concluir e Adicionar à Proposta"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
