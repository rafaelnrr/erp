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
        Row: { id: string; vendedor_id: string | null; nome: string; documento: string | null; consumo_kwh_mes: number | null };
        Insert: { id?: string; vendedor_id?: string | null; nome: string; documento?: string | null; consumo_kwh_mes?: number | null };
        Update: { id?: string; vendedor_id?: string | null; nome?: string; documento?: string | null; consumo_kwh_mes?: number | null };
      };
      produtos: {
        Row: { id: string; sku: string; categoria: "modulo" | "inversor" | "estrutura" | "cabo" | "string_box"; atributos: Json | null };
        Insert: { id?: string; sku: string; categoria: "modulo" | "inversor" | "estrutura" | "cabo" | "string_box"; atributos?: Json | null };
        Update: { id?: string; sku?: string; categoria?: "modulo" | "inversor" | "estrutura" | "cabo" | "string_box"; atributos?: Json | null };
      };
      estoque_preco: {
        Row: { id: string; produto_id: string | null; cd_id: string; preco: number; quantidade: number };
        Insert: { id?: string; produto_id?: string | null; cd_id: string; preco: number; quantidade: number };
        Update: { id?: string; produto_id?: string | null; cd_id?: string; preco?: number; quantidade?: number };
      };
      dimensionamentos: {
        Row: { id: string; cliente_id: string | null; consumo_alvo: number; geracao_estimada: number; inversor_id: string | null; modulo_id: string | null; qtde_modulos: number };
        Insert: { id?: string; cliente_id?: string | null; consumo_alvo: number; geracao_estimada: number; inversor_id?: string | null; modulo_id?: string | null; qtde_modulos: number };
        Update: { id?: string; cliente_id?: string | null; consumo_alvo?: number; geracao_estimada?: number; inversor_id?: string | null; modulo_id?: string | null; qtde_modulos?: number };
      };
      propostas: {
        Row: { id: string; vendedor_id: string | null; cliente_id: string | null; dimensionamento_id: string | null; snapshot: Json; status: string | null; criado_em: string | null };
        Insert: { id?: string; vendedor_id?: string | null; cliente_id?: string | null; dimensionamento_id?: string | null; snapshot: Json; status?: string | null; criado_em?: string | null };
        Update: { id?: string; vendedor_id?: string | null; cliente_id?: string | null; dimensionamento_id?: string | null; snapshot?: Json; status?: string | null; criado_em?: string | null };
      };
    };
  };
}
