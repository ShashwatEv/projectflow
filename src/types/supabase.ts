export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      active_timers: {
        Row: {
          id: string;
          user_id: string;
          task_id: string;
          started_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          task_id: string;
          started_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          task_id?: string;
          started_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'active_timers_task_id_fkey';
            columns: ['task_id'];
            isOneToOne: false;
            referencedRelation: 'tasks';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'active_timers_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      api_endpoints: {
        Row: {
          id: string;
          project_id: string | null;
          title: string;
          method: string;
          path: string;
          description: string | null;
          category: string | null;
          headers: Json | null;
          request_body: Json | null;
          response_body: Json | null;
          status_code: number | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          project_id?: string | null;
          title: string;
          method?: string;
          path: string;
          description?: string | null;
          category?: string | null;
          headers?: Json | null;
          request_body?: Json | null;
          response_body?: Json | null;
          status_code?: number | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          project_id?: string | null;
          title?: string;
          method?: string;
          path?: string;
          description?: string | null;
          category?: string | null;
          headers?: Json | null;
          request_body?: Json | null;
          response_body?: Json | null;
          status_code?: number | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          category: string | null;
          details: Json | null;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action: string;
          category?: string | null;
          details?: Json | null;
          ip_address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          action?: string;
          category?: string | null;
          details?: Json | null;
          ip_address?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      automations: {
        Row: {
          id: string;
          user_id: string | null;
          title: string;
          trigger: string;
          action: string;
          status: string;
          last_run: string | null;
          platform: string | null;
          configuration: Json | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          title: string;
          trigger: string;
          action: string;
          status?: string;
          last_run?: string | null;
          platform?: string | null;
          configuration?: Json | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          title?: string;
          trigger?: string;
          action?: string;
          status?: string;
          last_run?: string | null;
          platform?: string | null;
          configuration?: Json | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      channels: {
        Row: {
          id: string;
          name: string;
          type: string | null;
          description: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          type?: string | null;
          description?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          type?: string | null;
          description?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      message_reactions: {
        Row: {
          id: string;
          message_id: string;
          user_id: string | null;
          emoji: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          message_id: string;
          user_id?: string | null;
          emoji: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          message_id?: string;
          user_id?: string | null;
          emoji?: string;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'message_reactions_message_id_fkey';
            columns: ['message_id'];
            isOneToOne: false;
            referencedRelation: 'messages';
            referencedColumns: ['id'];
          },
        ];
      };
      messages: {
        Row: {
          id: string;
          text: string | null;
          user_id: string | null;
          channel_id: string | null;
          room_id: string | null;
          created_at: string | null;
          content: string;
          file_url: string | null;
          file_type: string | null;
          is_edited: boolean | null;
          parent_id: string | null;
          reply_count: number | null;
        };
        Insert: {
          id?: string;
          text?: string | null;
          user_id?: string | null;
          channel_id?: string | null;
          room_id?: string | null;
          created_at?: string | null;
          content?: string;
          file_url?: string | null;
          file_type?: string | null;
          is_edited?: boolean | null;
          parent_id?: string | null;
          reply_count?: number | null;
        };
        Update: {
          id?: string;
          text?: string | null;
          user_id?: string | null;
          channel_id?: string | null;
          room_id?: string | null;
          created_at?: string | null;
          content?: string;
          file_url?: string | null;
          file_type?: string | null;
          is_edited?: boolean | null;
          parent_id?: string | null;
          reply_count?: number | null;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: string | null;
          is_read: boolean | null;
          link: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          type?: string | null;
          is_read?: boolean | null;
          link?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          message?: string;
          type?: string | null;
          is_read?: boolean | null;
          link?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      project_activity: {
        Row: {
          id: string;
          project_id: string;
          user_id: string | null;
          action: string;
          details: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          user_id?: string | null;
          action: string;
          details?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          user_id?: string | null;
          action?: string;
          details?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      project_invite_codes: {
        Row: {
          id: string;
          project_id: string;
          code_hash: string;
          role: string;
          created_by: string;
          created_at: string;
          expires_at: string;
          redeemed_by: string | null;
          redeemed_at: string | null;
        };
        Insert: {
          id?: string;
          project_id: string;
          code_hash: string;
          role?: string;
          created_by: string;
          created_at?: string;
          expires_at?: string;
          redeemed_by?: string | null;
          redeemed_at?: string | null;
        };
        Update: {
          id?: string;
          project_id?: string;
          code_hash?: string;
          role?: string;
          created_by?: string;
          created_at?: string;
          expires_at?: string;
          redeemed_by?: string | null;
          redeemed_at?: string | null;
        };
        Relationships: [];
      };
      project_meeting_messages: {
        Row: {
          id: string;
          meeting_id: string;
          user_id: string;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          meeting_id: string;
          user_id: string;
          body: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          meeting_id?: string;
          user_id?: string;
          body?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      project_meeting_participants: {
        Row: {
          meeting_id: string;
          user_id: string;
          joined_at: string;
          left_at: string | null;
          is_invited_guest: boolean;
        };
        Insert: {
          meeting_id: string;
          user_id: string;
          joined_at?: string;
          left_at?: string | null;
          is_invited_guest?: boolean;
        };
        Update: {
          meeting_id?: string;
          user_id?: string;
          joined_at?: string;
          left_at?: string | null;
          is_invited_guest?: boolean;
        };
        Relationships: [];
      };
      project_meetings: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          created_by: string;
          created_at: string;
          ended_at: string | null;
          invite_code: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          title: string;
          created_by: string;
          created_at?: string;
          ended_at?: string | null;
          invite_code?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          title?: string;
          created_by?: string;
          created_at?: string;
          ended_at?: string | null;
          invite_code?: string;
        };
        Relationships: [];
      };
      project_members: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          role: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          project_id: string;
          user_id: string;
          role?: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          project_id?: string;
          user_id?: string;
          role?: string;
          created_at?: string | null;
        };
        Relationships: [];
      };
      project_milestones: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          description: string;
          due_date: string | null;
          status: string;
          owner_id: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          title: string;
          description?: string;
          due_date?: string | null;
          status?: string;
          owner_id?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          title?: string;
          description?: string;
          due_date?: string | null;
          status?: string;
          owner_id?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      project_workflow_runs: {
        Row: {
          id: string;
          project_id: string;
          status: string;
          workflow_snapshot: Json;
          result_note: string | null;
          started_by: string;
          started_at: string;
          finished_by: string | null;
          finished_at: string | null;
        };
        Insert: {
          id?: string;
          project_id: string;
          status?: string;
          workflow_snapshot: Json;
          result_note?: string | null;
          started_by?: string;
          started_at?: string;
          finished_by?: string | null;
          finished_at?: string | null;
        };
        Update: {
          id?: string;
          project_id?: string;
          status?: string;
          workflow_snapshot?: Json;
          result_note?: string | null;
          started_by?: string;
          started_at?: string;
          finished_by?: string | null;
          finished_at?: string | null;
        };
        Relationships: [];
      };
      project_workflow_versions: {
        Row: {
          id: string;
          project_id: string;
          workflow_data: Json;
          version_number: number;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          workflow_data: Json;
          version_number: number;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          workflow_data?: Json;
          version_number?: number;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      project_workflows: {
        Row: {
          id: string;
          project_id: string;
          workflow_data: Json;
          created_by: string;
          updated_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          workflow_data?: Json;
          created_by?: string;
          updated_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          workflow_data?: Json;
          created_by?: string;
          updated_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          status: string | null;
          created_at: string | null;
          updated_at: string | null;
          progress: number | null;
          due_date: string | null;
          owner_id: string | null;
          github_repo: string | null;
          locked_file: string | null;
          locked_by: string | null;
          locked_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          status?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          progress?: number | null;
          due_date?: string | null;
          owner_id?: string | null;
          github_repo?: string | null;
          locked_file?: string | null;
          locked_by?: string | null;
          locked_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          status?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          progress?: number | null;
          due_date?: string | null;
          owner_id?: string | null;
          github_repo?: string | null;
          locked_file?: string | null;
          locked_by?: string | null;
          locked_at?: string | null;
        };
        Relationships: [];
      };
      retrospective_items: {
        Row: {
          id: string;
          retrospective_id: string | null;
          user_id: string | null;
          column_type: string;
          content: string;
          upvotes: number | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          retrospective_id?: string | null;
          user_id?: string | null;
          column_type: string;
          content: string;
          upvotes?: number | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          retrospective_id?: string | null;
          user_id?: string | null;
          column_type?: string;
          content?: string;
          upvotes?: number | null;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'retrospective_items_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      retrospectives: {
        Row: {
          id: string;
          project_id: string | null;
          title: string;
          sprint_name: string | null;
          status: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          project_id?: string | null;
          title: string;
          sprint_name?: string | null;
          status?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          project_id?: string | null;
          title?: string;
          sprint_name?: string | null;
          status?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      sprints: {
        Row: {
          id: string;
          project_id: string | null;
          title: string;
          goal: string | null;
          target_date: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          project_id?: string | null;
          title: string;
          goal?: string | null;
          target_date?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          project_id?: string | null;
          title?: string;
          goal?: string | null;
          target_date?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      task_activity: {
        Row: {
          id: string;
          task_id: string;
          project_id: string | null;
          user_id: string | null;
          action: string;
          details: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          project_id?: string | null;
          user_id?: string | null;
          action: string;
          details?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          task_id?: string;
          project_id?: string | null;
          user_id?: string | null;
          action?: string;
          details?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      task_comments: {
        Row: {
          id: string;
          task_id: string;
          user_id: string;
          content: string;
          mentioned_user_ids: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          user_id: string;
          content: string;
          mentioned_user_ids?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          task_id?: string;
          user_id?: string;
          content?: string;
          mentioned_user_ids?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      tasks: {
        Row: {
          id: string;
          user_id: string | null;
          title: string;
          status: string | null;
          priority: string | null;
          due_date: string | null;
          created_at: string | null;
          project_id: string | null;
          description: string | null;
          assigned_to: string | null;
          blocked_by: string | null;
          estimate_hours: number | null;
          tags: string[] | null;
          comments_count: number | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          title: string;
          status?: string | null;
          priority?: string | null;
          due_date?: string | null;
          created_at?: string | null;
          project_id?: string | null;
          description?: string | null;
          assigned_to?: string | null;
          blocked_by?: string | null;
          estimate_hours?: number | null;
          tags?: string[] | null;
          comments_count?: number | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          title?: string;
          status?: string | null;
          priority?: string | null;
          due_date?: string | null;
          created_at?: string | null;
          project_id?: string | null;
          description?: string | null;
          assigned_to?: string | null;
          blocked_by?: string | null;
          estimate_hours?: number | null;
          tags?: string[] | null;
          comments_count?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'tasks_project_id_fkey';
            columns: ['project_id'];
            isOneToOne: false;
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'tasks_assigned_to_fkey';
            columns: ['assigned_to'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'tasks_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      timesheets: {
        Row: {
          id: string;
          created_at: string | null;
          date: string;
          user_id: string | null;
          project_id: string | null;
          description: string;
          duration_minutes: number;
          status: string;
          task_id: string | null;
          hours: number | null;
        };
        Insert: {
          id?: string;
          created_at?: string | null;
          date?: string;
          user_id?: string | null;
          project_id?: string | null;
          description: string;
          duration_minutes: number;
          status?: string;
          task_id?: string | null;
          hours?: number | null;
        };
        Update: {
          id?: string;
          created_at?: string | null;
          date?: string;
          user_id?: string | null;
          project_id?: string | null;
          description?: string;
          duration_minutes?: number;
          status?: string;
          task_id?: string | null;
          hours?: number | null;
        };
        Relationships: [];
      };
      user_notification_preferences: {
        Row: {
          user_id: string;
          new_comments: boolean;
          project_invites: boolean;
          mentions: boolean;
          task_reminders: boolean;
          digest_frequency: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          new_comments?: boolean;
          project_invites?: boolean;
          mentions?: boolean;
          task_reminders?: boolean;
          digest_frequency?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          new_comments?: boolean;
          project_invites?: boolean;
          mentions?: boolean;
          task_reminders?: boolean;
          digest_frequency?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_setup_progress: {
        Row: {
          user_id: string;
          completed_steps: string[];
          dismissed_at: string | null;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          completed_steps?: string[];
          dismissed_at?: string | null;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          completed_steps?: string[];
          dismissed_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      users: {
        Row: {
          id: string;
          name: string | null;
          email: string | null;
          role: string | null;
          avatar: string | null;
          location: string | null;
          phone: string | null;
          bio: string | null;
          website: string | null;
          status: string | null;
          created_at: string | null;
          github_token: string | null;
          notification_preferences: Json | null;
          onboarding_completed: boolean | null;
          is_verified: boolean | null;
          email_verified: boolean | null;
          phone_verified: boolean | null;
          verification_badges: Json | null;
          is_2fa_enabled: boolean | null;
          two_factor_channel: string | null;
          two_factor_target: string | null;
          two_factor_otp: string | null;
          two_factor_otp_expires_at: string | null;
          onboarding_sandbox_cleared: boolean | null;
        };
        Insert: {
          id: string;
          name?: string | null;
          email?: string | null;
          role?: string | null;
          avatar?: string | null;
          location?: string | null;
          phone?: string | null;
          bio?: string | null;
          website?: string | null;
          status?: string | null;
          created_at?: string | null;
          github_token?: string | null;
          notification_preferences?: Json | null;
          onboarding_completed?: boolean | null;
          is_verified?: boolean | null;
          email_verified?: boolean | null;
          phone_verified?: boolean | null;
          verification_badges?: Json | null;
          is_2fa_enabled?: boolean | null;
          two_factor_channel?: string | null;
          two_factor_target?: string | null;
          two_factor_otp?: string | null;
          two_factor_otp_expires_at?: string | null;
          onboarding_sandbox_cleared?: boolean | null;
        };
        Update: {
          id?: string;
          name?: string | null;
          email?: string | null;
          role?: string | null;
          avatar?: string | null;
          location?: string | null;
          phone?: string | null;
          bio?: string | null;
          website?: string | null;
          status?: string | null;
          created_at?: string | null;
          github_token?: string | null;
          notification_preferences?: Json | null;
          onboarding_completed?: boolean | null;
          is_verified?: boolean | null;
          email_verified?: boolean | null;
          phone_verified?: boolean | null;
          verification_badges?: Json | null;
          is_2fa_enabled?: boolean | null;
          two_factor_channel?: string | null;
          two_factor_target?: string | null;
          two_factor_otp?: string | null;
          two_factor_otp_expires_at?: string | null;
          onboarding_sandbox_cleared?: boolean | null;
        };
        Relationships: [];
      };
      workflow_templates: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          workflow_data: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          name: string;
          workflow_data: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          workflow_data?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      workspace_channel_members: {
        Row: {
          channel_id: string;
          user_id: string;
          joined_at: string;
        };
        Insert: {
          channel_id: string;
          user_id: string;
          joined_at?: string;
        };
        Update: {
          channel_id?: string;
          user_id?: string;
          joined_at?: string;
        };
        Relationships: [];
      };
      workspace_channel_preferences: {
        Row: {
          channel_id: string;
          user_id: string;
          wallpaper: string | null;
          is_muted: boolean;
          updated_at: string;
        };
        Insert: {
          channel_id: string;
          user_id: string;
          wallpaper?: string | null;
          is_muted?: boolean;
          updated_at?: string;
        };
        Update: {
          channel_id?: string;
          user_id?: string;
          wallpaper?: string | null;
          is_muted?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      workspace_channel_reads: {
        Row: {
          channel_id: string;
          user_id: string;
          last_read_at: string;
        };
        Insert: {
          channel_id: string;
          user_id: string;
          last_read_at?: string;
        };
        Update: {
          channel_id?: string;
          user_id?: string;
          last_read_at?: string;
        };
        Relationships: [];
      };
      workspace_channels: {
        Row: {
          id: string;
          name: string;
          description: string;
          is_private: boolean;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          description?: string;
          is_private?: boolean;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          is_private?: boolean;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      user_profiles: {
        Row: {
          id: string;
          name: string | null;
          email: string | null;
          role: string | null;
          avatar: string | null;
          location: string | null;
          bio: string | null;
          website: string | null;
          status: string | null;
          created_at: string | null;
          is_verified: boolean | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      can_access_project: {
        Args: { target_project_id: string };
        Returns: boolean;
      };
      can_access_workspace_channel: {
        Args: { channel_id: string };
        Returns: boolean;
      };
      can_edit_project: {
        Args: { target_project_id: string };
        Returns: boolean;
      };
      can_view_project_members: {
        Args: { target_project_id: string };
        Returns: boolean;
      };
      create_chat_task: {
        Args: {
          p_project_id: string;
          p_title: string;
          p_description: string | null;
          p_priority: string;
        };
        Returns: string;
      };
      create_project_invite_code: {
        Args: { p_project_id: string; p_code_hash: string };
        Returns: Json;
      };
      create_project_meeting: {
        Args: { p_project_id: string; p_title: string };
        Returns: string;
      };
      end_project_meeting: {
        Args: { p_meeting_id: string };
        Returns: undefined;
      };
      find_project_meeting_by_code: {
        Args: { p_code: string };
        Returns: {
          id: string;
          title: string;
          created_at: string;
          ended_at: string | null;
        }[];
      };
      is_current_user_verified: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_project_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_super_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_workspace_channel_owner: {
        Args: { channel_id: string };
        Returns: boolean;
      };
      join_project_meeting: {
        Args: { p_meeting_id: string };
        Returns: undefined;
      };
      join_project_meeting_by_code: {
        Args: { p_code: string };
        Returns: string;
      };
      leave_project_meeting: {
        Args: { p_meeting_id: string };
        Returns: undefined;
      };
      log_workspace_action: {
        Args: { p_action: string; p_category: string; p_details: Json };
        Returns: undefined;
      };
      projectflow_can_access_meeting: {
        Args: { target_meeting_id: string };
        Returns: boolean;
      };
      projectflow_can_access_meeting_room: {
        Args: { p_topic: string };
        Returns: boolean;
      };
      projectflow_can_access_meeting_signal: {
        Args: { p_topic: string; p_is_sender: boolean };
        Returns: boolean;
      };
      projectflow_can_access_project: {
        Args: { target_project_id: string };
        Returns: boolean;
      };
      redeem_project_invite_code: {
        Args: { p_code_hash: string };
        Returns: Json;
      };
      send_project_meeting_message: {
        Args: { p_meeting_id: string; p_body: string };
        Returns: string;
      };
      team_chat_assistant_context: {
        Args: Record<PropertyKey, never>;
        Returns: Json;
      };
      team_chat_assistant_extended_context: {
        Args: Record<PropertyKey, never>;
        Returns: Json;
      };
      workspace_channel_previews: {
        Args: Record<PropertyKey, never>;
        Returns: {
          room_id: string;
          last_message: string;
          last_message_at: string;
        }[];
      };
      workspace_unread_counts: {
        Args: Record<PropertyKey, never>;
        Returns: {
          room_id: string;
          unread_count: number;
        }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};