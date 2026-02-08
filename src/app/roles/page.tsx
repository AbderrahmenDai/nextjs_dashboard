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
    siteId?: string;
}

interface RoleFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (role: Partial<Role>) => Promise<void>;
    role: Role | null;
    departments: Department[];
    sites: { id: string; name: string }[];
}

function RoleFormModal({
    isOpen,
    onClose,
    onSave,
    role,
    departments,
    sites
}: RoleFormModalProps) {
    const [formData, setFormData] = useState<Partial<Role>>({
        name: "",
        description: "",
        departmentId: ""
    });
    const [selectedSiteId, setSelectedSiteId] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isOpen) {
            setFormData(role || { name: "", description: "", departmentId: "" });
            setError("");

            // Set initial site if department is selected
            if (role?.departmentId) {
                const dept = departments.find(d => d.id === role.departmentId);
                if (dept?.siteId) {
                    setSelectedSiteId(dept.siteId);
                } else {
                    setSelectedSiteId("");
                }
            } else {
                setSelectedSiteId("");
            }
        }
    }, [isOpen, role, departments]);

    const filteredDepartments = departments.filter(d =>
        !selectedSiteId || d.siteId === selectedSiteId
    );

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        try {
            await onSave(formData);
            onClose();
        } catch (err: any) {
            setError(err.message || "Échec de l'enregistrement du poste");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start pt-20 justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 transition-all">
            <div className="modal-card w-full max-w-md p-0 animate-in zoom-in-95 duration-300">
                <div className="px-6 py-6 gradient-premium flex justify-between items-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]"></div>
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="p-2.5 bg-white/20 rounded-xl text-white shadow-inner">
                            <Shield className="w-5 h-5" />
                        </div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">
                            {role ? "Modifier le Poste" : "Ajouter un Poste"}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all relative z-10">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 text-red-500 rounded-lg text-sm font-medium border border-red-500/20">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">Nom du Poste</label>
                            <input
                                required
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="input-field"
                                placeholder="ex: Technicien Qualité"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">Site</label>
                            <select
                                value={selectedSiteId}
                                onChange={(e) => {
                                    setSelectedSiteId(e.target.value);
                                    // Clear department if not in new site
                                    setFormData(prev => ({ ...prev, departmentId: "" }));
                                }}
                                className="input-field"
                            >
                                <option value="">Tous les sites</option>
                                {sites.map((site) => (
                                    <option key={site.id} value={site.id}>{site.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">Département</label>
                            <select
                                value={formData.departmentId || ""}
                                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                                className="input-field"
                            >
                                <option value="">Sélectionner un département (Optionnel)</option>
                                {filteredDepartments.map((dept) => (
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
                                placeholder="Décrivez les responsabilités du poste..."
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t border-border">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-muted-foreground hover:bg-secondary rounded-lg transition-colors font-medium text-sm"
                                disabled={isLoading}
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium shadow-lg transition-all flex items-center gap-2 text-sm"
                            >
                                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                {role ? "Enregistrer" : "Créer le Poste"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default function RolesPage() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [sites, setSites] = useState<{ id: string; name: string }[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState("all");
    const [selectedSite, setSelectedSite] = useState("all");
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

    const loadDepartments = async () => {
        try {
            const data = await api.getDepartments();
            setDepartments(data);
        } catch (error) {
            console.error("Failed to fetch departments:", error);
        }
    };

    const loadSites = async () => {
        try {
            const data = await api.getSites();
            setSites(data);
        } catch (error) {
            console.error("Failed to fetch sites:", error);
        }
    };

    useEffect(() => {
        loadRoles();
        loadDepartments();
        loadSites();
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
        if (!confirm("Êtes-vous sûr de vouloir supprimer ce poste ?")) return;
        try {
            await api.deleteRole(id);
            setRoles(roles.filter(r => r.id !== id));
        } catch (error: any) {
            alert(error.message);
        }
    };

    const filteredRoles = roles.filter(r => {
        const matchesSearch =
            r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (r.description || "").toLowerCase().includes(searchTerm.toLowerCase());

        const matchesDepartment =
            selectedDepartment === "all" ||
            r.departmentId === selectedDepartment;

        // Pour filtrer par site, on doit vérifier le site du département
        const matchesSite = selectedSite === "all" || (() => {
            const dept = departments.find(d => d.id === r.departmentId);
            return dept && dept.siteId === selectedSite;
        })();

        return matchesSearch && matchesDepartment && matchesSite;
    });

    return (
        <DashboardLayout>
            <div className="flex flex-col h-full relative">
                <RoleFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    role={editingRole}
                    departments={departments}
                    sites={sites}
                />

                <div className="flex justify-between items-center mb-8">
                    <div className="pl-1">
                        <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-xl border border-primary/20 shadow-sm">
                                <Shield className="w-6 h-6 text-primary" />
                            </div>
                            Gestion des Postes
                            <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-black rounded-full border border-primary/20 ml-2">
                                {filteredRoles.length}
                            </span>
                        </h1>
                        <p className="text-muted-foreground mt-2 ml-14 font-medium">Gérez les postes et positions de votre organisation.</p>
                    </div>
                    <button
                        onClick={() => { setEditingRole(null); setIsModalOpen(true); }}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl shadow-lg transition-all hover:bg-primary/90 font-bold text-sm"
                    >
                        <Plus size={18} />
                        <span>Ajouter un Poste</span>
                    </button>
                </div>

                <div className="space-y-4 mb-6">
                    <div className="bg-card/50 border border-border rounded-xl p-1 max-w-md relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <input
                            type="text"
                            placeholder="Rechercher un poste..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-transparent p-2 pl-10 outline-none placeholder:text-muted-foreground/50"
                        />
                    </div>

                    <div className="flex gap-4 flex-wrap">
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Département</label>
                            <select
                                value={selectedDepartment}
                                onChange={(e) => setSelectedDepartment(e.target.value)}
                                className="w-full input-field appearance-none cursor-pointer"
                            >
                                <option value="all">Tous les départements</option>
                                {departments.map(dept => (
                                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Site</label>
                            <select
                                value={selectedSite}
                                onChange={(e) => setSelectedSite(e.target.value)}
                                className="w-full input-field appearance-none cursor-pointer"
                            >
                                <option value="all">Tous les sites</option>
                                {sites.map(site => (
                                    <option key={site.id} value={site.id}>{site.name}</option>
                                ))}
                            </select>
                        </div>

                        {(selectedDepartment !== "all" || selectedSite !== "all") && (
                            <div className="flex items-end">
                                <button
                                    onClick={() => {
                                        setSelectedDepartment("all");
                                        setSelectedSite("all");
                                    }}
                                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                                >
                                    Réinitialiser les filtres
                                </button>
                            </div>
                        )}
                    </div>
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
                            <p>Aucun poste trouvé.</p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
