import { listarClientes } from "@/app/actions/clientes";
import { obterMeuPapel } from "@/app/actions/perfis";
import { createClient } from "@/utils/supabase/server";
import { NovoClienteDrawer } from "@/components/NovoClienteDrawer";
import { ClientesTable } from "@/components/ClientesTable";
import { ThemeToggle } from "@/components/ThemeToggle";

export default async function ClientesPage() {
  const supabase = await createClient();
  const [result, role, { data: authData }] = await Promise.all([
    listarClientes(),
    obterMeuPapel(),
    supabase.auth.getUser(),
  ]);
  const clientes = result.data as any[];
  const isAdmin = role === "admin";
  const isEditor = role === "editor";
  const meuId = authData.user?.id ?? null;

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Gestão de Clientes</h1>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {(isAdmin || isEditor) && <NovoClienteDrawer />}
        </div>
      </div>

      <ClientesTable clientes={clientes} isAdmin={isAdmin} isEditor={isEditor} meuId={meuId} />
    </main>
  );
}
