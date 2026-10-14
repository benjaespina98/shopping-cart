// Limiter propio, más estricto que el global, para los formularios públicos de escritura
// (POST /api/quotes y POST /api/orders).
//
// LIMITACIÓN IMPORTANTE: el store por defecto vive en la memoria del proceso. En Vercel cada
// instancia serverless tiene su propia memoria y se crea y destruye sin aviso, así que el
// contador NO se comparte entre instancias ni sobrevive a un cold start: un atacante que
// reparte sus pedidos entre instancias (o simplemente espera) no queda limitado. Esto frena
// ráfagas desde una misma instancia y errores de scripts; no es una defensa real contra
// spam. Para eso hace falta un store compartido (Redis/KV) o un desafío tipo Turnstile.
// Ver docs/ANTI-SPAM.md.
//
// El store es reemplazable: cualquier objeto con `hit(key, windowMs)` que devuelva (o
// resuelva a) `{ count, resetAt }` sirve, por ejemplo uno respaldado en Redis.

export class MemoryStore {
  constructor({ now = () => Date.now(), maxKeys = 5000 } = {}) {
    this.now = now;
    this.maxKeys = maxKeys;
    this.entries = new Map();
  }

  hit(key, windowMs) {
    const now = this.now();
    let entry = this.entries.get(key);

    if (!entry || entry.resetAt <= now) {
      if (this.entries.size >= this.maxKeys) this.sweep(now);
      entry = { count: 0, resetAt: now + windowMs };
      this.entries.set(key, entry);
    }

    entry.count += 1;
    return { count: entry.count, resetAt: entry.resetAt };
  }

  // Quita las ventanas vencidas para que el mapa no crezca sin límite.
  sweep(now = this.now()) {
    for (const [key, entry] of this.entries) {
      if (entry.resetAt <= now) this.entries.delete(key);
    }
  }

  reset() {
    this.entries.clear();
  }
}

export const createFormLimiter = ({
  store = new MemoryStore(),
  windowMs = 15 * 60 * 1000,
  max,
  message = 'Enviaste demasiadas solicitudes seguidas. Probá de nuevo en unos minutos.',
  keyGenerator = (req) => req.ip || 'desconocida',
} = {}) => {
  if (!Number.isInteger(max) || max < 1) {
    throw new Error('createFormLimiter: "max" debe ser un entero mayor a 0');
  }

  const middleware = async (req, res, next) => {
    try {
      const { count, resetAt } = await store.hit(keyGenerator(req), windowMs);
      const retryAfter = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000));

      res.setHeader('RateLimit-Limit', String(max));
      res.setHeader('RateLimit-Remaining', String(Math.max(0, max - count)));
      res.setHeader('RateLimit-Reset', String(retryAfter));

      if (count > max) {
        res.setHeader('Retry-After', String(retryAfter));
        res.status(429).json({ message });
        return;
      }
      next();
    } catch (error) {
      // Si el store falla no se bloquea el formulario: es preferible dejar pasar el envío
      // a perder consultas reales por un problema de infraestructura.
      console.error('[form-limiter] el store falló, se deja pasar el request:', error.message);
      next();
    }
  };

  middleware.store = store;
  return middleware;
};

// Instancias de la app. Un store por formulario para que los contadores no se mezclen.
export const quoteFormLimiter = createFormLimiter({ max: 5 });
export const orderFormLimiter = createFormLimiter({ max: 10 });

// Solo para tests: limpia los contadores de las instancias de la app.
export const resetFormLimiters = () => {
  quoteFormLimiter.store.reset?.();
  orderFormLimiter.store.reset?.();
};
