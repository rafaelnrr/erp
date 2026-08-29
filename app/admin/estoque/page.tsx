import { listarEstoquePreco } from "@/app/actions/estoque";
import { listarProdutos } from "@/app/actions/produtos";
import { obterMeuPapel } from "@/app/actions/perfis";
import { EstoqueTable } from "@/components/EstoqueTable";
import { ThemeToggle } from "@/components/ThemeToggle";

export default async function EstoquePage() {
  const [estoqueRes, produtosRes, role] = await Promise.all([listarEstoquePreco(), listarProdutos(), obterMeuPapel()]);

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Estoque & Preços</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Preço e quantidade disponível por produto e centro de distribuição.</p>
        </div>
        <ThemeToggle />
      </div>

      {!estoqueRes.ok && <p className="mb-4 text-red-600 dark:text-red-400">{estoqueRes.error}</p>}

      <EstoqueTable
        linhas={estoqueRes.data}
        produtos={produtosRes.ok ? produtosRes.data : []}
        isAdmin={role === "admin"}
      />
    </main>
  );
}
