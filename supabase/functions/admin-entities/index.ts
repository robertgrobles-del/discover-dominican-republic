import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Lista de entidades válidas
const VALID_ENTITIES = [
  'hotels', 'restaurants', 'bars', 'experiences', 'events', 
  'coffee_experiences', 'caves', 'rivers', 'theme_parks', 
  'clinics', 'stadiums', 'ports_marinas', 'artisanal_workshops',
  'tour_guides', 'travel_agencies', 'tour_operators',
  'destinations', 'provinces', 'municipalities', 'airbnb_listings',
  'beaches', 'spas_wellness', 'ad_banners',
  'historical_figures', 'historical_events', 'tour_packages', 'job_vacancies',
  'establishment_registrations', 'site_settings', 'newsletter_subscribers',
  'marketing_leads', 'offers', 'ambassadors', 'ambassador_referrals',
  'achievements', 'gamification_levels', 'profiles', 'partner_profiles',
  'routes', 'route_stops', 'audio_guides', 'ugc_reports', 'event_tickets',
  'reward_inventory', 'reward_shipments', 'survey_templates', 'survey_responses',
  'admin_activity_logs', 'seo_redirections', 'system_webhooks',
  'ugc_media', 'user_suspensions', 'support_tickets', 'support_messages',
  'marketing_campaigns', 'points_transactions', 'marketplace_orders',
  'marketplace_order_items', 'vendor_payments', 'discount_coupons',
  'weather_alerts', 'emergency_contacts', 'system_cron_jobs', 'ip_rules',
  'entity_translations', 'lotteries', 'lottery_draws', 'lottery_results',
  'exchange_rates', 'fuel_prices', 'reservations',
  'protected_areas', 'bird_species', 'hot_springs', 'offset_projects', 'toll_routes', 'marine_reports'
] as const;

type EntityType = typeof VALID_ENTITIES[number];

