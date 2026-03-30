import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BookingModalProvider } from "@/context/BookingModalContext";

const poppins = Poppins({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Experts Portes de Garage — Réparation rapide, service local",
  description:
    "Service local de réparation de portes de garage — Granby & régions. Urgences 24/7, installation, entretien. Appelez le 450-558-5788.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${poppins.variable} antialiased`}>
      <body className="flex flex-col min-h-screen">
        <BookingModalProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </BookingModalProvider>
      </body>
    </html>
  );
}
