"use client";

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter, usePathname } from 'next/navigation';
import { RootState } from '@/store';
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // ⚡ FIX: Bypassing cascading render warning using micro-task frame wrapper
  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(frameId);
  }, []);

  // Strict structural routing stream
  useEffect(() => {
    if (mounted && !loading) {
      if (!isAuthenticated && pathname !== '/login') {
        router.push('/login');
      } else if (isAuthenticated && pathname === '/login') {
        router.push('/');
      }
    }
  }, [isAuthenticated, loading, pathname, router, mounted]);

  // Loading indicator grid until client hydration finishes safely
  if (!mounted || loading) {
    return (
      <div className="min-h-screen w-full bg-zinc-50 flex flex-col items-center justify-center font-sans text-xs text-zinc-500">
        <div className="w-8 h-8 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin mb-4" />
        Verifying Security Session...
      </div>
    );
  }

  // Strictly isolate the public login track from app layout nodes
  if (pathname === '/login') {
    return <>{children}</>;
  }

  // Master authenticated layout tree context
 // Master authenticated layout tree context
  return (
    <div className="flex flex-col min-h-screen bg-zinc-50/50 text-zinc-900">
      {/* 🌟 FIX: shrink-0 lagane se Header kabhi upar collapse ya push nahi hoga */}
      <div className="shrink-0 w-full">
        <Header />
      </div>

      {/* flex-1 automatic bachi hui saari space scrollable vertical axis par handle karega */}
      <main className="flex-1 w-full">
        {children}
      </main>

      <div className="shrink-0 w-full">
        <Footer />
      </div>
    </div>
  );
}