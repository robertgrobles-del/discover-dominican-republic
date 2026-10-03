-- Plan de 150 mejoras, punto 30: al aprobar una solicitud de Sello Verificado (Claim & Verify) se genera el
-- contrato de términos comerciales de ese negocio. El texto queda guardado tal cual se emitió, con su huella.

CREATE TABLE IF NOT EXISTS business_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Si la solicitud se borra, el contrato se conserva: es la constancia de lo que se emitió y aceptó.
  audit_id uuid UNIQUE REFERENCES business_verification_audits(id) ON DELETE SET NULL,
  business_id uuid NOT NULL,
  business_name text NOT NULL,
  applicant_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  terms_version text NOT NULL,
  body text NOT NULL,
  body_hash text NOT NULL,            -- sha256 del texto: prueba de qué se aceptó
  issued_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz,
  accepted_by uuid REFERENCES users(id) ON DELETE SET NULL,
  accepted_ip text
);
CREATE INDEX IF NOT EXISTS idx_business_contracts_applicant ON business_contracts (applicant_user_id);
