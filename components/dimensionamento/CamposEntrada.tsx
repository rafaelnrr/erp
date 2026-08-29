"use client";

import type { TipoLigacao } from "@/app/actions/dimensionar";

export interface ValoresDimensionamento {
  consumo: number;
  hsp: number;
  perdas: number;
  compensacao: number;
  crescimento: number;
  tipoLigacao: TipoLigacao;
}

export function CamposEntrada({
  valores,
  onChange,
}: {
  valores: ValoresDimensionamento;
  onChange: (patch: Partial<ValoresDimensionamento>) => void;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
      <div>
        <label className="block text-[13px] text-[#cbd5e1] mb-2">Consumo médio (kWh/mês)</label>
        <input type="number" value={valores.consumo} onChange={(e) => onChange({ consumo: Number(e.target.value) })} min="1" />
      </div>
      <div>
        <label className="block text-[13px] text-[#cbd5e1] mb-2">HSP média diária (h/dia)</label>
        <input type="number" value={valores.hsp} onChange={(e) => onChange({ hsp: Number(e.target.value) })} min="0.1" step="0.1" />
      </div>
      <div>
        <label className="block text-[13px] text-[#cbd5e1] mb-2">Perdas globais (%)</label>
        <input type="number" value={valores.perdas} onChange={(e) => onChange({ perdas: Number(e.target.value) })} min="0" max="90" />
      </div>
      <div>
        <label className="block text-[13px] text-[#cbd5e1] mb-2">Compensação (%)</label>
        <input type="number" value={valores.compensacao} onChange={(e) => onChange({ compensacao: Number(e.target.value) })} min="1" max="150" />
      </div>
      <div>
        <label className="block text-[13px] text-[#cbd5e1] mb-2">Crescimento carga (%)</label>
        <input type="number" value={valores.crescimento} onChange={(e) => onChange({ crescimento: Number(e.target.value) })} min="0" max="100" />
      </div>
      <div>
        <label className="block text-[13px] text-[#cbd5e1] mb-2">Tipo de Ligação</label>
        <select value={valores.tipoLigacao} onChange={(e) => onChange({ tipoLigacao: e.target.value as TipoLigacao })}>
          <option value="monofasico">Monofásico</option>
          <option value="bifasico">Bifásico</option>
          <option value="trifasico">Trifásico</option>
        </select>
      </div>
    </div>
  );
}
