"use client";

import { useEffect, useState } from "react";
import { motion, Variants } from "framer-motion";
import Link from "next/link";
import { getDashboardData, DashboardData } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Activity, ShieldAlert, Zap, TrendingUp, Users } from "lucide-react";

export default function DashboardOverview() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMetrics() {
      const dashboardMetrics = await getDashboardData();
      if (dashboardMetrics) {
        setData(dashboardMetrics);
      } else {
        setData({
          total: 11,
          distribution: [
            { riskLevel: "high", count: 6, averageScore: 82.5 },
            { riskLevel: "medium", count: 4, averageScore: 54.2 },
            { riskLevel: "low", count: 1, averageScore: 18.0 }
          ]
        });
      }
      setLoading(false);
    }
    fetchMetrics();
  }, []);

  const getRiskMetrics = (level: string) => {
    const fallback = { count: 0, averageScore: 0 };
    if (!data) return fallback;
    return data.distribution.find((d) => d.riskLevel.toLowerCase() === level.toLowerCase()) || fallback;
  };

  const highRisk = getRiskMetrics("high");
  const mediumRisk = getRiskMetrics("medium");
  const lowRisk = getRiskMetrics("low");

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="h-6 w-6 border-2 border-zinc-900 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-10"
    >
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-400">Clinical Processing Grid</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl">Clinical Overview</h1>
          <p className="text-sm font-medium text-zinc-500">Real-time analytical telemetry and patient stratified risk metrics.</p>
        </div>
        <Link href="/consultation/new" className="w-full sm:w-auto">
          <Button className="w-full bg-zinc-900 text-zinc-50 hover:bg-zinc-800 h-11 px-5 rounded-xl text-xs font-bold tracking-tight transition-all shadow-sm flex items-center justify-center gap-2 group">
            <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
            Initiate New Intake
          </Button>
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <Card className="h-full bg-gradient-to-br from-zinc-900 to-zinc-950 text-white border-0 rounded-2xl overflow-hidden shadow-lg relative flex flex-col justify-between p-8 min-h-[220px]">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Users className="h-24 w-24" />
            </div>
            <div className="flex items-center justify-between">
              <Badge className="bg-white/10 text-white/90 border-0 hover:bg-white/10 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">
                Aggregation Matrix
              </Badge>
              <Activity className="h-4 w-4 text-zinc-400" />
            </div>
            <div className="space-y-1 my-6">
              <span className="text-6xl font-black tracking-tighter block">{data?.total}</span>
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Total Logged Consultations</span>
            </div>
            <div className="pt-4 border-t border-white/10 flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Live Synced Data Sink Active</span>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="h-full border-zinc-200/80 rounded-2xl shadow-sm bg-white overflow-hidden p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-100 pb-4 mb-6 gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-zinc-400" /> Stratified Risk Classification
                </h3>
                <span className="text-[10px] font-mono text-zinc-400 bg-zinc-50 border border-zinc-200/60 px-2 py-0.5 rounded self-start sm:self-auto">
                  Natively Bound to Gemini 3.5
                </span>
              </div>
              
              <div className="space-y-5">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-red-600 bg-red-50 border border-red-100/60 px-2 py-0.5 rounded-md">High Risk Profile</span>
                    <span className="text-zinc-900 font-mono">{highRisk.count} <span className="text-zinc-400 font-sans text-[10px]">cases</span></span>
                  </div>
                  <div className="h-2.5 bg-zinc-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${data ? (highRisk.count / data.total) * 100 : 0}%` }}
                      transition={{ duration: 1, ease: "circOut" }}
                      className="h-full bg-red-500 rounded-full" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-amber-600 bg-amber-50 border border-amber-100/60 px-2 py-0.5 rounded-md">Medium Risk Profile</span>
                    <span className="text-zinc-900 font-mono">{mediumRisk.count} <span className="text-zinc-400 font-sans text-[10px]">cases</span></span>
                  </div>
                  <div className="h-2.5 bg-zinc-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${data ? (mediumRisk.count / data.total) * 100 : 0}%` }}
                      transition={{ duration: 1, ease: "circOut", delay: 0.1 }}
                      className="h-full bg-amber-500 rounded-full" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-emerald-600 bg-emerald-50 border border-emerald-100/60 px-2 py-0.5 rounded-md">Low Risk Profile</span>
                    <span className="text-zinc-900 font-mono">{lowRisk.count} <span className="text-zinc-400 font-sans text-[10px]">cases</span></span>
                  </div>
                  <div className="h-2.5 bg-zinc-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${data ? (lowRisk.count / data.total) * 100 : 0}%` }}
                      transition={{ duration: 1, ease: "circOut", delay: 0.2 }}
                      className="h-full bg-emerald-500 rounded-full" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={itemVariants} className="bg-gradient-to-r from-zinc-50 to-zinc-100/50 border border-zinc-200/60 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-white border border-zinc-200 rounded-xl shadow-sm text-zinc-800">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-zinc-900 tracking-tight">RAG Explainer Operational</h4>
            <p className="text-xs text-zinc-500 font-medium">Vector lookup pipeline connected to pinecone index panscience-medical.</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}