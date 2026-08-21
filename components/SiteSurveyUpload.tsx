"use client";

import { useRef } from "react";

export interface FotoSurvey {
  id: string;
  file: File;
  descricao: string;
  previewUrl: string;
}

interface SiteSurveyUploadProps {
  fotos: FotoSurvey[];
  onChange: (fotos: FotoSurvey[]) => void;
}

const SUGESTOES = ["Padrão de Entrada", "Telhado (vista geral)", "Quadro de Distribuição", "Telhado Sul", "Telhado Norte"];

export function SiteSurveyUpload({ fotos, onChange }: SiteSurveyUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function adicionarArquivos(files: FileList | null) {
    if (!files) return;
    const novas: FotoSurvey[] = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .map((file) => ({
        id: crypto.randomUUID(),
        file,
        descricao: "",
        previewUrl: URL.createObjectURL(file),
      }));
    onChange([...fotos, ...novas]);
  }

  function atualizarDescricao(id: string, descricao: string) {
    onChange(fotos.map((f) => (f.id === id ? { ...f, descricao } : f)));
  }

  function remover(id: string) {
    onChange(fotos.filter((f) => f.id !== id));
  }

  const semDescricao = fotos.filter((f) => f.descricao.trim() === "").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-[13px] text-[#cbd5e1]">Fotos de Instalação (Site Survey)</label>
        <button type="button" onClick={() => inputRef.current?.click()} className="text-[12px] text-[#86efac] hover:underline">
          + Adicionar fotos
        </button>
        <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => adicionarArquivos(e.target.files)} />
      </div>

      {fotos.length === 0 && <p className="text-[13px] text-[#64748b]">Nenhuma foto adicionada ainda.</p>}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {fotos.map((f) => (
          <div key={f.id} className="rounded-lg border border-[#334155] bg-[#0b1220] overflow-hidden">
            <img src={f.previewUrl} alt="" className="h-28 w-full object-cover" />
            <div className="p-2">
              <input
                value={f.descricao}
                onChange={(e) => atualizarDescricao(f.id, e.target.value)}
                placeholder="Descrição (obrigatória)"
                list="sugestoes-survey"
                className={`w-full text-[12px] px-2 py-1.5 rounded border bg-[#111827] text-white outline-none ${
                  f.descricao.trim() === "" ? "border-[#f59e0b]" : "border-[#334155]"
                }`}
              />
              <button type="button" onClick={() => remover(f.id)} className="mt-1 text-[11px] text-[#f87171]">
                remover
              </button>
            </div>
          </div>
        ))}
      </div>
      <datalist id="sugestoes-survey">
        {SUGESTOES.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>

      {semDescricao > 0 && (
        <p className="mt-2 text-[12px] text-[#f59e0b]">
          ⚠️ {semDescricao} foto(s) sem descrição — obrigatória para entrar no relatório técnico.
        </p>
      )}
    </div>
  );
}
