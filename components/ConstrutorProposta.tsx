"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  adicionarItemProposta,
  adicionarServicoProposta,
  atualizarCondicoesProposta,
  atualizarItemProposta,
  finalizarProposta,
  removerItemProposta,
  removerServicoProposta,
} from "@/app/actions/propostas";
import { CalculadoraSolarEmbutida } from "@/components/CalculadoraSolarEmbutida";
import { ProdutoCombobox } from "@/components/ProdutoCombobox";
import { usePerfil } from "@/hooks/usePerfil";

interface Item {
  id: string;
  categoria: string;
  descricao: string;
  quantidade: number;
  preco_unitario: number;
  preco_catalogo: number;
}

interface ServicoProposta {
  id: string;
  servico_id: string | null;
  nome: string;
  recorrencia: "unico" | "mensal" | "anual";
  preco: number;
}

interface Servico {
  id: string;
  nome: string;
  recorrencia_padrao: "unico" | "mensal" | "anual";
  preco_padrao: number;
}

interface Produto {
  id: string;
  sku: string;
  categoria: string;
  atributos: Record<string, any> | null;
  fabricantes: { nome: string } | null;
}

const TABS = [
  { id: "equipamentos", label: "Equipamentos" },
  { id: "servicos", label: "Serviços" },
  { id: "condicoes", label: "Condições" },
] as const;
type TabId = (typeof TABS)[number]["id"];

const LABEL_RECORRENCIA: Record<string, string> = { unico: "Único", mensal: "Mensal", anual: "Anual" };

