"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { Lock, Search, Filter, Plus, Pencil, Trash2, X, AlertTriangle, Loader2 } from "lucide-react";
import { clsx } from "clsx";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

// --- Types ---
interface User {
    id: string;
    name: string;
    email: string;
    password?: string; // Optional for existing users in display, but form will use it
    role: "Responsable RH" | "Responsable Recrutement" | "Direction" | "Demandeur" | "Employee"; // Keeping Employee as fallback
    department: string;
    departmentId?: string;
    status: "Active" | "Offline" | "In Meeting";
    avatarGradient: string;
}

interface Department {
    id: string;
    name: string;
}




// --- Password Change Modal ---
function PasswordChangeModal({
    isOpen,
    onClose,
    onSave,
    userName
}: {
    isOpen: boolean;
    onClose: () => void;
    onSave: (password: string) => Promise<void>;
    userName: string;
}) {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setPassword("");
            setConfirmPassword("");
            setError("");
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!password) {
            setError("Password is required");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters long");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setIsLoading(true);
        try {
            await onSave(password);
            onClose();
        } catch (err: any) {
            setError(err.message || "Failed to update password");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl p-6 animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Lock className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Change Password</h2>
                            <p className="text-sm text-slate-400">{userName}</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                        disabled={isLoading}
                    >
                        <X size={20} />
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
                        <p className="text-sm text-destructive">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">New Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                            placeholder="Enter new password"
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                            placeholder="Confirm new password"
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="px-4 py-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors font-medium disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl font-medium shadow-lg shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                            <span>Change Password</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// --- Delete Confirmation Modal ---
function DeleteConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    userName
}: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    userName: string;
}) {
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        setIsLoading(true);
        try {
            await onConfirm();
            onClose();
        } catch (error) {
            console.error("Failed to delete user:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl p-6 animate-in fade-in zoom-in duration-200">
                <div className="flex items-start gap-4 mb-6">
                    <div className="p-3 bg-destructive/10 rounded-xl">
                        <AlertTriangle className="w-6 h-6 text-destructive" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-white mb-2">Delete User</h2>
                        <p className="text-slate-400">
                            Are you sure you want to delete <span className="font-semibold text-white">{userName}</span>? This action cannot be undone.
                        </p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                        disabled={isLoading}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors font-medium disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className="px-6 py-2 bg-destructive hover:bg-destructive/90 text-white rounded-xl font-medium shadow-lg shadow-destructive/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                        <span>Delete User</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

// --- Helper for Modal ---
function UserFormModal({
    isOpen,
    onClose,
    onSave,
    user,
    departments
}: {
    isOpen: boolean;
    onClose: () => void;
    onSave: (user: Partial<User>) => void;
    user: User | null;
    departments: Department[];
}) {
    const [formData, setFormData] = useState<Partial<User>>(
        user || {
            name: "",
            email: "",
            password: "",
            role: "Demandeur",
            departmentId: departments.length > 0 ? departments[0].id : "",
            status: "Active",
            avatarGradient: "from-gray-500 to-slate-500"
        }
    );

    useEffect(() => {
        if (isOpen) {
            setFormData(user || {
                name: "",
                email: "",
                password: "",
                role: "Demandeur",
                departmentId: departments.length > 0 ? departments[0].id : "",
                status: "Active",
                avatarGradient: "from-gray-500 to-slate-500"
            });
        }
    }, [isOpen, user, departments]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Basic validation could go here
        onSave(formData as User);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl p-6 animate-in fade-in zoom-in duration-200 overflow-y-auto max-h-[90vh] custom-scrollbar">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">{user ? "Edit User" : "Add New User"}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
                        <input
                            required
                            type="text"
                            value={formData.name || ""}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                            placeholder="e.g. John Doe"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
                        <input
                            required
                            type="email"
                            value={formData.email || ""}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                            placeholder="john@company.com"
                        />
                    </div>

                    {!user && (
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                            <input
                                required={!user}
                                type="password"
                                value={formData.password || ""}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="••••••••"
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Role</label>
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value as User["role"] })}
                                className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer"
                            >
                                <option value="Responsable RH">Responsable RH</option>
                                <option value="Responsable Recrutement">Responsable Recrutement</option>
                                <option value="Direction">Direction</option>
                                <option value="Demandeur">Demandeur</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Department</label>
                            <select
                                value={formData.departmentId || ""}
                                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                                className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer"
                            >
                                {departments.length === 0 && <option value="">Loading...</option>}
                                {departments.map(dept => (
                                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
                        <div className="flex bg-slate-800 p-1 rounded-xl border border-white/5">
                            {(["Active", "In Meeting", "Offline"] as const).map((status) => (
                                <button
                                    key={status}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, status })}
                                    className={clsx(
                                        "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
                                        formData.status === status
                                            ? "bg-white/10 text-white shadow-sm"
                                            : "text-muted-foreground hover:text-white"
                                    )}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl font-medium shadow-lg shadow-primary/20 transition-all"
                        >
                            {user ? "Save Changes" : "Create User"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [passwordChangeUser, setPasswordChangeUser] = useState<User | null>(null);
    const [deleteUser, setDeleteUser] = useState<User | null>(null);

    // --- Fetch Users on Mount ---
    const loadData = async () => {
        try {
            const [usersData, departmentsData] = await Promise.all([
                api.getUsers(),
                api.getDepartments()
            ]);
            setUsers(usersData);
            setDepartments(departmentsData);
        } catch (error) {
            console.error("Failed to load data:", error);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.department.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async () => {
        if (!deleteUser) return;
        try {
            await api.deleteUser(deleteUser.id);
            setUsers(users.filter(u => u.id !== deleteUser.id));
            setDeleteUser(null);
        } catch (error) {
            console.error("Failed to delete user:", error);
            alert("Failed to delete user.");
        }
    };

    const handlePasswordChange = async (password: string) => {
        if (!passwordChangeUser) return;
        try {
            await api.updateUserPassword(passwordChangeUser.id, password);
            setPasswordChangeUser(null);
            // Optionally show success message
        } catch (error: any) {
            throw error; // Let the modal handle the error display
        }
    };

    const handleSaveUser = async (userData: Partial<User>) => {
        try {
            if (editingUser) {
                // Update
                const updated = await api.updateUser(editingUser.id, userData);
                setUsers(users.map(u => u.id === editingUser.id ? updated : u));
            } else {
                // Create
                const created = await api.createUser(userData);
                setUsers([created, ...users]);
            }
            setIsModalOpen(false);
            setEditingUser(null);
        } catch (error) {
            console.error("Failed to save user:", error);
            alert("Failed to save user.");
        }
    };

    const openCreateModal = () => {
        setEditingUser(null);
        setIsModalOpen(true);
    };

    const openEditModal = (user: User) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col h-full relative">
                <UserFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveUser}
                    user={editingUser}
                    departments={departments}
                />
                <PasswordChangeModal
                    isOpen={!!passwordChangeUser}
                    onClose={() => setPasswordChangeUser(null)}
                    onSave={handlePasswordChange}
                    userName={passwordChangeUser?.name || ""}
                />
                <DeleteConfirmationModal
                    isOpen={!!deleteUser}
                    onClose={() => setDeleteUser(null)}
                    onConfirm={handleDelete}
                    userName={deleteUser?.name || ""}
                />

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">User Management</h1>
                        <p className="text-muted-foreground mt-1">Manage system users, roles, and permissions.</p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl transition-all shadow-lg shadow-primary/25 font-medium"
                    >
                        <Plus size={20} />
                        <span>Add User</span>
                    </button>
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name, email, or department..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-slate-500"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-white transition-colors">
                        <Filter size={18} />
                        <span>Filter</span>
                    </button>
                </div>

                {/* User Table (Card List Style) */}
                <div className="grid grid-cols-1 gap-4">
                    {filteredUsers.map((user) => (
                        <div key={user.id} className="glass-card p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group">
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                {/* Avatar */}
                                <div className={clsx("w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg bg-gradient-to-br shadow-inner", user.avatarGradient)}>
                                    {user.name.charAt(0) + (user.name.split(' ')[1] ? user.name.split(' ')[1].charAt(0) : '')}
                                </div>

                                {/* Info */}
                                <div>
                                    <h4 className="text-base font-semibold text-white">{user.name}</h4>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 md:gap-6 w-full md:w-auto mt-2 md:mt-0">
                                {/* Role Badge */}
                                <div className={clsx(
                                    "px-2.5 py-1 rounded-lg border text-xs font-medium uppercase tracking-wider",
                                    user.role === "Responsable RH" || user.role === "Direction" ? "bg-purple-500/10 border-purple-500/20 text-purple-300" :
                                        user.role === "Responsable Recrutement" ? "bg-blue-500/10 border-blue-500/20 text-blue-300" :
                                            "bg-slate-500/10 border-slate-500/20 text-slate-300"
                                )}>
                                    {user.role}
                                </div>

                                {/* Department */}
                                <div className="text-sm text-slate-300 font-medium px-3 py-1 bg-white/5 rounded-lg border border-white/5">
                                    {user.department}
                                </div>

                                {/* Status */}
                                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5">
                                    <span className={clsx("w-2 h-2 rounded-full animate-pulse",
                                        user.status === 'Active' ? 'bg-emerald-400' :
                                            user.status === 'In Meeting' ? 'bg-amber-400' : 'bg-slate-500'
                                    )} />
                                    <span className="text-xs font-medium text-slate-300">{user.status}</span>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 ml-auto md:ml-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => openEditModal(user)}
                                        className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                        title="Edit User"
                                    >
                                        <Pencil size={18} />
                                    </button>
                                    <button 
                                        onClick={() => setDeleteUser(user)} 
                                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" 
                                        title="Delete User"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                    <button 
                                        onClick={() => setPasswordChangeUser(user)}
                                        className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                        title="Change Password"
                                    >
                                        <Lock size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {filteredUsers.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground bg-white/5 rounded-xl border border-white/5 border-dashed">
                            <p>No users found matching your search.</p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
