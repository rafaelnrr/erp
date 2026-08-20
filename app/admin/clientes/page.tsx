import { criarCliente, listarClientes } from "@/app/actions/clientes";

export default async function ClientesPage() {
  const result = await listarClientes();
  const clientes = result.data;

  return (
    <main className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Gestão de Clientes</h1>
      </div>

      <div className="flex gap-8">
        <form action={criarCliente} className="w-1/3 flex flex-col gap-4 rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="font-medium">Novo Cliente</h2>
          <input
            name="nome"
            placeholder="Nome Completo"
            required
            className="rounded border p-2 text-sm"
          />
          <input
            name="documento"
            placeholder="CPF ou CNPJ"
            className="rounded border p-2 text-sm"
          />
          <input
            name="consumo_kwh_mes"
            type="number"
            placeholder="Consumo Médio (kWh/mês)"
            required
            className="rounded border p-2 text-sm"
          />
          <button type="submit" className="mt-2 rounded bg-blue-600 p-2 text-sm font-semibold text-white hover:bg-blue-700">
            Cadastrar Cliente
          </button>
        </form>

        <div className="w-2/3 overflow-hidden rounded-lg border bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Nome</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Documento</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Consumo (kWh)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {clientes.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                    Nenhum cliente cadastrado.
                  </td>
                </tr>
              ) : (
                clientes.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{c.nome}</td>
                    <td className="px-4 py-3 text-gray-600">{c.documento || "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{c.consumo_kwh_mes}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
