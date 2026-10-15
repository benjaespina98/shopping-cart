# Anti-spam de los formularios públicos

Aplica a `POST /api/quotes` (presupuesto y contacto) y `POST /api/orders` (pedido por WhatsApp).
No hay captcha ni servicios externos. Es una defensa por capas, **de baja fricción y de eficacia
limitada**: frena bots simples y errores, no a un atacante decidido.

## Qué hay

| Capa | Dónde | Qué hace |
|---|---|---|
| Honeypot | `client/src/components/ui/Honeypot.jsx`, `server/utils/antiSpam.js` | Campo oculto `website`. Si llega con contenido, el server responde con el mismo status y la misma forma que un éxito, pero no guarda, no descuenta stock y no manda mail. Solo registra un contador (sin IP ni datos personales). |
| Validación | `quoteController.js` (`parseQuoteBody`), `orderController.js` (`parseOrderBody`) | Email estricto, `trim`, largos máximos, tipos, y rechazo de CR/LF y caracteres de control en los campos de una línea (`subject`, `replyTo`) para evitar inyección de headers de mail. |
| Limiter propio | `server/middleware/formLimiter.js` | 5 presupuestos y 10 pedidos cada 15 min por IP. Se suma al limiter global de escrituras (60/15 min). Responde `429` con `Retry-After`. |

El honeypot responde con el **mismo status que un éxito real (201)**, no con 200: un 200 distinto
delataría la trampa al bot.

## Limitación del limiter (leer antes de confiar en él)

El store por defecto (`MemoryStore`) vive en la **memoria del proceso**. En Vercel cada instancia
serverless tiene su propia memoria y se crea y destruye sin aviso, por lo tanto:

- el contador **no se comparte entre instancias**: con tráfico repartido en varias, el tope real es
  `max × instancias`;
- **no sobrevive a un cold start**: la ventana se reinicia cada vez que una instancia nueva arranca;
- un atacante que espera o reparte sus pedidos no queda limitado.

Es decir: frena ráfagas desde una misma instancia y scripts torpes, **pero no es una defensa real
contra spam**. No se agregó Redis ni ningún servicio externo a propósito.

El store es reemplazable. Cualquier objeto con `hit(key, windowMs)` que devuelva (o resuelva a)
`{ count, resetAt }` sirve:

```js
import { createFormLimiter } from './middleware/formLimiter.js';

const limiter = createFormLimiter({ store: miStoreRedis, max: 5 });
```

Si el store falla, el limiter deja pasar el request (prioriza no perder consultas reales).

## Siguiente paso recomendado

1. **Cloudflare Turnstile** (o hCaptcha) en los formularios de presupuesto y contacto, verificado en
   el server. Requiere crear el sitio y las claves (`site key` pública y `secret key` en Vercel como
   Sensitive); por eso no se implementó: depende de una cuenta del dueño.
2. Un store compartido (Vercel KV / Upstash Redis) para el limiter, si se mantiene.
3. Revisar el contador de honeypot en los logs para saber si hay tráfico automatizado real antes de
   endurecer más.

## Verificación

Cubierto por `server/tests/antiSpam.test.js` (honeypot, validación, limiter, store reemplazable) y
por los tests de `Contact`, `Quote` y `CartDrawer` en el cliente. **No** hay una prueba contra el
despliegue real: el comportamiento del limiter entre instancias es justamente lo que no se puede
garantizar.
