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
  const inputRef = useRef<HTMLInputElement>(null);

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
      <button
        type="button"
        onClick={() => {
          setAberto(true);
          requestAnimationFrame(() => inputRef.current?.focus());
        }}
        className="flex w-full items-center gap-2 rounded-lg border-2 border-dashed border-blue-300 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700 hover:border-blue-400 hover:bg-blue-100"
      >
        <span className="text-lg leading-none">+</span> Adicionar Item do Catálogo
      </button>

      {aberto && (
        <div className="absolute z-20 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-xl">
          <div className="border-b p-2">
            <input
              ref={inputRef}
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome, SKU ou fabricante..."
              className="w-full rounded-md border-0 bg-gray-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <ul className="max-h-72 overflow-y-auto py-1">
            {filtrados.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-gray-400">Nenhum item encontrado no catálogo.</li>
            )}
            {filtrados.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => selecionar(p)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left hover:bg-blue-50"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {p.fabricantes?.nome ?? ""} {p.atributos?.modelo ?? p.sku}
                    </p>
                    <p className="text-xs text-gray-400 font-mono">{p.sku}</p>
                  </div>
                  {p.atributos?.potencia_w && (
                    <span className="shrink-0 rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600">
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
