// Cálculo del editor masivo de precios (panel admin). El panel calcula y muestra el resultado antes de
// confirmar; al servidor viajan precios finales (ver updatePrices en server/controllers/productController.js).

export const ADJUST_MODES = [
  { value: 'percent_up',   label: 'Aumentar un porcentaje (%)', unit: '%' },
  { value: 'percent_down', label: 'Bajar un porcentaje (%)',    unit: '%' },
  { value: 'amount_up',    label: 'Sumar un monto ($)',         unit: '$' },
  { value: 'amount_down',  label: 'Restar un monto ($)',        unit: '$' },
];

export const ROUNDINGS = [
  { value: '0',   label: 'Sin redondeo (centavos)' },
  { value: '1',   label: 'A pesos enteros' },
  { value: '10',  label: 'Al múltiplo de $10' },
  { value: '100', label: 'Al múltiplo de $100' },
];

// Admite coma decimal ("12,5"). Devuelve NaN si no es un número finito.
export const parseNumber = (raw) => {
  const text = String(raw ?? '').trim().replace(',', '.');
  return text === '' ? NaN : Number(text);
};

const roundTo = (price, step) => (step > 0 ? Math.round(price / step) * step : Math.round(price * 100) / 100);

// Nuevo precio de un producto, o null si el valor ingresado no sirve. Nunca devuelve menos de 0.
export function computeNewPrice(price, { mode, value, rounding = '0' }) {
  const amount = parseNumber(value);
  if (!Number.isFinite(amount) || amount < 0 || !Number.isFinite(price)) return null;

  const raw = {
    percent_up: price * (1 + amount / 100),
    percent_down: price * (1 - amount / 100),
    amount_up: price + amount,
    amount_down: price - amount,
  }[mode];
  if (raw === undefined) return null;

  return Math.max(0, roundTo(raw, Number(rounding)));
}

// Mismo formato que la tabla de productos y la tienda: $1.234,5
export const formatPrice = (value) => `$${Number(value).toLocaleString('es-AR')}`;
