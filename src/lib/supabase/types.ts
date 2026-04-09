// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string
          entity_type: string
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id: string
          entity_type: string
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string
          entity_type?: string
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cabecalhos_vara: {
        Row: {
          cidade: string | null
          conteudo: string
          created_at: string
          id: string
          updated_at: string
          user_id: string | null
          vara: string
        }
        Insert: {
          cidade?: string | null
          conteudo: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string | null
          vara: string
        }
        Update: {
          cidade?: string | null
          conteudo?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string | null
          vara?: string
        }
        Relationships: []
      }
      captacao_pericias: {
        Row: {
          created_at: string
          data_contato: string
          data_retorno: string | null
          email: string | null
          id: string
          instituicao: string
          nome_contato: string
          observacoes: string | null
          perito_id: string | null
          responsavel_id: string | null
          status: string
          telefone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_contato?: string
          data_retorno?: string | null
          email?: string | null
          id?: string
          instituicao: string
          nome_contato: string
          observacoes?: string | null
          perito_id?: string | null
          responsavel_id?: string | null
          status?: string
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_contato?: string
          data_retorno?: string | null
          email?: string | null
          id?: string
          instituicao?: string
          nome_contato?: string
          observacoes?: string | null
          perito_id?: string | null
          responsavel_id?: string | null
          status?: string
          telefone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "captacao_pericias_perito_id_fkey"
            columns: ["perito_id"]
            isOneToOne: false
            referencedRelation: "peritos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "captacao_pericias_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contatos: {
        Row: {
          codigo_id: string | null
          created_at: string
          email: string | null
          endereco: string | null
          id: string
          nome: string
          observacoes: string | null
          telefone: string | null
          telefone_alternativo: string | null
          telefone_celular: string | null
          tipo: string
          updated_at: string
        }
        Insert: {
          codigo_id?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          telefone?: string | null
          telefone_alternativo?: string | null
          telefone_celular?: string | null
          tipo?: string
          updated_at?: string
        }
        Update: {
          codigo_id?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          telefone?: string | null
          telefone_alternativo?: string | null
          telefone_celular?: string | null
          tipo?: string
          updated_at?: string
        }
        Relationships: []
      }
      historico_documentos: {
        Row: {
          created_at: string
          id: string
          nome_documento: string
          pericia_id: string
          tipo_documento: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          nome_documento: string
          pericia_id: string
          tipo_documento: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          nome_documento?: string
          pericia_id?: string
          tipo_documento?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "historico_documentos_pericia_id_fkey"
            columns: ["pericia_id"]
            isOneToOne: false
            referencedRelation: "pericias"
            referencedColumns: ["id"]
          },
        ]
      }
      lancamento_categorias: {
        Row: {
          created_at: string
          id: string
          nome: string
          tipo: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
          tipo: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
          tipo?: string
        }
        Relationships: []
      }
      lancamentos: {
        Row: {
          anexo_nome: string | null
          anexo_url: string | null
          categoria: string
          created_at: string
          data: string
          descricao: string
          frequencia_recorrencia: string | null
          id: string
          parcelas: number | null
          pericia_id: string | null
          perito_id: string | null
          recorrente: boolean | null
          responsavel_id: string | null
          status: string
          tipo: string
          updated_at: string
          valor: number
        }
        Insert: {
          anexo_nome?: string | null
          anexo_url?: string | null
          categoria: string
          created_at?: string
          data: string
          descricao: string
          frequencia_recorrencia?: string | null
          id?: string
          parcelas?: number | null
          pericia_id?: string | null
          perito_id?: string | null
          recorrente?: boolean | null
          responsavel_id?: string | null
          status: string
          tipo: string
          updated_at?: string
          valor?: number
        }
        Update: {
          anexo_nome?: string | null
          anexo_url?: string | null
          categoria?: string
          created_at?: string
          data?: string
          descricao?: string
          frequencia_recorrencia?: string | null
          id?: string
          parcelas?: number | null
          pericia_id?: string | null
          perito_id?: string | null
          recorrente?: boolean | null
          responsavel_id?: string | null
          status?: string
          tipo?: string
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "lancamentos_pericia_id_fkey"
            columns: ["pericia_id"]
            isOneToOne: false
            referencedRelation: "pericias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lancamentos_perito_id_fkey"
            columns: ["perito_id"]
            isOneToOne: false
            referencedRelation: "peritos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lancamentos_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notificacoes: {
        Row: {
          created_at: string
          descricao: string | null
          id: string
          lida: boolean | null
          link: string | null
          titulo: string
          user_id: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          id?: string
          lida?: boolean | null
          link?: string | null
          titulo: string
          user_id: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          id?: string
          lida?: boolean | null
          link?: string | null
          titulo?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notificacoes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pericia_anexos: {
        Row: {
          content_type: string
          created_at: string
          created_by: string | null
          file_name: string
          file_path: string
          id: string
          pericia_id: string
          size: number
        }
        Insert: {
          content_type: string
          created_at?: string
          created_by?: string | null
          file_name: string
          file_path: string
          id?: string
          pericia_id: string
          size: number
        }
        Update: {
          content_type?: string
          created_at?: string
          created_by?: string | null
          file_name?: string
          file_path?: string
          id?: string
          pericia_id?: string
          size?: number
        }
        Relationships: [
          {
            foreignKeyName: "pericia_anexos_pericia_id_fkey"
            columns: ["pericia_id"]
            isOneToOne: false
            referencedRelation: "pericias"
            referencedColumns: ["id"]
          },
        ]
      }
      pericia_mensagens: {
        Row: {
          created_at: string
          id: string
          mensagem: string
          pericia_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mensagem: string
          pericia_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mensagem?: string
          pericia_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pericia_mensagens_pericia_id_fkey"
            columns: ["pericia_id"]
            isOneToOne: false
            referencedRelation: "pericias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pericia_mensagens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pericias: {
        Row: {
          aceite: string | null
          adiantamento_solicitado: boolean | null
          advogado_autora: string | null
          advogado_re: string | null
          assistente_autora: string | null
          assistente_re: string | null
          checklist: Json | null
          cidade: string | null
          codigo_interno: string | null
          contato_perito_id: string | null
          created_at: string
          data_aceite: string | null
          data_entrega_laudo: string | null
          data_impugnacao: string | null
          data_nomeacao: string | null
          data_pagamento: string | null
          data_pericia: string | null
          descricao_impugnacao: string | null
          dias_impugnacao: number | null
          endereco: string | null
          entrega_esclarecimentos: string | null
          entrega_impugnacao: string | null
          honorarios: number | null
          honorarios_parcelados: boolean | null
          id: string
          juiz: string | null
          justica_gratuita: boolean | null
          justificativa_recusa: string | null
          limites_esclarecimentos: string | null
          link_nuvem: string | null
          numero_processo: string | null
          observacoes: string | null
          perito_associado: string | null
          perito_id: string | null
          peticoes: Json | null
          prazo_entrega: string | null
          quantidade_parcelas: number | null
          status: string | null
          status_pagamento: string | null
          updated_at: string
          vara: string | null
        }
        Insert: {
          aceite?: string | null
          adiantamento_solicitado?: boolean | null
          advogado_autora?: string | null
          advogado_re?: string | null
          assistente_autora?: string | null
          assistente_re?: string | null
          checklist?: Json | null
          cidade?: string | null
          codigo_interno?: string | null
          contato_perito_id?: string | null
          created_at?: string
          data_aceite?: string | null
          data_entrega_laudo?: string | null
          data_impugnacao?: string | null
          data_nomeacao?: string | null
          data_pagamento?: string | null
          data_pericia?: string | null
          descricao_impugnacao?: string | null
          dias_impugnacao?: number | null
          endereco?: string | null
          entrega_esclarecimentos?: string | null
          entrega_impugnacao?: string | null
          honorarios?: number | null
          honorarios_parcelados?: boolean | null
          id?: string
          juiz?: string | null
          justica_gratuita?: boolean | null
          justificativa_recusa?: string | null
          limites_esclarecimentos?: string | null
          link_nuvem?: string | null
          numero_processo?: string | null
          observacoes?: string | null
          perito_associado?: string | null
          perito_id?: string | null
          peticoes?: Json | null
          prazo_entrega?: string | null
          quantidade_parcelas?: number | null
          status?: string | null
          status_pagamento?: string | null
          updated_at?: string
          vara?: string | null
        }
        Update: {
          aceite?: string | null
          adiantamento_solicitado?: boolean | null
          advogado_autora?: string | null
          advogado_re?: string | null
          assistente_autora?: string | null
          assistente_re?: string | null
          checklist?: Json | null
          cidade?: string | null
          codigo_interno?: string | null
          contato_perito_id?: string | null
          created_at?: string
          data_aceite?: string | null
          data_entrega_laudo?: string | null
          data_impugnacao?: string | null
          data_nomeacao?: string | null
          data_pagamento?: string | null
          data_pericia?: string | null
          descricao_impugnacao?: string | null
          dias_impugnacao?: number | null
          endereco?: string | null
          entrega_esclarecimentos?: string | null
          entrega_impugnacao?: string | null
          honorarios?: number | null
          honorarios_parcelados?: boolean | null
          id?: string
          juiz?: string | null
          justica_gratuita?: boolean | null
          justificativa_recusa?: string | null
          limites_esclarecimentos?: string | null
          link_nuvem?: string | null
          numero_processo?: string | null
          observacoes?: string | null
          perito_associado?: string | null
          perito_id?: string | null
          peticoes?: Json | null
          prazo_entrega?: string | null
          quantidade_parcelas?: number | null
          status?: string | null
          status_pagamento?: string | null
          updated_at?: string
          vara?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pericias_contato_perito_id_fkey"
            columns: ["contato_perito_id"]
            isOneToOne: false
            referencedRelation: "contatos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pericias_perito_id_fkey"
            columns: ["perito_id"]
            isOneToOne: false
            referencedRelation: "peritos"
            referencedColumns: ["id"]
          },
        ]
      }
      peritos: {
        Row: {
          aceite: string | null
          agencia: string | null
          area_atuacao: string | null
          bairro: string | null
          banco: string | null
          cep: string | null
          chave_pix: string | null
          cidade_estado: string | null
          codigo_id: string | null
          conta: string | null
          cpf: string | null
          crea: string | null
          created_at: string
          data_inicio: string | null
          data_nascimento: string | null
          email: string | null
          endereco: string | null
          especialidade: string | null
          id: string
          justificativa_recusa: string | null
          nome: string
          numero: string | null
          observacoes: string | null
          rg: string | null
          status: string | null
          telefone: string | null
          telefone_alternativo: string | null
          updated_at: string
        }
        Insert: {
          aceite?: string | null
          agencia?: string | null
          area_atuacao?: string | null
          bairro?: string | null
          banco?: string | null
          cep?: string | null
          chave_pix?: string | null
          cidade_estado?: string | null
          codigo_id?: string | null
          conta?: string | null
          cpf?: string | null
          crea?: string | null
          created_at?: string
          data_inicio?: string | null
          data_nascimento?: string | null
          email?: string | null
          endereco?: string | null
          especialidade?: string | null
          id?: string
          justificativa_recusa?: string | null
          nome: string
          numero?: string | null
          observacoes?: string | null
          rg?: string | null
          status?: string | null
          telefone?: string | null
          telefone_alternativo?: string | null
          updated_at?: string
        }
        Update: {
          aceite?: string | null
          agencia?: string | null
          area_atuacao?: string | null
          bairro?: string | null
          banco?: string | null
          cep?: string | null
          chave_pix?: string | null
          cidade_estado?: string | null
          codigo_id?: string | null
          conta?: string | null
          cpf?: string | null
          crea?: string | null
          created_at?: string
          data_inicio?: string | null
          data_nascimento?: string | null
          email?: string | null
          endereco?: string | null
          especialidade?: string | null
          id?: string
          justificativa_recusa?: string | null
          nome?: string
          numero?: string | null
          observacoes?: string | null
          rg?: string | null
          status?: string | null
          telefone?: string | null
          telefone_alternativo?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      peticao_templates: {
        Row: {
          conteudo: string
          created_at: string
          id: string
          is_system: boolean | null
          nome: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          conteudo: string
          created_at?: string
          id?: string
          is_system?: boolean | null
          nome: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          conteudo?: string
          created_at?: string
          id?: string
          is_system?: boolean | null
          nome?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          name: string | null
          role: string | null
          signature_url: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          id: string
          name?: string | null
          role?: string | null
          signature_url?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          role?: string | null
          signature_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      tarefa_comentarios: {
        Row: {
          anexo_nome: string | null
          anexo_url: string | null
          comentario: string
          created_at: string
          id: string
          tarefa_id: string
          user_id: string
        }
        Insert: {
          anexo_nome?: string | null
          anexo_url?: string | null
          comentario: string
          created_at?: string
          id?: string
          tarefa_id: string
          user_id: string
        }
        Update: {
          anexo_nome?: string | null
          anexo_url?: string | null
          comentario?: string
          created_at?: string
          id?: string
          tarefa_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tarefa_comentarios_tarefa_id_fkey"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "tarefas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefa_comentarios_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tarefas: {
        Row: {
          created_at: string
          data_entrega: string | null
          descricao: string | null
          finalizado: boolean | null
          id: string
          pericia_id: string | null
          perito_associado_id: string | null
          responsavel_id: string | null
          status: string | null
          titulo: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_entrega?: string | null
          descricao?: string | null
          finalizado?: boolean | null
          id?: string
          pericia_id?: string | null
          perito_associado_id?: string | null
          responsavel_id?: string | null
          status?: string | null
          titulo: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_entrega?: string | null
          descricao?: string | null
          finalizado?: boolean | null
          id?: string
          pericia_id?: string | null
          perito_associado_id?: string | null
          responsavel_id?: string | null
          status?: string | null
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tarefas_pericia_id_fkey"
            columns: ["pericia_id"]
            isOneToOne: false
            referencedRelation: "pericias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefas_perito_associado_id_fkey"
            columns: ["perito_associado_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefas_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: { user_id: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const


// ====== DATABASE EXTENDED CONTEXT (auto-generated) ======
// This section contains actual PostgreSQL column types, constraints, RLS policies,
// functions, triggers, indexes and materialized views not present in the type definitions above.
// IMPORTANT: The TypeScript types above map UUID, TEXT, VARCHAR all to "string".
// Use the COLUMN TYPES section below to know the real PostgreSQL type for each column.
// Always use the correct PostgreSQL type when writing SQL migrations.

// --- COLUMN TYPES (actual PostgreSQL types) ---
// Use this to know the real database type when writing migrations.
// "string" in TypeScript types above may be uuid, text, varchar, timestamptz, etc.
// Table: activity_logs
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (nullable)
//   action: text (not null)
//   entity_type: text (not null)
//   entity_id: uuid (not null)
//   details: jsonb (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: cabecalhos_vara
//   id: uuid (not null, default: gen_random_uuid())
//   vara: text (not null)
//   cidade: text (nullable)
//   conteudo: text (not null)
//   user_id: uuid (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: captacao_pericias
//   id: uuid (not null, default: gen_random_uuid())
//   data_contato: timestamp with time zone (not null, default: now())
//   nome_contato: text (not null)
//   instituicao: text (not null)
//   perito_id: uuid (nullable)
//   responsavel_id: uuid (nullable)
//   telefone: text (nullable)
//   email: text (nullable)
//   status: text (not null, default: 'Pendente'::text)
//   data_retorno: timestamp with time zone (nullable)
//   observacoes: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: contatos
//   id: uuid (not null, default: gen_random_uuid())
//   tipo: text (not null, default: 'Outros'::text)
//   nome: text (not null)
//   telefone: text (nullable)
//   email: text (nullable)
//   endereco: text (nullable)
//   observacoes: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
//   telefone_celular: text (nullable)
//   telefone_alternativo: text (nullable)
//   codigo_id: text (nullable)
// Table: historico_documentos
//   id: uuid (not null, default: gen_random_uuid())
//   pericia_id: uuid (not null)
//   tipo_documento: text (not null)
//   nome_documento: text (not null)
//   user_id: uuid (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: lancamento_categorias
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (not null)
//   tipo: text (not null)
//   created_at: timestamp with time zone (not null, default: now())
// Table: lancamentos
//   id: uuid (not null, default: gen_random_uuid())
//   data: timestamp with time zone (not null)
//   tipo: text (not null)
//   categoria: text (not null)
//   descricao: text (not null)
//   valor: numeric (not null, default: 0)
//   pericia_id: uuid (nullable)
//   status: text (not null)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
//   responsavel_id: uuid (nullable)
//   recorrente: boolean (nullable, default: false)
//   frequencia_recorrencia: text (nullable)
//   parcelas: integer (nullable)
//   anexo_url: text (nullable)
//   anexo_nome: text (nullable)
//   perito_id: uuid (nullable)
// Table: notificacoes
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   titulo: text (not null)
//   descricao: text (nullable)
//   link: text (nullable)
//   lida: boolean (nullable, default: false)
//   created_at: timestamp with time zone (not null, default: now())
// Table: pericia_anexos
//   id: uuid (not null, default: gen_random_uuid())
//   pericia_id: uuid (not null)
//   file_name: text (not null)
//   file_path: text (not null)
//   content_type: text (not null)
//   size: bigint (not null)
//   created_at: timestamp with time zone (not null, default: now())
//   created_by: uuid (nullable)
// Table: pericia_mensagens
//   id: uuid (not null, default: gen_random_uuid())
//   pericia_id: uuid (not null)
//   user_id: uuid (not null)
//   mensagem: text (not null)
//   created_at: timestamp with time zone (not null, default: now())
// Table: pericias
//   id: uuid (not null, default: gen_random_uuid())
//   codigo_interno: text (nullable)
//   numero_processo: text (nullable)
//   vara: text (nullable)
//   cidade: text (nullable)
//   data_nomeacao: timestamp with time zone (nullable)
//   data_pericia: timestamp with time zone (nullable)
//   data_entrega_laudo: timestamp with time zone (nullable)
//   juiz: text (nullable)
//   advogado_autora: text (nullable)
//   advogado_re: text (nullable)
//   assistente_autora: text (nullable)
//   assistente_re: text (nullable)
//   honorarios: numeric (nullable)
//   endereco: text (nullable)
//   observacoes: text (nullable)
//   checklist: jsonb (nullable, default: '[]'::jsonb)
//   link_nuvem: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
//   status: text (nullable, default: 'Agendado'::text)
//   justica_gratuita: boolean (nullable, default: false)
//   perito_associado: text (nullable)
//   descricao_impugnacao: text (nullable)
//   data_impugnacao: timestamp with time zone (nullable)
//   dias_impugnacao: integer (nullable)
//   prazo_entrega: timestamp with time zone (nullable)
//   entrega_impugnacao: timestamp with time zone (nullable)
//   limites_esclarecimentos: text (nullable)
//   entrega_esclarecimentos: timestamp with time zone (nullable)
//   perito_id: uuid (nullable)
//   contato_perito_id: uuid (nullable)
//   status_pagamento: text (nullable, default: 'Pendente'::text)
//   honorarios_parcelados: boolean (nullable, default: false)
//   quantidade_parcelas: integer (nullable)
//   adiantamento_solicitado: boolean (nullable, default: false)
//   peticoes: jsonb (nullable, default: '[]'::jsonb)
//   data_aceite: timestamp with time zone (nullable)
//   data_pagamento: timestamp with time zone (nullable)
//   aceite: text (nullable, default: 'Pendente'::text)
//   justificativa_recusa: text (nullable)
// Table: peritos
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (not null)
//   email: text (nullable)
//   telefone: text (nullable)
//   endereco: text (nullable)
//   especialidade: text (nullable)
//   status: text (nullable, default: 'Ativo'::text)
//   data_inicio: date (nullable, default: CURRENT_DATE)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
//   cpf: text (nullable)
//   rg: text (nullable)
//   data_nascimento: date (nullable)
//   crea: text (nullable)
//   telefone_alternativo: text (nullable)
//   chave_pix: text (nullable)
//   banco: text (nullable)
//   agencia: text (nullable)
//   conta: text (nullable)
//   codigo_id: text (nullable)
//   observacoes: text (nullable)
//   numero: text (nullable)
//   cep: text (nullable)
//   cidade_estado: text (nullable)
//   bairro: text (nullable)
//   area_atuacao: text (nullable)
//   aceite: text (nullable, default: 'Aceito'::text)
//   justificativa_recusa: text (nullable)
// Table: peticao_templates
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (not null)
//   conteudo: text (not null)
//   user_id: uuid (nullable)
//   is_system: boolean (nullable, default: false)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: profiles
//   id: uuid (not null)
//   email: text (not null)
//   name: text (nullable)
//   role: text (nullable, default: 'user'::text)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
//   avatar_url: text (nullable)
//   signature_url: text (nullable)
// Table: tarefa_comentarios
//   id: uuid (not null, default: gen_random_uuid())
//   tarefa_id: uuid (not null)
//   user_id: uuid (not null)
//   comentario: text (not null)
//   created_at: timestamp with time zone (not null, default: now())
//   anexo_url: text (nullable)
//   anexo_nome: text (nullable)
// Table: tarefas
//   id: uuid (not null, default: gen_random_uuid())
//   titulo: text (not null)
//   descricao: text (nullable)
//   status: text (nullable, default: 'Pendente'::text)
//   pericia_id: uuid (nullable)
//   responsavel_id: uuid (nullable)
//   data_entrega: timestamp with time zone (nullable)
//   finalizado: boolean (nullable, default: false)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
//   perito_associado_id: uuid (nullable)

// --- CONSTRAINTS ---
// Table: activity_logs
//   PRIMARY KEY activity_logs_pkey: PRIMARY KEY (id)
//   FOREIGN KEY activity_logs_user_id_fkey: FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL
// Table: cabecalhos_vara
//   PRIMARY KEY cabecalhos_vara_pkey: PRIMARY KEY (id)
//   FOREIGN KEY cabecalhos_vara_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: captacao_pericias
//   FOREIGN KEY captacao_pericias_perito_id_fkey: FOREIGN KEY (perito_id) REFERENCES peritos(id) ON DELETE SET NULL
//   PRIMARY KEY captacao_pericias_pkey: PRIMARY KEY (id)
//   FOREIGN KEY captacao_pericias_responsavel_id_fkey: FOREIGN KEY (responsavel_id) REFERENCES profiles(id) ON DELETE SET NULL
// Table: contatos
//   PRIMARY KEY contatos_pkey: PRIMARY KEY (id)
// Table: historico_documentos
//   FOREIGN KEY historico_documentos_pericia_id_fkey: FOREIGN KEY (pericia_id) REFERENCES pericias(id) ON DELETE CASCADE
//   PRIMARY KEY historico_documentos_pkey: PRIMARY KEY (id)
//   FOREIGN KEY historico_documentos_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: lancamento_categorias
//   PRIMARY KEY lancamento_categorias_pkey: PRIMARY KEY (id)
//   CHECK lancamento_categorias_tipo_check: CHECK ((tipo = ANY (ARRAY['receita'::text, 'despesa'::text])))
// Table: lancamentos
//   FOREIGN KEY lancamentos_pericia_id_fkey: FOREIGN KEY (pericia_id) REFERENCES pericias(id) ON DELETE SET NULL
//   FOREIGN KEY lancamentos_perito_id_fkey: FOREIGN KEY (perito_id) REFERENCES peritos(id) ON DELETE SET NULL
//   PRIMARY KEY lancamentos_pkey: PRIMARY KEY (id)
//   FOREIGN KEY lancamentos_responsavel_id_fkey: FOREIGN KEY (responsavel_id) REFERENCES profiles(id) ON DELETE SET NULL
//   CHECK lancamentos_status_check: CHECK ((status = ANY (ARRAY['pendente'::text, 'pago'::text, 'recebido'::text])))
//   CHECK lancamentos_tipo_check: CHECK ((tipo = ANY (ARRAY['receita'::text, 'despesa'::text])))
// Table: notificacoes
//   PRIMARY KEY notificacoes_pkey: PRIMARY KEY (id)
//   FOREIGN KEY notificacoes_user_id_fkey: FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
// Table: pericia_anexos
//   FOREIGN KEY pericia_anexos_created_by_fkey: FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL
//   FOREIGN KEY pericia_anexos_pericia_id_fkey: FOREIGN KEY (pericia_id) REFERENCES pericias(id) ON DELETE CASCADE
//   PRIMARY KEY pericia_anexos_pkey: PRIMARY KEY (id)
// Table: pericia_mensagens
//   FOREIGN KEY pericia_mensagens_pericia_id_fkey: FOREIGN KEY (pericia_id) REFERENCES pericias(id) ON DELETE CASCADE
//   PRIMARY KEY pericia_mensagens_pkey: PRIMARY KEY (id)
//   FOREIGN KEY pericia_mensagens_user_id_fkey: FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
// Table: pericias
//   FOREIGN KEY pericias_contato_perito_id_fkey: FOREIGN KEY (contato_perito_id) REFERENCES contatos(id) ON DELETE SET NULL
//   FOREIGN KEY pericias_perito_id_fkey: FOREIGN KEY (perito_id) REFERENCES peritos(id) ON DELETE SET NULL
//   PRIMARY KEY pericias_pkey: PRIMARY KEY (id)
// Table: peritos
//   UNIQUE peritos_codigo_id_key: UNIQUE (codigo_id)
//   PRIMARY KEY peritos_pkey: PRIMARY KEY (id)
// Table: peticao_templates
//   PRIMARY KEY peticao_templates_pkey: PRIMARY KEY (id)
//   FOREIGN KEY peticao_templates_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: profiles
//   FOREIGN KEY profiles_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY profiles_pkey: PRIMARY KEY (id)
// Table: tarefa_comentarios
//   PRIMARY KEY tarefa_comentarios_pkey: PRIMARY KEY (id)
//   FOREIGN KEY tarefa_comentarios_tarefa_id_fkey: FOREIGN KEY (tarefa_id) REFERENCES tarefas(id) ON DELETE CASCADE
//   FOREIGN KEY tarefa_comentarios_user_id_fkey: FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
// Table: tarefas
//   FOREIGN KEY tarefas_pericia_id_fkey: FOREIGN KEY (pericia_id) REFERENCES pericias(id) ON DELETE SET NULL
//   FOREIGN KEY tarefas_perito_associado_id_fkey: FOREIGN KEY (perito_associado_id) REFERENCES profiles(id) ON DELETE SET NULL
//   PRIMARY KEY tarefas_pkey: PRIMARY KEY (id)
//   FOREIGN KEY tarefas_responsavel_id_fkey: FOREIGN KEY (responsavel_id) REFERENCES profiles(id) ON DELETE SET NULL

// --- ROW LEVEL SECURITY POLICIES ---
// Table: activity_logs
//   Policy "authenticated_insert_logs" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "authenticated_select_logs" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: is_admin(auth.uid())
// Table: cabecalhos_vara
//   Policy "authenticated_delete_cabecalhos" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (user_id = auth.uid())
//   Policy "authenticated_insert_cabecalhos" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (user_id = auth.uid())
//   Policy "authenticated_select_cabecalhos" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_update_cabecalhos" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (user_id = auth.uid())
//     WITH CHECK: (user_id = auth.uid())
// Table: captacao_pericias
//   Policy "authenticated_delete_captacao" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_insert_captacao" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "authenticated_select_captacao" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_update_captacao" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: contatos
//   Policy "authenticated_all_contatos" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: historico_documentos
//   Policy "authenticated_insert_historico" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "authenticated_select_historico" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: lancamento_categorias
//   Policy "authenticated_insert_categorias" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "authenticated_select_categorias" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: lancamentos
//   Policy "authenticated_delete_lancamentos" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: is_admin(auth.uid())
//   Policy "authenticated_insert_lancamentos" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: is_admin(auth.uid())
//   Policy "authenticated_select_lancamentos" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (is_admin(auth.uid()) OR (responsavel_id = auth.uid()))
//   Policy "authenticated_update_lancamentos" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: is_admin(auth.uid())
//     WITH CHECK: is_admin(auth.uid())
// Table: notificacoes
//   Policy "notificacoes_delete_own" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = user_id)
//   Policy "notificacoes_insert_internal" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "notificacoes_select_own" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = user_id)
//   Policy "notificacoes_update_own" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = user_id)
//     WITH CHECK: (auth.uid() = user_id)
// Table: pericia_anexos
//   Policy "authenticated_delete_anexos" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_insert_anexos" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "authenticated_select_anexos" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: pericia_mensagens
//   Policy "authenticated_all_mensagens" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: pericias
//   Policy "authenticated_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "authenticated_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: peritos
//   Policy "authenticated_all_peritos" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: peticao_templates
//   Policy "authenticated_delete_templates" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (user_id = auth.uid())
//   Policy "authenticated_insert_templates" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (user_id = auth.uid())
//   Policy "authenticated_select_templates" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((is_system = true) OR (user_id = auth.uid()))
//   Policy "authenticated_update_templates" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (user_id = auth.uid())
//     WITH CHECK: (user_id = auth.uid())
// Table: profiles
//   Policy "profiles_read_all" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "profiles_update_admin" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: is_admin(auth.uid())
//     WITH CHECK: is_admin(auth.uid())
//   Policy "profiles_update_own" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = id)
// Table: tarefa_comentarios
//   Policy "authenticated_all_tarefa_comentarios" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: tarefas
//   Policy "tarefas_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: is_admin(auth.uid())
//   Policy "tarefas_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: is_admin(auth.uid())
//   Policy "tarefas_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (is_admin(auth.uid()) OR (perito_associado_id = auth.uid()) OR (responsavel_id = auth.uid()))
//   Policy "tarefas_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (is_admin(auth.uid()) OR (perito_associado_id = auth.uid()) OR (responsavel_id = auth.uid()))

// --- DATABASE FUNCTIONS ---
// FUNCTION generate_codigo_interno()
//   CREATE OR REPLACE FUNCTION public.generate_codigo_interno()
//    RETURNS trigger
//    LANGUAGE plpgsql
//   AS $function$
//   DECLARE
//     v_year text;
//     v_seq int;
//     v_last_code text;
//     v_seq_str text;
//   BEGIN
//     IF NEW.codigo_interno IS NULL OR NEW.codigo_interno = '' THEN
//       v_year := to_char(CURRENT_DATE, 'YYYY');
//       
//       -- Find the last generated code for the current year
//       SELECT codigo_interno INTO v_last_code
//       FROM public.pericias
//       WHERE codigo_interno ~ ('^PER-' || v_year || '-\d+
)
//       ORDER BY length(codigo_interno) DESC, codigo_interno DESC
//       LIMIT 1;
//   
//       IF v_last_code IS NOT NULL THEN
//         -- Extract the numeric sequence and increment
//         v_seq_str := regexp_replace(v_last_code, '^PER-\d{4}-', '');
//         v_seq := cast(v_seq_str as int) + 1;
//       ELSE
//         v_seq := 1;
//       END IF;
//   
//       -- Format to PER-YYYY-SEQ (ex: PER-2024-001)
//       NEW.codigo_interno := 'PER-' || v_year || '-' || lpad(v_seq::text, 3, '0');
//     END IF;
//     RETURN NEW;
//   END;
//   $function$
//   
// FUNCTION handle_new_user()
//   CREATE OR REPLACE FUNCTION public.handle_new_user()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     INSERT INTO public.profiles (id, email, name, role)
//     VALUES (
//       NEW.id,
//       NEW.email,
//       COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
//       COALESCE(NEW.raw_user_meta_data->>'role', 'Administrador')
//     );
//     RETURN NEW;
//   END;
//   $function$
//   
// FUNCTION is_admin(uuid)
//   CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
//    RETURNS boolean
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     user_role text;
//   BEGIN
//     SELECT role INTO user_role FROM public.profiles WHERE id = user_id;
//     RETURN user_role IN ('Administrador', 'administrador', 'Gerente', 'Gestor');
//   END;
//   $function$
//   
// FUNCTION log_lancamento_activity()
//   CREATE OR REPLACE FUNCTION public.log_lancamento_activity()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//       current_user_id UUID;
//   BEGIN
//       current_user_id := auth.uid();
//       
//       IF TG_OP = 'INSERT' THEN
//           INSERT INTO public.activity_logs (user_id, action, entity_type, entity_id, details)
//           VALUES (current_user_id, 'criou', 'lançamento', NEW.id, jsonb_build_object('descricao', NEW.descricao, 'valor', NEW.valor));
//       ELSIF TG_OP = 'UPDATE' THEN
//           IF NEW IS DISTINCT FROM OLD THEN
//               INSERT INTO public.activity_logs (user_id, action, entity_type, entity_id, details)
//               VALUES (current_user_id, 'atualizou', 'lançamento', NEW.id, jsonb_build_object('descricao', NEW.descricao, 'valor', NEW.valor));
//           END IF;
//       ELSIF TG_OP = 'DELETE' THEN
//           INSERT INTO public.activity_logs (user_id, action, entity_type, entity_id, details)
//           VALUES (current_user_id, 'excluiu', 'lançamento', OLD.id, jsonb_build_object('descricao', OLD.descricao, 'valor', OLD.valor));
//       END IF;
//       
//       RETURN COALESCE(NEW, OLD);
//   END;
//   $function$
//   
// FUNCTION log_pericia_activity()
//   CREATE OR REPLACE FUNCTION public.log_pericia_activity()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//       current_user_id UUID;
//       changed_fields JSONB;
//   BEGIN
//       current_user_id := auth.uid();
//       
//       IF TG_OP = 'INSERT' THEN
//           INSERT INTO public.activity_logs (user_id, action, entity_type, entity_id, details)
//           VALUES (current_user_id, 'criou', 'perícia', NEW.id, jsonb_build_object('numero_processo', NEW.numero_processo));
//       ELSIF TG_OP = 'UPDATE' THEN
//           IF NEW IS DISTINCT FROM OLD THEN
//               changed_fields := '{}'::jsonb;
//               
//               IF NEW.status IS DISTINCT FROM OLD.status THEN
//                   changed_fields := changed_fields || jsonb_build_object('status', NEW.status, 'status_anterior', OLD.status);
//               END IF;
//               
//               IF NEW.status_pagamento IS DISTINCT FROM OLD.status_pagamento THEN
//                   changed_fields := changed_fields || jsonb_build_object('status_pagamento', NEW.status_pagamento, 'status_pagamento_anterior', OLD.status_pagamento);
//               END IF;
//   
//               IF NEW.perito_id IS DISTINCT FROM OLD.perito_id THEN
//                   changed_fields := changed_fields || jsonb_build_object('perito_id', 'Atualizado');
//               END IF;
//   
//               IF NEW.checklist IS DISTINCT FROM OLD.checklist THEN
//                   changed_fields := changed_fields || jsonb_build_object('tarefas', 'Atualizadas');
//               END IF;
//               
//               IF changed_fields = '{}'::jsonb THEN
//                   changed_fields := jsonb_build_object('atualizacao', 'geral');
//               END IF;
//   
//               INSERT INTO public.activity_logs (user_id, action, entity_type, entity_id, details)
//               VALUES (current_user_id, 'atualizou', 'perícia', NEW.id, changed_fields);
//           END IF;
//       ELSIF TG_OP = 'DELETE' THEN
//           INSERT INTO public.activity_logs (user_id, action, entity_type, entity_id, details)
//           VALUES (current_user_id, 'excluiu', 'perícia', OLD.id, jsonb_build_object('numero_processo', OLD.numero_processo));
//       END IF;
//       
//       RETURN COALESCE(NEW, OLD);
//   END;
//   $function$
//   
// FUNCTION notify_tarefa_comentario()
//   CREATE OR REPLACE FUNCTION public.notify_tarefa_comentario()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//       v_responsavel_id UUID;
//       v_perito_associado_id UUID;
//       v_titulo TEXT;
//   BEGIN
//       SELECT responsavel_id, perito_associado_id, titulo 
//       INTO v_responsavel_id, v_perito_associado_id, v_titulo 
//       FROM public.tarefas 
//       WHERE id = NEW.tarefa_id;
//   
//       -- Notify responsavel if it's not them who commented
//       IF v_responsavel_id IS NOT NULL AND v_responsavel_id != NEW.user_id THEN
//           INSERT INTO public.notificacoes (user_id, titulo, descricao, link)
//           VALUES (v_responsavel_id, 'Novo Comentário', 'Novo comentário na tarefa "' || v_titulo || '"', '/tarefas');
//       END IF;
//       
//       -- Notify perito associado if it's not them who commented
//       IF v_perito_associado_id IS NOT NULL AND v_perito_associado_id != NEW.user_id THEN
//           INSERT INTO public.notificacoes (user_id, titulo, descricao, link)
//           VALUES (v_perito_associado_id, 'Novo Comentário', 'Novo comentário na tarefa "' || v_titulo || '"', '/tarefas');
//       END IF;
//   
//       RETURN NEW;
//   END;
//   $function$
//   
// FUNCTION notify_tarefa_status_change()
//   CREATE OR REPLACE FUNCTION public.notify_tarefa_status_change()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//       v_creator_id UUID;
//   BEGIN
//       v_creator_id := auth.uid();
//       
//       IF OLD.status IS DISTINCT FROM NEW.status THEN
//           -- Notify responsavel if it's not them who changed
//           IF NEW.responsavel_id IS NOT NULL AND NEW.responsavel_id != v_creator_id THEN
//               INSERT INTO public.notificacoes (user_id, titulo, descricao, link)
//               VALUES (NEW.responsavel_id, 'Status da Tarefa Atualizado', 'A tarefa "' || NEW.titulo || '" mudou para ' || NEW.status, '/tarefas');
//           END IF;
//           
//           -- Notify perito associado if it's not them who changed
//           IF NEW.perito_associado_id IS NOT NULL AND NEW.perito_associado_id != v_creator_id THEN
//               INSERT INTO public.notificacoes (user_id, titulo, descricao, link)
//               VALUES (NEW.perito_associado_id, 'Status da Tarefa Atualizado', 'A tarefa "' || NEW.titulo || '" mudou para ' || NEW.status, '/tarefas');
//           END IF;
//       END IF;
//       
//       RETURN NEW;
//   END;
//   $function$
//   

// --- TRIGGERS ---
// Table: lancamentos
//   lancamentos_activity_trigger: CREATE TRIGGER lancamentos_activity_trigger AFTER INSERT OR DELETE OR UPDATE ON public.lancamentos FOR EACH ROW EXECUTE FUNCTION log_lancamento_activity()
// Table: pericias
//   pericias_activity_trigger: CREATE TRIGGER pericias_activity_trigger AFTER INSERT OR DELETE OR UPDATE ON public.pericias FOR EACH ROW EXECUTE FUNCTION log_pericia_activity()
//   set_codigo_interno: CREATE TRIGGER set_codigo_interno BEFORE INSERT ON public.pericias FOR EACH ROW EXECUTE FUNCTION generate_codigo_interno()
// Table: tarefa_comentarios
//   trigger_notify_tarefa_comentario: CREATE TRIGGER trigger_notify_tarefa_comentario AFTER INSERT ON public.tarefa_comentarios FOR EACH ROW EXECUTE FUNCTION notify_tarefa_comentario()
// Table: tarefas
//   trigger_notify_tarefa_status_change: CREATE TRIGGER trigger_notify_tarefa_status_change AFTER UPDATE ON public.tarefas FOR EACH ROW EXECUTE FUNCTION notify_tarefa_status_change()

// --- INDEXES ---
// Table: pericia_anexos
//   CREATE INDEX idx_pericia_anexos_pericia_id ON public.pericia_anexos USING btree (pericia_id)
// Table: peritos
//   CREATE UNIQUE INDEX peritos_codigo_id_key ON public.peritos USING btree (codigo_id)

