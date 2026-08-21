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

interface Item {
  id: string;
  categoria: string;
  descricao: string;
  quantidade: number;
  preco_unitario: number;
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
  const [aba, setAba] = useState<TabId>("equipamentos");
  const [itens, setItens] = useState<Item[]>(itensIniciais);
  const [servicos, setServicos] = useState<ServicoProposta[]>(servicosIniciais);

  const [condicoesPagamento, setCondicoesPagamento] = useState(propostaInicial.condicoes_pagamento ?? "");
  const [formaPagamento, setFormaPagamento] = useState<"avista" | "financiado">(propostaInicial.forma_pagamento ?? "avista");
  const [parcelas, setParcelas] = useState(propostaInicial.parcelas ?? 1);
  const [validadeDias, setValidadeDias] = useState(propostaInicial.validade_dias ?? 10);
  const [prazoInstalacao, setPrazoInstalacao] = useState(propostaInicial.prazo_instalacao_dias ?? 15);

  const [produtoBusca, setProdutoBusca] = useState("");
  const [servicoSelecionadoId, setServicoSelecionadoId] = useState("");
  const [finalizando, setFinalizando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const jaFinalizada = propostaInicial.status !== "rascunho";
  const dimensionamento = propostaInicial.dimensionamentos;

  const valorItens = useMemo(() => itens.reduce((acc, i) => acc + i.quantidade * i.preco_unitario, 0), [itens]);
  const servicosUnicos = useMemo(() => servicos.filter((s) => s.recorrencia === "unico"), [servicos]);
  const servicosMensais = useMemo(() => servicos.filter((s) => s.recorrencia === "mensal"), [servicos]);
  const servicosAnuais = useMemo(() => servicos.filter((s) => s.recorrencia === "anual"), [servicos]);
  const valorServicosUnicos = useMemo(() => servicosUnicos.reduce((acc, s) => acc + s.preco, 0), [servicosUnicos]);
  const valorMensalRecorrente = useMemo(() => servicosMensais.reduce((acc, s) => acc + s.preco, 0), [servicosMensais]);
  const valorAnualRecorrente = useMemo(() => servicosAnuais.reduce((acc, s) => acc + s.preco, 0), [servicosAnuais]);
  const valorTotal = valorItens + valorServicosUnicos;

  const produtosFiltrados = catalogoProdutos.filter((p) => {
    const texto = `${p.sku} ${p.atributos?.modelo ?? ""} ${p.fabricantes?.nome ?? ""}`.toLowerCase();
    return produtoBusca.length > 1 && texto.includes(produtoBusca.toLowerCase());
  });

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
        { id: crypto.randomUUID(), categoria: p.categoria, descricao: `${p.fabricantes?.nome ?? ""} ${p.atributos?.modelo ?? p.sku}`.trim(), quantidade: 1, preco_unitario: 0 },
      ]);
      setProdutoBusca("");
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
        <h1 className="text-xl font-semibold text-gray-800">Construtor de Proposta {propostaInicial.numero ? `#${propostaInicial.numero}` : ""}</h1>
        <p className="text-sm text-gray-500">{propostaInicial.clientes?.nome ?? "Cliente"}</p>
      </div>

      {jaFinalizada && (
        <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
          Esta proposta já foi finalizada e o conteúdo está congelado. Para alterar, gere uma nova proposta.
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
                  <h2 className="font-medium text-gray-800">Escopo de Fornecimento</h2>
                </div>
                <div className="divide-y rounded-lg border">
                  {itens.length === 0 && <p className="p-4 text-sm text-gray-500">Nenhum item adicionado.</p>}
                  {itens.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3">
                      <span className="flex-1 text-sm text-gray-800">{item.descricao}</span>
                      <input
                        type="number"
                        value={item.quantidade}
                        disabled={jaFinalizada}
                        onChange={(e) => handleQuantidade(item, Number(e.target.value))}
                        className="w-16 rounded border p-1.5 text-sm text-right"
                      />
                      <input
                        type="number"
                        value={item.preco_unitario}
                        disabled={jaFinalizada}
                        onChange={(e) => handlePreco(item, Number(e.target.value))}
                        className="w-24 rounded border p-1.5 text-sm text-right"
                      />
                      <span className="w-24 text-right text-sm font-medium text-gray-700">{formatBRL(item.quantidade * item.preco_unitario)}</span>
                      {!jaFinalizada && (
                        <button onClick={() => handleRemoverItem(item.id)} className="text-red-500 text-xs">
                          remover
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {!jaFinalizada && (
                  <div className="relative mt-3">
                    <input
                      value={produtoBusca}
                      onChange={(e) => setProdutoBusca(e.target.value)}
                      placeholder="+ Buscar no catálogo (cabos, disjuntores, conectores...)"
                      className="w-full rounded-lg border p-2.5 text-sm"
                    />
                    {produtosFiltrados.length > 0 && (
                      <ul className="absolute z-10 mt-1 w-full max-h-56 overflow-auto rounded-lg border bg-white shadow-lg">
                        {produtosFiltrados.map((p) => (
                          <li key={p.id}>
                            <button
                              onClick={() => handleAdicionarProduto(p)}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                            >
                              {p.fabricantes?.nome} {p.atributos?.modelo ?? p.sku}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
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
                      {!jaFinalizada && (
                        <button onClick={() => handleRemoverServico(s.id)} className="text-red-500 text-xs">
                          remover
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {!jaFinalizada && (
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
                      <input type="radio" checked={formaPagamento === "avista"} onChange={() => setFormaPagamento("avista")} disabled={jaFinalizada} /> À vista
                    </label>
                    <label className="flex items-center gap-1.5">
                      <input type="radio" checked={formaPagamento === "financiado"} onChange={() => setFormaPagamento("financiado")} disabled={jaFinalizada} /> Financiado
                    </label>
                  </div>
                </div>
                {formaPagamento === "financiado" && (
                  <div>
                    <label className="mb-1 block text-xs text-gray-500">Número de Parcelas</label>
                    <input type="number" value={parcelas} disabled={jaFinalizada} onChange={(e) => setParcelas(Number(e.target.value))} className="w-full rounded-lg border p-2.5 text-sm" />
                  </div>
                )}
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Condições de Pagamento (texto livre)</label>
                  <textarea
                    rows={2}
                    value={condicoesPagamento}
                    disabled={jaFinalizada}
                    onChange={(e) => setCondicoesPagamento(e.target.value)}
                    placeholder="Ex: 50% na assinatura + 50% na instalação"
                    className="w-full rounded-lg border p-2.5 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs text-gray-500">Validade (dias)</label>
                    <input type="number" value={validadeDias} disabled={jaFinalizada} onChange={(e) => setValidadeDias(Number(e.target.value))} className="w-full rounded-lg border p-2.5 text-sm" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-gray-500">Prazo de Instalação (dias)</label>
                    <input type="number" value={prazoInstalacao} disabled={jaFinalizada} onChange={(e) => setPrazoInstalacao(Number(e.target.value))} className="w-full rounded-lg border p-2.5 text-sm" />
                  </div>
                </div>
                {!jaFinalizada && (
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
              disabled={finalizando || itens.length === 0}
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
    </div>
  );
}
