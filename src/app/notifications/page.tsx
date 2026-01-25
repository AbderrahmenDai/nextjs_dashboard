"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { Bell, Check, CheckCheck, Trash2, X, Clock, User } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { clsx } from "clsx";

interface Notification {
    id: string;
    senderId: string;
    receiverId: string;
    message: string;
    createdAt: string;
    isRead: boolean;
    senderName?: string;
    senderEmail?: string;
    senderAvatarGradient?: string;
}

export default function NotificationsPage() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const loadNotifications = async () => {
        if (!user?.id) return;
        
        try {
            setIsLoading(true);
            const [notificationsData, unreadData] = await Promise.all([
                api.getNotifications(user.id),
                api.getUnreadCount(user.id)
            ]);
            setNotifications(notificationsData);
            setUnreadCount(unreadData.count || 0);
        } catch (error) {
            console.error("Failed to load notifications:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadNotifications();
        // Refresh notifications every 30 seconds
        const interval = setInterval(loadNotifications, 30000);
        return () => clearInterval(interval);
    }, [user?.id]);

    const handleMarkAsRead = async (notificationId: string) => {
        try {
            await api.markAsRead(notificationId);
            setNotifications(notifications.map(n => 
                n.id === notificationId ? { ...n, isRead: true } : n
            ));
            setUnreadCount(Math.max(0, unreadCount - 1));
        } catch (error) {
            console.error("Failed to mark as read:", error);
        }
    };

    const handleMarkAllAsRead = async () => {
        if (!user?.id) return;
        
        try {
            await api.markAllAsRead(user.id);
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to mark all as read:", error);
        }
    };

    const handleDelete = async (notificationId: string) => {
        try {
            await api.deleteNotification(notificationId);
            const deletedNotification = notifications.find(n => n.id === notificationId);
            if (deletedNotification && !deletedNotification.isRead) {
                setUnreadCount(Math.max(0, unreadCount - 1));
            }
            setNotifications(notifications.filter(n => n.id !== notificationId));
        } catch (error) {
            console.error("Failed to delete notification:", error);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
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
        <DashboardLayout>
            <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
                            <Bell className="w-8 h-8 text-primary" />
                            Notifications
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                        </p>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllAsRead}
                            className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl transition-colors font-medium border border-primary/20"
                        >
                            <CheckCheck size={18} />
                            <span>Mark all as read</span>
                        </button>
                    )}
                </div>

                {/* Notifications List */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                            <p className="text-muted-foreground">Loading notifications...</p>
                        </div>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                            <Bell className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">No notifications</h3>
                        <p className="text-muted-foreground">You're all caught up! Check back later for updates.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={clsx(
                                    "glass-card p-4 rounded-xl border transition-all duration-200",
                                    notification.isRead
                                        ? "border-border/50 bg-card/50"
                                        : "border-primary/30 bg-primary/5 shadow-lg shadow-primary/5"
                                )}
                            >
                                <div className="flex items-start gap-4">
                                    {/* Avatar */}
                                    <div className={clsx(
                                        "w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0",
                                        notification.senderAvatarGradient 
                                            ? `bg-gradient-to-br ${notification.senderAvatarGradient}`
                                            : "bg-gradient-to-br from-gray-500 to-slate-500"
                                    )}>
                                        {notification.senderName 
                                            ? getInitials(notification.senderName)
                                            : <User size={20} />
                                        }
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <div className="flex-1">
                                                <p className="text-sm font-semibold text-foreground">
                                                    {notification.senderName || 'System'}
                                                </p>
                                                <p className="text-sm text-muted-foreground mt-0.5">
                                                    {notification.message}
                                                </p>
                                            </div>
                                            {!notification.isRead && (
                                                <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                                            )}
                                        </div>
                                        
                                        <div className="flex items-center justify-between mt-2">
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Clock size={12} />
                                                <span>{formatDate(notification.createdAt)}</span>
                                            </div>
                                            
                                            <div className="flex items-center gap-2">
                                                {!notification.isRead && (
                                                    <button
                                                        onClick={() => handleMarkAsRead(notification.id)}
                                                        className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                        title="Mark as read"
                                                    >
                                                        <Check size={16} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(notification.id)}
                                                    className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
