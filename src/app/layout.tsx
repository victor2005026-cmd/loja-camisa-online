import type { Metadata } from "next";
import { Geist, Geist_Mono, Anton } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { CartBar } from "@/components/CartBar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const anton = Anton({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const description = "Torcedor, retrô, player ou treino — direto pro seu guarda-roupa. Pagamento via Pix.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "LV Sports",
  description,
  openGraph: {
    title: "LV Sports",
    description,
    siteName: "LV Sports",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LV Sports",
    description,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} ${anton.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-ink text-paper">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <CartBar />
        <WhatsAppButton />
      </body>
    </html>
  );
}
