import { ArrowUpRight, ArrowDownRight, Minus, LucideIcon } from "lucide-react";
import { clsx } from "clsx";
import { motion } from "framer-motion";

interface StatCardProps {
    title: string;
    value: string;
    change: string;
    trend: "up" | "down" | "neutral";
    icon: LucideIcon;
    color: "blue" | "purple" | "orange" | "green" | "emerald" | "pink" | "indigo";
}

const colorStyles = {
    blue: {
        bg: "bg-blue-500/10",
        text: "text-blue-600 dark:text-blue-400",
        glow: "from-blue-600/20 to-indigo-600/0",
        border: "group-hover:border-blue-500/50 shadow-[0_0_20px_rgba(37,99,235,0.1)]",
        icon: "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
    },
    purple: {
        bg: "bg-purple-500/10",
        text: "text-purple-600 dark:text-purple-400",
        glow: "from-purple-600/20 to-pink-600/0",
        border: "group-hover:border-purple-500/50 shadow-[0_0_20px_rgba(147,51,234,0.1)]",
        icon: "bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/30"
    },
    orange: {
        bg: "bg-orange-500/10",
        text: "text-orange-600 dark:text-orange-400",
        glow: "from-orange-600/20 to-red-600/0",
        border: "group-hover:border-orange-500/50 shadow-[0_0_20px_rgba(234,88,12,0.1)]",
        icon: "bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/30"
    },
    green: {
        bg: "bg-emerald-500/10",
        text: "text-emerald-600 dark:text-emerald-400",
        glow: "from-emerald-600/20 to-cyan-600/0",
        border: "group-hover:border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.1)]",
        icon: "bg-gradient-to-br from-emerald-500 to-cyan-600 text-white shadow-lg shadow-emerald-500/30"
    },
    emerald: {
        bg: "bg-emerald-500/10",
        text: "text-emerald-600 dark:text-emerald-400",
        glow: "from-emerald-600/20 to-teal-600/0",
        border: "group-hover:border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.1)]",
        icon: "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30"
    },
    pink: {
        bg: "bg-pink-500/10",
        text: "text-pink-600 dark:text-pink-400",
        glow: "from-pink-600/20 to-rose-600/0",
        border: "group-hover:border-pink-500/50 shadow-[0_0_20px_rgba(219,39,119,0.1)]",
        icon: "bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-lg shadow-pink-500/30"
    },
    indigo: {
        bg: "bg-indigo-500/10",
        text: "text-indigo-600 dark:text-indigo-400",
        glow: "from-indigo-600/25 to-blue-600/0",
        border: "group-hover:border-indigo-500/50 shadow-[0_0_25px_rgba(79,70,229,0.15)]",
        icon: "bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-500/40"
    },
};

export function StatCard({ title, value, change, trend, icon: Icon, color }: StatCardProps) {
    const style = colorStyles[color] || colorStyles.blue;

    return (
        <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={clsx(
                "glass-card p-7 rounded-[2.5rem] relative overflow-hidden group transition-all duration-700",
                style.border
            )}
        >
            <div className="relative z-10">
                <div className="flex justify-between items-center mb-6">
                    <div className={clsx(
                        "p-3 rounded-2xl shadow-lg transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110",
                        style.icon
                    )}>
                        <Icon size={24} />
                    </div>
                    <div className={clsx(
                        "flex items-center gap-1 text-[11px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-full backdrop-blur-md",
                        trend === "up" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" :
                            trend === "down" ? "bg-rose-500/15 text-rose-600 dark:text-rose-400" :
                                "bg-slate-500/15 text-slate-600 dark:text-slate-400"
                    )}>
                        {trend === "up" ? <ArrowUpRight size={14} strokeWidth={3} /> :
                            trend === "down" ? <ArrowDownRight size={14} strokeWidth={3} /> :
                                <Minus size={14} strokeWidth={3} />}
                        {change}
                    </div>
                </div>

                <div className="space-y-1">
                    <h3 className="text-muted-foreground font-bold text-[10px] uppercase tracking-[0.2em] opacity-70 group-hover:opacity-100 transition-opacity">
                        {title}
                    </h3>
                    <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-black text-foreground tracking-tighter transition-all duration-300 group-hover:tracking-tight ring-offset-background">
                            {value}
                        </p>
                        <div className={clsx("w-1.5 h-1.5 rounded-full animate-pulse", style.bg.replace('/10', ''))} />
                    </div>
                </div>
            </div>

            {/* Premium Decorative elements */}
            <div className={clsx(
                "absolute -right-16 -bottom-16 w-64 h-64 rounded-full blur-[100px] opacity-[0.08] group-hover:opacity-25 transition-opacity duration-1000 bg-gradient-to-br",
                style.glow
            )} />

            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                <Icon size={80} strokeWidth={0.5} />
            </div>

            {/* Shine effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-700">
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
            </div>
        </motion.div>
    );
}
