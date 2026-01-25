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
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
            case "Completed": return "bg-green-500/10 text-green-500 border-green-500/20";
            case "Cancelled": return "bg-red-500/10 text-red-500 border-red-500/20";
            case "Scheduled": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
            default: return "bg-slate-500/10 text-slate-500 border-slate-500/20";
        }
    };

    const getResultColor = (result: string) => {
        switch (result) {
            case "Passed": return "text-green-400";
            case "Failed": return "text-red-400";
            default: return "text-yellow-400";
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
                    <h1 className="text-3xl font-bold text-white tracking-tight">Interviews</h1>
                    <p className="text-muted-foreground mt-1">Manage and track interview progress and results.</p>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4 glass-card p-4 rounded-xl mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <input
                        type="text"
                        placeholder="Search by candidate or interviewer..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm text-white placeholder:text-muted-foreground"
                    />
                </div>
                <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
                    <button
                        onClick={() => setViewMode('list')}
                        className={clsx(
                            "p-2 rounded-md transition-all flex items-center gap-2 text-sm font-medium",
                            viewMode === 'list'
                                ? "bg-primary/20 text-primary shadow-sm"
                                : "text-muted-foreground hover:text-white hover:bg-white/5"
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
                                ? "bg-primary/20 text-primary shadow-sm"
                                : "text-muted-foreground hover:text-white hover:bg-white/5"
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
                <div className="glass-card rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/5">
                                    <th className="px-6 py-4 font-semibold text-white">Candidate</th>
                                    <th className="px-6 py-4 font-semibold text-white">Position</th>
                                    <th className="px-6 py-4 font-semibold text-white">Interviewer</th>
                                    <th className="px-6 py-4 font-semibold text-white">Type</th>
                                    <th className="px-6 py-4 font-semibold text-white">Date</th>
                                    <th className="px-6 py-4 font-semibold text-white">Status</th>
                                    <th className="px-6 py-4 font-semibold text-white">Result</th>
                                    <th className="px-6 py-4 font-semibold text-white text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredInterviews.map((interview) => (
                                    <tr key={interview.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4 font-medium text-white">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                    {interview.candidateFirstName?.[0]}{interview.candidateLastName?.[0]}
                                                </div>
                                                <div>
                                                    <div className="font-bold">{interview.candidateFirstName} {interview.candidateLastName}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">{interview.appliedPosition || "N/A"}</td>
                                        <td className="px-6 py-4 text-muted-foreground">{interview.interviewerName || "Unassigned"}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-white/5 rounded text-xs border border-white/10">
                                                {interview.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <CalendarIcon size={14} />
                                                {new Date(interview.date).toLocaleDateString()}
                                                <Clock size={14} className="ml-2" />
                                                {new Date(interview.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={clsx("px-3 py-1 rounded-full text-xs font-medium border", getStatusColor(interview.status))}>
                                                {interview.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium">
                                            <div className={clsx("flex items-center gap-1", getResultColor(interview.result))}>
                                                {interview.result === 'Passed' && <CheckCircle size={14} />}
                                                {interview.result === 'Failed' && <XCircle size={14} />}
                                                {interview.result === 'Pending' && <AlertCircle size={14} />}
                                                {interview.result}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {interview.result === 'Pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleUpdateResult(interview.id, 'Passed')}
                                                            className="p-2 hover:bg-green-500/20 rounded-lg text-green-400 transition-colors"
                                                            title="Mark as Passed"
                                                        >
                                                            <CheckCircle size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpdateResult(interview.id, 'Failed')}
                                                            className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
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
                                            No interviews found.
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
