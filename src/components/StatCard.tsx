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

    // Custom color overrides based on the target design
    const iconColors = {
        blue: "text-blue-600 bg-blue-50",
        indigo: "text-indigo-600 bg-indigo-50",
        emerald: "text-emerald-600 bg-emerald-50",
        pink: "text-rose-600 bg-rose-50",
        purple: "text-purple-600 bg-purple-50",
        orange: "text-orange-600 bg-orange-50",
        green: "text-green-600 bg-green-50",
    };

    const iconColorClass = iconColors[color] || iconColors.blue;

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="bg-card text-card-foreground p-6 rounded-[1.5rem] relative overflow-hidden shadow-sm border border-border/50 group"
        >
            <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                    <h3 className="text-3xl font-bold tracking-tight text-foreground">
                        {value}
                    </h3>
                </div>
                <div className={clsx(
                    "p-3 rounded-xl transition-colors",
                    iconColorClass
                )}>
                    <Icon size={28} strokeWidth={2} />
                </div>
            </div>

            <div className="flex items-center justify-between mt-4">
                <div className={clsx(
                    "flex items-center gap-1.5 text-xs font-bold",
                    trend === "up" ? "text-emerald-600" :
                        trend === "down" ? "text-rose-600" :
                            "text-muted-foreground"
                )}>
                    {trend === "up" ? <ArrowUpRight size={16} /> :
                        trend === "down" ? <ArrowDownRight size={16} /> :
                            <Minus size={16} />}
                    <span>{change}</span>
                </div>
                {/* Title moved to bottom right or kept distinct */}
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{title}</p>
            </div>
        </motion.div>
    );
}
