import { listarFornecedores } from "@/app/actions/fornecedores";
import { obterMeuPapel } from "@/app/actions/perfis";
import { FornecedoresTable } from "@/components/FornecedoresTable";
import { ThemeToggle } from "@/components/ThemeToggle";

export default async function FornecedoresPage() {
  const [result, role] = await Promise.all([listarFornecedores(), obterMeuPapel()]);
  const fornecedores = result.ok ? result.data : [];
  const isAdmin = role === "admin";

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Fornecedores</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Fornecedores de equipamentos e materiais.</p>
        </div>
        <ThemeToggle />
      </div>

      {!result.ok && <p className="mb-4 text-red-600 dark:text-red-400">{result.error}</p>}

      <FornecedoresTable fornecedores={fornecedores} podeAdicionar={isAdmin} podeEditar={isAdmin} />
    </main>
  );
}
