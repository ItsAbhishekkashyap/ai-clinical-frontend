"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Shield, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Header() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Dashboard" },
    { href: "/consultation/new", label: "New Intake" }
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/80 bg-white/80 backdrop-blur-md">
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-9 w-9 rounded-xl bg-zinc-950 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
            <Activity className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black tracking-tight text-zinc-990 leading-none">PANSCIENCE</span>
            <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase mt-0.5">Clinical AI</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link key={link.href} href={link.href}>
                <span className={`px-4 py-2 rounded-xl text-xs font-bold tracking-tight transition-all ${
                  isActive 
                    ? "bg-zinc-50 text-zinc-900 shadow-sm border border-zinc-200/40" 
                    : "text-zinc-500 hover:text-zinc-900"
                }`}>
                  {link.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Badge variant="outline" className="bg-zinc-50 border-zinc-200 text-zinc-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 rounded-lg">
            <Shield className="h-3 w-3 text-zinc-400" />
            Provider Node
          </Badge>
        </div>

        <div className="flex md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-zinc-200">
                <Menu className="h-4 w-4 text-zinc-700" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64 bg-white border-l border-zinc-200 pt-12">
              <div className="flex flex-col gap-3">
                {links.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <Button variant={pathname === link.href ? "default" : "ghost"} className="w-full justify-start h-11 rounded-xl font-bold text-xs tracking-tight">
                      {link.label}
                    </Button>
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}