'use strict';

const fs = require('fs');
const path = require('path');

module.exports = {
  register(/*{ strapi }*/) {},

  async bootstrap({ strapi }) {
    // ─── AUTO-SEEDER AUTOMÁTICO PARA STRAPI v5 ──────────────────────────────
    try {
      const seedsDir = path.resolve(__dirname, '..', 'data-seeds');
      if (!fs.existsSync(seedsDir)) return;

      console.log('🌱 Verificando estado de colecciones para auto-siembra inicial...');

      const collectionsToSeed = [
        { file: 'destinos.json', uid: 'api::destino.destino', name: 'Destinos' },
        { file: 'playas.json', uid: 'api::playa.playa', name: 'Playas' },
        { file: 'alojamientos.json', uid: 'api::alojamiento.alojamiento', name: 'Alojamientos' },
        { file: 'restaurantes.json', uid: 'api::restaurante.restaurante', name: 'Restaurantes' },
        { file: 'experiencias.json', uid: 'api::experiencia.experiencia', name: 'Experiencias' },
        { file: 'aeropuertos.json', uid: 'api::aeropuerto.aeropuerto', name: 'Aeropuertos' },
      ];

      for (const col of collectionsToSeed) {
        const filePath = path.join(seedsDir, col.file);
        if (!fs.existsSync(filePath)) continue;

        const count = await strapi.db.query(col.uid).count();
        if (count === 0) {
          const raw = fs.readFileSync(filePath, 'utf-8');
          const items = JSON.parse(raw);
          console.log(`📥 Sembrando ${items.length} registros en ${col.name} (${col.uid})...`);

          for (const item of items) {
            try {
              // Mapeo defensivo de campos frontend hacia esquema Strapi
              const payload = {
                nombre: item.name || item.nombre || item.titulo || item.title || item.slug,
                slug: item.slug || String(item.id || item.code || '').toLowerCase(),
                descripcion: item.description || item.descripcion || item.shortDescription || '',
                descripcionLarga: item.longDescription || item.description || '',
                latitud: item.coordinates?.lat || item.latitude || null,
                longitud: item.coordinates?.lng || item.longitude || null,
                publishedAt: new Date(),
              };

              // Campos específicos
              if (item.beachType) payload.tipoArena = 'dorada';
              if (item.rating) payload.rating = parseFloat(item.rating) || 4.5;
              if (item.code) payload.codigoIATA = item.code;
              if (item.city) payload.ciudad = item.city;
              if (item.priceUSD || item.price) payload.precioUSD = parseFloat(item.priceUSD || item.price) || 0;

              await strapi.db.query(col.uid).create({ data: payload });
            } catch (itemErr) {
              // Continuar con el siguiente si falla uno específico
            }
          }
          console.log(`✅ [${col.name}] Siembra completada con éxito.`);
        }
      }
    } catch (err) {
      console.log('ℹ️ Aviso en bootstrap auto-seeder:', err.message);
    }
  },
};
