"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    avatarGradient?: string;
    departmentId?: string;
    department?: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'recruitment_user';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load user from localStorage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem(STORAGE_KEY);
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                // Validate that it's actually a user object with required fields
                if (parsedUser && typeof parsedUser === 'object' && parsedUser.id && parsedUser.email && parsedUser.name) {
                    setUser(parsedUser);
                } else {
                    // Invalid user data, remove it
                    console.warn('Invalid user data in localStorage, removing...');
                    localStorage.removeItem(STORAGE_KEY);
                }
            } catch (error) {
                console.error('Failed to parse stored user:', error);
                localStorage.removeItem(STORAGE_KEY);
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        const { api } = await import('@/lib/api');
        try {
            const userData = await api.login(email, password);
            // Validate user data before storing
            if (userData && userData.id && userData.email && userData.name) {
                setUser(userData);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
            } else {
                throw new Error('Invalid user data received from server');
            }
        } catch (error: any) {
            // Re-throw the error so LoginPage can handle it
            // Don't store anything in localStorage on error
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem(STORAGE_KEY);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout,
                isAuthenticated: !!user,
                isLoading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
