"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Mail, Lock, Loader2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        
        // Validate email format
        if (!email || !validateEmail(email)) {
            setError("Please enter a valid email address");
            return;
        }

        // Validate password
        if (!password || password.length === 0) {
            setError("Password is required");
            return;
        }

        setIsLoading(true);

        try {
            await login(email, password);
        } catch (err: unknown) {
            let errorMessage = "Invalid email or password";
            if (err instanceof Error) {
                errorMessage = err.message;
            } else if (typeof err === 'object' && err !== null && 'message' in err && String((err as any).message).includes('fetch')) {
                errorMessage = "Unable to connect to server. Please check your connection.";
            }

            if (err instanceof TypeError && typeof err.message === 'string' && err.message.includes('fetch')) {
                errorMessage = "Unable to connect to server. Please check your connection.";
            }
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                staggerChildren: 0.15,
                ease: [0.4, 0, 0.2, 1] as const
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as const }
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-[#0f172a] text-white overflow-hidden font-sans">
            {/* Left Side - Login Form */}
            <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-16 relative z-10"
            >
                {/* Decorative background elements for left side */}
                <div className="absolute top-10 left-10 w-2 h-2 rounded-full bg-blue-500/50" />
                <div className="absolute bottom-20 left-20 w-1 h-1 rounded-full bg-purple-500/50" />
                <div className="absolute top-1/2 right-20 w-1.5 h-1.5 rounded-full bg-pink-500/50" />

                {/* Background circles */}
                <div className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] rounded-full border border-white/5 opacity-20 pointer-events-none" />
                <div className="absolute bottom-[10%] left-[5%] w-[150px] h-[150px] rounded-full border border-white/5 opacity-20 pointer-events-none" />


                <div className="w-full max-w-md space-y-8">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight mb-2 text-white">Sign In</h1>
                        <p className="text-slate-400">Enter your email and password to access your account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300 ml-1">Email</label>
                                <div className="relative group">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            setError("");
                                        }}
                                        required
                                        className="w-full bg-[#1e293b] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all outline-none pl-4 pr-10"
                                        placeholder="Enter your email"
                                    />
                                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={20} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300 ml-1">Password</label>
                                <div className="relative group">
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            setError("");
                                        }}
                                        required
                                        className="w-full bg-[#1e293b] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all outline-none pl-4 pr-10"
                                        placeholder="Enter your password"
                                    />
                                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={20} />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-400 hover:text-slate-300 transition-colors">
                                <input type="checkbox" className="w-4 h-4 rounded border-white/20 bg-[#1e293b] text-primary focus:ring-offset-0 focus:ring-primary/50" />
                                Remember me
                            </label>
                            <button type="button" className="text-sm font-semibold text-white/90 hover:text-white hover:underline transition-all">
                                Forgot Password?
                            </button>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-lg text-sm flex items-center gap-2"
                            >
                                <AlertCircle size={16} />
                                {error}
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#6366f1] hover:bg-[#5558e6] text-white font-bold py-3.5 rounded-lg transition-all shadow-[0_0_20px_-5px_#6366f1] hover:shadow-[0_0_25px_-5px_#6366f1] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={24} /> : "Sign In"}
                        </button>

                        <p className="text-center text-sm text-slate-500 mt-6">
                            Don&apos;t have any account? <button type="button" className="text-[#6366f1] hover:underline font-semibold">Sign Up</button>
                        </p>
                    </form>
                </div>

                {/* Bottom left corner logo/icon */}
                <div className="absolute bottom-6 left-6 w-10 h-10 rounded-full bg-black flex items-center justify-center">
                    <span className="font-bold text-white">N</span>
                </div>
            </motion.div>

            {/* Right Side - Hero/Banner */}
            <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="hidden lg:flex w-1/2 bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] relative overflow-hidden flex-col justify-between p-16"
            >
                {/* Decorative Background Elements */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />

                <div className="absolute top-1/2 right-0 translate-x-1/3 -translate-y-1/2 w-[600px] h-[600px] bg-white/10 rounded-full blur-[80px]" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[100px]" />

                {/* Content */}
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center">
                            <div className="w-1/2 h-1/2 bg-transparent border-t-2 border-r-2 border-white rotate-45" />
                        </div>
                        <span className="text-2xl font-bold text-white tracking-tight">NextAdmin</span>
                    </div>

                    <div className="space-y-4 max-w-lg">
                        <p className="text-white/80 text-lg font-medium">Sign in to your account</p>
                        <h2 className="text-5xl font-bold text-white leading-tight">Welcome Back!</h2>
                        <p className="text-white/80 leading-relaxed text-lg">
                            Please sign in to your account by completing the necessary fields to access your HR dashboard
                        </p>
                    </div>
                </div>

                {/* Feature Badges */}
                <div className="relative z-10 flex gap-4 mt-auto">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 backdrop-blur-sm border border-green-500/30 text-white text-sm font-semibold">
                        <div className="w-2 h-2 rounded-full bg-green-400" />
                        Secure
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/20 backdrop-blur-sm border border-orange-500/30 text-white text-sm font-semibold">
                        <div className="w-2 h-2 rounded-full bg-orange-400" />
                        Fast
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 backdrop-blur-sm border border-blue-500/30 text-white text-sm font-semibold">
                        <div className="w-2 h-2 rounded-full bg-blue-400" />
                        Efficient
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/20 backdrop-blur-sm border border-pink-500/30 text-white text-sm font-semibold">
                        <div className="w-2 h-2 rounded-full bg-pink-400" />
                        Analytics
                    </div>
                </div>

                {/* Decorative floating icons (optional polish) */}
                <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-32 right-32 text-white/10"
                >
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-2 1V17l7 3.5 7-3.5v-5l-2-1-5 2.5z" /></svg>
                </motion.div>

            </motion.div>
        </div>
    );
}
