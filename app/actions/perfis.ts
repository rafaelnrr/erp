"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export interface PerfilUsuario {
  id: string;
  email: string | null;
  role: "admin" | "comercial";
}

export async function listarUsuarios() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("perfis").select("id, email, role").order("email", { ascending: true });

  return { ok: !error, data: (data as PerfilUsuario[]) || [], error: error?.message };
}

export async function atualizarRoleUsuario(id: string, role: "admin" | "comercial") {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (authData.user?.id === id && role === "comercial") {
    return { error: "Você não pode remover seu próprio acesso de administrador." };
  }

  const { error } = await supabase.from("perfis").update({ role }).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/configuracoes");
  return { success: true };
}
