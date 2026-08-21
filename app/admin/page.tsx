import { createClient } from "@/utils/supabase/server";

export default async function PainelControlePage() {
  const supabase = await createClient();

  const [{ count: clientesCount }, { count: produtosCount }, { count: dimensionamentosCount }] =
    await Promise.all([
      supabase.from("clientes").select("*", { count: "exact", head: true }),
      supabase.from("produtos").select("*", { count: "exact", head: true }),
      supabase.from("dimensionamentos").select("*", { count: "exact", head: true }),
    ]);

  const cards = [
    { label: "Clientes cadastrados", valor: clientesCount ?? 0 },
    { label: "Produtos no catálogo", valor: produtosCount ?? 0 },
    { label: "Dimensionamentos realizados", valor: dimensionamentosCount ?? 0 },
  ];

  return (
    <main className="p-8">
      <h1 className="text-xl font-semibold text-gray-800">Painel de Controle</h1>
      <p className="mt-1 text-sm text-gray-500">Visão geral do SolarFlow Pro</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <span className="block text-sm text-gray-500">{c.label}</span>
            <strong className="mt-1 block text-3xl text-gray-800">{c.valor}</strong>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="font-medium text-gray-800">Próximos passos</h2>
        <ul className="mt-2 list-inside list-disc text-sm text-gray-600">
          <li>Use o Dimensionamento Inteligente para calcular sistemas a partir do catálogo real.</li>
          <li>Orçamentos e Propostas ainda está em construção.</li>
        </ul>
      </div>
    </main>
  );
}
