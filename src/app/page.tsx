
import DashboardOverview from "@/components/DashboardOverview";
import RecentConsultations from "@/components/RecentConsultations";


export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white selection:bg-zinc-950 selection:text-white antialiased">
    
      <main className="flex-1 w-full  sm:px-8 lg:px-12 xl:px-16 py-10 space-y-14">
        <DashboardOverview />
        <RecentConsultations />
      </main>
      
    </div>
  );
}