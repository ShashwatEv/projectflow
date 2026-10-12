/**
 * Supabase Database Type Definitions
 * Essential types for type-safe database operations
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          avatar_url: string | null;
          role: string | null;
          is_verified: boolean | null;
          created_at: string;
          updated_at: string;
          preferences: Json | null;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          avatar_url?: string | null;
          role?: string | null;
          is_verified?: boolean | null;
          created_at?: string;
          updated_at?: string;
          preferences?: Json | null;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          avatar_url?: string | null;
          role?: string | null;
          is_verified?: boolean | null;
          created_at?: string;
          updated_at?: string;
          preferences?: Json | null;
        };
      };
      projects: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          key: string;
          owner_id: string;
          created_at: string;
          updated_at: string;
          settings: Json | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          key: string;
          owner_id: string;
          created_at?: string;
          updated_at?: string;
          settings?: Json | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          key?: string;
          owner_id?: string;
          created_at?: string;
          updated_at?: string;
          settings?: Json | null;
        };
      };
      tasks: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          description: string | null;
          status: string;
          priority: string | null;
          assignee_id: string | null;
          reporter_id: string | null;
          sprint_id: string | null;
          story_points: number | null;
          due_date: string | null;
          created_at: string;
          updated_at: string;
          position: number;
          tags: string[] | null;
        };
        Insert: {
          id?: string;
          project_id: string;
          title: string;
          description?: string | null;
          status?: string;
          priority?: string | null;
          assignee_id?: string | null;
          reporter_id?: string | null;
          sprint_id?: string | null;
          story_points?: number | null;
          due_date?: string | null;
          created_at?: string;
          updated_at?: string;
          position?: number;
          tags?: string[] | null;
        };
        Update: {
          id?: string;
          project_id?: string;
          title?: string;
          description?: string | null;
          status?: string;
          priority?: string | null;
          assignee_id?: string | null;
          reporter_id?: string | null;
          sprint_id?: string | null;
          story_points?: number | null;
          due_date?: string | null;
          created_at?: string;
          updated_at?: string;
          position?: number;
          tags?: string[] | null;
        };
      };
    };
  };
}

export type Tables<
  PublicTableNameOrOptions extends keyof (Database['public']['Tables'])
> = Database['public']['Tables'][PublicTableNameOrOptions]['Row'];