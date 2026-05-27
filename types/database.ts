export type AgendamentoStatus = 'agendado' | 'em_andamento' | 'finalizado' | 'cancelado'
export type PetPorte = 'pequeno' | 'medio' | 'grande'

export interface Petshop {
  id: string
  owner_id: string
  nome: string
  whatsapp_numero: string | null
  endereco: string | null
  gcal_access_token: string | null
  gcal_refresh_token: string | null
  created_at: string
  horario_abertura?: string | null
  horario_fechamento?: string | null
  dias_funcionamento?: string[] | null
}

export interface Cliente {
  id: string
  petshop_id: string
  nome: string
  telefone: string
  created_at: string
}

export interface Pet {
  id: string
  cliente_id: string
  nome: string
  especie: string
  raca: string | null
  porte: PetPorte | null
  created_at: string
}

export interface ServicoCatalogo {
  id: string
  petshop_id: string
  tipo_servico: string
  preco_base: number
  created_at: string
}

// Pure DB row — matches the table schema exactly, no joined fields
export interface AgendamentoRow {
  id: string
  petshop_id: string
  cliente_id: string | null
  pet_id: string | null
  tipo_servico: string
  status: AgendamentoStatus
  data_hora_inicio: string
  data_hora_fim: string | null
  valor_cobrado: number | null
  gcal_event_id: string | null
  created_at: string
}

// Agendamento with optional joined relations (returned by Supabase select)
export interface Agendamento extends AgendamentoRow {
  clientes?: Cliente | null
  pets?: Pet | null
}

// Database type in the exact format Supabase CLI generates.
// Object literal types (not interface names) are required for the
// GenericSchema extends check inside @supabase/supabase-js SupabaseClient.
export type Database = {
  public: {
    Tables: {
      petshops: {
        Row: {
          id: string
          owner_id: string
          nome: string
          whatsapp_numero: string | null
          endereco: string | null
          gcal_access_token: string | null
          gcal_refresh_token: string | null
          created_at: string
          horario_abertura?: string | null
          horario_fechamento?: string | null
          dias_funcionamento?: string[] | null
        }
        Insert: {
          id?: string
          owner_id: string
          nome: string
          whatsapp_numero?: string | null
          endereco?: string | null
          gcal_access_token?: string | null
          gcal_refresh_token?: string | null
          created_at?: string
          horario_abertura?: string | null
          horario_fechamento?: string | null
          dias_funcionamento?: string[] | null
        }
        Update: {
          id?: string
          owner_id?: string
          nome?: string
          whatsapp_numero?: string | null
          endereco?: string | null
          gcal_access_token?: string | null
          gcal_refresh_token?: string | null
          created_at?: string
          horario_abertura?: string | null
          horario_fechamento?: string | null
          dias_funcionamento?: string[] | null
        }
        Relationships: []
      }
      clientes: {
        Row: {
          id: string
          petshop_id: string
          nome: string
          telefone: string
          created_at: string
        }
        Insert: {
          id?: string
          petshop_id: string
          nome: string
          telefone: string
          created_at?: string
        }
        Update: {
          id?: string
          petshop_id?: string
          nome?: string
          telefone?: string
          created_at?: string
        }
        Relationships: []
      }
      pets: {
        Row: {
          id: string
          cliente_id: string
          nome: string
          especie: string
          raca: string | null
          porte: 'pequeno' | 'medio' | 'grande' | null
          created_at: string
        }
        Insert: {
          id?: string
          cliente_id: string
          nome: string
          especie: string
          raca?: string | null
          porte?: 'pequeno' | 'medio' | 'grande' | null
          created_at?: string
        }
        Update: {
          id?: string
          cliente_id?: string
          nome?: string
          especie?: string
          raca?: string | null
          porte?: 'pequeno' | 'medio' | 'grande' | null
          created_at?: string
        }
        Relationships: []
      }
      servicos_catalogo: {
        Row: {
          id: string
          petshop_id: string
          tipo_servico: string
          preco_base: number
          created_at: string
        }
        Insert: {
          id?: string
          petshop_id: string
          tipo_servico: string
          preco_base: number
          created_at?: string
        }
        Update: {
          id?: string
          petshop_id?: string
          tipo_servico?: string
          preco_base?: number
          created_at?: string
        }
        Relationships: []
      }
      agendamentos: {
        Row: {
          id: string
          petshop_id: string
          cliente_id: string | null
          pet_id: string | null
          tipo_servico: string
          status: 'agendado' | 'em_andamento' | 'finalizado' | 'cancelado'
          data_hora_inicio: string
          data_hora_fim: string | null
          valor_cobrado: number | null
          gcal_event_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          petshop_id: string
          cliente_id?: string | null
          pet_id?: string | null
          tipo_servico: string
          status?: 'agendado' | 'em_andamento' | 'finalizado' | 'cancelado'
          data_hora_inicio: string
          data_hora_fim?: string | null
          valor_cobrado?: number | null
          gcal_event_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          petshop_id?: string
          cliente_id?: string | null
          pet_id?: string | null
          tipo_servico?: string
          status?: 'agendado' | 'em_andamento' | 'finalizado' | 'cancelado'
          data_hora_inicio?: string
          data_hora_fim?: string | null
          valor_cobrado?: number | null
          gcal_event_id?: string | null
          created_at?: string
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
  }
}
