"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { Lock, Search, Filter, Plus, Pencil, Trash2, X, AlertTriangle, Loader2, User as UserIcon } from "lucide-react";
import { clsx } from "clsx";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

// --- Types ---
interface User {
    id: string;
    name: string;
    email: string;
    password?: string; // Optional for existing users in display, but form will use it
    role: string; // Dynamic role name
    roleId: string;
    department: string;
    departmentId?: string;
    status: "Active" | "Offline" | "In Meeting";
    avatarGradient: string;
}

interface Department {
    id: string;
    name: string;
}

interface Role {
    id: string;
    name: string;
    description?: string;
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="glass-card w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6 border-b border-border pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                            <Lock className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-foreground">Change Password</h2>
                            <p className="text-sm text-muted-foreground">{userName}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                        disabled={isLoading}
                    >
                        <X size={20} />
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
                        <p className="text-sm text-destructive font-medium">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">New Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input-field"
                            placeholder="Enter new password"
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="input-field"
                            placeholder="Confirm new password"
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-border mt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors font-medium text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium shadow-lg shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="glass-card w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
                <div className="flex items-start gap-4 mb-6">
                    <div className="p-3 bg-red-500/10 rounded-xl">
                        <AlertTriangle className="w-6 h-6 text-red-500" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-foreground mb-2">Delete User</h2>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            Are you sure you want to delete <span className="font-semibold text-foreground">{userName}</span>? This action cannot be undone.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                        disabled={isLoading}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors font-medium text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium shadow-lg shadow-red-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
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
    departments,
    roles
}: {
    isOpen: boolean;
    onClose: () => void;
    onSave: (user: Partial<User>) => void;
    user: User | null;
    departments: Department[];
    roles: Role[];
}) {
    // Only set initial state on open, but we need state for controlled inputs
    const [formData, setFormData] = useState<Partial<User>>({
        name: "",
        email: "",
        password: "",
        role: "Demandeur", // Default fallback
        departmentId: "",
        status: "Active",
        avatarGradient: "from-gray-500 to-slate-500"
    });

    useEffect(() => {
        if (isOpen) {
            setFormData(user || {
                name: "",
                email: "",
                password: "",
                role: roles.length > 0 ? roles[0].name : "Demandeur",
                departmentId: departments.length > 0 ? departments[0].id : "",
                status: "Active",
                avatarGradient: "from-gray-500 to-slate-500"
            });
        }
    }, [isOpen, user, departments, roles]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as User);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start pt-20 justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="glass-card w-full max-w-lg p-0 overflow-hidden shadow-2xl ring-1 ring-white/10 animate-in zoom-in-95 duration-300">
                {/* Header with improved contrast */}
                <div className="px-6 py-5 border-b border-border/50 bg-gradient-to-r from-secondary/50 to-transparent flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-foreground tracking-tight">
                            {user ? "Edit User" : "Add New User"}
                        </h2>
                        <p className="text-xs text-muted-foreground mt-1">
                            {user ? "Modify user details below" : "Create a new team member account"}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Compact Grid for Basic Info */}
                    <div className="grid grid-cols-1 gap-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide ml-1">Full Name</label>
                            <div className="relative group">
                                <UserIcon className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <input
                                    required
                                    type="text"
                                    value={formData.name || ""}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="input-field pl-10 bg-secondary/30 focus:bg-background transition-all"
                                    placeholder="e.g. John Doe"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide ml-1">Email Address</label>
                            <div className="relative group">
                                <span className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors flex items-center justify-center font-serif text-sm">@</span>
                                <input
                                    required
                                    type="email"
                                    value={formData.email || ""}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="input-field pl-10 bg-secondary/30 focus:bg-background transition-all"
                                    placeholder="john@company.com"
                                />
                            </div>
                        </div>

                        {!user && (
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide ml-1">Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <input
                                        required={!user}
                                        type="password"
                                        value={formData.password || ""}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="input-field pl-10 bg-secondary/30 focus:bg-background transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">Role</label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value, roleId: roles.find(role => role.name === e.target.value)?.id })}
                            className="input-field appearance-none cursor-pointer"
                        >
                            {roles.length === 0 && <option value="">Loading...</option>}
                            {roles.map(role => (
                                <option key={role.id} value={role.name}>{role.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">Department</label>
                        <select
                            value={formData.departmentId || ""}
                            onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                            className="input-field appearance-none cursor-pointer"
                        >
                            {departments.length === 0 && <option value="">Loading...</option>}
                            {departments.map(dept => (
                                <option key={dept.id} value={dept.id}>{dept.name}</option>
                            ))}
                        </select>
                    </div>


                    <div>
                        <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Status</label>
                        <div className="flex bg-secondary p-1 rounded-xl border border-border">
                            {(["Active", "In Meeting", "Offline"] as const).map((status) => (
                                <button
                                    key={status}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, status })}
                                    className={clsx(
                                        "flex-1 py-1.5 text-xs font-bold rounded-lg transition-all",
                                        formData.status === status
                                            ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-border mt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors font-medium text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium shadow-lg shadow-primary/20 transition-all text-sm"
                        >
                            {user ? "Save Changes" : "Create User"}
                        </button>
                    </div>
                </form>
            </div >
        </div >
    );
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [roles, setRoles] = useState<Role[]>([]); // New state for roles
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [passwordChangeUser, setPasswordChangeUser] = useState<User | null>(null);
    const [deleteUser, setDeleteUser] = useState<User | null>(null);

    // --- Fetch Users on Mount ---
    const loadData = async () => {
        try {
            const [usersData, departmentsData, rolesData] = await Promise.all([
                api.getUsers(),
                api.getDepartments(),
                api.getRoles()
            ]);
            setUsers(usersData);
            setDepartments(departmentsData);
            setRoles(rolesData);
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
                    roles={roles}
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
                        <h1 className="text-3xl font-bold text-foreground tracking-tight">User Management</h1>
                        <p className="text-muted-foreground mt-1">Manage system users, roles, and permissions.</p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl transition-all shadow-lg shadow-primary/25 font-bold text-sm"
                    >
                        <Plus size={18} strokeWidth={2.5} />
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
                            className="input-field pl-10 bg-card/50"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-3 bg-card border border-border rounded-xl hover:bg-secondary text-foreground transition-colors font-medium">
                        <Filter size={18} />
                        <span>Filter</span>
                    </button>
                </div>

                {/* User Table (Card List Style) */}
                <div className="grid grid-cols-1 gap-4">
                    {filteredUsers.map((user) => (
                        <div key={user.id} className="glass-card p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group hover:shadow-lg transition-all duration-300 border-l-4 border-l-transparent hover:border-l-primary">
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                {/* Avatar */}
                                <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg bg-gradient-to-br shadow-md ring-2 ring-background", user.avatarGradient)}>
                                    {user.name.charAt(0) + (user.name.split(' ')[1] ? user.name.split(' ')[1].charAt(0) : '')}
                                </div>

                                {/* Info */}
                                <div>
                                    <h4 className="text-base font-bold text-foreground flex items-center gap-2">
                                        {user.name}
                                        {user.id === '3' && <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded border border-primary/20">ME</span>}
                                    </h4>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 md:gap-6 w-full md:w-auto mt-2 md:mt-0">
                                {/* Role Badge */}
                                <div className={clsx(
                                    "px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider",
                                    user.role === "HR_MANAGER" || user.role === "Direction" ? "bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-300" :
                                        user.role === "Responsable Recrutement" ? "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-300" :
                                            "bg-secondary border-border text-muted-foreground"
                                )}>
                                    {user.role}
                                </div>

                                {/* Department */}
                                <div className="text-sm text-foreground/80 font-medium px-3 py-1 bg-secondary/50 rounded-lg border border-border/50">
                                    {user.department}
                                </div>

                                {/* Status */}
                                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/30 border border-border/30">
                                    <span className={clsx("w-2 h-2 rounded-full animate-pulse",
                                        user.status === 'Active' ? 'bg-emerald-400' :
                                            user.status === 'In Meeting' ? 'bg-amber-400' : 'bg-slate-400'
                                    )} />
                                    <span className="text-xs font-bold text-muted-foreground uppercase">{user.status}</span>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1 ml-auto md:ml-0 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                                    <button
                                        onClick={() => openEditModal(user)}
                                        className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                        title="Edit User"
                                    >
                                        <Pencil size={18} />
                                    </button>
                                    <button
                                        onClick={() => setPasswordChangeUser(user)}
                                        className="p-2 text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition-colors"
                                        title="Change Password"
                                    >
                                        <Lock size={18} />
                                    </button>
                                    <button
                                        onClick={() => setDeleteUser(user)}
                                        className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                        title="Delete User"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {filteredUsers.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground bg-secondary/20 rounded-xl border border-dashed border-border flex flex-col items-center">
                            <Search size={32} className="mb-2 opacity-50" />
                            <p>No users found matching your search.</p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
