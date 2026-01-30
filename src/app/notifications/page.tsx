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
    // Actions fields
    type?: 'INFO' | 'ACTION_REQUIRED';
    entityType?: 'HIRING_REQUEST' | null;
    entityId?: string | null;
    actions?: string[] | null; // e.g. ["APPROVE", "REJECT"]
}

export default function NotificationsPage() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    // Rejection Modal State
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [notificationToReject, setNotificationToReject] = useState<Notification | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");

    const loadNotifications = async () => {
        if (!user?.id) return;

        try {
            setIsLoading(true);
            const [notificationsData, unreadData] = await Promise.all([
                api.getNotifications(user.id),
                api.getUnreadCount(user.id)
            ]);

            // Parse actions if it comes as string from DB (mysql json sometimes needs parsing depending on driver config)
            // But usually api returns object. Let's assume api returns parsed json or we ensure it.
            // If it's pure string from raw query, we might need manual parsing.
            const parsedNotifications = notificationsData.map((n: any) => ({
                ...n,
                actions: typeof n.actions === 'string' ? JSON.parse(n.actions) : n.actions
            }));

            setNotifications(parsedNotifications);
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

    const handleAction = async (notification: Notification, action: string) => {
        if (!user || !notification.entityId || notification.entityType !== 'HIRING_REQUEST') return;

        try {
            let newStatus = '';

            if (action === 'REJECT') {
                setNotificationToReject(notification);
                setRejectionReason("");
                setIsRejectModalOpen(true);
                return;
            } else if (action === 'APPROVE') {
                // Determine status based on User Role (Simple logic for now)
                // If HR -> HR_APPROVED
                // If Direction or Admin -> APPROVED
                const role = user.role?.toUpperCase();
                if (role === 'HR_MANAGER' || role === 'RH MANAGER') {
                    newStatus = 'HR_APPROVED';
                } else if (role === 'DIRECTION' || role === 'ADMIN') {
                    newStatus = 'APPROVED';
                } else {
                    alert("You do not have permission to approve.");
                    return;
                }
            }

            if (newStatus) {
                await api.updateHiringRequest(notification.entityId, {
                    status: newStatus,
                    approverId: user.id
                });

                // Mark notification as read
                await handleMarkAsRead(notification.id);

                alert(`Request ${newStatus.toLowerCase().replace('_', ' ')} successfully.`);
                loadNotifications(); // Refresh to clean up or update UI
            }

        } catch (error) {
            console.error("Action failed:", error);
            alert("Failed to perform action.");
        }
    };

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

    const confirmReject = async () => {
        if (!notificationToReject || !notificationToReject.entityId || !user?.id) return;

        try {
            if (!rejectionReason.trim()) {
                alert("Please provide a reason for rejection.");
                return;
            }

            await api.updateHiringRequest(notificationToReject.entityId, {
                status: 'REJECTED',
                rejectionReason: rejectionReason,
                approverId: user.id
            });

            // Mark notification as read
            await handleMarkAsRead(notificationToReject.id);

            alert("Request rejected successfully.");
            setIsRejectModalOpen(false);
            setNotificationToReject(null);
            loadNotifications();
        } catch (error) {
            console.error("Rejection failed:", error);
            alert("Failed to reject request.");
        }
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
                                                <p className="text-sm font-bold text-foreground">
                                                    {notification.senderName || 'System'}
                                                </p>
                                                <p className="text-sm text-foreground/80 mt-0.5">
                                                    {notification.message}
                                                </p>

                                                {/* ACTIONS */}
                                                {notification.type === 'ACTION_REQUIRED' && notification.actions && Array.isArray(notification.actions) && !notification.isRead && (
                                                    <div className="mt-3 flex gap-3">
                                                        {notification.actions.includes('APPROVE') && (
                                                            <button
                                                                onClick={() => handleAction(notification, 'APPROVE')}
                                                                className="px-3 py-1.5 bg-green-500/10 text-green-600 hover:bg-green-500/20 border border-green-500/20 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors flex items-center gap-1"
                                                            >
                                                                <Check size={14} />
                                                                Approve
                                                            </button>
                                                        )}
                                                        {notification.actions.includes('REJECT') && (
                                                            <button
                                                                onClick={() => handleAction(notification, 'REJECT')}
                                                                className="px-3 py-1.5 bg-red-500/10 text-red-600 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors flex items-center gap-1"
                                                            >
                                                                <X size={14} />
                                                                Reject
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
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

            {/* Rejection Modal */}
            {isRejectModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-card w-full max-w-md p-6 rounded-2xl shadow-2xl border border-border animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-destructive">
                            <X className="w-6 h-6" />
                            Reject Request
                        </h3>
                        <p className="text-muted-foreground mb-4">
                            Please provide a reason for rejecting this hiring request. This will be sent to the requester.
                        </p>

                        <textarea
                            className="w-full min-h-[100px] p-3 rounded-xl border border-border bg-secondary/50 focus:ring-2 focus:ring-destructive/20 focus:border-destructive outline-none resize-none mb-6"
                            placeholder="Enter rejection reason..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            autoFocus
                        />

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setIsRejectModalOpen(false)}
                                className="px-4 py-2 text-sm font-medium hover:bg-secondary rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmReject}
                                className="px-4 py-2 text-sm font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg transition-colors shadow-lg shadow-destructive/20"
                            >
                                Confirm Rejection
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
