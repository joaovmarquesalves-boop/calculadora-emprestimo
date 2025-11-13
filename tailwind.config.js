const config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta de marca — azul predominante e verde secundário.
        primary: {
          DEFAULT: '#3e6bc8', // Azul principal (predominante)
          50: '#f3f6ff',
          100: '#e6edff',
          200: '#caddff',
          300: '#a9c0ff',
          400: '#7fa2ff',
          500: '#5f86f0',
          600: '#3e6bc8',
          700: '#3356a5',
          800: '#274183',
          900: '#1b2c61',
        },
        secondary: {
          DEFAULT: '#79c557', // Verde secundário
          50: '#f4fbef',
          100: '#e9f7df',
          200: '#cfeebf',
          300: '#b6e59e',
          400: '#98dd76',
          500: '#79c557',
          600: '#63a64a',
          700: '#4e8439',
          800: '#396428',
          900: '#254216',
        },
        // Branco explícito (já existente no Tailwind, mas mantido para clareza semântica)
        white: '#FFFFFF',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        highlight: '0 25px 50px -12px rgba(62, 107, 200, 0.25)',
      },
    },
  },
  plugins: [],
};

export default config;
