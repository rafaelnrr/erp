"use client";

import { useState } from "react";
import { atualizarStatusProposta } from "@/app/actions/propostas";
import { CORES_STATUS_PROPOSTA } from "@/utils/statusProposta";

export function StatusPropostaSelect({
  id,
  statusAtual,
  labels,
}: {
  id: string;
  statusAtual: string;
  labels: Record<string, string>;
}) {
  const [status, setStatus] = useState(statusAtual);
  const [salvando, setSalvando] = useState(false);

  async function handleChange(novoStatus: string) {
    setSalvando(true);
    const anterior = status;
    setStatus(novoStatus);
    const res = await atualizarStatusProposta(id, novoStatus);
    setSalvando(false);
    if (res.error) setStatus(anterior);
  }

  return (
    <select
      value={status}
      disabled={salvando}
      onChange={(e) => handleChange(e.target.value)}
      className={`rounded-full px-2 py-1 text-xs font-medium border-0 outline-none cursor-pointer ${CORES_STATUS_PROPOSTA[status] ?? "bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300"}`}
    >
      {Object.entries(labels).map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}
