import type { Metadata } from "next";
import { Quicksand, Mulish } from "next/font/google";
import { AppProvider } from "@/lib/AppContext";
import "./globals.css";

// Estilo "scrapbook": Quicksand para títulos (redondeada, suave y liviana),
// Mulish para el cuerpo (trazos finos, muy legible).
const quicksand = Quicksand({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const mulish = Mulish({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Mi Pensum",
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
      className={`${quicksand.variable} ${mulish.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
