import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import StoreProvider from "@/store/StoreProvider";
import { Toaster } from "@/components/ui/sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PanScience | AI Clinical Dashboard",
  description: "Advanced AI-powered clinical intelligence and risk assessment platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full w-full m-0 p-0" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen h-full w-full bg-muted/30 flex flex-col m-0 p-0 overflow-x-hidden`} suppressHydrationWarning>
        <StoreProvider>
           <Header />
          <main className="flex-1 w-full p-0">
            {children}
          </main>
          <Footer />
          <Toaster position="top-right" closeButton richColors />

        </StoreProvider>
      </body>
    </html>
  );
}