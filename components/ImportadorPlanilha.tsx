"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, FileSpreadsheet } from "lucide-react";
import { Toast, type ToastState } from "@/components/Toast";
import type { ResultadoImportacao } from "@/app/actions/importarProdutos";

const EXTENSOES_ACEITAS = [".xlsx", ".csv"];

function extensaoValida(nome: string) {
  return EXTENSOES_ACEITAS.some((ext) => nome.toLowerCase().endsWith(ext));
}

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
  const [arrastando, setArrastando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<ResultadoImportacao | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function selecionarArquivo(f: File | null) {
    setResultado(null);
    if (!f) {
      setArquivo(null);
      return;
    }
    if (!extensaoValida(f.name)) {
      setToast({ tipo: "erro", mensagem: "Formato não suportado. Envie um arquivo .xlsx ou .csv." });
      setArquivo(null);
      return;
    }
    setArquivo(f);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setArrastando(false);
    const f = e.dataTransfer.files?.[0];
    if (f) selecionarArquivo(f);
  }

  async function handleImportar() {
    if (!arquivo) return;
    setEnviando(true);
    setResultado(null);
    const fd = new FormData();
    fd.set("arquivo", arquivo);
    const res = await acao(fd);
    setEnviando(false);
    setResultado(res);

    if (!res.ok) {
      setToast({ tipo: "erro", mensagem: res.erro ?? "Falha ao importar a planilha." });
      return;
    }
    setToast({
      tipo: res.comErro > 0 ? "erro" : "sucesso",
      mensagem:
        res.comErro > 0
          ? `Importação concluída com ${res.comErro} erro(s). ${res.criados} criado(s), ${res.atualizados} atualizado(s).`
          : `Importação concluída: ${res.criados} criado(s), ${res.atualizados} atualizado(s).`,
    });
    if (res.criados > 0 || res.atualizados > 0) {
      router.refresh();
      setArquivo(null);
    }
  }

  return (
    <div className="panel p-6 max-w-2xl">
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{descricao}</p>

      <a href={templateUrl} className="text-sm font-medium text-amber-600 dark:text-amber-500 hover:underline">
        Baixar planilha modelo
      </a>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setArrastando(true);
        }}
        onDragLeave={() => setArrastando(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`mt-4 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
          arrastando
            ? "border-amber-500 bg-amber-50 dark:bg-amber-500/10"
            : "border-slate-300 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-500"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.csv"
          onChange={(e) => selecionarArquivo(e.target.files?.[0] ?? null)}
          className="hidden"
        />
        {arquivo ? (
          <>
            <FileSpreadsheet className="w-8 h-8 text-amber-500" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{arquivo.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Clique ou arraste outro arquivo para substituir</p>
          </>
        ) : (
          <>
            <UploadCloud className="w-8 h-8 text-slate-400" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Arraste a planilha aqui ou clique para escolher</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Formatos aceitos: .xlsx ou .csv</p>
          </>
        )}
      </div>

      <button onClick={handleImportar} disabled={!arquivo || enviando} className="btn-primary mt-4 w-full">
        {enviando ? "Importando..." : "Importar"}
      </button>

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

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
