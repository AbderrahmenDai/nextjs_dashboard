"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { InterviewCalendar } from "@/components/interviews/InterviewCalendar";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";

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
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-foreground tracking-tight">Calendar</h1>
                <p className="text-muted-foreground mt-1">View and manage scheduled interviews.</p>
            </div>

            <div className="bg-card border border-border/50 rounded-2xl shadow-xl overflow-hidden p-6">
                <InterviewCalendar interviews={interviews} />
            </div>
        </DashboardLayout>
    );
}
