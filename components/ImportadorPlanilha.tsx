"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ResultadoImportacao } from "@/app/actions/importarProdutos";

export function ImportadorPlanilha({
  descricao,
  templateUrl,
  acao,
}: {
  descricao: string;
  templateUrl: string;
  acao: (formData: FormData) => Promise<ResultadoImportacao>;
}) {
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<ResultadoImportacao | null>(null);
  const router = useRouter();

  async function handleImportar() {
    if (!arquivo) return;
    setEnviando(true);
    setResultado(null);
    const fd = new FormData();
    fd.set("arquivo", arquivo);
    const res = await acao(fd);
    setEnviando(false);
    setResultado(res);
    if (res.ok && (res.criados > 0 || res.atualizados > 0)) {
      router.refresh();
    }
  }

  return (
    <div className="panel p-6 max-w-2xl">
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{descricao}</p>

      <a href={templateUrl} className="text-sm font-medium text-amber-600 dark:text-amber-500 hover:underline">
        Baixar planilha modelo
      </a>

      <div className="mt-4 flex flex-col sm:flex-row gap-3">
        <input
          type="file"
          accept=".xlsx"
          onChange={(e) => {
            setArquivo(e.target.files?.[0] ?? null);
            setResultado(null);
          }}
          className="input-standard w-full sm:flex-1"
        />
        <button onClick={handleImportar} disabled={!arquivo || enviando} className="btn-primary shrink-0">
          {enviando ? "Importando..." : "Importar"}
        </button>
      </div>

      {resultado && !resultado.ok && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{resultado.erro}</p>}

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
  );
}
