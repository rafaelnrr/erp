"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { criarPrecoEstoque, atualizarPrecoEstoque, excluirPrecoEstoque, type EstoquePrecoLinha } from "@/app/actions/estoque";
import type { Produto } from "@/app/actions/produtos";

function formatBRL(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function descricaoProduto(p: EstoquePrecoLinha["produtos"]) {
  if (!p) return "Produto removido";
  const attrs = (p.atributos as Record<string, any>) || {};
  return `${p.fabricantes?.nome ?? ""} ${attrs.modelo ?? p.sku}`.trim();
}

function LinhaEstoque({ linha, podeEditar }: { linha: EstoquePrecoLinha; podeEditar: boolean }) {
  const [editando, setEditando] = useState(false);
  const [preco, setPreco] = useState(String(linha.preco));
  const [quantidade, setQuantidade] = useState(String(linha.quantidade));
  const [erro, setErro] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function salvar() {
    setErro(null);
    startTransition(async () => {
      const res = await atualizarPrecoEstoque(linha.id, { preco: Number(preco), quantidade: Number(quantidade) });
      if (res.error) {
        setErro(res.error);
      } else {
        setEditando(false);
        router.refresh();
      }
    });
  }

  function excluir() {
    if (!confirm(`Remover o registro de estoque de "${descricaoProduto(linha.produtos)}" no CD "${linha.cd_id}"?`)) return;
    setErro(null);
    startTransition(async () => {
      const res = await excluirPrecoEstoque(linha.id);
      if (res.error) setErro(res.error);
      else router.refresh();
    });
  }

  return (
    <tr>
      <td className="font-medium text-slate-800 dark:text-slate-200">{descricaoProduto(linha.produtos)}</td>
      <td className="font-mono text-xs">{linha.produtos?.sku ?? "—"}</td>
      <td>{linha.cd_id}</td>
      <td>
        {editando ? (
          <input type="number" step="0.01" value={preco} onChange={(e) => setPreco(e.target.value)} className="input-standard w-28" />
        ) : (
          formatBRL(linha.preco)
        )}
      </td>
      <td>
        {editando ? (
          <input type="number" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} className="input-standard w-24" />
        ) : (
          linha.quantidade
        )}
      </td>
      {podeEditar && (
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
                    setPreco(String(linha.preco));
                    setQuantidade(String(linha.quantidade));
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
          {erro && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{erro}</p>}
        </td>
      )}
    </tr>
  );
}

function NovoRegistroForm({ produtos }: { produtos: Produto[] }) {
  const [produtoId, setProdutoId] = useState("");
  const [cdId, setCdId] = useState("");
  const [preco, setPreco] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const router = useRouter();

  async function adicionar(e: React.FormEvent) {
    e.preventDefault();
    if (!produtoId || !cdId.trim() || !preco || !quantidade) return;
    setSalvando(true);
    setErro(null);
    const res = await criarPrecoEstoque({ produto_id: produtoId, cd_id: cdId.trim(), preco: Number(preco), quantidade: Number(quantidade) });
    setSalvando(false);
    if (res.error) {
      setErro(res.error);
      return;
    }
    setProdutoId("");
    setCdId("");
    setPreco("");
    setQuantidade("");
    router.refresh();
  }

  return (
    <form onSubmit={adicionar} className="mb-4 flex flex-wrap items-end gap-2">
      <div className="flex-1 min-w-[220px]">
        <label className="mb-1 block text-xs text-slate-500 dark:text-slate-400">Produto</label>
        <select value={produtoId} onChange={(e) => setProdutoId(e.target.value)} className="input-standard w-full">
          <option value="">Selecione...</option>
          {produtos.map((p) => {
            const attrs = (p.atributos as Record<string, any>) || {};
            return (
              <option key={p.id} value={p.id}>
                {p.fabricantes?.nome ?? ""} {attrs.modelo ?? p.sku} ({p.sku})
              </option>
            );
          })}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs text-slate-500 dark:text-slate-400">CD / Origem</label>
        <input value={cdId} onChange={(e) => setCdId(e.target.value)} placeholder="Ex: CD-SP" className="input-standard w-32" />
      </div>
      <div>
        <label className="mb-1 block text-xs text-slate-500 dark:text-slate-400">Preço (R$)</label>
        <input type="number" step="0.01" value={preco} onChange={(e) => setPreco(e.target.value)} className="input-standard w-28" />
      </div>
      <div>
        <label className="mb-1 block text-xs text-slate-500 dark:text-slate-400">Quantidade</label>
        <input type="number" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} className="input-standard w-24" />
      </div>
      <button type="submit" disabled={salvando} className="btn-primary">
        {salvando ? "Adicionando..." : "+ Adicionar"}
      </button>
      {erro && <p className="w-full text-sm text-red-600 dark:text-red-400">{erro}</p>}
    </form>
  );
}

export function EstoqueTable({
  linhas,
  produtos,
  podeAdicionar,
  podeEditar,
}: {
  linhas: EstoquePrecoLinha[];
  produtos: Produto[];
  podeAdicionar: boolean;
  podeEditar: boolean;
}) {
  const [busca, setBusca] = useState("");

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return linhas;
    return linhas.filter((l) => descricaoProduto(l.produtos).toLowerCase().includes(termo) || l.cd_id.toLowerCase().includes(termo) || (l.produtos?.sku ?? "").toLowerCase().includes(termo));
  }, [linhas, busca]);

  const mostrarColunaAcoes = podeEditar;

  return (
    <>
      {podeAdicionar && <NovoRegistroForm produtos={produtos} />}

      <div className="mb-4">
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por produto, SKU ou CD..."
          className="input-standard w-full sm:w-80"
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <table className="table-standard">
          <thead>
            <tr>
              <th>Produto</th>
              <th>SKU</th>
              <th>CD / Origem</th>
              <th>Preço</th>
              <th>Quantidade</th>
              {mostrarColunaAcoes && <th className="text-right">Ações</th>}
            </tr>
          </thead>
          <tbody>
            {filtradas.length === 0 ? (
              <tr>
                <td colSpan={mostrarColunaAcoes ? 6 : 5} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                  {linhas.length === 0 ? "Nenhum registro de estoque/preço cadastrado." : "Nenhum registro encontrado para essa busca."}
                </td>
              </tr>
            ) : (
              filtradas.map((l) => <LinhaEstoque key={l.id} linha={l} podeEditar={podeEditar} />)
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
