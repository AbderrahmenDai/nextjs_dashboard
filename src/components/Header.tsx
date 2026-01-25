"use strict";
"use client";

import React from "react";
import { useTheme } from "next-themes";
import { Bell, Moon, Search, Sun, LogOut, User } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

export function Header() {
    const { theme, setTheme } = useTheme();
    const { user, logout } = useAuth();
    const [mounted, setMounted] = React.useState(false);
    const [showDropdown, setShowDropdown] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (showDropdown && !target.closest('.profile-dropdown')) {
                setShowDropdown(false);
            }
        };

        if (showDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [showDropdown]);

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    const handleLogout = () => {
        logout();
        setShowDropdown(false);
    };

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <header className="sticky top-0 z-30 w-full h-16 bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-between px-6 transition-all duration-300">
            {/* Search Bar */}
            <div className="flex-1 max-w-xl relative">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search anything..."
                        className="w-full bg-secondary/50 border border-transparent focus:border-primary/20 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all duration-300 placeholder:text-muted-foreground/50"
                    />
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 ml-4">
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-2.5 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-all duration-200 relative overflow-hidden"
                >
                    {mounted && (
                        <motion.div
                            initial={{ rotate: -90, scale: 0 }}
                            animate={{ rotate: 0, scale: 1 }}
                            key={theme}
                            transition={{ duration: 0.2 }}
                        >
                            {theme === "dark" ? <Moon size={20} /> : <Sun size={20} />}
                        </motion.div>
                    )}
                </button>

                {/* Notifications */}
                <button className="p-2.5 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-all duration-200 relative">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-background"></span>
                </button>

                {/* Vertical Divider */}
                <div className="h-6 w-px bg-border mx-2"></div>

                {/* Profile dropdown */}
                <div className="relative profile-dropdown">
                    <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-xl hover:bg-secondary transition-all duration-200 group"
                    >
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 p-[1px] ${user?.avatarGradient ? `bg-gradient-to-tr ${user.avatarGradient}` : ''}`}>
                            <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                                <span className="font-bold text-xs">
                                    {user ? getInitials(user.name) : "U"}
                                </span>
                            </div>
                        </div>
                    </button>

                    {/* Dropdown Menu */}
                    {showDropdown && (
                        <div className="absolute right-0 top-full mt-2 w-64 glass-card border border-border/50 rounded-xl shadow-2xl overflow-hidden z-50">
                            <div className="p-4 border-b border-border/50">
                                <p className="font-semibold text-foreground">{user?.name}</p>
                                <p className="text-sm text-muted-foreground">{user?.email}</p>
                                {user?.role && (
                                    <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-md">
                                        {user.role}
                                    </span>
                                )}
                            </div>
                            <div className="p-2">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                                >
                                    <LogOut size={18} />
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
