-- Referido de registro: el código con el que llegó la persona (de gamificación o un enlace de creador «CR-…») se guarda al
-- crear la cuenta y se aplica al verificar el correo, que es cuando `applyReferral` lo admite.
ALTER TABLE users ADD COLUMN IF NOT EXISTS signup_ref_code text CHECK (signup_ref_code IS NULL OR length(signup_ref_code) <= 30);
-- Registros conseguidos por cada enlace de creador (los puntos van al código de referido del creador).
ALTER TABLE creator_affiliate_links ADD COLUMN IF NOT EXISTS signups integer NOT NULL DEFAULT 0 CHECK (signups >= 0);
