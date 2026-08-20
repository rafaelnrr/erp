"use client";

import { useState } from "react";
import { calcularDimensionamento } from "@/app/actions/dimensionar";

export default function DimensionamentoPage() {
  const [consumo, setConsumo] = useState(500);
  const [irradiacao, setIrradiacao] = useState(4.5);
  const [resultados, setResultados] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleCalcular(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErro(null);

    const res = await calcularDimensionamento({
      consumo_kwh_mes: consumo,
      irradiacao_diaria: irradiacao,
      rendimento_sistema: 0.75,
    });

    if (!res.ok) {
      setErro(res.error || "Erro desconhecido");
      setResultados(null);
    } else {
      setResultados(res.data);
    }
    setLoading(false);
  }

  return (
    <main className="p-8">
      <h1 className="mb-6 text-xl font-semibold">Motor de Dimensionamento</h1>
      
      <div className="flex gap-8">
        <form onSubmit={handleCalcular} className="w-1/3 flex flex-col gap-4 rounded-lg border bg-white p-6 shadow-sm">
          <div>
            <label className="mb-1 block text-sm font-medium">Consumo Mensal (kWh)</label>
            <input
              type="number"
              value={consumo}
              onChange={(e) => setConsumo(Number(e.target.value))}
              className="w-full rounded border p-2"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Irradiação Média (HSP)</label>
            <input
              type="number"
              step="0.1"
              value={irradiacao}
              onChange={(e) => setIrradiacao(Number(e.target.value))}
              className="w-full rounded border p-2"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded bg-blue-600 p-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Calculando..." : "Calcular Wp e Módulos"}
          </button>
          {erro && <p className="text-sm text-red-500">{erro}</p>}
        </form>

        <div className="w-2/3">
          {resultados && (
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-medium">Resultados</h2>
              <p className="mb-4 text-sm text-gray-600">
                Potência DC Alvo: <span className="font-bold text-gray-900">{(resultados.wp_necessario / 1000).toFixed(2)} kWp</span>
              </p>
              
              <h3 className="mb-2 text-sm font-medium">Opções de Módulos (Hard Stops aplicados)</h3>
              <div className="grid gap-3">
                {resultados.sugestoes.map((sug: any) => (
                  <div key={sug.modulo_id} className="rounded border p-3 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">{sug.sku}</span>
                      <span className="text-blue-600 font-bold">{sug.qtde_modulos} unidades</span>
                    </div>
                    <div className="text-gray-500 mt-1">
                      Potência Total: {(sug.potencia_total_dc / 1000).toFixed(2)} kWp
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
