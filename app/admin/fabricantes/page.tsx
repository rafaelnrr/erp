import { listarFabricantes } from "@/app/actions/fabricantes";
import { obterMeuPapel } from "@/app/actions/perfis";
import { FabricantesTable } from "@/components/FabricantesTable";
import { ThemeToggle } from "@/components/ThemeToggle";

export default async function FabricantesPage() {
  const [result, role] = await Promise.all([listarFabricantes(), obterMeuPapel()]);
  const fabricantes = result.ok ? result.data : [];

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Fabricantes</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Marcas usadas nos produtos do catálogo.</p>
        </div>
        <ThemeToggle />
      </div>

      {!result.ok && <p className="mb-4 text-red-600 dark:text-red-400">{result.error}</p>}

      <FabricantesTable fabricantes={fabricantes} isAdmin={role === "admin"} />
    </main>
  );
}
