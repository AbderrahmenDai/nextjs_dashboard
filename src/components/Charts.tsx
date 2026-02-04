import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    Cell,
    PieChart,
    Pie,
    LabelList,
    AreaChart,
    Area,
    RadialBarChart,
    RadialBar
} from "recharts";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { clsx } from "clsx";
import { motion } from "framer-motion";

// --- Shared Components & Config ---

interface CustomTooltipPayload {
    name: string;
    value: number;
    color?: string;
    fill?: string;
    unit?: string;
    payload?: Record<string, unknown>;
}

interface Department {
    id: string;
    name: string;
    employeeCount?: number;
    colorCallback?: string;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: any[];
    label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-background/80 backdrop-blur-xl border border-border shadow-2xl rounded-2xl p-4 min-w-[150px] animate-in fade-in zoom-in duration-200">
                <div className="flex items-center gap-2 mb-2 border-b border-border pb-2">
                    <div className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: payload[0].color || payload[0].fill }}></div>
                    <p className="font-bold text-xs uppercase tracking-widest text-muted-foreground">{label || payload[0].name}</p>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-foreground">{payload[0].value}</span>
                    <span className="text-[10px] text-muted-foreground font-medium uppercase">{payload[0].unit || 'units'}</span>
                </div>
            </div>
        );
    }
    return null;
};

// --- Pipeline Data ---
const defaultPipelineData = [
    { value: 4, name: "Validation demande", fill: "#4f46e5" }, // Indigo 600
    { value: 4, name: "Redaction & Diffusion", fill: "#6366f1" }, // Indigo 500
    { value: 4, name: "Collecte candidatures", fill: "#818cf8" }, // Indigo 400
    { value: 4, name: "Validation shortlist", fill: "#a855f7" }, // Purple 500
    { value: 4, name: "Entretiens 1er tour", fill: "#d946ef" }, // Fuchsia 500
    { value: 4, name: "Entretiens 2nd tour", fill: "#ec4899" }, // Pink 500
    { value: 2, name: "Selection", fill: "#f43f5e" }, // Rose 500
    { value: 2, name: "Visite médicale", fill: "#fb7185" }, // Rose 400
    { value: 2, name: "Offre d'emploi", fill: "#fda4af" }, // Rose 300
];

