"use client";
import dynamic from "next/dynamic";

const IntakeForm = dynamic(() => import("@/components/IntakeForm"), {
  ssr: false,
  loading: () => (
    <div className="h-[450px] w-full max-w-2xl mx-auto bg-zinc-100 animate-pulse rounded-xl border border-zinc-200" />
  ),
});

export default function NewConsultationPage() {
  return (
    <div className="w-full flex flex-col items-center justify-center py-8 md:py-16">
      <IntakeForm />
    </div>
  );
}