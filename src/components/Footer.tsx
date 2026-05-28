export default function Footer() {
  return (
    <footer className="w-full border-t border-zinc-200/60 bg-zinc-50/50 py-8 mt-auto">
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col text-center sm:text-left gap-1">
          <p className="text-xs font-bold text-zinc-900 tracking-tight">
            AYUNIDAN METAMATRIX CLINICAL PLATFORM
          </p>
          <p className="text-[10px] font-medium text-zinc-400">
            Engineered with Telemetry Infrastructure
          </p>
        </div>
        <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest bg-white border border-zinc-200/60 px-3 py-1.5 rounded-xl shadow-sm">
          Secure Sandbox Node
        </div>
      </div>
    </footer>
  );
}