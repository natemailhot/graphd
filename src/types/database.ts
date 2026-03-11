export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          display_name: string
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          display_name?: string
          avatar_url?: string | null
        }
        Relationships: []
      }
      groups: {
        Row: {
          id: string
          name: string
          invite_code: string
          created_by: string
          min_members: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          invite_code?: string
          created_by: string
          min_members?: number
          created_at?: string
        }
        Update: {
          name?: string
          created_by?: string
          min_members?: number
        }
        Relationships: [
          {
            foreignKeyName: "groups_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      group_members: {
        Row: {
          group_id: string
          user_id: string
          joined_at: string
        }
        Insert: {
          group_id: string
          user_id: string
          joined_at?: string
        }
        Update: {
          group_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      prompts: {
        Row: {
          id: string
          x_axis_label: string
          y_axis_label: string
          prompt_date: string | null
          source: string
          created_at: string
        }
        Insert: {
          id?: string
          x_axis_label: string
          y_axis_label: string
          prompt_date?: string | null
          source?: string
          created_at?: string
        }
        Update: {
          x_axis_label?: string
          y_axis_label?: string
          prompt_date?: string | null
          source?: string
        }
        Relationships: []
      }
      placements: {
        Row: {
          id: string
          group_id: string
          prompt_id: string
          placed_by: string
          target_user_id: string
          x_value: number
          y_value: number
          created_at: string
        }
        Insert: {
          id?: string
          group_id: string
          prompt_id: string
          placed_by: string
          target_user_id: string
          x_value: number
          y_value: number
          created_at?: string
        }
        Update: {
          x_value?: number
          y_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "placements_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "placements_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "placements_placed_by_fkey"
            columns: ["placed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "placements_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      group_submissions: {
        Row: {
          group_id: string
          prompt_id: string
          user_id: string
          has_submitted: boolean
        }
        Relationships: []
      }
    }
    Functions: {
      assign_daily_prompt: {
        Args: Record<string, never>
        Returns: string
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
