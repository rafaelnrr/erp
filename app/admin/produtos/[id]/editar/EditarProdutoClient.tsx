"use client";

import { useRouter } from "next/navigation";
import { ProdutoForm } from "@/components/ProdutoForm";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { Produto } from "@/app/actions/produtos";

export function EditarProdutoClient({ produto }: { produto: Produto }) {
  const router = useRouter();

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Editar Produto</h1>
        <ThemeToggle />
      </div>
      <ProdutoForm
        produtoInicial={produto}
        onSalvo={() => {
          router.push("/admin/catalogo");
          router.refresh();
        }}
      />
    </main>
  );
}
