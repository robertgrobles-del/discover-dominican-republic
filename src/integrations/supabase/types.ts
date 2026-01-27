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
      provinces: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          region: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          region?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          region?: string | null
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
