import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AgendaYa - Gestion de Citas y Servicios",
  description: "Plataforma SaaS multi-tenant para gestion de citas y servicios. Administra especialistas, servicios y reservas.",
  keywords: ["AgendaYa", "citas", "reservaciones", "negocios", "servicios", "especialistas"],
  authors: [{ name: "AgendaYa Team" }],
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📅</text></svg>",
  },
  openGraph: {
    title: "AgendaYa",
    description: "Plataforma SaaS para gestion de citas y servicios",
    siteName: "AgendaYa",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AgendaYa",
    description: "Plataforma SaaS para gestion de citas y servicios",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
