# Datos sintéticos etiquetados (punto 69 del plan)

> "Usar datos sintéticos etiquetados para demos. Separar cuentas y datasets de demostración del
> entorno y registros reales."

Los datos de demostración viven en las mismas tablas que los reales, pero **nunca se confunden con
ellos**: cada fila creada por un seed de demo queda marcada con `is_synthetic = true` y con el lote
que la creó. Así se puede enseñar la plataforma, probar listados con volumen y limpiar después sin
tocar un solo registro real.

## 1. Convención de etiquetado

Migración [`0057_synthetic_data_labels.sql`](../backend/migrations/0057_synthetic_data_labels.sql):

| Columna | Tipo | Significado |
| --- | --- | --- |
| `is_synthetic` | `boolean NOT NULL DEFAULT false` | `true` = la fila la creó un seed de demo; `false` (por defecto) = registro real |
| `synthetic_batch` | `text` (nullable) | Lote que la creó: `seed-demo`, `seed-bulk`, `seed-mass-faker`… Sólo tiene valor si `is_synthetic = true` |

Las columnas existen en las cinco tablas que representan **personas, cuentas y su actividad**:

`users`, `bookings`, `reviews`, `partner_profiles`, `creator_profiles`.

Cada tabla tiene además un **índice parcial** sobre `synthetic_batch` (`WHERE is_synthetic`), de modo
que contar o limpiar por lote es barato y las consultas sobre datos reales no pagan el índice.

Reglas de la convención:

1. El valor de `synthetic_batch` es **el nombre del script** que insertó la fila. No se inventan
   lotes nuevos ni se reutiliza el de otro script.
2. Se etiqueta **en el `INSERT`**, en la misma sentencia que crea la fila: nada de marcar "después".
3. Los seeds etiquetados se niegan a correr con `NODE_ENV=production` y salen con código `!= 0`.
4. Las filas de tablas auxiliares (por ejemplo `profiles`, que cuelga de `users` con
   `ON DELETE CASCADE`) no necesitan etiqueta: se van con su cuenta.

## 2. Scripts que aplican la convención

| Script | Comando | Qué etiqueta |
| --- | --- | --- |
| [`seed-demo.ts`](../backend/scripts/seed-demo.ts) | `npm run db:seed-demo` | Cuentas de demostración (viajero, operador y creador), su organización, su perfil de creador y una reseña — lote `seed-demo` |
| [`seed-bulk.ts`](../backend/scripts/seed-bulk.ts) | `npm run db:seed-bulk` | Datos de volumen con slug/correo `bulk-…`: destinos, playas, hoteles y, además, cuentas y reseñas etiquetadas — lote `seed-bulk` |
| [`seed-mass-faker.ts`](../backend/scripts/seed-mass-faker.ts) | `npx tsx scripts/seed-mass-faker.ts --count 100` | Cuentas, perfiles y reseñas generadas con Faker — lote `seed-mass-faker` |

`seed-bulk.ts` mantiene **las dos vías de limpieza a la vez**: el prefijo `bulk-` del slug/correo y la
etiqueta `synthetic_batch = 'seed-bulk'`. Las tablas de contenido (`destinations`, `beaches`,
`hotels`) no llevan las columnas de etiquetado y se limpian por prefijo; las de personas y opiniones
se limpian por lote.

Otros seeds del proyecto (por ejemplo `seed-from-mock.ts`) **no** etiquetan: son para contenido real
y no deben usarse para montar demos.

## 3. Cómo limpiar

```bash
# Todo lo sintético, sin importar el lote (sólo toca is_synthetic = true)
npm run db:purge-synthetic

# Sólo un lote concreto
npm run db:purge-synthetic -- --batch seed-bulk
```

[`purge-synthetic.ts`](../backend/scripts/purge-synthetic.ts):

- Borra **únicamente** `WHERE is_synthetic = true` (y `synthetic_batch = $1` si se pasa `--batch`).
  Nunca borra por patrón de texto, por fecha ni por id.
- Respeta el orden de claves foráneas: primero las hijas (`bookings`, `reviews`,
  `creator_profiles`), después `partner_profiles` y por último `users`, que es la raíz.
- Aborta antes de conectarse si `NODE_ENV=production` (`assertNotProduction`).
- Imprime un **resumen por tabla** con las filas borradas y los errores; si alguna tabla falla, sale
  con código `!= 0` para que el fallo no pase inadvertido.

## 4. Cómo distinguir una cuenta demo de una real

- **Por la columna**: `SELECT id, email FROM users WHERE is_synthetic;` — todo lo que devuelve esa
  consulta es demo. Al revés, `is_synthetic = false` es un registro real y **no se toca**.
- **Por el lote**: `SELECT synthetic_batch, count(*) FROM users WHERE is_synthetic GROUP BY 1;` para
  saber qué script creó cada cosa y poder limpiar sólo ese lote.
- **Por los datos del propio seed de demo**: las cuentas de `seed-demo.ts` usan ids fijos
  (`d0000000-…-000000000001/2/3`), correos `demo.*@descubrerd.do` y contraseña pública
  (`DemoRD.2026`). Una cuenta con correo corporativo real o creada por registro normal **jamás**
  lleva `is_synthetic = true`.
- **En la aplicación**: cualquier informe, panel o consulta de negocio debe poder excluir lo
  sintético con `AND NOT is_synthetic` (o `WHERE is_synthetic = false`).

## 5. Qué NO debe hacerse

- **Sembrar en producción.** Ningún seed etiquetado corre con `NODE_ENV=production` y la purga
  también se niega. Los datos de demostración no deben llegar nunca a la base real.
- **Mezclar lotes.** Cada script usa su propio `synthetic_batch`; reutilizarlo o dejarlo en `NULL`
  rompe la limpieza selectiva y hace imposible saber qué se puede borrar.
- **Usar datos sintéticos en métricas de negocio.** Reseñas, reservas y cuentas de demo contaminan
  KPIs, medias de valoración y embudos. Filtra siempre por `NOT is_synthetic`.
- **Marcar datos reales como sintéticos** (o al revés) para "probar" algo: la etiqueta es la frontera
  entre demo y realidad; si se ensucia, la limpieza borra lo que no debe.
- **Borrar a mano con `DELETE` por prefijo o por fecha** sobre las cinco tablas etiquetadas: usa
  `db:purge-synthetic`, que respeta las claves foráneas y deja resumen.
- **Modificar la migración `0057` una vez aplicada**: el migrador verifica el checksum y rechazará
  la base. Cualquier cambio de esquema va en una migración nueva.
