"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { InterviewCalendar } from "@/components/interviews/InterviewCalendar";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";

import { Calendar as CalendarIcon } from "lucide-react";

export default function CalendarPage() {
    const [interviews, setInterviews] = useState<any[]>([]);

    useEffect(() => {
        const loadInterviews = async () => {
            try {
                const data = await api.getAllInterviews();
                if (Array.isArray(data)) {
                    setInterviews(data);
                }
            } catch (error) {
                console.error("Failed to load interviews:", error);
            }
        };
        loadInterviews();
    }, []);

    return (
        <DashboardLayout>
            <div className="mb-6 pl-1">
                <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl border border-primary/20 shadow-sm">
                        <CalendarIcon className="w-6 h-6 text-primary" />
                    </div>
                    Calendrier
                </h1>
                <p className="text-muted-foreground mt-2 ml-14 font-medium">Consultez et gérez les entretiens planifiés.</p>
            </div>

            <div className="bg-card border border-border/50 rounded-2xl shadow-xl overflow-hidden p-6">
                <InterviewCalendar interviews={interviews} />
            </div>
        </DashboardLayout>
    );
}
