"use client";

import { useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ImportadorPlanilha } from "@/components/ImportadorPlanilha";
import { importarPlanilhaProdutos } from "@/app/actions/importarProdutos";
import { importarPlanilhaServicos } from "@/app/actions/importarServicos";
import { importarPlanilhaFabricantes } from "@/app/actions/importarFabricantes";

const ABAS = [
  { id: "produtos", label: "Produtos" },
  { id: "servicos", label: "Serviços" },
  { id: "fabricantes", label: "Fabricantes" },
] as const;

type AbaId = (typeof ABAS)[number]["id"];

export function ImportacaoEmMassaClient() {
  const [aba, setAba] = useState<AbaId>("produtos");

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Importação em Massa</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Adicione produtos, serviços ou fabricantes em lote a partir de uma planilha .xlsx.
          </p>
        </div>
        <ThemeToggle />
      </div>

      <div className="mb-5 flex gap-1 border-b border-slate-200 dark:border-slate-800">
        {ABAS.map((a) => (
          <button
            key={a.id}
            onClick={() => setAba(a.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              aba === a.id
                ? "border-amber-500 text-amber-600 dark:text-amber-500"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>

      {aba === "produtos" && (
        <ImportadorPlanilha
          descricao="Envie um .xlsx com as colunas SKU e Categoria (obrigatórias) e, opcionalmente, Fabricante, Modelo, Potência, CD/Origem, Preço e Quantidade. Produtos com SKU já existente são atualizados; os demais são criados."
          templateUrl="/api/produtos/template"
          acao={importarPlanilhaProdutos}
        />
      )}
      {aba === "servicos" && (
        <ImportadorPlanilha
          descricao="Envie um .xlsx com as colunas Nome e Preço de Venda (obrigatórias) e, opcionalmente, Descrição, Recorrência, Tempo de Execução, Custo Interno e Ativo. Serviços com nome já existente são atualizados; os demais são criados."
          templateUrl="/api/servicos/template"
          acao={importarPlanilhaServicos}
        />
      )}
      {aba === "fabricantes" && (
        <ImportadorPlanilha
          descricao="Envie um .xlsx com uma coluna Nome. Fabricantes com nome já existente são ignorados (não há outros dados para atualizar); os demais são criados."
          templateUrl="/api/fabricantes/template"
          acao={importarPlanilhaFabricantes}
        />
      )}
    </main>
  );
}
