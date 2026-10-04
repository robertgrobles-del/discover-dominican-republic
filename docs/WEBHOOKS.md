# Webhooks para operadores

Guía para quien integra su propio sistema (un PMS, un CRM, una hoja de cálculo con automatizaciones) con Descubre RD. Un webhook es un aviso que enviamos a una dirección tuya cada vez que ocurre algo en tus reservas.

## Activarlo

En el panel del operador, **Automatizaciones → Webhooks**:

1. Escribe la dirección `https` de tu sistema y elige los eventos.
2. Al crearlo se muestra un **secreto** (`whsec_…`). Guárdalo: no se vuelve a mostrar. Sirve para comprobar que el aviso viene de nosotros.
3. Usa **Enviar prueba** para recibir un evento `webhook.test`.

Cada organización puede tener hasta 5 webhooks. La dirección debe ser `https` y pública: no se aceptan `http`, `localhost` ni direcciones de red interna.

## Eventos

| Evento | Cuándo se envía |
| :--- | :--- |
| `booking.created` | Se crea una reserva de tu organización, por cualquier canal |
| `booking.cancelled` | Se cancela una reserva |
| `webhook.test` | Lo pides tú desde el panel |

Los avisos salen en lotes cada minuto, así que pueden tardar hasta un minuto en llegar.

## Qué recibes

Una petición `POST` con cuerpo JSON:

```json
{
  "id": "b3f0c1e2-7a41-4f0e-9d0c-2b8f4f1f7a55",
  "event": "booking.created",
  "created_at": "2026-10-04T15:02:11.000Z",
  "data": {
    "booking_id": "6e2c5a1c-0f4b-4a53-8a2e-51a0d9c7b111",
    "reference": "RD-4F7K2",
    "listing_id": "tour-ballenas",
    "listing_title": "Tour de ballenas en Samaná",
    "date": "2027-02-14",
    "guests": 2,
    "total_price": 180,
    "currency": "USD",
    "status": "pending",
    "source": "web"
  }
}
```

El cuerpo **no incluye datos de contacto del viajero** (nombre, correo, teléfono). Para verlos, consulta la reserva en tu panel con `booking_id` o `reference`.

Cabeceras:

| Cabecera | Contenido |
| :--- | :--- |
| `X-Webhook-Id` | Identificador de la entrega; el mismo que `id` del cuerpo |
| `X-Webhook-Event` | El nombre del evento |
| `X-Signature` | La firma (ver abajo) |

## Verificar la firma

Verifica siempre la firma antes de confiar en un aviso: cualquiera que conozca tu dirección podría enviarle peticiones.

`X-Signature` tiene la forma `t=<segundos>,v1=<hex>`. El valor `v1` es el HMAC-SHA256, con tu secreto, del texto `<t>.<cuerpo tal como llegó>`.

1. Toma `t` y `v1` de la cabecera.
2. Calcula el HMAC-SHA256 de `t + "." + cuerpo` con tu secreto. Usa el cuerpo **sin procesar**, antes de interpretarlo como JSON.
3. Compáralo con `v1` usando una comparación de tiempo constante.
4. Rechaza el aviso si `t` tiene más de 5 minutos: evita que alguien reenvíe un aviso antiguo.

```js
import { createHmac, timingSafeEqual } from "node:crypto";

function firmaValida(cuerpoCrudo, cabecera, secreto) {
  const partes = Object.fromEntries(cabecera.split(",").map((p) => p.split("=")));
  if (!partes.t || !partes.v1) return false;
  if (Math.abs(Date.now() / 1000 - Number(partes.t)) > 300) return false;
  const esperado = createHmac("sha256", secreto).update(`${partes.t}.${cuerpoCrudo}`).digest();
  const recibido = Buffer.from(partes.v1, "hex");
  return recibido.length === esperado.length && timingSafeEqual(recibido, esperado);
}
```

## Qué debe responder tu sistema

- Responde con un código `2xx` en menos de **5 segundos**. Si necesitas más tiempo, guarda el aviso y procésalo después.
- No seguimos redirecciones: la dirección registrada debe ser la definitiva.
- El mismo aviso puede llegar más de una vez. Usa `id` para no procesarlo dos veces.

## Reintentos

Si tu sistema no responde `2xx`, reintentamos con esperas crecientes: 1 minuto, 5 minutos, 30 minutos, 2 horas y 6 horas. Tras el sexto intento fallido la entrega queda como fallida.

Después de 20 entregas fallidas seguidas el webhook **se desactiva solo**. Puedes reactivarlo desde el panel; los eventos ocurridos mientras estuvo desactivado no se envían.

En **Ver entregas** aparecen las últimas 50, con su estado, el código que respondió tu sistema y el número de intentos.
