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
