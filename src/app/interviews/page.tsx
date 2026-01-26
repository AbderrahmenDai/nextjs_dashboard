"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { Search, Calendar as CalendarIcon, CheckCircle, XCircle, Clock, AlertCircle, List, LayoutGrid } from "lucide-react";
import { useState, useEffect } from "react";
import { clsx } from "clsx";
import { api } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";
import { InterviewCalendar } from "@/components/interviews/InterviewCalendar";

// --- Types ---
interface Interview {
    id: string;
    candidatureId: string;
    interviewerId?: string;
    date: string;
    mode: string;
    type: string;
    status: string;
    result: string;
    notes?: string;
    interviewerName?: string;
    candidateFirstName?: string;
    candidateLastName?: string;
    appliedPosition?: string;
    // Optional opinion fields if we want to show them from Candidature join
    hrOpinion?: string;
    technicalOpinion?: string;
}

export default function InterviewsPage() {
    const { t } = useLanguage();
    const [interviews, setInterviews] = useState<Interview[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

    const loadData = async () => {
        try {
            const data = await api.getAllInterviews();
            if (Array.isArray(data)) {
                setInterviews(data);
            } else {
                console.error("API returned invalid data format:", data);
                setInterviews([]);
            }
        } catch (error) {
            console.error("Failed to load interviews:", error);
            setInterviews([]);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleUpdateResult = async (id: string, result: string) => {
        try {
            const status = result === "Passed" || result === "Failed" ? "Completed" : "Scheduled";
            await api.updateInterview(id, { result, status });
            loadData();
        } catch (error) {
            console.error("Failed to update result:", error);
            alert("Failed to update result");
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Completed": return "bg-green-100 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20";
            case "Cancelled": return "bg-red-100 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20";
            case "Scheduled": return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20";
            default: return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20";
        }
    };

    const getResultColor = (result: string) => {
        switch (result) {
            case "Passed": return "text-green-600 dark:text-green-400";
            case "Failed": return "text-red-600 dark:text-red-400";
            default: return "text-amber-600 dark:text-amber-400";
        }
    };

    const filteredInterviews = interviews.filter(i =>
    (i.candidateFirstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.candidateLastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.interviewerName?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <DashboardLayout>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Interviews</h1>
                    <p className="text-muted-foreground mt-1">Manage and track interview progress and results.</p>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4 glass-card p-4 rounded-xl mb-6 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <input
                        type="text"
                        placeholder="Search by candidate or interviewer..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-field pl-10"
                    />
                </div>
                <div className="flex bg-secondary/50 p-1 rounded-lg border border-border">
                    <button
                        onClick={() => setViewMode('list')}
                        className={clsx(
                            "p-2 rounded-md transition-all flex items-center gap-2 text-sm font-medium",
                            viewMode === 'list'
                                ? "bg-background text-primary shadow-sm ring-1 ring-border"
                                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                        )}
                        title="List View"
                    >
                        <List size={18} />
                        <span className="hidden md:inline">List</span>
                    </button>
                    <button
                        onClick={() => setViewMode('calendar')}
                        className={clsx(
                            "p-2 rounded-md transition-all flex items-center gap-2 text-sm font-medium",
                            viewMode === 'calendar'
                                ? "bg-background text-primary shadow-sm ring-1 ring-border"
                                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                        )}
                        title="Calendar View"
                    >
                        <LayoutGrid size={18} />
                        <span className="hidden md:inline">Calendar</span>
                    </button>
                </div>
            </div>

            {/* Content Switcher */}
            {viewMode === 'calendar' ? (
                <InterviewCalendar interviews={filteredInterviews} />
            ) : (
                <div className="glass-card rounded-xl overflow-hidden shadow-sm border border-border">
                    <div className="overflow-x-auto">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Candidate</th>
                                    <th>Position</th>
                                    <th>Interviewer</th>
                                    <th>Type</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Result</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredInterviews.map((interview) => (
                                    <tr key={interview.id} className="group">
                                        <td className="font-medium text-foreground">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm ring-2 ring-background">
                                                    {interview.candidateFirstName?.[0]}{interview.candidateLastName?.[0]}
                                                </div>
                                                <div>
                                                    <div className="font-semibold">{interview.candidateFirstName} {interview.candidateLastName}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="text-muted-foreground">{interview.appliedPosition || "N/A"}</td>
                                        <td className="text-muted-foreground">{interview.interviewerName || "Unassigned"}</td>
                                        <td>
                                            <span className="px-2 py-1 bg-secondary rounded text-xs border border-border font-medium text-secondary-foreground">
                                                {interview.type}
                                            </span>
                                        </td>
                                        <td className="text-muted-foreground">
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="flex items-center gap-1 bg-secondary/30 px-2 py-1 rounded">
                                                    <CalendarIcon size={12} className="text-primary/70" />
                                                    {new Date(interview.date).toLocaleDateString()}
                                                </span>
                                                <span className="flex items-center gap-1 bg-secondary/30 px-2 py-1 rounded">
                                                    <Clock size={12} className="text-primary/70" />
                                                    {new Date(interview.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={clsx("px-2.5 py-0.5 rounded-full text-xs font-semibold border inline-flex items-center gap-1", getStatusColor(interview.status))}>
                                                <div className={clsx("w-1.5 h-1.5 rounded-full", interview.status === 'Completed' ? "bg-green-500" : "bg-current")} />
                                                {interview.status}
                                            </span>
                                        </td>
                                        <td className="font-medium">
                                            <div className={clsx("flex items-center gap-1.5", getResultColor(interview.result))}>
                                                {interview.result === 'Passed' && <CheckCircle size={15} />}
                                                {interview.result === 'Failed' && <XCircle size={15} />}
                                                {interview.result === 'Pending' && <AlertCircle size={15} />}
                                                {interview.result}
                                            </div>
                                        </td>
                                        <td className="text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {interview.result === 'Pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleUpdateResult(interview.id, 'Passed')}
                                                            className="p-2 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400 transition-colors"
                                                            title="Mark as Passed"
                                                        >
                                                            <CheckCircle size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpdateResult(interview.id, 'Failed')}
                                                            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400 transition-colors"
                                                            title="Mark as Failed"
                                                        >
                                                            <XCircle size={18} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredInterviews.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
                                                    <Search size={24} />
                                                </div>
                                                <p>No interviews found matching your criteria.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
