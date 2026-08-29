import { listarClientes } from "@/app/actions/clientes";
import { NovoClienteDrawer } from "@/components/NovoClienteDrawer";
import { ThemeToggle } from "@/components/ThemeToggle";

export default async function ClientesPage() {
  const result = await listarClientes();
  const clientes = result.data as any[];

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Gestão de Clientes</h1>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <NovoClienteDrawer />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Nome</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Documento</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Consumo (kWh)</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Cidade/UF</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Zona</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {clientes.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  Nenhum cliente cadastrado.
                </td>
              </tr>
            ) : (
              clientes.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{c.nome}</td>
                  <td className="px-4 py-3 text-gray-600">{c.documento || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{c.consumo_kwh_mes}</td>
                  <td className="px-4 py-3 text-gray-600">{c.cidade ? `${c.cidade}/${c.uf ?? "—"}` : "—"}</td>
                  <td className="px-4 py-3 text-gray-600 capitalize">{c.zona ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
