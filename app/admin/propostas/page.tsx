import Link from "next/link";
import { listarPropostas } from "@/app/actions/propostas";
import { StatusPropostaSelect } from "@/components/StatusPropostaSelect";
import { obterMeuPapel } from "@/app/actions/perfis";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PropostaActions } from "@/components/PropostaActions";

const LABEL_STATUS: Record<string, string> = {
  gerada: "Gerada",
  enviada: "Enviada",
  aceita: "Aceita",
  recusada: "Recusada",
  expirada: "Expirada",
};

export default async function PropostasPage() {
  const [result, role] = await Promise.all([listarPropostas(), obterMeuPapel()]);
  const propostas = result.data;
  const podeEditar = role === "admin" || role === "editor";

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Orçamentos e Propostas</h1>
          <p className="mt-1 text-sm text-gray-500">
            Escolha um cliente e monte a proposta — o dimensionamento pode ser feito dentro dela.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {podeEditar && (
            <Link
              href="/admin/propostas/novo"
              className="btn-primary"
            >
              + Nova Proposta
            </Link>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <table className="table-standard">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Nº</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Cliente</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Valor Estimado</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Data</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {propostas.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  Nenhuma proposta gerada ainda.
                </td>
              </tr>
            ) : (
              propostas.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-700">#{p.numero}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{p.clientes?.nome ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {p.status === "rascunho" ? "—" : Number(p.valor_total ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </td>
                  <td className="px-4 py-3">
                    {p.status === "rascunho" || !podeEditar ? (
                      <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                        {p.status === "rascunho" ? "Rascunho" : LABEL_STATUS[p.status] ?? p.status}
                      </span>
                    ) : (
                      <StatusPropostaSelect id={p.id} statusAtual={p.status} labels={LABEL_STATUS} />
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(p.criado_em).toLocaleDateString("pt-BR")}</td>
                  <td className="px-4 py-3">
                    <PropostaActions id={p.id} status={p.status} podeEditar={podeEditar} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
