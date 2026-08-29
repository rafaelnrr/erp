"use client";

import { useEffect, useState } from "react";
import { criarProduto, atualizarProduto, type Produto } from "@/app/actions/produtos";
import { listarFabricantes, criarFabricante, type Fabricante } from "@/app/actions/fabricantes";

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
          <button onClick={salvar} disabled={salvando} className="btn-primary">
            {salvando ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProdutoForm({ produtoInicial, onSalvo }: { produtoInicial?: Produto; onSalvo: () => void }) {
  const modoEdicao = !!produtoInicial;
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [fabricantes, setFabricantes] = useState<Fabricante[]>([]);
  const [fabricanteId, setFabricanteId] = useState(produtoInicial?.fabricante_id ?? "");
  const [modalAberto, setModalAberto] = useState(false);

  const atributosIniciais = (produtoInicial?.atributos as Record<string, any>) ?? {};

  useEffect(() => {
    listarFabricantes().then((r) => r.ok && setFabricantes(r.data));
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErro(null);
    const formData = new FormData(e.currentTarget);
    formData.set("fabricante_id", fabricanteId);

    const res = modoEdicao ? await atualizarProduto(produtoInicial!.id, formData) : await criarProduto(formData);

    if (res.error) {
      setErro(res.error);
      setLoading(false);
    } else {
      onSalvo();
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="flex max-w-lg flex-col gap-4 panel p-6">
        <input name="sku" defaultValue={produtoInicial?.sku} placeholder="SKU Único (ex: MOD-550W-DAH)" required className="input-standard" />
        <select name="categoria" defaultValue={produtoInicial?.categoria ?? ""} required className="input-standard">
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

        <input name="modelo" defaultValue={atributosIniciais.modelo} placeholder="Modelo" required className="input-standard" />
        <input
          name="potencia_w"
          type="number"
          defaultValue={atributosIniciais.potencia_w}
          placeholder="Potência (Wp) - Apenas Módulo/Inversor"
          className="input-standard"
        />

        {erro && <p className="text-sm text-red-600 dark:text-red-400">{erro}</p>}

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Salvando..." : modoEdicao ? "Salvar Alterações" : "Salvar Produto no Catálogo"}
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
    </>
  );
}
