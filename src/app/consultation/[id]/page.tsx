"use client"; // 🌟 FIX: Shifting to Client Component to access browser's localStorage token context

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Activity, FileText, Pill, Clock, ArrowLeft, Heart, Layers } from "lucide-react";
import Link from "next/link";
import { getConsultationById, Consultation } from "@/lib/api"; // Added explicit type binding
import MedicalExplainer from "@/components/MedicalExplainer";

export default function ReportPage() {
  const { id } = useParams(); // 🌟 FIX: Safely extracting dynamic router ID parameter on client side
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      async function fetchReport() {
        try {
          const data = await getConsultationById(id as string);
          setConsultation(data);
        } catch (error) {
          console.error("Error loading secure clinical sheet:", error);
        } finally {
          setLoading(false);
        }
      }
      fetchReport();
    }
  }, [id]);

  // ─── SHIMMER LOADING LAYER ───
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
        <div className="h-6 w-6 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono text-zinc-400">Decrypting Secure Clinical Matrix...</p>
      </div>
    );
  }

  // ─── NOT FOUND FALLBACK LAYER ───
  if (!consultation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-6">
        <div className="p-4 bg-zinc-50 rounded-full border border-zinc-200">
          <ShieldAlert className="h-6 w-6 text-zinc-400" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-lg font-semibold text-zinc-900 tracking-tight">Report Not Found</h2>
          <p className="text-sm text-zinc-500">The requested clinical record could not be located.</p>
        </div>
        <Link href="/">
          <Button variant="outline" className="h-9 text-xs font-medium px-4">
            Return to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  const riskConfig = {
    high: { color: "bg-red-50 text-red-700 border-red-100", label: "High Risk Profile" },
    medium: { color: "bg-amber-50 text-amber-700 border-amber-100", label: "Medium Risk Profile" },
    low: { color: "bg-emerald-50 text-emerald-700 border-emerald-100", label: "Low Risk Profile" },
  };

  const activeRisk = riskConfig[consultation.riskLevel] || riskConfig.low;

  return (
    <div className="w-full px-4 space-y-10 pb-24 pt-4 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-6">
        <div className="flex items-start gap-4">
          <Link href="/">
            <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-zinc-200 hover:bg-zinc-50 transition-all shadow-sm">
              <ArrowLeft className="h-4 w-4 text-zinc-600" />
            </Button>
          </Link>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">
              Clinical Intelligence Report
            </h1>
            <div className="flex items-center gap-3 text-xs font-medium text-zinc-400">
              <span className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200/60 px-2.5 py-1 rounded-md text-zinc-500">
                <Clock className="h-3.5 w-3.5 text-zinc-400" />
                {new Date(consultation.createdAt).toLocaleString()}
              </span>
              <span className="bg-zinc-50 border border-zinc-200/60 px-2.5 py-1 rounded-md text-zinc-500">
                ID: {(id as string).slice(-8).toUpperCase()}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <MedicalExplainer />
          <Badge variant="outline" className={`${activeRisk.color} px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border shadow-sm`}>
            {activeRisk.label}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="shadow-sm border-zinc-200/80 rounded-2xl overflow-hidden bg-white">
            <CardHeader className="bg-zinc-50/40 border-b border-zinc-100/80 py-4 px-6">
              <CardTitle className="text-sm font-bold tracking-wider uppercase flex items-center gap-2.5 text-zinc-800">
                <Activity className="h-4 w-4 text-blue-600" /> AI Diagnostic Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 sm:p-8">
              <div className="text-zinc-700 leading-relaxed text-sm antialiased font-normal bg-zinc-50/50 border border-zinc-100 p-5 rounded-xl whitespace-pre-wrap">
                {consultation.summary || "No summary provided by the AI engine."}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-zinc-200/80 rounded-2xl overflow-hidden bg-white">
            <CardHeader className="bg-zinc-50/40 border-b border-zinc-100/80 py-4 px-6">
              <CardTitle className="text-sm font-bold tracking-wider uppercase text-zinc-800 flex items-center gap-2.5">
                <Layers className="h-4 w-4 text-indigo-600" /> Extracted Lab Values
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="w-full overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-50/70 text-zinc-500 border-b border-zinc-200/60 text-xs font-semibold tracking-wider uppercase">
                      <th className="px-6 py-3.5 font-bold">Biomarker</th>
                      <th className="px-6 py-3.5 font-bold">Value</th>
                      <th className="px-6 py-3.5 font-bold">Reference Range</th>
                      <th className="px-6 py-3.5 font-bold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {consultation.labValues && consultation.labValues.length > 0 ? (
                      consultation.labValues.map((lab, i) => (
                        <tr key={i} className={`hover:bg-zinc-50/40 transition-colors ${lab.isAbnormal ? 'bg-red-50/30 hover:bg-red-50/40' : ''}`}>
                          <td className="px-6 py-4 font-semibold text-zinc-900 tracking-tight">{lab.name}</td>
                          <td className="px-6 py-4 font-medium text-zinc-700">{lab.value} {lab.unit}</td>
                          <td className="px-6 py-4 text-zinc-400 font-mono text-xs">{lab.normalRange || "-"}</td>
                          <td className="px-6 py-4 text-right">
                            {lab.isAbnormal ? (
                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200/60 font-bold text-[10px] px-2.5 py-0.5 rounded-md uppercase tracking-wide">Abnormal</Badge>
                            ) : (
                              <Badge variant="outline" className="bg-zinc-50 text-zinc-500 border-zinc-200 font-bold text-[10px] px-2.5 py-0.5 rounded-md uppercase tracking-wide">Normal</Badge>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-zinc-400 font-medium bg-zinc-50/20">
                          No diagnostic lab values detected within the processed matrix.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="shadow-sm border-zinc-200/80 rounded-2xl overflow-hidden bg-white">
            <CardHeader className="bg-zinc-50/40 border-b border-zinc-100/80 py-4 px-6">
              <CardTitle className="text-sm font-bold tracking-wider uppercase flex items-center gap-2.5 text-zinc-800">
                <FileText className="h-4 w-4 text-zinc-500" /> Isolated Symptoms
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col gap-2.5">
                {consultation.symptoms && consultation.symptoms.length > 0 ? (
                  consultation.symptoms.map((sym, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl hover:border-zinc-200 transition-all">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                      <span className="text-xs font-semibold text-zinc-800 tracking-tight capitalize">
                        {sym.trim()}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-xs text-zinc-400 font-medium">
                    No clinical symptoms categorized.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-zinc-200/80 rounded-2xl overflow-hidden bg-white">
            <CardHeader className="bg-zinc-50/40 border-b border-zinc-100/80 py-4 px-6">
              <CardTitle className="text-sm font-bold tracking-wider uppercase flex items-center gap-2.5 text-zinc-800">
                <Pill className="h-4 w-4 text-zinc-400" /> Active Medications
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col gap-2.5">
                {consultation.medicines && consultation.medicines.length > 0 ? (
                  consultation.medicines.map((med, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3 bg-white border border-zinc-200/70 rounded-xl hover:border-zinc-300 transition-all shadow-sm">
                      <div className="h-2 w-2 rounded-md bg-zinc-900 shrink-0" />
                      <span className="text-xs font-bold text-zinc-900 tracking-tight">
                        {med.trim()}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-xs text-zinc-400 font-medium">
                    No active therapeutic medications logged.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-zinc-200/80 rounded-2xl overflow-hidden bg-white border-dashed bg-gradient-to-br from-zinc-50/50 to-white">
            <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
              <div className="p-2.5 bg-zinc-900 rounded-xl text-white">
                <Heart className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-zinc-900 tracking-tight uppercase">Physician Notice</h4>
                <p className="text-[11px] text-zinc-400 font-medium leading-normal max-w-[200px]">
                  This assistant compiles summaries for operational efficiency. Final therapeutic diagnostic authority resides with the attending medical officer.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}