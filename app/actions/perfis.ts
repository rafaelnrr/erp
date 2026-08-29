"use server";

import { createClient } from "@/utils/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

export type Role = "admin" | "editor" | "visualizador";

export interface PerfilUsuario {
  id: string;
  nome: string | null;
  email: string | null;
  role: Role;
  ativo: boolean;
}

export async function listarUsuarios() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("perfis").select("id, nome, email, role").order("email", { ascending: true });

  if (error || !data) return { ok: false, data: [] as PerfilUsuario[], error: error?.message };

  const admin = clienteAdmin();
  let banidos = new Set<string>();
  if (admin) {
    // pagina até 1000 usuários (suficiente para o tamanho de equipe deste ERP); status é best-effort
    const { data: listaAuth } = await admin.auth.admin.listUsers({ perPage: 1000 });
    banidos = new Set(
      (listaAuth?.users ?? [])
        .filter((u) => u.banned_until && new Date(u.banned_until) > new Date())
        .map((u) => u.id)
    );
  }

  const usuarios: PerfilUsuario[] = data.map((u) => ({ ...(u as Omit<PerfilUsuario, "ativo">), ativo: !banidos.has(u.id) }));
  return { ok: true, data: usuarios, error: undefined };
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

function clienteAdmin() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!serviceRoleKey || !supabaseUrl) return null;
  return createSupabaseClient(supabaseUrl, serviceRoleKey);
}

const ERRO_SEM_SERVICE_ROLE =
  "Esta ação requer a variável SUPABASE_SERVICE_ROLE_KEY configurada no servidor — ainda não está definida neste ambiente.";

/** Cria um usuário de verdade (auth + perfil). Requer SUPABASE_SERVICE_ROLE_KEY. */
export async function criarUsuario(input: { nome: string; email: string; senha: string; role: Role }) {
  const meuPapel = await obterMeuPapel();
  if (meuPapel !== "admin") return { error: "Apenas administradores podem criar usuários." };

  const admin = clienteAdmin();
  if (!admin) return { error: ERRO_SEM_SERVICE_ROLE };

  const { data, error } = await admin.auth.admin.createUser({
    email: input.email,
    password: input.senha,
    email_confirm: true,
    user_metadata: { nome: input.nome },
  });
  if (error || !data.user) return { error: error?.message ?? "Falha ao criar usuário." };

  // o trigger handle_new_user já cria a linha em perfis com role 'editor' e o nome;
  // ajusta pro papel escolhido no formulário
  const supabase = await createClient();
  await supabase.from("perfis").update({ role: input.role, nome: input.nome }).eq("id", data.user.id);

  revalidatePath("/admin/configuracoes");
  return { success: true as const };
}

/** Exclui um usuário de verdade (perfil + auth). Requer SUPABASE_SERVICE_ROLE_KEY. */
export async function excluirUsuario(id: string) {
  const meuPapel = await obterMeuPapel();
  if (meuPapel !== "admin") return { error: "Apenas administradores podem excluir usuários." };

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (authData.user?.id === id) return { error: "Você não pode excluir sua própria conta." };

  const admin = clienteAdmin();
  if (!admin) return { error: ERRO_SEM_SERVICE_ROLE };

  const { error: errPerfil } = await supabase.from("perfis").delete().eq("id", id);
  if (errPerfil) return { error: errPerfil.message };

  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) return { error: error.message };

  revalidatePath("/admin/configuracoes");
  return { success: true as const };
}

/** Ativa/desativa o login do usuário sem excluir a conta. Requer SUPABASE_SERVICE_ROLE_KEY. */
export async function alternarStatusUsuario(id: string, ativar: boolean) {
  const meuPapel = await obterMeuPapel();
  if (meuPapel !== "admin") return { error: "Apenas administradores podem ativar/desativar usuários." };

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (authData.user?.id === id) return { error: "Você não pode desativar sua própria conta." };

  const admin = clienteAdmin();
  if (!admin) return { error: ERRO_SEM_SERVICE_ROLE };

  const { error } = await admin.auth.admin.updateUserById(id, {
    ban_duration: ativar ? "none" : "876000h",
  });
  if (error) return { error: error.message };

  revalidatePath("/admin/configuracoes");
  return { success: true as const };
}
