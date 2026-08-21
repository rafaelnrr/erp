"use client";

import { criarProduto } from "@/app/actions/produtos";
import { listarFabricantes, criarFabricante, type Fabricante } from "@/app/actions/fabricantes";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function NovoFabricanteModal({
  onCriado,
  onClose,
}: {
  onCriado: (f: Fabricante) => void;
  onClose: () => void;
}) {
  const [nome, setNome] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function salvar() {
    if (!nome.trim()) return;
    setSalvando(true);
    setErro(null);
    const res = await criarFabricante(nome.trim());
    setSalvando(false);
    if (!res.ok) {
      setErro(res.error);
      return;
    }
    onCriado(res.data);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl">
        <h3 className="font-semibold text-gray-800 mb-3">Novo Fabricante</h3>
        <input
          autoFocus
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nome do fabricante"
          className="w-full rounded border p-2 text-sm"
        />
        {erro && <p className="mt-1 text-xs text-red-600">{erro}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 text-sm text-gray-500">
            Cancelar
          </button>
          <button
            onClick={salvar}
            disabled={salvando}
            className="px-3 py-1.5 text-sm rounded-lg bg-blue-600 text-white font-semibold disabled:opacity-50"
          >
            {salvando ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function NovoProdutoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fabricantes, setFabricantes] = useState<Fabricante[]>([]);
  const [fabricanteId, setFabricanteId] = useState("");
  const [modalAberto, setModalAberto] = useState(false);

  useEffect(() => {
    listarFabricantes().then((r) => r.ok && setFabricantes(r.data));
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("fabricante_id", fabricanteId);
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

        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label className="mb-1 block text-xs text-gray-500">Fabricante</label>
            <select
              value={fabricanteId}
              onChange={(e) => setFabricanteId(e.target.value)}
              required
              className="w-full rounded border p-2 text-sm"
            >
              <option value="">Selecione...</option>
              {fabricantes.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nome}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() => setModalAberto(true)}
            className="rounded border p-2 text-sm text-blue-600 hover:bg-blue-50"
          >
            [+] Novo Fabricante
          </button>
        </div>

        <input name="modelo" placeholder="Modelo" required className="rounded border p-2 text-sm" />
        <input name="potencia_w" type="number" placeholder="Potência (Wp) - Apenas Módulo/Inversor" className="rounded border p-2 text-sm" />
        <button type="submit" disabled={loading} className="mt-4 rounded bg-blue-600 p-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
          {loading ? "Salvando..." : "Salvar Produto no Catálogo"}
        </button>
      </form>

      {modalAberto && (
        <NovoFabricanteModal
          onClose={() => setModalAberto(false)}
          onCriado={(f) => {
            setFabricantes((prev) => [...prev, f]);
            setFabricanteId(f.id);
            setModalAberto(false);
          }}
        />
      )}
    </main>
  );
}
