"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { MoreHorizontal, Search, Plus, Pencil, Trash2, Building2, Users, X, ChevronDown } from "lucide-react";
import * as Icons from "lucide-react";
import { clsx } from "clsx";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

// --- Types ---
interface Site {
    id: string;
    name: string;
    budget: number;
    description: string;
}

interface Department {
    id: string;
    name: string;
    head: string;
    headEmail: string;
    location: string;
    employeeCount: number;
    budget: number;
    siteId: string;
    status: "Active" | "Restructuring" | "Inactive";
    colorCallback: string;
    logoUrl?: string;
    icon?: string;
}

// Available Icons Map
const AVAILABLE_ICONS = [
    "Building2", "Users", "Briefcase", "Activity", "Cpu",
    "Database", "Layout", "Factory", "Truck", "Wrench", "ShieldAlert",
    "Zap", "BarChart", "DollarSign", "Package", "ClipboardCheck", "TrendingUp"
];

// --- Modal Component ---
function DepartmentFormModal({
    isOpen,
    onClose,
    onSave,
    department,
    sites
}: {
    isOpen: boolean;
    onClose: () => void;
    onSave: (dept: Partial<Department>) => void;
    department: Department | null;
    sites: Site[];
}) {
    const [formData, setFormData] = useState<Partial<Department>>(() => {
        if (department) return department;
        return {
            name: "",
            head: "",
            headEmail: "",
            location: "",
            employeeCount: 0,
            budget: 0,
            siteId: sites.length > 0 ? sites[0].id : "",
            status: "Active",
            colorCallback: "bg-blue-500",
            icon: "Building2"
        };
    });

    const [isIconDropdownOpen, setIsIconDropdownOpen] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            // Optional: Parent key handles reset on remount
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start pt-20 justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
            <div className="modal-card w-full max-w-md p-0 animate-in fade-in zoom-in duration-300 overflow-y-auto max-h-[90vh] custom-scrollbar shadow-2xl">
                <div className="px-6 py-6 gradient-premium flex justify-between items-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]"></div>
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="p-2.5 bg-white/20 rounded-xl text-white shadow-inner">
                            <Building2 className="w-5 h-5" />
                        </div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">
                            {department ? "Modifier le Département" : "Nouveau Département"}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all relative z-10">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">Nom du Département</label>
                            <input
                                required
                                type="text"
                                value={formData.name || ""}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="input-field"
                                placeholder="ex. Ingénierie"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">Email du Responsable</label>
                            <input
                                type="email"
                                value={formData.headEmail || ""}
                                onChange={(e) => setFormData({ ...formData, headEmail: e.target.value })}
                                className="input-field"
                                placeholder="ex. john.doe@example.com"
                            />
                            <p className="text-[10px] text-muted-foreground mt-1">Si l&apos;email existe, l&apos;utilisateur devient responsable. Laisser vide pour retirer.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">Emplacement</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.location || ""}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="input-field"
                                    placeholder="ex. Bâtiment A"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">Budget (TND)</label>
                                <input
                                    required
                                    type="number"
                                    min="0"
                                    value={formData.budget || 0}
                                    onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) || 0 })}
                                    className="input-field"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">Site</label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                                    <select
                                        value={formData.siteId}
                                        onChange={(e) => setFormData({ ...formData, siteId: e.target.value })}
                                        className="input-field pl-9 appearance-none"
                                    >
                                        {sites.map(site => (
                                            <option key={site.id} value={site.id}>{site.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">Statut</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Department["status"] })}
                                    className="input-field appearance-none"
                                >
                                    <option value="Active">Actif</option>
                                    <option value="Restructuring">Restructuration</option>
                                    <option value="Inactive">Inactif</option>
                                </select>
                            </div>
                        </div>

                        {/* Icon Selection */}
                        <div className="relative">
                            <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">Icône</label>
                            <button
                                type="button"
                                onClick={() => setIsIconDropdownOpen(!isIconDropdownOpen)}
                                className="input-field flex items-center justify-between text-left"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 flex items-center justify-center text-primary/70">
                                        {formData.icon && (Icons as any)[formData.icon] ? (
                                            (() => { const Icon = (Icons as any)[formData.icon]; return <Icon size={20} /> })()
                                        ) : null}
                                    </div>

                                    <span className="text-sm font-medium">
                                        {formData.icon || "Sélectionner une icône"}
                                    </span>
                                </div>
                                <ChevronDown size={16} className="opacity-50" />
                            </button>

                            {isIconDropdownOpen && (
                                <div className="absolute z-50 mt-1 w-full bg-card border border-border rounded-xl shadow-xl max-h-48 overflow-y-auto grid grid-cols-4 gap-2 p-2">
                                    {AVAILABLE_ICONS.map(iconName => {
                                        const IconComp = (Icons as any)[iconName];
                                        return (
                                            <button
                                                key={iconName}
                                                type="button"
                                                onClick={() => {
                                                    setFormData({ ...formData, icon: iconName });
                                                    setIsIconDropdownOpen(false);
                                                }}
                                                className={clsx(
                                                    "flex flex-col items-center justify-center gap-1.5 p-2 rounded-lg transition-all hover:bg-secondary",
                                                    formData.icon === iconName ? "bg-primary/10 text-primary ring-1 ring-primary/20" : "text-muted-foreground"
                                                )}
                                            >
                                                {IconComp && <IconComp size={20} />}
                                                <span className="text-[10px] truncate w-full text-center">{iconName}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Thème Couleur</label>
                            <div className="flex gap-2 flex-wrap bg-secondary/30 p-3 rounded-xl border border-border/50">
                                {[
                                    "bg-blue-500", "bg-pink-500", "bg-orange-500", "bg-purple-500",
                                    "bg-red-500", "bg-emerald-500", "bg-teal-500", "bg-indigo-500", "bg-cyan-500"
                                ].map((color) => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, colorCallback: color })}
                                        className={clsx(
                                            "w-8 h-8 rounded-full transition-all duration-200 border-2 shadow-sm hover:scale-110",
                                            formData.colorCallback === color ? "border-foreground scale-110 ring-2 ring-offset-2 ring-primary/30" : "border-transparent opacity-80 hover:opacity-100"
                                        )}
                                        style={{ backgroundColor: `var(--tw-color-${color.replace('bg-', '')}-500)` }}
                                    >
                                        <div className={clsx("w-full h-full rounded-full", color)}></div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Optional Logo URL */}
                        <div>
                            <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">URL du Logo (Optionnel)</label>
                            <input
                                type="text"
                                value={formData.logoUrl || ""}
                                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                                className="input-field"
                                placeholder="http://..."
                            />
                        </div>


                        <div className="pt-4 flex justify-end gap-3 border-t border-border/50 mt-4">
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
                                {department ? "Enregistrer" : "Créer le Département"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default function DepartmentsPage() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [sites, setSites] = useState<Site[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
    const [tempBudget, setTempBudget] = useState<string>("");

    // Site Filter State
    const [selectedSiteId, setSelectedSiteId] = useState<string>("All");

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDept, setEditingDept] = useState<Department | null>(null);

    // --- On Mount Data Fetch ---
    const loadData = async () => {
        try {
            const [depts, sitesData] = await Promise.all([
                api.getDepartments(),
                api.getSites()
            ]);
            setDepartments(depts);
            setSites(sitesData);
        } catch (error) {
            console.error("Failed to load data:", error);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const filteredDepts = departments.filter(dept => {
        const matchesSearch =
            dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            dept.head.toLowerCase().includes(searchTerm.toLowerCase()) ||
            dept.siteId.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesSite = selectedSiteId === "All" || dept.siteId === selectedSiteId;

        return matchesSearch && matchesSite;
    });

    const handleDelete = async (id: string) => {
        if (confirm("Êtes-vous sûr de vouloir supprimer ce département ?")) {
            try {
                await api.deleteDepartment(id);
                setDepartments(departments.filter(d => d.id !== id));
            } catch (error) {
                console.error("Failed to delete", error);
                alert("Échec de la suppression du département");
            }
        }
    }

    const handleSaveDepartment = async (deptData: Partial<Department>) => {
        try {
            if (editingDept) {
                const updated = await api.updateDepartment(editingDept.id, deptData);
                setDepartments(departments.map(d => d.id === editingDept.id ? updated : d));
            } else {
                const created = await api.createDepartment(deptData);
                setDepartments([created, ...departments]);
            }
            setIsModalOpen(false);
            setEditingDept(null);
        } catch (error: any) {
            console.error("Failed to save", error);
            const message = error.response?.data?.message || "Échec de l'enregistrement du département";
            alert(message);
        }
    }

    const openCreateModal = () => {
        setEditingDept(null);
        setIsModalOpen(true);
    };

    const openEditModal = (dept: Department) => {
        setEditingDept(dept);
        setIsModalOpen(true);
    };

    const startEditBudget = (id: string, currentVal: number) => {
        setEditingBudgetId(id);
        setTempBudget(currentVal.toString());
    }

    const saveBudget = async (id: string, isSite: boolean) => {
        const val = parseInt(tempBudget.replace(/[^0-9]/g, '')) || 0;
        try {
            if (isSite) {
                await api.updateSite(id, { budget: val });
                setSites(sites.map(s => s.id === id ? { ...s, budget: val } : s));
            } else {
                await api.updateDepartment(id, { budget: val });
                setDepartments(departments.map(d => d.id === id ? { ...d, budget: val } : d));
            }
        } catch (error) {
            console.error("Failed to update budget", error);
            alert("Échec de la mise à jour du budget");
        }
        setEditingBudgetId(null);
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', { style: 'decimal', maximumFractionDigits: 0 }).format(amount) + ' TND';
    }

    const getChildrenCount = (siteId: string) => departments.filter(d => d.siteId === siteId).length;

    // Filter displayed sites based on selection
    const displayedSites = selectedSiteId === "All" ? sites : sites.filter(s => s.id === selectedSiteId);

    return (
        <DashboardLayout>
            <div className="flex flex-col h-full relative">
                <DepartmentFormModal
                    key={editingDept?.id || (isModalOpen ? 'new' : 'closed')}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveDepartment}
                    department={editingDept}
                    sites={sites}
                />

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div className="pl-1">
                        <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-xl border border-primary/20 shadow-sm">
                                <Building2 className="w-6 h-6 text-primary" />
                            </div>
                            Organisation & Sites
                        </h1>
                        <p className="text-muted-foreground mt-2 ml-14 font-medium">Gérez les sites, les départements et allouez les budgets.</p>
                    </div>

                    {/* Site Switcher */}
                    <div className="flex bg-secondary/50 border border-border rounded-xl p-1.5 shadow-sm">
                        <button
                            onClick={() => setSelectedSiteId("All")}
                            className={clsx(
                                "px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200",
                                "bg-background text-primary shadow-sm ring-1 ring-border"
                            )}
                            style={{ opacity: selectedSiteId === "All" ? 1 : 0.6 }}
                        >
                            Tous les Sites
                        </button>
                        {sites.map(site => (
                            <button
                                key={site.id}
                                onClick={() => setSelectedSiteId(site.id)}
                                className={clsx(
                                    "px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200",
                                    selectedSiteId === site.id
                                        ? "bg-background text-primary shadow-sm ring-1 ring-border"
                                        : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                                )}
                            >
                                {site.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Sites Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {displayedSites.map(site => (
                        <div key={site.id} className="glass-card p-6 relative overflow-hidden group">
                            {/* Decorative Background Icon */}
                            <div className="absolute top-[-20px] right-[-20px] text-primary/5 dark:text-primary/10 transition-transform group-hover:scale-110 duration-500">
                                <Building2 size={160} />
                            </div>

                            <div className="flex justify-between items-start relative z-10">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h2 className="text-2xl font-bold text-foreground">{site.name}</h2>
                                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-secondary/80 text-secondary-foreground uppercase tracking-widest border border-border/50 backdrop-blur-sm">
                                            {site.description}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-6 text-sm text-muted-foreground mt-4">
                                        <div className="flex items-center gap-2">
                                            <Building2 size={16} className="text-primary" />
                                            <span>{getChildrenCount(site.id)} Départements</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Users size={16} className="text-primary" />
                                            <span>{departments.filter(d => d.siteId === site.id).reduce((acc, curr) => acc + curr.employeeCount, 0)} Employés</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Budget Total</p>
                                    {editingBudgetId === `site-${site.id}` ? (
                                        <div className="flex items-center gap-2">
                                            <input
                                                autoFocus
                                                type="text"
                                                value={tempBudget}
                                                onChange={(e) => setTempBudget(e.target.value)}
                                                onBlur={() => saveBudget(site.id, true)}
                                                onKeyDown={(e) => e.key === 'Enter' && saveBudget(site.id, true)}
                                                className="w-32 bg-background border border-primary rounded-lg px-2 py-1 text-foreground font-bold text-right outline-none ring-2 ring-primary/20"
                                            />
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() => startEditBudget(`site-${site.id}`, site.budget)}
                                            className="group/budget flex items-center justify-end gap-2 cursor-pointer hover:text-primary transition-colors"
                                        >
                                            <span className="text-3xl font-bold text-foreground group-hover/budget:text-primary transition-colors tracking-tight">{formatCurrency(site.budget)}</span>
                                            <Pencil size={14} className="opacity-0 group-hover/budget:opacity-100 transition-opacity text-muted-foreground" />
                                        </div>
                                    )}
                                </div>
                            </div>
                            {/* Budget Progress Bar */}
                            <div className="mt-8">
                                <div className="flex justify-between text-xs mb-2 font-medium">
                                    <span className="text-muted-foreground uppercase tracking-wider">Budget Alloué</span>
                                    <span className="text-foreground">{Math.round((departments.filter(d => d.siteId === site.id).reduce((acc, curr) => acc + curr.budget, 0) / site.budget) * 100)}%</span>
                                </div>
                                <div className="w-full h-3 bg-secondary rounded-full overflow-hidden shadow-inner">
                                    <div
                                        className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full transition-all duration-1000 ease-out shadow-sm relative"
                                        style={{ width: `${Math.min((departments.filter(d => d.siteId === site.id).reduce((acc, curr) => acc + curr.budget, 0) / site.budget) * 100, 100)}%` }}
                                    >
                                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters & Search - Below header/cards */}
                <div className="flex flex-col md:flex-row justify-between gap-4 mb-6 items-center">
                    <div className="relative flex-1 max-w-md w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <input
                            type="text"
                            placeholder="Rechercher des départements..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-field pl-10 bg-card border-border shadow-sm hover:border-primary/30 focus:border-primary/50"
                        />
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl transition-all shadow-lg shadow-primary/25 font-bold text-sm tracking-wide active:scale-95"
                    >
                        <Plus size={18} strokeWidth={2.5} />
                        <span>NOUVEAU DÉPARTEMENT</span>
                    </button>
                </div>

                {/* Departments Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-hidden bg-gray-100">
                    {filteredDepts.map((dept) => {
                        const IconComponent = dept.icon && (Icons as any)[dept.icon] ? (Icons as any)[dept.icon] : Building2;

                        return (
                            <div key={dept.id} className="glass-card p-5 flex flex-col gap-4 group hover:-translate-y-1 hover:shadow-xl hover:border-primary/30 transition-all duration-300">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3.5">
                                        <div className={clsx("w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg shadow-black/5 ring-1 ring-black/5", dept.colorCallback)}>
                                            {dept.logoUrl ? (
                                                <img src={dept.logoUrl} alt={dept.name} className="w-full h-full object-cover rounded-xl" />
                                            ) : (
                                                <IconComponent size={24} />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-foreground leading-tight">{dept.name}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground border border-border">{dept.siteId}</span>
                                                <span className="text-xs text-muted-foreground truncate max-w-[120px]">{dept.location}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="relative group/menu">
                                        <button className="p-1 px-2 text-muted-foreground hover:text-foreground transition-colors hover:bg-secondary rounded-lg">
                                            <MoreHorizontal size={20} />
                                        </button>
                                        {/* Quick Actions Dropdown (Hidden by default, hover to show purely via CSS or handled via click - kept simple here) */}
                                    </div>
                                </div>

                                <div className="space-y-3 py-3 border-t border-dashed border-border mt-1">
                                    <div className="flex justify-between items-center text-sm group/row hover:bg-secondary/30 p-1.5 rounded-lg transition-colors -mx-1.5">
                                        <span className="text-muted-foreground font-medium">Directeur</span>
                                        <span className="text-foreground font-semibold flex flex-col items-end">
                                            <div className="flex items-center gap-2">
                                                {dept.head || "Non assigné"}
                                                <Users size={14} className="text-primary/70" />
                                            </div>
                                            {dept.headEmail && (
                                                <span className="text-[10px] text-muted-foreground font-normal">{dept.headEmail}</span>
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm group/row hover:bg-secondary/30 p-1.5 rounded-lg transition-colors -mx-1.5">
                                        <span className="text-muted-foreground font-medium">Employés</span>
                                        <span className="text-foreground font-semibold bg-secondary px-2 py-0.5 rounded text-xs border border-border">{dept.employeeCount}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm group/row hover:bg-secondary/30 p-1.5 rounded-lg transition-colors -mx-1.5">
                                        <span className="text-muted-foreground font-medium">Budget</span>
                                        {editingBudgetId === `dept-${dept.id}` ? (
                                            <input
                                                autoFocus
                                                type="text"
                                                value={tempBudget}
                                                onChange={(e) => setTempBudget(e.target.value)}
                                                onBlur={() => saveBudget(dept.id, false)}
                                                onKeyDown={(e) => e.key === 'Enter' && saveBudget(dept.id, false)}
                                                className="w-24 bg-background border border-primary rounded px-1.5 py-0.5 text-foreground font-bold text-right text-xs outline-none"
                                            />
                                        ) : (
                                            <div
                                                onClick={() => startEditBudget(`dept-${dept.id}`, dept.budget)}
                                                className="group/budget flex items-center gap-2 cursor-pointer hover:text-primary transition-colors"
                                            >
                                                <span className="text-foreground font-bold group-hover/budget:text-primary transition-colors">{formatCurrency(dept.budget)}</span>
                                                <Pencil size={12} className="opacity-0 group-hover/budget:opacity-100 transition-opacity" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-auto pt-2">
                                    <span className={clsx("px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                                        dept.status === 'Active' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' :
                                            'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
                                    )}>
                                        {dept.status}
                                    </span>

                                    <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                                        <button
                                            onClick={() => openEditModal(dept)}
                                            className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(dept.id)} className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </DashboardLayout>
    );
}
