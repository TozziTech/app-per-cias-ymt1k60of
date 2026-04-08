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
      lancamentos: {
        Row: {
          categoria: string
          created_at: string
          data: string
          descricao: string
          id: string
          pericia_id: string | null
          status: string
          tipo: string
          updated_at: string
          valor: number
        }
        Insert: {
          categoria: string
          created_at?: string
          data: string
          descricao: string
          id?: string
          pericia_id?: string | null
          status: string
          tipo: string
          updated_at?: string
          valor?: number
        }
        Update: {
          categoria?: string
          created_at?: string
          data?: string
          descricao?: string
          id?: string
          pericia_id?: string | null
          status?: string
          tipo?: string
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
          prazo_entrega?: string | null
          status?: string | null
          updated_at?: string
          vara?: string | null
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
// Table: lancamentos
//   FOREIGN KEY lancamentos_pericia_id_fkey: FOREIGN KEY (pericia_id) REFERENCES pericias(id) ON DELETE SET NULL
//   PRIMARY KEY lancamentos_pkey: PRIMARY KEY (id)
//   CHECK lancamentos_status_check: CHECK ((status = ANY (ARRAY['pendente'::text, 'pago'::text, 'recebido'::text])))
//   CHECK lancamentos_tipo_check: CHECK ((tipo = ANY (ARRAY['receita'::text, 'despesa'::text])))
// Table: pericias
//   PRIMARY KEY pericias_pkey: PRIMARY KEY (id)
// Table: profiles
//   FOREIGN KEY profiles_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY profiles_pkey: PRIMARY KEY (id)

// --- ROW LEVEL SECURITY POLICIES ---
// Table: activity_logs
//   Policy "authenticated_insert_logs" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "authenticated_select_logs" (SELECT, PERMISSIVE) roles={authenticated}
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
