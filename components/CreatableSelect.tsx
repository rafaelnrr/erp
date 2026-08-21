"use client";

import { useEffect, useRef, useState } from "react";

interface CreatableSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
}

export function CreatableSelect({ label, value, onChange, options, placeholder }: CreatableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => setQuery(value), [value]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery(value);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value]);

  const filtradas = options.filter((o) => o.toLowerCase().includes(query.toLowerCase()));
  const existeExato = options.some((o) => o.toLowerCase() === query.toLowerCase());

  function selecionar(opcao: string) {
    onChange(opcao);
    setQuery(opcao);
    setOpen(false);
  }

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-[13px] text-[#cbd5e1] mb-2">{label}</label>
      <input
        value={query}
        placeholder={placeholder}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          if (e.target.value === "") onChange("");
        }}
        className="w-full px-3 py-2.5 rounded-lg border border-[#334155] bg-[#0b1220] text-white text-[15px] outline-none focus:border-[#22c55e]"
      />
      {open && (
        <ul className="absolute z-20 mt-1 w-full max-h-56 overflow-auto rounded-lg border border-[#334155] bg-[#111827] shadow-xl">
          {filtradas.map((opcao) => (
            <li key={opcao}>
              <button
                type="button"
                onClick={() => selecionar(opcao)}
                className="w-full text-left px-3 py-2 text-[14px] text-[#e2e8f0] hover:bg-[#1e293b]"
              >
                {opcao}
              </button>
            </li>
          ))}
          {query.trim() !== "" && !existeExato && (
            <li>
              <button
                type="button"
                onClick={() => selecionar(query.trim())}
                className="w-full text-left px-3 py-2 text-[14px] text-[#86efac] hover:bg-[#1e293b] border-t border-[#334155]"
              >
                + Criar "{query.trim()}"
              </button>
            </li>
          )}
          {filtradas.length === 0 && query.trim() === "" && (
            <li className="px-3 py-2 text-[13px] text-[#64748b]">Digite para buscar ou criar uma opção</li>
          )}
        </ul>
      )}
    </div>
  );
}
