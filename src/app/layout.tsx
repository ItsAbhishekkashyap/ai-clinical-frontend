import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import StoreProvider from "@/store/StoreProvider";
import { Toaster } from "@/components/ui/sonner";
import RouteGuard from "@/components/RouteGuard"; // Our newly split component

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AyuNidan | Smart Healthcare",
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
          <RouteGuard>
            {children}
          </RouteGuard>
          <Toaster position="top-right" theme="light" closeButton richColors />
        </StoreProvider>
      </body>
    </html>
  );
}