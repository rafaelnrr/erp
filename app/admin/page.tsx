import { createClient } from "@/utils/supabase/server";
import { ThemeToggle } from "@/components/ThemeToggle";
import { obterDashboardStats } from "@/app/actions/dashboard";
import { LABEL_STATUS_PROPOSTA, CORES_STATUS_PROPOSTA } from "@/utils/statusProposta";

function Tendencia({ variacaoPct }: { variacaoPct: number | null }) {
  if (variacaoPct === null) {
    return (
      <div className="mt-3 flex items-center text-sm font-bold text-slate-400 dark:text-slate-500">
        <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14" />
        </svg>
        Sem dados do mês anterior
      </div>
    );
  }

  const positiva = variacaoPct >= 0;
  return (
    <div className={`mt-3 flex items-center text-sm font-bold ${positiva ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
      {positiva ? (
        <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ) : (
        <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
        </svg>
      )}
      {Math.abs(variacaoPct).toFixed(1)}% vs. mês anterior
    </div>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userName = user?.user_metadata?.nome || user?.email?.split("@")[0] || "Usuário";

  const { kpis, ultimasPropostas } = await obterDashboardStats();

  const cards = [
    {
      label: "Propostas Geradas (mês)",
      valor: String(kpis.propostasGeradas.valor),
      variacaoPct: kpis.propostasGeradas.variacaoPct,
      icone: (
        <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      label: "Potência Vendida (mês)",
      valor: `${kpis.potenciaVendidaKwp.valor.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} kWp`,
      variacaoPct: kpis.potenciaVendidaKwp.variacaoPct,
      icone: (
        <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      label: "Taxa de Conversão (mês)",
      valor: `${kpis.taxaConversaoPct.valor.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`,
      variacaoPct: kpis.taxaConversaoPct.variacaoPct,
      icone: (
        <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
  ];

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
            Olá, {userName}! 👋
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
            Bem-vindo ao seu painel da Hertz Solar. Aqui está o resumo das suas operações.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((kpi) => (
          <div key={kpi.label} className="panel p-6 flex flex-col justify-between hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{kpi.label}</span>
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 shadow-inner">
                {kpi.icone}
              </div>
            </div>
            <div className="mt-4">
              <strong className="text-3xl font-black tracking-tight text-slate-800 dark:text-slate-100">{kpi.valor}</strong>
              <Tendencia variacaoPct={kpi.variacaoPct} />
            </div>
          </div>
        ))}

        <div className="panel p-6 flex flex-col justify-between hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Faturamento Previsto</span>
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 shadow-inner">
              <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <strong className="text-3xl font-black tracking-tight text-slate-800 dark:text-slate-100">
              {kpis.faturamentoPrevisto.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}
            </strong>
            <div className="mt-3 flex items-center text-sm font-bold text-slate-500 dark:text-slate-400">
              {kpis.faturamentoPrevisto.propostasEmAberto} proposta(s) em aberto (enviada/aceita)
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 panel overflow-hidden">
        <div className="border-b border-slate-200 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50 px-6 py-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Últimas Propostas Criadas</h2>
          <a href="/admin/propostas" className="text-sm font-bold text-amber-600 hover:text-amber-700 dark:text-amber-500 dark:hover:text-amber-400 transition-colors flex items-center gap-1">
            Ver todas
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="table-standard">
            <thead>
              <tr>
                <th className="py-4">Cliente</th>
                <th className="py-4">Potência (kWp)</th>
                <th className="py-4">Valor</th>
                <th className="py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {ultimasPropostas.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500 dark:text-slate-400">
                    Nenhuma proposta criada ainda.
                  </td>
                </tr>
              ) : (
                ultimasPropostas.map((prop) => (
                  <tr key={prop.id}>
                    <td className="font-semibold text-slate-800 dark:text-slate-200 py-3.5">{prop.cliente}</td>
                    <td className="text-slate-600 dark:text-slate-400 py-3.5">{prop.potenciaKwp ? prop.potenciaKwp.toLocaleString("pt-BR", { maximumFractionDigits: 1 }) : "—"}</td>
                    <td className="font-bold text-slate-900 dark:text-slate-100 py-3.5">
                      {prop.valorTotal ? Number(prop.valorTotal).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "—"}
                    </td>
                    <td className="py-3.5">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${CORES_STATUS_PROPOSTA[prop.status] ?? ""}`}>
                        {LABEL_STATUS_PROPOSTA[prop.status] ?? prop.status}
                      </span>
                    </td>
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
