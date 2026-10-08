import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ts from 'typescript';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const cmsSeedsDir = path.resolve(rootDir, 'cms', 'data-seeds');

if (!fs.existsSync(cmsSeedsDir)) {
  fs.mkdirSync(cmsSeedsDir, { recursive: true });
}

console.log('🚀 Iniciando exportación de colecciones TypeScript hacia JSON para Strapi...');

function extractCollection(srcRelativePath, exportName, jsonFileName) {
  const fullSrcPath = path.resolve(rootDir, srcRelativePath);
  try {
    const rawTs = fs.readFileSync(fullSrcPath, 'utf-8');
    const transpiled = ts.transpileModule(rawTs, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        removeComments: true,
      },
    });

    const exports = {};
    const module = { exports };
    const fn = new Function('exports', 'module', transpiled.outputText);
    fn(exports, module);

    const data = module.exports[exportName] || exports[exportName] || [];
    const targetJsonPath = path.resolve(cmsSeedsDir, jsonFileName);
    fs.writeFileSync(targetJsonPath, JSON.stringify(data, null, 2), 'utf-8');

    console.log(`✅ [${exportName}] ${Array.isArray(data) ? data.length : 1} registros exportados a cms/data-seeds/${jsonFileName}`);
  } catch (err) {
    console.error(`❌ Error al procesar ${srcRelativePath}:`, err.message);
  }
}

function run() {
  extractCollection('src/data/destinations.ts', 'destinations', 'destinos.json');
  extractCollection('src/data/beaches.ts', 'beaches', 'playas.json');
  extractCollection('src/data/hotels.ts', 'hotels', 'alojamientos.json');
  extractCollection('src/data/restaurants.ts', 'restaurants', 'restaurantes.json');
  extractCollection('src/data/experiences.ts', 'experiences', 'experiencias.json');
  extractCollection('src/data/airports.ts', 'airports', 'aeropuertos.json');
  extractCollection('src/data/bars.ts', 'bars', 'bares.json');
  console.log('\n🎉 ¡Exportación completada exitosamente! Todos los catálogos están en cms/data-seeds/\n');
}

run();
