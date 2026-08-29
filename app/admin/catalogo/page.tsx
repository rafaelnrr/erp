import Link from "next/link";
import { listarProdutos, type Produto } from "@/app/actions/produtos";
import { ThemeToggle } from "@/components/ThemeToggle";

const LABEL_CATEGORIA: Record<Produto["categoria"], string> = {
  modulo: "Módulo",
  inversor: "Inversor",
  estrutura: "Estrutura",
  string_box: "String Box",
  cabo: "Cabo",
  acessorio: "Acessório",
};

export default async function CatalogoPage() {
  const result = await listarProdutos();

  if (!result.ok) {
    return (
      <main className="p-8">
        <p className="text-red-600">{result.error}</p>
      </main>
    );
  }

  const produtos = result.data;

  return (
    <main className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Catálogo de Produtos</h1>
          <p className="text-sm text-gray-500">Gerencie módulos, inversores e componentes</p>
        </div>
        <Link
          href="/admin/produtos/novo"
          className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          + Novo Produto
        </Link>
      </div>

      {produtos.length === 0 ? (
        <p className="text-gray-500">
          Nenhum produto cadastrado ainda. Importe uma planilha Excel para
          começar.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">SKU</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Categoria</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Fabricante</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Modelo</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Potência (W)</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">MPPT</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Fases</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {produtos.map((p) => {
                const attrs = p.atributos as Record<string, any> || {};
                return (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{p.sku}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                        {LABEL_CATEGORIA[p.categoria as keyof typeof LABEL_CATEGORIA]}
                      </span>
                    </td>
                    <td className="px-4 py-3">{p.fabricantes?.nome ?? "—"}</td>
                    <td className="px-4 py-3">{attrs.modelo ?? "—"}</td>
                    <td className="px-4 py-3">{attrs.potencia_w ?? "—"}</td>
                    <td className="px-4 py-3">{attrs.num_mppt ?? "—"}</td>
                    <td className="px-4 py-3">{attrs.num_fases ?? "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
