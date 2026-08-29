"use client";

import { useMemo, useState } from "react";
import { StatusPropostaSelect } from "@/components/StatusPropostaSelect";
import { PropostaActions } from "@/components/PropostaActions";
import { LABEL_STATUS_PROPOSTA } from "@/utils/statusProposta";

const ITENS_POR_PAGINA = 15;

interface PropostaLinha {
  id: string;
  numero: number;
  status: string;
  valor_total: number | null;
  criado_em: string;
  vendedor_id: string | null;
  clientes: { nome: string } | null;
}

export function PropostasTable({
  propostas,
  isAdmin,
  isEditor,
  meuId,
}: {
  propostas: PropostaLinha[];
  isAdmin: boolean;
  isEditor: boolean;
  meuId: string | null;
}) {
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("todos");
  const [pagina, setPagina] = useState(1);

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return propostas.filter((p) => {
      const bateBusca = !termo || (p.clientes?.nome ?? "").toLowerCase().includes(termo) || String(p.numero).includes(termo);
      const bateStatus = statusFiltro === "todos" || p.status === statusFiltro;
      return bateBusca && bateStatus;
    });
  }, [propostas, busca, statusFiltro]);

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / ITENS_POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const itensPagina = filtradas.slice((paginaAtual - 1) * ITENS_POR_PAGINA, paginaAtual * ITENS_POR_PAGINA);

  return (
    <>
      <div className="mb-4 flex flex-col sm:flex-row gap-3">
        <input
          value={busca}
          onChange={(e) => {
            setBusca(e.target.value);
            setPagina(1);
          }}
          placeholder="Buscar por cliente ou número..."
          className="input-standard w-full sm:w-72"
        />
        <select
          value={statusFiltro}
          onChange={(e) => {
            setStatusFiltro(e.target.value);
            setPagina(1);
          }}
          className="input-standard w-full sm:w-48"
        >
          <option value="todos">Todos os status</option>
          <option value="rascunho">Rascunho</option>
          {Object.entries(LABEL_STATUS_PROPOSTA)
            .filter(([v]) => v !== "rascunho")
            .map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <table className="table-standard">
          <thead>
            <tr>
              <th>Nº</th>
              <th>Cliente</th>
              <th>Valor Estimado</th>
              <th>Status</th>
              <th>Data</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {itensPagina.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                  {propostas.length === 0 ? "Nenhuma proposta gerada ainda." : "Nenhuma proposta encontrada para esse filtro."}
                </td>
              </tr>
            ) : (
              itensPagina.map((p) => {
                const dono = meuId != null && p.vendedor_id === meuId;
                const podeEditar = isAdmin || (isEditor && dono);
                return (
                  <tr key={p.id}>
                    <td className="font-mono text-xs">#{p.numero}</td>
                    <td className="font-medium text-slate-800 dark:text-slate-200">{p.clientes?.nome ?? "—"}</td>
                    <td>{p.status === "rascunho" ? "—" : Number(p.valor_total ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                    <td>
                      {p.status === "rascunho" || !podeEditar ? (
                        <span className="rounded-full bg-slate-100 dark:bg-slate-700/50 px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-300">
                          {p.status === "rascunho" ? "Rascunho" : LABEL_STATUS_PROPOSTA[p.status] ?? p.status}
                        </span>
                      ) : (
                        <StatusPropostaSelect id={p.id} statusAtual={p.status} labels={LABEL_STATUS_PROPOSTA} />
                      )}
                    </td>
                    <td className="text-xs text-slate-500 dark:text-slate-400">{new Date(p.criado_em).toLocaleDateString("pt-BR")}</td>
                    <td>
                      <PropostaActions id={p.id} status={p.status} podeEditar={podeEditar} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPaginas > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
          <span>
            Página {paginaAtual} de {totalPaginas} ({filtradas.length} proposta{filtradas.length === 1 ? "" : "s"})
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
              disabled={paginaAtual === 1}
              className="rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Anterior
            </button>
            <button
              onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
              disabled={paginaAtual === totalPaginas}
              className="rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Próxima
            </button>
          </div>
        </div>
      )}
    </>
  );
}
