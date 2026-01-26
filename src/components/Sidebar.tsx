"use client";

import { Home, BarChart2, Settings, Menu, X, FileText, Briefcase, User, Bell, Calendar, Users } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";



export function Sidebar() {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { language, setLanguage, t } = useLanguage();
    const { user } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);

    // Load unread notifications count
    useEffect(() => {
        if (!user?.id) return;

        const loadUnreadCount = async () => {
            try {
                const data = await api.getUnreadCount(user.id);
                setUnreadCount(data.count || 0);
            } catch (error) {
                console.error("Failed to load unread count:", error);
            }
        };

        loadUnreadCount();
        // Refresh every 30 seconds
        const interval = setInterval(loadUnreadCount, 30000);
        return () => clearInterval(interval);
    }, [user?.id]);

    const navItems = [
        { icon: Home, label: t('common.dashboard'), href: "/" },
        { icon: Briefcase, label: t('common.hiringRequests'), href: "/hiring-requests" },
        { icon: Briefcase, label: "Postes Vacants", href: "/postes-vacants" },
        { icon: FileText, label: t('common.candidatures'), href: "/candidatures" },
        { icon: Users, label: "Interviews", href: "/interviews" },
        { icon: Calendar, label: t('common.calendar') || "Calendar", href: "/calendar" },
        { icon: User, label: t('common.users'), href: "/users" },
        { icon: BarChart2, label: t('common.department'), href: "/departments" },
        { icon: Bell, label: t('common.notifications'), href: "/notifications", badge: unreadCount },
        { icon: Settings, label: t('common.settings'), href: "/settings" },
    ];

    return (
        <>
            {/* Mobile Menu Button */}
            <div className="md:hidden fixed top-4 right-4 z-50">
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 bg-primary text-primary-foreground rounded-full shadow-lg"
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Sidebar Container */}
            <aside
                className={clsx(
                    "fixed inset-y-0 left-0 z-40 w-72 bg-card/50 backdrop-blur-xl border-r border-border/50 transition-transform duration-300 md:translate-x-0",
                    isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="h-24 flex items-center px-8 border-b border-border/50">
                        <div className="flex items-center gap-3 font-bold text-2xl tracking-tight group cursor-pointer">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-purple-600 flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-300">
                                T
                            </div>
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                                RH Tesca
                            </span>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="block relative"
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="active-nav"
                                            className="absolute inset-0 bg-primary/10 rounded-xl border border-primary/20"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                    <div className={clsx(
                                        "relative flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-200 z-10",
                                        isActive ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                    )}>
                                        <item.icon
                                            size={22}
                                            className={clsx(
                                                "transition-colors duration-200",
                                                isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                                            )}
                                        />
                                        <span className="text-sm">{item.label}</span>
                                        {item.badge && item.badge > 0 && (
                                            <span className="ml-auto px-2 py-0.5 text-xs font-bold text-white bg-primary rounded-full min-w-[20px] text-center">
                                                {item.badge > 99 ? '99+' : item.badge}
                                            </span>
                                        )}
                                        {isActive && !item.badge && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_currentColor]"
                                            />
                                        )}
                                    </div>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer Actions */}
                    <div className="p-6 border-t border-border/50 space-y-4">
                        {/* Language Switcher */}
                        <div className="flex bg-secondary/50 p-1 rounded-xl border border-border">
                            <button
                                onClick={() => setLanguage('en')}
                                className={clsx(
                                    "flex-1 py-1.5 text-xs font-bold rounded-lg transition-all",
                                    language === 'en' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                English
                            </button>
                            <button
                                onClick={() => setLanguage('fr')}
                                className={clsx(
                                    "flex-1 py-1.5 text-xs font-bold rounded-lg transition-all",
                                    language === 'fr' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                Français
                            </button>
                        </div>

                        {/* User Profile */}
                        {user && (
                            <div className="flex items-center gap-3 p-3 rounded-2xl bg-secondary/50 border border-border/50 hover:border-primary/20 transition-colors group">
                                <Link href="/settings" className="flex items-center gap-3 flex-1 overflow-hidden cursor-pointer">
                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white font-bold text-xs ring-2 ring-background group-hover:ring-primary/50 transition-all ${user.avatarGradient ? `bg-gradient-to-br ${user.avatarGradient}` : ''}`}>
                                        {user.name ? user.name.slice(0, 2).toUpperCase() : 'U'}
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                    </div>
                                </Link>
                                <Link href="/settings" className="p-1.5 text-muted-foreground hover:text-primary transition-colors" title="Settings">
                                    <Settings size={18} />
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
}
