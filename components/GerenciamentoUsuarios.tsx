"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { excluirUsuario, alternarStatusUsuario, type PerfilUsuario, type Role } from "@/app/actions/perfis";
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
  const [alternandoId, setAlternandoId] = useState<string | null>(null);
  const [erroStatus, setErroStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

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

  function handleAlternarStatus(u: PerfilUsuario) {
    const acao = u.ativo ? "desativar" : "ativar";
    if (!confirm(`Deseja ${acao} o acesso de ${u.email}?`)) return;
    setAlternandoId(u.id);
    setErroStatus(null);
    startTransition(async () => {
      const res = await alternarStatusUsuario(u.id, !u.ativo);
      setAlternandoId(null);
      if (res.error) {
        setErroStatus(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Gestão de Usuários e Permissões</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Controle de acesso baseado em papéis (RBAC).</p>
        </div>
        <Button onClick={abrirNovo}>+ Novo Usuário</Button>
      </div>

      {erroExclusao && <p className="mb-3 text-sm text-red-600 dark:text-red-400">{erroExclusao}</p>}
      {erroStatus && <p className="mb-3 text-sm text-red-600 dark:text-red-400">{erroStatus}</p>}

      <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm max-w-4xl">
        <table className="table-standard">
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Perfil</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">Nenhum usuário encontrado.</td>
              </tr>
            ) : (
              usuarios.map((u) => (
                <tr key={u.id}>
                  <td className="text-slate-800 dark:text-slate-200">{u.nome ?? "—"}</td>
                  <td className="text-slate-600 dark:text-slate-400">{u.email ?? "—"}</td>
                  <td>
                    <Badge variant={BADGE_VARIANT[u.role]}>{LABEL_ROLE[u.role]}</Badge>
                  </td>
                  <td>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        u.ativo
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                          : "bg-slate-100 text-slate-500 dark:bg-slate-700/50 dark:text-slate-400"
                      }`}
                    >
                      {u.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-3">
                      <button onClick={() => abrirEdicao(u)} className="text-amber-600 dark:text-amber-500 hover:underline text-xs font-medium">
                        Editar
                      </button>
                      {u.id !== meuId && (
                        <>
                          <button
                            onClick={() => handleAlternarStatus(u)}
                            disabled={isPending && alternandoId === u.id}
                            className="text-slate-600 dark:text-slate-400 hover:underline text-xs font-medium disabled:opacity-50"
                          >
                            {isPending && alternandoId === u.id ? "..." : u.ativo ? "Desativar" : "Ativar"}
                          </button>
                          <button
                            onClick={() => handleExcluir(u)}
                            disabled={excluindoId === u.id}
                            className="text-red-600 dark:text-red-400 hover:underline text-xs font-medium disabled:opacity-50"
                          >
                            {excluindoId === u.id ? "Excluindo..." : "Excluir"}
                          </button>
                        </>
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
