import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type EntityType = 
  | 'hotels' | 'restaurants' | 'bars' | 'experiences' | 'events'
  | 'coffee_experiences' | 'caves' | 'rivers' | 'theme_parks'
  | 'clinics' | 'stadiums' | 'ports_marinas' | 'artisanal_workshops'
  | 'tour_guides' | 'travel_agencies' | 'tour_operators'
  | 'destinations' | 'provinces' | 'municipalities' | 'airbnb_listings'
  | 'ad_banners' | 'historical_figures' | 'historical_events'
  | 'tour_packages' | 'job_vacancies';

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
    } catch (error) {
      console.error('API Error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error desconocido',
        variant: 'destructive'
      });
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
    if (result?.message) {
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
