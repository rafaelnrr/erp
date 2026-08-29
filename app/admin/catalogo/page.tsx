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
      <main className="p-4 sm:p-6 lg:p-8">
        <p className="text-red-600 dark:text-red-400">{result.error}</p>
      </main>
    );
  }

  const produtos = result.data;

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Catálogo de Produtos</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Gerencie módulos, inversores e componentes</p>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link href="/admin/produtos/novo" className="btn-primary">
            + Novo Produto
          </Link>
        </div>
      </div>

      {produtos.length === 0 ? (
        <p className="text-slate-500 dark:text-slate-400">
          Nenhum produto cadastrado ainda. Importe uma planilha Excel para
          começar.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="table-standard">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Categoria</th>
                <th>Fabricante</th>
                <th>Modelo</th>
                <th>Potência (W)</th>
                <th>MPPT</th>
                <th>Fases</th>
              </tr>
            </thead>
            <tbody>
              {produtos.map((p) => {
                const attrs = (p.atributos as Record<string, any>) || {};
                return (
                  <tr key={p.id}>
                    <td className="font-mono text-xs">{p.sku}</td>
                    <td>
                      <span className="rounded-full bg-blue-50 dark:bg-blue-500/20 px-2 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-400">
                        {LABEL_CATEGORIA[p.categoria as keyof typeof LABEL_CATEGORIA]}
                      </span>
                    </td>
                    <td>{p.fabricantes?.nome ?? "—"}</td>
                    <td>{attrs.modelo ?? "—"}</td>
                    <td>{attrs.potencia_w ?? "—"}</td>
                    <td>{attrs.num_mppt ?? "—"}</td>
                    <td>{attrs.num_fases ?? "—"}</td>
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
