"use client";

import { useState } from "react";

export default function DimensionamentoPage() {
  const [consumo, setConsumo] = useState(1600);
  const [hsp, setHsp] = useState(5.2);
  const [perdas, setPerdas] = useState(20);
  const [compensacao, setCompensacao] = useState(100);
  const [crescimento, setCrescimento] = useState(0);
  const [moduloWp, setModuloWp] = useState(550);
  const [invKW, setInvKW] = useState(5.0);
  const [dcacTarget, setDcacTarget] = useState(1.2);

  const fmt = (n: number, dec = 2) =>
    Number(n).toLocaleString("pt-BR", { minimumFractionDigits: dec, maximumFractionDigits: dec });

  const isValid =
    ![consumo, hsp, perdas, compensacao, crescimento, moduloWp, invKW, dcacTarget].some(isNaN) &&
    hsp > 0 &&
    moduloWp > 0 &&
    invKW > 0 &&
    perdas < 100;

  let consumoProjeto = 0, eficiencia = 0, potNec = 0, qtdMod = 0, potInst = 0;
  let areaEstimada = 0, potACRec = 0, qtdInv = 1, dcacReal = 0, gerMes = 0, gerAno = 0;
  let alertaInfo = "", alertaClipping = "";
  let mensagensObs: string[] = [];

  if (isValid) {
    consumoProjeto = consumo * (compensacao / 100) * (1 + crescimento / 100);
    eficiencia = 1 - perdas / 100;
    potNec = consumoProjeto / (30 * hsp * eficiencia);

    qtdMod = Math.ceil((potNec * 1000) / moduloWp);
    potInst = (qtdMod * moduloWp) / 1000;

    const fatorArea = (2.7 / 0.55) * 1.15;
    areaEstimada = potInst * fatorArea;

    potACRec = potInst / dcacTarget;

    let melhorDiferenca = Infinity;
    for (let i = 1; i <= 20; i++) {
      let potACTemp = i * invKW;
      if (potACTemp > potInst * 1.2 && i > 1) break;

      let dcacTemp = potInst / potACTemp;
      let diferenca = Math.abs(dcacTemp - dcacTarget);

      if (dcacTemp > 1.3) diferenca += 10;
      if (dcacTemp < 0.7 && i > 1) diferenca += 5;

      if (diferenca < melhorDiferenca) {
        melhorDiferenca = diferenca;
        qtdInv = i;
      }
    }

    const potACTotal = qtdInv * invKW;
    dcacReal = potInst / potACTotal;
    gerMes = potInst * hsp * 30 * eficiencia;
    gerAno = gerMes * 12;

    if (dcacReal > 1.3) {
      alertaClipping = `⚠️ Atenção (Clipping): Relação DC/AC real é ${fmt(dcacReal, 2)}. Valores acima de 1.30 indicam que nos dias de sol pleno o inversor não conseguirá processar toda a energia dos painéis, resultando em perda de geração.`;
    } else if (dcacReal < 0.7) {
      alertaInfo = `ℹ️ Inversor Subutilizado: Relação DC/AC real é ${fmt(dcacReal, 2)}. O inversor está superdimensionado.`;
    } else {
      alertaInfo = `✅ Dimensionamento Adequado: Relação DC/AC real é ${fmt(dcacReal, 2)}. Oversizing dentro da faixa ideal.`;
    }

    if (potInst > 75) {
      mensagensObs.push("Sistemas acima de 75 kWp geralmente requerem conexão em Média Tensão (Grupo A) e estudo de acesso da distribuidora.");
    } else if (potInst > 5 && invKW <= 5) {
      mensagensObs.push("⚠️ Atenção à Fase: Para sistemas maiores que 5 kWp em baixa tensão, recomenda-se utilizar inversores trifásicos para evitar desbalanceamento na rede da distribuidora.");
    }
    mensagensObs.push(`Consumo de projeto considerado: ${fmt(consumoProjeto, 0)} kWh/mês.`);
    mensagensObs.push(`Geração mensal estimada: ${fmt(gerMes, 0)} kWh.`);
    mensagensObs.push("Antes da implantação, valide: tensão de string, corrente por MPPT, limites máximos do inversor e regras da distribuidora local.");
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#0b1324] text-[#f8fafc] font-sans">
      <style dangerouslySetInnerHTML={{ __html: `
        .calc-pro input, .calc-pro select {
          width: 100%; padding: 12px 13px; border-radius: 10px; border: 1px solid #334155;
          background: #0b1220; color: white; outline: none; font-size: 15px; transition: 0.2s border-color;
          appearance: none;
        }
        .calc-pro input:focus, .calc-pro select:focus { border-color: #22c55e; }
        .calc-pro select {
          background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E');
          background-repeat: no-repeat; background-position: right 1rem center; background-size: 0.6rem; padding-right: 35px;
        }
      `}} />
      
      <div className="calc-pro max-w-[1180px] mx-auto p-7">
        <div className="flex flex-col md:flex-row justify-between gap-5 items-start md:items-end mb-6">
          <div>
            <h1 className="text-[clamp(28px,4vw,44px)] font-bold leading-tight m-0">Calculadora Fotovoltaica Pro</h1>
            <div className="text-[#94a3b8] mt-2.5 max-w-[720px]">
              Dimensionamento técnico baseado em HSP, eficiência global, perdas térmicas e regras de inversores do mercado brasileiro.
            </div>
          </div>
          <div className="border border-[#14532d] bg-[#052e16] text-[#86efac] px-3 py-2 rounded-full text-[13px] whitespace-nowrap mt-3 md:mt-0">
            Pré-projeto Técnico
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="bg-[rgba(17,24,39,0.92)] border border-[#334155] rounded-[18px] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
            <h2 className="m-0 mb-4 text-[20px] font-semibold">Dados de Entrada</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div>
                <label className="block text-[13px] text-[#cbd5e1] mb-2">Consumo médio (kWh/mês)</label>
                <input type="number" value={consumo} onChange={e => setConsumo(Number(e.target.value))} min="1" />
              </div>
              <div>
                <label className="block text-[13px] text-[#cbd5e1] mb-2">HSP média diária (h/dia)</label>
                <input type="number" value={hsp} onChange={e => setHsp(Number(e.target.value))} min="0.1" step="0.1" />
                <span className="text-[11px] text-[#64748b] mt-1 block">Brasil: 4.2 (Sul) a 5.8 (NE)</span>
              </div>
              <div>
                <label className="block text-[13px] text-[#cbd5e1] mb-2">Perdas globais (%)</label>
                <input type="number" value={perdas} onChange={e => setPerdas(Number(e.target.value))} min="0" max="90" />
                <span className="text-[11px] text-[#64748b] mt-1 block">Padrão: 20%</span>
              </div>
              <div>
                <label className="block text-[13px] text-[#cbd5e1] mb-2">Compensação (%)</label>
                <input type="number" value={compensacao} onChange={e => setCompensacao(Number(e.target.value))} min="1" max="150" />
                <span className="text-[11px] text-[#64748b] mt-1 block">Zerar a conta</span>
              </div>
              <div>
                <label className="block text-[13px] text-[#cbd5e1] mb-2">Crescimento carga (%)</label>
                <input type="number" value={crescimento} onChange={e => setCrescimento(Number(e.target.value))} min="0" max="100" />
              </div>
              <div>
                <label className="block text-[13px] text-[#cbd5e1] mb-2">Potência do módulo (Wp)</label>
                <input type="number" value={moduloWp} onChange={e => setModuloWp(Number(e.target.value))} min="50" />
              </div>
              
              <div>
                <label className="block text-[13px] text-[#cbd5e1] mb-2">Inversor Unitário</label>
                <select value={invKW} onChange={e => setInvKW(Number(e.target.value))}>
                  <optgroup label="Monofásicos">
                    <option value="1.5">1.5 kW</option>
                    <option value="2.0">2.0 kW</option>
                    <option value="3.0">3.0 kW</option>
                    <option value="3.68">3.68 kW</option>
                    <option value="4.0">4.0 kW</option>
                    <option value="5.0">5.0 kW</option>
                    <option value="6.0">6.0 kW</option>
                  </optgroup>
                  <optgroup label="Trifásicos">
                    <option value="7.5">7.5 kW</option>
                    <option value="10">10 kW</option>
                    <option value="15">15 kW</option>
                    <option value="20">20 kW</option>
                    <option value="33">33 kW</option>
                    <option value="50">50 kW</option>
                    <option value="100">100 kW</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-[13px] text-[#cbd5e1] mb-2">Estratégia DC/AC</label>
                <select value={dcacTarget} onChange={e => setDcacTarget(Number(e.target.value))}>
                  <option value="0.8">0.8 (Futuro)</option>
                  <option value="1.0">1.0 (Exata 1:1)</option>
                  <option value="1.1">1.1 (Leve)</option>
                  <option value="1.2">1.2 (Padrão)</option>
                  <option value="1.3">1.3 (Máx)</option>
                </select>
              </div>

            </div>
            
            <button 
              onClick={() => window.print()}
              className="w-full border-0 mt-5 p-3.5 rounded-[11px] bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white font-bold cursor-pointer text-[15px] transition-transform hover:translate-y-[-1px] hover:brightness-110"
            >
              Salvar / Imprimir Resumo
            </button>
            <div className="mt-4 text-[12px] text-[#94a3b8] border-t border-[#334155] pt-3">
              <b>Fórmula base:</b><br/>
              Pot. FV = Consumo × Comp. × (1+Cresc.) ÷ [30 × HSP × (1 − Perdas)]
            </div>
          </section>

          <section className="bg-[rgba(17,24,39,0.92)] border border-[#334155] rounded-[18px] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
            <h2 className="m-0 mb-4 text-[20px] font-semibold">Resultado do Dimensionamento</h2>
            
            {isValid ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-[#052e16] border border-[#166534] rounded-xl p-4">
                    <span className="block text-[#94a3b8] text-[12px] mb-1.5">Potência FV necessária</span>
                    <strong className="text-[23px] text-[#86efac]">{fmt(potNec)} kWp</strong>
                  </div>
                  <div className="bg-[#0b1220] border border-[#334155] rounded-xl p-4">
                    <span className="block text-[#94a3b8] text-[12px] mb-1.5">Potência FV instalada</span>
                    <strong className="text-[23px]">{fmt(potInst)} kWp</strong>
                  </div>
                  <div className="bg-[#0b1220] border border-[#334155] rounded-xl p-4">
                    <span className="block text-[#94a3b8] text-[12px] mb-1.5">Qtd de módulos</span>
                    <strong className="text-[23px]">{qtdMod} un.</strong>
                  </div>
                  <div className="bg-[#0b1220] border border-[#334155] rounded-xl p-4">
                    <span className="block text-[#94a3b8] text-[12px] mb-1.5">Área mínima</span>
                    <strong className="text-[23px]">{fmt(areaEstimada, 0)} m²</strong>
                  </div>
                  <div className="bg-[#0b1220] border border-[#334155] rounded-xl p-4">
                    <span className="block text-[#94a3b8] text-[12px] mb-1.5">Qtd de Inversores</span>
                    <strong className="text-[23px]">{qtdInv} × {fmt(invKW, 1)} kW</strong>
                  </div>
                  <div className="bg-[#0b1220] border border-[#334155] rounded-xl p-4">
                    <span className="block text-[#94a3b8] text-[12px] mb-1.5">DC/AC Real</span>
                    <strong className="text-[23px]">{fmt(dcacReal)}</strong>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-2">
                  {alertaInfo && <div className="p-3 rounded-lg text-[13px] bg-[rgba(59,130,246,0.1)] border border-[#3b82f6] text-[#93c5fd]">{alertaInfo}</div>}
                  {alertaClipping && <div className="p-3 rounded-lg text-[13px] bg-[rgba(245,158,11,0.1)] border border-[#f59e0b] text-[#fcd34d]">{alertaClipping}</div>}
                </div>

                <div className="mt-4 p-3.5 rounded-xl bg-[#172033] text-[#cbd5e1] text-[13px] leading-relaxed">
                  {mensagensObs.map((m, i) => (
                    <p key={i} className="mb-2 last:mb-0" dangerouslySetInnerHTML={{ __html: m }}></p>
                  ))}
                </div>
              </>
            ) : (
              <div className="mt-4 p-3.5 rounded-xl bg-[#172033] text-[#cbd5e1] text-[13px]">
                Aguardando valores válidos para calcular...
              </div>
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
