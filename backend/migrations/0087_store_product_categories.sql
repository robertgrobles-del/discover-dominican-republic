-- Tipos de producto de la tienda administrables desde el panel. Antes eran cinco valores fijos en un CHECK; ahora
-- viven en su propia tabla y cada producto apunta a uno por su slug.

CREATE TABLE IF NOT EXISTS store_product_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' AND length(slug) BETWEEN 2 AND 40),
  name text NOT NULL CHECK (length(name) BETWEEN 2 AND 60),
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO store_product_categories (slug, name, sort_order) VALUES
  ('poster', 'Pósters', 1), ('ropa', 'Ropa', 2), ('accesorios', 'Accesorios', 3), ('hogar', 'Hogar', 4), ('bolsos', 'Bolsos', 5)
ON CONFLICT (slug) DO NOTHING;

-- Por si algún producto trae un tipo que no esté en la lista inicial.
INSERT INTO store_product_categories (slug, name, sort_order)
SELECT DISTINCT p.category, initcap(replace(p.category, '-', ' ')), 100 FROM store_products p
WHERE NOT EXISTS (SELECT 1 FROM store_product_categories c WHERE c.slug = p.category)
ON CONFLICT (slug) DO NOTHING;

ALTER TABLE store_products DROP CONSTRAINT IF EXISTS store_products_category_check;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'store_products_category_fk') THEN
    -- Renombrar el slug de un tipo arrastra sus productos; no se puede borrar un tipo que todavía tiene productos.
    ALTER TABLE store_products ADD CONSTRAINT store_products_category_fk FOREIGN KEY (category) REFERENCES store_product_categories (slug) ON UPDATE CASCADE ON DELETE RESTRICT;
  END IF;
END $$;
