export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      goals: {
        Row: {
          id: string
          user_id: string
          category: string
          monthly_limit: number
        }
        Insert: {
          id?: string
          user_id?: string
          category: string
          monthly_limit: number
        }
        Update: {
          id?: string
          user_id?: string
          category?: string
          monthly_limit?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          financial_goal: number | null
          updated_at: string | null
        }
        Insert: {
          id: string
          full_name?: string | null
          financial_goal?: number | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          full_name?: string | null
          financial_goal?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          type: string | null
          description: string
          amount: number
          category: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string
          type?: string | null
          description: string
          amount: number
          category?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          type?: string | null
          description?: string
          amount?: number
          category?: string | null
          created_at?: string | null
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
