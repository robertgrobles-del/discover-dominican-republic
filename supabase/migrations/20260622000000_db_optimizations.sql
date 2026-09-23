-- Migration: Add Indexes and Audit Triggers for Performance and Logging

-- 1. Create indexes to speed up common lookups
CREATE INDEX IF NOT EXISTS idx_partner_profiles_business_type ON public.partner_profiles(business_type);
CREATE INDEX IF NOT EXISTS idx_ambassadors_referral_code ON public.ambassadors(referral_code);
CREATE INDEX IF NOT EXISTS idx_event_tickets_ticket_code ON public.event_tickets(ticket_code);
CREATE INDEX IF NOT EXISTS idx_reservations_partner_id_status ON public.reservations(partner_id, status);

-- 2. Create audit log trigger function
CREATE OR REPLACE FUNCTION public.log_admin_activity()
RETURNS TRIGGER AS $$
DECLARE
    v_admin_id UUID := NULL;
    v_old_data JSONB := NULL;
    v_new_data JSONB := NULL;
    v_entity_id UUID := NULL;
BEGIN
    -- Try to get the current authenticated user's ID
    BEGIN
        v_admin_id := auth.uid();
    EXCEPTION WHEN OTHERS THEN
        v_admin_id := NULL;
    END;

    -- Determine old and new data based on TG_OP
    IF (TG_OP = 'INSERT') THEN
        v_new_data := to_jsonb(NEW);
        BEGIN
            v_entity_id := (v_new_data->>'id')::uuid;
        EXCEPTION WHEN OTHERS THEN
            v_entity_id := NULL;
        END;
    ELSIF (TG_OP = 'UPDATE') THEN
        v_old_data := to_jsonb(OLD);
        v_new_data := to_jsonb(NEW);
        BEGIN
            v_entity_id := (v_new_data->>'id')::uuid;
        EXCEPTION WHEN OTHERS THEN
            v_entity_id := NULL;
        END;
    ELSIF (TG_OP = 'DELETE') THEN
        v_old_data := to_jsonb(OLD);
        BEGIN
            v_entity_id := (v_old_data->>'id')::uuid;
        EXCEPTION WHEN OTHERS THEN
            v_entity_id := NULL;
        END;
    END IF;

    -- Insert audit log
    INSERT INTO public.admin_activity_logs (
        admin_id,
        action_type,
        entity_name,
        entity_id,
        old_data,
        new_data
    ) VALUES (
        v_admin_id,
        TG_OP,
        TG_TABLE_NAME,
        v_entity_id,
        v_old_data,
        v_new_data
    );

    IF (TG_OP = 'DELETE') THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Attach audit log triggers to key tables
DROP TRIGGER IF EXISTS trg_audit_partner_profiles ON public.partner_profiles;
CREATE TRIGGER trg_audit_partner_profiles
AFTER INSERT OR UPDATE OR DELETE ON public.partner_profiles
FOR EACH ROW EXECUTE FUNCTION public.log_admin_activity();

DROP TRIGGER IF EXISTS trg_audit_ambassadors ON public.ambassadors;
CREATE TRIGGER trg_audit_ambassadors
AFTER INSERT OR UPDATE OR DELETE ON public.ambassadors
FOR EACH ROW EXECUTE FUNCTION public.log_admin_activity();

DROP TRIGGER IF EXISTS trg_audit_event_tickets ON public.event_tickets;
CREATE TRIGGER trg_audit_event_tickets
AFTER INSERT OR UPDATE OR DELETE ON public.event_tickets
FOR EACH ROW EXECUTE FUNCTION public.log_admin_activity();

DROP TRIGGER IF EXISTS trg_audit_reservations ON public.reservations;
CREATE TRIGGER trg_audit_reservations
AFTER INSERT OR UPDATE OR DELETE ON public.reservations
FOR EACH ROW EXECUTE FUNCTION public.log_admin_activity();
