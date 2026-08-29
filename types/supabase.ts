export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      cliente_fotos_survey: {
        Row: {
          cliente_id: string
          created_at: string
          descricao: string
          id: string
          storage_path: string
        }
        Insert: {
          cliente_id: string
          created_at?: string
          descricao: string
          id?: string
          storage_path: string
        }
        Update: {
          cliente_id?: string
          created_at?: string
          descricao?: string
          id?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "cliente_fotos_survey_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          bairro: string | null
          cep: string | null
          cidade: string | null
          classe_b: string | null
          concessionaria_id: string | null
          consumo_kwh_mes: number | null
          documento: string | null
          estrutura_telhado: string | null
          fatura_path: string | null
          grupo_tarifario: string | null
          id: string
          modalidade_tarifaria_a: string | null
          nome: string
          numero: string | null
          observacoes: string | null
          rua: string | null
          subgrupo_a: string | null
          tarifa_kwh: number | null
          tarifa_kwh_fora_ponta: number | null
          tarifa_kwh_ponta: number | null
          tipo_telhado: string | null
          uf: string | null
          vendedor_id: string | null
          zona: string | null
        }
        Insert: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          classe_b?: string | null
          concessionaria_id?: string | null
          consumo_kwh_mes?: number | null
          documento?: string | null
          estrutura_telhado?: string | null
          fatura_path?: string | null
          grupo_tarifario?: string | null
          id?: string
          modalidade_tarifaria_a?: string | null
          nome: string
          numero?: string | null
          observacoes?: string | null
          rua?: string | null
          subgrupo_a?: string | null
          tarifa_kwh?: number | null
          tarifa_kwh_fora_ponta?: number | null
          tarifa_kwh_ponta?: number | null
          tipo_telhado?: string | null
          uf?: string | null
          vendedor_id?: string | null
          zona?: string | null
        }
        Update: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          classe_b?: string | null
          concessionaria_id?: string | null
          consumo_kwh_mes?: number | null
          documento?: string | null
          estrutura_telhado?: string | null
          fatura_path?: string | null
          grupo_tarifario?: string | null
          id?: string
          modalidade_tarifaria_a?: string | null
          nome?: string
          numero?: string | null
          observacoes?: string | null
          rua?: string | null
          subgrupo_a?: string | null
          tarifa_kwh?: number | null
          tarifa_kwh_fora_ponta?: number | null
          tarifa_kwh_ponta?: number | null
          tipo_telhado?: string | null
          uf?: string | null
          vendedor_id?: string | null
          zona?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clientes_concessionaria_id_fkey"
            columns: ["concessionaria_id"]
            isOneToOne: false
            referencedRelation: "concessionarias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clientes_vendedor_id_fkey"
            columns: ["vendedor_id"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          },
        ]
      }
      concessionarias: {
        Row: {
          created_at: string
          id: string
          nome: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
      dimensionamentos: {
        Row: {
          area_estimada_m2: number | null
          cliente_id: string | null
          consumo_alvo: number
          geracao_estimada: number
          hsp: number | null
          id: string
          inversor_id: string | null
          modulo_id: string | null
          perdas_pct: number | null
          qtde_inversores: number | null
          qtde_modulos: number
          tipo_ligacao: string | null
        }
        Insert: {
          area_estimada_m2?: number | null
          cliente_id?: string | null
          consumo_alvo: number
          geracao_estimada: number
          hsp?: number | null
          id?: string
          inversor_id?: string | null
          modulo_id?: string | null
          perdas_pct?: number | null
          qtde_inversores?: number | null
          qtde_modulos: number
          tipo_ligacao?: string | null
        }
        Update: {
          area_estimada_m2?: number | null
          cliente_id?: string | null
          consumo_alvo?: number
          geracao_estimada?: number
          hsp?: number | null
          id?: string
          inversor_id?: string | null
          modulo_id?: string | null
          perdas_pct?: number | null
          qtde_inversores?: number | null
          qtde_modulos?: number
          tipo_ligacao?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dimensionamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dimensionamentos_inversor_id_fkey"
            columns: ["inversor_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dimensionamentos_modulo_id_fkey"
            columns: ["modulo_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      estoque_preco: {
        Row: {
          cd_id: string
          id: string
          preco: number
          produto_id: string | null
          quantidade: number
        }
        Insert: {
          cd_id: string
          id?: string
          preco: number
          produto_id?: string | null
          quantidade: number
        }
        Update: {
          cd_id?: string
          id?: string
          preco?: number
          produto_id?: string | null
          quantidade?: number
        }
        Relationships: [
          {
            foreignKeyName: "estoque_preco_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      fabricantes: {
        Row: {
          created_at: string
          id: string
          nome: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
      fornecedores: {
        Row: {
          created_at: string
          documento: string | null
          email: string | null
          id: string
          nome: string
          telefone: string | null
        }
        Insert: {
          created_at?: string
          documento?: string | null
          email?: string | null
          id?: string
          nome: string
          telefone?: string | null
        }
        Update: {
          created_at?: string
          documento?: string | null
          email?: string | null
          id?: string
          nome?: string
          telefone?: string | null
        }
        Relationships: []
      }
      perfis: {
        Row: {
          email: string | null
          id: string
          nome: string | null
          role: string
        }
        Insert: {
          email?: string | null
          id: string
          nome?: string | null
          role?: string
        }
        Update: {
          email?: string | null
          id?: string
          nome?: string | null
          role?: string
        }
        Relationships: []
      }
      produtos: {
        Row: {
          atributos: Json | null
          categoria: string
          fabricante_id: string | null
          id: string
          sku: string
        }
        Insert: {
          atributos?: Json | null
          categoria: string
          fabricante_id?: string | null
          id?: string
          sku: string
        }
        Update: {
          atributos?: Json | null
          categoria?: string
          fabricante_id?: string | null
          id?: string
          sku?: string
        }
        Relationships: [
          {
            foreignKeyName: "produtos_fabricante_id_fkey"
            columns: ["fabricante_id"]
            isOneToOne: false
            referencedRelation: "fabricantes"
            referencedColumns: ["id"]
          },
        ]
      }
      proposta_itens: {
        Row: {
          categoria: string
          descricao: string
          id: string
          ordem: number
          preco_unitario: number
          produto_id: string | null
          proposta_id: string
          quantidade: number
        }
        Insert: {
          categoria: string
          descricao: string
          id?: string
          ordem?: number
          preco_unitario: number
          produto_id?: string | null
          proposta_id: string
          quantidade?: number
        }
        Update: {
          categoria?: string
          descricao?: string
          id?: string
          ordem?: number
          preco_unitario?: number
          produto_id?: string | null
          proposta_id?: string
          quantidade?: number
        }
        Relationships: [
          {
            foreignKeyName: "proposta_itens_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposta_itens_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "propostas"
            referencedColumns: ["id"]
          },
        ]
      }
      proposta_servicos: {
        Row: {
          id: string
          nome: string
          ordem: number
          preco: number
          proposta_id: string
          recorrencia: string
          servico_id: string | null
        }
        Insert: {
          id?: string
          nome: string
          ordem?: number
          preco: number
          proposta_id: string
          recorrencia: string
          servico_id?: string | null
        }
        Update: {
          id?: string
          nome?: string
          ordem?: number
          preco?: number
          proposta_id?: string
          recorrencia?: string
          servico_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposta_servicos_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "propostas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposta_servicos_servico_id_fkey"
            columns: ["servico_id"]
            isOneToOne: false
            referencedRelation: "servicos"
            referencedColumns: ["id"]
          },
        ]
      }
      propostas: {
        Row: {
          cliente_id: string | null
          condicoes_pagamento: string | null
          criado_em: string | null
          desconto_avista_pct: number
          dimensionamento_id: string | null
          economia_estimada_ano1: number | null
          finalizada_em: string | null
          forma_pagamento: string | null
          id: string
          numero: number
          parcelas: number | null
          payback_meses: number | null
          prazo_instalacao_dias: number | null
          snapshot: Json | null
          status: string | null
          titulo: string | null
          validade_dias: number
          valor_total: number | null
          vendedor_id: string | null
        }
        Insert: {
          cliente_id?: string | null
          condicoes_pagamento?: string | null
          criado_em?: string | null
          desconto_avista_pct?: number
          dimensionamento_id?: string | null
          economia_estimada_ano1?: number | null
          finalizada_em?: string | null
          forma_pagamento?: string | null
          id?: string
          numero?: never
          parcelas?: number | null
          payback_meses?: number | null
          prazo_instalacao_dias?: number | null
          snapshot?: Json | null
          status?: string | null
          titulo?: string | null
          validade_dias?: number
          valor_total?: number | null
          vendedor_id?: string | null
        }
        Update: {
          cliente_id?: string | null
          condicoes_pagamento?: string | null
          criado_em?: string | null
          desconto_avista_pct?: number
          dimensionamento_id?: string | null
          economia_estimada_ano1?: number | null
          finalizada_em?: string | null
          forma_pagamento?: string | null
          id?: string
          numero?: never
          parcelas?: number | null
          payback_meses?: number | null
          prazo_instalacao_dias?: number | null
          snapshot?: Json | null
          status?: string | null
          titulo?: string | null
          validade_dias?: number
          valor_total?: number | null
          vendedor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "propostas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_dimensionamento_id_fkey"
            columns: ["dimensionamento_id"]
            isOneToOne: false
            referencedRelation: "dimensionamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_vendedor_id_fkey"
            columns: ["vendedor_id"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          },
        ]
      }
      servicos: {
        Row: {
          ativo: boolean
          created_at: string
          custo_interno: number | null
          descricao: string | null
          id: string
          nome: string
          preco_padrao: number
          recorrencia_padrao: string
          tempo_execucao_unidade: string | null
          tempo_execucao_valor: number | null
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          custo_interno?: number | null
          descricao?: string | null
          id?: string
          nome: string
          preco_padrao: number
          recorrencia_padrao: string
          tempo_execucao_unidade?: string | null
          tempo_execucao_valor?: number | null
        }
        Update: {
          ativo?: boolean
          created_at?: string
          custo_interno?: number | null
          descricao?: string | null
          id?: string
          nome?: string
          preco_padrao?: number
          recorrencia_padrao?: string
          tempo_execucao_unidade?: string | null
          tempo_execucao_valor?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: { Args: never; Returns: string }
    }
    Enums: {
      categoria_produto:
        | "modulo"
        | "inversor"
        | "estrutura"
        | "string_box"
        | "cabo"
        | "acessorio"
      status_proposta:
        | "rascunho"
        | "enviada"
        | "aprovada"
        | "rejeitada"
        | "expirada"
      user_role: "comercial" | "administrador"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      categoria_produto: [
        "modulo",
        "inversor",
        "estrutura",
        "string_box",
        "cabo",
        "acessorio",
      ],
      status_proposta: [
        "rascunho",
        "enviada",
        "aprovada",
        "rejeitada",
        "expirada",
      ],
      user_role: ["comercial", "administrador"],
    },
  },
} as const
