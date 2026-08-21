export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type GrupoTarifario = "A" | "B";
type ClasseB = "B1" | "B2" | "B3" | "B4";
type SubgrupoA = "A1" | "A2" | "A3" | "A3a" | "A4" | "AS";
type ModalidadeTarifariaA = "verde" | "azul";
type Recorrencia = "unico" | "mensal" | "anual";

export interface Database {
  public: {
    Tables: {
      perfis: {
        Row: { id: string; role: "admin" | "comercial"; email: string | null };
        Insert: { id: string; role: "admin" | "comercial"; email?: string | null };
        Update: { id?: string; role?: "admin" | "comercial"; email?: string | null };
      };
      clientes: {
        Row: {
          id: string;
          vendedor_id: string | null;
          nome: string;
          documento: string | null;
          consumo_kwh_mes: number | null;
          cep: string | null;
          rua: string | null;
          numero: string | null;
          bairro: string | null;
          cidade: string | null;
          uf: string | null;
          zona: "urbana" | "rural" | null;
          concessionaria: string | null;
          tipo_telhado: string | null;
          estrutura_telhado: string | null;
          fatura_path: string | null;
          observacoes: string | null;
          grupo_tarifario: GrupoTarifario | null;
          classe_b: ClasseB | null;
          subgrupo_a: SubgrupoA | null;
          modalidade_tarifaria_a: ModalidadeTarifariaA | null;
          tarifa_kwh: number | null;
          tarifa_kwh_ponta: number | null;
          tarifa_kwh_fora_ponta: number | null;
        };
        Insert: {
          id?: string;
          vendedor_id?: string | null;
          nome: string;
          documento?: string | null;
          consumo_kwh_mes?: number | null;
          cep?: string | null;
          rua?: string | null;
          numero?: string | null;
          bairro?: string | null;
          cidade?: string | null;
          uf?: string | null;
          zona?: "urbana" | "rural" | null;
          concessionaria?: string | null;
          tipo_telhado?: string | null;
          estrutura_telhado?: string | null;
          fatura_path?: string | null;
          observacoes?: string | null;
          grupo_tarifario?: GrupoTarifario | null;
          classe_b?: ClasseB | null;
          subgrupo_a?: SubgrupoA | null;
          modalidade_tarifaria_a?: ModalidadeTarifariaA | null;
          tarifa_kwh?: number | null;
          tarifa_kwh_ponta?: number | null;
          tarifa_kwh_fora_ponta?: number | null;
        };
        Update: {
          id?: string;
          vendedor_id?: string | null;
          nome?: string;
          documento?: string | null;
          consumo_kwh_mes?: number | null;
          cep?: string | null;
          rua?: string | null;
          numero?: string | null;
          bairro?: string | null;
          cidade?: string | null;
          uf?: string | null;
          zona?: "urbana" | "rural" | null;
          concessionaria?: string | null;
          tipo_telhado?: string | null;
          estrutura_telhado?: string | null;
          fatura_path?: string | null;
          observacoes?: string | null;
          grupo_tarifario?: GrupoTarifario | null;
          classe_b?: ClasseB | null;
          subgrupo_a?: SubgrupoA | null;
          modalidade_tarifaria_a?: ModalidadeTarifariaA | null;
          tarifa_kwh?: number | null;
          tarifa_kwh_ponta?: number | null;
          tarifa_kwh_fora_ponta?: number | null;
        };
      };
      cliente_fotos_survey: {
        Row: { id: string; cliente_id: string; storage_path: string; descricao: string };
        Insert: { id?: string; cliente_id: string; storage_path: string; descricao: string };
        Update: { id?: string; cliente_id?: string; storage_path?: string; descricao?: string };
      };
      fabricantes: {
        Row: { id: string; nome: string };
        Insert: { id?: string; nome: string };
        Update: { id?: string; nome?: string };
      };
      produtos: {
        Row: {
          id: string;
          sku: string;
          categoria: "modulo" | "inversor" | "estrutura" | "cabo" | "string_box";
          atributos: Json | null;
          fabricante_id: string | null;
        };
        Insert: {
          id?: string;
          sku: string;
          categoria: "modulo" | "inversor" | "estrutura" | "cabo" | "string_box";
          atributos?: Json | null;
          fabricante_id?: string | null;
        };
        Update: {
          id?: string;
          sku?: string;
          categoria?: "modulo" | "inversor" | "estrutura" | "cabo" | "string_box";
          atributos?: Json | null;
          fabricante_id?: string | null;
        };
      };
      estoque_preco: {
        Row: { id: string; produto_id: string | null; cd_id: string; preco: number; quantidade: number };
        Insert: { id?: string; produto_id?: string | null; cd_id: string; preco: number; quantidade: number };
        Update: { id?: string; produto_id?: string | null; cd_id?: string; preco?: number; quantidade?: number };
      };
      dimensionamentos: {
        Row: {
          id: string;
          cliente_id: string | null;
          consumo_alvo: number;
          geracao_estimada: number;
          inversor_id: string | null;
          modulo_id: string | null;
          qtde_modulos: number;
          tipo_ligacao: "monofasico" | "bifasico" | "trifasico" | null;
        };
        Insert: {
          id?: string;
          cliente_id?: string | null;
          consumo_alvo: number;
          geracao_estimada: number;
          inversor_id?: string | null;
          modulo_id?: string | null;
          qtde_modulos: number;
          tipo_ligacao?: "monofasico" | "bifasico" | "trifasico" | null;
        };
        Update: {
          id?: string;
          cliente_id?: string | null;
          consumo_alvo?: number;
          geracao_estimada?: number;
          inversor_id?: string | null;
          modulo_id?: string | null;
          qtde_modulos?: number;
          tipo_ligacao?: "monofasico" | "bifasico" | "trifasico" | null;
        };
      };
      servicos: {
        Row: { id: string; nome: string; descricao: string | null; recorrencia_padrao: Recorrencia; preco_padrao: number; ativo: boolean };
        Insert: { id?: string; nome: string; descricao?: string | null; recorrencia_padrao: Recorrencia; preco_padrao: number; ativo?: boolean };
        Update: { id?: string; nome?: string; descricao?: string | null; recorrencia_padrao?: Recorrencia; preco_padrao?: number; ativo?: boolean };
      };
      proposta_itens: {
        Row: { id: string; proposta_id: string; produto_id: string | null; categoria: string; descricao: string; quantidade: number; preco_unitario: number; ordem: number };
        Insert: { id?: string; proposta_id: string; produto_id?: string | null; categoria: string; descricao: string; quantidade?: number; preco_unitario: number; ordem?: number };
        Update: { id?: string; proposta_id?: string; produto_id?: string | null; categoria?: string; descricao?: string; quantidade?: number; preco_unitario?: number; ordem?: number };
      };
      proposta_servicos: {
        Row: { id: string; proposta_id: string; servico_id: string | null; nome: string; recorrencia: Recorrencia; preco: number; ordem: number };
        Insert: { id?: string; proposta_id: string; servico_id?: string | null; nome: string; recorrencia: Recorrencia; preco: number; ordem?: number };
        Update: { id?: string; proposta_id?: string; servico_id?: string | null; nome?: string; recorrencia?: Recorrencia; preco?: number; ordem?: number };
      };
      propostas: {
        Row: {
          id: string;
          numero: number;
          vendedor_id: string | null;
          cliente_id: string | null;
          dimensionamento_id: string | null;
          snapshot: Json | null;
          status: string | null;
          criado_em: string | null;
          condicoes_pagamento: string | null;
          forma_pagamento: "avista" | "financiado" | null;
          parcelas: number | null;
          validade_dias: number;
          prazo_instalacao_dias: number | null;
          economia_estimada_ano1: number | null;
          payback_meses: number | null;
          valor_total: number | null;
          finalizada_em: string | null;
        };
        Insert: {
          id?: string;
          vendedor_id?: string | null;
          cliente_id?: string | null;
          dimensionamento_id?: string | null;
          snapshot?: Json | null;
          status?: string | null;
          criado_em?: string | null;
          condicoes_pagamento?: string | null;
          forma_pagamento?: "avista" | "financiado" | null;
          parcelas?: number | null;
          validade_dias?: number;
          prazo_instalacao_dias?: number | null;
          economia_estimada_ano1?: number | null;
          payback_meses?: number | null;
          valor_total?: number | null;
          finalizada_em?: string | null;
        };
        Update: {
          id?: string;
          vendedor_id?: string | null;
          cliente_id?: string | null;
          dimensionamento_id?: string | null;
          snapshot?: Json | null;
          status?: string | null;
          criado_em?: string | null;
          condicoes_pagamento?: string | null;
          forma_pagamento?: "avista" | "financiado" | null;
          parcelas?: number | null;
          validade_dias?: number;
          prazo_instalacao_dias?: number | null;
          economia_estimada_ano1?: number | null;
          payback_meses?: number | null;
          valor_total?: number | null;
          finalizada_em?: string | null;
        };
      };
    };
  };
}
