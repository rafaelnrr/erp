"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { listarClientes } from "@/app/actions/clientes";
import { criarPropostaVazia } from "@/app/actions/propostas";

interface Cliente {
  id: string;
  nome: string;
  documento: string | null;
  cidade: string | null;
}

export default function NovaPropostaPage() {
  const router = useRouter();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busca, setBusca] = useState("");
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);
  const [buscaAberta, setBuscaAberta] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [criando, setCriando] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listarClientes().then((r) => setClientes((r.data as Cliente[]) || []));
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setBuscaAberta(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtrados = clientes.filter((c) => c.nome.toLowerCase().includes(busca.toLowerCase()));

  async function handleCriar() {
    if (!clienteSelecionado) return;
    setCriando(true);
    const res = await criarPropostaVazia(clienteSelecionado.id, titulo || undefined);
    setCriando(false);
    if (res.success) router.push(`/admin/propostas/${res.id}/construtor`);
  }

  return (
    <main className="p-8 max-w-xl">
      <h1 className="text-xl font-semibold text-gray-800">Nova Proposta</h1>
      <p className="mt-1 text-sm text-gray-500">Selecione o cliente e, se quiser, dê um nome ao projeto. Você monta o resto no próximo passo.</p>

      <div className="mt-6 flex flex-col gap-4 rounded-lg border bg-white p-6 shadow-sm">
        <div ref={wrapperRef} className="relative">
          <label className="mb-1 block text-xs text-gray-500">Cliente</label>
          <input
            value={clienteSelecionado ? clienteSelecionado.nome : busca}
            onChange={(e) => {
              setClienteSelecionado(null);
              setBusca(e.target.value);
              setBuscaAberta(true);
            }}
            onFocus={() => setBuscaAberta(true)}
            placeholder="Buscar cliente por nome..."
            className="w-full rounded border p-2.5 text-sm"
          />
          {buscaAberta && !clienteSelecionado && (
            <ul className="absolute z-10 mt-1 w-full max-h-56 overflow-auto rounded-lg border bg-white shadow-lg">
              {filtrados.length === 0 && <li className="px-3 py-2 text-sm text-gray-500">Nenhum cliente encontrado.</li>}
              {filtrados.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => {
                      setClienteSelecionado(c);
                      setBuscaAberta(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    <span className="font-medium text-gray-800">{c.nome}</span>
                    {c.cidade && <span className="text-gray-400"> — {c.cidade}</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <label className="mb-1 block text-xs text-gray-500">Nome do Projeto (opcional)</label>
          <input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex: Instalação Residencial — Casa Praia" className="w-full rounded border p-2.5 text-sm" />
        </div>

        <button
          onClick={handleCriar}
          disabled={!clienteSelecionado || criando}
          className="mt-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {criando ? "Criando..." : "Criar e Continuar"}
        </button>
      </div>
    </main>
  );
}
