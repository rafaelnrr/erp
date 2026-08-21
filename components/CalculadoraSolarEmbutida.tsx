"use client";

import { useState } from "react";
import {
  calcularDimensionamento,
  type DimensionamentoResultado,
  type TipoLigacao,
} from "@/app/actions/dimensionar";
import { adicionarItensDoDimensionamento } from "@/app/actions/propostas";

interface CalculadoraSolarEmbutidaProps {
  propostaId: string;
  clienteId: string;
  consumoInicial?: number | null;
  onFechar: () => void;
  onConcluir: (itensNovos: any[]) => void;
}

export function CalculadoraSolarEmbutida({ propostaId, clienteId, consumoInicial, onFechar, onConcluir }: CalculadoraSolarEmbutidaProps) {
  const [consumo, setConsumo] = useState(consumoInicial ?? 1600);
  const [hsp, setHsp] = useState(5.2);
  const [perdas, setPerdas] = useState(20);
  const [compensacao, setCompensacao] = useState(100);
  const [crescimento, setCrescimento] = useState(0);
  const [tipoLigacao, setTipoLigacao] = useState<TipoLigacao>("monofasico");

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
      consumo_kwh_mes: consumo,
      hsp,
      perdas_pct: perdas,
      compensacao_pct: compensacao,
      crescimento_pct: crescimento,
      tipo_ligacao: tipoLigacao,
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

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-[12px] text-[#cbd5e1] mb-1.5">Consumo (kWh/mês)</label>
            <input type="number" value={consumo} onChange={(e) => setConsumo(Number(e.target.value))} />
          </div>
          <div>
            <label className="block text-[12px] text-[#cbd5e1] mb-1.5">HSP (h/dia)</label>
            <input type="number" step="0.1" value={hsp} onChange={(e) => setHsp(Number(e.target.value))} />
          </div>
          <div>
            <label className="block text-[12px] text-[#cbd5e1] mb-1.5">Perdas (%)</label>
            <input type="number" value={perdas} onChange={(e) => setPerdas(Number(e.target.value))} />
          </div>
          <div>
            <label className="block text-[12px] text-[#cbd5e1] mb-1.5">Compensação (%)</label>
            <input type="number" value={compensacao} onChange={(e) => setCompensacao(Number(e.target.value))} />
          </div>
          <div>
            <label className="block text-[12px] text-[#cbd5e1] mb-1.5">Crescimento (%)</label>
            <input type="number" value={crescimento} onChange={(e) => setCrescimento(Number(e.target.value))} />
          </div>
          <div>
            <label className="block text-[12px] text-[#cbd5e1] mb-1.5">Tipo de Ligação</label>
            <select value={tipoLigacao} onChange={(e) => setTipoLigacao(e.target.value as TipoLigacao)}>
              <option value="monofasico">Monofásico</option>
              <option value="bifasico">Bifásico</option>
              <option value="trifasico">Trifásico</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleCalcular}
          disabled={loading}
          className="w-full p-3 rounded-[11px] bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white font-bold text-[14px] disabled:opacity-60"
        >
          {loading ? "Calculando..." : "Calcular"}
        </button>

        {erros.length > 0 && (
          <div className="mt-4 flex flex-col gap-2">
            {erros.map((e, i) => (
              <div key={i} className="p-3 rounded-lg text-[13px] bg-[rgba(239,68,68,0.12)] border border-[#ef4444] text-[#fca5a5]">🛑 {e}</div>
            ))}
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
            {resultado.avisos.map((a, i) => (
              <div key={i} className="mt-2 p-2.5 rounded-lg text-[12px] bg-[rgba(245,158,11,0.1)] border border-[#f59e0b] text-[#fcd34d]">⚠️ {a}</div>
            ))}

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
