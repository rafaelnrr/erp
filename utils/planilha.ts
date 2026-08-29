function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

const ALIASES: Record<string, string[]> = {
  sku: ["sku", "codigo", "codigosku"],
  categoria: ["categoria", "tipo"],
  fabricante: ["fabricante", "marca"],
  modelo: ["modelo", "descricao"],
  potencia: ["potencia", "potenciaw", "potenciawp", "wp", "w"],
  cd: ["cd", "cdorigem", "centrodedistribuicao", "origem", "deposito"],
  preco: ["preco", "precorbrasil", "precor", "valor"],
  quantidade: ["quantidade", "qtd", "qtde", "estoque"],
  nome: ["nome", "servico", "nomedofabricante", "nomedoservico"],
  recorrencia: ["recorrencia", "recorrenciapadrao", "periodicidade"],
  tempovalor: ["tempoexecucao", "tempoexecucaovalor", "tempo", "duracao"],
  tempounidade: ["tempoexecucaounidade", "unidadetempo", "unidade"],
  custointerno: ["custointerno", "custo"],
  precovenda: ["precovenda", "precopadrao", "precodevenda"],
  ativo: ["ativo", "status"],
  documento: ["documento", "cnpj", "cpf", "cpfcnpj"],
  telefone: ["telefone", "fone", "celular", "whatsapp"],
  email: ["email", "emailfornecedor"],
};

/** Mapeia cabeçalhos de uma planilha (em qualquer ordem/grafia) para as chaves canônicas conhecidas. */
export function mapearCabecalhos(cabecalhos: (string | undefined)[]): Record<string, number> {
  const indice: Record<string, number> = {};
  cabecalhos.forEach((valor, i) => {
    if (!valor) return;
    const normalizado = normalizar(valor);
    for (const [chave, aliases] of Object.entries(ALIASES)) {
      if (aliases.includes(normalizado)) {
        indice[chave] = i;
        break;
      }
    }
  });
  return indice;
}

export const CATEGORIAS_VALIDAS = ["modulo", "inversor", "estrutura", "string_box", "cabo", "acessorio"] as const;

const ALIASES_CATEGORIA: Record<string, (typeof CATEGORIAS_VALIDAS)[number]> = {
  modulo: "modulo",
  modulos: "modulo",
  paineis: "modulo",
  painel: "modulo",
  inversor: "inversor",
  inversores: "inversor",
  estrutura: "estrutura",
  estruturas: "estrutura",
  stringbox: "string_box",
  string_box: "string_box",
  cabo: "cabo",
  cabos: "cabo",
  acessorio: "acessorio",
  acessorios: "acessorio",
};

/** Converte o texto livre da categoria (em qualquer grafia comum) para o valor canônico salvo no banco, ou null se não reconhecido. */
export function normalizarCategoria(valor: string): (typeof CATEGORIAS_VALIDAS)[number] | null {
  const chave = normalizar(valor);
  return ALIASES_CATEGORIA[chave] ?? null;
}

export const RECORRENCIAS_VALIDAS = ["unico", "mensal", "anual"] as const;

const ALIASES_RECORRENCIA: Record<string, (typeof RECORRENCIAS_VALIDAS)[number]> = {
  unico: "unico",
  unica: "unico",
  avulso: "unico",
  mensal: "mensal",
  mes: "mensal",
  anual: "anual",
  ano: "anual",
};

export function normalizarRecorrencia(valor: string): (typeof RECORRENCIAS_VALIDAS)[number] | null {
  const chave = normalizar(valor);
  return ALIASES_RECORRENCIA[chave] ?? null;
}

export function normalizarBooleano(valor: string, padrao = true): boolean {
  const chave = normalizar(valor);
  if (!chave) return padrao;
  if (["sim", "s", "ativo", "true", "1", "yes"].includes(chave)) return true;
  if (["nao", "n", "inativo", "false", "0", "no"].includes(chave)) return false;
  return padrao;
}
