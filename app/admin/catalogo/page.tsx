import Link from "next/link";
import { listarProdutos, type Produto } from "@/app/actions/produtos";
import { obterMeuPapel } from "@/app/actions/perfis";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ExcluirProdutoButton } from "@/components/ExcluirProdutoButton";

const LABEL_CATEGORIA: Record<Produto["categoria"], string> = {
  modulo: "Módulo",
  inversor: "Inversor",
  estrutura: "Estrutura",
  string_box: "String Box",
  cabo: "Cabo",
  acessorio: "Acessório",
};

export default async function CatalogoPage() {
  const [result, role] = await Promise.all([listarProdutos(), obterMeuPapel()]);
  const isAdmin = role === "admin";

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
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {isAdmin && (
            <Link
              href="/admin/importar"
              className="btn-primary bg-slate-700 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white"
            >
              Importação em Massa
            </Link>
          )}
          <Link href="/admin/produtos/novo" className="btn-primary">
            + Novo Produto
          </Link>
        </div>
      </div>

      {produtos.length === 0 ? (
        <div className="text-slate-500 dark:text-slate-400">
          <p>Nenhum produto cadastrado ainda.</p>
          {isAdmin && <p className="mt-1">Importe uma planilha Excel para começar, ou cadastre manualmente.</p>}
        </div>
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
                {isAdmin && <th className="text-right">Ações</th>}
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
                    {isAdmin && (
                      <td>
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/produtos/${p.id}/editar`}
                            title="Editar produto"
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </Link>
                          <ExcluirProdutoButton id={p.id} sku={p.sku} />
                        </div>
                      </td>
                    )}
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
