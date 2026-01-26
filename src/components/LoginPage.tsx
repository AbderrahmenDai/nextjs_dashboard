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
    const [videoLoaded, setVideoLoaded] = useState(false);
    const { login } = useAuth();

    // Reset error logic moved to input handlers

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
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
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
            {/* Background Layer */}
            <div className="fixed inset-0 z-0">
                {/* Fallback Animated Blobs (Visible until video loads or if video is missing) */}
                <div className={`absolute inset-0 transition-opacity duration-1000 ${videoLoaded ? 'opacity-0' : 'opacity-100'}`}>
                    <div className="absolute inset-0 bg-background" /> {/* Base color */}
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            rotate: [0, 90, 0],
                            opacity: [0.3, 0.5, 0.3],
                        }}
                        transition={{
                            duration: 15,
                            repeat: Infinity,
                            repeatType: "reverse",
                            ease: "easeInOut"
                        }}
                        className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full bg-primary/20 blur-[130px]"
                    />
                    <motion.div
                        animate={{
                            scale: [1, 1.3, 1],
                            x: [0, 50, 0],
                            opacity: [0.3, 0.6, 0.3],
                        }}
                        transition={{
                            duration: 20,
                            repeat: Infinity,
                            repeatType: "reverse",
                            ease: "easeInOut"
                        }}
                        className="absolute bottom-[-20%] left-[-10%] w-[900px] h-[900px] rounded-full bg-blue-600/20 blur-[150px]"
                    />
                    <motion.div
                        animate={{
                            scale: [1, 1.1, 1],
                            y: [0, -30, 0],
                            opacity: [0.2, 0.4, 0.2],
                        }}
                        transition={{
                            duration: 18,
                            repeat: Infinity,
                            repeatType: "reverse",
                            ease: "easeInOut"
                        }}
                        className="absolute top-[40%] left-[30%] w-[600px] h-[600px] rounded-full bg-purple-500/10 blur-[100px]"
                    />
                </div>

                {/* Video Background */}
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoadedData={() => setVideoLoaded(true)}
                >
                    <source src="/login-background.mp4" type="video/mp4" />
                </video>

                {/* Overlay Gradient for Readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/90 backdrop-blur-[2px]" />

                {/* Grid Pattern Overlay */}
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
            </div>

            <motion.div
                className="w-full max-w-md relative z-10"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Login Card */}
                <div className="glass-card border border-white/40 dark:border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-2xl bg-white/60 dark:bg-black/20 overflow-hidden relative">

                    {/* Decorative Top Highlight */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-80" />

                    {/* Header */}
                    <div className="text-center mb-8 flex flex-col items-center relative">
                        <motion.div
                            initial={{ scale: 0, rotate: -180, opacity: 0 }}
                            animate={{ scale: 1, rotate: 0, opacity: 1 }}
                            transition={{
                                type: "spring",
                                stiffness: 200,
                                damping: 20,
                                delay: 0.1
                            }}
                            whileHover={{ scale: 1.05, rotate: 5 }}
                            className="relative w-36 h-36 mb-6 drop-shadow-2xl"
                        >
                            <Image
                                src="/logo.png"
                                alt="Company Logo"
                                fill
                                className="object-contain"
                                priority
                            />
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <h1 className="text-4xl font-extrabold text-foreground mb-2 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">
                                Welcome
                            </h1>
                            <p className="text-muted-foreground font-medium text-lg">
                                Sign in to your dashboard
                            </p>
                        </motion.div>
                    </div>

                    {/* Error Message */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, y: -10 }}
                                animate={{ opacity: 1, height: "auto", y: 0 }}
                                exit={{ opacity: 0, height: 0, y: -10 }}
                                className="mb-6 rounded-xl overflow-hidden"
                            >
                                <div className="bg-destructive/10 border border-destructive/20 p-4 flex items-center gap-3">
                                    <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                                    <p className="text-sm text-destructive font-semibold">{error}</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Field */}
                        <motion.div variants={itemVariants} className="space-y-2">
                            <label className="text-sm font-semibold text-foreground/80 ml-1" htmlFor="email">
                                Email Address
                            </label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-300 group-focus-within:text-primary text-muted-foreground">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (error) setError("");
                                    }}
                                    required
                                    className="input-field pl-12 py-4 bg-white/70 dark:bg-black/20 border-white/50 dark:border-white/10 shadow-inner group-hover:bg-white/90 focus:bg-white dark:focus:bg-black/40"
                                    placeholder="name@company.com"
                                    disabled={isLoading}
                                />
                            </div>
                        </motion.div>

                        {/* Password Field */}
                        <motion.div variants={itemVariants} className="space-y-2">
                            <label className="text-sm font-semibold text-foreground/80 ml-1" htmlFor="password">
                                Password
                            </label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-300 group-focus-within:text-primary text-muted-foreground">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (error) setError("");
                                    }}
                                    required
                                    className="input-field pl-12 py-4 bg-white/70 dark:bg-black/20 border-white/50 dark:border-white/10 shadow-inner group-hover:bg-white/90 focus:bg-white dark:focus:bg-black/40"
                                    placeholder="••••••••"
                                    disabled={isLoading}
                                />
                            </div>
                        </motion.div>

                        {/* Submit Button */}
                        <motion.div
                            variants={itemVariants}
                            className="pt-2"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 px-4 bg-gradient-to-r from-primary to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative overflow-hidden group"
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Signing In...</span>
                                    </>
                                ) : (
                                    <span>Sign In</span>
                                )}
                            </button>
                        </motion.div>
                    </form>

                    {/* Footer */}
                    <motion.div variants={itemVariants} className="mt-8 pt-6 border-t border-border/30 text-center">
                        <p className="text-xs text-muted-foreground font-medium flex items-center justify-center gap-1.5 opacity-80">
                            <Lock className="w-3 h-3" />
                            Secure Corporate Access
                        </p>
                    </motion.div>
                </div>

                {/* Additional Info */}
                <motion.div variants={itemVariants} className="mt-8 text-center">
                    <p className="text-sm text-muted-foreground/80 font-medium">
                        &copy; {new Date().getFullYear()} Recruitment System. All rights reserved.
                    </p>
                </motion.div>
            </motion.div>
        </div>
    );
}

