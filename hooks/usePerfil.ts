"use client";

import { useEffect, useState } from "react";
import { obterMeuPapel, type Role } from "@/app/actions/perfis";

export function usePerfil() {
  const [role, setRole] = useState<Role | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    obterMeuPapel().then((r) => {
      setRole(r);
      setCarregando(false);
    });
  }, []);

  return {
    role,
    carregando,
    podeEditar: role === "admin" || role === "editor",
    isAdmin: role === "admin",
  };
}
