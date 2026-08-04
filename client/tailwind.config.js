/** @type {import('tailwindcss').Config} */

// Paleta Playa & Sol. Definida acá una sola vez y volcada a variables CSS en
// src/design-system/tokens.css con los mismos valores.
//
// Antes había dos paletas en desacuerdo: los tokens usaban grises fríos con tinte teal
// y sombras teñidas de teal, mientras Tailwind traía `neutral-*` con los grises de
// fábrica y sombras negras puras. Encima media tienda usaba `slate-*`, que ni siquiera
// estaba configurado. Resultado: la tienda parecía de otro sitio que el resto.
//
// `slate` y `neutral` quedan apuntados al mismo gris de marca a propósito: hay mucho
// código que ya los usa y así deja de desentonar sin tener que reescribirlo todo de una.
const grey = {
  0:   '#FFFFFF',
  50:  '#F7F8F9',
  100: '#EEF1F2',
  200: '#E0E5E7',
  300: '#C7CFD2',
  400: '#9AA5AA',
  500: '#6E797E',
  600: '#4D5862',
  700: '#353E45',
  800: '#222A30',
  900: '#141A1E',
};

const teal = {
  50:  '#F1F7F9',
  100: '#DEEBEF',
  200: '#BCD6DD',
  300: '#8FB6C2',
  400: '#5C93A4',
  500: '#3B7488',
  600: '#2B5C6D',
  700: '#244B5A', // Pantone 7477 C — institucional
  800: '#193A45',
  900: '#122B33',
};

const sun = {
  50:  '#FFFBEF',
  100: '#FFF4D2',
  200: '#FFE9A6',
  300: '#FFDD78',
  400: '#FFD150',
  500: '#FFC629', // Pantone 123 C — secundario
  600: '#EBAD10',
  700: '#C28C0A',
  800: '#946A0B',
  900: '#6B4B08',
};

// Rampas semánticas. Cada una parte del valor 500 que ya estaba en los tokens CSS
// y se abre hacia ambos extremos, para que exista el tono que cada componente pide
// (fondos suaves en 50/100, texto legible en 600/700).
const success = {
  50: '#EDF9F3', 100: '#DCF3E8', 200: '#B9E7D2', 300: '#8AD5B4',
  400: '#57BC90', 500: '#2E9E6B', 600: '#258056', 700: '#1D6544',
  800: '#164E35', 900: '#0F3624',
};

const warning = {
  50: '#FEF7EC', 100: '#FCEBCF', 200: '#F8D69C', 300: '#F2BC66',
  400: '#EBA53C', 500: '#E5921C', 600: '#C57713', 700: '#9A5C0F',
  800: '#74450B', 900: '#4E2E07',
};

const error = {
  50: '#FDF0ED', 100: '#FBE2DC', 200: '#F5C0B4', 300: '#EC9885',
  400: '#E1705A', 500: '#D6452E', 600: '#B53724', 700: '#8F2B1C',
  800: '#6B2015', 900: '#47150E',
};

const info = {
  50: '#EFF7FB', 100: '#DDEEF6', 200: '#B9DBEB', 300: '#8CC2DC',
  400: '#5AA3C5', 500: '#2F7FA6', 600: '#256687', 700: '#1C4E68',
  800: '#153A4E', 900: '#0E2733',
};

export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: teal,
        accent: sun,
        sun,
        teal,
        brand: '#244B5A',
        'brand-light': '#F1F7F9',
        neutral: grey,
        slate: grey,
        sand: {
          50:  '#FBF9F5',
          100: '#F4F1EA',
          200: '#E9E4D9',
          300: '#D8D1C2',
        },
        success,
        warning,
        error,
        info,

        // Las familias por defecto de Tailwind quedan apuntadas a las rampas
        // semánticas de marca. Hay ~75 usos de `amber-600`, `red-50`, `green-500`
        // repartidos en 15 archivos: en vez de reescribirlos uno por uno (con el
        // riesgo de romper algo por el camino), se redefine qué significan. El
        // esmeralda #10B981 y el ámbar #F59E0B de fábrica se veían ácidos y ajenos
        // al lado del teal petróleo.
        red: error,
        green: success,
        emerald: success,
        amber: warning,
        yellow: warning,
        orange: warning,
        blue: info,
      },
      // Quicksand es la tipografía de marca (manual de identidad); Mulish para el
      // texto corrido, donde manda la legibilidad.
      fontFamily: {
        display: ['"Quicksand"', '"Poppins"', 'system-ui', 'sans-serif'],
        sans:    ['"Mulish"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs':   ['12px', { lineHeight: '16px' }],
        'sm':   ['14px', { lineHeight: '20px' }],
        'base': ['16px', { lineHeight: '24px' }],
        'lg':   ['18px', { lineHeight: '28px' }],
        'xl':   ['20px', { lineHeight: '28px' }],
        '2xl':  ['24px', { lineHeight: '32px' }],
        '3xl':  ['30px', { lineHeight: '36px' }],
        '4xl':  ['36px', { lineHeight: '44px' }],
        '5xl':  ['48px', { lineHeight: '56px' }],
      },
      // Mismos radios que --radius-* en tokens.css. Antes Tailwind decía 12px donde
      // los tokens decían 16px, así que dos tarjetas vecinas tenían esquinas distintas.
      borderRadius: {
        'xs':  '4px',
        'sm':  '8px',
        'md':  '12px',
        'lg':  '16px',
        'xl':  '24px',
        '2xl': '32px',
        'pill': '999px',
      },
      // Sombras teñidas de teal, no negro puro: sobre el fondo arena del sitio una
      // sombra negra se ve sucia y grisácea.
      boxShadow: {
        'xs':      '0 1px 2px rgba(18, 43, 51, 0.06)',
        'sm':      '0 1px 3px rgba(18, 43, 51, 0.08), 0 1px 2px rgba(18, 43, 51, 0.06)',
        'md':      '0 4px 12px rgba(18, 43, 51, 0.08), 0 2px 4px rgba(18, 43, 51, 0.05)',
        'lg':      '0 12px 28px rgba(18, 43, 51, 0.12), 0 4px 8px rgba(18, 43, 51, 0.06)',
        'xl':      '0 20px 44px rgba(18, 43, 51, 0.16), 0 8px 16px rgba(18, 43, 51, 0.08)',
        // Eran un azul (#0369A1) y un ámbar (#F59E0B) que no existen en la marca.
        'primary': '0 8px 22px rgba(36, 75, 90, 0.28)',
        'accent':  '0 8px 22px rgba(255, 197, 41, 0.32)',
        'success': '0 8px 22px rgba(46, 158, 107, 0.28)',
      },
      transitionTimingFunction: {
        'out-brand': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      transitionDuration: {
        'fast':     '140ms',
        'standard': '240ms',
        'slow':     '400ms',
      },
      keyframes: {
        'rise-in': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to:   { opacity: '1', transform: 'none' },
        },
      },
      animation: {
        'rise-in': 'rise-in 300ms cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [],
};