interface RequestBody {
  entity: EntityType;
  action: 'list' | 'get' | 'create' | 'update' | 'delete';
  id?: string;
  data?: Record<string, unknown>;
  filters?: {
    destination_id?: string;
    is_active?: boolean;
    is_featured?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Crear cliente con service role para bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verificar autenticación
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Obtener usuario del token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar rol de admin
    const { data: hasRole, error: roleError } = await supabase.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    });

    if (roleError || !hasRole) {
      return new Response(
        JSON.stringify({ error: 'Access denied. Admin role required.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parsear body
    const body: RequestBody = await req.json();
    const { entity, action, id, data, filters } = body;

    // Validar entidad
    if (!VALID_ENTITIES.includes(entity)) {
      return new Response(
        JSON.stringify({ error: `Invalid entity: ${entity}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let result;

    const logActivity = async (actionType: string, entityName: string, entityId: string, oldData: any, newData: any) => {
      try {
        const ipAddress = req.headers.get('x-real-ip') || req.headers.get('cf-connecting-ip') || '';
        const userAgent = req.headers.get('user-agent') || '';
        await supabase.from('admin_activity_logs').insert([{
          admin_id: user.id,
          action_type: actionType,
          entity_name: entityName,
          entity_id: entityId,
          ip_address: ipAddress,
          user_agent: userAgent,
          old_data: oldData,
          new_data: newData
        }]);
      } catch (err) {
        console.error('Failed to log admin activity:', err);
      }
    };

    switch (action) {
      case 'list': {
        let query = supabase.from(entity).select('*', { count: 'exact' });
        
        // Aplicar filtros
        if (filters?.destination_id) {
          query = query.eq('destination_id', filters.destination_id);
        }
        if (filters?.is_active !== undefined) {
          query = query.eq('is_active', filters.is_active);
        }
        if (filters?.is_featured !== undefined) {
          query = query.eq('is_featured', filters.is_featured);
        }
        if (filters?.search) {
          let searchField = 'name';
          if (
            entity === 'job_vacancies' || 
            entity === 'offers' || 
            entity === 'routes' || 
            entity === 'audio_guides' || 
            entity === 'reward_inventory' || 
            entity === 'survey_templates' ||
            entity === 'marketing_campaigns' ||
            entity === 'weather_alerts' ||
            entity === 'offset_projects'
          ) {
            searchField = 'title';
          } else if (entity === 'establishment_registrations' || entity === 'marketing_leads') {
            searchField = 'nombre';
          } else if (entity === 'reward_shipments') {
            searchField = 'recipient_name';
          } else if (entity === 'route_stops') {
            searchField = 'place_name';
          } else if (entity === 'marine_reports') {
            searchField = 'location';
          } else if (entity === 'ugc_reports' || entity === 'user_suspensions' || entity === 'points_transactions') {
            searchField = 'reason';
          } else if (entity === 'event_tickets') {
            searchField = 'ticket_code';
          } else if (entity === 'site_settings') {
            searchField = 'key';
          } else if (entity === 'newsletter_subscribers') {
            searchField = 'email';
          } else if (entity === 'ambassadors') {
            searchField = 'referral_code';
          } else if (entity === 'ambassador_referrals') {
            searchField = 'referred_email';
          } else if (entity === 'profiles') {
            searchField = 'display_name';
          } else if (entity === 'partner_profiles') {
            searchField = 'business_name';
          } else if (entity === 'admin_activity_logs') {
            searchField = 'entity_name';
          } else if (entity === 'seo_redirections') {
            searchField = 'source_path';
          } else if (entity === 'system_webhooks' || entity === 'ugc_media') {
            searchField = 'url';
          } else if (entity === 'support_tickets') {
            searchField = 'subject';
          } else if (entity === 'support_messages') {
            searchField = 'message';
          } else if (entity === 'discount_coupons') {
            searchField = 'code';
          } else if (entity === 'emergency_contacts') {
            searchField = 'institution';
          } else if (entity === 'system_cron_jobs') {
            searchField = 'job_name';
          } else if (entity === 'ip_rules') {
            searchField = 'ip_address';
          } else if (entity === 'marketplace_orders') {
            searchField = 'payment_method';
          } else if (entity === 'marketplace_order_items') {
            searchField = 'item_type';
          } else if (entity === 'vendor_payments') {
            searchField = 'payout_reference';
          }
          query = query.ilike(searchField, `%${filters.search}%`);
        }
        
        // Paginación
        const limit = filters?.limit || 50;
        const offset = filters?.offset || 0;
        query = query.range(offset, offset + limit - 1);
        
        // Ordenar por fecha de creación
        query = query.order('created_at', { ascending: false });
        
        const { data: items, count, error } = await query;
        
        if (error) throw error;
        result = { data: items, total: count };
        break;
      }

      case 'get': {
        if (!id) {
          return new Response(
            JSON.stringify({ error: 'ID is required for get action' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        const { data: item, error } = await supabase
          .from(entity)
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        result = { data: item };
        break;
      }

      case 'create': {
        if (!data) {
          return new Response(
            JSON.stringify({ error: 'Data is required for create action' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Generar slug si no existe
        if (!data.slug && data.name) {
          data.slug = String(data.name)
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
        }

        const { data: created, error } = await supabase
          .from(entity)
          .insert([data])
          .select()
          .single();
        
        if (error) throw error;

        if (entity !== 'admin_activity_logs') {
          await logActivity('create', entity, created.id, null, data);
        }

        result = { data: created, message: 'Created successfully' };
        break;
      }

      case 'update': {
        if (!id) {
          return new Response(
            JSON.stringify({ error: 'ID is required for update action' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        if (!data) {
          return new Response(
            JSON.stringify({ error: 'Data is required for update action' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Actualizar slug si cambió el nombre
        if (data.name && !data.slug) {
          data.slug = String(data.name)
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
        }

        let oldRecord = null;
        if (entity !== 'admin_activity_logs') {
          const { data: oldData } = await supabase
            .from(entity)
            .select('*')
            .eq('id', id)
            .maybeSingle();
          oldRecord = oldData;
        }

        const { data: updated, error } = await supabase
          .from(entity)
          .update(data)
          .eq('id', id)
          .select()
          .single();
        
        if (error) throw error;

        if (entity !== 'admin_activity_logs') {
          await logActivity('update', entity, id, oldRecord, data);
        }

        result = { data: updated, message: 'Updated successfully' };
        break;
      }

      case 'delete': {
        if (!id) {
          return new Response(
            JSON.stringify({ error: 'ID is required for delete action' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        let oldRecord = null;
        if (entity !== 'admin_activity_logs') {
          const { data: oldData } = await supabase
            .from(entity)
            .select('*')
            .eq('id', id)
            .maybeSingle();
          oldRecord = oldData;
        }

        const { error } = await supabase
          .from(entity)
          .delete()
          .eq('id', id);
        
        if (error) throw error;

        if (entity !== 'admin_activity_logs') {
          await logActivity('delete', entity, id, oldRecord, null);
        }

        result = { message: 'Deleted successfully' };
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: `Invalid action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
