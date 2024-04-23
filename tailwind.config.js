/** @type {import('tailwindcss').Config} */

export default {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      backgroundImage: theme => ({
        'custom-background': "url('src/assets/Background.png')",
      }),
      keyframes: {
        slideDown: {
          '0%': { opacity: '100' },
          '100%': { opacity: '00' },
        },
      },
      animation: {
        'slide-down': 'slideDown 5s linear',
      },
      fontFamily: {
        Inter: ['inter'],
        italiana: ['Italiana'],
      },
      colors: {
        champagne: {
          50: '#faf8f6',
          100: '#efebe3',
          200: '#e8e1d6',
          300: '#ddd3c3',
          400: '#d6cab7',
          500: '#ccbda5',
          600: '#baac96',
          700: '#918675',
          800: '#70685b',
          900: '#564f45',
        },
        Gatsby: {
          50: '#f9f4ee',
          100: '#ebdeca',
          200: '#e2cdb0',
          300: '#d5b78c',
          400: '#cda976',
          500: '#c09354',
          600: '#af864c',
          700: '#88683c',
          800: '#6a512e',
          900: '#513e23',
        },
        pristine: {
          50: '#faf7f6',
          100: '#eee7e2',
          200: '#e6dbd5',
          300: '#dbcac1',
          400: '#d4c0b5',
          500: '#c9b0a3',
          600: '#b7a094',
          700: '#8f7d74',
          800: '#6f615a',
          900: '#544a44',
        },
        parlor: {
          50: '#eaf0f1',
          100: '#bfcfd2',
          200: '#9fb8bd',
          300: '#74989f',
          400: '#59848c',
          500: '#2f656f',
          600: '#2b5c65',
          700: '#21484f',
          800: '#1a383d',
          900: '#142a2f',
        },
        deco: {
          50: '#ebebed',
          100: '#bfc2c8',
          200: '#a1a4ad',
          300: '#767b87',
          400: '#5b6170',
          500: '#323a4c',
          600: '#2e3545',
          700: '#242936',
          800: '#1c202a',
          900: '#151820',
        },
      },
    },
  },
  plugins: [],
}
