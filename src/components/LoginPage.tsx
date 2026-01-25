"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Mail, Lock, Loader2, AlertCircle } from "lucide-react";

export function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            await login(email, password);
            // Clear any previous errors on success
            setError("");
        } catch (err: any) {
            // Handle different types of errors
            let errorMessage = "Invalid email or password";
            
            if (err.message) {
                errorMessage = err.message;
            } else if (err instanceof TypeError && err.message.includes('fetch')) {
                errorMessage = "Unable to connect to server. Please check your connection.";
            } else if (err.name === 'NetworkError' || err.message.includes('Failed to fetch')) {
                errorMessage = "Network error. Please check if the backend server is running.";
            }
            
            setError(errorMessage);
            // Make sure we don't store errors - error is only in component state
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            {/* Background Decoration */}
            <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[120px]" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-purple-500/5 blur-[100px]" />
            </div>

            <div className="w-full max-w-md">
                {/* Login Card */}
                <div className="glass-card border border-border/50 rounded-2xl p-8 shadow-2xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-blue-500 mb-4 shadow-lg">
                            <Lock className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-foreground mb-2">
                            Welcome Back
                        </h1>
                        <p className="text-muted-foreground">
                            Sign in to access your dashboard
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                            <p className="text-sm text-destructive">{error}</p>
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Field */}
                        <div className="space-y-2">
                            <label
                                htmlFor="email"
                                className="text-sm font-medium text-foreground"
                            >
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    placeholder="you@company.com"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <label
                                htmlFor="password"
                                className="text-sm font-medium text-foreground"
                            >
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    placeholder="Enter your password"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 px-4 bg-gradient-to-r from-primary to-blue-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Signing in...</span>
                                </>
                            ) : (
                                <span>Sign In</span>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t border-border/50">
                        <p className="text-center text-sm text-muted-foreground">
                            Demo credentials: Use any test user email and password{" "}
                            <span className="font-mono text-primary">Password123!</span>
                        </p>
                    </div>
                </div>

                {/* Additional Info */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-muted-foreground">
                        Recruitment Management System
                    </p>
                </div>
            </div>
        </div>
    );
}