function formatBRL(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function ConstrutorProposta({
  propostaId,
  propostaInicial,
  itensIniciais,
  servicosIniciais,
  catalogoServicos,
  catalogoProdutos,
}: {
  propostaId: string;
  propostaInicial: any;
  itensIniciais: Item[];
  servicosIniciais: ServicoProposta[];
  catalogoServicos: Servico[];
  catalogoProdutos: Produto[];
}) {
  const router = useRouter();
  const { podeEditar, carregando: carregandoPerfil } = usePerfil();
  const [aba, setAba] = useState<TabId>("equipamentos");
  const [itens, setItens] = useState<Item[]>(itensIniciais.map((i) => ({ ...i, preco_catalogo: (i as any).preco_catalogo ?? i.preco_unitario })));
  const [servicos, setServicos] = useState<ServicoProposta[]>(servicosIniciais);
  const [dimensionadorAberto, setDimensionadorAberto] = useState(false);

  const [condicoesPagamento, setCondicoesPagamento] = useState(propostaInicial.condicoes_pagamento ?? "");
  const [formaPagamento, setFormaPagamento] = useState<"avista" | "financiado">(propostaInicial.forma_pagamento ?? "avista");
  const [parcelas, setParcelas] = useState(propostaInicial.parcelas ?? 1);
  const [validadeDias, setValidadeDias] = useState(propostaInicial.validade_dias ?? 10);
  const [prazoInstalacao, setPrazoInstalacao] = useState(propostaInicial.prazo_instalacao_dias ?? 15);
  const [descontoAvista, setDescontoAvista] = useState(propostaInicial.desconto_avista_pct ?? 3);

  const [servicoSelecionadoId, setServicoSelecionadoId] = useState("");
  const [finalizando, setFinalizando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const jaFinalizada = propostaInicial.status !== "rascunho";
  // trava edição se a proposta já foi finalizada OU se o usuário não tem permissão de escrita
  // (enquanto o papel ainda está carregando, trava por padrão — evita um flash de campos editáveis)
  const travado = jaFinalizada || carregandoPerfil || !podeEditar;
  const dimensionamento = propostaInicial.dimensionamentos;

  const valorItens = useMemo(() => itens.reduce((acc, i) => acc + i.quantidade * i.preco_unitario, 0), [itens]);
  const servicosUnicos = useMemo(() => servicos.filter((s) => s.recorrencia === "unico"), [servicos]);
  const servicosMensais = useMemo(() => servicos.filter((s) => s.recorrencia === "mensal"), [servicos]);
  const servicosAnuais = useMemo(() => servicos.filter((s) => s.recorrencia === "anual"), [servicos]);
  const valorServicosUnicos = useMemo(() => servicosUnicos.reduce((acc, s) => acc + s.preco, 0), [servicosUnicos]);
  const valorMensalRecorrente = useMemo(() => servicosMensais.reduce((acc, s) => acc + s.preco, 0), [servicosMensais]);
  const valorAnualRecorrente = useMemo(() => servicosAnuais.reduce((acc, s) => acc + s.preco, 0), [servicosAnuais]);
  const valorTotal = valorItens + valorServicosUnicos;

  function handleItensDoDimensionamento(itensNovos: any[]) {
    setItens((prev) => [
      ...prev,
      ...itensNovos.map((i) => ({
        id: i.id,
        categoria: i.categoria,
        descricao: i.descricao,
        quantidade: Number(i.quantidade),
        preco_unitario: Number(i.preco_unitario),
        preco_catalogo: Number(i.preco_unitario),
      })),
    ]);
    setDimensionadorAberto(false);
  }

  async function handleAdicionarProduto(p: Produto) {
    const res = await adicionarItemProposta(propostaId, {
      produto_id: p.id,
      categoria: p.categoria,
      descricao: `${p.fabricantes?.nome ?? ""} ${p.atributos?.modelo ?? p.sku}`.trim(),
      quantidade: 1,
      preco_unitario: 0,
    });
    if (res.success) {
      setItens((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          categoria: p.categoria,
          descricao: `${p.fabricantes?.nome ?? ""} ${p.atributos?.modelo ?? p.sku}`.trim(),
          quantidade: 1,
          preco_unitario: 0,
          preco_catalogo: 0,
        },
      ]);
      router.refresh();
    }
  }

  async function handleQuantidade(item: Item, quantidade: number) {
    setItens((prev) => prev.map((i) => (i.id === item.id ? { ...i, quantidade } : i)));
    await atualizarItemProposta(item.id, { quantidade });
  }

  async function handlePreco(item: Item, preco_unitario: number) {
    setItens((prev) => prev.map((i) => (i.id === item.id ? { ...i, preco_unitario } : i)));
    await atualizarItemProposta(item.id, { preco_unitario });
  }

  async function handleRemoverItem(id: string) {
    setItens((prev) => prev.filter((i) => i.id !== id));
    await removerItemProposta(id);
  }

  async function handleAdicionarServico() {
    const catalogo = catalogoServicos.find((s) => s.id === servicoSelecionadoId);
    if (!catalogo) return;
    const res = await adicionarServicoProposta(propostaId, {
      servico_id: catalogo.id,
      nome: catalogo.nome,
      recorrencia: catalogo.recorrencia_padrao,
      preco: catalogo.preco_padrao,
    });
    if (res.success) {
      setServicos((prev) => [...prev, { id: crypto.randomUUID(), servico_id: catalogo.id, nome: catalogo.nome, recorrencia: catalogo.recorrencia_padrao, preco: catalogo.preco_padrao }]);
      setServicoSelecionadoId("");
    }
  }

  async function handleRemoverServico(id: string) {
    setServicos((prev) => prev.filter((s) => s.id !== id));
    await removerServicoProposta(id);
  }

  async function handleSalvarCondicoes() {
    await atualizarCondicoesProposta(propostaId, {
      condicoes_pagamento: condicoesPagamento,
      forma_pagamento: formaPagamento,
      parcelas: formaPagamento === "financiado" ? Number(parcelas) : null,
      validade_dias: Number(validadeDias),
      prazo_instalacao_dias: Number(prazoInstalacao),
      desconto_avista_pct: Number(descontoAvista),
    });
  }

  async function handleFinalizar() {
    setFinalizando(true);
    setErro(null);
    await handleSalvarCondicoes();
    const res = await finalizarProposta(propostaId);
    setFinalizando(false);
    if (res.error) {
      setErro(res.error);
      return;
    }
    router.push("/admin/propostas");
    router.refresh();
  }

  return (
    <div className="min-h-full bg-gray-50 p-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800">
          {propostaInicial.titulo || "Construtor de Proposta"} {propostaInicial.numero ? `#${propostaInicial.numero}` : ""}
        </h1>
        <p className="text-sm text-gray-500">{propostaInicial.clientes?.nome ?? "Cliente"}</p>
      </div>

      {jaFinalizada && (
        <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
          Esta proposta já foi finalizada e o conteúdo está congelado. Para alterar, gere uma nova proposta.
        </div>
      )}
      {!jaFinalizada && !carregandoPerfil && !podeEditar && (
        <div className="mb-6 rounded-lg border border-gray-300 bg-gray-50 p-3 text-sm text-gray-600">
          Você está no modo Visualizador — pode navegar pela proposta, mas não pode editar ou finalizar.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
          <div className="flex border-b">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setAba(t.id)}
                className={`px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  aba === t.id ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {aba === "equipamentos" && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-medium text-slate-800">Escopo de Fornecimento</h2>
                  {!travado && (
                    <button
                      onClick={() => setDimensionadorAberto(true)}
                      className="rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-sm font-bold text-white shadow-sm hover:brightness-110"
                    >
                      ⚡ Dimensionar Sistema
                    </button>
                  )}
                </div>

                <div className="rounded-lg border border-slate-200 bg-white">
                  <div className="overflow-x-auto rounded-t-lg">
                    <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-3 py-2.5 text-left font-medium text-slate-500">Produto</th>
                        <th className="w-20 px-3 py-2.5 text-right font-medium text-slate-500">Qtd.</th>
                        <th className="w-32 px-3 py-2.5 text-right font-medium text-slate-500">Preço Unit.</th>
                        <th className="w-28 px-3 py-2.5 text-right font-medium text-slate-500">Subtotal</th>
                        <th className="w-16 px-3 py-2.5"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {itens.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-3 py-6 text-center text-slate-400">
                            Nenhum item adicionado.
                          </td>
                        </tr>
                      )}
                      {itens.map((item) => {
                        const precoEditado = item.preco_unitario !== item.preco_catalogo;
                        return (
                          <tr key={item.id}>
                            <td className="px-3 py-2 align-middle text-slate-800">{item.descricao}</td>
                            <td className="px-3 py-2 align-middle">
                              <input
                                type="number"
                                value={item.quantidade}
                                disabled={travado}
                                onChange={(e) => handleQuantidade(item, Number(e.target.value))}
                                className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-right text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 disabled:bg-slate-50 disabled:text-slate-400"
                              />
                            </td>
                            <td className="px-3 py-2 align-middle">
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  value={item.preco_unitario}
                                  disabled={travado}
                                  title={precoEditado ? `Preço de catálogo: ${formatBRL(item.preco_catalogo)}` : undefined}
                                  onChange={(e) => handlePreco(item, Number(e.target.value))}
                                  className={`w-full rounded-md border px-2 py-1.5 text-right text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 disabled:bg-slate-50 disabled:text-slate-400 ${
                                    precoEditado ? "border-amber-400 bg-amber-50" : "border-slate-300"
                                  }`}
                                />
                                {precoEditado && (
                                  <span className="text-amber-500 text-xs shrink-0" title="Preço alterado do catálogo">✎</span>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-2 align-middle text-right font-medium text-slate-700">
                              {formatBRL(item.quantidade * item.preco_unitario)}
                            </td>
                            <td className="px-3 py-2 align-middle text-right">
                              {!travado && (
                                <button onClick={() => handleRemoverItem(item.id)} className="text-red-500 text-xs hover:underline">
                                  remover
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  </div>
                  {!travado && (
                    <div className="border-t border-slate-200 p-3">
                      <ProdutoCombobox produtos={catalogoProdutos as any} onSelecionar={handleAdicionarProduto} />
                    </div>
                  )}
                </div>
              </div>
            )}

            {aba === "servicos" && (
              <div>
                <h2 className="font-medium text-gray-800 mb-3">Serviços Adicionados</h2>
                <div className="divide-y rounded-lg border">
                  {servicos.length === 0 && <p className="p-4 text-sm text-gray-500">Nenhum serviço adicionado.</p>}
                  {servicos.map((s) => (
                    <div key={s.id} className="flex items-center gap-3 p-3">
                      <span className="flex-1 text-sm text-gray-800">{s.nome}</span>
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{LABEL_RECORRENCIA[s.recorrencia]}</span>
                      <span className="w-24 text-right text-sm font-medium text-gray-700">{formatBRL(s.preco)}</span>
                      {!travado && (
                        <button onClick={() => handleRemoverServico(s.id)} className="text-red-500 text-xs">
                          remover
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {!travado && (
                  <div className="flex items-end gap-2 mt-3">
                    <div className="flex-1">
                      <label className="mb-1 block text-xs text-gray-500">Adicionar do catálogo de serviços</label>
                      <select value={servicoSelecionadoId} onChange={(e) => setServicoSelecionadoId(e.target.value)} className="w-full rounded-lg border p-2.5 text-sm">
                        <option value="">Selecione...</option>
                        {catalogoServicos.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.nome} — {formatBRL(s.preco_padrao)} ({LABEL_RECORRENCIA[s.recorrencia_padrao]})
                          </option>
                        ))}
                      </select>
                    </div>
                    <button onClick={handleAdicionarServico} className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white">
                      Adicionar
                    </button>
                  </div>
                )}
              </div>
            )}

            {aba === "condicoes" && (
              <div className="flex flex-col gap-4 max-w-md">
                <h2 className="font-medium text-gray-800">Condições Comerciais</h2>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Forma de Pagamento</label>
                  <div className="flex gap-4 text-sm">
                    <label className="flex items-center gap-1.5">
                      <input type="radio" checked={formaPagamento === "avista"} onChange={() => setFormaPagamento("avista")} disabled={travado} /> À vista
                    </label>
                    <label className="flex items-center gap-1.5">
                      <input type="radio" checked={formaPagamento === "financiado"} onChange={() => setFormaPagamento("financiado")} disabled={travado} /> Financiado
                    </label>
                  </div>
                </div>
                {formaPagamento === "financiado" && (
                  <div>
                    <label className="mb-1 block text-xs text-gray-500">Número de Parcelas</label>
                    <input type="number" value={parcelas} disabled={travado} onChange={(e) => setParcelas(Number(e.target.value))} className="w-full rounded-lg border p-2.5 text-sm" />
                  </div>
                )}
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Condições de Pagamento (texto livre)</label>
                  <textarea
                    rows={2}
                    value={condicoesPagamento}
                    disabled={travado}
                    onChange={(e) => setCondicoesPagamento(e.target.value)}
                    placeholder="Ex: 50% na assinatura + 50% na instalação"
                    className="w-full rounded-lg border p-2.5 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs text-gray-500">Validade (dias)</label>
                    <input type="number" value={validadeDias} disabled={travado} onChange={(e) => setValidadeDias(Number(e.target.value))} className="w-full rounded-lg border p-2.5 text-sm" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-gray-500">Prazo de Instalação (dias)</label>
                    <input type="number" value={prazoInstalacao} disabled={travado} onChange={(e) => setPrazoInstalacao(Number(e.target.value))} className="w-full rounded-lg border p-2.5 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Desconto à Vista (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={descontoAvista}
                    disabled={travado}
                    onChange={(e) => setDescontoAvista(Number(e.target.value))}
                    className="w-full rounded-lg border p-2.5 text-sm"
                  />
                  <span className="mt-1 block text-[11px] text-gray-400">
                    Aparece no PDF como "À Vista" — valor com desconto sobre o investimento total.
                  </span>
                </div>
                {!travado && (
                  <button onClick={handleSalvarCondicoes} className="self-start rounded-lg border px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    Salvar condições
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <aside className="sticky top-6 rounded-xl border bg-white shadow-sm p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Resumo</h2>
          {dimensionamento && (
            <div className="mb-4 text-sm text-gray-600 space-y-1">
              <p>Módulos: {dimensionamento.qtde_modulos ?? "—"}</p>
              <p>Geração: {Number(dimensionamento.geracao_estimada ?? 0).toFixed(0)} kWh/mês</p>
            </div>
          )}
          <div className="space-y-1.5 text-sm border-t pt-3">
            <div className="flex justify-between text-gray-600">
              <span>Equipamentos</span>
              <span>{formatBRL(valorItens)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Serviços únicos</span>
              <span>{formatBRL(valorServicosUnicos)}</span>
            </div>
            {valorMensalRecorrente > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Serviços recorrentes</span>
                <span>{formatBRL(valorMensalRecorrente)}/mês</span>
              </div>
            )}
            {valorAnualRecorrente > 0 && (
              <div className="flex justify-between text-gray-600">
                <span></span>
                <span>{formatBRL(valorAnualRecorrente)}/ano</span>
              </div>
            )}
          </div>
          <div className="mt-3 border-t pt-3 flex justify-between items-baseline">
            <span className="text-sm font-medium text-gray-600">Total à vista</span>
            <span className="text-xl font-bold text-gray-900">{formatBRL(valorTotal)}</span>
          </div>

          {erro && <p className="mt-3 text-xs text-red-600">{erro}</p>}

          {!jaFinalizada ? (
            <button
              onClick={handleFinalizar}
              disabled={travado || finalizando || itens.length === 0}
              className="mt-4 w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {finalizando ? "Finalizando..." : "Finalizar e Gerar PDF"}
            </button>
          ) : (
            <a
              href={`/api/propostas/${propostaId}/pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 block w-full text-center rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Abrir PDF
            </a>
          )}
        </aside>
      </div>

      {dimensionadorAberto && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50">
          <div className="h-full w-full max-w-2xl overflow-y-auto">
            <CalculadoraSolarEmbutida
              propostaId={propostaId}
              clienteId={propostaInicial.cliente_id}
              consumoInicial={propostaInicial.clientes?.consumo_kwh_mes}
              onFechar={() => setDimensionadorAberto(false)}
              onConcluir={handleItensDoDimensionamento}
            />
          </div>
        </div>
      )}
    </div>
  );
}
