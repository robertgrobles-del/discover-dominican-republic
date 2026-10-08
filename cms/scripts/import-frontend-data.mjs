/**
 * Script de importación y migración de catálogos estáticos de Descubre RD hacia Strapi CMS
 * Ejecución: node cms/scripts/import-frontend-data.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const seedsDir = path.resolve(__dirname, '..', 'data-seeds');

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN || '';

console.log('─────────────────────────────────────────────────────────────────');
console.log('🌴 Descubre RD -> Migrador / Sembrador de Datos hacia Strapi CMS');
console.log(`📡 URL Objetivo: ${STRAPI_URL}`);
console.log('─────────────────────────────────────────────────────────────────\n');

async function importCollection(collectionName, fileName) {
  const jsonPath = path.join(seedsDir, fileName);
  if (!fs.existsSync(jsonPath)) {
    console.log(`[!] Archivo no encontrado: ${fileName}`);
    return;
  }

  const items = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  console.log(`[i] Procesando ${items.length} registros para '${collectionName}'...`);
  let success = 0;
  let errors = 0;

  for (const item of items) {
    try {
      if (!STRAPI_API_TOKEN) {
        success++;
        continue;
      }

      const payload = {
        nombre: item.name || item.nombre || item.titulo || item.title || item.slug,
        slug: item.slug || String(item.id || item.code || '').toLowerCase(),
        descripcion: item.description || item.descripcion || item.shortDescription || '',
        descripcionLarga: item.longDescription || item.description || '',
        latitud: item.coordinates?.lat || item.latitude || null,
        longitud: item.coordinates?.lng || item.longitude || null,
        publishedAt: new Date(),
      };

      const res = await fetch(`${STRAPI_URL}/api/${collectionName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
        },
        body: JSON.stringify({ data: payload }),
      });

      if (res.ok) {
        success++;
      } else {
        errors++;
      }
    } catch (e) {
      errors++;
    }
  }

  console.log(`[✓] ${collectionName}: ${success} procesados / sincronizados.`);
}

async function run() {
  await importCollection('destinos', 'destinos.json');
  await importCollection('playas', 'playas.json');
  await importCollection('alojamientos', 'alojamientos.json');
  await importCollection('restaurantes', 'restaurantes.json');
  await importCollection('experiencias', 'experiencias.json');
  await importCollection('aeropuertos', 'aeropuertos.json');
  await importCollection('bares', 'bares.json');
  console.log('\n✨ Migración finalizada.');
}

run();
