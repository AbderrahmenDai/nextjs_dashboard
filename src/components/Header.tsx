"use client";

import React from "react";
import { useTheme } from "next-themes";
import { Bell, Moon, Search, Sun, LogOut, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { clsx } from "clsx";
import moment from "moment";
import Link from "next/link";
import { useSocket } from "@/contexts/SocketContext";

// Type definition for Notification
interface Notification {
    id: string;
    senderId: string;
    receiverId: string;
    message: string;
    createdAt: string;
    isRead: boolean;
    senderName?: string;
    senderAvatarGradient?: string;
}

export function Header() {
    const { theme, setTheme } = useTheme();
    const { user, logout } = useAuth();
    const { socket } = useSocket();
    const [mounted, setMounted] = React.useState(false);

    // Dropdown States
    const [showProfileDropdown, setShowProfileDropdown] = React.useState(false);
    const [showNotifDropdown, setShowNotifDropdown] = React.useState(false);

    // Notification State
    const [notifications, setNotifications] = React.useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = React.useState(0);
    const [isLoadingNotifs, setIsLoadingNotifs] = React.useState(false);

    // Real-time notification listener
    React.useEffect(() => {
        if (!socket) return;

        const handleNewNotification = (notification: Notification) => {
            console.log("🔔 New notification received:", notification);
            // Add to list and increment count
            setNotifications(prev => [notification, ...prev]);
            setUnreadCount(prev => prev + 1);

            // Play sound
            try {
                const audio = new Audio('/sounds/notification.mp3'); // Or a public URL like 'https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3'
                // Fallback to a simple frequency beep if local file missing? No, let's use a nice short beep url
                audio.src = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';
                audio.play().catch(e => console.log('Audio play failed (user interaction required first)::', e));
            } catch (e) {
                console.error("Audio error", e);
            }
        };

        socket.on('notification:new', handleNewNotification);

        return () => {
            socket.off('notification:new', handleNewNotification);
        };
    }, [socket]);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    // Load Notifications
    const loadNotifications = React.useCallback(async () => {
        if (!user?.id) return;
        setIsLoadingNotifs(true);
        try {
            // Fetch unread count
            const countData = await api.getUnreadCount(user.id);
            setUnreadCount(countData.count || 0);

            // Fetch recent notifications (top 10)
            const data = await api.getNotifications(user.id);
            if (Array.isArray(data)) {
                setNotifications(data.slice(0, 10)); // Limit to top 10
            }
        } catch (error) {
            console.error("Failed to load notifications:", error);
        } finally {
            setIsLoadingNotifs(false);
        }
    }, [user?.id]);

    React.useEffect(() => {
        loadNotifications();
        // Optional: Polling every 60s
        const interval = setInterval(loadNotifications, 60000);
        return () => clearInterval(interval);
    }, [loadNotifications]);

    // Close dropdowns when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (showProfileDropdown && !target.closest('.profile-dropdown')) {
                setShowProfileDropdown(false);
            }
            if (showNotifDropdown && !target.closest('.notif-dropdown')) {
                setShowNotifDropdown(false);
            }
        };

        if (showProfileDropdown || showNotifDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [showProfileDropdown, showNotifDropdown]);

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    const handleLogout = () => {
        logout();
        setShowProfileDropdown(false);
    };

    const markAsRead = async (id: string) => {
        try {
            await api.markAsRead(id);
            // Update local state
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Failed to mark notification as read", error);
        }
    };

    const markAllRead = async () => {
        if (!user?.id) return;
        try {
            await api.markAllAsRead(user.id);
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to mark all as read", error);
        }
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
        <header className="sticky top-0 z-30 w-full h-16 bg-background/60 backdrop-blur-xl border-b border-border/50 flex items-center justify-between px-6 transition-all duration-300">
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

                {/* Notifications Dropdown */}
                <div className="relative notif-dropdown">
                    <button
                        onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                        className="p-2.5 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-all duration-200 relative"
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-background animate-pulse"></span>
                        )}
                    </button>

                    <AnimatePresence>
                        {showNotifDropdown && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                className="absolute right-0 top-full mt-2 w-80 sm:w-96 glass-card border border-border/50 rounded-2xl shadow-2xl overflow-hidden z-50 transform origin-top-right"
                            >
                                <div className="p-4 border-b border-border/50 flex justify-between items-center bg-white/5 backdrop-blur-sm">
                                    <h3 className="font-semibold text-foreground">Notifications</h3>
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={markAllRead}
                                            className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                                        >
                                            Mark all as read
                                        </button>
                                    )}
                                </div>

                                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                    {notifications.length === 0 ? (
                                        <div className="p-8 text-center text-muted-foreground">
                                            <Bell size={32} className="mx-auto mb-3 opacity-20" />
                                            <p className="text-sm">No notifications yet</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-border/30">
                                            {notifications.map((notif) => (
                                                <div
                                                    key={notif.id}
                                                    className={clsx(
                                                        "p-4 hover:bg-white/5 transition-colors relative group",
                                                        !notif.isRead && "bg-primary/5"
                                                    )}
                                                >
                                                    <div className="flex gap-3">
                                                        <div className={`mt-1 min-w-[32px] w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm ${notif.senderAvatarGradient ? `bg-gradient-to-br ${notif.senderAvatarGradient}` : 'bg-gray-500'}`}>
                                                            {notif.senderName ? getInitials(notif.senderName) : 'S'}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className={clsx("text-sm", !notif.isRead ? "text-foreground font-medium" : "text-muted-foreground")}>
                                                                {notif.message}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground/60 mt-1">
                                                                {moment(notif.createdAt).fromNow()}
                                                            </p>
                                                        </div>
                                                        {!notif.isRead && (
                                                            <button
                                                                onClick={() => markAsRead(notif.id)}
                                                                className="opacity-0 group-hover:opacity-100 p-1.5 text-primary hover:bg-primary/10 rounded-full transition-all self-start"
                                                                title="Mark as read"
                                                            >
                                                                <Check size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                    {!notif.isRead && (
                                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-8 bg-primary rounded-r-full"></div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="p-2 border-t border-border/50 bg-white/5 text-center">
                                    <Link
                                        href="/notifications"
                                        onClick={() => setShowNotifDropdown(false)}
                                        className="text-xs text-muted-foreground hover:text-primary transition-colors py-1 block w-full"
                                    >
                                        View all notifications
                                    </Link>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Vertical Divider */}
                <div className="h-6 w-px bg-border mx-2"></div>

                {/* Profile dropdown */}
                <div className="relative profile-dropdown">
                    <button
                        onClick={() => setShowProfileDropdown(!showProfileDropdown)}
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
                    <AnimatePresence>
                        {showProfileDropdown && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                className="absolute right-0 top-full mt-2 w-64 glass-card border border-border/50 rounded-xl shadow-2xl overflow-hidden z-50"
                            >
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
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
}
