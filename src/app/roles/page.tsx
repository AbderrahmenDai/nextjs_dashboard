"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { Plus, Pencil, Trash2, Search, X, Loader2, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface Post {
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

interface PostFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (post: Partial<Post>) => Promise<void>;
    post: Post | null;
    departments: Department[];
    sites: { id: string; name: string }[];
}

function PostFormModal({
    isOpen,
    onClose,
    onSave,
    post,
    departments,
    sites
}: PostFormModalProps) {
    const [formData, setFormData] = useState<Partial<Post>>({
        name: "",
        description: "",
        departmentId: ""
    });
    const [selectedSiteId, setSelectedSiteId] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isOpen) {
            setFormData(post || { name: "", description: "", departmentId: "" });
            setError("");

            // Set initial site if department is selected
            if (post?.departmentId) {
                const dept = departments.find(d => d.id === post.departmentId);
                if (dept?.siteId) {
                    setSelectedSiteId(dept.siteId);
                } else {
                    setSelectedSiteId("");
                }
            } else {
                setSelectedSiteId("");
            }
        }
    }, [isOpen, post, departments]);

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
                            {post ? "Modifier le Poste" : "Ajouter un Poste"}
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
                                {post ? "Enregistrer" : "Créer le Poste"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default function RolesPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [sites, setSites] = useState<{ id: string; name: string }[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState("all");
    const [selectedSite, setSelectedSite] = useState("all");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<Post | null>(null);

    const loadPosts = async () => {
        try {
            const data = await api.getPosts();
            setPosts(data);
        } catch (error) {
            console.error("Failed to fetch posts:", error);
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
        loadPosts();
        loadDepartments();
        loadSites();
    }, []);

    const handleSave = async (postData: Partial<Post>) => {
        if (editingPost) {
            await api.updatePost(editingPost.id, postData);
        } else {
            await api.createPost(postData);
        }
        await loadPosts();
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer ce poste ?")) return;
        try {
            await api.deletePost(id);
            setPosts(posts.filter(r => r.id !== id));
        } catch (error: any) {
            alert(error.message);
        }
    };

    const filteredPosts = posts.filter(r => {
        const matchesSearch =
            (r.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
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
                <PostFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    post={editingPost}
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
                                {filteredPosts.length}
                            </span>
                        </h1>
                        <p className="text-muted-foreground mt-2 ml-14 font-medium">Gérez les postes et positions de votre organisation.</p>
                    </div>
                    <button
                        onClick={() => { setEditingPost(null); setIsModalOpen(true); }}
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
                    {filteredPosts.map(post => (
                        <div key={post.id} className="glass-card p-6 rounded-xl flex flex-col gap-4 group hover:border-primary/50 transition-all">
                            <div className="flex justify-between items-start">
                                <div className="p-3 bg-primary/10 text-primary rounded-xl">
                                    <Shield size={24} />
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => { setEditingPost(post); setIsModalOpen(true); }}
                                        className="p-2 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(post.id)}
                                        className="p-2 hover:bg-red-500/10 rounded-lg text-muted-foreground hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold mb-1">{post.name}</h3>
                                {(post.departmentName || departments.find(d => d.id === post.departmentId)?.name) && (
                                    <span className="text-xs font-bold uppercase bg-primary/10 text-primary px-2 py-0.5 rounded mb-2 inline-block">
                                        {post.departmentName || departments.find(d => d.id === post.departmentId)?.name}
                                    </span>
                                )}
                                <p className="text-sm text-muted-foreground line-clamp-2">{post.description || "No description provided."}</p>
                            </div>
                            <div className="mt-auto pt-4 border-t border-border/50 flex justify-between items-center text-xs text-muted-foreground font-medium">
                                <span>ID: {post.id.slice(0, 8)}...</span>
                            </div>
                        </div>
                    ))}

                    {filteredPosts.length === 0 && (
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

