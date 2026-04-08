// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.4'
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
        Relationships: []
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
          Status: string
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
          Status: string
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
          Status?: string
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: 'lancamentos_pericia_id_fkey'
            columns: ['pericia_id']
            isOneToOne: false
            referencedRelation: 'pericias'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'lancamentos_perito_id_fkey'
            columns: ['perito_id']
            isOneToOne: false
            referencedRelation: 'peritos'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'lancamentos_responsavel_id_fkey'
            columns: ['responsavel_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
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
            foreignKeyName: 'pericia_anexos_pericia_id_fkey'
            columns: ['pericia_id']
            isOneToOne: false
            referencedRelation: 'pericias'
            referencedColumns: ['id']
          },
        ]
      }
      pericias: {
        Row: {
          advogado_autora: string | null
          advogado_re: string | null
          assistente_autora: string | null
          assistente_re: string | null
          checklist: Json | null
          cidade: string | null
          codigo_interno: string | null
          contato_perito_id: string | null
          created_at: string
          data_entrega_laudo: string | null
          data_impugnacao: string | null
          data_nomeacao: string | null
          data_pericia: string | null
          descricao_impugnacao: string | null
          dias_impugnacao: number | null
          endereco: string | null
          entrega_esclarecimentos: string | null
          entrega_impugnacao: string | null
          honorarios: number | null
          id: string
          juiz: string | null
          justica_gratuita: boolean | null
          limites_esclarecimentos: string | null
          link_nuvem: string | null
          numero_processo: string | null
          observacoes: string | null
          perito_associado: string | null
          perito_id: string | null
          prazo_entrega: string | null
          status: string | null
          updated_at: string
          vara: string | null
        }
        Insert: {
          advogado_autora?: string | null
          advogado_re?: string | null
          assistente_autora?: string | null
          assistente_re?: string | null
          checklist?: Json | null
          cidade?: string | null
          codigo_interno?: string | null
          contato_perito_id?: string | null
          created_at?: string
          data_entrega_laudo?: string | null
          data_impugnacao?: string | null
          data_nomeacao?: string | null
          data_pericia?: string | null
          descricao_impugnacao?: string | null
          dias_impugnacao?: number | null
          endereco?: string | null
          entrega_esclarecimentos?: string | null
          entrega_impugnacao?: string | null
          honorarios?: number | null
          id?: string
          juiz?: string | null
          justica_gratuita?: boolean | null
          limites_esclarecimentos?: string | null
          link_nuvem?: string | null
          numero_processo?: string | null
          observacoes?: string | null
          perito_associado?: string | null
          perito_id?: string | null
          prazo_entrega?: string | null
          status?: string | null
          updated_at?: string
          vara?: string | null
        }
        Update: {
          advogado_autora?: string | null
          advogado_re?: string | null
          assistente_autora?: string | null
          assistente_re?: string | null
          checklist?: Json | null
          cidade?: string | null
          codigo_interno?: string | null
          contato_perito_id?: string | null
          created_at?: string
          data_entrega_laudo?: string | null
          data_impugnacao?: string | null
          data_nomeacao?: string | null
          data_pericia?: string | null
          descricao_impugnacao?: string | null
          dias_impugnacao?: number | null
          endereco?: string | null
          entrega_esclarecimentos?: string | null
          entrega_impugnacao?: string | null
          honorarios?: number | null
          id?: string
          juiz?: string | null
          justica_gratuita?: boolean | null
          limites_esclarecimentos?: string | null
          link_nuvem?: string | null
          numero_processo?: string | null
          observacoes?: string | null
          perito_associado?: string | null
          perito_id?: string | null
          prazo_entrega?: string | null
          status?: string | null
          updated_at?: string
          vara?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'pericias_contato_perito_id_fkey'
            columns: ['contato_perito_id']
            isOneToOne: false
            referencedRelation: 'contatos'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'pericias_perito_id_fkey'
            columns: ['perito_id']
            isOneToOne: false
            referencedRelation: 'peritos'
            referencedColumns: ['id']
          },
        ]
      }
      peritos: {
        Row: {
          agencia: string | null
          banco: string | null
          chave_pix: string | null
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
          nome: string
          observacoes: string | null
          rg: string | null
          status: string | null
          telefone: string | null
          telefone_alternativo: string | null
          updated_at: string
        }
        Insert: {
          agencia?: string | null
          banco?: string | null
          chave_pix?: string | null
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
          nome: string
          observacoes?: string | null
          rg?: string | null
          status?: string | null
          telefone?: string | null
          telefone_alternativo?: string | null
          updated_at?: string
        }
        Update: {
          agencia?: string | null
          banco?: string | null
          chave_pix?: string | null
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
          nome?: string
          observacoes?: string | null
          rg?: string | null
          status?: string | null
          telefone?: string | null
          telefone_alternativo?: string | null
          updated_at?: string
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
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          id: string
          name?: string | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
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
// Table: lancamento_categorias
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (not null)
//   tipo: text (not null)
//   created_at: timestamp with time zone (not null, default: now())
// Table: lancamentos
//   id: uuid (not null, default: gen_random_uuid())
//   data: timestamp with time zone (not null)
//   Status: text (not null)
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
// Table: pericia_anexos
//   id: uuid (not null, default: gen_random_uuid())
//   pericia_id: uuid (not null)
//   file_name: text (not null)
//   file_path: text (not null)
//   content_type: text (not null)
//   size: bigint (not null)
//   created_at: timestamp with time zone (not null, default: now())
//   created_by: uuid (nullable)
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
// Table: profiles
//   id: uuid (not null)
//   email: text (not null)
//   name: text (nullable)
//   role: text (nullable, default: 'user'::text)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
//   avatar_url: text (nullable)

// --- CONSTRAINTS ---
// Table: activity_logs
//   PRIMARY KEY activity_logs_pkey: PRIMARY KEY (id)
//   FOREIGN KEY activity_logs_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL
// Table: contatos
//   PRIMARY KEY contatos_pkey: PRIMARY KEY (id)
// Table: lancamento_categorias
//   PRIMARY KEY lancamento_categorias_pkey: PRIMARY KEY (id)
//   CHECK lancamento_categorias_tipo_check: CHECK ((tipo = ANY (ARRAY['receita'::text, 'despesa'::text])))
// Table: lancamentos
//   FOREIGN KEY lancamentos_pericia_id_fkey: FOREIGN KEY (pericia_id) REFERENCES pericias(id) ON DELETE SET NULL
//   FOREIGN KEY lancamentos_perito_id_fkey: FOREIGN KEY (perito_id) REFERENCES peritos(id) ON DELETE SET NULL
//   PRIMARY KEY lancamentos_pkey: PRIMARY KEY (id)
//   FOREIGN KEY lancamentos_responsavel_id_fkey: FOREIGN KEY (responsavel_id) REFERENCES profiles(id) ON DELETE SET NULL
//   CHECK lancamentos_status_check: CHECK ((status = ANY (ARRAY['pendente'::text, 'pago'::text, 'recebido'::text])))
//   CHECK lancamentos_tipo_check: CHECK (("Status" = ANY (ARRAY['receita'::text, 'despesa'::text])))
// Table: pericia_anexos
//   FOREIGN KEY pericia_anexos_created_by_fkey: FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL
//   FOREIGN KEY pericia_anexos_pericia_id_fkey: FOREIGN KEY (pericia_id) REFERENCES pericias(id) ON DELETE CASCADE
//   PRIMARY KEY pericia_anexos_pkey: PRIMARY KEY (id)
// Table: pericias
//   FOREIGN KEY pericias_contato_perito_id_fkey: FOREIGN KEY (contato_perito_id) REFERENCES contatos(id) ON DELETE SET NULL
//   FOREIGN KEY pericias_perito_id_fkey: FOREIGN KEY (perito_id) REFERENCES peritos(id) ON DELETE SET NULL
//   PRIMARY KEY pericias_pkey: PRIMARY KEY (id)
// Table: peritos
//   PRIMARY KEY peritos_pkey: PRIMARY KEY (id)
// Table: profiles
//   FOREIGN KEY profiles_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY profiles_pkey: PRIMARY KEY (id)

// --- ROW LEVEL SECURITY POLICIES ---
// Table: activity_logs
//   Policy "authenticated_insert_logs" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "authenticated_select_logs" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: contatos
//   Policy "authenticated_all_contatos" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: lancamento_categorias
//   Policy "authenticated_insert_categorias" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "authenticated_select_categorias" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: lancamentos
//   Policy "authenticated_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "authenticated_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: pericia_anexos
//   Policy "authenticated_delete_anexos" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_insert_anexos" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "authenticated_select_anexos" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
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
// Table: profiles
//   Policy "profiles_read_own" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = id)
//   Policy "profiles_update_own" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = id)

// --- DATABASE FUNCTIONS ---
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
//       COALESCE(NEW.raw_user_meta_data->>'role', 'user')
//     );
//     RETURN NEW;
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
//   BEGIN
//       current_user_id := auth.uid();
//
//       IF TG_OP = 'INSERT' THEN
//           INSERT INTO public.activity_logs (user_id, action, entity_type, entity_id, details)
//           VALUES (current_user_id, 'criou', 'perícia', NEW.id, jsonb_build_object('numero_processo', NEW.numero_processo));
//       ELSIF TG_OP = 'UPDATE' THEN
//           -- Only log if it's an actual update to avoid trigger spam
//           IF NEW IS DISTINCT FROM OLD THEN
//               INSERT INTO public.activity_logs (user_id, action, entity_type, entity_id, details)
//               VALUES (current_user_id, 'atualizou', 'perícia', NEW.id, jsonb_build_object('numero_processo', NEW.numero_processo, 'status', NEW.status));
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

// --- TRIGGERS ---
// Table: lancamentos
//   lancamentos_activity_trigger: CREATE TRIGGER lancamentos_activity_trigger AFTER INSERT OR DELETE OR UPDATE ON public.lancamentos FOR EACH ROW EXECUTE FUNCTION log_lancamento_activity()
// Table: pericias
//   pericias_activity_trigger: CREATE TRIGGER pericias_activity_trigger AFTER INSERT OR DELETE OR UPDATE ON public.pericias FOR EACH ROW EXECUTE FUNCTION log_pericia_activity()

// --- INDEXES ---
// Table: pericia_anexos
//   CREATE INDEX idx_pericia_anexos_pericia_id ON public.pericia_anexos USING btree (pericia_id)
