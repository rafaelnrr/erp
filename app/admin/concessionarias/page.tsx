import { listarConcessionarias } from "@/app/actions/concessionarias";
import { obterMeuPapel } from "@/app/actions/perfis";
import { ConcessionariasTable } from "@/components/ConcessionariasTable";
import { ThemeToggle } from "@/components/ThemeToggle";

export default async function ConcessionariasPage() {
  const [result, role] = await Promise.all([listarConcessionarias(), obterMeuPapel()]);
  const concessionarias = result.ok ? result.data : [];
  const isAdmin = role === "admin";
  const isEditor = role === "editor";

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Concessionárias</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Distribuidoras de energia usadas no cadastro de clientes.</p>
        </div>
        <ThemeToggle />
      </div>

      {!result.ok && <p className="mb-4 text-red-600 dark:text-red-400">{result.error}</p>}

      <ConcessionariasTable concessionarias={concessionarias} podeAdicionar={isAdmin || isEditor} podeEditar={isAdmin} />
    </main>
  );
}
