"use client";

import { MoreHorizontal, Mail, Phone, MapPin, Search, Filter, Plus } from "lucide-react";
import { clsx } from "clsx";

// --- Types ---
interface User {
    id: string;
    name: string;
    email: string;
    role: "Manager" | "Recruiter" | "Employee";
    department: string;
    status: "Active" | "Offline" | "In Meeting";
    avatarGradient: string;
}

// --- Dummy Data ---
const users: User[] = [
    { id: "1", name: "Sarah Connor", email: "sarah.c@tech.co", role: "Manager", department: "Engineering", status: "Active", avatarGradient: "from-pink-500 to-rose-500" },
    { id: "2", name: "John Doe", email: "john.d@tech.co", role: "Recruiter", department: "HR", status: "In Meeting", avatarGradient: "from-blue-500 to-cyan-500" },
    { id: "3", name: "Alice Smith", email: "alice.s@tech.co", role: "Employee", department: "Design", status: "Offline", avatarGradient: "from-purple-500 to-violet-500" },
    { id: "4", name: "Bob Wilson", email: "bob.w@tech.co", role: "Manager", department: "Marketing", status: "Active", avatarGradient: "from-orange-500 to-amber-500" },
    { id: "5", name: "Eva Green", email: "eva.g@tech.co", role: "Employee", department: "Engineering", status: "Active", avatarGradient: "from-emerald-500 to-teal-500" },
];

export function DepartmentUserList() {
    return (
        <div className="glass-card p-6 rounded-2xl flex flex-col h-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">Department Users</h3>
                    <p className="text-muted-foreground text-sm mt-1">Manage team members and access.</p>
                </div>
                <div className="flex gap-2">
                    <button className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors text-white">
                        <Filter size={18} />
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl transition-colors text-sm font-medium shadow-lg shadow-primary/20">
                        <Plus size={18} />
                        <span>Add Member</span>
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                    type="text"
                    placeholder="Search users..."
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-slate-500"
                />
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {users.map((user) => (
                    <div key={user.id} className="group flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all duration-200">
                        <div className="flex items-center gap-4">
                            {/* Avatar */}
                            <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm bg-gradient-to-br shadow-lg", user.avatarGradient)}>
                                {user.name.charAt(0) + user.name.split(' ')[1].charAt(0)}
                            </div>

                            {/* Info */}
                            <div>
                                <h4 className="text-sm font-semibold text-white">{user.name}</h4>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span>{user.email}</span>
                                    <span className="w-1 h-1 bg-slate-600 rounded-full" />
                                    <span className={clsx(
                                        "px-1.5 py-0.5 rounded-md border text-[10px] font-medium uppercase tracking-wider",
                                        user.role === "Manager" ? "bg-purple-500/10 border-purple-500/20 text-purple-300" :
                                            user.role === "Recruiter" ? "bg-blue-500/10 border-blue-500/20 text-blue-300" :
                                                "bg-slate-500/10 border-slate-500/20 text-slate-300"
                                    )}>
                                        {user.role}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Department & Status */}
                        <div className="hidden md:flex items-center gap-6">
                            <div className="text-right">
                                <p className="text-xs text-muted-foreground mb-1">Department</p>
                                <p className="text-sm text-white font-medium">{user.department}</p>
                            </div>

                            <div className="text-right w-24">
                                <p className="text-xs text-muted-foreground mb-1">Status</p>
                                <div className="flex items-center justify-end gap-1.5">
                                    <span className={clsx("w-2 h-2 rounded-full animate-pulse",
                                        user.status === 'Active' ? 'bg-emerald-400' :
                                            user.status === 'In Meeting' ? 'bg-amber-400' : 'bg-slate-500'
                                    )} />
                                    <span className={clsx("text-sm font-medium",
                                        user.status === 'Active' ? 'text-emerald-400' :
                                            user.status === 'In Meeting' ? 'text-amber-400' : 'text-slate-500'
                                    )}>{user.status}</span>
                                </div>
                            </div>

                            <button className="p-2 text-muted-foreground hover:text-white transition-colors">
                                <MoreHorizontal size={20} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function DepartmentStats() {
    return (
        <div className="grid grid-cols-2 gap-4 h-full">
            <div className="glass-card p-5 rounded-2xl flex flex-col justify-between bg-gradient-to-br from-indigo-900/40 to-slate-900/40">
                <div className="p-3 bg-indigo-500/20 w-fit rounded-xl text-indigo-400 mb-2">
                    <MapPin size={24} />
                </div>
                <div>
                    <h4 className="text-muted-foreground text-sm font-medium">Total Departments</h4>
                    <p className="text-3xl font-bold text-white mt-1">8</p>
                </div>
            </div>
            <div className="glass-card p-5 rounded-2xl flex flex-col justify-between bg-gradient-to-br from-pink-900/40 to-slate-900/40">
                <div className="p-3 bg-pink-500/20 w-fit rounded-xl text-pink-400 mb-2">
                    <Search size={24} />
                </div>
                <div>
                    <h4 className="text-muted-foreground text-sm font-medium">Active Recruiters</h4>
                    <p className="text-3xl font-bold text-white mt-1">12</p>
                </div>
            </div>
        </div>
    )
}
