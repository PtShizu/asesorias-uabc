import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  applicationName: "Cima Asesorías",
  title: "Cima Asesorías | Apoyo Académico entre Cimarrones UABC",
  description: "Una plataforma no oficial para encontrar y solicitar asesorías académicas en la UABC. Cima Asesorías conecta a cimarrones para potenciar su éxito académico.",
  keywords: ["Cima Asesorías", "UABC", "Cimarrones", "Asesorías Académicas", "Tijuana", "Cima Asesorias"],
  verification: {
    google: "mAp2-MgfaTvwQ0cEU6fq0qk6ylWDON8XTxvrMZ6BG7A",
  },
  openGraph: {
    title: "Cima Asesorías | Apoyo Académico entre Cimarrones UABC",
    description: "Una plataforma no oficial para encontrar y solicitar asesorías académicas en la UABC. Cima Asesorías conecta a cimarrones para potenciar su éxito académico.",
    siteName: "Cima Asesorías",
    locale: "es_MX",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 min-h-screen`}
      >
        <Toaster position="top-center" richColors />
        <Navbar />
        {children}
      </body>
    </html>
  );
}

