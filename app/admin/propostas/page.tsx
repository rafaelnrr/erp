import Link from "next/link";
import { listarPropostas } from "@/app/actions/propostas";
import { obterMeuPapel } from "@/app/actions/perfis";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PropostasTable } from "@/components/PropostasTable";

export default async function PropostasPage() {
  const [result, role] = await Promise.all([listarPropostas(), obterMeuPapel()]);
  const propostas = result.data;
  const podeEditar = role === "admin" || role === "editor";

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
          {podeEditar && (
            <Link href="/admin/propostas/novo" className="btn-primary">
              + Nova Proposta
            </Link>
          )}
        </div>
      </div>

      <PropostasTable propostas={propostas} podeEditar={podeEditar} />
    </main>
  );
}
