"use client";

import { criarProduto } from "@/app/actions/produtos";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NovoProdutoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await criarProduto(formData);
    
    if (res.error) {
      alert("Erro ao salvar produto: " + res.error);
      setLoading(false);
    } else {
      router.push("/admin/catalogo");
      router.refresh();
    }
  }

  return (
    <main className="p-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Novo Produto</h1>
      </div>
      <form onSubmit={handleSubmit} className="flex max-w-lg flex-col gap-4 rounded-lg border bg-white p-6 shadow-sm">
        <input name="sku" placeholder="SKU Único (ex: MOD-550W-DAH)" required className="rounded border p-2 text-sm" />
        <select name="categoria" required className="rounded border p-2 text-sm">
          <option value="">Selecione a Categoria</option>
          <option value="modulo">Módulo</option>
          <option value="inversor">Inversor</option>
          <option value="estrutura">Estrutura</option>
          <option value="string_box">String Box</option>
          <option value="cabo">Cabo</option>
        </select>
        <input name="fabricante" placeholder="Fabricante" required className="rounded border p-2 text-sm" />
        <input name="modelo" placeholder="Modelo" required className="rounded border p-2 text-sm" />
        <input name="potencia_w" type="number" placeholder="Potência (Wp) - Apenas Módulo/Inversor" className="rounded border p-2 text-sm" />
        <button type="submit" disabled={loading} className="mt-4 rounded bg-blue-600 p-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
          {loading ? "Salvando..." : "Salvar Produto no Catálogo"}
        </button>
      </form>
    </main>
  );
}
