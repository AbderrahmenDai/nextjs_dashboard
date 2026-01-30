"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { Plus, Pencil, Trash2, Search, X, Loader2, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface Role {
    id: string;
    name: string;
    description?: string;
    departmentId?: string;
    departmentName?: string;
}

interface Department {
    id: string;
    name: string;
}

function RoleFormModal({
    isOpen,
    onClose,
    onSave,
    role
}: {
    isOpen: boolean;
    onClose: () => void;
    onSave: (role: Partial<Role>) => Promise<void>;
    role: Role | null;
}) {
    const [formData, setFormData] = useState<Partial<Role>>({
        name: "",
        description: "",
        departmentId: ""
    });
    const [departments, setDepartments] = useState<Department[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isOpen) {
            setFormData(role || { name: "", description: "", departmentId: "" });
            setError("");
            // Fetch depts
            api.getDepartments().then(setDepartments).catch(console.error);
        }
    }, [isOpen, role]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        try {
            await onSave(formData);
            onClose();
        } catch (err: any) {
            setError(err.message || "Failed to save role");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="glass-card w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6 border-b border-border pb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Shield className="w-5 h-5 text-primary" />
                        {role ? "Edit Role" : "Add Role"}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 text-red-500 rounded-lg text-sm font-medium border border-red-500/20">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">Role Name</label>
                        <input
                            required
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="input-field"
                            placeholder="e.g. MANAGER"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">Department</label>
                        <select
                            value={formData.departmentId || ""}
                            onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                            className="input-field"
                        >
                            <option value="">Select Department (Optional)</option>
                            {departments.map((dept) => (
                                <option key={dept.id} value={dept.id}>{dept.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">Description</label>
                        <textarea
                            value={formData.description || ""}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="input-field min-h-[100px]"
                            placeholder="Describe the role's responsibilities..."
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-muted-foreground hover:bg-secondary rounded-lg transition-colors font-medium text-sm"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium shadow-lg transition-all flex items-center gap-2 text-sm"
                        >
                            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {role ? "Save Changes" : "Create Role"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function RolesPage() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);

    const loadRoles = async () => {
        try {
            const data = await api.getRoles();
            setRoles(data);
        } catch (error) {
            console.error("Failed to fetch roles:", error);
        }
    };

    useEffect(() => {
        loadRoles();
    }, []);

    const handleSave = async (roleData: Partial<Role>) => {
        if (editingRole) {
            await api.updateRole(editingRole.id, roleData);
        } else {
            await api.createRole(roleData);
        }
        await loadRoles();
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this role?")) return;
        try {
            await api.deleteRole(id);
            setRoles(roles.filter(r => r.id !== id));
        } catch (error: any) {
            alert(error.message);
        }
    };

    const filteredRoles = roles.filter(r =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.description || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="flex flex-col h-full relative">
                <RoleFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    role={editingRole}
                />

                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Role Management</h1>
                        <p className="text-muted-foreground mt-1">Manage system roles and permissions.</p>
                    </div>
                    <button
                        onClick={() => { setEditingRole(null); setIsModalOpen(true); }}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl shadow-lg transition-all hover:bg-primary/90 font-bold text-sm"
                    >
                        <Plus size={18} />
                        <span>Add Role</span>
                    </button>
                </div>

                <div className="bg-card/50 border border-border rounded-xl p-1 mb-6 max-w-md relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <input
                        type="text"
                        placeholder="Search roles..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-transparent p-2 pl-10 outline-none placeholder:text-muted-foreground/50"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRoles.map(role => (
                        <div key={role.id} className="glass-card p-6 rounded-xl flex flex-col gap-4 group hover:border-primary/50 transition-all">
                            <div className="flex justify-between items-start">
                                <div className="p-3 bg-primary/10 text-primary rounded-xl">
                                    <Shield size={24} />
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => { setEditingRole(role); setIsModalOpen(true); }}
                                        className="p-2 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(role.id)}
                                        className="p-2 hover:bg-red-500/10 rounded-lg text-muted-foreground hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold mb-1">{role.name}</h3>
                                {role.departmentName && (
                                    <span className="text-xs font-bold uppercase bg-primary/10 text-primary px-2 py-0.5 rounded mb-2 inline-block">
                                        {role.departmentName}
                                    </span>
                                )}
                                <p className="text-sm text-muted-foreground line-clamp-2">{role.description || "No description provided."}</p>
                            </div>
                            <div className="mt-auto pt-4 border-t border-border/50 flex justify-between items-center text-xs text-muted-foreground font-medium">
                                <span>ID: {role.id.slice(0, 8)}...</span>
                            </div>
                        </div>
                    ))}

                    {filteredRoles.length === 0 && (
                        <div className="col-span-full py-12 text-center text-muted-foreground bg-secondary/20 rounded-xl border border-dashed border-border">
                            <Shield className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>No roles found.</p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
