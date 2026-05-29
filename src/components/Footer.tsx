"use client";

import { Activity } from "lucide-react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const LINKS = [
  { label: "Dashboard", href: "/" },
  { label: "New Intake", href: "/consultation/new" },
  { label: "Clinical Index", href: "#" },
];

export default function Footer() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Instrument+Serif&display=swap');
        .ayu-footer { font-family: 'DM Sans', sans-serif; }
        .ayu-footer-wordmark { font-family: 'Instrument Serif', serif; }
        .ayu-footer-link {
          position: relative;
          transition: color 0.18s;
        }
        .ayu-footer-link::after {
          content: '';
          position: absolute;
          left: 0; bottom: -2px;
          width: 100%; height: 1px;
          background: #10b981;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.24s cubic-bezier(0.22,1,0.36,1);
        }
        .ayu-footer-link:hover { color: #059669; }
        .ayu-footer-link:hover::after { transform: scaleX(1); }
        .status-pulse {
          width: 6px; height: 6px; border-radius: 50%;
          background: #10b981;
          animation: sp 2.8s ease-in-out infinite;
        }
        @keyframes sp {
          0%,100% { box-shadow: 0 0 0 2px rgba(16,185,129,0.18); }
          50%      { box-shadow: 0 0 0 5px rgba(16,185,129,0.07); }
        }
      `}</style>

      <footer
        ref={ref}
        className="ayu-footer w-full mt-auto relative overflow-hidden"
        style={{
          borderTop: "1px solid rgba(228,228,231,0.8)",
          background: "#fafafa",
        }}
      >
        {/* Top glow accent */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 h-px pointer-events-none"
          style={{
            width: "40%",
            background: "linear-gradient(90deg, transparent, rgba(16,185,129,0.45), transparent)",
          }}
        />

        <div className="relative w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-9">

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-7">

            {/* Brand */}
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, y: 14 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <div
                className="h-9 w-9 rounded-[10px] flex items-center justify-center shrink-0 relative overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, #0d1117 0%, #1a2332 100%)",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.16), inset 0 1px 0 rgba(255,255,255,0.07)",
                }}
              >
                <div
                  className="absolute inset-0 opacity-25"
                  style={{
                    background: "radial-gradient(circle at 70% 25%, rgba(16,185,129,0.7) 0%, transparent 60%)",
                  }}
                />
                <Activity className="h-[15px] w-[15px] text-white relative z-10" strokeWidth={2.2} />
              </div>

              <div>
                <p className="ayu-footer-wordmark text-[17px] text-zinc-900 leading-none">
                  AyuNidan
                </p>
                <p
                  className="text-[9px] font-bold tracking-[0.2em] uppercase mt-[3px]"
                  style={{ color: "#10b981" }}
                >
                  Clinical AI
                </p>
              </div>
            </motion.div>

            {/* Nav */}
            <motion.nav
              className="flex items-center gap-6"
              initial={{ opacity: 0, y: 14 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              {LINKS.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  className="ayu-footer-link text-[12.5px] font-semibold text-zinc-500"
                >
                  {l.label}
                </Link>
              ))}
            </motion.nav>

            {/* Status */}
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0, y: 14 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="status-pulse" />
              <span className="text-[10px] font-semibold tracking-[0.12em] uppercase text-zinc-400">
                Provider Node Active
              </span>
            </motion.div>

          </div>

          {/* Divider */}
          <motion.div
            className="my-6 h-px"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(16,185,129,0.18) 30%, rgba(16,185,129,0.18) 70%, transparent)",
            }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={inView ? { scaleX: 1, opacity: 1 } : {}}
            transition={{ duration: 0.65, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
          />

          {/* Copyright */}
          <motion.p
            className="text-[11px] font-medium text-zinc-400 text-center"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.32 }}
          >
            © 2026 AyuNidan — All rights reserved.
          </motion.p>

        </div>
      </footer>
    </>
  );
}