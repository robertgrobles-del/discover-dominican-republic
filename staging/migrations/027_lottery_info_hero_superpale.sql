-- Datos de contacto de cada lotería (los pasó el dueño el 2026-11-13), carrusel del hero de /loterias editable en el
-- panel y el Super Palé, que se calcula: primer premio de Leidsa + primer premio de la Lotería Nacional del mismo día.
ALTER TABLE lotteries ADD COLUMN phone TEXT;
ALTER TABLE lotteries ADD COLUMN address TEXT;
ALTER TABLE lotteries ADD COLUMN tv_channels TEXT;
ALTER TABLE lotteries ADD COLUMN founded TEXT;
ALTER TABLE lotteries ADD COLUMN slogan TEXT;
UPDATE lotteries SET phone = '(809) 683-9393', address = 'Av. Abraham Lincoln #1059, Santo Domingo', tv_channels = 'Canal 66, Cinevisión (canal 19) y Súper Canal; en radio, La Voz de las Fuerzas Armadas', slogan = 'Tu única loto', website_url = 'https://www.leidsa.com' WHERE id = 'lot-leidsa';
UPDATE lotteries SET phone = '(809) 533-5222, ext. 238 y 317', address = 'Santo Domingo', tv_channels = 'Canal 4', founded = '1882', website_url = 'https://www.loterianacional.gob.do' WHERE id = 'lot-nacional';
UPDATE lotteries SET phone = '(809) 540-9444', address = 'Edificio Haché, Santiago', tv_channels = 'Teleuniverso (canal 29)', founded = '22 de junio de 2009', slogan = 'Donde ganas y cobras más temprano', website_url = 'https://www.lotoreal.com.do' WHERE id = 'lot-real';
UPDATE lotteries SET phone = '(809) 621-2626', address = 'Plaza Lope de Vega, Av. Lope de Vega #59, Naco, Santo Domingo', tv_channels = 'Telesistema (canal 11)', founded = '30 de julio de 2009', slogan = 'Te toca', website_url = 'https://www.loteka.com.do' WHERE id = 'lot-loteka';
UPDATE lotteries SET phone = '(809) 262-1001', address = 'Torre Acrópolis, suite 1500, Av. Winston Churchill, Santo Domingo', tv_channels = 'Digital 15 y Luna TV', slogan = 'Tu lotería', website_url = 'https://laprimera.do' WHERE id = 'lot-primera';

CREATE TABLE IF NOT EXISTS lottery_hero_slides (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  prize TEXT,
  caption TEXT,
  draw_id TEXT REFERENCES lottery_draws(id) ON DELETE SET NULL,
  link_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

INSERT OR IGNORE INTO lottery_draws (id, lottery_id, slug, name, source_name, source_path, draw_days, draw_time, sunday_time, number_of_balls, tombolas_count, ball_range_min, ball_range_max, how_to_play, schedule_description) VALUES ('draw-lei-superpale', 'lot-leidsa', 'super-pale', 'Super Palé', NULL, NULL, '["lunes","martes","miercoles","jueves","viernes","sabado","domingo"]', '21:00', '18:00', 2, 1, 0, 99, 'Sale de dos sorteos del mismo día: el primer premio de Leidsa y el primer premio de la Lotería Nacional. Ganas si aciertas los dos números.', 'Todos los días, al salir Leidsa y la Lotería Nacional');
