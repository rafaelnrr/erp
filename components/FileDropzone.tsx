"use client";

import { useRef, useState } from "react";

const TIPOS_ACEITOS = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];

interface FileDropzoneProps {
  label: string;
  file: File | null;
  onChange: (file: File | null) => void;
}

export function FileDropzone({ label, file, onChange }: FileDropzoneProps) {
  const [arrastando, setArrastando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function validarEDefinir(f: File | undefined) {
    if (!f) return;
    if (!TIPOS_ACEITOS.includes(f.type)) {
      setErro("Formato não aceito. Envie um PDF, JPG ou PNG.");
      return;
    }
    setErro(null);
    onChange(f);
  }

  return (
    <div>
      <label className="block text-[13px] text-[#cbd5e1] mb-2">{label}</label>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setArrastando(true);
        }}
        onDragLeave={() => setArrastando(false)}
        onDrop={(e) => {
          e.preventDefault();
          setArrastando(false);
          validarEDefinir(e.dataTransfer.files[0]);
        }}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
          arrastando ? "border-[#22c55e] bg-[#052e16]" : "border-[#334155] bg-[#0b1220]"
        }`}
      >
        {file ? (
          <div className="flex items-center justify-center gap-2 text-[#86efac] text-[14px]">
            📄 {file.name}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
              className="text-[#f87171] text-[12px] underline"
            >
              remover
            </button>
          </div>
        ) : (
          <p className="text-[#94a3b8] text-[13px]">
            Arraste a conta de energia aqui ou clique para selecionar
            <span className="block text-[11px] text-[#64748b] mt-1">PDF, JPG ou PNG</span>
          </p>
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={(e) => validarEDefinir(e.target.files?.[0])}
        />
      </div>
      {erro && <p className="mt-1 text-[12px] text-[#f87171]">{erro}</p>}
    </div>
  );
}
