import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { IS_MOCK_DATA } from '@/lib/dataSource';
import {
  AdminApiError,
  adminCreateEntity,
  adminDeleteEntity,
  adminGetEntity,
  adminListEntities,
  adminUpdateEntity,
} from '@/lib/adminApi';

export type EntityType = 
  | 'hotels' | 'restaurants' | 'bars' | 'experiences' | 'events'
  | 'coffee_experiences' | 'caves' | 'rivers' | 'theme_parks'
  | 'clinics' | 'stadiums' | 'ports_marinas' | 'artisanal_workshops'
  | 'tour_guides' | 'travel_agencies' | 'tour_operators'
  | 'destinations' | 'provinces' | 'municipalities' | 'airbnb_listings'
  | 'beaches' | 'spas_wellness' | 'ad_banners' | 'historical_figures' | 'historical_events'
  | 'tour_packages' | 'job_vacancies' | 'establishment_registrations'
  | 'site_settings' | 'newsletter_subscribers' | 'marketing_leads' | 'offers'
  | 'ambassadors' | 'ambassador_referrals' | 'achievements' | 'gamification_levels'
  | 'profiles' | 'partner_profiles' | 'routes' | 'route_stops' | 'audio_guides'
  | 'ugc_reports' | 'event_tickets' | 'reward_inventory' | 'reward_shipments'
  | 'survey_templates' | 'survey_responses' | 'admin_activity_logs' | 'seo_redirections'
  | 'system_webhooks' | 'ugc_media' | 'user_suspensions' | 'support_tickets'
  | 'support_messages' | 'marketing_campaigns' | 'points_transactions' | 'marketplace_orders'
  | 'marketplace_order_items' | 'vendor_payments' | 'discount_coupons' | 'weather_alerts'
  | 'emergency_contacts' | 'system_cron_jobs' | 'ip_rules' | 'entity_translations'
  | 'lotteries' | 'lottery_draws' | 'lottery_results' | 'exchange_rates' | 'fuel_prices' | 'reservations'
  | 'protected_areas' | 'bird_species' | 'hot_springs' | 'offset_projects' | 'toll_routes' | 'marine_reports';

interface Filters {
  destination_id?: string;
  is_active?: boolean;
  is_featured?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

interface ApiResponse<T> {
  data?: T;
  total?: number;
  message?: string;
  error?: string;
}

interface CallApiOptions {
  id?: string;
  data?: Record<string, unknown>;
  filters?: Filters;
}

/**
 * Datos de administración por colección (Plan de accesos, punto 3).
 *
 * Con `VITE_DATA_SOURCE=api` habla directamente con Fastify (`/api/v1/admin/<colección>` a través de
 * `src/lib/adminApi.ts`). Mientras el portal siga sobre datos simulados, usa la función simulada de
 * siempre, pero **cargada de forma diferida**: así un build real (`api`) nunca la importa, y el cliente
 * simulado —que falla cerrado— no bloquea la carga del panel.
 */
export function useAdminEntities() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const callApi = useCallback(async function<T>(
    entity: EntityType,
    action: 'list' | 'get' | 'create' | 'update' | 'delete',
    options?: CallApiOptions
  ): Promise<ApiResponse<T> | null> {
    setLoading(true);
    try {
      if (IS_MOCK_DATA) {
        const { supabase } = await import('@/integrations/supabase/client');
        const sessionResult = await supabase.auth.getSession();
        const session = sessionResult.data.session;

        if (!session?.access_token) {
          toast({
            title: 'Error de autenticación',
            description: 'Por favor, inicia sesión nuevamente.',
            variant: 'destructive'
          });
          return null;
        }

        const response = await supabase.functions.invoke('admin-entities', {
          body: {
            entity,
            action,
            id: options?.id,
            data: options?.data,
            filters: options?.filters
          }
        });

        if (response.error) {
          throw new Error(response.error.message);
        }

        return response.data as ApiResponse<T>;
      }

      // Camino real: el servidor decide permisos y alcance en cada endpoint.
      switch (action) {
        case 'list': {
          // `callApi<T[]>` tipa la lista entera como T; aquí solo se normaliza el sobre del servidor.
          const result = await adminListEntities<unknown>(entity, options?.filters);
          return { data: result.data as T, total: result.total };
        }
        case 'get':
          return { data: (await adminGetEntity<T>(entity, options!.id!)).data };
        case 'create':
          return { data: (await adminCreateEntity<T>(entity, options?.data ?? {})).data };
        case 'update':
          return { data: (await adminUpdateEntity<T>(entity, options!.id!, options?.data ?? {})).data };
        case 'delete':
          await adminDeleteEntity(entity, options!.id!);
          return { message: 'Eliminado' };
      }
    } catch (error) {
      const description = error instanceof AdminApiError
        ? error.message
        : error instanceof Error ? error.message : 'Error desconocido';
      console.error('API Error:', error);
      toast({ title: 'Error', description, variant: 'destructive' });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const listEntities = useCallback(async function<T>(
    entity: EntityType,
    filters?: Filters
  ): Promise<ApiResponse<T[]> | null> {
    return callApi<T[]>(entity, 'list', { filters });
  }, [callApi]);

  const getEntity = useCallback(async function<T>(
    entity: EntityType,
    id: string
  ): Promise<ApiResponse<T> | null> {
    return callApi<T>(entity, 'get', { id });
  }, [callApi]);

  const createEntity = useCallback(async function<T>(
    entity: EntityType,
    data: Record<string, unknown>
  ): Promise<ApiResponse<T> | null> {
    const result = await callApi<T>(entity, 'create', { data });
    if (result?.data) {
      toast({
        title: 'Creado exitosamente',
        description: 'El elemento ha sido creado.'
      });
    }
    return result;
  }, [callApi, toast]);

  const updateEntity = useCallback(async function<T>(
    entity: EntityType,
    id: string,
    data: Record<string, unknown>
  ): Promise<ApiResponse<T> | null> {
    const result = await callApi<T>(entity, 'update', { id, data });
    if (result?.data) {
      toast({
        title: 'Actualizado exitosamente',
        description: 'El elemento ha sido actualizado.'
      });
    }
    return result;
  }, [callApi, toast]);

  const deleteEntity = useCallback(async function(
    entity: EntityType,
    id: string
  ): Promise<ApiResponse<unknown> | null> {
    const result = await callApi<unknown>(entity, 'delete', { id });
    // En el camino real un borrado correcto responde 204 sin cuerpo: el éxito se reconoce por no haber error.
    if (result && (result.message || result.data !== undefined || !IS_MOCK_DATA)) {
      toast({
        title: 'Eliminado exitosamente',
        description: 'El elemento ha sido eliminado.'
      });
    }
    return result;
  }, [callApi, toast]);

  return {
    loading,
    listEntities,
    getEntity,
    createEntity,
    updateEntity,
    deleteEntity
  };
}
