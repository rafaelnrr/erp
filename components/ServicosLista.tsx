"use client";

import { useState } from "react";
import { ServicoDrawer } from "@/components/ServicoDrawer";
import type { Servico } from "@/app/actions/servicos";

const LABEL_RECORRENCIA: Record<string, string> = { unico: "Único", mensal: "Mensal", anual: "Anual" };

function formatBRL(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function ServicosLista({ servicos }: { servicos: Servico[] }) {
  const [drawerAberto, setDrawerAberto] = useState(false);
  const [editando, setEditando] = useState<Servico | null>(null);

  function abrirNovo() {
    setEditando(null);
    setDrawerAberto(true);
  }
  function abrirEdicao(s: Servico) {
    setEditando(s);
    setDrawerAberto(true);
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Catálogo de Serviços</h1>
          <p className="mt-1 text-sm text-gray-500">Serviços disponíveis para adicionar em propostas comerciais.</p>
        </div>
        <button onClick={abrirNovo} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
          + Novo Serviço
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Nome</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Recorrência</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Tempo Médio</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Custo Interno</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Preço de Venda</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {servicos.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">Nenhum serviço cadastrado.</td>
              </tr>
            ) : (
              servicos.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{s.nome}</td>
                  <td className="px-4 py-3 text-gray-600">{LABEL_RECORRENCIA[s.recorrencia_padrao]}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {s.tempo_execucao_valor ? `${s.tempo_execucao_valor} ${s.tempo_execucao_unidade}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{s.custo_interno ? formatBRL(s.custo_interno) : "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{formatBRL(s.preco_padrao)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${s.ativo ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {s.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => abrirEdicao(s)} className="text-blue-600 hover:underline text-xs font-medium">
                      Editar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {drawerAberto && <ServicoDrawer servicoEditar={editando} onClose={() => setDrawerAberto(false)} />}
    </>
  );
}
