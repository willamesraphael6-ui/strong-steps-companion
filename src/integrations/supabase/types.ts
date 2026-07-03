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
      body_analyses: {
        Row: {
          body_type: string | null
          created_at: string
          focus_areas: string | null
          id: string
          image_url: string | null
          profile_id: string
          recommendations: string | null
          strengths: string | null
        }
        Insert: {
          body_type?: string | null
          created_at?: string
          focus_areas?: string | null
          id?: string
          image_url?: string | null
          profile_id: string
          recommendations?: string | null
          strengths?: string | null
        }
        Update: {
          body_type?: string | null
          created_at?: string
          focus_areas?: string | null
          id?: string
          image_url?: string | null
          profile_id?: string
          recommendations?: string | null
          strengths?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          image_url: string | null
          profile_id: string
          role: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          profile_id: string
          role: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          profile_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_stats: {
        Row: {
          active_minutes: number
          calories: number
          created_at: string
          date: string
          distance_m: number
          id: string
          missions_completed: Json | null
          profile_id: string
          route_points: Json | null
          steps: number
          updated_at: string
          workouts_completed: number
          xp_earned: number
        }
        Insert: {
          active_minutes?: number
          calories?: number
          created_at?: string
          date?: string
          distance_m?: number
          id?: string
          missions_completed?: Json | null
          profile_id: string
          route_points?: Json | null
          steps?: number
          updated_at?: string
          workouts_completed?: number
          xp_earned?: number
        }
        Update: {
          active_minutes?: number
          calories?: number
          created_at?: string
          date?: string
          distance_m?: number
          id?: string
          missions_completed?: Json | null
          profile_id?: string
          route_points?: Json | null
          steps?: number
          updated_at?: string
          workouts_completed?: number
          xp_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "daily_stats_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      food_analyses: {
        Row: {
          calories_estimate: number | null
          can_eat: boolean
          created_at: string
          id: string
          image_url: string | null
          notes: string | null
          profile_id: string
          verdict: string
        }
        Insert: {
          calories_estimate?: number | null
          can_eat?: boolean
          created_at?: string
          id?: string
          image_url?: string | null
          notes?: string | null
          profile_id: string
          verdict: string
        }
        Update: {
          calories_estimate?: number | null
          can_eat?: boolean
          created_at?: string
          id?: string
          image_url?: string | null
          notes?: string | null
          profile_id?: string
          verdict?: string
        }
        Relationships: []
      }
      language_tasks: {
        Row: {
          category: string
          created_at: string
          difficulty: number
          id: string
          lang_code: string
          order_index: number
          pronunciation: string | null
          target: string
          title: string
          translation_pt: string
        }
        Insert: {
          category?: string
          created_at?: string
          difficulty?: number
          id?: string
          lang_code: string
          order_index?: number
          pronunciation?: string | null
          target: string
          title: string
          translation_pt: string
        }
        Update: {
          category?: string
          created_at?: string
          difficulty?: number
          id?: string
          lang_code?: string
          order_index?: number
          pronunciation?: string | null
          target?: string
          title?: string
          translation_pt?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          daily_step_goal: number
          device_id: string
          fitness_goal: string | null
          fitness_level: string | null
          id: string
          level: number
          name: string
          notifications_enabled: boolean | null
          preferred_language: string | null
          updated_at: string
          xp: number
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          daily_step_goal?: number
          device_id: string
          fitness_goal?: string | null
          fitness_level?: string | null
          id?: string
          level?: number
          name?: string
          notifications_enabled?: boolean | null
          preferred_language?: string | null
          updated_at?: string
          xp?: number
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          daily_step_goal?: number
          device_id?: string
          fitness_goal?: string | null
          fitness_level?: string | null
          id?: string
          level?: number
          name?: string
          notifications_enabled?: boolean | null
          preferred_language?: string | null
          updated_at?: string
          xp?: number
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount_cents: number
          created_at: string
          expires_at: string | null
          id: string
          paid_at: string | null
          pix_code: string | null
          pix_qr: string | null
          profile_id: string
          provider: string
          provider_ref: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount_cents?: number
          created_at?: string
          expires_at?: string | null
          id?: string
          paid_at?: string | null
          pix_code?: string | null
          pix_qr?: string | null
          profile_id: string
          provider?: string
          provider_ref?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          expires_at?: string | null
          id?: string
          paid_at?: string | null
          pix_code?: string | null
          pix_qr?: string | null
          profile_id?: string
          provider?: string
          provider_ref?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_task_progress: {
        Row: {
          completed_at: string
          id: string
          profile_id: string
          score: number
          task_id: string
        }
        Insert: {
          completed_at?: string
          id?: string
          profile_id: string
          score?: number
          task_id: string
        }
        Update: {
          completed_at?: string
          id?: string
          profile_id?: string
          score?: number
          task_id?: string
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
