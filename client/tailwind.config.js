/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand primary — teal petróleo (aligned with CSS design tokens)
        primary: {
          50:  '#F1F7F9',
          100: '#DEEBEF',
          200: '#BCD6DD',
          300: '#8FB6C2',
          400: '#5C93A4',
          500: '#3B7488',
          600: '#2B5C6D',
          700: '#244B5A', // Brand principal
          800: '#193A45',
          900: '#122B33',
        },
        // Brand alias for backward-compat (bg-brand, text-brand, etc.)
        brand: '#244B5A',
        'brand-light': '#F1F7F9',
        // Accent — amarillo sol (energía, acción)
        accent: {
          50:  '#FFFBEF',
          100: '#FFF4D2',
          200: '#FFE9A6',
          300: '#FFDD78',
          400: '#FFD150',
          500: '#FFC629', // Accent principal
          600: '#EBAD10',
          700: '#C28C0A',
          800: '#946A0B',
          900: '#6B4B08',
        },
        // Verde WhatsApp (confirmación, éxito)
        success: {
          50:  '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
        },
        // Rojo (error)
        error: {
          50:  '#FEF2F2',
          100: '#FEE2E2',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
        },
        // Grises neutros (profesionales)
        neutral: {
          50:  '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
        // Sun alias para compatibilidad
        sun: {
          50:  '#FFFBEF',
          100: '#FFF4D2',
          200: '#FFE9A6',
          300: '#FFDD78',
          400: '#FFD150',
          500: '#FFC629',
          600: '#EBAD10',
          700: '#C28C0A',
          800: '#946A0B',
          900: '#6B4B08',
        },
      },
      fontFamily: {
        display: ['"Poppins"', 'system-ui', 'sans-serif'],
        sans:    ['"Mulish"', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        'xs':   ['12px', { lineHeight: '16px', fontWeight: '400' }],
        'sm':   ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'base': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'lg':   ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'xl':   ['20px', { lineHeight: '28px', fontWeight: '600' }],
        '2xl':  ['24px', { lineHeight: '32px', fontWeight: '600' }],
        '3xl':  ['30px', { lineHeight: '36px', fontWeight: '600' }],
        '4xl':  ['36px', { lineHeight: '44px', fontWeight: '700' }],
        '5xl':  ['48px', { lineHeight: '56px', fontWeight: '700' }],
      },
      borderRadius: {
        'xs':  '4px',
        'sm':  '8px',
        'md':  '10px',
        'lg':  '12px',
        'xl':  '16px',
        '2xl': '20px',
      },
      boxShadow: {
        'xs':      '0 1px 2px rgba(0, 0, 0, 0.05)',
        'sm':      '0 2px 8px rgba(0, 0, 0, 0.06)',
        'md':      '0 4px 12px rgba(0, 0, 0, 0.08)',
        'lg':      '0 8px 24px rgba(0, 0, 0, 0.12)',
        'xl':      '0 12px 32px rgba(0, 0, 0, 0.15)',
        'primary': '0 4px 12px rgba(33, 76, 90, 0.28)',
        'accent':  '0 4px 12px rgba(255, 197, 38, 0.30)',
        'success': '0 6px 16px rgba(16, 185, 129, 0.30)',
      },
      spacing: {
        'xs':  '4px',
        'sm':  '8px',
        'md':  '16px',
        'lg':  '24px',
        'xl':  '32px',
        '2xl': '48px',
        '3xl': '64px',
      },
      transitionDuration: {
        'fast':     '100ms',
        'standard': '200ms',
        'slow':     '300ms',
      },
    },
  },
  plugins: [],
};
