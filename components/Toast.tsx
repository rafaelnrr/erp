"use client";

import { useEffect } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";

export interface ToastState {
  tipo: "sucesso" | "erro";
  mensagem: string;
}

export function Toast({ toast, onClose }: { toast: ToastState | null; onClose: () => void }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const sucesso = toast.tipo === "sucesso";

  return (
    <div className="fixed bottom-5 right-5 z-[100]">
      <div
        className={`flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg max-w-sm ${
          sucesso
            ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/90 dark:border-emerald-700 dark:text-emerald-200"
            : "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/90 dark:border-red-700 dark:text-red-200"
        }`}
      >
        {sucesso ? <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" /> : <XCircle className="w-5 h-5 shrink-0 mt-0.5" />}
        <p className="text-sm font-medium flex-1">{toast.mensagem}</p>
        <button onClick={onClose} className="shrink-0 opacity-60 hover:opacity-100">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
