"use client";

import { criarProduto } from "@/app/actions/produtos";
import { listarFabricantes, criarFabricante, type Fabricante } from "@/app/actions/fabricantes";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

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
      <div className="w-full max-w-sm panel p-5">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-3">Novo Fabricante</h3>
        <input
          autoFocus
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nome do fabricante"
          className="input-standard w-full"
        />
        {erro && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{erro}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 text-sm text-slate-500 dark:text-slate-400">
            Cancelar
          </button>
          <button
            onClick={salvar}
            disabled={salvando}
            className="btn-primary"
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
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Novo Produto</h1>
        <ThemeToggle />
      </div>
      <form onSubmit={handleSubmit} className="flex max-w-lg flex-col gap-4 panel p-6">
        <input name="sku" placeholder="SKU Único (ex: MOD-550W-DAH)" required className="input-standard" />
        <select name="categoria" required className="input-standard">
          <option value="">Selecione a Categoria</option>
          <option value="modulo">Módulo</option>
          <option value="inversor">Inversor</option>
          <option value="estrutura">Estrutura</option>
          <option value="string_box">String Box</option>
          <option value="cabo">Cabo</option>
          <option value="acessorio">Acessório</option>
        </select>

        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label className="mb-1 block text-xs text-slate-500 dark:text-slate-400">Fabricante</label>
            <select
              value={fabricanteId}
              onChange={(e) => setFabricanteId(e.target.value)}
              required
              className="input-standard w-full"
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
            className="input-standard text-amber-600 dark:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10"
          >
            [+] Novo Fabricante
          </button>
        </div>

        <input name="modelo" placeholder="Modelo" required className="input-standard" />
        <input name="potencia_w" type="number" placeholder="Potência (Wp) - Apenas Módulo/Inversor" className="input-standard" />
        <button type="submit" disabled={loading} className="btn-primary">
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
