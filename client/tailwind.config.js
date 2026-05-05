/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primarios - Azul profundo (confianza, profesionalismo)
        primary: {
          50:  '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#0369A1', // Brand principal
          800: '#075985',
          900: '#0C4A6E',
        },
        // Secundario - Naranja/Dorado (energía, acción)
        accent: {
          50:  '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B', // Accent principal
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
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
        // Sol / Amarillo sutil para acentos cálidos
        sun: {
          50:  '#FFFEF6',
          100: '#FFF9E6',
          200: '#FEF3C7',
          300: '#FDE68A',
          400: '#FCD34D',
          500: '#F7C948',
          600: '#E6B12B',
          700: '#C98F06',
          800: '#A66F04',
          900: '#7A4E03',
        },
      },
      fontFamily: {
        // Títulos modernos
        display: ['"Poppins"', 'system-ui', 'sans-serif'],
        // Body profesional
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        // Mono para precios
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        // Tamaños consistentes con escala moderna
        'xs': ['12px', { lineHeight: '16px', fontWeight: '400' }],
        'sm': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'base': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'lg': ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'xl': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        '2xl': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        '3xl': ['30px', { lineHeight: '36px', fontWeight: '600' }],
        '4xl': ['36px', { lineHeight: '44px', fontWeight: '700' }],
        '5xl': ['48px', { lineHeight: '56px', fontWeight: '700' }],
      },
      borderRadius: {
        'xs': '4px',
        'sm': '8px',
        'md': '10px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
      },
      boxShadow: {
        'xs': '0 1px 2px rgba(0, 0, 0, 0.05)',
        'sm': '0 2px 8px rgba(0, 0, 0, 0.06)',
        'md': '0 4px 12px rgba(0, 0, 0, 0.08)',
        'lg': '0 8px 24px rgba(0, 0, 0, 0.12)',
        'xl': '0 12px 32px rgba(0, 0, 0, 0.15)',
        'primary': '0 4px 12px rgba(3, 105, 161, 0.25)',
        'accent': '0 4px 12px rgba(245, 158, 11, 0.25)',
        'success': '0 6px 16px rgba(37, 211, 102, 0.3)',
      },
      spacing: {
        // 8px grid base
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        '2xl': '48px',
        '3xl': '64px',
      },
      transitionDuration: {
        'fast': '100ms',
        'standard': '200ms',
        'slow': '300ms',
      },
    },
  },
  plugins: [],
};

