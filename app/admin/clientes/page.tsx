import { listarClientes } from "@/app/actions/clientes";
import { obterMeuPapel } from "@/app/actions/perfis";
import { NovoClienteDrawer } from "@/components/NovoClienteDrawer";
import { ClientesTable } from "@/components/ClientesTable";
import { ThemeToggle } from "@/components/ThemeToggle";

export default async function ClientesPage() {
  const [result, role] = await Promise.all([listarClientes(), obterMeuPapel()]);
  const clientes = result.data as any[];
  const podeEditar = role === "admin" || role === "editor";

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Gestão de Clientes</h1>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <NovoClienteDrawer />
        </div>
      </div>

      <ClientesTable clientes={clientes} podeEditar={podeEditar} />
    </main>
  );
}
