"use client";

import { Home, BarChart2, Users, Settings, Bell, Menu, X } from "lucide-react";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

const navItems = [
    { icon: Home, label: "Dashboard", href: "/" },
    { icon: Users, label: "Hiring Requests", href: "/hiring-requests" },
    { icon: Users, label: "Users", href: "/users" },
    { icon: BarChart2, label: "Departments", href: "/departments" },
    { icon: Bell, label: "Notifications", href: "/notifications" },
    { icon: Settings, label: "Settings", href: "/settings" },
];

export function Sidebar() {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <>
            {/* Mobile Menu Button */}
            <div className="md:hidden fixed top-4 right-4 z-50">
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 bg-secondary rounded-full shadow-lg text-white"
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Sidebar Container */}
            <aside
                className={clsx(
                    "fixed inset-y-0 left-0 z-40 w-64 transform bg-card/80 backdrop-blur-xl border-r border-white/5 transition-transform duration-300 md:translate-x-0",
                    isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="h-16 flex items-center px-6 border-b border-white/5">
                        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white">
                                A
                            </div>
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                                Antigravity
                            </span>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-2">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={clsx(
                                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                                        isActive
                                            ? "bg-primary/10 text-primary shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                                            : "text-muted-foreground hover:bg-white/5 hover:text-white"
                                    )}
                                >
                                    <item.icon
                                        size={20}
                                        className={clsx(
                                            "transition-colors",
                                            isActive ? "text-primary" : "text-muted-foreground group-hover:text-white"
                                        )}
                                    />
                                    <span className="font-medium">{item.label}</span>
                                    {isActive && (
                                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Profile */}
                    <div className="p-4 border-t border-white/5">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border border-white/10" />
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-medium text-white truncate">User Name</p>
                                <p className="text-xs text-muted-foreground truncate">user@example.com</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
