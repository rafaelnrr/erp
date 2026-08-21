"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { excluirUsuario, type PerfilUsuario, type Role } from "@/app/actions/perfis";
import { UsuarioModal } from "@/components/UsuarioModal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const BADGE_VARIANT: Record<Role, "blue" | "green" | "gray"> = {
  admin: "blue",
  editor: "green",
  visualizador: "gray",
};

const LABEL_ROLE: Record<Role, string> = {
  admin: "Admin",
  editor: "Editor",
  visualizador: "Visualizador",
};

export function GerenciamentoUsuarios({ usuarios, meuId }: { usuarios: PerfilUsuario[]; meuId: string | null }) {
  const router = useRouter();
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<PerfilUsuario | null>(null);
  const [excluindoId, setExcluindoId] = useState<string | null>(null);
  const [erroExclusao, setErroExclusao] = useState<string | null>(null);

  function abrirNovo() {
    setEditando(null);
    setModalAberto(true);
  }
  function abrirEdicao(u: PerfilUsuario) {
    setEditando(u);
    setModalAberto(true);
  }

  async function handleExcluir(u: PerfilUsuario) {
    if (!confirm(`Excluir o acesso de ${u.email}? Essa ação não pode ser desfeita.`)) return;
    setExcluindoId(u.id);
    setErroExclusao(null);
    const res = await excluirUsuario(u.id);
    setExcluindoId(null);
    if (res.error) {
      setErroExclusao(res.error);
      return;
    }
    router.refresh();
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Gestão de Usuários e Permissões</h1>
          <p className="mt-1 text-sm text-slate-500">Controle de acesso baseado em papéis (RBAC).</p>
        </div>
        <Button onClick={abrirNovo}>+ Novo Usuário</Button>
      </div>

      {erroExclusao && <p className="mb-3 text-sm text-red-600">{erroExclusao}</p>}

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm max-w-3xl">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Nome</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">E-mail</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Nível de Acesso</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {usuarios.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">Nenhum usuário encontrado.</td>
              </tr>
            ) : (
              usuarios.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-800">{u.nome ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{u.email ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Badge variant={BADGE_VARIANT[u.role]}>{LABEL_ROLE[u.role]}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button onClick={() => abrirEdicao(u)} className="text-blue-600 hover:underline text-xs font-medium">
                        Editar
                      </button>
                      {u.id !== meuId && (
                        <button
                          onClick={() => handleExcluir(u)}
                          disabled={excluindoId === u.id}
                          className="text-red-600 hover:underline text-xs font-medium disabled:opacity-50"
                        >
                          {excluindoId === u.id ? "Excluindo..." : "Excluir"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalAberto && <UsuarioModal usuarioEditar={editando} onClose={() => setModalAberto(false)} />}
    </>
  );
}
