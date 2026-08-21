"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export type Role = "admin" | "editor" | "visualizador";

export interface PerfilUsuario {
  id: string;
  email: string | null;
  role: Role;
}

export async function listarUsuarios() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("perfis").select("id, email, role").order("email", { ascending: true });

  return { ok: !error, data: (data as PerfilUsuario[]) || [], error: error?.message };
}

export async function atualizarRoleUsuario(id: string, role: Role) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (authData.user?.id === id && role !== "admin") {
    return { error: "Você não pode remover seu próprio acesso de administrador." };
  }

  const { error } = await supabase.from("perfis").update({ role }).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/configuracoes");
  return { success: true };
}

/** Papel do usuário logado — usado pelo frontend pra habilitar/ocultar controles de escrita. */
export async function obterMeuPapel() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return null;

  const { data } = await supabase.from("perfis").select("role").eq("id", authData.user.id).single();
  return (data?.role as Role) ?? null;
}
