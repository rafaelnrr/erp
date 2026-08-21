"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { criarUsuario, atualizarRoleUsuario, type PerfilUsuario, type Role } from "@/app/actions/perfis";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface UsuarioModalProps {
  usuarioEditar?: PerfilUsuario | null;
  onClose: () => void;
}

export function UsuarioModal({ usuarioEditar, onClose }: UsuarioModalProps) {
  const router = useRouter();
  const editando = !!usuarioEditar;

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState(usuarioEditar?.email ?? "");
  const [senha, setSenha] = useState("");
  const [role, setRole] = useState<Role>(usuarioEditar?.role ?? "editor");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSalvar() {
    setSalvando(true);
    setErro(null);

    if (editando) {
      const res = await atualizarRoleUsuario(usuarioEditar!.id, role);
      setSalvando(false);
      if (res.error) return setErro(res.error);
    } else {
      if (!nome.trim() || !email.trim() || !senha) {
        setSalvando(false);
        return setErro("Preencha nome, e-mail e senha.");
      }
      const res = await criarUsuario({ nome: nome.trim(), email: email.trim(), senha, role });
      setSalvando(false);
      if (res.error) return setErro(res.error);
    }

    router.refresh();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h3 className="font-semibold text-slate-800 mb-4">{editando ? "Editar Usuário" : "Novo Usuário"}</h3>

        <div className="flex flex-col gap-3">
          {!editando && (
            <>
              <div>
                <label className="mb-1 block text-xs text-slate-500">Nome</label>
                <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome completo" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-500">E-mail</label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@empresa.com" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-500">Senha</label>
                <Input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Senha provisória" />
              </div>
            </>
          )}
          {editando && (
            <div>
              <label className="mb-1 block text-xs text-slate-500">E-mail</label>
              <Input value={email} disabled />
            </div>
          )}
          <div>
            <label className="mb-1 block text-xs text-slate-500">Nível de Acesso</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
            >
              <option value="visualizador">Visualizador</option>
              <option value="editor">Editor</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
        </div>

        {erro && <p className="mt-3 text-xs text-red-600">{erro}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSalvar} disabled={salvando}>
            {salvando ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
