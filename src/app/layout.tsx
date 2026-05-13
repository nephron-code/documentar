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
    default: 'NefroDoc — Prontuário de Nefrologia',
    template: '%s — NefroDoc',
  },
  description:
    'Prontuário eletrônico para Nefrologia ambulatorial. Gerencie pacientes, evoluções clínicas e exames com diretrizes KDIGO integradas.',
  openGraph: {
    title: 'NefroDoc — Prontuário de Nefrologia',
    description:
      'Prontuário eletrônico para Nefrologia ambulatorial. Gerencie pacientes, evoluções clínicas e exames com diretrizes KDIGO integradas.',
    siteName: 'NefroDoc',
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'NefroDoc — Prontuário de Nefrologia',
    description:
      'Prontuário eletrônico para Nefrologia ambulatorial. Gerencie pacientes, evoluções clínicas e exames com diretrizes KDIGO integradas.',
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
