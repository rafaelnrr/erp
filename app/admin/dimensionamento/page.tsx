"use client";

import { useEffect, useState } from "react";
import { listarClientes } from "@/app/actions/clientes";
import {
  calcularDimensionamento,
  listarCatalogoParaDimensionamento,
  type DimensionamentoResultado,
  type TipoLigacao,
} from "@/app/actions/dimensionar";

interface Cliente {
  id: string;
  nome: string;
  consumo_kwh_mes: number | null;
}

interface CatalogoOpcao {
  id: string;
  sku: string;
  fabricante?: string;
  modelo?: string;
  potencia_w?: number;
}

export default function DimensionamentoPage() {
  const [consumo, setConsumo] = useState(1600);
  const [hsp, setHsp] = useState(5.2);
  const [perdas, setPerdas] = useState(20);
  const [compensacao, setCompensacao] = useState(100);
  const [crescimento, setCrescimento] = useState(0);

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [modulos, setModulos] = useState<CatalogoOpcao[]>([]);
  const [inversores, setInversores] = useState<CatalogoOpcao[]>([]);

  const [clienteId, setClienteId] = useState("");
  const [moduloId, setModuloId] = useState("");
  const [inversorId, setInversorId] = useState("");
  const [tipoLigacao, setTipoLigacao] = useState<TipoLigacao>("monofasico");

  const [loading, setLoading] = useState(false);
  const [erros, setErros] = useState<string[]>([]);
  const [resultado, setResultado] = useState<DimensionamentoResultado | null>(null);
  const [salvo, setSalvo] = useState(false);

  useEffect(() => {
    listarClientes().then((r) => setClientes((r.data as Cliente[]) || []));
    listarCatalogoParaDimensionamento().then((r) => {
      if (r.ok) {
        setModulos(r.modulos as CatalogoOpcao[]);
        setInversores(r.inversores as CatalogoOpcao[]);
      }
    });
  }, []);

  const fmt = (n: number, dec = 2) =>
    Number(n).toLocaleString("pt-BR", { minimumFractionDigits: dec, maximumFractionDigits: dec });

  async function handleCalcular() {
    setLoading(true);
    setSalvo(false);
    const res = await calcularDimensionamento({
      cliente_id: clienteId || undefined,
      consumo_kwh_mes: consumo,
      hsp,
      perdas_pct: perdas,
      compensacao_pct: compensacao,
      crescimento_pct: crescimento,
      modulo_id: moduloId || undefined,
      inversor_id: inversorId || undefined,
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
    setSalvo(!!res.dimensionamento_id);
  }

  function handleClienteChange(id: string) {
    setClienteId(id);
    const c = clientes.find((cl) => cl.id === id);
    if (c?.consumo_kwh_mes) setConsumo(c.consumo_kwh_mes);
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#0b1324] text-[#f8fafc] font-sans">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .calc-pro input, .calc-pro select {
          width: 100%; padding: 12px 13px; border-radius: 10px; border: 1px solid #334155;
          background: #0b1220; color: white; outline: none; font-size: 15px; transition: 0.2s border-color;
          appearance: none;
        }
        .calc-pro input:focus, .calc-pro select:focus { border-color: #22c55e; }
      `,
        }}
      />

      <div className="calc-pro max-w-[1180px] mx-auto p-7">
        <div className="flex flex-col md:flex-row justify-between gap-5 items-start md:items-end mb-6">
          <div>
            <h1 className="text-[clamp(28px,4vw,44px)] font-bold leading-tight m-0">Dimensionamento Inteligente</h1>
            <div className="text-[#94a3b8] mt-2.5 max-w-[720px]">
              Consulta o catálogo real de módulos e inversores e sugere a melhor combinação, com validação bloqueante (Hard Stop).
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="bg-[rgba(17,24,39,0.92)] border border-[#334155] rounded-[18px] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
            <h2 className="m-0 mb-4 text-[20px] font-semibold">Dados de Entrada</h2>

            <div className="mb-4">
              <label className="block text-[13px] text-[#cbd5e1] mb-2">Selecionar Cliente (opcional)</label>
              <select value={clienteId} onChange={(e) => handleClienteChange(e.target.value)}>
                <option value="">— Sem cliente vinculado —</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] text-[#cbd5e1] mb-2">Consumo médio (kWh/mês)</label>
                <input type="number" value={consumo} onChange={(e) => setConsumo(Number(e.target.value))} min="1" />
              </div>
              <div>
                <label className="block text-[13px] text-[#cbd5e1] mb-2">HSP média diária (h/dia)</label>
                <input type="number" value={hsp} onChange={(e) => setHsp(Number(e.target.value))} min="0.1" step="0.1" />
              </div>
              <div>
                <label className="block text-[13px] text-[#cbd5e1] mb-2">Perdas globais (%)</label>
                <input type="number" value={perdas} onChange={(e) => setPerdas(Number(e.target.value))} min="0" max="90" />
              </div>
              <div>
                <label className="block text-[13px] text-[#cbd5e1] mb-2">Compensação (%)</label>
                <input type="number" value={compensacao} onChange={(e) => setCompensacao(Number(e.target.value))} min="1" max="150" />
              </div>
              <div>
                <label className="block text-[13px] text-[#cbd5e1] mb-2">Crescimento carga (%)</label>
                <input type="number" value={crescimento} onChange={(e) => setCrescimento(Number(e.target.value))} min="0" max="100" />
              </div>
              <div>
                <label className="block text-[13px] text-[#cbd5e1] mb-2">Tipo de Ligação</label>
                <select value={tipoLigacao} onChange={(e) => setTipoLigacao(e.target.value as TipoLigacao)}>
                  <option value="monofasico">Monofásico</option>
                  <option value="bifasico">Bifásico</option>
                  <option value="trifasico">Trifásico</option>
                </select>
              </div>
              <div>
                <label className="block text-[13px] text-[#cbd5e1] mb-2">Módulo (do catálogo)</label>
                <select value={moduloId} onChange={(e) => setModuloId(e.target.value)}>
                  <option value="">Automático (motor escolhe)</option>
                  {modulos.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fabricante} {m.modelo} — {m.potencia_w}W
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[13px] text-[#cbd5e1] mb-2">Inversor (do catálogo)</label>
                <select value={inversorId} onChange={(e) => setInversorId(e.target.value)}>
                  <option value="">Automático (motor escolhe)</option>
                  {inversores.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.fabricante} {i.modelo} — {i.potencia_w}W
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleCalcular}
              disabled={loading}
              className="w-full border-0 mt-5 p-3.5 rounded-[11px] bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white font-bold cursor-pointer text-[15px] transition-transform hover:translate-y-[-1px] hover:brightness-110 disabled:opacity-60"
            >
              {loading ? "Calculando..." : "Dimensionamento Inteligente"}
            </button>
            {salvo && (
              <p className="mt-3 text-[13px] text-[#86efac]">Dimensionamento salvo para o cliente selecionado.</p>
            )}
          </section>

          <section className="bg-[rgba(17,24,39,0.92)] border border-[#334155] rounded-[18px] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
            <h2 className="m-0 mb-4 text-[20px] font-semibold">Resultado do Dimensionamento</h2>

            {erros.length > 0 && (
              <div className="flex flex-col gap-2">
                {erros.map((e, i) => (
                  <div key={i} className="p-3 rounded-lg text-[13px] bg-[rgba(239,68,68,0.12)] border border-[#ef4444] text-[#fca5a5]">
                    🛑 {e}
                  </div>
                ))}
              </div>
            )}

            {!erros.length && !resultado && (
              <div className="mt-2 p-3.5 rounded-xl bg-[#172033] text-[#cbd5e1] text-[13px]">
                Preencha os dados e clique em "Dimensionamento Inteligente".
              </div>
            )}

            {resultado && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-[#052e16] border border-[#166534] rounded-xl p-4">
                    <span className="block text-[#94a3b8] text-[12px] mb-1.5">Potência necessária</span>
                    <strong className="text-[23px] text-[#86efac]">{fmt(resultado.potencia_necessaria_kwp)} kWp</strong>
                  </div>
                  <div className="bg-[#0b1220] border border-[#334155] rounded-xl p-4">
                    <span className="block text-[#94a3b8] text-[12px] mb-1.5">Potência instalada</span>
                    <strong className="text-[23px]">{fmt(resultado.sugestao.potencia_instalada_kwp)} kWp</strong>
                  </div>
                  <div className="bg-[#0b1220] border border-[#334155] rounded-xl p-4">
                    <span className="block text-[#94a3b8] text-[12px] mb-1.5">Qtd. de módulos</span>
                    <strong className="text-[23px]">{resultado.sugestao.qtde_modulos} un.</strong>
                    <span className="block text-[11px] text-[#64748b] mt-1">
                      {resultado.sugestao.modulo.fabricante} {resultado.sugestao.modulo.modelo}
                    </span>
                  </div>
                  <div className="bg-[#0b1220] border border-[#334155] rounded-xl p-4">
                    <span className="block text-[#94a3b8] text-[12px] mb-1.5">Área mínima</span>
                    <strong className="text-[23px]">{fmt(resultado.area_estimada_m2, 0)} m²</strong>
                  </div>
                  <div className="bg-[#0b1220] border border-[#334155] rounded-xl p-4">
                    <span className="block text-[#94a3b8] text-[12px] mb-1.5">Qtd. de inversores</span>
                    <strong className="text-[23px]">
                      {resultado.sugestao.qtde_inversores} × {resultado.sugestao.inversor.potencia_w}W
                    </strong>
                    <span className="block text-[11px] text-[#64748b] mt-1">
                      {resultado.sugestao.inversor.fabricante} {resultado.sugestao.inversor.modelo}
                    </span>
                  </div>
                  <div className="bg-[#0b1220] border border-[#334155] rounded-xl p-4">
                    <span className="block text-[#94a3b8] text-[12px] mb-1.5">DC/AC Real</span>
                    <strong className="text-[23px]">{fmt(resultado.sugestao.dcac_real)}</strong>
                  </div>
                </div>

                {resultado.avisos.length === 0 ? (
                  <div className="mt-4 p-3 rounded-lg text-[13px] bg-[rgba(34,197,94,0.1)] border border-[#22c55e] text-[#86efac]">
                    ✅ Dimensionamento adequado — nenhum alerta técnico.
                  </div>
                ) : (
                  <div className="mt-4 flex flex-col gap-2">
                    {resultado.avisos.map((a, i) => (
                      <div key={i} className="p-3 rounded-lg text-[13px] bg-[rgba(245,158,11,0.1)] border border-[#f59e0b] text-[#fcd34d]">
                        ⚠️ {a}
                      </div>
                    ))}
                  </div>
                )}

                {resultado.alternativas.length > 0 && (
                  <div className="mt-4 p-3.5 rounded-xl bg-[#172033] text-[#cbd5e1] text-[13px]">
                    <b>Alternativas viáveis:</b>
                    <ul className="mt-2 list-inside list-disc">
                      {resultado.alternativas.map((alt, i) => (
                        <li key={i}>
                          {alt.modulo.fabricante} {alt.modulo.modelo} + {alt.inversor.fabricante} {alt.inversor.modelo} — DC/AC{" "}
                          {fmt(alt.dcac_real)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </section>
        </div>

        <footer className="text-center text-[#64748b] text-[12px] mt-6">
          Calculadora para pré-dimensionamento de sistemas solares fotovoltaicos. Os valores são estimativas e não substituem projeto executivo.
        </footer>
      </div>
    </div>
  );
}
