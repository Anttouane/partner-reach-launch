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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      brand_opportunities: {
        Row: {
          brand_id: string
          budget_range: string | null
          campaign_type: string | null
          created_at: string
          deadline: string | null
          description: string
          id: string
          requirements: string[] | null
          status: string | null
          target_audience: string | null
          title: string
          updated_at: string
        }
        Insert: {
          brand_id: string
          budget_range?: string | null
          campaign_type?: string | null
          created_at?: string
          deadline?: string | null
          description: string
          id?: string
          requirements?: string[] | null
          status?: string | null
          target_audience?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          brand_id?: string
          budget_range?: string | null
          campaign_type?: string | null
          created_at?: string
          deadline?: string | null
          description?: string
          id?: string
          requirements?: string[] | null
          status?: string | null
          target_audience?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_opportunities_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_profiles: {
        Row: {
          company_name: string | null
          created_at: string
          description: string | null
          id: string
          industry: string | null
          logo_url: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          description?: string | null
          id: string
          industry?: string | null
          logo_url?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          company_name?: string | null
          created_at?: string
          description?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_matches: {
        Row: {
          brand_status: Database["public"]["Enums"]["match_brand_status"]
          campaign_id: string
          created_at: string
          creator_id: string
          creator_status: Database["public"]["Enums"]["match_creator_status"]
          id: string
          match_score: number
          updated_at: string
        }
        Insert: {
          brand_status?: Database["public"]["Enums"]["match_brand_status"]
          campaign_id: string
          created_at?: string
          creator_id: string
          creator_status?: Database["public"]["Enums"]["match_creator_status"]
          id?: string
          match_score?: number
          updated_at?: string
        }
        Update: {
          brand_status?: Database["public"]["Enums"]["match_brand_status"]
          campaign_id?: string
          created_at?: string
          creator_id?: string
          creator_status?: Database["public"]["Enums"]["match_creator_status"]
          id?: string
          match_score?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_matches_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          audience_tier: string | null
          brand_brief: string | null
          brand_id: string
          budget_total: number
          commission_amount: number | null
          commission_rate: number | null
          created_at: string
          creators_wanted: number
          deadline: string | null
          description: string | null
          format: string | null
          id: string
          min_audience: number
          name: string
          network: string | null
          niche_category_id: string | null
          price_per_creator: number | null
          status: Database["public"]["Enums"]["campaign_status"]
          updated_at: string
        }
        Insert: {
          audience_tier?: string | null
          brand_brief?: string | null
          brand_id: string
          budget_total: number
          commission_amount?: number | null
          commission_rate?: number | null
          created_at?: string
          creators_wanted?: number
          deadline?: string | null
          description?: string | null
          format?: string | null
          id?: string
          min_audience?: number
          name: string
          network?: string | null
          niche_category_id?: string | null
          price_per_creator?: number | null
          status?: Database["public"]["Enums"]["campaign_status"]
          updated_at?: string
        }
        Update: {
          audience_tier?: string | null
          brand_brief?: string | null
          brand_id?: string
          budget_total?: number
          commission_amount?: number | null
          commission_rate?: number | null
          created_at?: string
          creators_wanted?: number
          deadline?: string | null
          description?: string | null
          format?: string | null
          id?: string
          min_audience?: number
          name?: string
          network?: string | null
          niche_category_id?: string | null
          price_per_creator?: number | null
          status?: Database["public"]["Enums"]["campaign_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_niche_category_id_fkey"
            columns: ["niche_category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      collabs: {
        Row: {
          amount: number
          auto_release_at: string | null
          campaign_id: string
          commission: number
          created_at: string
          creator_id: string
          delivered_at: string | null
          id: string
          match_id: string | null
          released_at: string | null
          status: Database["public"]["Enums"]["collab_status"]
          stripe_charge_id: string | null
          stripe_payment_intent: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          auto_release_at?: string | null
          campaign_id: string
          commission?: number
          created_at?: string
          creator_id: string
          delivered_at?: string | null
          id?: string
          match_id?: string | null
          released_at?: string | null
          status?: Database["public"]["Enums"]["collab_status"]
          stripe_charge_id?: string | null
          stripe_payment_intent?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          auto_release_at?: string | null
          campaign_id?: string
          commission?: number
          created_at?: string
          creator_id?: string
          delivered_at?: string | null
          id?: string
          match_id?: string | null
          released_at?: string | null
          status?: Database["public"]["Enums"]["collab_status"]
          stripe_charge_id?: string | null
          stripe_payment_intent?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "collabs_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collabs_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "campaign_matches"
            referencedColumns: ["id"]
          },
        ]
      }
      connect_accounts: {
        Row: {
          charges_enabled: boolean
          created_at: string
          details_submitted: boolean
          id: string
          payouts_enabled: boolean
          requirements_due: string | null
          stripe_account_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          charges_enabled?: boolean
          created_at?: string
          details_submitted?: boolean
          id?: string
          payouts_enabled?: boolean
          requirements_due?: string | null
          stripe_account_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          charges_enabled?: boolean
          created_at?: string
          details_submitted?: boolean
          id?: string
          payouts_enabled?: boolean
          requirements_due?: string | null
          stripe_account_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      contract_changes: {
        Row: {
          change_type: string
          contract_id: string
          created_at: string
          field_name: string
          id: string
          new_value: string | null
          old_value: string | null
          user_id: string
          version: number
        }
        Insert: {
          change_type?: string
          contract_id: string
          created_at?: string
          field_name: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          user_id: string
          version: number
        }
        Update: {
          change_type?: string
          contract_id?: string
          created_at?: string
          field_name?: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          user_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "contract_changes_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_comments: {
        Row: {
          content: string
          contract_id: string
          created_at: string
          id: string
          resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          section: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          contract_id: string
          created_at?: string
          id?: string
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          section: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          contract_id?: string
          created_at?: string
          id?: string
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          section?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contract_comments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          brand_address: string | null
          brand_company: string | null
          brand_id: string
          brand_name: string | null
          brand_obligations: string | null
          brand_signature_ip: string | null
          brand_signed_at: string | null
          campaign_description: string | null
          campaign_title: string
          content_types: string[] | null
          conversation_id: string | null
          created_at: string
          creator_address: string | null
          creator_id: string
          creator_name: string | null
          creator_net_amount: number
          creator_obligations: string | null
          creator_signature_ip: string | null
          creator_signed_at: string | null
          deadline: string | null
          deliverables: string[] | null
          dispute_resolution: string | null
          exclusivity_period: number | null
          id: string
          locked_at: string | null
          payment_terms: string | null
          platform_commission_amount: number
          platform_commission_rate: number
          platforms: string[] | null
          status: Database["public"]["Enums"]["contract_status"]
          stripe_fee_estimate: number | null
          total_amount: number
          updated_at: string
          usage_rights: string | null
          validation_deadline_days: number | null
          version: number
        }
        Insert: {
          brand_address?: string | null
          brand_company?: string | null
          brand_id: string
          brand_name?: string | null
          brand_obligations?: string | null
          brand_signature_ip?: string | null
          brand_signed_at?: string | null
          campaign_description?: string | null
          campaign_title: string
          content_types?: string[] | null
          conversation_id?: string | null
          created_at?: string
          creator_address?: string | null
          creator_id: string
          creator_name?: string | null
          creator_net_amount?: number
          creator_obligations?: string | null
          creator_signature_ip?: string | null
          creator_signed_at?: string | null
          deadline?: string | null
          deliverables?: string[] | null
          dispute_resolution?: string | null
          exclusivity_period?: number | null
          id?: string
          locked_at?: string | null
          payment_terms?: string | null
          platform_commission_amount?: number
          platform_commission_rate?: number
          platforms?: string[] | null
          status?: Database["public"]["Enums"]["contract_status"]
          stripe_fee_estimate?: number | null
          total_amount?: number
          updated_at?: string
          usage_rights?: string | null
          validation_deadline_days?: number | null
          version?: number
        }
        Update: {
          brand_address?: string | null
          brand_company?: string | null
          brand_id?: string
          brand_name?: string | null
          brand_obligations?: string | null
          brand_signature_ip?: string | null
          brand_signed_at?: string | null
          campaign_description?: string | null
          campaign_title?: string
          content_types?: string[] | null
          conversation_id?: string | null
          created_at?: string
          creator_address?: string | null
          creator_id?: string
          creator_name?: string | null
          creator_net_amount?: number
          creator_obligations?: string | null
          creator_signature_ip?: string | null
          creator_signed_at?: string | null
          deadline?: string | null
          deliverables?: string[] | null
          dispute_resolution?: string | null
          exclusivity_period?: number | null
          id?: string
          locked_at?: string | null
          payment_terms?: string | null
          platform_commission_amount?: number
          platform_commission_rate?: number
          platforms?: string[] | null
          status?: Database["public"]["Enums"]["contract_status"]
          stripe_fee_estimate?: number | null
          total_amount?: number
          updated_at?: string
          usage_rights?: string | null
          validation_deadline_days?: number | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "contracts_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          opportunity_id: string | null
          participant_1: string
          participant_2: string
          pitch_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          opportunity_id?: string | null
          participant_1: string
          participant_2: string
          pitch_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          opportunity_id?: string | null
          participant_1?: string
          participant_2?: string
          pitch_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "brand_opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_participant_1_fkey"
            columns: ["participant_1"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_participant_2_fkey"
            columns: ["participant_2"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_pitch_id_fkey"
            columns: ["pitch_id"]
            isOneToOne: false
            referencedRelation: "pitches"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_profiles: {
        Row: {
          audience_size: number | null
          content_categories: string[] | null
          created_at: string
          engagement_rate: number | null
          id: string
          instagram_followers: number | null
          instagram_handle: string | null
          rate_per_collab: number | null
          tiktok_followers: number | null
          tiktok_handle: string | null
          updated_at: string
          youtube_followers: number | null
          youtube_handle: string | null
        }
        Insert: {
          audience_size?: number | null
          content_categories?: string[] | null
          created_at?: string
          engagement_rate?: number | null
          id: string
          instagram_followers?: number | null
          instagram_handle?: string | null
          rate_per_collab?: number | null
          tiktok_followers?: number | null
          tiktok_handle?: string | null
          updated_at?: string
          youtube_followers?: number | null
          youtube_handle?: string | null
        }
        Update: {
          audience_size?: number | null
          content_categories?: string[] | null
          created_at?: string
          engagement_rate?: number | null
          id?: string
          instagram_followers?: number | null
          instagram_handle?: string | null
          rate_per_collab?: number | null
          tiktok_followers?: number | null
          tiktok_handle?: string | null
          updated_at?: string
          youtube_followers?: number | null
          youtube_handle?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "creator_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dispute_evidence: {
        Row: {
          created_at: string
          description: string
          dispute_id: string
          evidence_type: string
          file_url: string | null
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          dispute_id: string
          evidence_type?: string
          file_url?: string | null
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          dispute_id?: string
          evidence_type?: string
          file_url?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dispute_evidence_dispute_id_fkey"
            columns: ["dispute_id"]
            isOneToOne: false
            referencedRelation: "disputes"
            referencedColumns: ["id"]
          },
        ]
      }
      disputes: {
        Row: {
          admin_notes: string | null
          contract_id: string
          created_at: string
          id: string
          opened_by: string
          reason: string
          resolution_notes: string | null
          resolution_type: string | null
          resolved_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          contract_id: string
          created_at?: string
          id?: string
          opened_by: string
          reason: string
          resolution_notes?: string | null
          resolution_type?: string | null
          resolved_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          contract_id?: string
          created_at?: string
          id?: string
          opened_by?: string
          reason?: string
          resolution_notes?: string | null
          resolution_type?: string | null
          resolved_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "disputes_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          read: boolean | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          read?: boolean | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          read?: boolean | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          link: string | null
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          commission_amount: number
          commission_rate: number
          conversation_id: string | null
          created_at: string
          currency: string
          description: string | null
          id: string
          net_amount: number
          payee_id: string
          payer_id: string
          status: string
          stripe_payment_intent_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          commission_amount: number
          commission_rate?: number
          conversation_id?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          net_amount: number
          payee_id: string
          payer_id: string
          status?: string
          stripe_payment_intent_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          commission_amount?: number
          commission_rate?: number
          conversation_id?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          net_amount?: number
          payee_id?: string
          payer_id?: string
          status?: string
          stripe_payment_intent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      pitches: {
        Row: {
          budget_range: string | null
          content_type: string | null
          created_at: string
          creator_id: string
          description: string
          estimated_reach: number | null
          id: string
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          budget_range?: string | null
          content_type?: string | null
          created_at?: string
          creator_id: string
          description: string
          estimated_reach?: number | null
          id?: string
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          budget_range?: string | null
          content_type?: string | null
          created_at?: string
          creator_id?: string
          description?: string
          estimated_reach?: number | null
          id?: string
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pitches_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_settings: {
        Row: {
          created_at: string
          id: string
          setting_key: string
          setting_value: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          setting_key: string
          setting_value: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          setting_key?: string
          setting_value?: string
          updated_at?: string
        }
        Relationships: []
      }
      portfolio_items: {
        Row: {
          created_at: string
          creator_id: string
          description: string | null
          id: string
          image_url: string
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          description?: string | null
          id?: string
          image_url: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          description?: string | null
          id?: string
          image_url?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_items_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_config: {
        Row: {
          audience_tier: string
          created_at: string
          format: string
          id: string
          network: string
          price_min: number
          price_recommended: number
          reach_ratio_max: number
          reach_ratio_min: number
          updated_at: string
        }
        Insert: {
          audience_tier: string
          created_at?: string
          format: string
          id?: string
          network: string
          price_min: number
          price_recommended: number
          reach_ratio_max: number
          reach_ratio_min: number
          updated_at?: string
        }
        Update: {
          audience_tier?: string
          created_at?: string
          format?: string
          id?: string
          network?: string
          price_min?: number
          price_recommended?: number
          reach_ratio_max?: number
          reach_ratio_min?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          category_id: string | null
          created_at: string
          full_name: string | null
          id: string
          instagram_url: string | null
          linkedin_url: string | null
          tiktok_url: string | null
          twitter_url: string | null
          updated_at: string
          user_type: Database["public"]["Enums"]["user_type"]
          website_url: string | null
          youtube_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          category_id?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          instagram_url?: string | null
          linkedin_url?: string | null
          tiktok_url?: string | null
          twitter_url?: string | null
          updated_at?: string
          user_type?: Database["public"]["Enums"]["user_type"]
          website_url?: string | null
          youtube_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          category_id?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          instagram_url?: string | null
          linkedin_url?: string | null
          tiktok_url?: string | null
          twitter_url?: string | null
          updated_at?: string
          user_type?: Database["public"]["Enums"]["user_type"]
          website_url?: string | null
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      social_verifications: {
        Row: {
          created_at: string
          creator_id: string
          declared_avg_views: number | null
          declared_engagement: number | null
          declared_followers: number
          handle: string
          id: string
          network: Database["public"]["Enums"]["social_network"]
          profile_url: string
          rejection_reason: string | null
          screenshot_url: string | null
          status: Database["public"]["Enums"]["verification_status"]
          submitted_at: string
          updated_at: string
          verified_at: string | null
          verified_avg_views: number | null
          verified_by: string | null
          verified_engagement: number | null
          verified_followers: number | null
        }
        Insert: {
          created_at?: string
          creator_id: string
          declared_avg_views?: number | null
          declared_engagement?: number | null
          declared_followers: number
          handle: string
          id?: string
          network: Database["public"]["Enums"]["social_network"]
          profile_url: string
          rejection_reason?: string | null
          screenshot_url?: string | null
          status?: Database["public"]["Enums"]["verification_status"]
          submitted_at?: string
          updated_at?: string
          verified_at?: string | null
          verified_avg_views?: number | null
          verified_by?: string | null
          verified_engagement?: number | null
          verified_followers?: number | null
        }
        Update: {
          created_at?: string
          creator_id?: string
          declared_avg_views?: number | null
          declared_engagement?: number | null
          declared_followers?: number
          handle?: string
          id?: string
          network?: Database["public"]["Enums"]["social_network"]
          profile_url?: string
          rejection_reason?: string | null
          screenshot_url?: string | null
          status?: Database["public"]["Enums"]["verification_status"]
          submitted_at?: string
          updated_at?: string
          verified_at?: string | null
          verified_avg_views?: number | null
          verified_by?: string | null
          verified_engagement?: number | null
          verified_followers?: number | null
        }
        Relationships: []
      }
      user_commissions: {
        Row: {
          commission_rate: number
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          commission_rate?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          commission_rate?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      withdrawals: {
        Row: {
          amount: number
          created_at: string
          currency: string
          failure_reason: string | null
          iban: string | null
          id: string
          notes: string | null
          processed_at: string | null
          status: string
          stripe_payout_id: string | null
          stripe_transfer_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          failure_reason?: string | null
          iban?: string | null
          id?: string
          notes?: string | null
          processed_at?: string | null
          status?: string
          stripe_payout_id?: string | null
          stripe_transfer_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          failure_reason?: string | null
          iban?: string | null
          id?: string
          notes?: string | null
          processed_at?: string | null
          status?: string
          stripe_payout_id?: string | null
          stripe_transfer_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_campaign_matches: {
        Args: { _campaign_id: string; _limit?: number }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_creator_verified: { Args: { _creator_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user" | "superadmin"
      campaign_status:
        | "draft"
        | "matching"
        | "active"
        | "completed"
        | "cancelled"
      collab_status:
        | "awaiting_payment"
        | "escrowed"
        | "delivered"
        | "released"
        | "refunded"
        | "disputed"
      contract_status:
        | "draft"
        | "revision_requested"
        | "ready_to_sign"
        | "signed"
        | "active"
        | "completed"
        | "disputed"
        | "cancelled"
      match_brand_status: "pending" | "approved" | "rejected"
      match_creator_status: "pending" | "accepted" | "refused"
      social_network: "instagram" | "tiktok" | "youtube"
      user_type: "creator" | "brand"
      verification_status: "pending" | "verified" | "rejected"
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
      app_role: ["admin", "user", "superadmin"],
      campaign_status: [
        "draft",
        "matching",
        "active",
        "completed",
        "cancelled",
      ],
      collab_status: [
        "awaiting_payment",
        "escrowed",
        "delivered",
        "released",
        "refunded",
        "disputed",
      ],
      contract_status: [
        "draft",
        "revision_requested",
        "ready_to_sign",
        "signed",
        "active",
        "completed",
        "disputed",
        "cancelled",
      ],
      match_brand_status: ["pending", "approved", "rejected"],
      match_creator_status: ["pending", "accepted", "refused"],
      social_network: ["instagram", "tiktok", "youtube"],
      user_type: ["creator", "brand"],
      verification_status: ["pending", "verified", "rejected"],
    },
  },
} as const
