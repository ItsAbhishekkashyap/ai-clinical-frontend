"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  ShieldAlert, Activity, FileText, Pill, Clock,
  ArrowLeft, Heart, Layers, AlertTriangle, CheckCircle,
  FlaskConical, Stethoscope, ArrowUpRight
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { getConsultationById, Consultation } from "@/lib/api";
import MedicalExplainer from "@/components/MedicalExplainer";

/* ─── Risk config ─── */
const RISK = {
  high:   { badge: "bg-red-50 text-red-700 border-red-200",     label: "High Risk",   icon: AlertTriangle, color: "#ef4444", bar: "#ef4444", glow: "rgba(239,68,68,0.08)"   },
  medium: { badge: "bg-amber-50 text-amber-700 border-amber-200", label: "Medium Risk", icon: Clock,         color: "#f59e0b", bar: "#f59e0b", glow: "rgba(245,158,11,0.08)" },
  low:    { badge: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Low Risk", icon: CheckCircle, color: "#10b981", bar: "#10b981", glow: "rgba(16,185,129,0.08)" },
};

import type { Transition } from "framer-motion";

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      delay,
    } as Transition,
  };
}

/* ─── Section card wrapper ─── */
function SectionCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-[18px] border border-zinc-200/80 bg-white overflow-hidden ${className}`}
      style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.04), 0 0 0 1px rgba(16,185,129,0.03)" }}
    >
      {children}
    </div>
  );
}

function CardHead({ icon: Icon, iconColor, label }:{ icon: React.ElementType; iconColor: string; label: string }) {
  return (
    <div className="flex items-center gap-2.5 px-6 py-4 border-b border-zinc-100"
      style={{ background: "linear-gradient(180deg,#fafafa 0%,rgba(255,255,255,0) 100%)" }}
    >
      <div className="h-7 w-7 rounded-[8px] flex items-center justify-center shrink-0"
        style={{ background: `${iconColor}12`, border: `1px solid ${iconColor}22` }}
      >
        <Icon className="h-3.5 w-3.5" style={{ color: iconColor }} strokeWidth={2} />
      </div>
      <span
        className="text-[10px] font-bold tracking-[0.18em] uppercase text-zinc-500"
        style={{ fontFamily: "DM Mono, monospace" }}
      >
        {label}
      </span>
    </div>
  );
}

/* ════════════════════════════════════════
   MAIN
════════════════════════════════════════ */
export default function ReportPage() {
  const { id } = useParams();
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      (async () => {
        try {
          const data = await getConsultationById(id as string);
          setConsultation(data);
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [id]);

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
            className="h-6 w-6 border-2 border-zinc-900 border-t-transparent rounded-full"
          />
          <motion.p
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 1.8 }}
            className="text-[10px] tracking-[0.22em] uppercase text-zinc-600"
            style={{ fontFamily: "DM Mono, monospace" }}
          >
            Decrypting clinical matrix…
          </motion.p>
        </div>
      </div>
    );
  }

  /* ── Not found ── */
  if (!consultation) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6">
        <div className="h-14 w-14 rounded-[16px] flex items-center justify-center"
          style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.14)" }}
        >
          <ShieldAlert className="h-6 w-6 text-red-400" strokeWidth={2} />
        </div>
        <div className="text-center space-y-1.5">
          <h2 className="text-[17px] font-bold text-zinc-900 tracking-tight">Report Not Found</h2>
          <p className="text-[13px] text-zinc-500 font-medium">The requested clinical record could not be located.</p>
        </div>
        <Link href="/">
          <motion.button
            className="flex items-center gap-2 px-5 h-10 aria-label=Return to Dashboard rounded-[11px] border border-zinc-200 bg-white text-zinc-700 text-[12.5px] font-semibold hover:bg-zinc-50 transition-colors"
            whileTap={{ scale: 0.97 }}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Return to Dashboard
          </motion.button>
        </Link>
      </div>
    );
  }

  const risk      = RISK[consultation.riskLevel as keyof typeof RISK] ?? RISK.low;
  const RiskIcon  = risk.icon;
  const caseId    = (id as string).slice(-8).toUpperCase();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=Instrument+Serif:ital@0;1&family=DM+Mono:wght@400;500&display=swap');
        .rp-wrap  { font-family: 'DM Sans', sans-serif; }
        .rp-serif { font-family: 'Instrument Serif', serif; }
        .rp-mono  { font-family: 'DM Mono', monospace; }
        .section-label {
          font-family: 'DM Mono', monospace;
          font-size: 9.5px; font-weight: 500;
          letter-spacing: 0.22em; text-transform: uppercase; color: #a1a1aa;
        }
        .sym-row { transition: all 0.2s cubic-bezier(0.22,1,0.36,1); }
        .sym-row:hover { transform: translateX(3px); border-color: rgba(16,185,129,0.3) !important; background: rgba(16,185,129,0.03); }
        .med-row { transition: all 0.2s cubic-bezier(0.22,1,0.36,1); }
        .med-row:hover { transform: translateX(3px); border-color: #d4d4d8 !important; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .lab-row { transition: background 0.18s; }
        .lab-row:hover { background: rgba(16,185,129,0.025) !important; }
        .glow-btn {
          background: linear-gradient(135deg,#059669,#0d9488);
          box-shadow: 0 4px 16px rgba(16,185,129,0.25);
          transition: all 0.22s cubic-bezier(0.22,1,0.36,1);
        }
        .glow-btn:hover { box-shadow: 0 6px 24px rgba(16,185,129,0.38); transform: translateY(-1px); }
      `}</style>

      <div className="rp-wrap w-full px-4 sm:px-8 lg:px-12 xl:px-16 pb-28 pt-6 space-y-8">

        {/* ════════════════════════════
            PAGE HEADER
        ════════════════════════════ */}
        <motion.div {...fadeUp(0)}>

          {/* Top bar */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5 pb-7 border-b border-zinc-100">

            <div className="flex items-start gap-4">
              {/* Back button */}
              <Link href="/">
                <motion.button
                  className="h-10 w-10 rounded-[11px] border aria-label=Return to Dashboard border-zinc-200 bg-white flex items-center justify-center shrink-0 hover:bg-zinc-50 hover:border-zinc-300 transition-colors"
                  whileTap={{ scale: 0.95 }}
                >
                  <ArrowLeft className="h-4 w-4 text-zinc-600" />
                </motion.button>
              </Link>

              <div className="space-y-2">
                {/* breadcrumb label */}
                <div className="flex items-center gap-2">
                  <span className="section-label">Clinical Intelligence Report</span>
                </div>
                {/* Headline */}
                <h1 className="rp-serif text-3xl sm:text-[38px] text-zinc-900 leading-tight tracking-[-0.02em]">
                  Case{" "}
                  <span className="italic" style={{ color: "#10b981" }}>
                    #{caseId}
                  </span>
                </h1>
                {/* Meta pills */}
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] border border-zinc-200 bg-zinc-50">
                    <Clock className="h-3 w-3 text-zinc-600" />
                    <span className="rp-mono text-[10px] text-zinc-500">
                      {new Date(consultation.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] border border-zinc-200 bg-zinc-50">
                    <span className="rp-mono text-[10px] text-zinc-500">ID: {caseId}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: risk badge + score + explainer */}
            <div className="flex flex-wrap items-center gap-3 self-start">
              <MedicalExplainer />

              {/* Risk score ring */}
              <div
                className="flex items-center gap-2.5 px-3.5 py-2 rounded-[11px] border"
                style={{ borderColor: `${risk.color}30`, background: risk.glow }}
              >
                <RiskIcon className="h-4 w-4 shrink-0" style={{ color: risk.color }} strokeWidth={2} />
                <div>
                  <div className="rp-mono text-[16px] font-black tabular-nums leading-none" style={{ color: risk.color }}>
                    {consultation.riskScore}%
                  </div>
                  <div className="section-label mt-0.5" style={{ color: risk.color, opacity: 0.7 }}>
                    {risk.label}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Risk bar strip */}
          <div className="mt-5 h-[3px] w-full rounded-full overflow-hidden bg-zinc-100">
            <motion.div
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${risk.color}, ${risk.color}88)` }}
              initial={{ width: 0 }}
              animate={{ width: `${consultation.riskScore}%` }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            />
          </div>
        </motion.div>

        {/* ════════════════════════════
            MAIN GRID
        ════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left 2/3 ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* AI Summary */}
            <motion.div {...fadeUp(0.08)}>
              <SectionCard>
                <CardHead icon={Activity} iconColor="#0ea5e9" label="AI Diagnostic Summary" />
                <div className="p-6">
                  <div
                    className="text-[13.5px] text-zinc-700 leading-[1.8] font-medium rounded-[12px] p-5 border border-zinc-100 whitespace-pre-wrap"
                    style={{ background: "linear-gradient(135deg,#fafafa 0%,#f7faf9 100%)" }}
                  >
                    {consultation.summary || "No summary provided by the AI engine."}
                  </div>
                </div>
              </SectionCard>
            </motion.div>

            {/* Lab values */}
            <motion.div {...fadeUp(0.14)}>
              <SectionCard>
                <CardHead icon={FlaskConical} iconColor="#8b5cf6" label="Extracted Lab Values" />
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr style={{ background: "linear-gradient(180deg,#fafafa,#f4f4f5)" }}>
                        {["Biomarker", "Value", "Reference Range", "Status"].map((h, i) => (
                          <th key={h} className={`px-5 py-3.5 border-b border-zinc-200/80 ${i === 3 ? "text-right" : ""}`}>
                            <span className="section-label">{h}</span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {consultation.labValues && consultation.labValues.length > 0 ? (
                        consultation.labValues.map((lab, i) => (
                          <motion.tr
                            key={i}
                            className="lab-row border-b border-zinc-100 last:border-0"
                            style={{ background: lab.isAbnormal ? "rgba(239,68,68,0.02)" : "transparent" }}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.18 + i * 0.04, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                          >
                            <td className="px-5 py-4">
                              <span className="text-[13px] font-semibold text-zinc-900">{lab.name}</span>
                            </td>
                            <td className="px-5 py-4">
                              <span className="rp-mono text-[12.5px] font-bold text-zinc-800">
                                {lab.value} <span className="text-zinc-600 font-normal text-[11px]">{lab.unit}</span>
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <span className="rp-mono text-[11px] text-zinc-600">{lab.normalRange || "—"}</span>
                            </td>
                            <td className="px-5 py-4 text-right">
                              {lab.isAbnormal ? (
                                <span className="rp-mono text-[9px] font-bold tracking-[0.1em] uppercase px-2.5 py-1 rounded-[6px]"
                                  style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}>
                                  Abnormal
                                </span>
                              ) : (
                                <span className="rp-mono text-[9px] font-bold tracking-[0.1em] uppercase px-2.5 py-1 rounded-[6px]"
                                  style={{ background: "#ecfdf5", color: "#059669", border: "1px solid #a7f3d0" }}>
                                  Normal
                                </span>
                              )}
                            </td>
                          </motion.tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-5 py-14 text-center">
                            <div className="flex flex-col items-center gap-3">
                              <div className="h-10 w-10 rounded-[12px] flex items-center justify-center"
                                style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.12)" }}
                              >
                                <Layers className="h-4.5 w-4.5 text-violet-400" strokeWidth={2} />
                              </div>
                              <p className="rp-mono text-[10.5px] text-zinc-600">No lab values detected in processed matrix</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </SectionCard>
            </motion.div>
          </div>

          {/* ── Right 1/3 ── */}
          <div className="space-y-5">

            {/* Symptoms */}
            <motion.div {...fadeUp(0.1)}>
              <SectionCard>
                <CardHead icon={Stethoscope} iconColor="#0ea5e9" label="Isolated Symptoms" />
                <div className="p-5 space-y-2">
                  {consultation.symptoms && consultation.symptoms.length > 0 ? (
                    consultation.symptoms.map((sym, i) => (
                      <motion.div
                        key={i}
                        className="sym-row flex items-center gap-3 px-4 py-3 rounded-[11px] border border-zinc-100 bg-zinc-50/60 cursor-default"
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 + i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <div className="h-1.5 w-1.5 rounded-full bg-sky-400 shrink-0" />
                        <span className="text-[12.5px] font-semibold text-zinc-800 capitalize">{sym.trim()}</span>
                      </motion.div>
                    ))
                  ) : (
                    <p className="rp-mono text-[10.5px] text-zinc-600 text-center py-5">No symptoms categorized</p>
                  )}
                </div>
              </SectionCard>
            </motion.div>

            {/* Medications */}
            <motion.div {...fadeUp(0.16)}>
              <SectionCard>
                <CardHead icon={Pill} iconColor="#8b5cf6" label="Active Medications" />
                <div className="p-5 space-y-2">
                  {consultation.medicines && consultation.medicines.length > 0 ? (
                    consultation.medicines.map((med, i) => (
                      <motion.div
                        key={i}
                        className="med-row flex items-center gap-3 px-4 py-3 rounded-[11px] border border-zinc-200 bg-white cursor-default"
                        style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.18 + i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <div
                          className="h-6 w-6 rounded-[7px] flex items-center justify-center shrink-0"
                          style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.14)" }}
                        >
                          <Pill className="h-3 w-3 text-violet-500" strokeWidth={2} />
                        </div>
                        <span className="text-[12.5px] font-bold text-zinc-900 tracking-tight">{med.trim()}</span>
                      </motion.div>
                    ))
                  ) : (
                    <p className="rp-mono text-[10.5px] text-zinc-600 text-center py-5">No medications logged</p>
                  )}
                </div>
              </SectionCard>
            </motion.div>

            {/* Physician notice */}
            <motion.div {...fadeUp(0.22)}>
              <div
                className="rounded-[18px] border overflow-hidden p-6 flex flex-col items-center text-center gap-4"
                style={{
                  borderColor: "rgba(16,185,129,0.15)",
                  background: "linear-gradient(135deg,rgba(16,185,129,0.04) 0%,rgba(14,165,233,0.03) 100%)",
                }}
              >
                <div
                  className="h-10 w-10 rounded-[12px] flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg,#0d1117,#1a2332)",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
                  }}
                >
                  <Heart className="h-4 w-4 text-white" strokeWidth={2} />
                </div>
                <div className="space-y-1.5">
                  <p className="text-[12px] font-bold text-zinc-900 tracking-tight">Physician Notice</p>
                  <p className="rp-mono text-[10px] text-zinc-500 leading-relaxed max-w-[200px]">
                    This assistant compiles summaries for operational efficiency. Final therapeutic authority resides with the attending medical officer.
                  </p>
                </div>
                <div className="h-px w-full" style={{ background: "linear-gradient(90deg,transparent,rgba(16,185,129,0.25),transparent)" }} />
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                  </span>
                  <span className="section-label text-emerald-600">AyuNidan Clinical AI</span>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </>
  );
}