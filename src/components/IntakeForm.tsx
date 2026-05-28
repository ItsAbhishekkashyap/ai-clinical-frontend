"use client";

import { useState, useRef, ChangeEvent } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setStatus, setConsultationData, setError } from "@/store/slices/consultationSlice";
import { uploadMedicalFile, createConsultation, uploadVoiceNote } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Mic, Square, Loader2, UploadCloud } from "lucide-react";

const generateDynamicUserId = () => {
  const timestamp = Math.floor(Date.now() / 1000).toString(16);
  const randomHex = [...Array(16)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
  return timestamp + randomHex;
};

export default function IntakeForm() {
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector((state) => state.consultation);
  const [symptoms, setSymptoms] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const router = useRouter();

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    dispatch(setStatus("uploading"));
    try {
      const extractedText = await uploadMedicalFile(file);
      setSymptoms((prev) => (prev ? `${prev}\n\n${extractedText}` : extractedText));
      dispatch(setStatus("idle"));
    } catch (err: unknown) {
      if (err instanceof Error) {
        dispatch(setError(err.message));
      } else {
        dispatch(setError("Upload failed"));
      }
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
        try {
          const extractedText = await uploadVoiceNote(audioBlob);
          setSymptoms((prev) => (prev ? `${prev}\n\n${extractedText}` : extractedText));
          dispatch(setStatus("idle"));
        } catch (err: unknown) {
          if (err instanceof Error) {
            dispatch(setError(err.message));
          } else {
            dispatch(setError("Voice transcription failed"));
          }
        }
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      dispatch(setError("Microphone access denied or not supported"));
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

    dispatch(setStatus("processing"));
    try {
      const data = await createConsultation({
        userId: generateDynamicUserId(),
        rawText: symptoms,
      });
      dispatch(setConsultationData(data));
      router.push(`/consultation/${data._id}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        dispatch(setError(err.message));
      } else {
        dispatch(setError("Processing failed"));
      }
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-sm border-zinc-200 bg-white rounded-2xl overflow-hidden">
      <CardHeader className="border-b border-zinc-100 bg-zinc-50/50 py-5">
        <CardTitle className="text-xl font-bold tracking-tight text-zinc-900">
          New Consultation Intake
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            className="border-2 border-dashed border-zinc-200 rounded-xl p-6 text-center cursor-pointer hover:border-zinc-400 transition-all bg-zinc-50/50 flex flex-col items-center justify-center space-y-2 group"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".pdf,.png,.jpg,.jpeg,.mp3,.wav"
              onChange={handleFileChange}
            />
            <UploadCloud className="h-6 w-6 text-zinc-400 group-hover:text-zinc-600 transition-colors" />
            <p className="text-xs text-zinc-600 font-semibold tracking-tight">
              {status === "uploading" ? "AI Extraction Active..." : "Upload Medical Reports"}
            </p>
            <p className="text-[10px] text-zinc-400">PDF, PNG, JPG up to 50MB</p>
          </div>

          <div className={`border-2 rounded-xl p-6 text-center flex flex-col items-center justify-center space-y-2 transition-all ${isRecording ? 'border-red-300 bg-red-50/20' : 'border-zinc-200 bg-zinc-50/50'}`}>
            {isRecording ? (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="h-10 w-10 rounded-full animate-pulse shadow-md"
                onClick={stopRecording}
              >
                <Square className="h-4 w-4 fill-white" />
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full border-zinc-300 shadow-sm hover:bg-zinc-100"
                onClick={startRecording}
                disabled={status === "uploading" || status === "processing"}
              >
                <Mic className="h-4 w-4 text-zinc-700" />
              </Button>
            )}
            <p className="text-xs text-zinc-600 font-semibold tracking-tight">
              {isRecording ? "Recording... Click to Stop" : "Record Patient Narrative"}
            </p>
            <p className="text-[10px] text-zinc-400">Speak symptoms or medicine notes</p>
          </div>
        </div>

        <div className="relative">
          <Textarea
            placeholder="Detailed clinical insights, structured symptoms, and critical diagnostic telemetry will populate here automatically upon file parsing or voice stream resolution..."
            className="min-h-[180px] p-4 resize-none rounded-xl focus-visible:ring-1 focus-visible:ring-zinc-400 border-zinc-200 bg-transparent text-sm leading-relaxed text-zinc-800"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            disabled={status === "processing" || status === "uploading" || isRecording}
          />
          {(status === "uploading" || status === "processing") && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] rounded-xl flex items-center justify-center space-y-2 flex-col">
              <Loader2 className="h-6 w-6 text-zinc-900 animate-spin" />
              <p className="text-xs font-bold tracking-tight text-zinc-900 uppercase">
                {status === "uploading" ? "AI Pipeline Extracting..." : "Compiling Final Diagnostic Profile..."}
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-100 rounded-xl">
            <p className="text-xs text-red-700 font-semibold tracking-tight">{error}</p>
          </div>
        )}

        <Button
          className="w-full bg-zinc-900 text-zinc-50 hover:bg-zinc-800 h-12 rounded-xl text-sm font-bold tracking-tight transition-all shadow-sm"
          onClick={handleSubmit}
          disabled={!symptoms?.trim() || status === "processing" || status === "uploading" || isRecording}
        >
          Generate Comprehensive Clinical Summary
        </Button>
      </CardContent>
    </Card>
  );
}