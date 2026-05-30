"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { getConsultations, Consultation } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Calendar, ArrowUpRight, Activity, FileText, AlertTriangle, CheckCircle, Clock, ChevronLeft, ChevronRight } from "lucide-react"; // 🌟 ADDED CHEVRONS FOR PAGINATION

/* ─── Risk config ─── */
const RISK_CONFIG = {
  high: {
    badge: "bg-red-50 text-red-700 border-red-100",
    bar: "bg-red-500",
    glow: "rgba(239,68,68,0.12)",
    dot: "bg-red-500",
    icon: AlertTriangle,
    iconColor: "#ef4444",
    label: "HIGH",
  },
  medium: {
    badge: "bg-amber-50 text-amber-700 border-amber-100",
    bar: "bg-amber-500",
    glow: "rgba(245,158,11,0.1)",
    dot: "bg-amber-500",
    icon: Clock,
    iconColor: "#f59e0b",
    label: "MEDIUM",
  },
  low: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
    bar: "bg-emerald-500",
    glow: "rgba(16,185,129,0.1)",
    dot: "bg-emerald-500",
    icon: CheckCircle,
    iconColor: "#10b981",
    label: "LOW",
  },
};

function getRisk(level: string) {
  return RISK_CONFIG[level.toLowerCase() as keyof typeof RISK_CONFIG] ?? RISK_CONFIG.low;
}

/* ─── Score ring ─── */
function ScoreRing({ score, color }: { score: number; color: string }) {
  const r = 18;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" className="shrink-0 -rotate-90">
      <circle cx="24" cy="24" r={r} fill="none" stroke="#f4f4f5" strokeWidth="3" />
      <motion.circle
        cx="24" cy="24" r={r}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        whileInView={{ strokeDashoffset: circ - filled }}
        viewport={{ once: true, amount: 0 }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      />
      <text
        x="24" y="24"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize="9"
        fontWeight="700"
        fill="#18181b"
        transform="rotate(90 24 24)"
        fontFamily="DM Mono, monospace"
      >
        {score}%
      </text>
    </svg>
  );
}

