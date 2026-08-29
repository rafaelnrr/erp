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

  const grupoTarifario = (formData.get("grupo_tarifario") as string) || null;
  const classeB = (formData.get("classe_b") as string) || null;
  const subgrupoA = (formData.get("subgrupo_a") as string) || null;
  const modalidadeTarifariaA = (formData.get("modalidade_tarifaria_a") as string) || null;
  const tarifaKwh = formData.get("tarifa_kwh") ? Number(formData.get("tarifa_kwh")) : null;
  const tarifaKwhPonta = formData.get("tarifa_kwh_ponta") ? Number(formData.get("tarifa_kwh_ponta")) : null;
  const tarifaKwhForaPonta = formData.get("tarifa_kwh_fora_ponta") ? Number(formData.get("tarifa_kwh_fora_ponta")) : null;

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
      grupo_tarifario: grupoTarifario as any,
      classe_b: classeB as any,
      subgrupo_a: subgrupoA as any,
      modalidade_tarifaria_a: modalidadeTarifariaA as any,
      tarifa_kwh: tarifaKwh,
      tarifa_kwh_ponta: tarifaKwhPonta,
      tarifa_kwh_fora_ponta: tarifaKwhForaPonta,
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

export async function editarCliente(id: string, formData: FormData) {
  const supabase = await createClient();

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

  const grupoTarifario = (formData.get("grupo_tarifario") as string) || null;
  const classeB = (formData.get("classe_b") as string) || null;
  const subgrupoA = (formData.get("subgrupo_a") as string) || null;
  const modalidadeTarifariaA = (formData.get("modalidade_tarifaria_a") as string) || null;
  const tarifaKwh = formData.get("tarifa_kwh") ? Number(formData.get("tarifa_kwh")) : null;
  const tarifaKwhPonta = formData.get("tarifa_kwh_ponta") ? Number(formData.get("tarifa_kwh_ponta")) : null;
  const tarifaKwhForaPonta = formData.get("tarifa_kwh_fora_ponta") ? Number(formData.get("tarifa_kwh_fora_ponta")) : null;

  const { error } = await supabase
    .from("clientes")
    .update({
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
      grupo_tarifario: grupoTarifario as any,
      classe_b: classeB as any,
      subgrupo_a: subgrupoA as any,
      modalidade_tarifaria_a: modalidadeTarifariaA as any,
      tarifa_kwh: tarifaKwh,
      tarifa_kwh_ponta: tarifaKwhPonta,
      tarifa_kwh_fora_ponta: tarifaKwhForaPonta,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  const fatura = formData.get("fatura") as File | null;
  if (fatura && fatura.size > 0) {
    const { data: authData } = await supabase.auth.getUser();
    const path = `${authData.user?.id}/${id}/fatura-${Date.now()}-${fatura.name}`;
    const { error: errUpload } = await supabase.storage.from("faturas").upload(path, fatura);
    if (!errUpload) {
      await supabase.from("clientes").update({ fatura_path: path }).eq("id", id);
    }
  }

  revalidatePath("/admin/clientes");
  return { success: true };
}

/** Exclui um cliente. O banco bloqueia (erro de FK) se houver propostas/dimensionamentos vinculados. */
export async function excluirCliente(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("clientes").delete().eq("id", id).select("id");

  if (error) {
    if (error.code === "23503") {
      return { error: "Não é possível excluir: este cliente possui propostas ou dimensionamentos vinculados." };
    }
    return { error: error.message };
  }
  if (!data || data.length === 0) {
    return { error: "Não foi possível excluir: você não tem permissão para excluir este cliente." };
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

export interface FotoSurveyAssinada {
  id: string;
  descricao: string;
  url: string | null;
}

export interface ClienteCompleto {
  cliente: Record<string, any>;
  faturaUrl: string | null;
  fotos: FotoSurveyAssinada[];
}

const VALIDADE_URL_ASSINADA_SEG = 60 * 60; // 1h — só para exibir/baixar na tela, não é link permanente

/** Busca o cliente com URLs assinadas (temporárias) para a fatura e as fotos de survey. RLS decide o que é visível. */
export async function buscarClienteCompleto(id: string): Promise<ClienteCompleto | null> {
  const supabase = await createClient();

  const { data: cliente, error } = await supabase.from("clientes").select("*").eq("id", id).single();
  if (error || !cliente) return null;

  const { data: fotosRaw } = await supabase
    .from("cliente_fotos_survey")
    .select("id, descricao, storage_path")
    .eq("cliente_id", id)
    .order("created_at", { ascending: true });

  let faturaUrl: string | null = null;
  if (cliente.fatura_path) {
    const { data } = await supabase.storage.from("faturas").createSignedUrl(cliente.fatura_path, VALIDADE_URL_ASSINADA_SEG);
    faturaUrl = data?.signedUrl ?? null;
  }

  const fotos: FotoSurveyAssinada[] = [];
  for (const foto of fotosRaw ?? []) {
    const { data } = await supabase.storage.from("site-survey").createSignedUrl(foto.storage_path, VALIDADE_URL_ASSINADA_SEG);
    fotos.push({ id: foto.id, descricao: foto.descricao, url: data?.signedUrl ?? null });
  }

  return { cliente, faturaUrl, fotos };
}
