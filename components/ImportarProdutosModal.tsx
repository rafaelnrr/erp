"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { importarPlanilhaProdutos, type ResultadoImportacao } from "@/app/actions/importarProdutos";

export function ImportarProdutosModal() {
  const [aberto, setAberto] = useState(false);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<ResultadoImportacao | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function fechar() {
    setAberto(false);
    setArquivo(null);
    setResultado(null);
  }

  async function handleImportar() {
    if (!arquivo) return;
    setEnviando(true);
    setResultado(null);
    const fd = new FormData();
    fd.set("arquivo", arquivo);
    const res = await importarPlanilhaProdutos(fd);
    setEnviando(false);
    setResultado(res);
    if (res.ok && (res.criados > 0 || res.atualizados > 0)) {
      router.refresh();
    }
  }

  return (
    <>
      <button onClick={() => setAberto(true)} className="btn-primary bg-slate-700 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white">
        Importar Planilha
      </button>

      {aberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg panel p-6 max-h-[85vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">Importar Produtos por Planilha</h3>
              <button onClick={fechar} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">✕</button>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              Envie um arquivo .xlsx com as colunas SKU e Categoria (obrigatórias) e, opcionalmente, Fabricante, Modelo,
              Potência, CD/Origem, Preço e Quantidade. Produtos com SKU já existente são atualizados; os demais são criados.
            </p>

            <a href="/api/produtos/template" className="text-sm font-medium text-amber-600 dark:text-amber-500 hover:underline">
              Baixar planilha modelo
            </a>

            <div className="mt-4">
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx"
                onChange={(e) => setArquivo(e.target.files?.[0] ?? null)}
                className="input-standard w-full"
              />
            </div>

            <button
              onClick={handleImportar}
              disabled={!arquivo || enviando}
              className="btn-primary mt-4 w-full"
            >
              {enviando ? "Importando..." : "Importar"}
            </button>

            {resultado && !resultado.ok && (
              <p className="mt-4 text-sm text-red-600 dark:text-red-400">{resultado.erro}</p>
            )}

            {resultado?.ok && (
              <div className="mt-4">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {resultado.criados} criado(s), {resultado.atualizados} atualizado(s), {resultado.comErro} com erro.
                </p>
                {resultado.linhas.filter((l) => l.status === "erro").length > 0 && (
                  <div className="mt-2 max-h-40 overflow-y-auto rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-2 text-xs text-red-700 dark:text-red-300">
                    {resultado.linhas
                      .filter((l) => l.status === "erro")
                      .map((l, i) => (
                        <p key={i}>
                          Linha {l.linha} {l.sku && `(${l.sku})`}: {l.mensagem}
                        </p>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
