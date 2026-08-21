import Link from "next/link";
import { listarPropostas } from "@/app/actions/propostas";
import { StatusPropostaSelect } from "@/components/StatusPropostaSelect";

const LABEL_STATUS: Record<string, string> = {
  gerada: "Gerada",
  enviada: "Enviada",
  aceita: "Aceita",
  recusada: "Recusada",
  expirada: "Expirada",
};

export default async function PropostasPage() {
  const result = await listarPropostas();
  const propostas = result.data;

  return (
    <main className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Orçamentos e Propostas</h1>
          <p className="mt-1 text-sm text-gray-500">
            Escolha um cliente e monte a proposta — o dimensionamento pode ser feito dentro dela.
          </p>
        </div>
        <Link
          href="/admin/propostas/novo"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          + Nova Proposta
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
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
                    {p.status === "rascunho" ? (
                      <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">Rascunho</span>
                    ) : (
                      <StatusPropostaSelect id={p.id} statusAtual={p.status} labels={LABEL_STATUS} />
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(p.criado_em).toLocaleDateString("pt-BR")}</td>
                  <td className="px-4 py-3">
                    {p.status === "rascunho" ? (
                      <Link href={`/admin/propostas/${p.id}/construtor`} className="text-blue-600 hover:underline text-xs font-medium">
                        Continuar edição
                      </Link>
                    ) : (
                      <a
                        href={`/api/propostas/${p.id}/pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-xs font-medium"
                      >
                        Abrir PDF
                      </a>
                    )}
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
