"use client";

import { useState } from "react";
import { atualizarRoleUsuario } from "@/app/actions/perfis";

export function RoleUsuarioSelect({ id, roleAtual }: { id: string; roleAtual: "admin" | "comercial" }) {
  const [role, setRole] = useState(roleAtual);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleChange(novoRole: "admin" | "comercial") {
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
        onChange={(e) => handleChange(e.target.value as "admin" | "comercial")}
        className={`rounded-full px-3 py-1 text-xs font-medium border-0 outline-none cursor-pointer ${
          role === "admin" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-700"
        }`}
      >
        <option value="comercial">Comercial</option>
        <option value="admin">Administrador</option>
      </select>
      {erro && <p className="mt-1 text-[11px] text-red-600">{erro}</p>}
    </div>
  );
}
