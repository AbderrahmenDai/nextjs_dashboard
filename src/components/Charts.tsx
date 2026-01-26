"use client";

import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell, PieChart, Pie, Legend,
    LabelList, RadialBarChart, RadialBar,
    TooltipProps
} from "recharts";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";

// --- Shared Components & Config ---

interface CustomTooltipPayload {
    name: string;
    value: number | string;
    color?: string;
    fill?: string;
    payload?: Record<string, unknown>;
}

interface Department {
    id: string;
    name: string;
    employeeCount?: number;
    colorCallback?: string;
}

// --- Shared Components & Config ---

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0] as unknown as CustomTooltipPayload;
        return (
            <div className="bg-card/90 backdrop-blur-xl border border-border shadow-2xl rounded-xl px-4 py-3 text-sm">
                <p className="font-semibold mb-1 text-foreground">{label ? label : data.name}</p>
                <p className="text-foreground font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: data.color || data.fill }}></span>
                    {data.value}
                </p>
            </div>
        );
    }
    return null;
};

// --- Pipeline Data ---
const pipelineData = [
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

export function PipelineRecruitmentChart() {
    return (
        <div className="bg-card dark:bg-[#1e1e2e]/80 border border-slate-100 dark:border-white/5 p-6 rounded-2xl h-[450px] flex flex-col shadow-xl dark:shadow-2xl transition-all hover:border-primary/20">
            <div className="flex justify-between items-end mb-6 px-2">
                <h3 className="text-lg font-bold text-foreground uppercase tracking-wider opacity-90">Pipeline de Recrutement</h3>
                <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-lg border border-primary/20 font-medium">Live View</span>
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
                                <stop offset="100%" stopColor="#ec4899" stopOpacity={1} />
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
    { name: "Linkedin", value: 33, fill: "#0ea5e9" }, // Sky 500 (Vibrant)
];

export function ApplicationSourcesChart() {
    return (
        <div className="bg-card dark:bg-[#1e1e2e]/80 border border-slate-100 dark:border-white/5 p-6 rounded-2xl h-[400px] flex flex-col shadow-xl dark:shadow-2xl transition-all hover:border-primary/20">
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
        <div className="bg-card dark:bg-[#1e1e2e]/80 border border-slate-100 dark:border-white/5 p-6 rounded-2xl h-[300px] flex flex-col shadow-xl dark:shadow-2xl transition-all hover:border-primary/20">
            <h3 className="text-lg font-bold text-foreground mb-6 text-center uppercase tracking-wider opacity-90">Mode de Recrutement</h3>
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={modeData} barSize={50}>
                        <defs>
                            <linearGradient id="splitColorBar" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={1} />
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
    { name: "Embauché", value: 1, fill: "#10b981" }, // Emerald
    { name: "Non embauché", value: 0, fill: "#64748b" }, // Slate
];

export function FinalDecisionChart() {
    return (
        <div className="bg-card dark:bg-[#1e1e2e]/80 border border-slate-100 dark:border-white/5 p-6 rounded-2xl h-[300px] flex flex-col shadow-xl dark:shadow-2xl transition-all hover:border-primary/20">
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
    const primaryColor = "hsl(230, 90%, 60%)"; // Match --primary

    return (
        <div className="bg-card dark:bg-[#1e1e2e]/80 border border-slate-100 dark:border-white/5 p-6 rounded-2xl h-[300px] flex flex-col shadow-xl dark:shadow-2xl transition-all hover:border-primary/20">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-foreground uppercase tracking-wider opacity-90 w-full text-center">Demandes / Mois</h3>
            </div>
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyData}>
                        <defs>
                            <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={primaryColor} stopOpacity={0.6} />
                                <stop offset="95%" stopColor={primaryColor} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} dy={10} interval={1} />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--muted-foreground)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={primaryColor}
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
        <div className="bg-card dark:bg-[#1e1e2e]/80 border border-slate-100 dark:border-white/5 p-6 rounded-2xl h-[300px] flex flex-col items-center justify-center relative overflow-hidden shadow-xl dark:shadow-2xl transition-all hover:border-primary/20">
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
        <div className="bg-card dark:bg-[#1e1e2e]/80 border border-slate-100 dark:border-white/5 p-6 rounded-2xl h-[300px] flex flex-col items-center justify-center relative overflow-hidden shadow-xl dark:shadow-2xl transition-all hover:border-primary/20">
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
    "bg-indigo-500": "#6366f1", // Indigo
    "bg-violet-500": "#8b5cf6", // Violet
    "bg-purple-500": "#a855f7",
    "bg-fuchsia-500": "#d946ef",
    "bg-pink-500": "#ec4899",
    "bg-rose-500": "#f43f5e",
    "bg-slate-500": "#64748b",
    "bg-gray-500": "#6b7280",
};

// Enhanced tooltip component for Department Chart
const DepartmentTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0] as unknown as CustomTooltipPayload;
        return (
            <div className="bg-card/95 backdrop-blur-xl border border-border shadow-2xl rounded-xl px-5 py-4 text-sm animate-in fade-in zoom-in duration-200">
                <p className="font-bold text-lg mb-2 text-foreground flex items-center gap-2">
                    <span
                        className="w-3 h-3 rounded-full shadow-lg animate-pulse"
                        style={{ backgroundColor: data.fill }}
                    />
                    {String(data.payload?.name)}
                </p>
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-primary">{data.value}</span>
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

                const chartData = depts.map((dept: Department) => ({
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
    interface AnimatedBarProps {
        fill: string;
        x: number;
        y: number;
        width: number;
        height: number;
        index: number;
    }

    const AnimatedBar = (props: unknown) => {
        const { fill, x, y, width, height, index } = props as AnimatedBarProps;
        const isHovered = hoveredIndex === index;

        return (
            <g>
                {/* Glow effect on hover */}
                {isHovered && (
                    <rect
                        x={x - 2}
                        y={y - 2}
                        width={width + 4}
                        height={height + 4}
                        fill={fill}
                        opacity={0.3}
                        rx={8}
                        className="animate-pulse"
                    />
                )}
                {/* Main bar with gradient */}
                <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    fill={`url(#gradient-${index})`}
                    rx={6}
                    className="transition-all duration-300"
                    style={{
                        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                        filter: isHovered ? 'brightness(1.2)' : 'brightness(1)',
                    }}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                />
            </g>
        );
    };

    return (
        <div className="glass-card p-6 rounded-2xl h-[400px] flex flex-col group relative overflow-hidden">
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            {/* Floating particles effect */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute top-[20%] left-[10%] w-2 h-2 bg-primary/20 rounded-full animate-pulse" />
                <div className="absolute top-[60%] right-[15%] w-1.5 h-1.5 bg-purple-500/20 rounded-full animate-pulse delay-300" />
                <div className="absolute bottom-[30%] left-[70%] w-2.5 h-2.5 bg-blue-500/20 rounded-full animate-pulse delay-700" />
            </div>

            <div className="relative z-10">
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
                                    shape={AnimatedBar}
                                    isAnimationActive={true}
                                    animationBegin={0}
                                    animationDuration={800}
                                    animationEasing="ease-out"
                                >
                                    {data.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={`url(#gradient-${index})`}
                                        />
                                    ))}
                                    <LabelList
                                        dataKey="value"
                                        position="top"
                                        className="fill-foreground font-bold transition-all duration-300"
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
