import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
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
  title: {
    default: 'NefroDoc — Copiloto de Consulta em Nefrologia',
    template: '%s — NefroDoc',
  },
  description:
    'Copiloto determinístico para consultas de Nefrologia ambulatorial. Aplica diretrizes KDIGO, gera notas revisáveis e agiliza a documentação clínica.',
  openGraph: {
    title: 'NefroDoc — Copiloto de Consulta em Nefrologia',
    description:
      'Copiloto determinístico para consultas de Nefrologia ambulatorial. Aplica diretrizes KDIGO, gera notas revisáveis e agiliza a documentação clínica.',
    siteName: 'NefroDoc',
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'NefroDoc — Copiloto de Consulta em Nefrologia',
    description:
      'Copiloto determinístico para consultas de Nefrologia ambulatorial. Aplica diretrizes KDIGO, gera notas revisáveis e agiliza a documentação clínica.',
  },
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
