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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          achievement_type: string
          badge_color: string | null
          category: string
          coin_reward: number | null
          created_at: string
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_hidden: boolean | null
          min_level: number | null
          name: string
          rarity: string
          short_description: string | null
          slug: string | null
          total_unlocked: number | null
          unlock_condition: string | null
          unlock_requirement: Json | null
          updated_at: string
          xp_reward: number | null
        }
        Insert: {
          achievement_type?: string
          badge_color?: string | null
          category?: string
          coin_reward?: number | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_hidden?: boolean | null
          min_level?: number | null
          name: string
          rarity?: string
          short_description?: string | null
          slug?: string | null
          total_unlocked?: number | null
          unlock_condition?: string | null
          unlock_requirement?: Json | null
          updated_at?: string
          xp_reward?: number | null
        }
        Update: {
          achievement_type?: string
          badge_color?: string | null
          category?: string
          coin_reward?: number | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_hidden?: boolean | null
          min_level?: number | null
          name?: string
          rarity?: string
          short_description?: string | null
          slug?: string | null
          total_unlocked?: number | null
          unlock_condition?: string | null
          unlock_requirement?: Json | null
          updated_at?: string
          xp_reward?: number | null
        }
        Relationships: []
      }
      ad_banners: {
        Row: {
          alt_text: string | null
          animation_config: Json | null
          animation_type: string | null
          banner_type: string
          clicks: number | null
          content_type: string
          created_at: string
          cta_text: string | null
          end_date: string | null
          headline: string | null
          id: string
          image_url: string | null
          impressions: number | null
          is_active: boolean | null
          is_featured: boolean | null
          name: string
          page: string | null
          placement: string
          priority: number | null
          section: string | null
          slider_interval: number | null
          slider_items: Json | null
          slug: string | null
          sponsor: string | null
          start_date: string | null
          subtext: string | null
          target_url: string | null
          updated_at: string
          video_autoplay: boolean | null
          video_loop: boolean | null
          video_muted: boolean | null
          video_url: string | null
        }
        Insert: {
          alt_text?: string | null
          animation_config?: Json | null
          animation_type?: string | null
          banner_type?: string
          clicks?: number | null
          content_type?: string
          created_at?: string
          cta_text?: string | null
          end_date?: string | null
          headline?: string | null
          id?: string
          image_url?: string | null
          impressions?: number | null
          is_active?: boolean | null
          is_featured?: boolean | null
          name: string
          page?: string | null
          placement?: string
          priority?: number | null
          section?: string | null
          slider_interval?: number | null
          slider_items?: Json | null
          slug?: string | null
          sponsor?: string | null
          start_date?: string | null
          subtext?: string | null
          target_url?: string | null
          updated_at?: string
          video_autoplay?: boolean | null
          video_loop?: boolean | null
          video_muted?: boolean | null
          video_url?: string | null
        }
        Update: {
          alt_text?: string | null
          animation_config?: Json | null
          animation_type?: string | null
          banner_type?: string
          clicks?: number | null
          content_type?: string
          created_at?: string
          cta_text?: string | null
          end_date?: string | null
          headline?: string | null
          id?: string
          image_url?: string | null
          impressions?: number | null
          is_active?: boolean | null
          is_featured?: boolean | null
          name?: string
          page?: string | null
          placement?: string
          priority?: number | null
          section?: string | null
          slider_interval?: number | null
          slider_items?: Json | null
          slug?: string | null
          sponsor?: string | null
          start_date?: string | null
          subtext?: string | null
          target_url?: string | null
          updated_at?: string
          video_autoplay?: boolean | null
          video_loop?: boolean | null
          video_muted?: boolean | null
          video_url?: string | null
        }
        Relationships: []
      }
      airbnb_listings: {
        Row: {
          accuracy_rating: number | null
          address: string | null
          amenities: string[] | null
          bathrooms: number | null
          bedrooms: number | null
          beds: number | null
          cancellation_details: string | null
          cancellation_policy: string | null
          check_in_time: string | null
          check_out_time: string | null
          checkin_rating: number | null
          cleaning_fee: number | null
          cleanliness_rating: number | null
          communication_rating: number | null
          created_at: string
          description: string | null
          destination_id: string | null
          gallery: string[] | null
          guests: number | null
          host_description: string | null
          host_image: string | null
          host_languages: string[] | null
          host_name: string | null
          host_response_rate: number | null
          host_response_time: string | null
          host_since: string | null
          house_rules: string[] | null
          id: string
          image_url: string | null
          instant_book: boolean | null
          is_active: boolean | null
          is_featured: boolean | null
          is_sponsored: boolean | null
          is_superhost: boolean | null
          latitude: number | null
          location_rating: number | null
          longitude: number | null
          max_nights: number | null
          min_nights: number | null
          name: string
          neighborhood_description: string | null
          price_per_night: number | null
          price_range: string | null
          property_type: string | null
          rating: number | null
          review_count: number | null
          safety_features: string[] | null
          service_fee: number | null
          short_description: string | null
          slug: string | null
          updated_at: string
          value_rating: number | null
        }
        Insert: {
          accuracy_rating?: number | null
          address?: string | null
          amenities?: string[] | null
          bathrooms?: number | null
          bedrooms?: number | null
          beds?: number | null
          cancellation_details?: string | null
          cancellation_policy?: string | null
          check_in_time?: string | null
          check_out_time?: string | null
          checkin_rating?: number | null
          cleaning_fee?: number | null
          cleanliness_rating?: number | null
          communication_rating?: number | null
          created_at?: string
          description?: string | null
          destination_id?: string | null
          gallery?: string[] | null
          guests?: number | null
          host_description?: string | null
          host_image?: string | null
          host_languages?: string[] | null
          host_name?: string | null
          host_response_rate?: number | null
          host_response_time?: string | null
          host_since?: string | null
          house_rules?: string[] | null
          id?: string
          image_url?: string | null
          instant_book?: boolean | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_sponsored?: boolean | null
          is_superhost?: boolean | null
          latitude?: number | null
          location_rating?: number | null
          longitude?: number | null
          max_nights?: number | null
          min_nights?: number | null
          name: string
          neighborhood_description?: string | null
          price_per_night?: number | null
          price_range?: string | null
          property_type?: string | null
          rating?: number | null
          review_count?: number | null
          safety_features?: string[] | null
          service_fee?: number | null
          short_description?: string | null
          slug?: string | null
          updated_at?: string
          value_rating?: number | null
        }
        Update: {
          accuracy_rating?: number | null
          address?: string | null
          amenities?: string[] | null
          bathrooms?: number | null
          bedrooms?: number | null
          beds?: number | null
          cancellation_details?: string | null
          cancellation_policy?: string | null
          check_in_time?: string | null
          check_out_time?: string | null
          checkin_rating?: number | null
          cleaning_fee?: number | null
          cleanliness_rating?: number | null
          communication_rating?: number | null
          created_at?: string
          description?: string | null
          destination_id?: string | null
          gallery?: string[] | null
          guests?: number | null
          host_description?: string | null
          host_image?: string | null
          host_languages?: string[] | null
          host_name?: string | null
          host_response_rate?: number | null
          host_response_time?: string | null
          host_since?: string | null
          house_rules?: string[] | null
          id?: string
          image_url?: string | null
          instant_book?: boolean | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_sponsored?: boolean | null
          is_superhost?: boolean | null
          latitude?: number | null
          location_rating?: number | null
          longitude?: number | null
          max_nights?: number | null
          min_nights?: number | null
          name?: string
          neighborhood_description?: string | null
          price_per_night?: number | null
          price_range?: string | null
          property_type?: string | null
          rating?: number | null
          review_count?: number | null
          safety_features?: string[] | null
          service_fee?: number | null
          short_description?: string | null
          slug?: string | null
          updated_at?: string
          value_rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "airbnb_listings_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          page: string | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          page?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          page?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      article_translations: {
        Row: {
          article_id: string
          content: string | null
          created_at: string
          excerpt: string | null
          id: string
          locale: string
          title: string
          updated_at: string
        }
        Insert: {
          article_id: string
          content?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          locale: string
          title: string
          updated_at?: string
        }
        Update: {
          article_id?: string
          content?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          locale?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_translations_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          author_image: string | null
          author_name: string | null
          category: string | null
          content: string | null
          created_at: string
          excerpt: string | null
          gallery: string[] | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          is_published: boolean | null
          published_at: string | null
          slug: string | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author_image?: string | null
          author_name?: string | null
          category?: string | null
          content?: string | null
          created_at?: string
          excerpt?: string | null
          gallery?: string[] | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_published?: boolean | null
          published_at?: string | null
          slug?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author_image?: string | null
          author_name?: string | null
          category?: string | null
          content?: string | null
          created_at?: string
          excerpt?: string | null
          gallery?: string[] | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_published?: boolean | null
          published_at?: string | null
          slug?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      artisanal_workshops: {
        Row: {
          address: string | null
          craft_types: string[] | null
          created_at: string
          description: string | null
          destination_id: string | null
          duration: string | null
          email: string | null
          gallery: string[] | null
          id: string
          image_url: string | null
          includes: string[] | null
          is_active: boolean | null
          is_featured: boolean | null
          languages: string[] | null
          latitude: number | null
          longitude: number | null
          max_participants: number | null
          name: string
          opening_hours: string | null
          phone: string | null
          price_range: string | null
          rating: number | null
          review_count: number | null
          short_description: string | null
          skill_level: string | null
          slug: string | null
          updated_at: string
          website: string | null
          workshop_type: string | null
        }
        Insert: {
          address?: string | null
          craft_types?: string[] | null
          created_at?: string
          description?: string | null
          destination_id?: string | null
          duration?: string | null
          email?: string | null
          gallery?: string[] | null
          id?: string
          image_url?: string | null
          includes?: string[] | null
          is_active?: boolean | null
          is_featured?: boolean | null
          languages?: string[] | null
          latitude?: number | null
          longitude?: number | null
          max_participants?: number | null
          name: string
          opening_hours?: string | null
          phone?: string | null
          price_range?: string | null
          rating?: number | null
          review_count?: number | null
          short_description?: string | null
          skill_level?: string | null
          slug?: string | null
          updated_at?: string
          website?: string | null
          workshop_type?: string | null
        }
        Update: {
          address?: string | null
          craft_types?: string[] | null
          created_at?: string
          description?: string | null
          destination_id?: string | null
          duration?: string | null
          email?: string | null
          gallery?: string[] | null
          id?: string
          image_url?: string | null
          includes?: string[] | null
          is_active?: boolean | null
          is_featured?: boolean | null
          languages?: string[] | null
          latitude?: number | null
          longitude?: number | null
          max_participants?: number | null
          name?: string
          opening_hours?: string | null
          phone?: string | null
          price_range?: string | null
          rating?: number | null
          review_count?: number | null
          short_description?: string | null
          skill_level?: string | null
          slug?: string | null
          updated_at?: string
          website?: string | null
          workshop_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "artisanal_workshops_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      bars: {
        Row: {
          address: string | null
          ambiance: string | null
          bar_type: string | null
          created_at: string
          description: string | null
          destination_id: string | null
          dress_code: string | null
          email: string | null
          gallery: string[] | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_featured: boolean | null
          is_sponsored: boolean | null
          latitude: number | null
          longitude: number | null
          minimum_age: number | null
          music_style: string | null
          name: string
          opening_hours: string | null
          phone: string | null
          price_range: string | null
          rating: number | null
          review_count: number | null
          services: string[] | null
          short_description: string | null
          slug: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          ambiance?: string | null
          bar_type?: string | null
          created_at?: string
          description?: string | null
          destination_id?: string | null
          dress_code?: string | null
          email?: string | null
          gallery?: string[] | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_sponsored?: boolean | null
          latitude?: number | null
          longitude?: number | null
          minimum_age?: number | null
          music_style?: string | null
          name: string
          opening_hours?: string | null
          phone?: string | null
          price_range?: string | null
          rating?: number | null
          review_count?: number | null
          services?: string[] | null
          short_description?: string | null
          slug?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          ambiance?: string | null
          bar_type?: string | null
          created_at?: string
          description?: string | null
          destination_id?: string | null
          dress_code?: string | null
          email?: string | null
          gallery?: string[] | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_sponsored?: boolean | null
          latitude?: number | null
          longitude?: number | null
          minimum_age?: number | null
          music_style?: string | null
          name?: string
          opening_hours?: string | null
          phone?: string | null
          price_range?: string | null
          rating?: number | null
          review_count?: number | null
          services?: string[] | null
          short_description?: string | null
          slug?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bars_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      beaches: {
        Row: {
          access_type: string | null
          activities: string[] | null
          address: string | null
          amenities: string[] | null
          beach_type: string | null
          best_time_to_visit: string | null
          created_at: string
          crowd_level: string | null
          description: string | null
          destination_id: string | null
          gallery: string[] | null
          how_to_get_there: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_featured: boolean | null
          is_popular: boolean | null
          latitude: number | null
          lifeguard_on_duty: boolean | null
          longitude: number | null
          name: string
          parking_available: boolean | null
          province_id: string | null
          rating: number | null
          review_count: number | null
          sand_type: string | null
          short_description: string | null
          slug: string | null
          updated_at: string
          water_color: string | null
          wave_intensity: string | null
        }
        Insert: {
          access_type?: string | null
          activities?: string[] | null
          address?: string | null
          amenities?: string[] | null
          beach_type?: string | null
          best_time_to_visit?: string | null
          created_at?: string
          crowd_level?: string | null
          description?: string | null
          destination_id?: string | null
          gallery?: string[] | null
          how_to_get_there?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_popular?: boolean | null
          latitude?: number | null
          lifeguard_on_duty?: boolean | null
          longitude?: number | null
          name: string
          parking_available?: boolean | null
          province_id?: string | null
          rating?: number | null
          review_count?: number | null
          sand_type?: string | null
          short_description?: string | null
          slug?: string | null
          updated_at?: string
          water_color?: string | null
          wave_intensity?: string | null
        }
        Update: {
          access_type?: string | null
          activities?: string[] | null
          address?: string | null
          amenities?: string[] | null
          beach_type?: string | null
          best_time_to_visit?: string | null
          created_at?: string
          crowd_level?: string | null
          description?: string | null
          destination_id?: string | null
          gallery?: string[] | null
          how_to_get_there?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_popular?: boolean | null
          latitude?: number | null
          lifeguard_on_duty?: boolean | null
          longitude?: number | null
          name?: string
          parking_available?: boolean | null
          province_id?: string | null
          rating?: number | null
          review_count?: number | null
          sand_type?: string | null
          short_description?: string | null
          slug?: string | null
          updated_at?: string
          water_color?: string | null
          wave_intensity?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "beaches_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beaches_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "provinces"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_items: {
        Row: {
          created_at: string
          id: string
          price: number
          product_id: string
          product_image: string | null
          product_name: string
          quantity: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          price?: number
          product_id: string
          product_image?: string | null
          product_name: string
          quantity?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          price?: number
          product_id?: string
          product_image?: string | null
          product_name?: string
          quantity?: number
          user_id?: string
        }
        Relationships: []
      }
      caves: {
        Row: {
          address: string | null
          cave_type: string | null
          created_at: string
          description: string | null
          destination_id: string | null
          difficulty: string | null
          email: string | null
          flora_fauna: string[] | null
          gallery: string[] | null
          highlights: string[] | null
          historical_info: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_featured: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          opening_hours: string | null
          phone: string | null
          price_adult: number | null
          price_child: number | null
          rating: number | null
          review_count: number | null
          short_description: string | null
          slug: string | null
          tour_duration: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          cave_type?: string | null
          created_at?: string
          description?: string | null
          destination_id?: string | null
          difficulty?: string | null
          email?: string | null
          flora_fauna?: string[] | null
          gallery?: string[] | null
          highlights?: string[] | null
          historical_info?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          opening_hours?: string | null
          phone?: string | null
          price_adult?: number | null
          price_child?: number | null
          rating?: number | null
          review_count?: number | null
          short_description?: string | null
          slug?: string | null
          tour_duration?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          cave_type?: string | null
          created_at?: string
          description?: string | null
          destination_id?: string | null
          difficulty?: string | null
          email?: string | null
          flora_fauna?: string[] | null
          gallery?: string[] | null
          highlights?: string[] | null
          historical_info?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          opening_hours?: string | null
          phone?: string | null
          price_adult?: number | null
          price_child?: number | null
          rating?: number | null
          review_count?: number | null
          short_description?: string | null
          slug?: string | null
          tour_duration?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "caves_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      clinics: {
        Row: {
          address: string | null
          certifications: string[] | null
          clinic_type: string | null
          created_at: string
          description: string | null
          destination_id: string | null
          email: string | null
          emergency_phone: string | null
          gallery: string[] | null
          id: string
          image_url: string | null
          insurance_accepted: string[] | null
          is_24_hours: boolean | null
          is_active: boolean | null
          is_featured: boolean | null
          languages: string[] | null
          latitude: number | null
          longitude: number | null
          name: string
          opening_hours: string | null
          phone: string | null
          rating: number | null
          review_count: number | null
          services: string[] | null
          short_description: string | null
          slug: string | null
          specialties: string[] | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          certifications?: string[] | null
          clinic_type?: string | null
          created_at?: string
          description?: string | null
          destination_id?: string | null
          email?: string | null
          emergency_phone?: string | null
          gallery?: string[] | null
          id?: string
          image_url?: string | null
          insurance_accepted?: string[] | null
          is_24_hours?: boolean | null
          is_active?: boolean | null
          is_featured?: boolean | null
          languages?: string[] | null
          latitude?: number | null
          longitude?: number | null
          name: string
          opening_hours?: string | null
          phone?: string | null
          rating?: number | null
          review_count?: number | null
          services?: string[] | null
          short_description?: string | null
          slug?: string | null
          specialties?: string[] | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          certifications?: string[] | null
          clinic_type?: string | null
          created_at?: string
          description?: string | null
          destination_id?: string | null
          email?: string | null
          emergency_phone?: string | null
          gallery?: string[] | null
          id?: string
          image_url?: string | null
          insurance_accepted?: string[] | null
          is_24_hours?: boolean | null
          is_active?: boolean | null
          is_featured?: boolean | null
          languages?: string[] | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          opening_hours?: string | null
          phone?: string | null
          rating?: number | null
          review_count?: number | null
          services?: string[] | null
          short_description?: string | null
          slug?: string | null
          specialties?: string[] | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clinics_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      coffee_experiences: {
        Row: {
          address: string | null
          altitude: string | null
          coffee_varieties: string[] | null
          created_at: string
          description: string | null
          destination_id: string | null
          email: string | null
          experience_type: string | null
          gallery: string[] | null
          id: string
          image_url: string | null
          includes: string[] | null
          is_active: boolean | null
          is_featured: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          opening_hours: string | null
          phone: string | null
          price_range: string | null
          production_process: string | null
          rating: number | null
          review_count: number | null
          short_description: string | null
          slug: string | null
          tasting_notes: string | null
          tour_duration: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          altitude?: string | null
          coffee_varieties?: string[] | null
          created_at?: string
          description?: string | null
          destination_id?: string | null
          email?: string | null
          experience_type?: string | null
          gallery?: string[] | null
          id?: string
          image_url?: string | null
          includes?: string[] | null
          is_active?: boolean | null
          is_featured?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          opening_hours?: string | null
          phone?: string | null
          price_range?: string | null
          production_process?: string | null
          rating?: number | null
          review_count?: number | null
          short_description?: string | null
          slug?: string | null
          tasting_notes?: string | null
          tour_duration?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          altitude?: string | null
          coffee_varieties?: string[] | null
          created_at?: string
          description?: string | null
          destination_id?: string | null
          email?: string | null
          experience_type?: string | null
          gallery?: string[] | null
          id?: string
          image_url?: string | null
          includes?: string[] | null
          is_active?: boolean | null
          is_featured?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          opening_hours?: string | null
          phone?: string | null
          price_range?: string | null
          production_process?: string | null
          rating?: number | null
          review_count?: number | null
          short_description?: string | null
          slug?: string | null
          tasting_notes?: string | null
          tour_duration?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coffee_experiences_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      contest_registrations: {
        Row: {
          created_at: string
          edad: string | null
          email: string
          id: string
          intereses: string[] | null
          nombre: string
          pais: string | null
          telefono: string | null
          visitado: string | null
        }
        Insert: {
          created_at?: string
          edad?: string | null
          email: string
          id?: string
          intereses?: string[] | null
          nombre: string
          pais?: string | null
          telefono?: string | null
          visitado?: string | null
        }
        Update: {
          created_at?: string
          edad?: string | null
          email?: string
          id?: string
          intereses?: string[] | null
          nombre?: string
          pais?: string | null
          telefono?: string | null
          visitado?: string | null
        }
        Relationships: []
      }
      destinations: {
        Row: {
          best_time_to_visit: string | null
          created_at: string
          description: string | null
          gallery: string[] | null
          highlights: string[] | null
          how_to_get_there: string | null
          id: string
          image_url: string | null
          latitude: number | null
          longitude: number | null
          municipality_id: string | null
          name: string
          province_id: string | null
          short_description: string | null
          slug: string | null
          typical_dishes: string[] | null
          updated_at: string
          weather_info: string | null
        }
        Insert: {
          best_time_to_visit?: string | null
          created_at?: string
          description?: string | null
          gallery?: string[] | null
          highlights?: string[] | null
          how_to_get_there?: string | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          municipality_id?: string | null
          name: string
          province_id?: string | null
          short_description?: string | null
          slug?: string | null
          typical_dishes?: string[] | null
          updated_at?: string
          weather_info?: string | null
        }
        Update: {
          best_time_to_visit?: string | null
          created_at?: string
          description?: string | null
          gallery?: string[] | null
          highlights?: string[] | null
          how_to_get_there?: string | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          municipality_id?: string | null
          name?: string
          province_id?: string | null
          short_description?: string | null
          slug?: string | null
          typical_dishes?: string[] | null
          updated_at?: string
          weather_info?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "destinations_municipality_id_fkey"
            columns: ["municipality_id"]
            isOneToOne: false
            referencedRelation: "municipalities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "destinations_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "provinces"
            referencedColumns: ["id"]
          },
        ]
      }
      digital_collectibles: {
        Row: {
          animated_url: string | null
          coin_value: number | null
          collectible_type: string
          created_at: string
          current_supply: number | null
          description: string | null
          event_id: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_tradeable: boolean | null
          name: string
          rarity: string
          season: string | null
          short_description: string | null
          slug: string | null
          thumbnail_url: string | null
          total_supply: number | null
          unlock_condition: string | null
          unlock_requirement: Json | null
          updated_at: string
          xp_value: number | null
        }
        Insert: {
          animated_url?: string | null
          coin_value?: number | null
          collectible_type: string
          created_at?: string
          current_supply?: number | null
          description?: string | null
          event_id?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_tradeable?: boolean | null
          name: string
          rarity?: string
          season?: string | null
          short_description?: string | null
          slug?: string | null
          thumbnail_url?: string | null
          total_supply?: number | null
          unlock_condition?: string | null
          unlock_requirement?: Json | null
          updated_at?: string
          xp_value?: number | null
        }
        Update: {
          animated_url?: string | null
          coin_value?: number | null
          collectible_type?: string
          created_at?: string
          current_supply?: number | null
          description?: string | null
          event_id?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_tradeable?: boolean | null
          name?: string
          rarity?: string
          season?: string | null
          short_description?: string | null
          slug?: string | null
          thumbnail_url?: string | null
          total_supply?: number | null
          unlock_condition?: string | null
          unlock_requirement?: Json | null
          updated_at?: string
          xp_value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "digital_collectibles_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      establecimientos: {
        Row: {
          actividad: string | null
          correo: string | null
          created_at: string
          estatus_establecimiento: string | null
          estatus_licencia: string | null
          estatus_proceso: string | null
          fecha_vencimiento: string | null
          id: string
          is_active: boolean | null
          nombre: string
          numero_identificacion: string | null
          provincia: string | null
          rut: string | null
          sector_zona: string | null
          subsector: string
          telefono: string | null
          updated_at: string
        }
        Insert: {
          actividad?: string | null
          correo?: string | null
          created_at?: string
          estatus_establecimiento?: string | null
          estatus_licencia?: string | null
          estatus_proceso?: string | null
          fecha_vencimiento?: string | null
          id?: string
          is_active?: boolean | null
          nombre: string
          numero_identificacion?: string | null
          provincia?: string | null
          rut?: string | null
          sector_zona?: string | null
          subsector: string
          telefono?: string | null
          updated_at?: string
        }
        Update: {
          actividad?: string | null
          correo?: string | null
          created_at?: string
          estatus_establecimiento?: string | null
          estatus_licencia?: string | null
          estatus_proceso?: string | null
          fecha_vencimiento?: string | null
          id?: string
          is_active?: boolean | null
          nombre?: string
          numero_identificacion?: string | null
          provincia?: string | null
          rut?: string | null
          sector_zona?: string | null
          subsector?: string
          telefono?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          address: string | null
          created_at: string
          description: string | null
          destination_id: string | null
          end_date: string | null
          end_time: string | null
          event_type: string | null
          gallery: string[] | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_featured: boolean | null
          is_recurring: boolean | null
          name: string
          organizer: string | null
          price_range: string | null
          recurrence_pattern: string | null
          short_description: string | null
          slug: string | null
          start_date: string | null
          start_time: string | null
          ticket_url: string | null
          updated_at: string
          venue: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          description?: string | null
          destination_id?: string | null
          end_date?: string | null
          end_time?: string | null
          event_type?: string | null
          gallery?: string[] | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_recurring?: boolean | null
          name: string
          organizer?: string | null
          price_range?: string | null
          recurrence_pattern?: string | null
          short_description?: string | null
          slug?: string | null
          start_date?: string | null
          start_time?: string | null
          ticket_url?: string | null
          updated_at?: string
          venue?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          description?: string | null
          destination_id?: string | null
          end_date?: string | null
          end_time?: string | null
          event_type?: string | null
          gallery?: string[] | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_recurring?: boolean | null
          name?: string
          organizer?: string | null
          price_range?: string | null
          recurrence_pattern?: string | null
          short_description?: string | null
          slug?: string | null
          start_date?: string | null
          start_time?: string | null
          ticket_url?: string | null
          updated_at?: string
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      experiences: {
        Row: {
          best_season: string | null
          category: string | null
          created_at: string
          description: string | null
          destination_id: string | null
          difficulty: string | null
          duration: string | null
          experience_type: string | null
          gallery: string[] | null
          highlights: string[] | null
          id: string
          image_url: string | null
          included: string[] | null
          is_active: boolean | null
          is_featured: boolean | null
          is_sponsored: boolean | null
          name: string
          price_range: string | null
          rating: number | null
          requirements: string[] | null
          review_count: number | null
          short_description: string | null
          slug: string | null
          updated_at: string
        }
        Insert: {
          best_season?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          destination_id?: string | null
          difficulty?: string | null
          duration?: string | null
          experience_type?: string | null
          gallery?: string[] | null
          highlights?: string[] | null
          id?: string
          image_url?: string | null
          included?: string[] | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_sponsored?: boolean | null
          name: string
          price_range?: string | null
          rating?: number | null
          requirements?: string[] | null
          review_count?: number | null
          short_description?: string | null
          slug?: string | null
          updated_at?: string
        }
        Update: {
          best_season?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          destination_id?: string | null
          difficulty?: string | null
          duration?: string | null
          experience_type?: string | null
          gallery?: string[] | null
          highlights?: string[] | null
          id?: string
          image_url?: string | null
          included?: string[] | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_sponsored?: boolean | null
          name?: string
          price_range?: string | null
          rating?: number | null
          requirements?: string[] | null
          review_count?: number | null
          short_description?: string | null
          slug?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "experiences_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          item_id: string
          item_image: string | null
          item_location: string | null
          item_name: string
          item_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          item_image?: string | null
          item_location?: string | null
          item_name: string
          item_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          item_image?: string | null
          item_location?: string | null
          item_name?: string
          item_type?: string
          user_id?: string
        }
        Relationships: []
      }
      gamification_levels: {
        Row: {
          color: string | null
          created_at: string
          icon: string | null
          id: string
          level_number: number
          marketplace_discount: number | null
          name: string
          perks: string[] | null
          title: string
          xp_required: number
        }
        Insert: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          level_number: number
          marketplace_discount?: number | null
          name: string
          perks?: string[] | null
          title: string
          xp_required?: number
        }
        Update: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          level_number?: number
          marketplace_discount?: number | null
          name?: string
          perks?: string[] | null
          title?: string
          xp_required?: number
        }
        Relationships: []
      }
      gamification_missions: {
        Row: {
          category: string | null
          coin_reward: number
          created_at: string
          description: string | null
          end_date: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          min_level: number | null
          mission_type: string
          name: string
          short_description: string | null
          start_date: string | null
          target_action: string
          target_count: number
          updated_at: string
          xp_reward: number
        }
        Insert: {
          category?: string | null
          coin_reward?: number
          created_at?: string
          description?: string | null
          end_date?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          min_level?: number | null
          mission_type?: string
          name: string
          short_description?: string | null
          start_date?: string | null
          target_action: string
          target_count?: number
          updated_at?: string
          xp_reward?: number
        }
        Update: {
          category?: string | null
          coin_reward?: number
          created_at?: string
          description?: string | null
          end_date?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          min_level?: number | null
          mission_type?: string
          name?: string
          short_description?: string | null
          start_date?: string | null
          target_action?: string
          target_count?: number
          updated_at?: string
          xp_reward?: number
        }
        Relationships: []
      }
      gamification_prizes: {
        Row: {
          coin_cost: number
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_featured: boolean | null
          min_level: number | null
          name: string
          prize_type: string
          quantity_available: number | null
          quantity_redeemed: number | null
          short_description: string | null
          sponsor: string | null
          terms: string | null
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          coin_cost?: number
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          min_level?: number | null
          name: string
          prize_type?: string
          quantity_available?: number | null
          quantity_redeemed?: number | null
          short_description?: string | null
          sponsor?: string | null
          terms?: string | null
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          coin_cost?: number
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          min_level?: number | null
          name?: string
          prize_type?: string
          quantity_available?: number | null
          quantity_redeemed?: number | null
          short_description?: string | null
          sponsor?: string | null
          terms?: string | null
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      gamification_seasons: {
        Row: {
          banner_url: string | null
          coin_multiplier: number | null
          color_primary: string | null
          color_secondary: string | null
          created_at: string
          description: string | null
          end_date: string
          icon: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_featured: boolean | null
          name: string
          participant_count: number | null
          season_type: string
          short_description: string | null
          slug: string | null
          start_date: string
          theme: string | null
          updated_at: string
          xp_multiplier: number | null
        }
        Insert: {
          banner_url?: string | null
          coin_multiplier?: number | null
          color_primary?: string | null
          color_secondary?: string | null
          created_at?: string
          description?: string | null
          end_date: string
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          name: string
          participant_count?: number | null
          season_type?: string
          short_description?: string | null
          slug?: string | null
          start_date: string
          theme?: string | null
          updated_at?: string
          xp_multiplier?: number | null
        }
        Update: {
          banner_url?: string | null
          coin_multiplier?: number | null
          color_primary?: string | null
          color_secondary?: string | null
          created_at?: string
          description?: string | null
          end_date?: string
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          name?: string
          participant_count?: number | null
          season_type?: string
          short_description?: string | null
          slug?: string | null
          start_date?: string
          theme?: string | null
          updated_at?: string
          xp_multiplier?: number | null
        }
        Relationships: []
      }
      gamification_transactions: {
        Row: {
          coin_amount: number | null
          created_at: string
          description: string | null
          id: string
          source_id: string | null
          source_type: string | null
          transaction_type: string
          user_id: string
          xp_amount: number | null
        }
        Insert: {
          coin_amount?: number | null
          created_at?: string
          description?: string | null
          id?: string
          source_id?: string | null
          source_type?: string | null
          transaction_type: string
          user_id: string
          xp_amount?: number | null
        }
        Update: {
          coin_amount?: number | null
          created_at?: string
          description?: string | null
          id?: string
          source_id?: string | null
          source_type?: string | null
          transaction_type?: string
          user_id?: string
          xp_amount?: number | null
        }
        Relationships: []
      }
      gamified_routes: {
        Row: {
          completion_badge_id: string | null
          created_at: string
          description: string | null
          difficulty: string | null
          distance_km: number | null
          duration_days: number | null
          gallery: string[] | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_featured: boolean | null
          min_level: number | null
          name: string
          route_type: string
          short_description: string | null
          slug: string | null
          total_coin_reward: number | null
          total_xp_reward: number | null
          updated_at: string
        }
        Insert: {
          completion_badge_id?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          distance_km?: number | null
          duration_days?: number | null
          gallery?: string[] | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          min_level?: number | null
          name: string
          route_type?: string
          short_description?: string | null
          slug?: string | null
          total_coin_reward?: number | null
          total_xp_reward?: number | null
          updated_at?: string
        }
        Update: {
          completion_badge_id?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          distance_km?: number | null
          duration_days?: number | null
          gallery?: string[] | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          min_level?: number | null
          name?: string
          route_type?: string
          short_description?: string | null
          slug?: string | null
          total_coin_reward?: number | null
          total_xp_reward?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gamified_routes_completion_badge_id_fkey"
            columns: ["completion_badge_id"]
            isOneToOne: false
            referencedRelation: "gamification_prizes"
            referencedColumns: ["id"]
          },
        ]
      }
      historical_events: {
        Row: {
          category: string | null
          consequences: string[] | null
          created_at: string
          description: string | null
          end_date: string | null
          era: string | null
          event_date: string | null
          gallery: string[] | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_featured: boolean | null
          key_figures: string[] | null
          location: string | null
          name: string
          short_description: string | null
          significance: string | null
          slug: string | null
          sources: string[] | null
          updated_at: string
          year: number | null
        }
        Insert: {
          category?: string | null
          consequences?: string[] | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          era?: string | null
          event_date?: string | null
          gallery?: string[] | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          key_figures?: string[] | null
          location?: string | null
          name: string
          short_description?: string | null
          significance?: string | null
          slug?: string | null
          sources?: string[] | null
          updated_at?: string
          year?: number | null
        }
        Update: {
          category?: string | null
          consequences?: string[] | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          era?: string | null
          event_date?: string | null
          gallery?: string[] | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          key_figures?: string[] | null
          location?: string | null
          name?: string
          short_description?: string | null
          significance?: string | null
          slug?: string | null
          sources?: string[] | null
          updated_at?: string
          year?: number | null
        }
        Relationships: []
      }
      historical_figures: {
        Row: {
          achievements: string[] | null
          biography: string | null
          birth_date: string | null
          birth_place: string | null
          category: string | null
          created_at: string
          death_date: string | null
          description: string | null
          era: string | null
          gallery: string[] | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_featured: boolean | null
          name: string
          quotes: string[] | null
          related_events: string[] | null
          short_description: string | null
          slug: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          achievements?: string[] | null
          biography?: string | null
          birth_date?: string | null
          birth_place?: string | null
          category?: string | null
          created_at?: string
          death_date?: string | null
          description?: string | null
          era?: string | null
          gallery?: string[] | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          name: string
          quotes?: string[] | null
          related_events?: string[] | null
          short_description?: string | null
          slug?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          achievements?: string[] | null
          biography?: string | null
          birth_date?: string | null
          birth_place?: string | null
          category?: string | null
          created_at?: string
          death_date?: string | null
          description?: string | null
          era?: string | null
          gallery?: string[] | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          name?: string
          quotes?: string[] | null
          related_events?: string[] | null
          short_description?: string | null
          slug?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      hotels: {
        Row: {
          address: string | null
          amenities: string[] | null
          category: string | null
          created_at: string
          description: string | null
          destination_id: string | null
          email: string | null
          gallery: string[] | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_featured: boolean | null
          is_sponsored: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          phone: string | null
          price_range: string | null
          rating: number | null
          review_count: number | null
          short_description: string | null
          slug: string | null
          stars: number | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          amenities?: string[] | null
          category?: string | null
          created_at?: string
          description?: string | null
          destination_id?: string | null
          email?: string | null
          gallery?: string[] | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_sponsored?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          phone?: string | null
          price_range?: string | null
          rating?: number | null
          review_count?: number | null
          short_description?: string | null
          slug?: string | null
          stars?: number | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          amenities?: string[] | null
          category?: string | null
          created_at?: string
          description?: string | null
          destination_id?: string | null
          email?: string | null
          gallery?: string[] | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_sponsored?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          phone?: string | null
          price_range?: string | null
          rating?: number | null
          review_count?: number | null
          short_description?: string | null
          slug?: string | null
          stars?: number | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hotels_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      job_vacancies: {
        Row: {
          address: string | null
          applicants_count: number | null
          application_email: string | null
          application_url: string | null
          benefits: string[] | null
          category: string | null
          company_description: string | null
          company_logo: string | null
          company_name: string
          created_at: string
          deadline: string | null
          department: string | null
          description: string | null
          education: string | null
          experience_level: string | null
          hotel_id: string | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          is_remote: boolean | null
          is_urgent: boolean | null
          job_type: string | null
          languages: string[] | null
          location: string | null
          province: string | null
          requirements: string[] | null
          responsibilities: string[] | null
          restaurant_id: string | null
          salary_currency: string | null
          salary_max: number | null
          salary_min: number | null
          salary_range: string | null
          short_description: string | null
          skills: string[] | null
          slug: string | null
          title: string
          updated_at: string
          views_count: number | null
        }
        Insert: {
          address?: string | null
          applicants_count?: number | null
          application_email?: string | null
          application_url?: string | null
          benefits?: string[] | null
          category?: string | null
          company_description?: string | null
          company_logo?: string | null
          company_name: string
          created_at?: string
          deadline?: string | null
          department?: string | null
          description?: string | null
          education?: string | null
          experience_level?: string | null
          hotel_id?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          is_remote?: boolean | null
          is_urgent?: boolean | null
          job_type?: string | null
          languages?: string[] | null
          location?: string | null
          province?: string | null
          requirements?: string[] | null
          responsibilities?: string[] | null
          restaurant_id?: string | null
          salary_currency?: string | null
          salary_max?: number | null
          salary_min?: number | null
          salary_range?: string | null
          short_description?: string | null
          skills?: string[] | null
          slug?: string | null
          title: string
          updated_at?: string
          views_count?: number | null
        }
        Update: {
          address?: string | null
          applicants_count?: number | null
          application_email?: string | null
          application_url?: string | null
          benefits?: string[] | null
          category?: string | null
          company_description?: string | null
          company_logo?: string | null
          company_name?: string
          created_at?: string
          deadline?: string | null
          department?: string | null
          description?: string | null
          education?: string | null
          experience_level?: string | null
          hotel_id?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          is_remote?: boolean | null
          is_urgent?: boolean | null
          job_type?: string | null
          languages?: string[] | null
          location?: string | null
          province?: string | null
          requirements?: string[] | null
          responsibilities?: string[] | null
          restaurant_id?: string | null
          salary_currency?: string | null
          salary_max?: number | null
          salary_min?: number | null
          salary_range?: string | null
          short_description?: string | null
          skills?: string[] | null
          slug?: string | null
          title?: string
          updated_at?: string
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "job_vacancies_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_vacancies_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      lottery_results: {
        Row: {
          bonus_number: number | null
          created_at: string
          draw_date: string
          draw_time: string | null
          draw_type: string | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          jackpot_amount: string | null
          logo_url: string | null
          lottery_name: string
          next_draw_date: string | null
          next_jackpot_estimate: string | null
          prize_pool: string | null
          slug: string | null
          updated_at: string
          winning_numbers: number[] | null
        }
        Insert: {
          bonus_number?: number | null
          created_at?: string
          draw_date: string
          draw_time?: string | null
          draw_type?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          jackpot_amount?: string | null
          logo_url?: string | null
          lottery_name: string
          next_draw_date?: string | null
          next_jackpot_estimate?: string | null
          prize_pool?: string | null
          slug?: string | null
          updated_at?: string
          winning_numbers?: number[] | null
        }
        Update: {
          bonus_number?: number | null
          created_at?: string
          draw_date?: string
          draw_time?: string | null
          draw_type?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          jackpot_amount?: string | null
          logo_url?: string | null
          lottery_name?: string
          next_draw_date?: string | null
          next_jackpot_estimate?: string | null
          prize_pool?: string | null
          slug?: string | null
          updated_at?: string
          winning_numbers?: number[] | null
        }
        Relationships: []
      }
      municipalities: {
        Row: {
          area_km2: number | null
          created_at: string
          description: string | null
          gallery: string[] | null
          highlights: string[] | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_tourist_destination: boolean | null
          latitude: number | null
          longitude: number | null
          municipality_type: string | null
          name: string
          population: number | null
          province_id: string | null
          short_description: string | null
          slug: string | null
          updated_at: string
        }
        Insert: {
          area_km2?: number | null
          created_at?: string
          description?: string | null
          gallery?: string[] | null
          highlights?: string[] | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_tourist_destination?: boolean | null
          latitude?: number | null
          longitude?: number | null
          municipality_type?: string | null
          name: string
          population?: number | null
          province_id?: string | null
          short_description?: string | null
          slug?: string | null
          updated_at?: string
        }
        Update: {
          area_km2?: number | null
          created_at?: string
          description?: string | null
          gallery?: string[] | null
          highlights?: string[] | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_tourist_destination?: boolean | null
          latitude?: number | null
          longitude?: number | null
          municipality_type?: string | null
          name?: string
          population?: number | null
          province_id?: string | null
          short_description?: string | null
          slug?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "municipalities_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "provinces"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      passport_stamps: {
        Row: {
          beach_id: string | null
          coins_earned: number | null
          created_at: string
          destination_id: string | null
          experience_id: string | null
          hotel_id: string | null
          id: string
          is_verified: boolean | null
          notes: string | null
          photos: string[] | null
          rating: number | null
          restaurant_id: string | null
          stamp_image: string | null
          stamp_location: string | null
          stamp_name: string
          stamp_type: string
          user_id: string
          verification_data: Json | null
          verification_method: string | null
          visited_at: string
          xp_earned: number | null
        }
        Insert: {
          beach_id?: string | null
          coins_earned?: number | null
          created_at?: string
          destination_id?: string | null
          experience_id?: string | null
          hotel_id?: string | null
          id?: string
          is_verified?: boolean | null
          notes?: string | null
          photos?: string[] | null
          rating?: number | null
          restaurant_id?: string | null
          stamp_image?: string | null
          stamp_location?: string | null
          stamp_name: string
          stamp_type: string
          user_id: string
          verification_data?: Json | null
          verification_method?: string | null
          visited_at?: string
          xp_earned?: number | null
        }
        Update: {
          beach_id?: string | null
          coins_earned?: number | null
          created_at?: string
          destination_id?: string | null
          experience_id?: string | null
          hotel_id?: string | null
          id?: string
          is_verified?: boolean | null
          notes?: string | null
          photos?: string[] | null
          rating?: number | null
          restaurant_id?: string | null
          stamp_image?: string | null
          stamp_location?: string | null
          stamp_name?: string
          stamp_type?: string
          user_id?: string
          verification_data?: Json | null
          verification_method?: string | null
          visited_at?: string
          xp_earned?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "passport_stamps_beach_id_fkey"
            columns: ["beach_id"]
            isOneToOne: false
            referencedRelation: "beaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "passport_stamps_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "passport_stamps_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "experiences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "passport_stamps_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "passport_stamps_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      ports_marinas: {
        Row: {
          address: string | null
          capacity: number | null
          created_at: string
          cruise_lines: string[] | null
          description: string | null
          destination_id: string | null
          email: string | null
          facilities: string[] | null
          gallery: string[] | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_featured: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          phone: string | null
          port_type: string | null
          rating: number | null
          review_count: number | null
          services: string[] | null
          short_description: string | null
          slug: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          capacity?: number | null
          created_at?: string
          cruise_lines?: string[] | null
          description?: string | null
          destination_id?: string | null
          email?: string | null
          facilities?: string[] | null
          gallery?: string[] | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          phone?: string | null
          port_type?: string | null
          rating?: number | null
          review_count?: number | null
          services?: string[] | null
          short_description?: string | null
          slug?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          capacity?: number | null
          created_at?: string
          cruise_lines?: string[] | null
          description?: string | null
          destination_id?: string | null
          email?: string | null
          facilities?: string[] | null
          gallery?: string[] | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          phone?: string | null
          port_type?: string | null
          rating?: number | null
          review_count?: number | null
          services?: string[] | null
          short_description?: string | null
          slug?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ports_marinas_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          preferred_language: string | null
          travel_interests: string[] | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          preferred_language?: string | null
          travel_interests?: string[] | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          preferred_language?: string | null
          travel_interests?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      provinces: {
        Row: {
          area_km2: number | null
          capital: string | null
          created_at: string
          description: string | null
          highlights: string[] | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          population: number | null
          region: string | null
          slug: string | null
          updated_at: string
        }
        Insert: {
          area_km2?: number | null
          capital?: string | null
          created_at?: string
          description?: string | null
          highlights?: string[] | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          population?: number | null
          region?: string | null
          slug?: string | null
          updated_at?: string
        }
        Update: {
          area_km2?: number | null
          capital?: string | null
          created_at?: string
          description?: string | null
          highlights?: string[] | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          population?: number | null
          region?: string | null
          slug?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      referral_codes: {
        Row: {
          code: string
          created_at: string
          id: string
          is_active: boolean | null
          total_earnings_coins: number | null
          total_referrals: number | null
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          total_earnings_coins?: number | null
          total_referrals?: number | null
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          total_earnings_coins?: number | null
          total_referrals?: number | null
          user_id?: string
        }
        Relationships: []
      }
      referral_uses: {
        Row: {
          coins_awarded: number | null
          created_at: string
          id: string
          referral_code_id: string
          referred_user_id: string
          xp_awarded: number | null
        }
        Insert: {
          coins_awarded?: number | null
          created_at?: string
          id?: string
          referral_code_id: string
          referred_user_id: string
          xp_awarded?: number | null
        }
        Update: {
          coins_awarded?: number | null
          created_at?: string
          id?: string
          referral_code_id?: string
          referred_user_id?: string
          xp_awarded?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "referral_uses_referral_code_id_fkey"
            columns: ["referral_code_id"]
            isOneToOne: false
            referencedRelation: "referral_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      reservations: {
        Row: {
          check_in: string | null
          check_out: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          currency: string | null
          guests: number | null
          id: string
          item_id: string
          item_image: string | null
          item_name: string
          item_type: string
          notes: string | null
          status: string | null
          total_price: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          check_in?: string | null
          check_out?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          currency?: string | null
          guests?: number | null
          id?: string
          item_id: string
          item_image?: string | null
          item_name: string
          item_type: string
          notes?: string | null
          status?: string | null
          total_price?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          check_in?: string | null
          check_out?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          currency?: string | null
          guests?: number | null
          id?: string
          item_id?: string
          item_image?: string | null
          item_name?: string
          item_type?: string
          notes?: string | null
          status?: string | null
          total_price?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      restaurants: {
        Row: {
          address: string | null
          category: string | null
          created_at: string
          cuisine_type: string | null
          description: string | null
          destination_id: string | null
          email: string | null
          gallery: string[] | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_featured: boolean | null
          is_sponsored: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          opening_hours: string | null
          phone: string | null
          price_range: string | null
          rating: number | null
          review_count: number | null
          services: string[] | null
          short_description: string | null
          signature_dishes: string[] | null
          slug: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          category?: string | null
          created_at?: string
          cuisine_type?: string | null
          description?: string | null
          destination_id?: string | null
          email?: string | null
          gallery?: string[] | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_sponsored?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          opening_hours?: string | null
          phone?: string | null
          price_range?: string | null
          rating?: number | null
          review_count?: number | null
          services?: string[] | null
          short_description?: string | null
          signature_dishes?: string[] | null
          slug?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          category?: string | null
          created_at?: string
          cuisine_type?: string | null
          description?: string | null
          destination_id?: string | null
          email?: string | null
          gallery?: string[] | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_sponsored?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          opening_hours?: string | null
          phone?: string | null
          price_range?: string | null
          rating?: number | null
          review_count?: number | null
          services?: string[] | null
          short_description?: string | null
          signature_dishes?: string[] | null
          slug?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurants_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          author_name: string
          category: string
          content: string
          created_at: string
          helpful_count: number | null
          id: string
          images: string[] | null
          location: string
          rating: number
          title: string
          traveler_type: string
          updated_at: string
          user_id: string
          verified: boolean | null
        }
        Insert: {
          author_name: string
          category: string
          content: string
          created_at?: string
          helpful_count?: number | null
          id?: string
          images?: string[] | null
          location: string
          rating: number
          title: string
          traveler_type: string
          updated_at?: string
          user_id: string
          verified?: boolean | null
        }
        Update: {
          author_name?: string
          category?: string
          content?: string
          created_at?: string
          helpful_count?: number | null
          id?: string
          images?: string[] | null
          location?: string
          rating?: number
          title?: string
          traveler_type?: string
          updated_at?: string
          user_id?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      rivers: {
        Row: {
          activities: string[] | null
          address: string | null
          adrenaline_level: number | null
          best_season: string | null
          certified_guides: boolean | null
          created_at: string
          description: string | null
          destination_id: string | null
          difficulty: string | null
          duration: string | null
          gallery: string[] | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_featured: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          price_range: string | null
          rating: number | null
          review_count: number | null
          safety_tips: string[] | null
          short_description: string | null
          slug: string | null
          updated_at: string
        }
        Insert: {
          activities?: string[] | null
          address?: string | null
          adrenaline_level?: number | null
          best_season?: string | null
          certified_guides?: boolean | null
          created_at?: string
          description?: string | null
          destination_id?: string | null
          difficulty?: string | null
          duration?: string | null
          gallery?: string[] | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          price_range?: string | null
          rating?: number | null
          review_count?: number | null
          safety_tips?: string[] | null
          short_description?: string | null
          slug?: string | null
          updated_at?: string
        }
        Update: {
          activities?: string[] | null
          address?: string | null
          adrenaline_level?: number | null
          best_season?: string | null
          certified_guides?: boolean | null
          created_at?: string
          description?: string | null
          destination_id?: string | null
          difficulty?: string | null
          duration?: string | null
          gallery?: string[] | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          price_range?: string | null
          rating?: number | null
          review_count?: number | null
          safety_tips?: string[] | null
          short_description?: string | null
          slug?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rivers_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      route_checkpoints: {
        Row: {
          beach_id: string | null
          challenge_task: string | null
          checkpoint_description: string | null
          checkpoint_name: string
          checkpoint_order: number
          checkpoint_type: string
          coin_reward: number | null
          created_at: string
          destination_id: string | null
          experience_id: string | null
          hotel_id: string | null
          id: string
          is_mandatory: boolean | null
          latitude: number | null
          longitude: number | null
          photo_required: boolean | null
          restaurant_id: string | null
          route_id: string
          xp_reward: number | null
        }
        Insert: {
          beach_id?: string | null
          challenge_task?: string | null
          checkpoint_description?: string | null
          checkpoint_name: string
          checkpoint_order: number
          checkpoint_type: string
          coin_reward?: number | null
          created_at?: string
          destination_id?: string | null
          experience_id?: string | null
          hotel_id?: string | null
          id?: string
          is_mandatory?: boolean | null
          latitude?: number | null
          longitude?: number | null
          photo_required?: boolean | null
          restaurant_id?: string | null
          route_id: string
          xp_reward?: number | null
        }
        Update: {
          beach_id?: string | null
          challenge_task?: string | null
          checkpoint_description?: string | null
          checkpoint_name?: string
          checkpoint_order?: number
          checkpoint_type?: string
          coin_reward?: number | null
          created_at?: string
          destination_id?: string | null
          experience_id?: string | null
          hotel_id?: string | null
          id?: string
          is_mandatory?: boolean | null
          latitude?: number | null
          longitude?: number | null
          photo_required?: boolean | null
          restaurant_id?: string | null
          route_id?: string
          xp_reward?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "route_checkpoints_beach_id_fkey"
            columns: ["beach_id"]
            isOneToOne: false
            referencedRelation: "beaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_checkpoints_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_checkpoints_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "experiences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_checkpoints_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_checkpoints_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_checkpoints_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "gamified_routes"
            referencedColumns: ["id"]
          },
        ]
      }
      season_rewards: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_exclusive: boolean | null
          name: string
          quantity_available: number | null
          quantity_claimed: number | null
          reward_type: string
          reward_value: Json | null
          season_id: string
          unlock_requirement: string | null
          unlock_requirement_value: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_exclusive?: boolean | null
          name: string
          quantity_available?: number | null
          quantity_claimed?: number | null
          reward_type?: string
          reward_value?: Json | null
          season_id: string
          unlock_requirement?: string | null
          unlock_requirement_value?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_exclusive?: boolean | null
          name?: string
          quantity_available?: number | null
          quantity_claimed?: number | null
          reward_type?: string
          reward_value?: Json | null
          season_id?: string
          unlock_requirement?: string | null
          unlock_requirement_value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "season_rewards_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "gamification_seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      social_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "social_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      social_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "social_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      social_posts: {
        Row: {
          comments_count: number
          content: string | null
          created_at: string
          destination_id: string | null
          gallery: string[] | null
          id: string
          image_url: string | null
          is_active: boolean | null
          likes_count: number
          location: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          comments_count?: number
          content?: string | null
          created_at?: string
          destination_id?: string | null
          gallery?: string[] | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          likes_count?: number
          location?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          comments_count?: number
          content?: string | null
          created_at?: string
          destination_id?: string | null
          gallery?: string[] | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          likes_count?: number
          location?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_posts_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      spas_wellness: {
        Row: {
          address: string | null
          amenities: string[] | null
          created_at: string
          description: string | null
          destination_id: string | null
          email: string | null
          gallery: string[] | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_featured: boolean | null
          is_sponsored: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          opening_hours: string | null
          phone: string | null
          price_range: string | null
          rating: number | null
          review_count: number | null
          services: string[] | null
          short_description: string | null
          slug: string | null
          spa_type: string | null
          treatments: string[] | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          amenities?: string[] | null
          created_at?: string
          description?: string | null
          destination_id?: string | null
          email?: string | null
          gallery?: string[] | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_sponsored?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          opening_hours?: string | null
          phone?: string | null
          price_range?: string | null
          rating?: number | null
          review_count?: number | null
          services?: string[] | null
          short_description?: string | null
          slug?: string | null
          spa_type?: string | null
          treatments?: string[] | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          amenities?: string[] | null
          created_at?: string
          description?: string | null
          destination_id?: string | null
          email?: string | null
          gallery?: string[] | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_sponsored?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          opening_hours?: string | null
          phone?: string | null
          price_range?: string | null
          rating?: number | null
          review_count?: number | null
          services?: string[] | null
          short_description?: string | null
          slug?: string | null
          spa_type?: string | null
          treatments?: string[] | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "spas_wellness_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      stadiums: {
        Row: {
          address: string | null
          capacity: number | null
          created_at: string
          description: string | null
          destination_id: string | null
          email: string | null
          facilities: string[] | null
          gallery: string[] | null
          home_teams: string[] | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_featured: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          phone: string | null
          rating: number | null
          review_count: number | null
          services: string[] | null
          short_description: string | null
          slug: string | null
          sport_types: string[] | null
          stadium_type: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          capacity?: number | null
          created_at?: string
          description?: string | null
          destination_id?: string | null
          email?: string | null
          facilities?: string[] | null
          gallery?: string[] | null
          home_teams?: string[] | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          phone?: string | null
          rating?: number | null
          review_count?: number | null
          services?: string[] | null
          short_description?: string | null
          slug?: string | null
          sport_types?: string[] | null
          stadium_type?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          capacity?: number | null
          created_at?: string
          description?: string | null
          destination_id?: string | null
          email?: string | null
          facilities?: string[] | null
          gallery?: string[] | null
          home_teams?: string[] | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          phone?: string | null
          rating?: number | null
          review_count?: number | null
          services?: string[] | null
          short_description?: string | null
          slug?: string | null
          sport_types?: string[] | null
          stadium_type?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stadiums_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_responses: {
        Row: {
          created_at: string
          email: string
          id: string
          respuestas: Json
          survey_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          respuestas?: Json
          survey_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          respuestas?: Json
          survey_id?: string
        }
        Relationships: []
      }
      theme_parks: {
        Row: {
          address: string | null
          age_restrictions: string | null
          attractions: string[] | null
          created_at: string
          description: string | null
          destination_id: string | null
          duration_recommended: string | null
          email: string | null
          gallery: string[] | null
          id: string
          image_url: string | null
          includes: string[] | null
          is_active: boolean | null
          is_featured: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          opening_hours: string | null
          park_type: string | null
          phone: string | null
          price_adult: number | null
          price_child: number | null
          price_range: string | null
          rating: number | null
          review_count: number | null
          services: string[] | null
          short_description: string | null
          slug: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          age_restrictions?: string | null
          attractions?: string[] | null
          created_at?: string
          description?: string | null
          destination_id?: string | null
          duration_recommended?: string | null
          email?: string | null
          gallery?: string[] | null
          id?: string
          image_url?: string | null
          includes?: string[] | null
          is_active?: boolean | null
          is_featured?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          opening_hours?: string | null
          park_type?: string | null
          phone?: string | null
          price_adult?: number | null
          price_child?: number | null
          price_range?: string | null
          rating?: number | null
          review_count?: number | null
          services?: string[] | null
          short_description?: string | null
          slug?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          age_restrictions?: string | null
          attractions?: string[] | null
          created_at?: string
          description?: string | null
          destination_id?: string | null
          duration_recommended?: string | null
          email?: string | null
          gallery?: string[] | null
          id?: string
          image_url?: string | null
          includes?: string[] | null
          is_active?: boolean | null
          is_featured?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          opening_hours?: string | null
          park_type?: string | null
          phone?: string | null
          price_adult?: number | null
          price_child?: number | null
          price_range?: string | null
          rating?: number | null
          review_count?: number | null
          services?: string[] | null
          short_description?: string | null
          slug?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "theme_parks_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      tour_guides: {
        Row: {
          certifications: string[] | null
          created_at: string
          description: string | null
          destination_id: string | null
          email: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_certified: boolean | null
          languages: string[] | null
          name: string
          phone: string | null
          price_range: string | null
          rating: number | null
          review_count: number | null
          slug: string | null
          specialties: string[] | null
          updated_at: string
          website: string | null
          years_experience: number | null
        }
        Insert: {
          certifications?: string[] | null
          created_at?: string
          description?: string | null
          destination_id?: string | null
          email?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_certified?: boolean | null
          languages?: string[] | null
          name: string
          phone?: string | null
          price_range?: string | null
          rating?: number | null
          review_count?: number | null
          slug?: string | null
          specialties?: string[] | null
          updated_at?: string
          website?: string | null
          years_experience?: number | null
        }
        Update: {
          certifications?: string[] | null
          created_at?: string
          description?: string | null
          destination_id?: string | null
          email?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_certified?: boolean | null
          languages?: string[] | null
          name?: string
          phone?: string | null
          price_range?: string | null
          rating?: number | null
          review_count?: number | null
          slug?: string | null
          specialties?: string[] | null
          updated_at?: string
          website?: string | null
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tour_guides_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      tour_operators: {
        Row: {
          address: string | null
          certifications: string[] | null
          created_at: string
          description: string | null
          destination_id: string | null
          email: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_featured: boolean | null
          languages: string[] | null
          logo_url: string | null
          name: string
          operator_type: string | null
          phone: string | null
          rating: number | null
          review_count: number | null
          services: string[] | null
          short_description: string | null
          slug: string | null
          tour_types: string[] | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          certifications?: string[] | null
          created_at?: string
          description?: string | null
          destination_id?: string | null
          email?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          languages?: string[] | null
          logo_url?: string | null
          name: string
          operator_type?: string | null
          phone?: string | null
          rating?: number | null
          review_count?: number | null
          services?: string[] | null
          short_description?: string | null
          slug?: string | null
          tour_types?: string[] | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          certifications?: string[] | null
          created_at?: string
          description?: string | null
          destination_id?: string | null
          email?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          languages?: string[] | null
          logo_url?: string | null
          name?: string
          operator_type?: string | null
          phone?: string | null
          rating?: number | null
          review_count?: number | null
          services?: string[] | null
          short_description?: string | null
          slug?: string | null
          tour_types?: string[] | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tour_operators_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      tour_packages: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          destination_id: string | null
          destinations: string[] | null
          difficulty: string | null
          duration: string | null
          gallery: string[] | null
          highlights: string[] | null
          id: string
          image_url: string | null
          included: string[] | null
          is_active: boolean | null
          is_featured: boolean | null
          is_sponsored: boolean | null
          itinerary: Json | null
          languages: string[] | null
          max_group_size: number | null
          meeting_point: string | null
          min_age: number | null
          name: string
          not_included: string[] | null
          price_currency: string | null
          price_from: number | null
          rating: number | null
          review_count: number | null
          short_description: string | null
          slug: string | null
          start_times: string[] | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          destination_id?: string | null
          destinations?: string[] | null
          difficulty?: string | null
          duration?: string | null
          gallery?: string[] | null
          highlights?: string[] | null
          id?: string
          image_url?: string | null
          included?: string[] | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_sponsored?: boolean | null
          itinerary?: Json | null
          languages?: string[] | null
          max_group_size?: number | null
          meeting_point?: string | null
          min_age?: number | null
          name: string
          not_included?: string[] | null
          price_currency?: string | null
          price_from?: number | null
          rating?: number | null
          review_count?: number | null
          short_description?: string | null
          slug?: string | null
          start_times?: string[] | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          destination_id?: string | null
          destinations?: string[] | null
          difficulty?: string | null
          duration?: string | null
          gallery?: string[] | null
          highlights?: string[] | null
          id?: string
          image_url?: string | null
          included?: string[] | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_sponsored?: boolean | null
          itinerary?: Json | null
          languages?: string[] | null
          max_group_size?: number | null
          meeting_point?: string | null
          min_age?: number | null
          name?: string
          not_included?: string[] | null
          price_currency?: string | null
          price_from?: number | null
          rating?: number | null
          review_count?: number | null
          short_description?: string | null
          slug?: string | null
          start_times?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tour_packages_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      travel_agencies: {
        Row: {
          address: string | null
          agency_type: string | null
          certifications: string[] | null
          created_at: string
          description: string | null
          destination_id: string | null
          email: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_featured: boolean | null
          languages: string[] | null
          logo_url: string | null
          name: string
          phone: string | null
          rating: number | null
          review_count: number | null
          services: string[] | null
          short_description: string | null
          slug: string | null
          specialties: string[] | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          agency_type?: string | null
          certifications?: string[] | null
          created_at?: string
          description?: string | null
          destination_id?: string | null
          email?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          languages?: string[] | null
          logo_url?: string | null
          name: string
          phone?: string | null
          rating?: number | null
          review_count?: number | null
          services?: string[] | null
          short_description?: string | null
          slug?: string | null
          specialties?: string[] | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          agency_type?: string | null
          certifications?: string[] | null
          created_at?: string
          description?: string | null
          destination_id?: string | null
          email?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          languages?: string[] | null
          logo_url?: string | null
          name?: string
          phone?: string | null
          rating?: number | null
          review_count?: number | null
          services?: string[] | null
          short_description?: string | null
          slug?: string | null
          specialties?: string[] | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "travel_agencies_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      trivia_questions: {
        Row: {
          category: string
          correct_index: number
          created_at: string
          difficulty: string
          explanation: string | null
          id: string
          image_url: string | null
          is_active: boolean
          options: string[]
          question: string
          times_answered: number
          times_correct: number
          updated_at: string
          xp_reward: number
        }
        Insert: {
          category?: string
          correct_index: number
          created_at?: string
          difficulty?: string
          explanation?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          options: string[]
          question: string
          times_answered?: number
          times_correct?: number
          updated_at?: string
          xp_reward?: number
        }
        Update: {
          category?: string
          correct_index?: number
          created_at?: string
          difficulty?: string
          explanation?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          options?: string[]
          question?: string
          times_answered?: number
          times_correct?: number
          updated_at?: string
          xp_reward?: number
        }
        Relationships: []
      }
      trivia_sessions: {
        Row: {
          coins_earned: number
          completed_at: string
          correct_answers: number
          created_at: string
          duration_seconds: number | null
          id: string
          max_streak: number
          score: number
          total_questions: number
          user_id: string
          xp_earned: number
        }
        Insert: {
          coins_earned?: number
          completed_at?: string
          correct_answers?: number
          created_at?: string
          duration_seconds?: number | null
          id?: string
          max_streak?: number
          score?: number
          total_questions?: number
          user_id: string
          xp_earned?: number
        }
        Update: {
          coins_earned?: number
          completed_at?: string
          correct_answers?: number
          created_at?: string
          duration_seconds?: number | null
          id?: string
          max_streak?: number
          score?: number
          total_questions?: number
          user_id?: string
          xp_earned?: number
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          created_at: string
          display_order: number | null
          id: string
          is_favorite: boolean | null
          progress: number | null
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          created_at?: string
          display_order?: number | null
          id?: string
          is_favorite?: boolean | null
          progress?: number | null
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          created_at?: string
          display_order?: number | null
          id?: string
          is_favorite?: boolean | null
          progress?: number | null
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_checkpoint_completions: {
        Row: {
          checkpoint_id: string
          coins_earned: number | null
          completed_at: string | null
          created_at: string
          id: string
          notes: string | null
          photo_url: string | null
          route_id: string
          user_id: string
          verification_data: Json | null
          xp_earned: number | null
        }
        Insert: {
          checkpoint_id: string
          coins_earned?: number | null
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          photo_url?: string | null
          route_id: string
          user_id: string
          verification_data?: Json | null
          xp_earned?: number | null
        }
        Update: {
          checkpoint_id?: string
          coins_earned?: number | null
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          photo_url?: string | null
          route_id?: string
          user_id?: string
          verification_data?: Json | null
          xp_earned?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_checkpoint_completions_checkpoint_id_fkey"
            columns: ["checkpoint_id"]
            isOneToOne: false
            referencedRelation: "route_checkpoints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_checkpoint_completions_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "gamified_routes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_collectibles: {
        Row: {
          acquired_at: string | null
          acquisition_method: string | null
          collectible_id: string
          created_at: string
          display_order: number | null
          id: string
          is_favorite: boolean | null
          user_id: string
        }
        Insert: {
          acquired_at?: string | null
          acquisition_method?: string | null
          collectible_id: string
          created_at?: string
          display_order?: number | null
          id?: string
          is_favorite?: boolean | null
          user_id: string
        }
        Update: {
          acquired_at?: string | null
          acquisition_method?: string | null
          collectible_id?: string
          created_at?: string
          display_order?: number | null
          id?: string
          is_favorite?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_collectibles_collectible_id_fkey"
            columns: ["collectible_id"]
            isOneToOne: false
            referencedRelation: "digital_collectibles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_gamification: {
        Row: {
          coins: number
          created_at: string
          current_level: number
          id: string
          last_activity_date: string | null
          streak_days: number
          total_missions_completed: number
          total_purchases: number
          total_referrals: number
          total_xp: number
          updated_at: string
          user_id: string
        }
        Insert: {
          coins?: number
          created_at?: string
          current_level?: number
          id?: string
          last_activity_date?: string | null
          streak_days?: number
          total_missions_completed?: number
          total_purchases?: number
          total_referrals?: number
          total_xp?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          coins?: number
          created_at?: string
          current_level?: number
          id?: string
          last_activity_date?: string | null
          streak_days?: number
          total_missions_completed?: number
          total_purchases?: number
          total_referrals?: number
          total_xp?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_missions: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          is_completed: boolean
          mission_id: string
          progress: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean
          mission_id: string
          progress?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean
          mission_id?: string
          progress?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_missions_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "gamification_missions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_prize_redemptions: {
        Row: {
          coins_spent: number
          created_at: string
          id: string
          prize_id: string
          redeemed_at: string | null
          redemption_code: string | null
          status: string
          user_id: string
        }
        Insert: {
          coins_spent: number
          created_at?: string
          id?: string
          prize_id: string
          redeemed_at?: string | null
          redemption_code?: string | null
          status?: string
          user_id: string
        }
        Update: {
          coins_spent?: number
          created_at?: string
          id?: string
          prize_id?: string
          redeemed_at?: string | null
          redemption_code?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_prize_redemptions_prize_id_fkey"
            columns: ["prize_id"]
            isOneToOne: false
            referencedRelation: "gamification_prizes"
            referencedColumns: ["id"]
          },
        ]
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
          role: Database["public"]["Enums"]["app_role"]
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
      user_route_progress: {
        Row: {
          checkpoints_completed: number | null
          completed_at: string | null
          completion_percentage: number | null
          created_at: string
          current_checkpoint: number | null
          id: string
          is_completed: boolean | null
          route_id: string
          started_at: string | null
          total_checkpoints: number | null
          total_coins_earned: number | null
          total_xp_earned: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          checkpoints_completed?: number | null
          completed_at?: string | null
          completion_percentage?: number | null
          created_at?: string
          current_checkpoint?: number | null
          id?: string
          is_completed?: boolean | null
          route_id: string
          started_at?: string | null
          total_checkpoints?: number | null
          total_coins_earned?: number | null
          total_xp_earned?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          checkpoints_completed?: number | null
          completed_at?: string | null
          completion_percentage?: number | null
          created_at?: string
          current_checkpoint?: number | null
          id?: string
          is_completed?: boolean | null
          route_id?: string
          started_at?: string | null
          total_checkpoints?: number | null
          total_coins_earned?: number | null
          total_xp_earned?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_route_progress_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "gamified_routes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_season_progress: {
        Row: {
          coins_earned: number | null
          created_at: string
          id: string
          last_activity_at: string | null
          missions_completed: number | null
          rank: number | null
          rewards_claimed: number | null
          season_id: string
          started_at: string
          updated_at: string
          user_id: string
          xp_earned: number | null
        }
        Insert: {
          coins_earned?: number | null
          created_at?: string
          id?: string
          last_activity_at?: string | null
          missions_completed?: number | null
          rank?: number | null
          rewards_claimed?: number | null
          season_id: string
          started_at?: string
          updated_at?: string
          user_id: string
          xp_earned?: number | null
        }
        Update: {
          coins_earned?: number | null
          created_at?: string
          id?: string
          last_activity_at?: string | null
          missions_completed?: number | null
          rank?: number | null
          rewards_claimed?: number | null
          season_id?: string
          started_at?: string
          updated_at?: string
          user_id?: string
          xp_earned?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_season_progress_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "gamification_seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      vacation_registrations: {
        Row: {
          acompanantes: string | null
          aeropuerto: string | null
          alojamiento: string | null
          como_supo: string | null
          created_at: string
          destino: string | null
          email: string
          fecha_llegada: string | null
          fecha_salida: string | null
          id: string
          intereses: string[] | null
          nombre: string
          nombre_alojamiento: string | null
          pais: string | null
          primera_vez: string | null
          telefono: string | null
          tipo_viajero: string | null
        }
        Insert: {
          acompanantes?: string | null
          aeropuerto?: string | null
          alojamiento?: string | null
          como_supo?: string | null
          created_at?: string
          destino?: string | null
          email: string
          fecha_llegada?: string | null
          fecha_salida?: string | null
          id?: string
          intereses?: string[] | null
          nombre: string
          nombre_alojamiento?: string | null
          pais?: string | null
          primera_vez?: string | null
          telefono?: string | null
          tipo_viajero?: string | null
        }
        Update: {
          acompanantes?: string | null
          aeropuerto?: string | null
          alojamiento?: string | null
          como_supo?: string | null
          created_at?: string
          destino?: string | null
          email?: string
          fecha_llegada?: string | null
          fecha_salida?: string | null
          id?: string
          intereses?: string[] | null
          nombre?: string
          nombre_alojamiento?: string | null
          pais?: string | null
          primera_vez?: string | null
          telefono?: string | null
          tipo_viajero?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
