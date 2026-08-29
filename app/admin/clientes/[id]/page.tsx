import Link from "next/link";
import { notFound } from "next/navigation";
import { buscarClienteCompleto } from "@/app/actions/clientes";
import { obterMeuPapel } from "@/app/actions/perfis";
import { createClient } from "@/utils/supabase/server";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NovoClienteDrawer } from "@/components/NovoClienteDrawer";
import { ArrowLeft, Download, FileText } from "lucide-react";

const LABEL_ZONA: Record<string, string> = { urbana: "Urbana", rural: "Rural" };
const LABEL_GRUPO: Record<string, string> = { A: "Grupo A (Alta Tensão)", B: "Grupo B (Baixa Tensão)" };
const LABEL_MODALIDADE: Record<string, string> = { verde: "Verde", azul: "Azul" };

function Campo({ label, valor }: { label: string; valor: string | number | null | undefined }) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className="text-sm text-slate-800 dark:text-slate-200 mt-0.5">{valor || valor === 0 ? valor : "—"}</p>
    </div>
  );
}

function Painel({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="panel p-5">
      <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-4">{titulo}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

export default async function PerfilClientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [completo, role, { data: authData }] = await Promise.all([
    buscarClienteCompleto(id),
    obterMeuPapel(),
    supabase.auth.getUser(),
  ]);
  if (!completo) notFound();

  const { cliente: c, faturaUrl, fotos } = completo;
  const temAnexos = !!faturaUrl || fotos.length > 0;
  const dono = authData.user?.id != null && c.vendedor_id === authData.user.id;
  const podeEditar = role === "admin" || (role === "editor" && dono);

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/admin/clientes"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-500 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para Clientes
          </Link>
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">{c.nome}</h1>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {podeEditar && <NovoClienteDrawer cliente={c as any} />}
          <a
            href={`/api/clientes/${id}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary bg-slate-700 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white inline-flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Gerar Relatório em PDF
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Painel titulo="Dados Pessoais / Empresariais">
          <Campo label="Nome / Razão Social" valor={c.nome} />
          <Campo label="CPF / CNPJ" valor={c.documento} />
          <Campo label="Consumo Médio" valor={c.consumo_kwh_mes != null ? `${c.consumo_kwh_mes} kWh/mês` : null} />
          <Campo label="Zona" valor={LABEL_ZONA[c.zona] ?? c.zona} />
          <Campo label="Concessionária" valor={c.concessionaria} />
        </Painel>

        <Painel titulo="Endereço">
          <Campo label="CEP" valor={c.cep} />
          <Campo label="Rua" valor={c.rua} />
          <Campo label="Número" valor={c.numero} />
          <Campo label="Bairro" valor={c.bairro} />
          <Campo label="Cidade" valor={c.cidade} />
          <Campo label="UF" valor={c.uf} />
        </Painel>

        <Painel titulo="Dados Técnicos">
          <Campo label="Tipo de Telhado" valor={c.tipo_telhado} />
          <Campo label="Estrutura do Telhado" valor={c.estrutura_telhado} />
          <Campo label="Grupo Tarifário" valor={LABEL_GRUPO[c.grupo_tarifario] ?? c.grupo_tarifario} />
          {c.grupo_tarifario === "B" && (
            <>
              <Campo label="Classe" valor={c.classe_b} />
              <Campo label="Tarifa TE+TUSD (R$/kWh)" valor={c.tarifa_kwh} />
            </>
          )}
          {c.grupo_tarifario === "A" && (
            <>
              <Campo label="Subgrupo" valor={c.subgrupo_a} />
              <Campo label="Modalidade" valor={LABEL_MODALIDADE[c.modalidade_tarifaria_a] ?? c.modalidade_tarifaria_a} />
              <Campo label="Tarifa Ponta (R$/kWh)" valor={c.tarifa_kwh_ponta} />
              <Campo label="Tarifa Fora Ponta (R$/kWh)" valor={c.tarifa_kwh_fora_ponta} />
            </>
          )}
        </Painel>

        {c.observacoes && (
          <div className="panel p-5">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-3">Observações</h2>
            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{c.observacoes}</p>
          </div>
        )}
      </div>

      <div className="mt-5 panel p-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-4">Anexos e Site Survey</h2>

        {!temAnexos ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Nenhuma fatura ou foto anexada para este cliente.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {faturaUrl && (
              <a
                href={faturaUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="group relative block rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 aspect-square bg-slate-100 dark:bg-slate-800"
              >
                <img src={faturaUrl} alt="Fatura de energia" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1.5 text-xs font-bold text-white bg-black/70 px-3 py-1.5 rounded-full">
                    <Download className="w-3.5 h-3.5" />
                    Baixar Foto
                  </span>
                </div>
                <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[11px] px-2 py-1 truncate">Fatura de energia</span>
              </a>
            )}
            {fotos.map(
              (foto) =>
                foto.url && (
                  <a
                    key={foto.id}
                    href={foto.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="group relative block rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 aspect-square bg-slate-100 dark:bg-slate-800"
                  >
                    <img src={foto.url} alt={foto.descricao} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1.5 text-xs font-bold text-white bg-black/70 px-3 py-1.5 rounded-full">
                        <Download className="w-3.5 h-3.5" />
                        Baixar Foto
                      </span>
                    </div>
                    <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[11px] px-2 py-1 truncate">{foto.descricao}</span>
                  </a>
                )
            )}
          </div>
        )}
      </div>
    </main>
  );
}
