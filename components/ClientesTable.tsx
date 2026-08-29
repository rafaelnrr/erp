"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { NovoClienteDrawer } from "@/components/NovoClienteDrawer";
import { ExcluirClienteButton } from "@/components/ExcluirClienteButton";
import type { Tables } from "@/types/supabase";

const ITENS_POR_PAGINA = 15;

export function ClientesTable({
  clientes,
  isAdmin,
  isEditor,
  meuId,
}: {
  clientes: Tables<"clientes">[];
  isAdmin: boolean;
  isEditor: boolean;
  meuId: string | null;
}) {
  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(1);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return clientes;
    return clientes.filter(
      (c) =>
        c.nome.toLowerCase().includes(termo) ||
        (c.documento ?? "").toLowerCase().includes(termo) ||
        (c.cidade ?? "").toLowerCase().includes(termo)
    );
  }, [clientes, busca]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / ITENS_POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const itensPagina = filtrados.slice((paginaAtual - 1) * ITENS_POR_PAGINA, paginaAtual * ITENS_POR_PAGINA);
  const mostrarColunaAcoes = isAdmin || isEditor;

  return (
    <>
      <div className="mb-4">
        <input
          value={busca}
          onChange={(e) => {
            setBusca(e.target.value);
            setPagina(1);
          }}
          placeholder="Buscar por nome, documento ou cidade..."
          className="input-standard w-full sm:w-80"
        />
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <table className="table-standard">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Documento</th>
              <th>Consumo (kWh)</th>
              <th>Cidade/UF</th>
              <th>Zona</th>
              {mostrarColunaAcoes && <th className="text-right">Ações</th>}
            </tr>
          </thead>
          <tbody>
            {itensPagina.length === 0 ? (
              <tr>
                <td colSpan={mostrarColunaAcoes ? 6 : 5} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                  {clientes.length === 0 ? "Nenhum cliente cadastrado." : "Nenhum cliente encontrado para essa busca."}
                </td>
              </tr>
            ) : (
              itensPagina.map((c) => {
                const dono = meuId != null && c.vendedor_id === meuId;
                const podeEditar = isAdmin || (isEditor && dono);
                return (
                  <tr key={c.id}>
                    <td className="font-medium">
                      <Link href={`/admin/clientes/${c.id}`} className="text-slate-800 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-500 hover:underline">
                        {c.nome}
                      </Link>
                    </td>
                    <td>{c.documento || "—"}</td>
                    <td>{c.consumo_kwh_mes ?? "—"}</td>
                    <td>{c.cidade ? `${c.cidade}/${c.uf ?? "—"}` : "—"}</td>
                    <td className="capitalize">{c.zona ?? "—"}</td>
                    {mostrarColunaAcoes && (
                      <td>
                        {podeEditar && (
                          <div className="flex items-center justify-end gap-1">
                            <NovoClienteDrawer cliente={c} />
                            <ExcluirClienteButton id={c.id} nome={c.nome} />
                          </div>
                        )}
                      </td>
                    )}
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
            Página {paginaAtual} de {totalPaginas} ({filtrados.length} cliente{filtrados.length === 1 ? "" : "s"})
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
