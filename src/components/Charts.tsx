"use client";

import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell, PieChart, Pie, Legend,
    LabelList, RadialBarChart, RadialBar
} from "recharts";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

// --- Shared Components & Config ---

// --- Shared Components & Config ---

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-card/90 backdrop-blur-xl border border-border shadow-2xl rounded-xl px-4 py-3 text-sm">
                <p className="font-semibold mb-1 text-foreground">{label ? label : payload[0].name}</p>
                <p className="text-foreground font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: payload[0].color || payload[0].fill }}></span>
                    {payload[0].value}
                </p>
            </div>
        );
    }
    return null;
};

// --- Pipeline Data ---
const pipelineData = [
    { value: 4, name: "Validation demande", fill: "#312e81" },
    { value: 4, name: "Redaction & Diffusion", fill: "#3730a3" },
    { value: 4, name: "Collecte candidatures", fill: "#4338ca" },
    { value: 4, name: "Validation shortlist", fill: "#4f46e5" },
    { value: 4, name: "Entretiens 1er tour", fill: "#6366f1" },
    { value: 4, name: "Entretiens 2nd tour", fill: "#818cf8" },
    { value: 2, name: "Selection", fill: "#a5b4fc" },
    { value: 2, name: "Visite médicale", fill: "#c7d2fe" },
    { value: 2, name: "Offre d'emploi", fill: "#e0e7ff" },
];

