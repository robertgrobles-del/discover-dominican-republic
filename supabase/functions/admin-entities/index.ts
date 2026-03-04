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
  'beaches', 'spas_wellness'
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
          query = query.ilike('name', `%${filters.search}%`);
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

        const { data: updated, error } = await supabase
          .from(entity)
          .update(data)
          .eq('id', id)
          .select()
          .single();
        
        if (error) throw error;
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

        const { error } = await supabase
          .from(entity)
          .delete()
          .eq('id', id);
        
        if (error) throw error;
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