export function PipelineRecruitmentChart({ data = defaultPipelineData }: { data?: any[] }) {
    return (
        <div className="glass-card p-8 rounded-3xl h-[500px] flex flex-col group relative overflow-hidden ring-offset-background">
            <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-all duration-700 -rotate-12 translate-x-12 -translate-y-12">
                <div className="w-64 h-64 border-[20px] border-primary rounded-full" />
            </div>

            <div className="relative z-10 flex justify-between items-start mb-8">
                <div>
                    <h3 className="text-xl font-black text-foreground uppercase tracking-tighter">Flux de Recrutement</h3>
                    <p className="text-xs text-muted-foreground font-medium mt-1">Analyse du tunnel de conversion en temps réel</p>
                </div>
                <div className="flex gap-2">
                    <span className="text-[10px] font-black text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20 uppercase tracking-widest">Live Optimization</span>
                </div>
            </div>

            <div className="flex-1 w-full min-h-0 relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        layout="vertical"
                        data={data}
                        margin={{ top: 0, right: 60, bottom: 0, left: 20 }}
                        barSize={14}
                        barGap={12}
                    >
                        <defs>
                            <linearGradient id="pipelineGradient" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#818cf8" />
                                <stop offset="100%" stopColor="#c084fc" />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="4 4" horizontal={false} stroke="var(--border)" opacity={0.4} />
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="name"
                            type="category"
                            width={160}
                            tick={{ fill: 'currentColor', fontSize: 11, fontWeight: 700 }}
                            className="text-muted-foreground/70 uppercase tracking-tight"
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            cursor={{ fill: 'rgba(129, 140, 248, 0.05)', radius: 10 }}
                            content={<CustomTooltip />}
                        />
                        <Bar
                            dataKey="value"
                            radius={[0, 10, 10, 0]}
                            fill="url(#pipelineGradient)"
                            background={{ fill: 'rgba(100,100,100,0.03)', radius: 10 }}
                        >
                            <LabelList
                                dataKey="value"
                                position="right"
                                className="fill-foreground font-black text-[11px]"
                                offset={15}
                                formatter={(v: any) => v > 0 ? `${v} Pers.` : ''}
                            />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

// --- Application Sources Data ---
const defaultSourcesData = [
    { name: "LINKEDIN", value: 60, fill: "#0ea5e9" }, // Bleu LinkedIn
    { name: "CABINET", value: 30, fill: "#10b981" }, // Vert
    { name: "AUTRES", value: 10, fill: "#64748b" }, // Gris
];

export function ApplicationSourcesChart({ data = defaultSourcesData }: { data?: any[] }) {
    const total = data.reduce((acc, curr) => acc + (curr.value || 0), 0);

    return (
        <div className="glass-card p-8 rounded-3xl h-[400px] flex flex-col group relative overflow-hidden">
            <h3 className="text-lg font-black text-foreground mb-1 uppercase tracking-tighter">Canaux d&apos;Acquisition</h3>
            <p className="text-xs text-muted-foreground font-medium mb-6">Origine des talents</p>

            <div className="flex-1 w-full min-h-0 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            innerRadius={75}
                            outerRadius={105}
                            paddingAngle={8}
                            dataKey="value"
                            cornerRadius={12}
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.fill}
                                    className="transition-all duration-300 hover:opacity-80 outline-none"
                                />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            verticalAlign="bottom"
                            align="center"
                            iconType="circle"
                            wrapperStyle={{ paddingTop: '25px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
                {/* Center Text */}
                <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                    <span className="text-3xl font-black text-foreground block tracking-tighter">{total}</span>
                    <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest opacity-60">Total Hits</span>
                </div>
            </div>
        </div>
    );
}

// --- Recruitment Mode Data ---
const defaultModeData = [
    { name: "Externe", value: 4, fill: "#3b82f6" }, // Blue
    { name: "Interne", value: 3, fill: "#8b5cf6" }, // Violet
];

export function RecruitmentModeChart({ data = defaultModeData }: { data?: any[] }) {
    return (
        <div className="glass-card p-6 rounded-3xl h-[320px] flex flex-col group relative overflow-hidden">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-black text-foreground uppercase tracking-widest opacity-80">Stratégie Source</h3>
                <div className="w-8 h-1 bg-primary/20 rounded-full" />
            </div>

            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} barSize={40} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="modeGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="hsl(var(--primary))" />
                                <stop offset="100%" stopColor="hsl(var(--primary) / 0.5)" />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'var(--muted-foreground)', fontSize: 10, fontWeight: 800, textTransform: 'uppercase' }}
                            dy={15}
                        />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
                        <Tooltip cursor={{ fill: 'rgba(var(--primary), 0.05)', radius: 10 }} content={<CustomTooltip />} />
                        <Bar dataKey="value" radius={[10, 10, 10, 10]}>
                            {data.map((entry: any, index: number) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={index === 0 ? 'url(#modeGradient)' : '#a855f7'}
                                    className="transition-all duration-500 hover:brightness-110"
                                />
                            ))}
                            <LabelList dataKey="value" position="top" className="fill-foreground font-black text-[10px]" dy={-10} />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

// --- Final Decision Data ---
const defaultDecisionData = [
    { name: "Refus", value: 1, fill: "#ef4444" }, // Red
    { name: "En cours", value: 2, fill: "#f59e0b" }, // Amber
    { name: "Embauché", value: 1, fill: "#10b981" }, // Emerald
    { name: "Non embauché", value: 0, fill: "#64748b" }, // Slate
];

export function FinalDecisionChart({ data = defaultDecisionData }: { data?: any[] }) {
    return (
        <div className="glass-card p-6 rounded-3xl h-[320px] flex flex-col group relative overflow-hidden">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-black text-foreground uppercase tracking-widest opacity-80">Statut des Issues</h3>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={85}
                            paddingAngle={5}
                            dataKey="value"
                            cornerRadius={10}
                            stroke="none"
                        >
                            {data.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} className="transition-all hover:scale-105" />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            verticalAlign="middle"
                            align="right"
                            layout="vertical"
                            iconType="circle"
                            wrapperStyle={{ color: 'var(--muted-foreground)', fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', paddingLeft: '10px' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

// --- Monthly Applications Data ---
const defaultMonthlyData = [
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

export function MonthlyApplicationsChart({ data = defaultMonthlyData }: { data?: any[] }) {
    const primaryColor = "hsl(var(--primary))";

    return (
        <div className="glass-card p-6 rounded-3xl h-[320px] flex flex-col group relative overflow-hidden">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-black text-foreground uppercase tracking-widest opacity-80">Flux Temporel</h3>
                <span className="text-[10px] font-black opacity-40">LAST 12 MONTHS</span>
            </div>

            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={primaryColor} stopOpacity={0.4} />
                                <stop offset="95%" stopColor={primaryColor} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="var(--border)" opacity={0.3} />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 9, fill: 'var(--muted-foreground)', fontWeight: 800 }}
                            dy={10}
                        />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={primaryColor}
                            strokeWidth={4}
                            fillOpacity={1}
                            fill="url(#colorApps)"
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

// --- Deadline Respect Data ---
const defaultDeadlineData = [
    { name: "Respecté", value: 94, fill: "#eab308" }, // Yellow 500
    { name: "Non Respecté", value: 6, fill: "#334155" }, // Slate 700
];

export function DeadlineRespectChart({ data = defaultDeadlineData }: { data?: any[] }) {
    const rate = data.find(d => d.name === 'Respecté')?.value || 0;
    const total = data.reduce((acc, d) => acc + d.value, 0);
    const percentage = total > 0 ? ((rate / total) * 100).toFixed(0) : "0";

    return (
        <div className="glass-card p-6 rounded-3xl h-[300px] flex flex-col items-center justify-center relative overflow-hidden group">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-yellow-500/10 rounded-full blur-[80px] group-hover:bg-yellow-500/20 transition-all duration-700" />
            <h3 className="text-sm font-black text-foreground mb-6 text-center uppercase tracking-widest opacity-70 z-10">Delais Respectés</h3>
            <div className="flex-1 w-full min-h-0 flex items-center justify-center relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="70%"
                            startAngle={180}
                            endAngle={0}
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="value"
                            stroke="none"
                            cornerRadius={4}
                        >
                            {data.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} className="transition-all duration-500 hover:brightness-110" />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute top-[65%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                    <span className="text-4xl font-black text-foreground tracking-tighter">{percentage}%</span>
                    <span className="block text-[10px] text-yellow-500 font-black uppercase mt-1 tracking-widest">On Time</span>
                </div>
            </div>
        </div>
    );
}

// --- Recruitment Rate Data ---
const defaultRateData = [
    { name: "Recrutement", value: 14, fill: "#10b981" }, // Emerald 500
];


export function RecruitmentRateChart({ data = defaultRateData }: { data?: any[] }) {
    const value = data[0]?.value || 0;
    const hiredCount = data[0]?.hiredCount || 0;
    const totalStaffBeforeHiring = data[0]?.totalStaffBeforeHiring || 0;

    return (
        <div className="glass-card p-6 rounded-2xl h-[300px] flex flex-col items-center justify-center relative overflow-hidden shadow-xl transition-all hover:border-primary/20">
            {/* Background glow for effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>

            <h3 className="text-lg font-bold text-foreground mb-6 text-center uppercase tracking-wider opacity-90 z-10">Taux Recrutement</h3>

            <div className="flex-1 w-full min-h-0 flex items-center justify-center relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                        innerRadius="70%"
                        outerRadius="100%"
                        barSize={20}
                        data={data}
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
                    <span className="text-4xl font-black text-foreground drop-shadow-sm">{value}%</span>
                    <span className="block text-xs text-emerald-500 font-medium uppercase mt-1">Taux</span>
                    {hiredCount > 0 && totalStaffBeforeHiring > 0 && (
                        <div className="mt-3 text-[10px] text-muted-foreground font-medium">
                            <div className="flex items-center justify-center gap-1">
                                <span className="text-emerald-500 font-black">{hiredCount}</span>
                                <span>/</span>
                                <span className="font-black">{totalStaffBeforeHiring}</span>
                            </div>
                            <span className="block text-[8px] uppercase tracking-wider mt-0.5">Embauchés / Effectif</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// --- Offer Acceptance Rate Data ---
const defaultOfferAcceptanceData = [
    { name: "Acceptation", value: 85, fill: "#3b82f6" }, // Blue 500
];

export function OfferAcceptanceRateChart({ data = defaultOfferAcceptanceData }: { data?: any[] }) {
    const value = data[0]?.value || 0;
    const acceptedOffers = data[0]?.acceptedOffers || 0;
    const totalOffers = data[0]?.totalOffers || 0;

    return (
        <div className="glass-card p-6 rounded-2xl h-[300px] flex flex-col items-center justify-center relative overflow-hidden shadow-xl transition-all hover:border-primary/20">
            {/* Background glow for effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>

            <h3 className="text-lg font-bold text-foreground mb-6 text-center uppercase tracking-wider opacity-90 z-10">Taux d&apos;Acceptation des Offres</h3>

            <div className="flex-1 w-full min-h-0 flex items-center justify-center relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                        innerRadius="70%"
                        outerRadius="100%"
                        barSize={20}
                        data={data}
                        startAngle={180}
                        endAngle={0}
                    >
                        <RadialBar
                            background={{ fill: 'var(--muted)' }}
                            dataKey="value"
                            cornerRadius={20}
                            fill="#3b82f6"
                        />
                        <Tooltip content={<CustomTooltip />} />
                    </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute top-[60%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                    <span className="text-4xl font-black text-foreground drop-shadow-sm">{value}%</span>
                    <span className="block text-xs text-blue-500 font-medium uppercase mt-1">Acceptation</span>
                    {totalOffers > 0 && (
                        <span className="block text-[10px] text-muted-foreground mt-2">
                            {acceptedOffers}/{totalOffers} offres
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

// --- Time to Fill Data ---
const defaultTimeToFillData = [
    { name: "Délai", value: 30, fill: "#f59e0b" }, // 30 jours par défaut
];

export function TimeToFillChart({ data = defaultTimeToFillData }: { data?: any[] }) {
    const averageDays = data[0]?.value || 0;
    const minDays = data[0]?.minDays || 0;
    const maxDays = data[0]?.maxDays || 0;
    const totalHires = data[0]?.totalHires || 0;

    return (
        <div className="glass-card p-6 rounded-2xl h-[300px] flex flex-col items-center justify-center relative overflow-hidden shadow-xl transition-all hover:border-primary/20">
            {/* Background glow for effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl"></div>

            <h3 className="text-lg font-bold text-foreground mb-6 text-center uppercase tracking-wider opacity-90 z-10">Time to Fill</h3>

            <div className="flex-1 w-full min-h-0 flex items-center justify-center relative z-10">
                <div className="text-center">
                    {/* Main metric */}
                    <div className="mb-4">
                        <div className="flex items-baseline justify-center gap-2">
                            <span className="text-6xl font-black text-foreground drop-shadow-lg">{averageDays}</span>
                            <span className="text-2xl font-bold text-orange-500">jours</span>
                        </div>
                        <div className="flex items-center justify-center gap-2 mt-2">
                            <div className="h-1 w-8 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"></div>
                            <span className="text-xs text-orange-500 font-bold uppercase tracking-widest">Délai Moyen</span>
                            <div className="h-1 w-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"></div>
                        </div>
                    </div>

                    {/* Details */}
                    {totalHires > 0 && (
                        <div className="space-y-2 mt-6 bg-secondary/30 rounded-xl p-4 backdrop-blur-sm">
                            <div className="flex items-center justify-between gap-6 text-xs">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    <span className="text-muted-foreground font-medium">Plus rapide</span>
                                </div>
                                <span className="font-black text-foreground">{minDays} jours</span>
                            </div>
                            <div className="flex items-center justify-between gap-6 text-xs">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                    <span className="text-muted-foreground font-medium">Plus long</span>
                                </div>
                                <span className="font-black text-foreground">{maxDays} jours</span>
                            </div>
                            <div className="pt-2 border-t border-border/50">
                                <div className="flex items-center justify-between gap-6 text-xs">
                                    <span className="text-orange-500 font-bold uppercase">Recrutements</span>
                                    <span className="font-black text-orange-500">{totalHires}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// --- Time to Fill Detailed Chart (Délai de recrutement détaillé) ---
interface TimeToFillDetailedData {
    byDepartment?: Array<{
        department: string;
        averageDays: number;
        minDays: number;
        maxDays: number;
        hireCount: number;
    }>;
    byMonth?: Array<{
        month: string;
        averageDays: number;
        hireCount: number;
    }>;
    overall: {
        averageDays: number;
        minDays: number;
        maxDays: number;
        totalHires: number;
    };
}

const defaultTimeToFillDetailedData: TimeToFillDetailedData = {
    byDepartment: [
        { department: "IT", averageDays: 28, minDays: 15, maxDays: 45, hireCount: 5 },
        { department: "RH", averageDays: 35, minDays: 20, maxDays: 50, hireCount: 3 },
        { department: "Finance", averageDays: 42, minDays: 30, maxDays: 60, hireCount: 2 },
    ],
    byMonth: [
        { month: "Jan", averageDays: 30, hireCount: 2 },
        { month: "Feb", averageDays: 35, hireCount: 3 },
        { month: "Mar", averageDays: 28, hireCount: 4 },
        { month: "Apr", averageDays: 32, hireCount: 1 },
    ],
    overall: {
        averageDays: 32,
        minDays: 15,
        maxDays: 60,
        totalHires: 10,
    }
};

// Tooltip personnalisé pour le graphique détaillé Time to Fill
const TimeToFillDetailedTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
        const item = payload[0];
        return (
            <div className="bg-background/95 backdrop-blur-xl border border-border shadow-2xl rounded-2xl p-4 min-w-[200px] animate-in fade-in zoom-in duration-200">
                <p className="font-black text-xs uppercase tracking-widest text-muted-foreground mb-3 border-b border-border pb-2">
                    {item.payload?.department || item.payload?.month}
                </p>
                <div className="space-y-2">
                    <div className="flex items-center justify-between gap-4">
                        <span className="text-xs text-muted-foreground">Délai moyen</span>
                        <span className="text-xl font-black text-orange-500">{item.value} jours</span>
                    </div>
                    {item.payload?.minDays !== undefined && (
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-xs text-muted-foreground">Min</span>
                            <span className="text-sm font-bold text-green-500">{item.payload.minDays}j</span>
                        </div>
                    )}
                    {item.payload?.maxDays !== undefined && (
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-xs text-muted-foreground">Max</span>
                            <span className="text-sm font-bold text-red-500">{item.payload.maxDays}j</span>
                        </div>
                    )}
                    <div className="pt-2 border-t border-border/50">
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-xs text-muted-foreground">Recrutements</span>
                            <span className="text-lg font-black text-foreground">{item.payload?.hireCount}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

export function TimeToFillDetailedChart({ data = defaultTimeToFillDetailedData }: { data?: TimeToFillDetailedData }) {
    const [viewMode, setViewMode] = useState<'department' | 'monthly'>('department');
    const { overall, byDepartment = [], byMonth = [] } = data;

    return (
        <div className="glass-card p-8 rounded-3xl min-h-[500px] flex flex-col group relative overflow-hidden shadow-xl transition-all hover:border-primary/20">
            {/* Background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px]"></div>

            {/* Header */}
            <div className="flex items-start justify-between mb-6 relative z-10">
                <div>
                    <h3 className="text-2xl font-black text-foreground uppercase tracking-tighter mb-2">
                        Délai de Recrutement (Time to Fill)
                    </h3>
                    <p className="text-xs text-muted-foreground font-medium">
                        Durée entre la validation du poste et l&apos;occupation effective
                    </p>
                </div>

                {/* View Mode Toggle */}
                <div className="flex gap-2 bg-secondary/50 p-1 rounded-lg border border-border">
                    <button
                        onClick={() => setViewMode('department')}
                        className={clsx(
                            "px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all",
                            viewMode === 'department'
                                ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        📊 Par Département
                    </button>
                    <button
                        onClick={() => setViewMode('monthly')}
                        className={clsx(
                            "px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all",
                            viewMode === 'monthly'
                                ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        📅 Évolution Mensuelle
                    </button>
                </div>
            </div>

            {/* Overall Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/30 rounded-xl p-4 backdrop-blur-sm"
                >
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-2">Délai Moyen</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-orange-500">{overall.averageDays}</span>
                        <span className="text-sm font-bold text-orange-500/70">jours</span>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-4 backdrop-blur-sm"
                >
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-2">Plus Rapide</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-green-500">{overall.minDays}</span>
                        <span className="text-sm font-bold text-green-500/70">jours</span>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-red-500/20 to-rose-500/20 border border-red-500/30 rounded-xl p-4 backdrop-blur-sm"
                >
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-2">Plus Long</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-red-500">{overall.maxDays}</span>
                        <span className="text-sm font-bold text-red-500/70">jours</span>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-4 backdrop-blur-sm"
                >
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-2">Total Recrutés</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-blue-500">{overall.totalHires}</span>
                        <span className="text-sm font-bold text-blue-500/70">pers.</span>
                    </div>
                </motion.div>
            </div>

            {/* Chart */}
            <div className="flex-1 w-full min-h-0 relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    {viewMode === 'department' ? (
                        <BarChart
                            data={byDepartment}
                            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                        >
                            <defs>
                                <linearGradient id="timeToFillGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={1} />
                                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.6} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--border)" opacity={0.3} />
                            <XAxis
                                dataKey="department"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'var(--muted-foreground)', fontSize: 11, fontWeight: 700 }}
                                angle={-20}
                                textAnchor="end"
                                height={80}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                                label={{ value: 'Jours', angle: -90, position: 'insideLeft', style: { fill: 'var(--muted-foreground)', fontSize: 12, fontWeight: 700 } }}
                            />
                            <Tooltip content={<TimeToFillDetailedTooltip />} cursor={{ fill: 'rgba(245, 158, 11, 0.1)', radius: 8 }} />
                            <Bar
                                dataKey="averageDays"
                                fill="url(#timeToFillGradient)"
                                radius={[10, 10, 0, 0]}
                                animationDuration={1200}
                            >
                                <LabelList
                                    dataKey="averageDays"
                                    position="top"
                                    className="fill-foreground font-black text-xs"
                                    formatter={(value: number) => `${value}j`}
                                    dy={-10}
                                />
                            </Bar>
                        </BarChart>
                    ) : (
                        <AreaChart
                            data={byMonth}
                            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                        >
                            <defs>
                                <linearGradient id="monthlyTimeToFillGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="var(--border)" opacity={0.3} />
                            <XAxis
                                dataKey="month"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'var(--muted-foreground)', fontSize: 11, fontWeight: 700 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                                label={{ value: 'Jours', angle: -90, position: 'insideLeft', style: { fill: 'var(--muted-foreground)', fontSize: 12, fontWeight: 700 } }}
                            />
                            <Tooltip content={<TimeToFillDetailedTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="averageDays"
                                stroke="#f59e0b"
                                strokeWidth={4}
                                fillOpacity={1}
                                fill="url(#monthlyTimeToFillGradient)"
                                animationDuration={1500}
                            />
                        </AreaChart>
                    )}
                </ResponsiveContainer>
            </div>

            {/* Decorative blobs */}
            <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-orange-500/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />
        </div>
    );
}

// --- Cost Per Hire Data ---
const defaultCostPerHireData = [
    { name: "Coût", value: 3500, fill: "#f59e0b" }, // Amber 500
];

export function CostPerHireChart({ data = defaultCostPerHireData }: { data?: any[] }) {
    const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
    const [selectedSite, setSelectedSite] = useState<string>("all");

    const cost = data[0]?.value || 0;
    const internalCosts = data[0]?.internalCosts || 0;
    const externalCosts = data[0]?.externalCosts || 0;
    const diffusionCosts = data[0]?.diffusionCosts || 0;
    const hireCount = data[0]?.hireCount || 0;
    const departments = data[0]?.departments || [];
    const sites = data[0]?.sites || [];

    // Filtrer les données selon les sélections
    let filteredCost = cost;
    let filteredInternalCosts = internalCosts;
    let filteredExternalCosts = externalCosts;
    let filteredDiffusionCosts = diffusionCosts;
    let filteredHireCount = hireCount;

    if (data[0]?.byDepartment && selectedDepartment !== "all") {
        const deptData = data[0].byDepartment.find((d: any) => d.department === selectedDepartment);
        if (deptData) {
            filteredCost = deptData.cost;
            filteredInternalCosts = deptData.internalCosts;
            filteredExternalCosts = deptData.externalCosts;
            filteredDiffusionCosts = deptData.diffusionCosts;
            filteredHireCount = deptData.hireCount;
        }
    }

    if (data[0]?.bySite && selectedSite !== "all") {
        const siteData = data[0].bySite.find((s: any) => s.site === selectedSite);
        if (siteData) {
            filteredCost = siteData.cost;
            filteredInternalCosts = siteData.internalCosts;
            filteredExternalCosts = siteData.externalCosts;
            filteredDiffusionCosts = siteData.diffusionCosts;
            filteredHireCount = siteData.hireCount;
        }
    }

    const totalCosts = filteredInternalCosts + filteredExternalCosts + filteredDiffusionCosts;
    const internalPercentage = totalCosts > 0 ? (filteredInternalCosts / totalCosts) * 100 : 0;
    const externalPercentage = totalCosts > 0 ? (filteredExternalCosts / totalCosts) * 100 : 0;
    const diffusionPercentage = totalCosts > 0 ? (filteredDiffusionCosts / totalCosts) * 100 : 0;

    return (
        <div className="glass-card p-6 rounded-2xl min-h-[400px] flex flex-col relative overflow-hidden shadow-xl transition-all hover:border-primary/20">
            {/* Background glow for effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl"></div>

            {/* Header with filters */}
            <div className="flex items-center justify-between mb-6 z-10">
                <div>
                    <h3 className="text-xl font-black text-foreground uppercase tracking-wider opacity-90">Coût par Embauche</h3>
                    <p className="text-xs text-muted-foreground mt-1">Analyse détaillée des coûts de recrutement</p>
                </div>

                <div className="flex gap-2">
                    {/* Department Filter */}
                    {departments.length > 0 && (
                        <select
                            value={selectedDepartment}
                            onChange={(e) => setSelectedDepartment(e.target.value)}
                            className="text-xs bg-secondary/80 text-foreground px-3 py-2 rounded-lg border border-border backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all cursor-pointer hover:bg-secondary font-medium"
                        >
                            <option value="all">📊 Tous les départements</option>
                            {departments.map((dept: string) => (
                                <option key={dept} value={dept}>🏢 {dept}</option>
                            ))}
                        </select>
                    )}

                    {/* Site Filter */}
                    {sites.length > 0 && (
                        <select
                            value={selectedSite}
                            onChange={(e) => setSelectedSite(e.target.value)}
                            className="text-xs bg-secondary/80 text-foreground px-3 py-2 rounded-lg border border-border backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all cursor-pointer hover:bg-secondary font-medium"
                        >
                            <option value="all">🌍 Tous les sites</option>
                            {sites.map((site: string) => (
                                <option key={site} value={site}>📍 {site}</option>
                            ))}
                        </select>
                    )}
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 z-10">
                {/* Left Section - Main Cost Display */}
                <div className="flex flex-col justify-center items-center bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl p-6 border border-amber-500/20">
                    <div className="text-center mb-4">
                        <div className="flex items-baseline justify-center gap-2 mb-2">
                            <span className="text-6xl font-black text-foreground drop-shadow-lg">{filteredCost.toLocaleString('fr-FR')}</span>
                            <span className="text-3xl font-bold text-amber-500">TND</span>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                            <div className="h-1 w-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"></div>
                            <span className="text-sm text-amber-500 font-bold uppercase tracking-widest">Coût Moyen</span>
                            <div className="h-1 w-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"></div>
                        </div>
                    </div>

                    {filteredHireCount > 0 && (
                        <div className="w-full space-y-3 mt-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground font-medium">💼 Recrutements réalisés</span>
                                <span className="text-2xl font-black text-amber-500">{filteredHireCount}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground font-medium">💰 Coût total</span>
                                <span className="text-xl font-black text-foreground">{totalCosts.toLocaleString('fr-FR')} TND</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Section - Cost Breakdown */}
                <div className="flex flex-col justify-center space-y-4">
                    <h4 className="text-sm font-bold text-foreground uppercase tracking-wider opacity-80 mb-2">Répartition des Coûts</h4>

                    {/* Internal Costs */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                <span className="font-bold text-foreground">Frais Internes</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">{internalPercentage.toFixed(0)}%</span>
                                <span className="font-black text-foreground">{filteredInternalCosts.toLocaleString('fr-FR')} TND</span>
                            </div>
                        </div>
                        <div className="h-2 bg-secondary/50 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                                style={{ width: `${internalPercentage}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* External Costs */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                                <span className="font-bold text-foreground">Frais Externes</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">{externalPercentage.toFixed(0)}%</span>
                                <span className="font-black text-foreground">{filteredExternalCosts.toLocaleString('fr-FR')} TND</span>
                            </div>
                        </div>
                        <div className="h-2 bg-secondary/50 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500"
                                style={{ width: `${externalPercentage}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Diffusion Costs */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                <span className="font-bold text-foreground">Diffusion</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">{diffusionPercentage.toFixed(0)}%</span>
                                <span className="font-black text-foreground">{filteredDiffusionCosts.toLocaleString('fr-FR')} TND</span>
                            </div>
                        </div>
                        <div className="h-2 bg-secondary/50 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-500"
                                style={{ width: `${diffusionPercentage}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Summary Bar */}
                    <div className="pt-4 border-t border-border/50">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-muted-foreground uppercase">Total</span>
                            <span className="text-lg font-black text-amber-500">{totalCosts.toLocaleString('fr-FR')} TND</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


// --- Department User Count Data ---
const colorMap: { [key: string]: string } = {
    // Standard Utility Classes
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
    // Gradient Strings from Seed Data
    "from-pink-500 to-rose-500": "#ec4899",
    "from-blue-500 to-cyan-500": "#3b82f6",
    "from-purple-500 to-pink-500": "#a855f7",
    "from-green-500 to-emerald-500": "#22c55e",
    "from-orange-500 to-red-500": "#f97316",
};

// Enhanced tooltip component for Department Chart
const DepartmentTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const item = payload[0];
        return (
            <div className="bg-card/95 backdrop-blur-xl border border-border shadow-2xl rounded-xl px-5 py-4 text-sm animate-in fade-in zoom-in duration-200">
                <p className="font-bold text-lg mb-2 text-foreground flex items-center gap-2">
                    <span
                        className="w-3 h-3 rounded-full shadow-lg"
                        style={{ backgroundColor: item.payload?.fill || item.color }}
                    />
                    {item.payload?.name}
                </p>
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-primary">{item.value}</span>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">employees</span>
                </div>
            </div>
        );
    }
    return null;
};

interface ChartData {
    name: string;
    value: number;
    fill: string;
}

export function DepartmentUserCountChart() {
    const [data, setData] = useState<ChartData[]>([]);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                console.log('🔍 Fetching departments...');
                const depts = await api.getDepartments();
                console.log('📊 Departments received:', depts);

                if (!Array.isArray(depts)) {
                    console.error("Expected array for departments but got:", depts);
                    setData([]);
                    setLoading(false);
                    return;
                }

                const chartData = depts.map((dept: any) => ({
                    name: dept.name,
                    value: dept.employeeCount || 0,
                    fill: colorMap[dept.colorCallback || ""] || "#94a3b8" // Default slate
                }));

                console.log('📈 Chart data prepared:', chartData);

                // Sort by value desc
                chartData.sort((a: ChartData, b: ChartData) => b.value - a.value);
                setData(chartData);
                setLoading(false);
            } catch (error) {
                console.error("Failed to load department stats:", error);
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // Custom bar shape with hover animation

    return (
        <div className="glass-card p-6 rounded-2xl h-[400px] flex flex-col group relative overflow-hidden">
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-foreground uppercase tracking-wider opacity-90 flex items-center gap-2">
                        <span className="w-1 h-6 bg-gradient-to-b from-primary to-purple-500 rounded-full" />
                        Users per Department
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span>Live Data</span>
                    </div>
                </div>

                <div className="flex-1 w-full min-h-0">
                    {loading ? (
                        <div className="h-full flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                                <p className="text-muted-foreground text-sm">Loading departments...</p>
                            </div>
                        </div>
                    ) : data.length === 0 ? (
                        <div className="h-full flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                    </svg>
                                </div>
                                <p className="text-foreground font-medium mb-1">No Department Data</p>
                                <p className="text-muted-foreground text-sm">Check console for errors</p>
                            </div>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={data}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <defs>
                                    {data.map((entry, index) => (
                                        <linearGradient
                                            key={`gradient-${index}`}
                                            id={`gradient-${index}`}
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                        >
                                            <stop offset="0%" stopColor={entry.fill} stopOpacity={1} />
                                            <stop offset="100%" stopColor={entry.fill} stopOpacity={0.6} />
                                        </linearGradient>
                                    ))}
                                </defs>

                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke="var(--border)"
                                    opacity={0.2}
                                    className="transition-opacity duration-300 group-hover:opacity-40"
                                />

                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'var(--muted-foreground)', fontSize: 11, fontWeight: 500 }}
                                    dy={10}
                                    angle={-15}
                                    textAnchor="end"
                                    height={60}
                                />

                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                                    width={40}
                                />

                                <Tooltip
                                    cursor={{
                                        fill: 'rgba(99, 102, 241, 0.1)',
                                        radius: 8,
                                    }}
                                    content={<DepartmentTooltip />}
                                    animationDuration={300}
                                    animationEasing="ease-out"
                                />

                                <Bar
                                    dataKey="value"
                                    radius={[8, 8, 0, 0]}
                                    isAnimationActive={true}
                                    animationDuration={1000}
                                >
                                    {data.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.fill}
                                            fillOpacity={0.8}
                                        />
                                    ))}
                                    <LabelList
                                        dataKey="value"
                                        position="top"
                                        className="fill-foreground font-bold"
                                        fontSize={13}
                                        dy={-8}
                                    />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>
    );
}

// --- Candidate Turnover Data ---
const defaultTurnoverData = [
    { name: "Jan", hires: 10, rejections: 5 },
    { name: "Feb", hires: 15, rejections: 8 },
    { name: "Mar", hires: 8, rejections: 12 },
    { name: "Apr", hires: 12, rejections: 7 },
    { name: "May", hires: 20, rejections: 10 },
    { name: "Jun", hires: 18, rejections: 9 },
];

export function TurnoverChart({ data = defaultTurnoverData }: { data?: any[] }) {
    const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
    const [departments, setDepartments] = useState<any[]>([]);

    useEffect(() => {
        const loadDepartments = async () => {
            try {
                const depts = await api.getDepartments();
                setDepartments(depts || []);
            } catch (error) {
                console.error("Failed to load departments:", error);
            }
        };
        loadDepartments();
    }, []);

    // Filtrer les données par département si nécessaire
    const filteredData = selectedDepartment === "all"
        ? data
        : data.map(month => ({
            ...month,
            hires: Math.floor(month.hires * (selectedDepartment === "all" ? 1 : 0.6)), // Simulation - à remplacer par vraies données
            rejections: Math.floor(month.rejections * (selectedDepartment === "all" ? 1 : 0.6))
        }));

    // Calcul du taux de turnover global
    const totalHires = filteredData.reduce((sum, month) => sum + (month.hires || 0), 0);
    const totalRejections = filteredData.reduce((sum, month) => sum + (month.rejections || 0), 0);
    const turnoverRate = totalHires > 0 ? ((totalRejections / totalHires) * 100).toFixed(1) : "0.0";

    return (
        <div className="glass-card p-8 rounded-3xl h-[500px] flex flex-col group relative overflow-hidden">
            <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                    <h3 className="text-xl font-black text-foreground uppercase tracking-tighter">Turnover Candidats</h3>
                    <p className="text-xs text-muted-foreground font-medium mt-1">Comparatif mensuel Recrutements vs Départs</p>
                </div>
                <div className="flex flex-col items-end gap-3">
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Recrutements</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]" />
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Départs</span>
                        </div>
                    </div>
                    {/* Taux de Turnover */}
                    <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl px-4 py-2 backdrop-blur-sm">
                        <div className="flex items-baseline gap-2">
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Taux Turnover:</span>
                            <span className="text-2xl font-black text-orange-500">{turnoverRate}%</span>
                        </div>
                        <p className="text-[9px] text-muted-foreground mt-0.5 uppercase tracking-wide">
                            {totalRejections} départs / {totalHires} recrutements
                        </p>
                    </div>
                </div>
            </div>

            {/* Filtre par département */}
            <div className="mb-4 relative z-10">
                <div className="flex items-center gap-3">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Filtrer par département:
                    </label>
                    <select
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                        className="px-3 py-1.5 bg-secondary/50 border border-border rounded-lg text-xs font-medium text-foreground hover:bg-secondary transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-primary/50"
                    >
                        <option value="all">Tous les départements</option>
                        {departments.map(dept => (
                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex-1 w-full min-h-0 relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorHires" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorRejections" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="var(--border)" opacity={0.2} />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: 'var(--muted-foreground)', fontWeight: 800 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                        />
                        <Tooltip
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    const monthHires = payload[0].value as number;
                                    const monthRejections = payload[1].value as number;
                                    const monthTurnover = monthHires > 0 ? ((monthRejections / monthHires) * 100).toFixed(1) : "0.0";

                                    return (
                                        <div className="bg-background/90 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-2xl p-4 min-w-[180px] animate-in fade-in zoom-in duration-200">
                                            <p className="font-black text-[10px] uppercase tracking-widest text-muted-foreground mb-3 border-b border-white/5 pb-2 text-center">{label}</p>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between gap-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Recrutés</span>
                                                    </div>
                                                    <span className="text-xl font-black text-emerald-500">{monthHires}</span>
                                                </div>
                                                <div className="flex items-center justify-between gap-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-rose-500" />
                                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Départs</span>
                                                    </div>
                                                    <span className="text-xl font-black text-rose-500">{monthRejections}</span>
                                                </div>
                                                <div className="pt-2 border-t border-white/5">
                                                    <div className="flex items-center justify-between gap-4">
                                                        <span className="text-[9px] font-bold text-muted-foreground uppercase">Taux Turnover</span>
                                                        <span className="text-lg font-black text-orange-500">{monthTurnover}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="hires"
                            stroke="#10b981"
                            strokeWidth={4}
                            fillOpacity={1}
                            fill="url(#colorHires)"
                            animationDuration={2000}
                        />
                        <Area
                            type="monotone"
                            dataKey="rejections"
                            stroke="#f43f5e"
                            strokeWidth={4}
                            fillOpacity={1}
                            fill="url(#colorRejections)"
                            animationDuration={2000}
                            animationBegin={300}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Background decorative blob */}
            <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-rose-500/5 rounded-full blur-[100px] pointer-events-none" />
        </div>
    );
}
