import Link from "next/link";
import { listarPropostas } from "@/app/actions/propostas";
import { obterMeuPapel } from "@/app/actions/perfis";
import { createClient } from "@/utils/supabase/server";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PropostasTable } from "@/components/PropostasTable";

export default async function PropostasPage() {
  const supabase = await createClient();
  const [result, role, { data: authData }] = await Promise.all([
    listarPropostas(),
    obterMeuPapel(),
    supabase.auth.getUser(),
  ]);
  const propostas = result.data;
  const isAdmin = role === "admin";
  const isEditor = role === "editor";
  const meuId = authData.user?.id ?? null;
  const podeCriar = isAdmin || isEditor;

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Orçamentos e Propostas</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Escolha um cliente e monte a proposta — o dimensionamento pode ser feito dentro dela.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {podeCriar && (
            <Link href="/admin/propostas/novo" className="btn-primary">
              + Nova Proposta
            </Link>
          )}
        </div>
      </div>

      <PropostasTable propostas={propostas} isAdmin={isAdmin} isEditor={isEditor} meuId={meuId} />
    </main>
  );
}
