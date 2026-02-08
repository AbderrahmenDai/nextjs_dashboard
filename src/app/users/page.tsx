"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { Lock, Search, Filter, Plus, Pencil, Trash2, X, AlertTriangle, Loader2, User as UserIcon } from "lucide-react";
import { clsx } from "clsx";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";

// --- Types ---
interface User {
    id: string;
    name: string;
    email: string;
    password?: string;
    role: string;
    roleId: string;
    department: string;
    departmentId?: string;
    site?: string;
    status: "Active" | "Offline" | "In Meeting";
    avatarGradient: string;
}

interface Site {
    id: string;
    name: string;
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
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to update password");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start pt-20 justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
            <div className="modal-card w-full max-w-md p-0 animate-in fade-in zoom-in duration-300">
                <div className="px-6 py-5 gradient-premium flex justify-between items-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px]"></div>
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="p-2.5 bg-white/20 rounded-xl text-white shadow-inner">
                            <Lock className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Changer le Mot de Passe</h2>
                            <p className="text-sm text-white/70">{userName}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg text-white/80 hover:text-white transition-colors relative z-10"
                        disabled={isLoading}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    {error && (
                        <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
                            <p className="text-sm text-destructive font-medium">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">Nouveau Mot de Passe</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input-field"
                                placeholder="Entrer le nouveau mot de passe"
                                disabled={isLoading}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">Confirmer le Mot de Passe</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="input-field"
                                placeholder="Confirmer le nouveau mot de passe"
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
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium shadow-lg shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                            >
                                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                <span>Changer le Mot de Passe</span>
                            </button>
                        </div>
                    </form>
                </div>
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
        <div className="fixed inset-0 z-50 flex items-start pt-20 justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
            <div className="modal-card w-full max-w-md p-0 overflow-hidden animate-in fade-in zoom-in duration-300 shadow-2xl">
                <div className="px-6 py-6 bg-gradient-to-br from-red-600 to-rose-600 flex justify-between items-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]"></div>
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="p-2.5 bg-white/20 rounded-xl text-white shadow-inner">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Supprimer l'Utilisateur</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-xl text-white/80 hover:text-white transition-all relative z-10"
                        disabled={isLoading}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    <div className="flex items-start gap-4 mb-8">
                        <div className="flex-1">
                            <p className="text-muted-foreground text-sm leading-relaxed">
                                Êtes-vous sûr de vouloir supprimer <span className="font-bold text-foreground">{userName}</span> ? Cette action est irréversible.
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={isLoading}
                            className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold shadow-lg shadow-red-600/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 text-sm"
                        >
                            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                            <span>Supprimer</span>
                        </button>
                    </div>
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
    sites,
    roles
}: {
    isOpen: boolean;
    onClose: () => void;
    onSave: (user: Partial<User>) => void;
    user: User | null;
    departments: Department[];
    sites: Site[];
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
    const [selectedSiteId, setSelectedSiteId] = useState("");

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
            // Try to set site from user's department or site
            if (user?.department) {
                // If we have dept object, we might know site. But dept here is just name string in User interface?
                // Wait, User interface has department string, and departmentId?
                // departments passed in are full objects.
                const dept = departments.find(d => d.id === user.departmentId);
                // We don't have siteId on Department interface in this file (lines 30-33).
                // But previously `api.getDepartments` returned objects with siteId.
                // I should cast or assume siteId exists if data has it.
                // For now, let's look at `User.site` (string name).
                const siteName = user.site;
                const site = sites.find(s => s.name === siteName);
                if (site) {
                    setSelectedSiteId(site.id);
                } else {
                    setSelectedSiteId("");
                }
            } else {
                setSelectedSiteId("");
            }
        }
    }, [isOpen, user, departments, roles, sites]);

    const filteredDepartments = departments.filter(d => {
        const dAny = d as any;
        return !selectedSiteId || (dAny.siteId === selectedSiteId);
    });

    // Deduplicate departments by name to avoid showing duplicates in the dropdown
    const uniqueDepartments = useMemo(() => {
        return filteredDepartments.reduce((acc: Department[], current) => {
            const x = acc.find(item => item.name === current.name);
            if (!x) {
                return acc.concat([current]);
            } else {
                return acc;
            }
        }, []);
    }, [filteredDepartments]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as User);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start pt-20 justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
            <div className="modal-card w-full max-w-lg p-0 shadow-2xl animate-in zoom-in-95 duration-300">
                {/* Header with improved contrast */}
                <div className="px-6 py-6 gradient-premium flex justify-between items-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]"></div>
                    <div className="relative z-10">
                        <h2 className="text-2xl font-bold text-white tracking-tight">
                            {user ? "Modifier l'Utilisateur" : "Ajouter un Nouvel Utilisateur"}
                        </h2>
                        <p className="text-sm text-white/80 mt-1">
                            {user ? "Modifier les détails de l'utilisateur" : "Créer un nouveau compte membre d'équipe"}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-all relative z-10">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Compact Grid for Basic Info */}
                    <div className="grid grid-cols-1 gap-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide ml-1">Nom Complet</label>
                            <div className="relative group">
                                <UserIcon className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <input
                                    required
                                    type="text"
                                    value={formData.name || ""}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="input-field pl-10 bg-secondary/30 focus:bg-background transition-all"
                                    placeholder="ex: John Doe"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide ml-1">Adresse Email</label>
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
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide ml-1">Mot de Passe</label>
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
                        <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">Poste</label>
                        <input
                            required
                            type="text"
                            maxLength={50}
                            value={formData.role || ""}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value, roleId: "" })}
                            className="input-field"
                            placeholder="ex: Comptable"
                        />
                    </div>

                    {/* Site Selection */}
                    <div>
                        <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">Site</label>
                        <select
                            value={selectedSiteId}
                            onChange={(e) => {
                                setSelectedSiteId(e.target.value);
                                setFormData(prev => ({ ...prev, departmentId: "" })); // Reset dept
                            }}
                            className="input-field appearance-none cursor-pointer"
                        >
                            <option value="">Tous les sites</option>
                            {sites.map(site => (
                                <option key={site.id} value={site.id}>{site.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">Département</label>
                        <select
                            value={formData.departmentId || ""}
                            onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                            className="input-field appearance-none cursor-pointer"
                        >
                            {departments.length === 0 && <option value="">Chargement...</option>}
                            {/* If site selected but no deps, show notice? */}
                            {!formData.departmentId && <option value="">Sélectionner un département</option>}
                            {uniqueDepartments.map(dept => (
                                <option key={dept.id} value={dept.id}>{dept.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-border mt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors font-medium text-sm"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium shadow-lg shadow-primary/20 transition-all text-sm"
                        >
                            {user ? "Enregistrer" : "Créer l'Utilisateur"}
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
    const [sites, setSites] = useState<Site[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState("All");
    const [selectedSite, setSelectedSite] = useState("All");
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [passwordChangeUser, setPasswordChangeUser] = useState<User | null>(null);
    const [deleteUser, setDeleteUser] = useState<User | null>(null);

    // --- Fetch Users on Mount ---
    const loadData = async () => {
        try {
            const [usersData, departmentsData, rolesData, sitesData] = await Promise.all([
                api.getUsers(),
                api.getDepartments(),
                api.getRoles(),
                api.getSites()
            ]);
            setUsers(usersData);
            setDepartments(departmentsData);
            setRoles(rolesData);
            setSites(sitesData);
        } catch (error) {
            console.error("Failed to load data:", error);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesDept = selectedDepartment === "All" || user.department === selectedDepartment;
        const matchesSite = selectedSite === "All" || user.site === selectedSite;

        return matchesSearch && matchesDept && matchesSite;
    });

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
                    sites={sites}
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

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="pl-1"
                    >
                        <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-xl border border-primary/20 shadow-sm">
                                <UserIcon className="w-6 h-6 text-primary" />
                            </div>
                            Utilisateurs
                            <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-black rounded-full border border-primary/20 ml-2">
                                {users.length}
                            </span>
                        </h1>
                        <p className="text-muted-foreground mt-2 ml-14 font-medium">Gérez les accès et les informations de votre équipe</p>
                    </motion.div>
                    <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={openCreateModal}
                        className="btn-primary flex items-center gap-3 px-8 py-4 text-base shadow-indigo-500/25"
                    >
                        <Plus size={20} strokeWidth={3} />
                        <span>Nouvel Utilisateur</span>
                    </motion.button>
                </div>

                <div className="space-y-6 mb-12">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Rechercher un talent ou un email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="input-field pl-12 h-14 bg-white/40 border-white/60 text-base"
                            />
                        </div>
                        <button
                            onClick={() => setIsFilterVisible(!isFilterVisible)}
                            className={clsx(
                                "flex items-center gap-2 px-6 h-14 border-2 rounded-2xl transition-all font-bold group shadow-sm",
                                isFilterVisible
                                    ? "bg-primary text-primary-foreground border-primary shadow-xl shadow-primary/30"
                                    : "bg-white/40 border-white/60 text-foreground hover:bg-white/60"
                            )}
                        >
                            <Filter size={20} className={clsx("transition-transform duration-300", isFilterVisible && "rotate-180")} />
                            <span>Filtrer</span>
                        </button>
                    </div>

                    <AnimatePresence>
                        {isFilterVisible && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, y: -20 }}
                                animate={{ opacity: 1, height: "auto", y: 0 }}
                                exit={{ opacity: 0, height: 0, y: -20 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className="glass-card p-8 rounded-[2rem] grid grid-cols-1 md:grid-cols-2 gap-8 overflow-hidden"
                            >
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Département</label>
                                    <select
                                        value={selectedDepartment}
                                        onChange={(e) => setSelectedDepartment(e.target.value)}
                                        className="input-field h-12 appearance-none cursor-pointer bg-white/40 dark:bg-black/40 border-white/60 dark:border-white/5"
                                    >
                                        <option value="All">Tous les départements</option>
                                        {departments.map(dept => (
                                            <option key={dept.id} value={dept.name}>{dept.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Site / Emplacement</label>
                                    <select
                                        value={selectedSite}
                                        onChange={(e) => setSelectedSite(e.target.value)}
                                        className="input-field h-12 appearance-none cursor-pointer bg-white/40 dark:bg-black/40 border-white/60 dark:border-white/5"
                                    >
                                        <option value="All">Tous les sites</option>
                                        {sites.map(site => (
                                            <option key={site.id} value={site.name}>{site.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* User Cards Grid */}
                <motion.div
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    <AnimatePresence mode="popLayout">
                        {filteredUsers.map((user, idx) => (
                            <motion.div
                                key={user.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                                transition={{ delay: idx * 0.05, type: "spring", stiffness: 260, damping: 20 }}
                                className="glass-card group hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 relative"
                            >
                                {/* Background Decorative Elements with user colors */}
                                <div className="absolute top-0 right-0 w-24 h-24 bg-green-200/20 dark:bg-green-500/10 rounded-bl-full -mr-12 -mt-12 group-hover:bg-green-200/30 transition-colors duration-500" />
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-300/20 dark:bg-blue-500/10 rounded-tr-full -ml-12 -mb-12 group-hover:bg-blue-300/30 transition-colors duration-500" />

                                <div className="p-8 relative z-10">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={clsx(
                                            "w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-xl rotate-3 group-hover:rotate-0 transition-transform duration-500 bg-gradient-to-br",
                                            user.avatarGradient || "from-indigo-500 to-purple-600"
                                        )}>
                                            {user.name.charAt(0)}
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                                            <button
                                                onClick={() => openEditModal(user)}
                                                className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                                            >
                                                <Pencil size={18} />
                                            </button>
                                            <button
                                                onClick={() => setDeleteUser(user)}
                                                className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="text-xl font-black text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                                                {user.name}
                                                {user.id === '3' && <span className="text-[10px] bg-blue-200 text-blue-700 px-2 py-0.5 rounded border border-blue-300 font-black">ME</span>}
                                            </h3>
                                            <p className="text-sm text-muted-foreground font-medium truncate">{user.email}</p>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-3 py-4 border-y border-border/40">
                                            <div className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20">
                                                {user.role}
                                            </div>
                                            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-3 py-1.5 bg-secondary/50 rounded-lg border border-border/50">
                                                {user.department}
                                            </div>
                                            <div className="text-[10px] font-black uppercase tracking-widest text-blue-500 px-3 py-1.5 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                                {user.site}
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center pt-2">
                                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/30 border border-border/30">
                                                <div className={clsx(
                                                    "w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] animate-pulse",
                                                    user.status === 'Active' ? 'bg-emerald-400 text-emerald-400' :
                                                        user.status === 'In Meeting' ? 'bg-amber-400 text-amber-400' : 'bg-slate-400 text-slate-400'
                                                )} />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{
                                                    user.status === 'Active' ? 'Actif' :
                                                        user.status === 'In Meeting' ? 'En Réunion' :
                                                            user.status === 'Offline' ? 'Hors Ligne' : user.status
                                                }</span>
                                            </div>
                                            <button
                                                onClick={() => setPasswordChangeUser(user)}
                                                className="text-[10px] font-black uppercase tracking-widest text-primary/60 hover:text-primary transition-colors flex items-center gap-1.5 group/btn"
                                            >
                                                <Lock size={12} className="group-hover/btn:scale-110 transition-transform" />
                                                Réinitialiser
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>

                {filteredUsers.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-20 text-muted-foreground bg-secondary/10 rounded-[3rem] border-2 border-dashed border-border flex flex-col items-center"
                    >
                        <div className="w-20 h-20 bg-secondary/20 rounded-full flex items-center justify-center mb-4">
                            <Search size={40} className="opacity-30" />
                        </div>
                        <h3 className="text-xl font-black text-foreground mb-1">Aucun utilisateur trouvé</h3>
                        <p className="font-medium">Essayez d&apos;ajuster vos filtres de recherche.</p>
                    </motion.div>
                )}
            </div>
        </DashboardLayout >
    );
}
