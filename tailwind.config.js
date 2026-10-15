/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta "Pampa": inspirada nos campos e no chimarrao do RS.
        ink: {
          DEFAULT: '#1F2A24',
          soft: '#3A473F',
        },
        cream: {
          DEFAULT: '#FBFAF6',
          deep: '#F3F1E9',
        },
        pampa: {
          50: '#EEF5F1',
          100: '#D7E9DD',
          200: '#AFD3BB',
          300: '#83B896',
          400: '#5A9C75',
          500: '#2F7A4D',
          600: '#1B5E5A',
          700: '#164A48',
          800: '#123B39',
          900: '#0E2E2C',
        },
        chimarrao: {
          50: '#FBEEE4',
          100: '#F3D3B8',
          200: '#E6AD7C',
          300: '#D98C4F',
          400: '#C9642B',
          500: '#AD501F',
          600: '#8C3F19',
        },
        alerta: {
          verificado: '#2F7A4D',
          revisar: '#B8860B',
          desatualizado: '#B23B2E',
        },
      },
      fontFamily: {
        sans: ['"Atkinson Hyperlegible"', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        base: ['1.125rem', { lineHeight: '1.7' }],
        lg: ['1.25rem', { lineHeight: '1.7' }],
        xl: ['1.5rem', { lineHeight: '1.6' }],
        '2xl': ['1.875rem', { lineHeight: '1.5' }],
        '3xl': ['2.25rem', { lineHeight: '1.35' }],
        '4xl': ['2.75rem', { lineHeight: '1.25' }],
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      maxWidth: {
        prose2: '68ch',
      },
    },
  },
  plugins: [],
}