export function PipelineRecruitmentChart() {
    return (
        <div className="bg-card dark:glass-card border border-border/50 p-6 rounded-2xl h-[450px] flex flex-col shadow-lg shadow-gray-200/50 dark:shadow-none transition-all">
            <div className="flex justify-between items-end mb-6 px-2">
                <h3 className="text-lg font-bold text-foreground uppercase tracking-wider opacity-90">Pipeline de Recrutement</h3>
                <span className="text-xs text-indigo-500 bg-indigo-500/10 px-2 py-1 rounded-lg border border-indigo-500/20">Live View</span>
            </div>

            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        layout="vertical"
                        data={pipelineData}
                        margin={{ top: 0, right: 20, bottom: 0, left: 0 }}
                        barSize={20}
                        barGap={4}
                    >
                        <defs>
                            <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.8} />
                                <stop offset="100%" stopColor="#a855f7" stopOpacity={1} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="2 4" horizontal={false} stroke="var(--border)" opacity={0.3} />
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="name"
                            type="category"
                            width={160}
                            tick={{ fill: 'currentColor', fontSize: 13, fontWeight: 500 }}
                            className="text-muted-foreground"
                            axisLine={false}
                            tickLine={false}
                            dx={-10}
                        />
                        <Tooltip cursor={{ fill: 'rgba(100,100,100,0.05)', radius: 8 }} content={<CustomTooltip />} />
                        <Bar
                            dataKey="value"
                            radius={[0, 6, 6, 0]}
                            fill="url(#barGradient)"
                            background={{ fill: 'rgba(100,100,100,0.05)' }}
                        >
                            <LabelList
                                dataKey="value"
                                position="right"
                                className="fill-foreground font-bold text-xs"
                                offset={10}
                            />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

// --- Application Sources Data ---
const sourcesData = [
    { name: "Site officiel", value: 67, fill: "#f43f5e" }, // Rose 500
    { name: "Linkedin", value: 33, fill: "#0ea5e9" }, // Sky 500
];

export function ApplicationSourcesChart() {
    return (
        <div className="bg-card dark:glass-card border border-border/50 p-6 rounded-2xl h-[400px] flex flex-col shadow-lg shadow-gray-200/50 dark:shadow-none transition-all">
            <h3 className="text-lg font-bold text-foreground mb-6 text-center uppercase tracking-wider opacity-90">Sources de Demande</h3>
            <div className="flex-1 w-full min-h-0 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={sourcesData}
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={4}
                            dataKey="value"
                            cornerRadius={6}
                        >
                            {sourcesData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} strokeWidth={0} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px', color: 'var(--muted-foreground)' }} />
                    </PieChart>
                </ResponsiveContainer>
                {/* Center Text */}
                <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                    <span className="text-3xl font-bold text-foreground block">100%</span>
                    <span className="text-xs text-muted-foreground uppercase tracking-widest">Total</span>
                </div>
            </div>
        </div>
    );
}

// --- Recruitment Mode Data ---
const modeData = [
    { name: "Externe", value: 4, fill: "#3b82f6" }, // Blue
    { name: "Interne", value: 3, fill: "#8b5cf6" }, // Violet
];

export function RecruitmentModeChart() {
    return (
        <div className="bg-card dark:glass-card border border-border/50 p-6 rounded-2xl h-[300px] flex flex-col shadow-lg shadow-gray-200/50 dark:shadow-none transition-all">
            <h3 className="text-lg font-bold text-foreground mb-6 text-center uppercase tracking-wider opacity-90">Mode de Recrutement</h3>
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={modeData} barSize={50}>
                        <defs>
                            <linearGradient id="splitColorBar" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#60a5fa" stopOpacity={1} />
                                <stop offset="100%" stopColor="#2563eb" stopOpacity={1} />
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 13 }} dy={10} />
                        <Tooltip cursor={{ fill: 'rgba(100,100,100,0.05)' }} content={<CustomTooltip />} />
                        <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                            {modeData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                            <LabelList dataKey="value" position="top" className="fill-foreground font-bold text-sm" dy={-5} />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

// --- Final Decision Data ---
const decisionData = [
    { name: "Refus", value: 1, fill: "#ef4444" }, // Red
    { name: "En cours", value: 2, fill: "#f59e0b" }, // Amber
    { name: "Embauché", value: 1, fill: "#22c55e" }, // Green
    { name: "Non embauché", value: 0, fill: "#64748b" }, // Slate
];

export function FinalDecisionChart() {
    return (
        <div className="bg-card dark:glass-card border border-border/50 p-6 rounded-2xl h-[300px] flex flex-col shadow-lg shadow-gray-200/50 dark:shadow-none transition-all">
            <h3 className="text-lg font-bold text-foreground mb-6 text-center uppercase tracking-wider opacity-90">Decision Finale</h3>
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={decisionData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={80}
                            paddingAngle={3}
                            dataKey="value"
                            cornerRadius={5}
                        >
                            {decisionData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            verticalAlign="middle"
                            align="right"
                            layout="vertical"
                            iconType="circle"
                            wrapperStyle={{ color: 'var(--muted-foreground)', fontSize: '11px' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

// --- Monthly Applications Data ---
const monthlyData = [
    { name: "Jan", value: 0 },
    { name: "Feb", value: 0 },
    { name: "Mar", value: 0 },
    { name: "Apr", value: 0 },
    { name: "May", value: 2 },
    { name: "Jun", value: 0 },
    { name: "Jul", value: 0 },
    { name: "Aug", value: 0 },
    { name: "Sep", value: 2 },
    { name: "Oct", value: 0 },
    { name: "Nov", value: 0 },
    { name: "Dec", value: 0 },
];

export function MonthlyApplicationsChart() {
    return (
        <div className="bg-card dark:glass-card border border-border/50 p-6 rounded-2xl h-[300px] flex flex-col shadow-lg shadow-gray-200/50 dark:shadow-none transition-all">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-foreground uppercase tracking-wider opacity-90 w-full text-center">Demandes / Mois</h3>
            </div>
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyData}>
                        <defs>
                            <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.6} />
                                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} dy={10} interval={1} />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--muted-foreground)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#06b6d4"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorApps)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

// --- Deadline Respect Data ---
const deadlineData = [
    { name: "Respecté", value: 94, fill: "#eab308" }, // Yellow 500
    { name: "Non Respecté", value: 6, fill: "#334155" }, // Slate 700
];

export function DeadlineRespectChart() {
    return (
        <div className="bg-card dark:glass-card border border-border/50 p-6 rounded-2xl h-[300px] flex flex-col items-center justify-center relative overflow-hidden shadow-lg shadow-gray-200/50 dark:shadow-none transition-all">
            {/* Background glow for effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl"></div>

            <h3 className="text-lg font-bold text-foreground mb-6 text-center uppercase tracking-wider opacity-90 z-10">Delais Respectés</h3>

            <div className="flex-1 w-full min-h-0 flex items-center justify-center relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={deadlineData}
                            cx="50%"
                            cy="70%"
                            startAngle={180}
                            endAngle={0}
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={0}
                            dataKey="value"
                            stroke="none"
                            cornerRadius={8}
                        >
                            {deadlineData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute top-[65%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                    <span className="text-4xl font-black text-foreground drop-shadow-sm">94%</span>
                    <span className="block text-xs text-yellow-500 font-medium uppercase mt-1">On Time</span>
                </div>
            </div>
        </div>
    );
}

// --- Recruitment Rate Data ---
const rateData = [
    { name: "Recrutement", value: 14, fill: "#10b981" }, // Emerald 500
];


export function RecruitmentRateChart() {
    return (
        <div className="bg-card dark:glass-card border border-border/50 p-6 rounded-2xl h-[300px] flex flex-col items-center justify-center relative overflow-hidden shadow-lg shadow-gray-200/50 dark:shadow-none transition-all">
            {/* Background glow for effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>

            <h3 className="text-lg font-bold text-foreground mb-6 text-center uppercase tracking-wider opacity-90 z-10">Taux Recrutement</h3>

            <div className="flex-1 w-full min-h-0 flex items-center justify-center relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                        innerRadius="70%"
                        outerRadius="100%"
                        barSize={20}
                        data={rateData}
                        startAngle={180}
                        endAngle={0}
                    >
                        <RadialBar
                            // label={{ position: 'insideStart', fill: '#fff' }}
                            background={{ fill: 'var(--muted)' }}
                            dataKey="value"
                            cornerRadius={20}
                            fill="#10b981"
                        />
                        <Tooltip content={<CustomTooltip />} />
                    </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute top-[60%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                    <span className="text-4xl font-black text-foreground drop-shadow-sm">14%</span>
                    <span className="block text-xs text-emerald-500 font-medium uppercase mt-1">Conversion</span>
                </div>
            </div>
        </div>
    );
}

// --- Department User Count Data ---
const colorMap: { [key: string]: string } = {
    "bg-red-500": "#ef4444",
    "bg-orange-500": "#f97316",
    "bg-amber-500": "#f59e0b",
    "bg-yellow-500": "#eab308",
    "bg-lime-500": "#84cc16",
    "bg-green-500": "#22c55e",
    "bg-emerald-500": "#10b981",
    "bg-teal-500": "#14b8a6",
    "bg-cyan-500": "#06b6d4",
    "bg-sky-500": "#0ea5e9",
    "bg-blue-500": "#3b82f6",
    "bg-indigo-500": "#6366f1",
    "bg-violet-500": "#8b5cf6",
    "bg-purple-500": "#a855f7",
    "bg-fuchsia-500": "#d946ef",
    "bg-pink-500": "#ec4899",
    "bg-rose-500": "#f43f5e",
    "bg-slate-500": "#64748b",
    "bg-gray-500": "#6b7280",
};

export function DepartmentUserCountChart() {
    const [data, setData] = useState<any[]>([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const depts = await api.getDepartments();
                if (!Array.isArray(depts)) {
                    console.error("Expected array for departments but got:", depts);
                    setData([]);
                    return;
                }
                const chartData = depts.map((dept: any) => ({
                    name: dept.name,
                    value: dept.employeeCount || 0,
                    fill: colorMap[dept.colorCallback] || "#94a3b8" // Default slate
                }));
                // Sort by value desc
                chartData.sort((a: any, b: any) => b.value - a.value);
                setData(chartData);
            } catch (error) {
                console.error("Failed to load department stats:", error);
            }
        };
        loadData();
    }, []);

    return (
        <div className="bg-card dark:glass-card border border-border/50 p-6 rounded-2xl h-[400px] flex flex-col shadow-lg shadow-gray-200/50 dark:shadow-none transition-all">
            <h3 className="text-lg font-bold text-foreground mb-6 text-center uppercase tracking-wider opacity-90">Users per Department</h3>
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <defs>
                            <linearGradient id="barGradientBlue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#60a5fa" stopOpacity={1} />
                                <stop offset="100%" stopColor="#2563eb" stopOpacity={1} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                        />
                        <Tooltip cursor={{ fill: 'rgba(100,100,100,0.05)' }} content={<CustomTooltip />} />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                            <LabelList dataKey="value" position="top" className="fill-foreground font-bold" fontSize={14} dy={-5} />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
