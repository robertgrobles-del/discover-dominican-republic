# Arquitectura y convenciones del frontend

## Capas objetivo

```text
app / routes
  └── features o modules (composición y flujos de producto)
       ├── components (presentación compartida; sin acceso directo a persistencia/API)
       ├── hooks (adaptadores React Query y coordinación de UI)
       └── services (casos de uso y acceso a datos por dominio)
            └── lib/httpClient (transporte JSON común)
```

Dirección de dependencias: `app → feature/module → service → lib`. Los tipos de dominio pueden fluir hacia arriba; las capas inferiores no importan páginas, componentes ni rutas. Mantener `src/data/` para fixtures/catálogos estáticos explícitos y no usarlo como repositorio de datos transaccionales.

## Estructura actual y migración

- `src/modules/operadores` y `src/modules/tienda` son ejemplos de dominios agrupados con API, tipos, componentes, páginas y hooks. `src/features/` contiene áreas más pequeñas, pero el portal mantiene muchos componentes y páginas en carpetas globales.
- El portal aún usa el adaptador mock `src/integrations/supabase/client.ts`; Fastify y Strapi están separados. No mover carpetas masivamente hasta migrar consumidores: hacerlo ahora aumenta riesgo funcional. Las nuevas funciones deben encapsular sus llamadas en `services/` y validar respuestas al borde.
- `src/lib/httpClient.ts` centraliza transporte JSON, cabeceras, errores y payloads; los clientes de dominio componen URL y validan sus contratos. Para archivos/binarios o streaming se debe usar un transporte específico, no este helper JSON.
- `npm run check:import-cycles` inspecciona imports estáticos/dinámicos locales y bloquea ciclos en CI. `@/` resuelve a `src/`.

## Convenciones

- Carpetas y rutas por dominio en minúsculas; React components en `PascalCase.tsx`; hooks como `useCamelCase.ts(x)`; servicios `camelCase.ts`; tipos con nombres de dominio descriptivos.
- Exportar contratos de API cerca del adaptador de dominio; preferir `unknown` en datos externos y validar con Zod antes de exponerlos a UI. Prohibir `any` en servicios nuevos.
- Separar consultas y mutaciones; claves de TanStack Query estables y namespaced por dominio. Los servicios reciben `AbortSignal` cuando soportan cancelación.
- Textos visibles en diccionarios `src/i18n/translations`; español es base, los demás idiomas hacen fallback al español hasta cargar su diccionario. No crear diccionarios paralelos dentro de features.
- Los nombres de páginas existentes se conservan mientras se migra. Nuevos archivos deben evitar `index.ts` genéricos salvo barriles intencionales y pequeños.

## OpenAPI y contratos tipados

El backend mantiene validación Zod en rutas Fastify. `backend/scripts/generate-openapi.ts` genera un YAML manual, no deriva hoy todos los esquemas de ruta, y el frontend aún no genera SDK/types desde él. Por ello no se debe presentar ese YAML como fuente completa para tipos automáticos. Siguiente paso: exportar OpenAPI desde las rutas registradas, comparar el artefacto en CI y adoptar un generador (`openapi-typescript`) fijando versión; después consumir tipos generados por endpoint. Hasta entonces, mantener tipos y Zod junto a cada cliente como contrato transitorio.
