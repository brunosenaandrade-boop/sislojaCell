import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://cellflow.com.br"),
  title: {
    default: "CellFlow — Sistema para Assistência Técnica e Loja de Celular",
    template: "%s | CellFlow",
  },
  description:
    "Sistema completo de gestão para lojas de celular e assistência técnica. Ordens de serviço, PDV, estoque, caixa, relatórios e muito mais. 7 dias grátis.",
  keywords: [
    "sistema assistência técnica",
    "sistema loja celular",
    "ordem de serviço celular",
    "PDV assistência técnica",
    "gestão loja celular",
    "controle estoque celular",
    "sistema OS celular",
    "software assistência técnica",
    "gestão assistência técnica",
    "sistema para loja de celular",
    "CellFlow",
  ],
  authors: [{ name: "CellFlow" }],
  creator: "CellFlow",
  publisher: "CellFlow",
  alternates: {
    canonical: "https://cellflow.com.br",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://cellflow.com.br",
    siteName: "CellFlow",
    title: "CellFlow — Sistema para Assistência Técnica e Loja de Celular",
    description:
      "Gerencie ordens de serviço, vendas, estoque, caixa e clientes em um só lugar. 7 dias grátis para testar.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CellFlow — Sistema para Assistência Técnica",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CellFlow — Sistema para Assistência Técnica e Loja de Celular",
    description:
      "Gerencie ordens de serviço, vendas, estoque, caixa e clientes em um só lugar. 7 dias grátis.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/icons/icon.svg" }],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CellFlow",
  },
};

export const viewport: Viewport = {
  themeColor: "#3b82f6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
