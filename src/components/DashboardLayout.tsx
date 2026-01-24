import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-background text-foreground flex">
            <Sidebar />
            <main className="flex-1 md:ml-72 min-h-screen relative overflow-hidden flex flex-col">
                <Header />
                {/* Background Decoration */}
                <div className="fixed inset-0 z-[-1] pointer-events-none">
                    <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px]" />
                    <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-[100px]" />
                </div>

                <div className="p-8 max-w-7xl mx-auto space-y-8 w-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
