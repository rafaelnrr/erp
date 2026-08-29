"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { criarFabricante, atualizarFabricante, excluirFabricante, type Fabricante } from "@/app/actions/fabricantes";

function LinhaFabricante({ fabricante, isAdmin }: { fabricante: Fabricante; isAdmin: boolean }) {
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState(fabricante.nome);
  const [erro, setErro] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function salvar() {
    if (!nome.trim()) return;
    setErro(null);
    startTransition(async () => {
      const res = await atualizarFabricante(fabricante.id, nome.trim());
      if (res.error) {
        setErro(res.error);
      } else {
        setEditando(false);
        router.refresh();
      }
    });
  }

  function excluir() {
    if (!confirm(`Excluir o fabricante "${fabricante.nome}"?`)) return;
    setErro(null);
    startTransition(async () => {
      const res = await excluirFabricante(fabricante.id);
      if (res.error) setErro(res.error);
      else router.refresh();
    });
  }

  return (
    <tr>
      <td className="font-medium text-slate-800 dark:text-slate-200">
        {editando ? (
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="input-standard w-full max-w-xs"
            autoFocus
          />
        ) : (
          fabricante.nome
        )}
        {erro && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{erro}</p>}
      </td>
      {isAdmin && (
        <td>
          <div className="flex items-center justify-end gap-3 text-xs font-medium">
            {editando ? (
              <>
                <button onClick={salvar} disabled={isPending} className="text-amber-600 dark:text-amber-500 hover:underline disabled:opacity-50">
                  {isPending ? "Salvando..." : "Salvar"}
                </button>
                <button
                  onClick={() => {
                    setEditando(false);
                    setNome(fabricante.nome);
                  }}
                  className="text-slate-500 dark:text-slate-400 hover:underline"
                >
                  Cancelar
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setEditando(true)} className="text-amber-600 dark:text-amber-500 hover:underline">
                  Editar
                </button>
                <button onClick={excluir} disabled={isPending} className="text-red-600 dark:text-red-400 hover:underline disabled:opacity-50">
                  Excluir
                </button>
              </>
            )}
          </div>
        </td>
      )}
    </tr>
  );
}

export function FabricantesTable({ fabricantes, isAdmin }: { fabricantes: Fabricante[]; isAdmin: boolean }) {
  const [novoNome, setNovoNome] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const router = useRouter();

  async function adicionar(e: React.FormEvent) {
    e.preventDefault();
    if (!novoNome.trim()) return;
    setSalvando(true);
    setErro(null);
    const res = await criarFabricante(novoNome.trim());
    setSalvando(false);
    if (!res.ok) {
      setErro(res.error);
      return;
    }
    setNovoNome("");
    router.refresh();
  }

  return (
    <>
      {isAdmin && (
        <form onSubmit={adicionar} className="mb-4 flex items-end gap-2">
          <div>
            <label className="mb-1 block text-xs text-slate-500 dark:text-slate-400">Novo fabricante</label>
            <input value={novoNome} onChange={(e) => setNovoNome(e.target.value)} placeholder="Nome do fabricante" className="input-standard w-64" />
          </div>
          <button type="submit" disabled={salvando} className="btn-primary">
            {salvando ? "Adicionando..." : "+ Adicionar"}
          </button>
        </form>
      )}
      {erro && <p className="mb-3 text-sm text-red-600 dark:text-red-400">{erro}</p>}

      <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <table className="table-standard">
          <thead>
            <tr>
              <th>Nome</th>
              {isAdmin && <th className="text-right">Ações</th>}
            </tr>
          </thead>
          <tbody>
            {fabricantes.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 2 : 1} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                  Nenhum fabricante cadastrado.
                </td>
              </tr>
            ) : (
              fabricantes.map((f) => <LinhaFabricante key={f.id} fabricante={f} isAdmin={isAdmin} />)
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
