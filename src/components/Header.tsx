"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/store/slices/authSlice";
import { RootState } from "@/store";
import { Activity, Shield, Menu, LogOut, LayoutDashboard, PlusCircle, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";

export default function Header() {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const { scrollY } = useScroll();
  const lastScrollY = useRef(0);

  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Hide header on scroll down, show on scroll up
  useMotionValueEvent(scrollY, "change", (latest) => {
    const diff = latest - lastScrollY.current;
    if (latest > 80 && diff > 0) setHidden(true);
    else setHidden(false);
    setScrolled(latest > 20);
    lastScrollY.current = latest;
  });

  const links = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/consultation/new", label: "New Intake", icon: PlusCircle },
  ];

  const handleLogoutAction = () => {
    dispatch(logout());
    setIsOpen(false);
    window.location.href = "/login";
  };

  const getInitials = (nameString?: string) => {
    if (!nameString) return "U";
    return nameString.trim().split(" ")[0].charAt(0).toUpperCase();
  };

  return (
    <>
      {/* Inject font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&family=Instrument+Serif:ital@0;1&display=swap');

        .ayunidan-header * {
          font-family: 'DM Sans', sans-serif;
        }
        .header-logo-wordmark {
          font-family: 'Instrument Serif', serif;
        }
        .nav-pill-active::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 12px;
          background: linear-gradient(135deg, #f0fdf9 0%, #e6f7f4 100%);
          z-index: -1;
        }
        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 0 2px rgba(16,185,129,0.2);
          animation: pulse-dot 2.5s ease-in-out infinite;
        }
        @keyframes pulse-dot {
          0%, 100% { box-shadow: 0 0 0 2px rgba(16,185,129,0.2); }
          50% { box-shadow: 0 0 0 5px rgba(16,185,129,0.08); }
        }
        .avatar-ring {
          background: conic-gradient(from 180deg, #10b981, #0ea5e9, #6366f1, #10b981);
          padding: 1.5px;
          border-radius: 12px;
        }
        .mobile-sheet-link {
          position: relative;
          overflow: hidden;
        }
        .mobile-sheet-link::after {
          content: '';
          position: absolute;
          left: 0; bottom: 0;
          width: 100%; height: 1px;
          background: linear-gradient(90deg, #10b981, transparent);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s ease;
        }
        .mobile-sheet-link:hover::after {
          transform: scaleX(1);
        }
      `}</style>

      <motion.header
        className="ayunidan-header sticky top-0 z-50 w-full max-w-full overflow-x-hidden"
        animate={{
          y: hidden ? -100 : 0,
          backdropFilter: scrolled ? "blur(20px) saturate(180%)" : "blur(0px)",
        }}
        transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{
          backgroundColor: scrolled ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,1)",
          borderBottom: scrolled
            ? "1px solid rgba(16,185,129,0.12)"
            : "1px solid rgba(228,228,231,0.8)",
          boxShadow: scrolled
            ? "0 4px 24px -4px rgba(0,0,0,0.06), 0 0 0 1px rgba(16,185,129,0.06)"
            : "none",
        }}
      >
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 h-[60px] flex items-center justify-between gap-4">

          {/* ── Logo ── */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <motion.div
              className="relative h-9 w-9 rounded-[11px] flex items-center justify-center overflow-hidden shrink-0"
              style={{
                background: "linear-gradient(135deg, #0d1117 0%, #1a2332 100%)",
                boxShadow: "0 2px 12px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.08)",
              }}
              whileHover={{ scale: 1.07, rotate: -4 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              {/* Subtle green glow inside logo box */}
              <div
                className="absolute inset-0 rounded-[11px] opacity-30"
                style={{
                  background: "radial-gradient(circle at 70% 30%, rgba(16,185,129,0.5) 0%, transparent 65%)",
                }}
              />
              <Activity className="h-4 w-4 text-white relative z-10" strokeWidth={2.2} />
            </motion.div>

            <div className="flex flex-col leading-none">
              <motion.span
                className="header-logo-wordmark text-[17px] text-zinc-900 leading-none tracking-[-0.01em]"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                AyuNidan
              </motion.span>
              <motion.span
                className="text-[9.5px] font-semibold tracking-[0.18em] uppercase mt-[3px]"
                style={{ color: "#10b981" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.15 }}
              >
                Clinical AI
              </motion.span>
            </div>
          </Link>

          {/* ── Desktop Nav ── */}
          <nav className="hidden md:flex items-center gap-1 bg-zinc-50/80 border border-zinc-100 rounded-[14px] px-1.5 py-1.5">
            {links.map((link, i) => {
              const isActive = pathname === link.href;
              const LinkIcon = link.icon;
              return (
                <Link key={link.href} href={link.href}>
                  <motion.span
                    className={`relative flex items-center gap-2 px-4 py-[7px] rounded-[10px] text-[12.5px] font-semibold tracking-[-0.01em] transition-colors cursor-pointer select-none ${
                      isActive
                        ? "text-zinc-900"
                        : "text-zinc-500 hover:text-zinc-700"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="nav-active-pill"
                        className="absolute inset-0 rounded-[10px]"
                        style={{
                          background: "white",
                          boxShadow: "0 1px 6px rgba(0,0,0,0.08), 0 0 0 1px rgba(16,185,129,0.14)",
                        }}
                        transition={{ type: "spring", stiffness: 380, damping: 28 }}
                      />
                    )}
                    <LinkIcon
                      className="h-3.5 w-3.5 relative z-10 shrink-0"
                      style={{ color: isActive ? "#10b981" : undefined }}
                    />
                    <span className="relative z-10">{link.label}</span>
                  </motion.span>
                </Link>
              );
            })}
          </nav>

          {/* ── Desktop Right Side ── */}
          <div className="hidden md:flex items-center gap-3 shrink-0">

            {/* Provider status badge */}
            <motion.div
              className="flex items-center gap-2 px-3 py-1.5 rounded-[9px] border border-zinc-100 bg-white"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="status-dot" />
              <span className="text-[10.5px] font-semibold tracking-[0.1em] uppercase text-zinc-500">
                Provider Node
              </span>
              <Shield className="h-3 w-3 text-emerald-400" />
            </motion.div>

            {/* Divider */}
            <div className="h-5 w-px bg-zinc-200" />

            {/* Auth area */}
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.button
                    className="flex items-center gap-2 px-2 py-1.5 rounded-[11px] border border-zinc-100 bg-white hover:bg-zinc-50 hover:border-zinc-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                  >
                    <div className="avatar-ring shrink-0">
                      <Avatar className="h-[26px] w-[26px] rounded-[9px]">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback
                          className="rounded-[9px] text-[11px] font-bold text-white"
                          style={{ background: "linear-gradient(135deg, #0d1117, #1a2332)" }}
                        >
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-[11.5px] font-bold text-zinc-800 leading-none">
                        {user.name?.split(" ")[0]}
                      </span>

                    </div>
                    <ChevronDown className="h-3 w-3 text-zinc-400 ml-0.5" />
                  </motion.button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-60 bg-white/95 backdrop-blur-xl border border-zinc-100 rounded-[14px] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.04)] p-1.5"
                  align="end"
                  forceMount
                >
                  <DropdownMenuLabel className="font-normal px-3 py-2">
                    <div className="flex items-center gap-2.5">
                      <div className="avatar-ring shrink-0">
                        <Avatar className="h-8 w-8 rounded-[10px]">
                          <AvatarFallback
                            className="rounded-[10px] text-xs font-bold text-white"
                            style={{ background: "linear-gradient(135deg, #0d1117, #1a2332)" }}
                          >
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div>
                        <p className="text-[12.5px] font-bold text-zinc-900">{user.name}</p>
                        <p className="text-[10px] text-zinc-400 truncate max-w-[140px]">{user.email}</p>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-zinc-100 my-1" />
                  <DropdownMenuItem
                    onClick={handleLogoutAction}
                    className="group flex items-center gap-2.5 text-[12px] font-semibold cursor-pointer rounded-[10px] mx-0 px-3 py-2.5 text-zinc-600 hover:text-red-600 hover:bg-red-50 focus:bg-red-50 focus:text-red-600 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    className="text-white font-semibold text-[12px] px-5 h-9 rounded-[10px] border-0 shadow-[0_2px_10px_rgba(16,185,129,0.3)]"
                    style={{
                      background: "linear-gradient(135deg, #059669 0%, #0d9488 100%)",
                    }}
                  >
                    Sign In
                  </Button>
                </motion.div>
              </Link>
            )}
          </div>

          {/* ── Mobile Right ── */}
          <div className="flex md:hidden items-center gap-2 shrink-0">
            {isAuthenticated && user && (
              <div className="avatar-ring">
                <Avatar className="h-8 w-8 rounded-[10px]">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback
                    className="rounded-[10px] text-xs font-bold text-white"
                    style={{ background: "linear-gradient(135deg, #0d1117, #1a2332)" }}
                  >
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <motion.button
                  className="h-9 w-9 rounded-[10px] border border-zinc-200 bg-white flex items-center justify-center"
                  whileHover={{ scale: 1.05, backgroundColor: "#f4f4f5" }}
                  whileTap={{ scale: 0.93 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                >
                  <Menu className="h-4 w-4 text-zinc-700" />
                </motion.button>
              </SheetTrigger>

              <SheetContent
                side="right"
                className="w-[300px] max-w-[88vw] border-l border-zinc-100 p-0 flex flex-col"
                style={{ background: "rgba(255,255,255,0.98)", backdropFilter: "blur(20px)" }}
              >
                {/* Sheet Header */}
                <div
                  className="px-6 pt-8 pb-6 border-b border-zinc-100"
                  style={{
                    background: "linear-gradient(180deg, rgba(16,185,129,0.04) 0%, transparent 100%)",
                  }}
                >
                  <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-[11px] flex items-center justify-center shrink-0"
                      style={{
                        background: "linear-gradient(135deg, #0d1117 0%, #1a2332 100%)",
                        boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
                      }}
                    >
                      <Activity className="h-4.5 w-4.5 text-white" strokeWidth={2.2} />
                    </div>
                    <div>
                      <p
                        className="header-logo-wordmark text-[18px] text-zinc-900 leading-none"
                      >
                        AyuNidan
                      </p>
                      <p
                        className="text-[9.5px] font-semibold tracking-[0.18em] uppercase mt-1"
                        style={{ color: "#10b981" }}
                      >
                        Clinical AI
                      </p>
                    </div>
                  </div>

                  {user && (
                    <div
                      className="mt-5 flex items-center gap-3 px-3.5 py-3 rounded-[12px] border border-zinc-100"
                      style={{ background: "rgba(16,185,129,0.03)" }}
                    >
                      <div className="avatar-ring shrink-0">
                        <Avatar className="h-9 w-9 rounded-[10px]">
                          <AvatarFallback
                            className="rounded-[10px] text-sm font-bold text-white"
                            style={{ background: "linear-gradient(135deg, #0d1117, #1a2332)" }}
                          >
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-zinc-900 leading-none">{user.name}</p>
                        <p className="text-[10px] text-zinc-400 mt-1 truncate max-w-[170px]">{user.email}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Nav Links */}
                <div className="flex-1 px-4 py-5 space-y-1.5">
                  <p className="text-[9.5px] font-bold tracking-[0.18em] uppercase text-zinc-400 px-2 mb-3">
                    Navigation
                  </p>
                  {links.map((link, i) => {
                    const isActive = pathname === link.href;
                    const LinkIcon = link.icon;
                    return (
                      <motion.div
                        key={link.href}
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.07 + 0.1, ease: "easeOut" }}
                      >
                        <Link
                          href={link.href}
                          onClick={() => setIsOpen(false)}
                          className="block"
                        >
                          <motion.div
                            className={`mobile-sheet-link flex items-center gap-3 px-4 py-3 rounded-[12px] transition-colors ${
                              isActive
                                ? "text-zinc-900"
                                : "text-zinc-500 hover:text-zinc-800"
                            }`}
                            style={
                              isActive
                                ? {
                                    background: "white",
                                    boxShadow: "0 1px 6px rgba(0,0,0,0.06), 0 0 0 1px rgba(16,185,129,0.14)",
                                  }
                                : {}
                            }
                            whileTap={{ scale: 0.97 }}
                          >
                            <div
                              className={`h-7 w-7 rounded-[8px] flex items-center justify-center shrink-0 ${
                                isActive ? "" : "bg-zinc-100"
                              }`}
                              style={
                                isActive
                                  ? {
                                      background: "linear-gradient(135deg, #ecfdf5, #d1fae5)",
                                      boxShadow: "0 0 0 1px rgba(16,185,129,0.2)",
                                    }
                                  : {}
                              }
                            >
                              <LinkIcon
                                className="h-3.5 w-3.5"
                                style={{ color: isActive ? "#10b981" : undefined }}
                              />
                            </div>
                            <span className="text-[13px] font-semibold">{link.label}</span>
                            {isActive && (
                              <div className="ml-auto status-dot" />
                            )}
                          </motion.div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Sheet Footer */}
                <div className="px-4 pb-8 pt-4 border-t border-zinc-100 space-y-2">
                  <div className="flex items-center gap-2 px-3 py-2">
                    <div className="status-dot" />
                    <span className="text-[10px] font-semibold text-zinc-500 tracking-wide uppercase">
                      Provider Node — Active
                    </span>
                  </div>
                  {isAuthenticated ? (
                    <motion.button
                      onClick={handleLogoutAction}
                      className="w-full flex items-center justify-center gap-2 h-11 rounded-[12px] border border-red-100 bg-red-50 text-red-600 text-[12.5px] font-semibold hover:bg-red-100 transition-colors"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign out of account
                    </motion.button>
                  ) : (
                    <Link href="/login" onClick={() => setIsOpen(false)} className="block w-full">
                      <motion.div
                        className="w-full h-11 rounded-[12px] flex items-center justify-center text-white text-[12.5px] font-semibold shadow-[0_2px_10px_rgba(16,185,129,0.25)]"
                        style={{ background: "linear-gradient(135deg, #059669 0%, #0d9488 100%)" }}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        Sign In to AyuNidan
                      </motion.div>
                    </Link>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>

        </div>
      </motion.header>
    </>
  );
}