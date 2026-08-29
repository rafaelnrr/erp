"use client";

import { useState } from "react";
import { ServicoDrawer } from "@/components/ServicoDrawer";
import { ThemeToggle } from "@/components/ThemeToggle";
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
          <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Catálogo de Serviços</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Serviços disponíveis para adicionar em propostas comerciais.</p>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <button onClick={abrirNovo} className="btn-primary">
            + Novo Serviço
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <table className="table-standard">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Recorrência</th>
              <th>Tempo Médio</th>
              <th>Custo Interno</th>
              <th>Preço de Venda</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {servicos.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">Nenhum serviço cadastrado.</td>
              </tr>
            ) : (
              servicos.map((s) => (
                <tr key={s.id}>
                  <td className="font-medium text-slate-800 dark:text-slate-200">{s.nome}</td>
                  <td>{LABEL_RECORRENCIA[s.recorrencia_padrao]}</td>
                  <td>
                    {s.tempo_execucao_valor ? `${s.tempo_execucao_valor} ${s.tempo_execucao_unidade}` : "—"}
                  </td>
                  <td>{s.custo_interno ? formatBRL(s.custo_interno) : "—"}</td>
                  <td>{formatBRL(s.preco_padrao)}</td>
                  <td>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${s.ativo ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" : "bg-slate-100 text-slate-500 dark:bg-slate-700/50 dark:text-slate-400"}`}>
                      {s.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => abrirEdicao(s)} className="text-amber-600 dark:text-amber-500 hover:underline text-xs font-medium">
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
