"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { Plus, Search, Filter, FileText, Clock, CheckCircle, XCircle, MoreVertical } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { clsx } from "clsx";

// Mock Data
const requests = [
    {
        id: "REQ-001",
        title: "Senior Frontend Engineer",
        service: "IT / Engineering",
        category: "Cadre",
        date: "2026-01-20",
        status: "Pending HR",
        requester: "John Doe",
    },
    {
        id: "REQ-002",
        title: "Marketing Specialist",
        service: "Marketing",
        category: "Etam",
        date: "2026-01-18",
        status: "Approved",
        requester: "Jane Smith",
    },
    {
        id: "REQ-003",
        title: "Warehouse Operator",
        service: "Logistics",
        category: "Ouvrier",
        date: "2026-01-15",
        status: "Rejected",
        requester: "Bob Wilson",
    },
    {
        id: "REQ-004",
        title: "HR Coordinator",
        service: "Human Resources",
        category: "Etam",
        date: "2026-01-22",
        status: "Pending Director",
        requester: "Alice Brown",
    },
];

const statusStyles = {
    "Pending HR": "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    "Pending Director": "bg-orange-500/10 text-orange-500 border-orange-500/20",
    "Approved": "bg-green-500/10 text-green-500 border-green-500/20",
    "Rejected": "bg-red-500/10 text-red-500 border-red-500/20",
};

export default function HiringRequestsPage() {
    const [searchTerm, setSearchTerm] = useState("");

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Hiring Requests</h1>
                    <p className="text-muted-foreground mt-1">Manage and track your recruitment requests.</p>
                </div>
                <Link
                    href="/hiring-requests/create"
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)]"
                >
                    <Plus size={20} />
                    New Request
                </Link>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4 glass-card p-4 rounded-xl">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <input
                        type="text"
                        placeholder="Search requests..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm text-white placeholder:text-muted-foreground"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-medium text-muted-foreground hover:text-white hover:bg-white/10 transition-colors">
                    <Filter size={18} />
                    Filter
                </button>
            </div>

            {/* List */}
            <div className="glass-card rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/5">
                                <th className="px-6 py-4 font-semibold text-white">ID</th>
                                <th className="px-6 py-4 font-semibold text-white">Position</th>
                                <th className="px-6 py-4 font-semibold text-white">Service</th>
                                <th className="px-6 py-4 font-semibold text-white">Category</th>
                                <th className="px-6 py-4 font-semibold text-white">Requester</th>
                                <th className="px-6 py-4 font-semibold text-white">Date</th>
                                <th className="px-6 py-4 font-semibold text-white">Status</th>
                                <th className="px-6 py-4 font-semibold text-white text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {requests.filter(r => r.title.toLowerCase().includes(searchTerm.toLowerCase())).map((req) => (
                                <tr key={req.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4 text-muted-foreground font-mono">{req.id}</td>
                                    <td className="px-6 py-4 font-medium text-white">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                                                <FileText size={16} />
                                            </div>
                                            {req.title}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">{req.service}</td>
                                    <td className="px-6 py-4 text-muted-foreground">{req.category}</td>
                                    <td className="px-6 py-4 text-muted-foreground">{req.requester}</td>
                                    <td className="px-6 py-4 text-muted-foreground">{req.date}</td>
                                    <td className="px-6 py-4">
                                        <span className={clsx("px-3 py-1 rounded-full text-xs font-medium border", statusStyles[req.status as keyof typeof statusStyles] || statusStyles["Pending HR"])}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 hover:bg-white/10 rounded-lg text-muted-foreground hover:text-white transition-colors">
                                            <MoreVertical size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
}
