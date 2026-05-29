"use client";

import { useEffect, useState } from "react";
import { motion, Variants } from "framer-motion";
import Link from "next/link";
import { getConsultations, Consultation } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Calendar, ArrowUpRight, Activity } from "lucide-react";

export default function RecentConsultations() {
  const [list, setList] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchList() {
      const data = await getConsultations();
      setList(data || []);
      setLoading(false);
    }
    fetchList();
  }, []);

  const riskBadgeColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "high": return "bg-red-50 text-red-700 border-red-100";
      case "medium": return "bg-amber-50 text-amber-700 border-amber-100";
      default: return "bg-emerald-50 text-emerald-700 border-emerald-100";
    }
  };

  // Hover indicator configuration corresponding to the premium triage design matrix
  const getRiskIndicatorColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "high": return "bg-red-500";
      case "medium": return "bg-amber-500";
      default: return "bg-emerald-500";
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 18 } }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-3">
        <div className="h-4 w-4 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase">Synchronizing Stream...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header telemetry metadata row */}
      <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2 font-mono">
          <Activity className="h-4 w-4 text-zinc-400" /> Recent Diagnostic Transcripts
        </h3>
        <span className="text-xs font-semibold text-zinc-500 font-mono bg-zinc-50 border border-zinc-200/60 px-2.5 py-0.5 rounded-md">
          {list.length} Records
        </span>
      </div>

      {list.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-zinc-200 rounded-2xl text-sm text-zinc-400 font-medium bg-zinc-50/30 font-mono">
          No medical records found in the database cluster.
        </div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          // 🌟 SAFETY FIX: Enforces immediate transition hydration safely once loading is marked false
          animate={loading === false ? "show" : "hidden"}
          className="grid grid-cols-1 gap-3.5"
        >
          {list.map((item) => (
            <Link key={item._id} href={`/consultation/${item._id}`}>
              <motion.div 
                variants={itemVariants}
                className="w-full text-left bg-white border border-zinc-200/80 hover:border-zinc-300 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all shadow-sm hover:shadow-md group relative overflow-hidden"
                whileTap={{ scale: 0.995 }}
              >
                {/* Visual indicator bar that reflects severity risk profile dynamically on hover */}
                <div 
                  className={`absolute left-0 top-0 bottom-0 w-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${getRiskIndicatorColor(item.riskLevel)}`}
                />

                <div className="space-y-2.5 flex-1 z-10 relative">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-[10px] font-bold text-zinc-900 font-mono bg-zinc-50 border border-zinc-200 px-2.5 py-0.5 rounded-md">
                      CASE-{item._id.slice(-6).toUpperCase()}
                    </span>
                    <Badge variant="outline" className={`${riskBadgeColor(item.riskLevel)} px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border shadow-sm`}>
                      {item.riskLevel} Risk
                    </Badge>
                    <span className="text-[11px] text-zinc-400 font-semibold flex items-center gap-1.5">
                      <Calendar className="h-3 w-3 text-zinc-400" />
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-zinc-500 text-xs font-medium line-clamp-1 pr-6 leading-relaxed">
                    {item.summary || "No assessment transcription available."}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-5 border-t sm:border-t-0 pt-3 sm:pt-0 border-zinc-100/80 z-10 relative">
                  <div className="flex items-center gap-1.5 sm:hidden">
                    <span className="text-[10px] font-bold uppercase text-zinc-400 font-mono">Score:</span>
                    <span className="text-xs font-mono font-bold text-zinc-900">{item.riskScore}</span>
                  </div>
                  <div className="hidden sm:flex flex-col items-end gap-0.5 px-2">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider font-mono">Metrics</span>
                    <span className="text-sm font-mono font-black text-zinc-900 tracking-tight">{item.riskScore}%</span>
                  </div>
                  <div className="h-9 w-9 rounded-xl bg-zinc-50 group-hover:bg-zinc-950 border border-zinc-200/60 group-hover:border-zinc-950 flex items-center justify-center transition-all shadow-sm shrink-0">
                    <ArrowUpRight className="h-4 w-4 text-zinc-600 group-hover:text-white transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </motion.div>
      )}
    </div>
  );
}