/* ════════════════════════════════════════
   MAIN
════════════════════════════════════════ */
export default function RecentConsultations() {
  const [list, setList] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

  // 🌟 PAGINATION STATES 🌟
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8; // Change this number to show more/less items per page

  useEffect(() => {
    async function fetchList() {
      const data = await getConsultations();
      setList(data || []);
      setLoading(false);
    }
    fetchList();
  }, []);

  // 🌟 PAGINATION LOGIC 🌟
  const totalPages = Math.ceil(list.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  // Slice the original array to only get the current page's records
  const currentRecords = list.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
          className="h-5 w-5 border-2 border-zinc-900 border-t-transparent rounded-full"
        />
        <motion.p
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
          className="text-[10px] tracking-[0.22em] uppercase text-zinc-600"
          style={{ fontFamily: "DM Mono, monospace" }}
        >
          Synchronizing stream…
        </motion.p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=Instrument+Serif:ital@0;1&family=DM+Mono:wght@400;500&display=swap');
        .rc-wrap  { font-family: 'DM Sans', sans-serif; }
        .rc-mono  { font-family: 'DM Mono', monospace; }
        .rc-serif { font-family: 'Instrument Serif', serif; }

        .rc-row {
          position: relative;
          transition: all 0.26s cubic-bezier(0.22,1,0.36,1);
        }
        .rc-row:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px -8px rgba(0,0,0,0.1);
          border-color: rgba(16,185,129,0.25) !important;
        }
        .rc-row .risk-bar {
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 3px;
          border-radius: 3px 0 0 3px;
          opacity: 0;
          transition: opacity 0.22s;
        }
        .rc-row:hover .risk-bar { opacity: 1; }

        .rc-arrow-btn {
          transition: all 0.22s cubic-bezier(0.22,1,0.36,1);
        }
        .rc-row:hover .rc-arrow-btn {
          background: #0d1117;
          border-color: #0d1117;
        }
        .rc-row:hover .rc-arrow-icon {
          color: white;
          transform: translate(1px, -1px);
        }
        .rc-arrow-icon { transition: all 0.22s cubic-bezier(0.22,1,0.36,1); }

        .section-label {
          font-family: 'DM Mono', monospace;
          font-size: 9.5px; font-weight: 500;
          letter-spacing: 0.22em; text-transform: uppercase; color: #a1a1aa;
        }
      `}</style>

      <section className="rc-wrap relative px-4 sm:px-8 lg:px-12 xl:px-16 py-16 overflow-hidden"
        style={{ background: "#ffffff" }}
      >
        {/* subtle left accent bar */}
        <div className="absolute left-0 top-1/4 w-1 h-1/2 rounded-r-full"
          style={{ background: "linear-gradient(180deg,transparent,#10b981,transparent)" }}
        />

        <div className="max-w-6xl mx-auto space-y-8">

          {/* ── Section header ── */}
          <motion.div
            className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-100 pb-6"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <Activity className="h-3.5 w-3.5 text-emerald-500" strokeWidth={2.2} />
                <span className="section-label">Diagnostic Transcripts</span>
              </div>
              <h2 className="rc-serif text-3xl sm:text-[36px] text-zinc-900 leading-tight tracking-[-0.02em]">
                Recent <span className="italic" style={{ color: "#10b981" }}>Consultations</span>
              </h2>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-2 rounded-[10px] border border-zinc-100 bg-zinc-50 self-start sm:self-auto shadow-sm">
              <FileText className="h-3.5 w-3.5 text-zinc-600" />
              <span className="rc-mono text-[11px] text-zinc-500 font-medium">
                {list.length} Total Records
              </span>
            </div>
          </motion.div>

          {/* ── Empty state ── */}
          {list.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center py-20 gap-4 rounded-[18px] border border-dashed border-zinc-200 bg-zinc-50/40"
            >
              <div
                className="h-12 w-12 rounded-[14px] flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,rgba(16,185,129,0.1),rgba(14,165,233,0.08))", border: "1px solid rgba(16,185,129,0.18)" }}
              >
                <FileText className="h-5 w-5 text-emerald-500" strokeWidth={2} />
              </div>
              <div className="text-center space-y-1">
                <p className="text-[13px] font-semibold text-zinc-600">No records found</p>
                <p className="rc-mono text-[10.5px] text-zinc-600">No medical records in the database cluster</p>
              </div>
              <Link href="/consultation/new">
                <motion.button
                  className="flex items-center gap-2 px-5 h-9 rounded-[10px] text-white text-[12px] font-bold mt-1"
                  style={{ background: "linear-gradient(135deg,#059669,#0d9488)", boxShadow: "0 4px 16px rgba(16,185,129,0.25)" }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Start First Intake
                </motion.button>
              </Link>
            </motion.div>
          ) : (
            /* ── List & Pagination ── */
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-3 min-h-[500px] content-start">
                {/* 🌟 FIX: We are now mapping over 'currentRecords' instead of the full 'list' */}
                {currentRecords.map((item, i) => {
                  const risk = getRisk(item.riskLevel);
                  const RiskIcon = risk.icon;
                  return (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }} // Changed to animate so it fires on page change
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: i * 0.05 }}
                    >
                      <Link href={`/consultation/${item._id}`}>
                        <div
                          className="rc-row bg-white border border-zinc-200 rounded-[16px] px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 overflow-hidden"
                        >
                          {/* Left accent bar */}
                          <div className={`risk-bar ${risk.bar}`} />

                          {/* ── Left: meta + summary ── */}
                          <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">

                            {/* Risk icon bubble */}
                            <div
                              className="h-10 w-10 rounded-[11px] flex items-center justify-center shrink-0"
                              style={{
                                background: risk.glow,
                                border: `1px solid ${risk.iconColor}22`,
                              }}
                            >
                              <RiskIcon className="h-4 w-4" style={{ color: risk.iconColor }} strokeWidth={2} />
                            </div>

                            <div className="space-y-1.5 flex-1 min-w-0">
                              {/* Badges row */}
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className="rc-mono text-[9.5px] font-medium bg-zinc-50 border border-zinc-200 px-2 py-[3px] rounded-[6px] text-zinc-600"
                                >
                                  CASE-{item._id.slice(-6).toUpperCase()}
                                </span>
                                <span
                                  className={`rc-mono text-[9px] font-bold px-2 py-[3px] rounded-[6px] border tracking-[0.1em] uppercase ${risk.badge}`}
                                >
                                  {risk.label} Risk
                                </span>
                                <span className="flex items-center gap-1 rc-mono text-[10px] text-zinc-600">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(item.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                </span>
                              </div>
                              {/* Summary */}
                              <p className="text-[12.5px] font-medium text-zinc-500 leading-relaxed line-clamp-1 pr-4">
                                {item.summary || "No assessment transcription available."}
                              </p>
                            </div>
                          </div>

                          {/* ── Right: score ring + arrow ── */}
                          <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-zinc-100 shrink-0">
                            <ScoreRing score={item.riskScore} color={risk.iconColor} />
                            <div
                              className="rc-arrow-btn h-9 w-9 rounded-[10px] bg-zinc-50 border border-zinc-200 flex items-center justify-center shrink-0"
                            >
                              <ArrowUpRight className="rc-arrow-icon h-4 w-4 text-zinc-500" />
                            </div>
                          </div>

                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {/* 🌟 PAGINATION CONTROLS FOOTER 🌟 */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-6 mt-4 border-t border-zinc-100">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 px-4 h-9 rounded-[10px] border border-zinc-200 bg-white text-[12px] font-bold text-zinc-600 hover:bg-zinc-50 disabled:opacity-50 disabled:hover:bg-white disabled:cursor-not-allowed transition-all shadow-sm"
                  >
                    <ChevronLeft className="h-4 w-4" /> Previous
                  </button>

                  <div className="flex items-center gap-2 rc-mono text-[11px] font-medium text-zinc-500">
                    Page <span className="font-bold text-zinc-900">{currentPage}</span> of {totalPages}
                  </div>

                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2 px-4 h-9 rounded-[10px] border border-zinc-200 bg-white text-[12px] font-bold text-zinc-600 hover:bg-zinc-50 disabled:opacity-50 disabled:hover:bg-white disabled:cursor-not-allowed transition-all shadow-sm"
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </section>
    </>
  );
}