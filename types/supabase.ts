export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      perfis: {
        Row: { id: string; role: "admin" | "comercial" };
        Insert: { id: string; role: "admin" | "comercial" };
        Update: { id?: string; role?: "admin" | "comercial" };
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
      propostas: {
        Row: { id: string; vendedor_id: string | null; cliente_id: string | null; dimensionamento_id: string | null; snapshot: Json; status: string | null; criado_em: string | null };
        Insert: { id?: string; vendedor_id?: string | null; cliente_id?: string | null; dimensionamento_id?: string | null; snapshot: Json; status?: string | null; criado_em?: string | null };
        Update: { id?: string; vendedor_id?: string | null; cliente_id?: string | null; dimensionamento_id?: string | null; snapshot?: Json; status?: string | null; criado_em?: string | null };
      };
    };
  };
}
