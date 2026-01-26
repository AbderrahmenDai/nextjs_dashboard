import { ArrowUpRight, ArrowDownRight, Minus, LucideIcon } from "lucide-react";
import { clsx } from "clsx";

interface StatCardProps {
    title: string;
    value: string;
    change: string;
    trend: "up" | "down" | "neutral";
    icon: LucideIcon;
    color: "blue" | "purple" | "orange" | "green";
}

const colorMap = {
    blue: "from-blue-600 to-cyan-400 shadow-blue-500/20 dark:shadow-blue-500/10",
    purple: "from-indigo-500 to-purple-400 shadow-purple-500/20 dark:shadow-purple-500/10",
    orange: "from-orange-500 to-amber-400 shadow-orange-500/20 dark:shadow-orange-500/10",
    green: "from-emerald-500 to-teal-400 shadow-emerald-500/20 dark:shadow-emerald-500/10",
};

const iconBgMap = {
    blue: "bg-blue-500/10 text-blue-500 dark:text-blue-400",
    purple: "bg-purple-500/10 text-purple-500 dark:text-purple-400",
    orange: "bg-orange-500/10 text-orange-500 dark:text-orange-400",
    green: "bg-green-500/10 text-green-500 dark:text-green-400",
};

export function StatCard({ title, value, change, trend, icon: Icon, color }: StatCardProps) {
    return (
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden group hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] border border-border/50">
            <div className="flex justify-between items-start mb-4">
                <div className={clsx("p-3 rounded-xl", iconBgMap[color])}>
                    <Icon size={24} />
                </div>
                <div className={clsx(
                    "flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-lg",
                    trend === "up" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                        trend === "down" ? "bg-rose-500/10 text-rose-600 dark:text-rose-400" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                )}>
                    {trend === "up" ? <ArrowUpRight size={16} /> :
                        trend === "down" ? <ArrowDownRight size={16} /> : <Minus size={16} />}
                    {change}
                </div>
            </div>
            <div>
                <h3 className="text-slate-500 dark:text-slate-400 font-semibold text-xs mb-2 uppercase tracking-wider">{title}</h3>
                <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</p>
            </div>

            {/* Subtle Gradient Glow (Light Mode Friendly) */}
            <div className={clsx(
                "absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity bg-gradient-to-br",
                colorMap[color].split(" ")[0] + " " + colorMap[color].split(" ")[1]
            )} />
        </div>
    );
}
