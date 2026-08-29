"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { criarFornecedor, atualizarFornecedor, excluirFornecedor, type Fornecedor } from "@/app/actions/fornecedores";

type FormState = { nome: string; documento: string; telefone: string; email: string };

const FORM_VAZIO: FormState = { nome: "", documento: "", telefone: "", email: "" };

function paraFormState(f: Fornecedor): FormState {
  return { nome: f.nome, documento: f.documento ?? "", telefone: f.telefone ?? "", email: f.email ?? "" };
}

function LinhaFornecedor({ item, podeEditar }: { item: Fornecedor; podeEditar: boolean }) {
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState<FormState>(paraFormState(item));
  const [erro, setErro] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function salvar() {
    if (!form.nome.trim()) return;
    setErro(null);
    startTransition(async () => {
      const res = await atualizarFornecedor(item.id, {
        nome: form.nome.trim(),
        documento: form.documento.trim() || undefined,
        telefone: form.telefone.trim() || undefined,
        email: form.email.trim() || undefined,
      });
      if (res.error) {
        setErro(res.error);
      } else {
        setEditando(false);
        router.refresh();
      }
    });
  }

  function excluir() {
    if (!confirm(`Excluir o fornecedor "${item.nome}"?`)) return;
    setErro(null);
    startTransition(async () => {
      const res = await excluirFornecedor(item.id);
      if (res.error) setErro(res.error);
      else router.refresh();
    });
  }

  if (editando) {
    return (
      <tr>
        <td colSpan={5} className="bg-slate-50 dark:bg-slate-800/50 px-4 py-3">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Nome" className="input-standard" autoFocus />
            <input value={form.documento} onChange={(e) => setForm({ ...form, documento: e.target.value })} placeholder="CNPJ/CPF" className="input-standard" />
            <input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} placeholder="Telefone" className="input-standard" />
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="input-standard" />
          </div>
          {erro && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{erro}</p>}
          <div className="mt-2 flex items-center justify-end gap-3 text-xs font-medium">
            <button onClick={salvar} disabled={isPending} className="text-amber-600 dark:text-amber-500 hover:underline disabled:opacity-50">
              {isPending ? "Salvando..." : "Salvar"}
            </button>
            <button
              onClick={() => {
                setEditando(false);
                setForm(paraFormState(item));
              }}
              className="text-slate-500 dark:text-slate-400 hover:underline"
            >
              Cancelar
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td className="font-medium text-slate-800 dark:text-slate-200">{item.nome}</td>
      <td className="text-slate-600 dark:text-slate-400">{item.documento || "—"}</td>
      <td className="text-slate-600 dark:text-slate-400">{item.telefone || "—"}</td>
      <td className="text-slate-600 dark:text-slate-400">{item.email || "—"}</td>
      {podeEditar && (
        <td>
          <div className="flex items-center justify-end gap-3 text-xs font-medium">
            <button onClick={() => setEditando(true)} className="text-amber-600 dark:text-amber-500 hover:underline">
              Editar
            </button>
            <button onClick={excluir} disabled={isPending} className="text-red-600 dark:text-red-400 hover:underline disabled:opacity-50">
              Excluir
            </button>
          </div>
        </td>
      )}
    </tr>
  );
}

export function FornecedoresTable({
  fornecedores,
  podeAdicionar,
  podeEditar,
}: {
  fornecedores: Fornecedor[];
  podeAdicionar: boolean;
  podeEditar: boolean;
}) {
  const [novo, setNovo] = useState<FormState>(FORM_VAZIO);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const router = useRouter();

  async function adicionar(e: React.FormEvent) {
    e.preventDefault();
    if (!novo.nome.trim()) return;
    setSalvando(true);
    setErro(null);
    const res = await criarFornecedor({
      nome: novo.nome.trim(),
      documento: novo.documento.trim() || undefined,
      telefone: novo.telefone.trim() || undefined,
      email: novo.email.trim() || undefined,
    });
    setSalvando(false);
    if (!res.ok) {
      setErro(res.error);
      return;
    }
    setNovo(FORM_VAZIO);
    setMostrarForm(false);
    router.refresh();
  }

  const mostrarColunaAcoes = podeEditar;

  return (
    <>
      {podeAdicionar && (
        <div className="mb-4">
          {!mostrarForm ? (
            <button onClick={() => setMostrarForm(true)} className="btn-primary">
              + Novo fornecedor
            </button>
          ) : (
            <form onSubmit={adicionar} className="panel p-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <input value={novo.nome} onChange={(e) => setNovo({ ...novo, nome: e.target.value })} placeholder="Nome" className="input-standard" autoFocus />
                <input value={novo.documento} onChange={(e) => setNovo({ ...novo, documento: e.target.value })} placeholder="CNPJ/CPF" className="input-standard" />
                <input value={novo.telefone} onChange={(e) => setNovo({ ...novo, telefone: e.target.value })} placeholder="Telefone" className="input-standard" />
                <input value={novo.email} onChange={(e) => setNovo({ ...novo, email: e.target.value })} placeholder="Email" className="input-standard" />
              </div>
              {erro && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{erro}</p>}
              <div className="mt-3 flex items-center gap-3">
                <button type="submit" disabled={salvando} className="btn-primary">
                  {salvando ? "Salvando..." : "Salvar"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMostrarForm(false);
                    setNovo(FORM_VAZIO);
                    setErro(null);
                  }}
                  className="text-sm text-slate-500 dark:text-slate-400 hover:underline"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <table className="table-standard">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Documento</th>
              <th>Telefone</th>
              <th>Email</th>
              {mostrarColunaAcoes && <th className="text-right">Ações</th>}
            </tr>
          </thead>
          <tbody>
            {fornecedores.length === 0 ? (
              <tr>
                <td colSpan={mostrarColunaAcoes ? 5 : 4} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                  Nenhum fornecedor cadastrado.
                </td>
              </tr>
            ) : (
              fornecedores.map((f) => <LinhaFornecedor key={f.id} item={f} podeEditar={podeEditar} />)
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
