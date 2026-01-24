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
    blue: "from-blue-500 to-cyan-400 shadow-blue-500/20",
    purple: "from-purple-500 to-pink-400 shadow-purple-500/20",
    orange: "from-orange-500 to-yellow-400 shadow-orange-500/20",
    green: "from-green-500 to-emerald-400 shadow-green-500/20",
};

const iconBgMap = {
    blue: "bg-blue-500/10 text-blue-400",
    purple: "bg-purple-500/10 text-purple-400",
    orange: "bg-orange-500/10 text-orange-400",
    green: "bg-green-500/10 text-green-400",
};

export function StatCard({ title, value, change, trend, icon: Icon, color }: StatCardProps) {
    return (
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
                <div className={clsx("p-3 rounded-xl", iconBgMap[color])}>
                    <Icon size={24} />
                </div>
                <div className={clsx(
                    "flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-lg",
                    trend === "up" ? "bg-green-500/10 text-green-400" :
                        trend === "down" ? "bg-red-500/10 text-red-400" : "bg-slate-500/10 text-slate-400"
                )}>
                    {trend === "up" ? <ArrowUpRight size={16} /> :
                        trend === "down" ? <ArrowDownRight size={16} /> : <Minus size={16} />}
                    {change}
                </div>
            </div>
            <div>
                <h3 className="text-muted-foreground font-medium text-sm mb-1">{title}</h3>
                <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
            </div>

            {/* Glow Effect */}
            <div className={clsx(
                "absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity bg-gradient-to-br",
                colorMap[color].split(" ")[0] + " " + colorMap[color].split(" ")[1]
            )} />
        </div>
    );
}
