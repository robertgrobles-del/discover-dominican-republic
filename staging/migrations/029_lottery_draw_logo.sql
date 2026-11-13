-- Logo propio por sorteo (si está vacío se usa el de la lotería). Los logos de 021 eran fotos genéricas de Unsplash,
-- no logos: se vacían para que se vean los emojis hasta subir los oficiales en el panel.
ALTER TABLE lottery_draws ADD COLUMN logo_url TEXT;
UPDATE lotteries SET logo_url = NULL WHERE logo_url LIKE 'https://images.unsplash.com/%';
