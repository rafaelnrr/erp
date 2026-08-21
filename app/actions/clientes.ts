"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function criarCliente(formData: FormData) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) return { error: "Não autorizado" };
  const vendedorId = authData.user.id;

  const nome = formData.get("nome") as string;
  const documento = formData.get("documento") as string;
  const consumo = Number(formData.get("consumo_kwh_mes"));

  const cep = (formData.get("cep") as string) || null;
  const rua = (formData.get("rua") as string) || null;
  const numero = (formData.get("numero") as string) || null;
  const bairro = (formData.get("bairro") as string) || null;
  const cidade = (formData.get("cidade") as string) || null;
  const uf = (formData.get("uf") as string) || null;
  const zona = (formData.get("zona") as string) || "urbana";
  const concessionaria = (formData.get("concessionaria") as string) || null;
  const tipoTelhado = (formData.get("tipo_telhado") as string) || null;
  const estruturaTelhado = (formData.get("estrutura_telhado") as string) || null;
  const observacoes = (formData.get("observacoes") as string) || null;

  const { data: cliente, error } = await supabase
    .from("clientes")
    .insert({
      vendedor_id: vendedorId,
      nome,
      documento,
      consumo_kwh_mes: consumo,
      cep,
      rua,
      numero,
      bairro,
      cidade,
      uf,
      zona,
      concessionaria,
      tipo_telhado: tipoTelhado,
      estrutura_telhado: estruturaTelhado,
      observacoes,
    })
    .select("id")
    .single();

  if (error || !cliente) return { error: error?.message ?? "Falha ao criar cliente." };

  // Upload da fatura (opcional, arquivo único)
  const fatura = formData.get("fatura") as File | null;
  if (fatura && fatura.size > 0) {
    const path = `${vendedorId}/${cliente.id}/fatura-${Date.now()}-${fatura.name}`;
    const { error: errUpload } = await supabase.storage.from("faturas").upload(path, fatura);
    if (!errUpload) {
      await supabase.from("clientes").update({ fatura_path: path }).eq("id", cliente.id);
    }
  }

  // Upload das fotos de Site Survey (múltiplas, cada uma com descrição)
  const fotos = formData.getAll("foto_arquivo") as File[];
  const descricoes = formData.getAll("foto_descricao") as string[];

  for (let i = 0; i < fotos.length; i++) {
    const foto = fotos[i];
    const descricao = descricoes[i] ?? "";
    if (!foto || foto.size === 0 || !descricao.trim()) continue;

    const path = `${vendedorId}/${cliente.id}/survey-${Date.now()}-${i}-${foto.name}`;
    const { error: errUpload } = await supabase.storage.from("site-survey").upload(path, foto);
    if (!errUpload) {
      await supabase.from("cliente_fotos_survey").insert({
        cliente_id: cliente.id,
        storage_path: path,
        descricao: descricao.trim(),
      });
    }
  }

  revalidatePath("/admin/clientes");
  return { success: true };
}

export async function listarClientes() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("clientes").select("*").order("nome", { ascending: true });

  return { ok: !error, data: data || [], error: error?.message };
}

export async function listarValoresDistintos(coluna: "tipo_telhado" | "estrutura_telhado") {
  const supabase = await createClient();
  const { data, error } = await supabase.from("clientes").select(coluna).not(coluna, "is", null);

  if (error) return [];
  const valores = new Set((data as any[]).map((r) => r[coluna]).filter(Boolean));
  return Array.from(valores) as string[];
}
