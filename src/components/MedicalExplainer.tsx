"use client";

import { useState } from "react";
import { explainMedicalTerm } from "@/lib/api";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, HelpCircle, Search, BrainCircuit } from "lucide-react";

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
        <Button variant="outline" className="h-9 rounded-xl border-zinc-200 text-xs font-bold tracking-tight bg-white shadow-sm hover:bg-zinc-50 flex items-center gap-2">
          <HelpCircle className="h-3.5 w-3.5 text-zinc-500" />
          Clinical Term Explainer
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md bg-white border-l border-zinc-200 p-6 flex flex-col justify-between">
        <div className="space-y-6 flex-1 overflow-y-auto pr-2">
          <SheetHeader className="space-y-1 text-left">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-[10px] uppercase tracking-wider">
              <BrainCircuit className="h-4 w-4" />
              Vector RAG Nodes Active
            </div>
            <SheetTitle className="text-lg font-black tracking-tight text-zinc-950">
              Medical Term Dictionary
            </SheetTitle>
            {/* ✅ FIXED: Added SheetDescription to satisfy Radix UI accessibility constraints and clear terminal warnings */}
            <SheetDescription className="text-xs text-zinc-500 font-medium">
              Query the Pinecone index cluster to resolve and simplify complex medical terminology.
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleExplain} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
              <Input
                placeholder="Type term (e.g., GERD, Vertigo)..."
                className="pl-9 h-10 border-zinc-200 rounded-xl text-xs font-medium focus-visible:ring-1 focus-visible:ring-zinc-400 bg-zinc-50/50"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
              />
            </div>
            <Button type="submit" className="bg-zinc-900 text-white hover:bg-zinc-800 rounded-xl h-10 px-4 text-xs font-bold" disabled={loading}>
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Analyze"}
            </Button>
          </form>

          {loading && (
            <div className="py-12 flex flex-col items-center justify-center space-y-2 text-center">
              <Loader2 className="h-5 w-5 text-zinc-900 animate-spin" />
              <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Querying Pinecone Index...</p>
            </div>
          )}

          {explanation && (
            <div className="p-5 bg-gradient-to-br from-zinc-50 to-zinc-100/60 border border-zinc-200/60 rounded-2xl space-y-3 animate-in fade-in slide-in-from-y-2 duration-300">
              <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 uppercase tracking-tight">
                <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                AI Context Resolution
              </div>
              <p className="text-zinc-700 text-xs leading-relaxed font-medium antialiased">
                {explanation}
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-zinc-100 pt-4 bg-white text-[10px] font-bold text-zinc-400 tracking-wide uppercase">
          Precision Knowledge Base Deployment Matrix
        </div>
      </SheetContent>
    </Sheet>
  );
}