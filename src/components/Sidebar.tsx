"use client";

import { Home, BarChart2, Settings, Menu, X, FileText, Briefcase, User, Bell, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";



export function Sidebar() {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { language, setLanguage, t } = useLanguage();

    const navItems = [
        { icon: Home, label: t('common.dashboard'), href: "/" },
        { icon: Briefcase, label: t('common.hiringRequests'), href: "/hiring-requests" },
        { icon: FileText, label: t('common.candidatures'), href: "/candidatures" },
        { icon: Users, label: "Interviews", href: "/interviews" }, // Using Users icon temporarily or Calendar if imported
        { icon: User, label: t('common.users'), href: "/users" },
        { icon: BarChart2, label: t('common.department'), href: "/departments" },
        { icon: Bell, label: t('common.notifications'), href: "/notifications" },
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
                    "fixed inset-y-0 left-0 z-40 w-72 bg-card/80 backdrop-blur-xl border-r border-border transition-transform duration-300 md:translate-x-0",
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
                                        {isActive && (
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
                        <div className="flex items-center gap-3 p-3 rounded-2xl bg-secondary/50 border border-border/50 hover:border-primary/20 transition-colors cursor-pointer group">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white font-bold text-xs ring-2 ring-background group-hover:ring-primary/50 transition-all">
                                JS
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-semibold text-foreground truncate">John Smith</p>
                                <p className="text-xs text-muted-foreground truncate">john@example.com</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
