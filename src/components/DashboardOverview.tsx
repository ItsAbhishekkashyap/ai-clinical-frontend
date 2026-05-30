"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView,  Variants } from "framer-motion";
import Link from "next/link";
import { getDashboardData, DashboardData } from "@/lib/api";
import {
  Plus, Activity, ShieldAlert, Zap, TrendingUp,
  ArrowUpRight, Brain, HeartPulse, Stethoscope,
  FileText, ChevronRight, Shield
} from "lucide-react";

/* ─────────────────────────────────────────────
   Floating ECG / Pulse SVG animation
───────────────────────────────────────────── */
function PulseLineAnim() {
  return (
    <svg viewBox="0 0 320 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
      <motion.path
        d="M0 30 L40 30 L55 10 L65 50 L80 5 L92 55 L105 30 L160 30 L175 30 L185 18 L195 42 L205 30 L320 30"
        stroke="url(#ecg-grad)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 2.2, ease: "easeInOut", delay: 0.4 }}
      />
      <defs>
        <linearGradient id="ecg-grad" x1="0" y1="0" x2="320" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
          <stop offset="30%" stopColor="#10b981" stopOpacity="1" />
          <stop offset="70%" stopColor="#0ea5e9" stopOpacity="1" />
          <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ─────────────────────────────────────────────
   Animated floating orb background
───────────────────────────────────────────── */
function HeroOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Large emerald orb top-right */}
      <motion.div
        className="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full opacity-[0.07]"
        style={{ background: "radial-gradient(circle, #10b981 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.08, 1], x: [0, 18, 0], y: [0, -12, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Teal orb left */}
      <motion.div
        className="absolute top-1/2 -left-24 w-[320px] h-[320px] rounded-full opacity-[0.06]"
        style={{ background: "radial-gradient(circle, #0d9488 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.12, 1], x: [0, 10, 0], y: [0, 20, 0] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      {/* Small sky orb center */}
      <motion.div
        className="absolute top-1/4 left-1/2 w-[200px] h-[200px] rounded-full opacity-[0.05]"
        style={{ background: "radial-gradient(circle, #0ea5e9 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.028]"
        style={{
          backgroundImage: "linear-gradient(rgba(16,185,129,1) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,1) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────
   Feature pill chip
───────────────────────────────────────────── */
const HERO_FEATURES = [
  { icon: Brain, label: "Zero-Shot AI Extraction" },
  { icon: Shield, label: "JWT Data Isolation" },
  { icon: HeartPulse, label: "Risk Stratification" },
  { icon: Zap, label: "RAG Clinical Index" },
];

/* ─────────────────────────────────────────────
   Stat card data
───────────────────────────────────────────── */
const ABOUT_CARDS = [
  {
    icon: FileText,
    title: "Multimodal Ingestion",
    desc: "Upload PDFs, type narratives, or paste voice transcripts. The engine parses everything into clean JSON automatically.",
    accent: "#10b981",
  },
  {
    icon: Brain,
    title: "AI Entity Extraction",
    desc: "Gemini 2.5 powered zero-shot extraction of symptoms, medications, and biomarkers — with Zod schema validation.",
    accent: "#0ea5e9",
  },
  {
    icon: ShieldAlert,
    title: "3-Tier Risk Engine",
    desc: "Deterministic scoring classifies every case into High, Medium, or Low risk in real-time for instant triage prioritisation.",
    accent: "#f59e0b",
  },
  {
    icon: Stethoscope,
    title: "RAG Medical Index",
    desc: "Native vector lookup pipeline connected to a centralized medical knowledge base for instant clinical context retrieval.",
    accent: "#8b5cf6",
  },
];

/* ─────────────────────────────────────────────
   Animated number counter
───────────────────────────────────────────── */
function CountUp({ to, duration = 1.4 }: { to: number; duration?: number }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / (duration * 1000), 1);
      setVal(Math.floor(progress * to));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, to, duration]);
  return <span ref={ref}>{val}</span>;
}

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */
export default function DashboardOverview() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const heroRef = useRef<HTMLElement>(null);
 const statsRef = useRef(null);
const statsInView = useInView(statsRef, { once: true, amount: 0.1 });
  const heroY = 0;
const heroOpacity = 1;


  useEffect(() => {
    async function fetchMetrics() {
      const dashboardMetrics = await getDashboardData();
      setData(dashboardMetrics ?? {
        total: 11,
        distribution: [
          { riskLevel: "high", count: 6, averageScore: 82.5 },
          { riskLevel: "medium", count: 4, averageScore: 54.2 },
          { riskLevel: "low", count: 1, averageScore: 18.0 },
        ],
      });
      setLoading(false);
    }
    fetchMetrics();
  }, []);

  const getRisk = (level: string) => {
    const fallback = { count: 0, averageScore: 0 };
    if (!data) return fallback;
    return data.distribution.find(d => d.riskLevel.toLowerCase() === level.toLowerCase()) || fallback;
  };

  const highRisk = getRisk("high");
  const mediumRisk = getRisk("medium");
  const lowRisk = getRisk("low");

  const fadeUp = (delay = 0): Variants => ({
    hidden: { opacity: 0, y: 28 },
    show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1], delay } },
  });

  if (loading) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
            className="h-6 w-6 border-2 border-zinc-900 border-t-transparent rounded-full"
          />
          <motion.p
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 1.8 }}
            className="text-[11px] font-bold tracking-[0.2em] uppercase text-zinc-600"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Loading telemetry…
          </motion.p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=Instrument+Serif:ital@0;1&family=DM+Mono:wght@400;500&display=swap');
        .ayu-dash { font-family: 'DM Sans', sans-serif; }
        .ayu-serif { font-family: 'Instrument Serif', serif; }
        .ayu-mono  { font-family: 'DM Mono', monospace; }

        .hero-word-em { font-style: italic; color: #10b981; }

        .feature-chip {
          transition: all 0.22s cubic-bezier(0.22,1,0.36,1);
        }
        .feature-chip:hover {
          background: white;
          border-color: rgba(16,185,129,0.35);
          box-shadow: 0 4px 14px rgba(16,185,129,0.1);
          transform: translateY(-2px);
        }

        .about-card {
          transition: all 0.28s cubic-bezier(0.22,1,0.36,1);
        }
        .about-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px -12px rgba(0,0,0,0.1);
        }

        .risk-bar-track { background: #f4f4f5; border-radius: 999px; overflow: hidden; }

        .stat-card-dark {
          background: linear-gradient(145deg, #0d1117 0%, #111827 60%, #0f1923 100%);
          box-shadow: 0 20px 60px -12px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.07);
        }

        .glow-btn {
          background: linear-gradient(135deg, #059669 0%, #0d9488 100%);
          box-shadow: 0 4px 20px rgba(16,185,129,0.3);
          transition: all 0.22s cubic-bezier(0.22,1,0.36,1);
        }
        .glow-btn:hover {
          box-shadow: 0 6px 28px rgba(16,185,129,0.42);
          transform: translateY(-1px);
        }

        .rag-card {
          background: linear-gradient(135deg, rgba(16,185,129,0.04) 0%, rgba(14,165,233,0.04) 100%);
          transition: all 0.22s cubic-bezier(0.22,1,0.36,1);
        }
        .rag-card:hover {
          background: linear-gradient(135deg, rgba(16,185,129,0.07) 0%, rgba(14,165,233,0.07) 100%);
        }

        .section-label {
          font-family: 'DM Mono', monospace;
          font-size: 9.5px;
          font-weight: 500;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #a1a1aa;
        }

        @keyframes ecg-scan {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
        .ecg-scan-line {
          animation: ecg-scan 3s ease-in-out infinite;
        }

        @keyframes float-y {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-8px); }
        }
        .float-icon { animation: float-y 4s ease-in-out infinite; }
      `}</style>

      <div className="ayu-dash space-y-0 max-w-full overflow-hidden">

        {/* ════════════════════════════════════════
            HERO SECTION
        ════════════════════════════════════════ */}
        <section
          
          className="relative min-h-[88vh] flex flex-col items-center justify-center text-center px-4 sm:px-8 py-24 overflow-hidden"
          style={{ background: "linear-gradient(180deg, #ffffff 0%, #f7faf9 60%, #f4f4f5 100%)" }}
        >
          <HeroOrbs />

          <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 flex flex-col items-center gap-6 max-w-4xl mx-auto">

            {/* Status pill */}
            <motion.div
              variants={fadeUp(0)}
              initial="hidden"
              animate="show"
              className="flex items-center gap-2.5 px-4 py-2 rounded-full border border-zinc-200 bg-white/80 backdrop-blur-md shadow-sm"
            >
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="section-label text-zinc-500">Clinical Processing Grid — Online</span>
            </motion.div>

            {/* Hero headline */}
            <motion.h1
              variants={fadeUp(0.08)}
              initial="hidden"
              animate="show"
              className="ayu-serif text-5xl sm:text-6xl md:text-7xl lg:text-[82px] text-zinc-900 leading-[1.04] tracking-[-0.02em]"
            >
              Clinical Intelligence,{" "}
              <span className="hero-word-em">Reimagined</span>
              <br />
              for the Modern{" "}
              <span
                className="relative inline-block"
                style={{
                  background: "linear-gradient(135deg, #059669, #0d9488)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Physician
              </span>
            </motion.h1>

            {/* Sub */}
            <motion.p
              variants={fadeUp(0.16)}
              initial="hidden"
              animate="show"
              className="text-[15px] sm:text-[17px] font-medium text-zinc-500 leading-relaxed max-w-[560px]"
            >
              AyuNidan bridges chaotic clinical narratives — PDFs, voice notes, raw text — into
              structured, actionable medical telemetry powered by Gemini 2.5.
            </motion.p>

            {/* Feature chips */}
            <motion.div
              variants={fadeUp(0.22)}
              initial="hidden"
              animate="show"
              className="flex flex-wrap items-center justify-center gap-2"
            >
              {HERO_FEATURES.map(({ icon: Icon, label }, i) => (
                <motion.div
                  key={label}
                  className="feature-chip flex items-center gap-2 px-3.5 py-2 rounded-[10px] border border-zinc-200 bg-zinc-50/80 cursor-default"
                  initial={{ opacity: 0, scale: 0.88 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Icon className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span className="text-[11.5px] font-semibold text-zinc-600">{label}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA buttons */}
            <motion.div
              variants={fadeUp(0.3)}
              initial="hidden"
              animate="show"
              className="flex items-center gap-3 mt-2"
            >
              <Link href="/consultation/new">
                <motion.button
                  className="glow-btn flex items-center gap-2 px-6 h-12 rounded-[12px] text-white text-[13px] font-bold"
                  whileTap={{ scale: 0.97 }}
                >
                  <Plus className="h-4 w-4" strokeWidth={2.5} />
                  New Patient Intake
                </motion.button>
              </Link>
              <motion.button
                className="flex items-center gap-2 px-6 h-12 rounded-[12px] border border-zinc-200 bg-white text-zinc-700 text-[13px] font-semibold hover:bg-zinc-50 hover:border-zinc-300 transition-colors"
                whileTap={{ scale: 0.97 }}
                onClick={() => document.getElementById("dashboard-section")?.scrollIntoView({ behavior: "smooth" })}
              >
                View Dashboard
                <ChevronRight className="h-3.5 w-3.5" />
              </motion.button>
            </motion.div>

            {/* ECG pulse strip */}
            <motion.div
              variants={fadeUp(0.38)}
              initial="hidden"
              animate="show"
              className="w-full max-w-[380px] mt-4 opacity-70"
            >
              <PulseLineAnim />
            </motion.div>

          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-40"
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="w-px h-8 bg-gradient-to-b from-transparent to-zinc-400 rounded-full" />
            <span className="section-label">scroll</span>
          </motion.div>
        </section>

        {/* ════════════════════════════════════════
            ABOUT / FEATURES SECTION
        ════════════════════════════════════════ */}
        <section className="relative px-4 sm:px-8 lg:px-12 xl:px-16 py-24 overflow-hidden"
          style={{ background: "#ffffff" }}
        >
          {/* Decorative left bar */}
          <div className="absolute left-0 top-1/4 w-1 h-1/2 rounded-r-full"
            style={{ background: "linear-gradient(180deg, transparent, #10b981, transparent)" }}
          />

          <div className="max-w-6xl mx-auto space-y-14">

            {/* Section header */}
            <motion.div
              className="flex flex-col gap-3 max-w-xl"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount:0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="section-label">Platform Architecture</span>
              <h2 className="ayu-serif text-3xl sm:text-4xl md:text-[44px] text-zinc-900 leading-[1.1] tracking-[-0.02em]">
                Built for the{" "}
                <span className="italic" style={{ color: "#10b981" }}>complexity</span>
                <br />of modern clinical workflows
              </h2>
              <p className="text-[14px] text-zinc-500 font-medium leading-relaxed max-w-md">
                Every layer of AyuNidan is engineered around one goal — turning unstructured
                medical chaos into precise, actionable intelligence.
              </p>
            </motion.div>

            {/* Feature cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {ABOUT_CARDS.map(({ icon: Icon, title, desc, accent }, i) => (
                <motion.div
                  key={title}
                  className="about-card flex flex-col gap-4 p-6 rounded-[16px] border border-zinc-100 bg-white"
                  style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.04)" }}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0 }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 }}
                >
                  <div
                    className="h-10 w-10 rounded-[11px] flex items-center justify-center shrink-0 float-icon"
                    style={{
                      background: `linear-gradient(135deg, ${accent}18 0%, ${accent}08 100%)`,
                      border: `1px solid ${accent}25`,
                      animationDelay: `${i * 0.6}s`,
                    }}
                  >
                    <Icon className="h-4.5 w-4.5" style={{ color: accent }} strokeWidth={2} />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-[13.5px] font-bold text-zinc-900 leading-snug">{title}</h3>
                    <p className="text-[12px] font-medium text-zinc-500 leading-relaxed">{desc}</p>
                  </div>
                  <div className="mt-auto pt-3 border-t border-zinc-50">
                    <div className="h-0.5 w-8 rounded-full" style={{ background: accent }} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════
            DASHBOARD / TELEMETRY SECTION
        ════════════════════════════════════════ */}
       <section
          id="dashboard-section"
          className="relative px-4 sm:px-8 lg:px-12 xl:px-16 py-24 overflow-hidden"
          style={{ background: "linear-gradient(180deg,#f9fafb 0%,#ffffff 100%)" }}
        >
          {/* Dot grid */}
          <div className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(16,185,129,0.18) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
              opacity: 0.5,
            }}
          />
          {/* Top glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px pointer-events-none"
            style={{ width: "50%", background: "linear-gradient(90deg,transparent,rgba(16,185,129,0.4),transparent)" }}
          />
 
          <div className="relative max-w-6xl mx-auto space-y-10">
 
            {/* ── Header ── */}
            <motion.div
              className="flex flex-col sm:flex-row sm:items-end justify-between gap-5"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0 }}
              transition={{ duration: 0.6, ease: [0.22,1,0.36,1] }}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="section-label">Clinical Processing Grid</span>
                </div>
                <h2 className="ayu-serif text-3xl sm:text-[40px] text-zinc-900 leading-tight tracking-[-0.02em]">
                  Clinical <span className="italic" style={{ color: "#10b981" }}>Overview</span>
                </h2>
                <p className="text-[13px] font-medium text-zinc-500 max-w-sm">
                  Real-time analytical telemetry and patient stratified risk metrics.
                </p>
              </div>
              <Link href="/consultation/new">
                <motion.button
                  className="glow-btn flex items-center gap-2 px-5 h-11 rounded-[11px] text-white text-[12.5px] font-bold shrink-0 group"
                  whileTap={{ scale: 0.97 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" strokeWidth={2.5} />
                  Initiate New Intake
                </motion.button>
              </Link>
            </motion.div>
 
           
            <motion.div
              className="h-px w-full"
              style={{ background: "linear-gradient(90deg,transparent,rgba(16,185,129,0.2) 30%,rgba(16,185,129,0.2) 70%,transparent)" }}
              initial={{ scaleX: 0, opacity: 0 }}
              whileInView={{ scaleX: 1, opacity: 1 }}
              viewport={{ once: true, amount: 0 }}
              transition={{ duration: 0.7, ease: [0.22,1,0.36,1] }}
            />
 
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
 
   
              <motion.div
                className="lg:col-span-1"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
              >
                <div
                  className="relative h-full rounded-[20px] overflow-hidden p-7 flex flex-col justify-between min-h-[240px] group cursor-default shadow-sm hover:shadow-md transition-all duration-300"
                  style={{
                    background: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
                    border: "1px solid rgba(16,185,129,0.15)",
                  }}
                >
                  {/* Subtle Corner Glow matching the primary emerald theme */}
                  <div className="absolute -bottom-16 -right-16 w-56 h-56 rounded-full pointer-events-none opacity-20"
                    style={{ background: "radial-gradient(circle, rgba(16,185,129,0.4) 0%, transparent 70%)" }}
                  />
                  {/* Soft Top-left highlight */}
                  <div className="absolute -top-12 -left-12 w-40 h-40 rounded-full pointer-events-none opacity-30"
                    style={{ background: "radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 70%)" }}
                  />

                  {/* Gentle Data Grid Overlay */}
                  <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
                    style={{
                      backgroundImage: "linear-gradient(rgba(16,185,129,1) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,1) 1px, transparent 1px)",
                      backgroundSize: "16px 16px",
                    }}
                  />

                  {/* Header Row */}
                  <div className="flex items-center justify-between z-10 relative">
                    <span className="ayu-mono text-[9.5px] font-bold tracking-[0.15em] uppercase text-zinc-500 bg-white border border-zinc-200 shadow-sm px-2.5 py-1 rounded-[7px]">
                      Aggregation Matrix
                    </span>
                    <div className="h-8 w-8 rounded-[10px] flex items-center justify-center bg-white shadow-sm"
                      style={{ border: "1px solid rgba(16,185,129,0.2)" }}
                    >
                      <Activity className="h-4 w-4 text-emerald-500" strokeWidth={2.5} />
                    </div>
                  </div>

                  {/* Main Metric Counter */}
                  <div className="z-10 relative mt-6 mb-4">
                    <div className="text-[72px] font-black leading-none tracking-tighter tabular-nums"
                         style={{
                           background: "linear-gradient(90deg, #0f172a, #334155)",
                           WebkitBackgroundClip: "text",
                           WebkitTextFillColor: "transparent"
                         }}
                    >
                      <CountUp to={data?.total ?? 0} />
                    </div>
                    <span className="ayu-mono text-[10px] font-bold tracking-[0.18em] uppercase text-zinc-600 mt-2 block">
                      Total Logged Cases
                    </span>
                  </div>

                  {/* Footer Stream Indicator */}
                  <div className="z-10 relative pt-4 border-t border-zinc-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                      </span>
                      <span className="ayu-mono text-[10.5px] font-bold text-emerald-600 uppercase tracking-tight">Live Data Stream</span>
                    </div>
                    <motion.div
                      className="opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-50 border border-zinc-200 p-1.5 rounded-lg"
                      whileHover={{ x: 2, y: -2 }}
                    >
                      <ArrowUpRight className="h-3.5 w-3.5 text-zinc-600" />
                    </motion.div>
                  </div>
                </div>
              </motion.div>
 
              {/* Risk stratification card */}
              <motion.div
                className="lg:col-span-2"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0 }}
                transition={{ duration: 0.6, ease: [0.22,1,0.36,1], delay: 0.12 }}
              >
                <div
                  className="h-full rounded-[20px] border border-zinc-200/80 bg-white p-7 flex flex-col gap-6"
                  style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.04), 0 0 0 1px rgba(16,185,129,0.04)" }}
                >
                  {/* Card header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-[8px] flex items-center justify-center shrink-0"
                        style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.12)" }}
                      >
                        <ShieldAlert className="h-3.5 w-3.5 text-red-400" strokeWidth={2} />
                      </div>
                      <span className="section-label text-zinc-500">Stratified Risk Classification</span>
                    </div>
                    <span className="ayu-mono text-[9px] tracking-[0.14em] uppercase px-2.5 py-1 rounded-[7px] self-start sm:self-auto"
                      style={{ background: "rgba(16,185,129,0.07)", color: "#059669", border: "1px solid rgba(16,185,129,0.14)" }}
                    >
                      Gemini 2.5 Core
                    </span>
                  </div>
 
                  {/* Bars */}
                  <div className="space-y-5 flex-1">
                    {[
                      { label: "High Risk",   pct: data && data.total > 0 ? (highRisk.count / data.total) * 100 : 0,   count: highRisk.count,   color: "#ef4444", bg: "#fef2f2", bdr: "#fecaca", bar: "linear-gradient(90deg,#ef4444,#dc2626)" },
                      { label: "Medium Risk", pct: data && data.total > 0 ? (mediumRisk.count / data.total) * 100 : 0, count: mediumRisk.count, color: "#f59e0b", bg: "#fffbeb", bdr: "#fde68a", bar: "linear-gradient(90deg,#f59e0b,#d97706)" },
                      { label: "Low Risk",    pct: data && data.total > 0 ? (lowRisk.count / data.total) * 100 : 0,    count: lowRisk.count,    color: "#10b981", bg: "#ecfdf5", bdr: "#a7f3d0", bar: "linear-gradient(90deg,#10b981,#0d9488)" },
                    ].map(({ label, pct, count, color, bg, bdr, bar }, i) => (
                      <div key={label} className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="h-2 w-2 rounded-full shrink-0" style={{ background: color }} />
                            <span className="text-[12.5px] font-semibold text-zinc-700">{label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="ayu-mono text-[10px] text-zinc-600">{pct.toFixed(0)}%</span>
                            <span className="ayu-mono text-[12px] font-bold text-zinc-900 tabular-nums min-w-[2ch] text-right">{count}</span>
                            <span className="text-[10px] text-zinc-600 font-medium">cases</span>
                          </div>
                        </div>
                        {/* Track */}
                        <div className="h-[6px] rounded-full overflow-hidden" style={{ background: bg, border: `1px solid ${bdr}` }}>
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${pct}%` }}
                            viewport={{ once: true, amount: 0 }}
                            transition={{ duration: 1.2, ease: [0.22,1,0.36,1], delay: 0.25 + i * 0.1 }}
                            className="h-full rounded-full"
                            style={{ background: bar }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
 
                  {/* Mini summary row */}
                  <div className="flex items-center gap-3 pt-4 border-t border-zinc-100">
                    {[
                      { label: "Total", val: data?.total ?? 0, color: "#18181b" },
                      { label: "Avg Score", val: `${data ? Math.round(data.distribution.reduce((a,d)=>a+d.averageScore,0)/data.distribution.length) : 0}%`, color: "#10b981" },
                      { label: "High Alert", val: highRisk.count, color: "#ef4444" },
                    ].map(({ label, val, color }) => (
                      <div key={label} className="flex-1 text-center">
                        <div className="ayu-mono text-[18px] font-black tabular-nums" style={{ color }}>{val}</div>
                        <div className="section-label mt-0.5">{label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
 
            {/* ── RAG Pipeline card ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0 }}
              transition={{ duration: 0.6, ease: [0.22,1,0.36,1], delay: 0.1 }}
            >
              <div
                className="relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 p-6 rounded-[16px] border"
                style={{
                  borderColor: "rgba(16,185,129,0.18)",
                  background: "linear-gradient(135deg,rgba(16,185,129,0.04) 0%,rgba(14,165,233,0.03) 100%)",
                }}
              >
                {/* bg shimmer */}
                <div className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage: "radial-gradient(circle at 10% 50%, rgba(16,185,129,0.06) 0%, transparent 60%)",
                  }}
                />
                <div className="flex items-center gap-4 z-10 relative">
                  <div
                    className="h-11 w-11 rounded-[12px] flex items-center justify-center shrink-0"
                    style={{ background: "linear-gradient(135deg,rgba(16,185,129,0.14),rgba(14,165,233,0.1))", border: "1px solid rgba(16,185,129,0.2)" }}
                  >
                    <Zap className="h-5 w-5 text-emerald-500" fill="rgba(16,185,129,0.25)" strokeWidth={2} />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-[13.5px] font-bold text-zinc-900">RAG Clinical Index — Operational</h4>
                    <p className="ayu-mono text-[10.5px] text-zinc-500">
                      Vector lookup bound to{" "}
                      <span className="font-semibold" style={{ color: "#059669" }}>panscience-medical</span>{" "}
                      namespace
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 z-10 relative px-3.5 py-2 rounded-[9px] border border-emerald-100 bg-white shrink-0">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="section-label text-emerald-600">Index Online</span>
                </div>
              </div>
            </motion.div>
 
          </div>
        </section>

      </div>
    </>
  );
}