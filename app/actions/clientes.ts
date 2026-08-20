"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function criarCliente(formData: FormData) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  
  if (!authData.user) return { error: "Não autorizado" };

  const nome = formData.get("nome") as string;
  const documento = formData.get("documento") as string;
  const consumo = Number(formData.get("consumo_kwh_mes"));

  const { error } = await supabase.from("clientes").insert({
    vendedor_id: authData.user.id,
    nome,
    documento,
    consumo_kwh_mes: consumo,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/clientes");
  return { success: true };
}

export async function listarClientes() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .order("nome", { ascending: true });

  return { ok: !error, data: data || [], error: error?.message };
}
