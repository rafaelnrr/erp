import { obterMeuPapel } from "@/app/actions/perfis";
import { ImportacaoEmMassaClient } from "./ImportacaoEmMassaClient";

export default async function ImportacaoEmMassaPage() {
  const role = await obterMeuPapel();

  if (role !== "admin") {
    return (
      <main className="p-4 sm:p-6 lg:p-8">
        <p className="text-slate-600 dark:text-slate-400">
          Apenas administradores podem importar planilhas em massa.
        </p>
      </main>
    );
  }

  return <ImportacaoEmMassaClient />;
}
