import type { Metadata } from "next";
import { Source_Serif_4, Inter } from "next/font/google";
import "./globals.css";
import { Encabezado } from "@/components/Encabezado";
import { PieDePagina } from "@/components/PieDePagina";
import { AvisoNoOficial } from "@/components/AvisoNoOficial";

const display = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

const cuerpo = Inter({
  subsets: ["latin"],
  variable: "--font-cuerpo",
  weight: ["400", "500", "600"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://encuestas.willasayki.pe";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Encuestas Ciudadanas | WS Willasayki",
    template: "%s | Encuestas Ciudadanas — WS Willasayki",
  },
  description:
    "Encuestas ciudadanas independientes por departamento, provincia y distrito. Metodología transparente, verificación antifraude y fichas completas de candidatos. Un servicio de WS Willasayki.",
  openGraph: {
    type: "website",
    locale: "es_PE",
    siteName: "WS Willasayki — Encuestas Ciudadanas",
    title: "Encuestas Ciudadanas Independientes del Perú",
    description:
      "Participa en encuestas ciudadanas por distrito. Resultados en tiempo real, metodología transparente y fichas verificadas de candidatos.",
    images: [{ url: "/og/willasayki-encuestas-og.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Encuestas Ciudadanas Independientes del Perú",
    description: "Un servicio de WS Willasayki. Encuesta ciudadana, no oficial ni vinculante.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-PE" className={`${display.variable} ${cuerpo.variable}`}>
      <body className="font-cuerpo min-h-screen flex flex-col">
        <Encabezado />
        <AvisoNoOficial />
        <main className="flex-1">{children}</main>
        <PieDePagina />
      </body>
    </html>
  );
}
