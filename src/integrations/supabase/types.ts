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
      academies: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      player_assistant_coaches: {
        Row: {
          coach_id: string
          id: string
          player_id: string
        }
        Insert: {
          coach_id: string
          id?: string
          player_id: string
        }
        Update: {
          coach_id?: string
          id?: string
          player_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_assistant_coaches_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_assistant_coaches_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      player_matches: {
        Row: {
          created_at: string
          id: string
          match_date: string | null
          opponent_name: string | null
          player_id: string
          result: string | null
          round: string | null
          score: string | null
          tournament_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          match_date?: string | null
          opponent_name?: string | null
          player_id: string
          result?: string | null
          round?: string | null
          score?: string | null
          tournament_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          match_date?: string | null
          opponent_name?: string | null
          player_id?: string
          result?: string | null
          round?: string | null
          score?: string | null
          tournament_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "player_matches_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_matches_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "player_tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      player_ota_profiles: {
        Row: {
          career_losses: number | null
          career_total: number | null
          career_wins: number | null
          created_at: string
          id: string
          ota_guid: string | null
          ota_id: string | null
          player_id: string
          scraped_at: string | null
          updated_at: string
          wtn_singles: number | null
          year_losses: number | null
          year_wins: number | null
        }
        Insert: {
          career_losses?: number | null
          career_total?: number | null
          career_wins?: number | null
          created_at?: string
          id?: string
          ota_guid?: string | null
          ota_id?: string | null
          player_id: string
          scraped_at?: string | null
          updated_at?: string
          wtn_singles?: number | null
          year_losses?: number | null
          year_wins?: number | null
        }
        Update: {
          career_losses?: number | null
          career_total?: number | null
          career_wins?: number | null
          created_at?: string
          id?: string
          ota_guid?: string | null
          ota_id?: string | null
          player_id?: string
          scraped_at?: string | null
          updated_at?: string
          wtn_singles?: number | null
          year_losses?: number | null
          year_wins?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "player_ota_profiles_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: true
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      player_ranking_history: {
        Row: {
          created_at: string
          id: string
          player_id: string
          points: number | null
          ranking: number | null
          recorded_date: string
          source: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          player_id: string
          points?: number | null
          ranking?: number | null
          recorded_date: string
          source?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          player_id?: string
          points?: number | null
          ranking?: number | null
          recorded_date?: string
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "player_ranking_history_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      player_skill_items: {
        Row: {
          coach_note: string | null
          created_at: string
          id: string
          is_active: boolean
          last_trained_at: string | null
          planned_order: number | null
          player_id: string
          skill_item_id: string
          status: number
          times_logged: number
          updated_at: string
        }
        Insert: {
          coach_note?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          last_trained_at?: string | null
          planned_order?: number | null
          player_id: string
          skill_item_id: string
          status?: number
          times_logged?: number
          updated_at?: string
        }
        Update: {
          coach_note?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          last_trained_at?: string | null
          planned_order?: number | null
          player_id?: string
          skill_item_id?: string
          status?: number
          times_logged?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_skill_items_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_skill_items_skill_item_id_fkey"
            columns: ["skill_item_id"]
            isOneToOne: false
            referencedRelation: "skill_items"
            referencedColumns: ["id"]
          },
        ]
      }
      player_tournaments: {
        Row: {
          category: string | null
          created_at: string
          draw: string | null
          end_date: string | null
          id: string
          is_upcoming: boolean | null
          level: string | null
          location: string | null
          player_id: string
          result_summary: string | null
          start_date: string | null
          tournament_name: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          draw?: string | null
          end_date?: string | null
          id?: string
          is_upcoming?: boolean | null
          level?: string | null
          location?: string | null
          player_id: string
          result_summary?: string | null
          start_date?: string | null
          tournament_name: string
        }
        Update: {
          category?: string | null
          created_at?: string
          draw?: string | null
          end_date?: string | null
          id?: string
          is_upcoming?: boolean | null
          level?: string | null
          location?: string | null
          player_id?: string
          result_summary?: string | null
          start_date?: string | null
          tournament_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_tournaments_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          academy_id: string
          created_at: string
          date_of_birth: string | null
          full_name: string
          head_coach_id: string | null
          id: string
          level: Database["public"]["Enums"]["player_level"]
          notes_summary: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["player_status"]
          updated_at: string
        }
        Insert: {
          academy_id: string
          created_at?: string
          date_of_birth?: string | null
          full_name: string
          head_coach_id?: string | null
          id?: string
          level?: Database["public"]["Enums"]["player_level"]
          notes_summary?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["player_status"]
          updated_at?: string
        }
        Update: {
          academy_id?: string
          created_at?: string
          date_of_birth?: string | null
          full_name?: string
          head_coach_id?: string | null
          id?: string
          level?: Database["public"]["Enums"]["player_level"]
          notes_summary?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["player_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "players_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "players_head_coach_id_fkey"
            columns: ["head_coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          academy_id: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          updated_at: string
        }
        Insert: {
          academy_id?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id: string
          updated_at?: string
        }
        Update: {
          academy_id?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_entries: {
        Row: {
          day_of_week: number
          end_time: string
          id: string
          location: string | null
          notes: string | null
          player_id: string
          session_type: string | null
          start_time: string
        }
        Insert: {
          day_of_week: number
          end_time: string
          id?: string
          location?: string | null
          notes?: string | null
          player_id: string
          session_type?: string | null
          start_time: string
        }
        Update: {
          day_of_week?: number
          end_time?: string
          id?: string
          location?: string | null
          notes?: string | null
          player_id?: string
          session_type?: string | null
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_entries_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      session_log_skill_items: {
        Row: {
          id: string
          player_skill_item_id: string
          session_log_id: string
          status_after_session: number | null
        }
        Insert: {
          id?: string
          player_skill_item_id: string
          session_log_id: string
          status_after_session?: number | null
        }
        Update: {
          id?: string
          player_skill_item_id?: string
          session_log_id?: string
          status_after_session?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "session_log_skill_items_player_skill_item_id_fkey"
            columns: ["player_skill_item_id"]
            isOneToOne: false
            referencedRelation: "player_skill_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_log_skill_items_session_log_id_fkey"
            columns: ["session_log_id"]
            isOneToOne: false
            referencedRelation: "session_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      session_logs: {
        Row: {
          coach_id: string
          created_at: string
          duration_minutes: number | null
          id: string
          note: string | null
          player_id: string
          session_date: string
        }
        Insert: {
          coach_id: string
          created_at?: string
          duration_minutes?: number | null
          id?: string
          note?: string | null
          player_id: string
          session_date?: string
        }
        Update: {
          coach_id?: string
          created_at?: string
          duration_minutes?: number | null
          id?: string
          note?: string | null
          player_id?: string
          session_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_logs_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_logs_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      skill_categories: {
        Row: {
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          id?: string
          name: string
          sort_order?: number
        }
        Update: {
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      skill_items: {
        Row: {
          id: string
          name: string
          sort_order: number
          subcategory_id: string
        }
        Insert: {
          id?: string
          name: string
          sort_order?: number
          subcategory_id: string
        }
        Update: {
          id?: string
          name?: string
          sort_order?: number
          subcategory_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "skill_items_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "skill_subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      skill_subcategories: {
        Row: {
          category_id: string
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          category_id: string
          id?: string
          name: string
          sort_order?: number
        }
        Update: {
          category_id?: string
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "skill_subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "skill_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_records: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          notes: string | null
          player_id: string
          result: string | null
          start_date: string | null
          tournament_name: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          notes?: string | null
          player_id: string
          result?: string | null
          start_date?: string | null
          tournament_name: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          notes?: string | null
          player_id?: string
          result?: string | null
          start_date?: string | null
          tournament_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_records_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      training_template_items: {
        Row: {
          default_status: number
          id: string
          planned_order: number | null
          skill_item_id: string
          template_id: string
        }
        Insert: {
          default_status?: number
          id?: string
          planned_order?: number | null
          skill_item_id: string
          template_id: string
        }
        Update: {
          default_status?: number
          id?: string
          planned_order?: number | null
          skill_item_id?: string
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_template_items_skill_item_id_fkey"
            columns: ["skill_item_id"]
            isOneToOne: false
            referencedRelation: "skill_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_template_items_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "training_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      training_templates: {
        Row: {
          id: string
          level_tag: Database["public"]["Enums"]["player_level"] | null
          name: string
        }
        Insert: {
          id?: string
          level_tag?: Database["public"]["Enums"]["player_level"] | null
          name: string
        }
        Update: {
          id?: string
          level_tag?: Database["public"]["Enums"]["player_level"] | null
          name?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_academy_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "academy_admin" | "head_coach" | "assistant_coach"
      player_level: "beginner" | "intermediate" | "advanced"
      player_status: "active" | "inactive"
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
      app_role: ["academy_admin", "head_coach", "assistant_coach"],
      player_level: ["beginner", "intermediate", "advanced"],
      player_status: ["active", "inactive"],
    },
  },
} as const
