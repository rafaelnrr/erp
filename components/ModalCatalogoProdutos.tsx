"use client";

import { useState, useMemo } from "react";

interface ProdutoOpcao {
  id: string;
  sku: string;
  categoria: string;
  atributos: Record<string, any> | null;
  fabricantes: { nome: string } | null;
}

interface ModalCatalogoProps {
  produtos: ProdutoOpcao[];
  onAdicionar: (produtosSelecionados: ProdutoOpcao[]) => void;
  onFechar: () => void;
}

export function ModalCatalogoProdutos({ produtos, onAdicionar, onFechar }: ModalCatalogoProps) {
  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(1);
  const itensPorPagina = 10;
  
  // Usamos um Set para manter os IDs dos itens selecionados (preserva ao mudar de página/busca)
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());

  // Filtra com base na busca
  const filtrados = useMemo(() => {
    if (!busca.trim()) return produtos;
    const termo = busca.toLowerCase();
    return produtos.filter((p) => {
      const texto = `${p.sku} ${p.fabricantes?.nome ?? ""} ${p.atributos?.modelo ?? ""} ${p.categoria}`.toLowerCase();
      return texto.includes(termo);
    });
  }, [produtos, busca]);

  // Paginação
  const totalPaginas = Math.ceil(filtrados.length / itensPorPagina);
  const itensPaginados = useMemo(() => {
    const inicio = (pagina - 1) * itensPorPagina;
    return filtrados.slice(inicio, inicio + itensPorPagina);
  }, [filtrados, pagina]);

  // Resetar página ao buscar
  const handleBusca = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBusca(e.target.value);
    setPagina(1);
  };

  const toggleSelecao = (id: string) => {
    setSelecionados((prev) => {
      const novo = new Set(prev);
      if (novo.has(id)) {
        novo.delete(id);
      } else {
        novo.add(id);
      }
      return novo;
    });
  };

  const toggleSelecionarTodosPagina = () => {
    const todosPaginaSelecionados = itensPaginados.length > 0 && itensPaginados.every((p) => selecionados.has(p.id));
    setSelecionados((prev) => {
      const novo = new Set(prev);
      if (todosPaginaSelecionados) {
        itensPaginados.forEach((p) => novo.delete(p.id));
      } else {
        itensPaginados.forEach((p) => novo.add(p.id));
      }
      return novo;
    });
  };

  const handleSalvar = () => {
    const itensSelecionados = produtos.filter((p) => selecionados.has(p.id));
    onAdicionar(itensSelecionados);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="flex h-full max-h-[700px] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-2xl">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-xl font-bold text-slate-800">Catálogo de Equipamentos</h2>
          <button onClick={onFechar} className="text-slate-400 hover:text-slate-600 transition-colors rounded-full p-1 hover:bg-slate-100">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Busca */}
        <div className="border-b border-slate-200 bg-slate-50 dark:bg-slate-800 px-6 py-4">
          <div className="relative">
            <svg className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 10.5A6.5 6.5 0 1 1 4 10.5a6.5 6.5 0 0 1 13 0Z" />
            </svg>
            <input
              type="text"
              value={busca}
              onChange={handleBusca}
              placeholder="Buscar por nome, SKU, fabricante ou categoria..."
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
        </div>

        {/* Tabela */}
        <div className="flex-1 overflow-auto bg-white dark:bg-slate-900">
          <table className="table-standard">
            <thead className="sticky top-0 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700 z-10 bg-slate-50 dark:bg-slate-800 dark:bg-slate-800">
              <tr>
                <th className="w-14 px-4 py-3 text-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    checked={itensPaginados.length > 0 && itensPaginados.every((p) => selecionados.has(p.id))}
                    onChange={toggleSelecionarTodosPagina}
                  />
                </th>
                <th className="px-4 py-3 font-medium text-slate-600">Equipamento</th>
                <th className="px-4 py-3 font-medium text-slate-600">SKU</th>
                <th className="px-4 py-3 font-medium text-slate-600">Categoria</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {itensPaginados.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-500">
                    Nenhum equipamento encontrado.
                  </td>
                </tr>
              ) : (
                itensPaginados.map((p) => (
                  <tr 
                    key={p.id} 
                    className={`transition-colors cursor-pointer ${selecionados.has(p.id) ? 'bg-blue-50/50' : 'hover:bg-slate-50 dark:bg-slate-800'}`}
                    onClick={() => toggleSelecao(p.id)}
                  >
                    <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selecionados.has(p.id)}
                        onChange={() => toggleSelecao(p.id)}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">
                        {p.fabricantes?.nome ?? ""} {p.atributos?.modelo ?? ""}
                      </div>
                      {p.atributos?.potencia_w && (
                        <div className="text-xs text-slate-500 mt-0.5">{p.atributos.potencia_w}W</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500 font-mono text-xs">{p.sku}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                        {p.categoria}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação e Rodapé */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-white dark:bg-slate-900 px-6 py-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <button
                disabled={pagina === 1}
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
                className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <span className="text-sm font-medium text-slate-600 w-24 text-center">
                Pág {totalPaginas === 0 ? 0 : pagina} de {totalPaginas}
              </span>
              <button
                disabled={pagina >= totalPaginas}
                onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próxima
              </button>
            </div>
            {selecionados.size > 0 && (
              <div className="text-sm font-medium text-blue-600">
                {selecionados.size} item(s) selecionado(s)
              </div>
            )}
          </div>
          
          <div className="flex gap-3">
            <button onClick={onFechar} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
              Cancelar
            </button>
            <button
              onClick={handleSalvar}
              disabled={selecionados.size === 0}
              className="btn-primary"
            >
              Adicionar Selecionados
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
