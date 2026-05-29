"use client";

import { useState, useRef, ChangeEvent } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setStatus, setConsultationData, setError } from "@/store/slices/consultationSlice";
import { uploadMedicalFile, createConsultation, uploadVoiceNote } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Mic, Square, Loader2, UploadCloud, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function IntakeForm() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  
  // Grab active loading statuses from consultation slice
  const { status, error } = useAppSelector((state) => state.consultation);
  // Pull authenticated user instance profile directly to guarantee data mapping safety
  const { user } = useAppSelector((state) => state.auth);

  const [symptoms, setSymptoms] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    dispatch(setStatus("uploading"));
    const toastId = toast.loading("AI Pipeline parsing report diagnostics...");
    try {
      const extractedText = await uploadMedicalFile(file);
      setSymptoms((prev) => (prev ? `${prev}\n\n${extractedText}` : extractedText));
      dispatch(setStatus("idle"));
      toast.success("Medical chart extracted successfully", { id: toastId });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      dispatch(setError(msg));
      toast.error(msg, { id: toastId });
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        stream.getTracks().forEach((track) => track.stop());
        
        dispatch(setStatus("uploading"));
        const toastId = toast.loading("Processing streaming voice note telemetry...");
        try {
          const extractedText = await uploadVoiceNote(audioBlob);
          setSymptoms((prev) => (prev ? `${prev}\n\n${extractedText}` : extractedText));
          dispatch(setStatus("idle"));
          toast.success("Voice transcript appended successfully", { id: toastId });
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Voice transcription failed";
          dispatch(setError(msg));
          toast.error(msg, { id: toastId });
        }
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      dispatch(setError("Microphone access denied or not supported"));
      toast.error("Microphone hardware access denied");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSubmit = async () => {
    if (!symptoms?.trim()) return;

    // Secure Verification Step
    if (!user?.id) {
      toast.error("Session identity lost. Please re-authenticate.");
      router.push("/login");
      return;
    }

    dispatch(setStatus("processing"));
    try {
      const data = await createConsultation({
        userId: user.id, // 👈 Safe binding to real authenticated database context
        rawText: symptoms,
      });
      dispatch(setConsultationData(data));
      toast.success("Comprehensive summary compiled successfully");
      router.push(`/consultation/${data._id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Processing failed";
      dispatch(setError(msg));
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-zinc-200 bg-white shadow-xl/40 rounded-2xl overflow-hidden transition-all duration-300">
      <CardHeader className="border-b border-zinc-100 bg-zinc-50/50 p-5 sm:p-6 text-left">
        <CardTitle className="text-lg font-bold tracking-tight text-zinc-900 sm:text-xl">
          New Consultation Intake
        </CardTitle>
        <CardDescription className="text-xs text-zinc-500 tracking-tight mt-0.5">
          Stream unstructured charts, symptoms, or multi-modal recordings into the clinical analyzer stack.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6 p-5 sm:p-6">
        {/* Multimodal Entry Grid Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* File Upload Zone */}
          <div
            className="border-2 border-dashed border-zinc-200 hover:border-zinc-400 rounded-xl p-5 sm:p-6 text-center cursor-pointer transition-all duration-200 bg-zinc-50/30 flex flex-col items-center justify-center space-y-2 group"
            onClick={() => status !== "uploading" && status !== "processing" && fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileChange}
              disabled={status === "uploading" || status === "processing"}
            />
            <div className="p-2.5 bg-white border border-zinc-200 rounded-xl shadow-sm group-hover:scale-105 transition-transform">
              <UploadCloud className="h-5 w-5 text-zinc-600" />
            </div>
            <p className="text-xs text-zinc-800 font-bold tracking-tight">
              {status === "uploading" ? "AI Extraction Active..." : "Upload Medical Reports"}
            </p>
            <p className="text-[10px] font-medium text-zinc-400">PDF, PNG, JPG files up to 50MB</p>
          </div>

          {/* Voice Stream Recording Module */}
          <div className={`border-2 rounded-xl p-5 sm:p-6 text-center flex flex-col items-center justify-center space-y-2 transition-all duration-200 ${
            isRecording ? 'border-red-200 bg-red-50/30 animate-pulse' : 'border-zinc-200 bg-zinc-50/30'
          }`}>
            {isRecording ? (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="h-10 w-10 rounded-xl shadow-md flex items-center justify-center transition-transform hover:scale-105"
                onClick={stopRecording}
              >
                <Square className="h-4 w-4 fill-white text-white" />
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-xl border-zinc-200 shadow-sm bg-white text-zinc-700 hover:bg-zinc-50 flex items-center justify-center transition-transform hover:scale-105"
                onClick={startRecording}
                disabled={status === "uploading" || status === "processing"}
              >
                <Mic className="h-4 w-4 text-zinc-800 stroke-[2]" />
              </Button>
            )}
            <p className="text-xs text-zinc-800 font-bold tracking-tight">
              {isRecording ? "Streaming Narrative... Click Stop" : "Record Patient Voice"}
            </p>
            <p className="text-[10px] font-medium text-zinc-400">Speak structural symptoms or dosage</p>
          </div>
        </div>

        {/* Text Display Processing Boundary Area */}
        <div className="relative group">
          <Textarea
            placeholder="Clinical details, extracted structured telemetry, and diagnostic logs will automatically populate here upon processing multi-modal documents..."
            className="min-h-[160px] md:min-h-[200px] p-4 resize-none rounded-xl focus-visible:ring-1 focus-visible:ring-zinc-400 border-zinc-200 bg-zinc-50/10 text-sm leading-relaxed text-zinc-800 placeholder:text-zinc-400"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            disabled={status === "processing" || status === "uploading" || isRecording}
          />
          
          {(status === "uploading" || status === "processing") && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] rounded-xl flex items-center justify-center space-y-2 flex-col z-20 transition-all">
              <Loader2 className="h-5 w-5 text-zinc-900 animate-spin" />
              <p className="text-[11px] font-bold tracking-wider text-zinc-900 font-mono uppercase">
                {status === "uploading" ? "AI Extraction Pipeline Syncing..." : "Compiling Clinical Inference Layer..."}
              </p>
            </div>
          )}
        </div>

        {/* Error Boundary Elements */}
        {error && (
          <div className="p-3.5 bg-red-50/80 border border-red-100 rounded-xl flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
            <p className="text-xs text-red-700 font-semibold tracking-tight leading-normal">{error}</p>
          </div>
        )}

        {/* Main Process Execution CTA Button */}
        <Button
          className="w-full bg-zinc-950 text-white hover:bg-zinc-800 h-12 rounded-xl text-xs font-bold tracking-wide transition-all shadow-md hover:shadow-lg disabled:opacity-40 disabled:hover:shadow-none"
          onClick={handleSubmit}
          disabled={!symptoms?.trim() || status === "processing" || status === "uploading" || isRecording}
        >
          {status === "processing" ? "Reconciling Analytics..." : "Generate Comprehensive Clinical Summary"}
        </Button>
      </CardContent>
    </Card>
  );
}