export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type AwardLabels = {
  top_right: string
  top_left: string
  bottom_right: string
  bottom_left: string
}

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
          icon_url: string | null
          gameplay_enabled: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          invite_code?: string
          created_by: string
          min_members?: number
          icon_url?: string | null
          gameplay_enabled?: boolean
          created_at?: string
        }
        Update: {
          name?: string
          created_by?: string
          min_members?: number
          icon_url?: string | null
          gameplay_enabled?: boolean
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
          award_labels: AwardLabels | null
        }
        Insert: {
          id?: string
          x_axis_label: string
          y_axis_label: string
          prompt_date?: string | null
          source?: string
          created_at?: string
          award_labels?: AwardLabels | null
        }
        Update: {
          x_axis_label?: string
          y_axis_label?: string
          prompt_date?: string | null
          source?: string
          award_labels?: AwardLabels | null
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
      result_publications: {
        Row: {
          group_id: string
          prompt_id: string
          published_by: string
          published_at: string
        }
        Insert: {
          group_id: string
          prompt_id: string
          published_by: string
          published_at?: string
        }
        Update: Record<string, never>
        Relationships: [
          {
            foreignKeyName: "result_publications_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "result_publications_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "result_publications_published_by_fkey"
            columns: ["published_by"]
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
      group_accuracy_leaderboard: {
        Args: { gid: string; pid?: string | null }
        Returns: {
          user_id: string
          display_name: string
          avatar_url: string | null
          avg_match: number
          placements_count: number
        }[]
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
