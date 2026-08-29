"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { excluirCliente } from "@/app/actions/clientes";

export function ExcluirClienteButton({ id, nome }: { id: string; nome: string }) {
  const [erro, setErro] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    if (!confirm(`Excluir o cliente "${nome}"? Essa ação não pode ser desfeita.`)) return;
    setErro(null);
    startTransition(async () => {
      const res = await excluirCliente(id);
      if (res.error) {
        setErro(res.error);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={handleDelete}
        disabled={isPending}
        title="Excluir cliente"
        className="inline-flex items-center justify-center w-8 h-8 rounded-full text-slate-500 hover:text-red-600 hover:bg-red-50 dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
      {erro && (
        <div className="absolute right-0 mt-2 w-64 rounded-md bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 px-3 py-2 text-xs text-red-700 dark:text-red-300 z-50">
          {erro}
        </div>
      )}
    </div>
  );
}
