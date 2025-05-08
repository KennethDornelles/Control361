/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Definir as cores do projeto conforme o Figma
        primary: '#0066FF', // Exemplo baseado no azul predominante
        // Adicionar outras cores conforme necessário
      },
    },
  },
  plugins: [],
}