import type { Config } from "tailwindcss";

// ------------------------------------------------------------------
// Tokens de marca — WS WILLASAYKI · Encuestas Ciudadanas
// Paleta: institucional, editorial, sobria. Nada de rojo/blanco
// genérico "bandera" ni de acentos naranja/terracota por defecto.
// ------------------------------------------------------------------
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        tinta: "#12181F",       // negro-tinta casi puro, para texto y fondos oscuros
        papel: "#FBFAF7",       // blanco cálido tipo papel periódico, no #FFFFFF puro
        pizarra: "#2B3542",     // gris azulado oscuro — secciones institucionales
        andes: "#365C4A",       // verde profundo, color de acento principal (confianza, territorio)
        chuncho: "#A8432E",     // terracota rojizo apagado, acento secundario/alerta editorial
        oro: "#B98A2E",         // ocre dorado — para "abierta" / destacado puntual
        linea: "#DAD4C7",       // líneas y bordes sutiles sobre papel
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        cuerpo: ["var(--font-cuerpo)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        lectura: "72ch",
      },
    },
  },
  plugins: [],
};

export default config;
