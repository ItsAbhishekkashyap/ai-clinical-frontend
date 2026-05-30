"use client";

import { useState, useRef, ChangeEvent } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setStatus, setConsultationData, setError } from "@/store/slices/consultationSlice";
import { uploadMedicalFile, createConsultation, uploadVoiceNote } from "@/lib/api";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic, Square, Loader2, UploadCloud,
  AlertCircle, Sparkles, FileText, Activity
} from "lucide-react";
import { toast } from "sonner";

export default function IntakeForm() {
  const dispatch   = useAppDispatch();
  const router     = useRouter();
  const { status, error } = useAppSelector((s) => s.consultation);
  const { user }          = useAppSelector((s) => s.auth);

  const [symptoms, setSymptoms]       = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [dragOver, setDragOver]       = useState(false);
  const fileInputRef   = useRef<HTMLInputElement>(null);
  const mediaRecRef    = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const busy = status === "uploading" || status === "processing";

  /* ─── File upload ─── */
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    dispatch(setStatus("uploading"));
    const tid = toast.loading("AI Pipeline parsing report…");
    try {
      const text = await uploadMedicalFile(file);
      setSymptoms((p) => (p ? `${p}\n\n${text}` : text));
      dispatch(setStatus("idle"));
      toast.success("Medical chart extracted", { id: tid });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      dispatch(setError(msg));
      toast.error(msg, { id: tid });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const fakeEvent = { target: { files: e.dataTransfer.files } } as unknown as ChangeEvent<HTMLInputElement>;
      handleFileChange(fakeEvent);
    }
  };

  /* ─── Voice recording ─── */
  const startRecording = async () => {
    try {
      const stream   = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecRef.current    = recorder;
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        stream.getTracks().forEach((t) => t.stop());
        dispatch(setStatus("uploading"));
        const tid = toast.loading("Processing voice note…");
        try {
          const text = await uploadVoiceNote(blob);
          setSymptoms((p) => (p ? `${p}\n\n${text}` : text));
          dispatch(setStatus("idle"));
          toast.success("Voice transcript appended", { id: tid });
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Transcription failed";
          dispatch(setError(msg));
          toast.error(msg, { id: tid });
        }
      };
      recorder.start();
      setIsRecording(true);
    } catch {
      dispatch(setError("Microphone access denied"));
      toast.error("Microphone access denied");
    }
  };

  const stopRecording = () => {
    if (mediaRecRef.current && isRecording) {
      mediaRecRef.current.stop();
      setIsRecording(false);
    }
  };

  /* ─── Submit ─── */
  const handleSubmit = async () => {
    if (!symptoms?.trim()) return;
    if (!user?.id) { toast.error("Session expired. Please re-authenticate."); router.push("/login"); return; }
    dispatch(setStatus("processing"));
    try {
      const data = await createConsultation({ userId: user.id, rawText: symptoms });
      dispatch(setConsultationData(data));
      toast.success("Clinical summary compiled");
      router.push(`/consultation/${data._id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Processing failed";
      dispatch(setError(msg));
    }
  };

  const canSubmit = !!symptoms?.trim() && !busy && !isRecording;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=Instrument+Serif:ital@0;1&family=DM+Mono:wght@400;500&display=swap');
        .if-wrap  { font-family: 'DM Sans', sans-serif; }
        .if-serif { font-family: 'Instrument Serif', serif; }
        .if-mono  { font-family: 'DM Mono', monospace; }
        .section-label {
          font-family: 'DM Mono', monospace; font-size: 9.5px; font-weight: 500;
          letter-spacing: 0.22em; text-transform: uppercase; color: #a1a1aa;
        }

        .upload-zone {
          transition: all 0.25s cubic-bezier(0.22,1,0.36,1);
          cursor: pointer;
        }
        .upload-zone:hover, .upload-zone.drag-over {
          border-color: rgba(16,185,129,0.45) !important;
          background: rgba(16,185,129,0.03);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(16,185,129,0.1);
        }

        .voice-zone { transition: all 0.25s cubic-bezier(0.22,1,0.36,1); }
        .voice-zone:hover { border-color: rgba(99,102,241,0.35) !important; background: rgba(99,102,241,0.02); }

        .intake-textarea {
          font-family: 'DM Sans', sans-serif !important;
          font-size: 13.5px !important;
          line-height: 1.75 !important;
          color: #18181b !important;
          transition: border-color 0.2s, box-shadow 0.2s !important;
        }
        .intake-textarea:focus {
          border-color: rgba(16,185,129,0.4) !important;
          box-shadow: 0 0 0 3px rgba(16,185,129,0.08) !important;
          outline: none !important;
        }
        .intake-textarea::placeholder { color: #a1a1aa !important; font-size: 13px !important; }

        .submit-btn {
          background: linear-gradient(135deg,#059669,#0d9488);
          box-shadow: 0 4px 18px rgba(16,185,129,0.28);
          transition: all 0.24s cubic-bezier(0.22,1,0.36,1);
          font-family: 'DM Sans', sans-serif;
        }
        .submit-btn:hover:not(:disabled) {
          box-shadow: 0 6px 26px rgba(16,185,129,0.4);
          transform: translateY(-1px);
        }
        .submit-btn:disabled {
          opacity: 0.45;
          box-shadow: none;
          transform: none;
          background: linear-gradient(135deg,#6b7280,#9ca3af);
        }

        @keyframes rec-pulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); }
          50%      { box-shadow: 0 0 0 8px rgba(239,68,68,0); }
        }
        .rec-pulse { animation: rec-pulse 1.4s ease-in-out infinite; }
      `}</style>

      <div className="if-wrap w-full max-w-2xl mx-auto">

        {/* ── Card ── */}
        <motion.div
          className="rounded-[22px] border border-zinc-200/80 bg-white overflow-hidden"
          style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.07), 0 0 0 1px rgba(16,185,129,0.05)" }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >

          {/* ── Header ── */}
          <div
            className="px-6 pt-7 pb-6 border-b border-zinc-100"
            style={{ background: "linear-gradient(180deg,rgba(16,185,129,0.04) 0%,rgba(255,255,255,0) 100%)" }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="section-label">New Consultation Intake</span>
                </div>
                <h2 className="if-serif text-[26px] text-zinc-900 leading-tight tracking-[-0.01em]">
                  Patient <span className="italic" style={{ color: "#10b981" }}>Intake</span>
                </h2>
                <p className="text-[12.5px] font-medium text-zinc-500 leading-relaxed max-w-sm">
                  Stream charts, symptoms, or voice recordings into the clinical AI analyzer.
                </p>
              </div>
              <div
                className="h-11 w-11 rounded-[13px] flex items-center justify-center shrink-0 mt-1"
                style={{
                  background: "linear-gradient(135deg,#0d1117,#1a2332)",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.07)",
                }}
              >
                <Activity className="h-4.5 w-4.5 text-white" strokeWidth={2.2} />
              </div>
            </div>
          </div>

          {/* ── Body ── */}
          <div className="p-6 space-y-5">

            {/* Input method row */}
            <div className="grid grid-cols-2 gap-3">

              {/* Upload zone */}
              <div
                className={`upload-zone border-2 border-dashed rounded-[14px] p-5 flex flex-col items-center justify-center gap-3 select-none ${
                  dragOver ? "drag-over" : "border-zinc-200 bg-zinc-50/40"
                }`}
                onClick={() => !busy && fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  disabled={busy}
                />
                <div
                  className="h-10 w-10 rounded-[11px] flex items-center justify-center"
                  style={{
                    background: busy && status === "uploading"
                      ? "rgba(16,185,129,0.1)"
                      : "white",
                    border: "1px solid rgba(0,0,0,0.08)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  }}
                >
                  {busy && status === "uploading"
                    ? <Loader2 className="h-4.5 w-4.5 text-emerald-500 animate-spin" />
                    : <UploadCloud className="h-4.5 w-4.5 text-zinc-600" strokeWidth={2} />
                  }
                </div>
                <div className="text-center space-y-0.5">
                  <p className="text-[12px] font-bold text-zinc-800">
                    {status === "uploading" ? "Extracting…" : "Upload Report"}
                  </p>
                  <p className="if-mono text-[9.5px] text-zinc-600">PDF · PNG · JPG</p>
                </div>
              </div>

              {/* Voice zone */}
              <div
                className={`voice-zone border-2 rounded-[14px] p-5 flex flex-col items-center justify-center gap-3 select-none transition-all ${
                  isRecording
                    ? "border-red-200 bg-red-50/30"
                    : "border-zinc-200 bg-zinc-50/40"
                }`}
              >
                <motion.button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={busy}
                  className={`h-10 w-10 rounded-[11px] flex items-center justify-center border transition-colors ${
                    isRecording
                      ? "bg-red-500 border-red-500 rec-pulse"
                      : "bg-white border-zinc-200 hover:bg-zinc-50"
                  }`}
                  style={{ boxShadow: isRecording ? "none" : "0 2px 8px rgba(0,0,0,0.06)" }}
                  whileTap={{ scale: 0.94 }}
                >
                  {isRecording
                    ? <Square className="h-4 w-4 text-white fill-white" />
                    : <Mic className="h-4 w-4 text-zinc-700" strokeWidth={2} />
                  }
                </motion.button>
                <div className="text-center space-y-0.5">
                  <p className="text-[12px] font-bold text-zinc-800">
                    {isRecording ? "Recording…" : "Voice Note"}
                  </p>
                  <p className="if-mono text-[9.5px] text-zinc-600">
                    {isRecording ? "Tap to stop" : "Speak symptoms"}
                  </p>
                </div>
              </div>
            </div>

            {/* Divider with label */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-zinc-100" />
              <span className="section-label px-1">or type directly</span>
              <div className="flex-1 h-px bg-zinc-100" />
            </div>

            {/* Textarea */}
            <div className="relative">
              <Textarea
                className="intake-textarea min-h-[180px] resize-none rounded-[14px] border border-zinc-200 bg-white px-4 py-4 placeholder:text-zinc-600 focus-visible:ring-0 focus-visible:outline-none"
                placeholder="Clinical details, extracted telemetry, and diagnostic notes will populate here — or type directly…"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                disabled={busy || isRecording}
              />

              {/* Character count */}
              {symptoms.length > 0 && (
                <span className="absolute bottom-3 right-4 if-mono text-[9.5px] text-zinc-300 pointer-events-none">
                  {symptoms.length} chars
                </span>
              )}

              {/* Processing overlay */}
              <AnimatePresence>
                {busy && (
                  <motion.div
                    className="absolute inset-0 rounded-[14px] flex flex-col items-center justify-center gap-3"
                    style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(4px)" }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
                      className="h-5 w-5 border-2 border-zinc-900 border-t-transparent rounded-full"
                    />
                    <p className="if-mono text-[10px] tracking-[0.2em] uppercase text-zinc-600 font-medium">
                      {status === "uploading"
                        ? "AI Extraction Active…"
                        : "Compiling Inference Layer…"}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  className="flex items-start gap-2.5 px-4 py-3 rounded-[11px] border border-red-100 bg-red-50"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                >
                  <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" strokeWidth={2} />
                  <p className="text-[12px] font-semibold text-red-700 leading-relaxed">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              className="submit-btn w-full h-12 rounded-[13px] text-white text-[13px] font-bold flex items-center justify-center gap-2.5"
              onClick={handleSubmit}
              disabled={!canSubmit}
              whileTap={canSubmit ? { scale: 0.98 } : {}}
            >
              {status === "processing" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Compiling Clinical Summary…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" strokeWidth={2} />
                  Generate Clinical Summary
                </>
              )}
            </motion.button>

            {/* Footer note */}
            <p className="if-mono text-[9.5px] text-zinc-600 text-center leading-relaxed">
              Summaries are AI-assisted. Final diagnostic authority rests with the attending physician.
            </p>

          </div>
        </motion.div>
      </div>
    </>
  );
}