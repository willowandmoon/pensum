import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";
import { AppProvider } from "@/lib/AppContext";
import "./globals.css";

// Estilo "scrapbook": Fredoka para títulos (redondeada, juguetona),
// Nunito para el cuerpo (legible, cálida).
const fredoka = Fredoka({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const nunito = Nunito({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Mi Pensum · Ingeniería Informática",
  description: "Pensum interactivo para llevar tu avance académico",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${fredoka.variable} ${nunito.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
