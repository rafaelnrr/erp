"use client";

import { useEffect, useRef, useState } from "react";

interface ProdutoOpcao {
  id: string;
  sku: string;
  categoria: string;
  atributos: Record<string, any> | null;
  fabricantes: { nome: string } | null;
}

export function ProdutoCombobox({
  produtos,
  onSelecionar,
}: {
  produtos: ProdutoOpcao[];
  onSelecionar: (p: ProdutoOpcao) => void;
}) {
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setAberto(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtrados = produtos.filter((p) => {
    const texto = `${p.sku} ${p.fabricantes?.nome ?? ""} ${p.atributos?.modelo ?? ""}`.toLowerCase();
    return texto.includes(busca.toLowerCase());
  });

  function selecionar(p: ProdutoOpcao) {
    onSelecionar(p);
    setBusca("");
    setAberto(false);
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10.5A6.5 6.5 0 1 1 4 10.5a6.5 6.5 0 0 1 13 0Z" />
        </svg>
        <input
          value={busca}
          onFocus={() => setAberto(true)}
          onChange={(e) => {
            setBusca(e.target.value);
            setAberto(true);
          }}
          placeholder="Adicionar item do catálogo — busque por nome, SKU ou fabricante..."
          className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-800 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
        />
      </div>

      {aberto && (
        <div className="absolute z-20 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-xl">
          <ul className="max-h-72 overflow-y-auto py-1">
            {filtrados.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-slate-400">Nenhum item encontrado no catálogo.</li>
            )}
            {filtrados.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => selecionar(p)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left hover:bg-blue-50"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {p.fabricantes?.nome ?? ""} {p.atributos?.modelo ?? p.sku}
                    </p>
                    <p className="text-xs text-slate-400 font-mono">{p.sku}</p>
                  </div>
                  {p.atributos?.potencia_w && (
                    <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                      {p.atributos.potencia_w}W
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
