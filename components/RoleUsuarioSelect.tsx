"use client";

import { useState } from "react";
import { atualizarRoleUsuario, type Role } from "@/app/actions/perfis";

const CORES: Record<Role, string> = {
  admin: "bg-purple-100 text-purple-700",
  editor: "bg-blue-100 text-blue-700",
  visualizador: "bg-gray-100 text-gray-600",
};

export function RoleUsuarioSelect({ id, roleAtual }: { id: string; roleAtual: Role }) {
  const [role, setRole] = useState(roleAtual);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleChange(novoRole: Role) {
    setSalvando(true);
    setErro(null);
    const anterior = role;
    setRole(novoRole);
    const res = await atualizarRoleUsuario(id, novoRole);
    setSalvando(false);
    if (res.error) {
      setRole(anterior);
      setErro(res.error);
    }
  }

  return (
    <div>
      <select
        value={role}
        disabled={salvando}
        onChange={(e) => handleChange(e.target.value as Role)}
        className={`rounded-full px-3 py-1 text-xs font-medium border-0 outline-none cursor-pointer ${CORES[role]}`}
      >
        <option value="visualizador">Visualizador</option>
        <option value="editor">Editor</option>
        <option value="admin">Administrador</option>
      </select>
      {erro && <p className="mt-1 text-[11px] text-red-600">{erro}</p>}
    </div>
  );
}
