"use client";

import { useState } from "react";
import { explainMedicalTerm } from "@/lib/api";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, HelpCircle, Search, BrainCircuit, Activity } from "lucide-react";

export default function MedicalExplainer({ defaultTerm }: { defaultTerm?: string }) {
  const [term, setTerm] = useState(defaultTerm || "");
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);

  const handleExplain = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!term.trim()) return;

    setLoading(true);
    setExplanation("");
    try {
      const res = await explainMedicalTerm(term);
      if (res) {
        setExplanation(res.explanation);
      } else {
        setExplanation("Could not resolve term definitions within vector spaces.");
      }
    } catch {
      setExplanation("Network intelligence lookup degradation encountered.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="h-9 rounded-xl border-zinc-200/80 text-xs font-bold tracking-tight bg-white shadow-sm hover:shadow hover:bg-zinc-50 flex items-center gap-2 transition-all duration-300 group">
          <HelpCircle className="h-4 w-4 text-zinc-600 group-hover:text-emerald-500 transition-colors" />
          Clinical Term Explainer
        </Button>
      </SheetTrigger>

      {/* 🌟 Fully responsive width constraints and fluid padding layout */}
      <SheetContent side="right" className="w-full sm:max-w-md bg-white/95 backdrop-blur-xl border-l border-zinc-200/80 p-0 flex flex-col h-full shadow-2xl">

        <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8 no-scrollbar">

          <SheetHeader className="space-y-2 text-left">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-[10px] uppercase tracking-wider font-mono">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              Vector RAG Nodes Active
            </div>
            <SheetTitle className="text-xl font-black tracking-tight text-zinc-900 flex items-center gap-2.5">
              Medical Dictionary
            </SheetTitle>
            <SheetDescription className="text-[13px] text-zinc-500 font-medium leading-relaxed">
              Query the Pinecone index cluster to securely resolve and simplify complex medical taxonomy in real-time.
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleExplain} className="flex flex-col gap-3">
            <div className="relative flex-1 group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
              <Input
                placeholder="Type term (e.g., GERD, Vertigo)..."
                className="pl-10 h-12 border-zinc-200/80 rounded-xl text-sm font-semibold focus-visible:ring-4 focus-visible:ring-emerald-500/10 focus-visible:border-emerald-500/50 bg-zinc-50/50 transition-all shadow-sm"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              className="bg-zinc-950 text-white hover:bg-zinc-800 rounded-xl h-12 px-6 text-xs font-bold w-full active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-zinc-600" />
                  <span className="text-zinc-300">Searching Index...</span>
                </>
              ) : (
                <>
                  <BrainCircuit className="h-4 w-4 text-emerald-400" />
                  Analyze Terminology
                </>
              )}
            </Button>
          </form>

          {loading && (
            <div className="py-16 flex flex-col items-center justify-center space-y-4 text-center animate-in fade-in duration-300">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-100 rounded-full blur-xl opacity-60 animate-pulse" />
                <Activity className="h-8 w-8 text-emerald-500 relative z-10 animate-bounce" style={{ animationDuration: '2s' }} />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-900 font-mono">Querying Pinecone Matrix</p>
                <p className="text-[10px] text-zinc-600 font-medium">Extracting semantic context layers...</p>
              </div>
            </div>
          )}

          {explanation && (
            <div className="relative p-6 bg-gradient-to-br from-emerald-50/50 via-zinc-50/30 to-transparent border border-emerald-100/60 rounded-2xl space-y-4 animate-in fade-in slide-in-from-y-4 duration-500 overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                <BrainCircuit className="h-24 w-24 text-emerald-600" />
              </div>

              <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-700 uppercase tracking-wider font-mono relative z-10">
                <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                AI Context Resolution
              </div>
              <div className="w-full h-px bg-gradient-to-r from-emerald-200/60 to-transparent relative z-10" />

              <p className="text-zinc-700 text-sm leading-relaxed font-medium antialiased relative z-10">
                {explanation}
              </p>
            </div>
          )}
        </div>

        {/* Sticky bottom metadata footer */}
        <div className="border-t border-zinc-100 p-6 bg-zinc-50/30">
          <div className="flex items-center justify-between text-[9px] font-bold text-zinc-600 tracking-wider uppercase font-mono">
            <span>Precision Knowledge Base</span>
            <span className="flex items-center gap-1 text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              v2.5.Flash Core
            </span>
          </div>
        </div>

      </SheetContent>
    </Sheet>
  );
}