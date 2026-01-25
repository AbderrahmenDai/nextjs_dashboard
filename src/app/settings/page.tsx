"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { useState } from "react";
import { User, Lock, Settings as SettingsIcon, Moon, Sun, Globe } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "next-themes";
import { useLanguage } from "@/contexts/LanguageContext";
import { clsx } from "clsx";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

export default function SettingsPage() {
    const { user, login } = useAuth(); // login used to refresh user state if needed, or we might need a refreshUser method
    const { theme, setTheme } = useTheme();
    const { language, setLanguage, t } = useLanguage();
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences'>('profile');

    // Profile State
    const [profileData, setProfileData] = useState({
        name: user?.name || "",
        email: user?.email || "",
    });
    const [isProfileSaving, setIsProfileSaving] = useState(false);

    // Password State
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [isPasswordSaving, setIsPasswordSaving] = useState(false);

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.id) return;
        setIsProfileSaving(true);
        try {
            await api.updateUser(user.id, profileData);
            alert("Profile updated successfully");
            // Ideally we should refresh the user context here
        } catch (error) {
            console.error("Failed to update profile", error);
            alert("Failed to update profile");
        } finally {
            setIsProfileSaving(false);
        }
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.id) return;
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert("New passwords do not match");
            return;
        }
        setIsPasswordSaving(true);
        try {
            await api.updateUserPassword(user.id, passwordData.newPassword);
            alert("Password updated successfully");
            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (error) {
            console.error("Failed to update password", error);
            alert("Failed to update password");
        } finally {
            setIsPasswordSaving(false);
        }
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'security', label: 'Security', icon: Lock },
        { id: 'preferences', label: 'Preferences', icon: SettingsIcon },
    ];

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
                    <p className="text-muted-foreground mt-1">Manage your account settings and preferences.</p>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar Tabs */}
                    <div className="w-full md:w-64 flex flex-col gap-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={clsx(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left",
                                    activeTab === tab.id
                                        ? "bg-primary/20 text-primary font-medium border border-primary/20"
                                        : "text-muted-foreground hover:bg-white/5 hover:text-white"
                                )}
                            >
                                <tab.icon size={18} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                {activeTab === 'profile' && (
                                    <div className="glass-card p-6 rounded-2xl border border-white/10">
                                        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                                            <User size={20} className="text-primary" />
                                            Profile Information
                                        </h2>
                                        <form onSubmit={handleProfileUpdate} className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-muted-foreground mb-1">Full Name</label>
                                                <input
                                                    type="text"
                                                    value={profileData.name}
                                                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary/50"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-muted-foreground mb-1">Email Address</label>
                                                <input
                                                    type="email"
                                                    value={profileData.email}
                                                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary/50"
                                                />
                                            </div>
                                            <div className="pt-4">
                                                <button
                                                    type="submit"
                                                    disabled={isProfileSaving}
                                                    className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                                                >
                                                    {isProfileSaving ? 'Saving...' : 'Save Changes'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {activeTab === 'security' && (
                                    <div className="glass-card p-6 rounded-2xl border border-white/10">
                                        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                                            <Lock size={20} className="text-primary" />
                                            Change Password
                                        </h2>
                                        <form onSubmit={handlePasswordUpdate} className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-muted-foreground mb-1">New Password</label>
                                                <input
                                                    type="password"
                                                    value={passwordData.newPassword}
                                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary/50"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-muted-foreground mb-1">Confirm New Password</label>
                                                <input
                                                    type="password"
                                                    value={passwordData.confirmPassword}
                                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary/50"
                                                />
                                            </div>
                                            <div className="pt-4">
                                                <button
                                                    type="submit"
                                                    disabled={isPasswordSaving}
                                                    className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                                                >
                                                    {isPasswordSaving ? 'Updating...' : 'Update Password'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {activeTab === 'preferences' && (
                                    <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-8">
                                        <div>
                                            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                                                <SettingsIcon size={20} className="text-primary" />
                                                App Preferences
                                            </h2>

                                            <div className="space-y-6">
                                                {/* Theme Toggle */}
                                                <div>
                                                    <label className="block text-sm font-medium text-muted-foreground mb-3">Theme</label>
                                                    <div className="flex gap-4">
                                                        <button
                                                            onClick={() => setTheme('light')}
                                                            className={clsx(
                                                                "flex-1 p-4 rounded-xl border transition-all flex flex-col items-center gap-2",
                                                                theme === 'light'
                                                                    ? "bg-primary/20 border-primary text-primary"
                                                                    : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10"
                                                            )}
                                                        >
                                                            <Sun size={24} />
                                                            <span className="font-medium">Light Mode</span>
                                                        </button>
                                                        <button
                                                            onClick={() => setTheme('dark')}
                                                            className={clsx(
                                                                "flex-1 p-4 rounded-xl border transition-all flex flex-col items-center gap-2",
                                                                theme === 'dark'
                                                                    ? "bg-primary/20 border-primary text-primary"
                                                                    : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10"
                                                            )}
                                                        >
                                                            <Moon size={24} />
                                                            <span className="font-medium">Dark Mode</span>
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Language Toggle */}
                                                <div>
                                                    <label className="block text-sm font-medium text-muted-foreground mb-3">Language</label>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <button
                                                            onClick={() => setLanguage('en')}
                                                            className={clsx(
                                                                "p-4 rounded-xl border transition-all flex flex-col items-center gap-2",
                                                                language === 'en'
                                                                    ? "bg-primary/20 border-primary text-primary"
                                                                    : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10"
                                                            )}
                                                        >
                                                            <span className="text-2xl">🇺🇸</span>
                                                            <span className="font-medium">English</span>
                                                        </button>
                                                        <button
                                                            onClick={() => setLanguage('fr')}
                                                            className={clsx(
                                                                "p-4 rounded-xl border transition-all flex flex-col items-center gap-2",
                                                                language === 'fr'
                                                                    ? "bg-primary/20 border-primary text-primary"
                                                                    : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10"
                                                            )}
                                                        >
                                                            <span className="text-2xl">🇫🇷</span>
                                                            <span className="font-medium">Français</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
