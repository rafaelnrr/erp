"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { criarServico, atualizarServico, type Servico } from "@/app/actions/servicos";

interface ServicoDrawerProps {
  servicoEditar?: Servico | null;
  onClose: () => void;
}

export function ServicoDrawer({ servicoEditar, onClose }: ServicoDrawerProps) {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [recorrencia, setRecorrencia] = useState<"unico" | "mensal" | "anual">("unico");
  const [tempoValor, setTempoValor] = useState("");
  const [tempoUnidade, setTempoUnidade] = useState<"horas" | "dias">("horas");
  const [custoInterno, setCustoInterno] = useState("");
  const [precoPadrao, setPrecoPadrao] = useState("");
  const [ativo, setAtivo] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!servicoEditar) return;
    setNome(servicoEditar.nome);
    setDescricao(servicoEditar.descricao ?? "");
    setRecorrencia(servicoEditar.recorrencia_padrao);
    setTempoValor(servicoEditar.tempo_execucao_valor?.toString() ?? "");
    setTempoUnidade(servicoEditar.tempo_execucao_unidade ?? "horas");
    setCustoInterno(servicoEditar.custo_interno?.toString() ?? "");
    setPrecoPadrao(servicoEditar.preco_padrao.toString());
    setAtivo(servicoEditar.ativo);
  }, [servicoEditar]);

  async function handleSalvar() {
    if (!nome.trim() || !precoPadrao) return;
    setSalvando(true);
    setErro(null);

    const input = {
      nome: nome.trim(),
      descricao: descricao.trim() || null,
      recorrencia_padrao: recorrencia,
      tempo_execucao_valor: tempoValor ? Number(tempoValor) : null,
      tempo_execucao_unidade: tempoValor ? tempoUnidade : null,
      custo_interno: custoInterno ? Number(custoInterno) : null,
      preco_padrao: Number(precoPadrao),
      ativo,
    };

    const res = servicoEditar ? await atualizarServico(servicoEditar.id, input) : await criarServico(input);
    setSalvando(false);

    if (!res.ok) {
      setErro(res.error);
      return;
    }
    router.refresh();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h3 className="font-semibold text-gray-800 mb-4">{servicoEditar ? "Editar Serviço" : "Novo Serviço"}</h3>

        <div className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-xs text-gray-500">Nome do Serviço</label>
            <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Limpeza de Módulos" className="w-full rounded border p-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">Descrição Detalhada</label>
            <textarea rows={3} value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Escopo do serviço" className="w-full rounded border p-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">Tipo de Recorrência</label>
            <select value={recorrencia} onChange={(e) => setRecorrencia(e.target.value as any)} className="w-full rounded border p-2 text-sm">
              <option value="unico">Serviço Único</option>
              <option value="mensal">Mensal</option>
              <option value="anual">Anual</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">Tempo Médio de Execução</label>
            <div className="flex gap-2">
              <input type="number" value={tempoValor} onChange={(e) => setTempoValor(e.target.value)} placeholder="Ex: 4" className="flex-1 rounded border p-2 text-sm" />
              <select value={tempoUnidade} onChange={(e) => setTempoUnidade(e.target.value as any)} className="w-28 rounded border p-2 text-sm">
                <option value="horas">horas</option>
                <option value="dias">dias</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-gray-500">Custo Interno (R$)</label>
              <input type="number" step="0.01" value={custoInterno} onChange={(e) => setCustoInterno(e.target.value)} className="w-full rounded border p-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Preço de Venda Base (R$)</label>
              <input type="number" step="0.01" value={precoPadrao} onChange={(e) => setPrecoPadrao(e.target.value)} className="w-full rounded border p-2 text-sm" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} /> Serviço ativo
          </label>
        </div>

        {erro && <p className="mt-2 text-xs text-red-600">{erro}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 text-sm text-gray-500">Cancelar</button>
          <button
            onClick={handleSalvar}
            disabled={salvando || !nome.trim() || !precoPadrao}
            className="btn-primary"
          >
            {salvando ? "Salvando..." : "Salvar Serviço"}
          </button>
        </div>
      </div>
    </div>
  );
}
