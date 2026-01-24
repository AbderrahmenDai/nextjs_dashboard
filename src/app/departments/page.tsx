"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { DepartmentUserCountChart } from "@/components/Charts";
import { MoreHorizontal, Search, Plus, Pencil, Trash2, Building2, Users, X } from "lucide-react";
import { clsx } from "clsx";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

// --- Types ---
interface Site {
    id: string;
    name: "TT" | "TTG";
    budget: number; // Storing as number for easier calculations
    description: string;
}

interface Department {
    id: string;
    name: string;
    head: string;
    location: string;
    employeeCount: number;
    budget: number; // Storing as number
    siteId: "TT" | "TTG";
    status: "Active" | "Restructuring" | "Inactive";
    colorCallback: string;
}

// --- Helper for Modal ---
function DepartmentFormModal({
    isOpen,
    onClose,
    onSave,
    department
}: {
    isOpen: boolean;
    onClose: () => void;
    onSave: (dept: Partial<Department>) => void;
    department: Department | null;
}) {
    const [formData, setFormData] = useState<Partial<Department>>(
        department || {
            name: "",
            head: "",
            location: "",
            employeeCount: 0,
            budget: 0,
            siteId: "TT",
            status: "Active",
            colorCallback: "bg-gray-500" // Default
        }
    );

    useEffect(() => {
        if (isOpen) {
            setFormData(department || {
                name: "",
                head: "",
                location: "",
                employeeCount: 0,
                budget: 0,
                siteId: "TT",
                status: "Active",
                colorCallback: "bg-gray-500"
            });
        }
    }, [isOpen, department]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl p-6 animate-in fade-in zoom-in duration-200 overflow-y-auto max-h-[90vh] custom-scrollbar">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">{department ? "Edit Department" : "New Department"}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Department Name</label>
                        <input
                            required
                            type="text"
                            value={formData.name || ""}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                            placeholder="e.g. Engineering"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Head of Department</label>
                        <input
                            required
                            type="text"
                            value={formData.head || ""}
                            onChange={(e) => setFormData({ ...formData, head: e.target.value })}
                            className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                            placeholder="e.g. John Doe"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Location</label>
                            <input
                                required
                                type="text"
                                value={formData.location || ""}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="e.g. Building A"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Budget ($)</label>
                            <input
                                required
                                type="number"
                                min="0"
                                value={formData.budget || 0}
                                onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) || 0 })}
                                className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Site</label>
                            <select
                                value={formData.siteId}
                                onChange={(e) => setFormData({ ...formData, siteId: e.target.value as "TT" | "TTG" })}
                                className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer"
                            >
                                <option value="TT">TT</option>
                                <option value="TTG">TTG</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as Department["status"] })}
                                className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer"
                            >
                                <option value="Active">Active</option>
                                <option value="Restructuring">Restructuring</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Color Theme</label>
                        <div className="flex gap-2 flex-wrap">
                            {[
                                "bg-blue-500", "bg-pink-500", "bg-orange-500", "bg-purple-500",
                                "bg-red-500", "bg-emerald-500", "bg-teal-500", "bg-indigo-500", "bg-cyan-500"
                            ].map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, colorCallback: color })}
                                    className={clsx(
                                        "w-8 h-8 rounded-full transition-transform hover:scale-110 border-2",
                                        color.replace('bg-', 'bg-'), // Just using the class directly
                                        formData.colorCallback === color ? "border-white scale-110" : "border-transparent opacity-70 hover:opacity-100"
                                    )}
                                    // Hack to make tailwind compile these dynamic classes if not scanning this file correctly? 
                                    // But they are in dummy data so should be fine.
                                    style={{ backgroundColor: `var(--tw-${color.replace('bg-', '')})` }}
                                >
                                    {formData.colorCallback === color && <div className="w-2 h-2 bg-white rounded-full mx-auto" />}
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
                            {department ? "Save Changes" : "Create Department"}
                        </button>
                    </div>
                </form>
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

    const filteredDepts = departments.filter(dept =>
        dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.head.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.siteId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this department?")) {
            try {
                await api.deleteDepartment(id);
                setDepartments(departments.filter(d => d.id !== id));
            } catch (error) {
                console.error("Failed to delete", error);
                alert("Failed to delete department");
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
        } catch (error) {
            console.error("Failed to save", error);
            alert("Failed to save department");
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
            alert("Failed to update budget");
        }
        setEditingBudgetId(null);
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
    }

    const getChildrenCount = (siteId: string) => departments.filter(d => d.siteId === siteId).length;

    return (
        <DashboardLayout>
            <div className="flex flex-col h-full relative">
                <DepartmentFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveDepartment}
                    department={editingDept}
                />

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Organization & Sites</h1>
                        <p className="text-muted-foreground mt-1">Manage sites, departments, and allocate budgets.</p>
                    </div>
                </div>

                {/* Sites Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {sites.map(site => (
                        <div key={site.id} className="glass-card p-6 rounded-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-3 opacity-10">
                                <Building2 size={120} />
                            </div>
                            <div className="flex justify-between items-start relative z-10">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h2 className="text-2xl font-bold text-white">{site.name}</h2>
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-slate-300 uppercase tracking-wider">{site.description}</span>
                                    </div>
                                    <div className="flex items-center gap-6 text-sm text-muted-foreground mt-4">
                                        <div className="flex items-center gap-2">
                                            <Building2 size={16} className="text-primary" />
                                            <span>{getChildrenCount(site.id)} Departments</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Users size={16} className="text-primary" />
                                            <span>{departments.filter(d => d.siteId === site.id).reduce((acc, curr) => acc + curr.employeeCount, 0)} Employees</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-muted-foreground mb-1">Total Budget</p>
                                    {editingBudgetId === `site-${site.id}` ? (
                                        <div className="flex items-center gap-2">
                                            <input
                                                autoFocus
                                                type="text"
                                                value={tempBudget}
                                                onChange={(e) => setTempBudget(e.target.value)}
                                                onBlur={() => saveBudget(site.id, true)}
                                                onKeyDown={(e) => e.key === 'Enter' && saveBudget(site.id, true)}
                                                className="w-32 bg-slate-900 border border-white/20 rounded px-2 py-1 text-white font-bold text-right"
                                            />
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() => startEditBudget(`site-${site.id}`, site.budget)}
                                            className="group/budget flex items-center justify-end gap-2 cursor-pointer hover:text-green-400 transition-colors"
                                        >
                                            <span className="text-3xl font-bold text-white group-hover/budget:text-green-400">{formatCurrency(site.budget)}</span>
                                            <Pencil size={14} className="opacity-0 group-hover/budget:opacity-100 transition-opacity" />
                                        </div>
                                    )}
                                </div>
                            </div>
                            {/* Budget Progress Bar */}
                            <div className="mt-6">
                                <div className="flex justify-between text-xs mb-2">
                                    <span className="text-slate-400">Allocated</span>
                                    <span className="text-white font-medium">{Math.round((departments.filter(d => d.siteId === site.id).reduce((acc, curr) => acc + curr.budget, 0) / site.budget) * 100)}%</span>
                                </div>
                                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: `${Math.min((departments.filter(d => d.siteId === site.id).reduce((acc, curr) => acc + curr.budget, 0) / site.budget) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Charts Area */}
                <div className="mb-8">
                    <DepartmentUserCountChart />
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <input
                            type="text"
                            placeholder="Search departments..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-slate-500"
                        />
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl transition-all shadow-lg shadow-primary/25 font-medium"
                    >
                        <Plus size={20} />
                        <span>New Department</span>
                    </button>
                </div>

                {/* Departments Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDepts.map((dept) => (
                        <div key={dept.id} className="glass-card p-6 rounded-2xl flex flex-col gap-4 group hover:-translate-y-1 transition-transform duration-300">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className={clsx("w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-lg", dept.colorCallback)}>
                                        <Building2 size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">{dept.name}</h3>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-slate-300 border border-white/5">{dept.siteId}</span>
                                            <span className="text-xs text-muted-foreground truncate max-w-[120px]">{dept.location}</span>
                                        </div>
                                    </div>
                                </div>
                                <button className="text-muted-foreground hover:text-white transition-colors">
                                    <MoreHorizontal size={20} />
                                </button>
                            </div>

                            <div className="space-y-3 py-2 border-t border-white/5 mt-2">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Head</span>
                                    <span className="text-white font-medium">{dept.head}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Employees</span>
                                    <span className="text-white font-medium">{dept.employeeCount}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Budget</span>
                                    {editingBudgetId === `dept-${dept.id}` ? (
                                        <input
                                            autoFocus
                                            type="text"
                                            value={tempBudget}
                                            onChange={(e) => setTempBudget(e.target.value)}
                                            onBlur={() => saveBudget(dept.id, false)}
                                            onKeyDown={(e) => e.key === 'Enter' && saveBudget(dept.id, false)}
                                            className="w-24 bg-slate-900 border border-white/20 rounded px-1.5 py-0.5 text-white font-medium text-right text-xs"
                                        />
                                    ) : (
                                        <div
                                            onClick={() => startEditBudget(`dept-${dept.id}`, dept.budget)}
                                            className="group/budget flex items-center gap-2 cursor-pointer hover:text-green-400 transition-colors"
                                        >
                                            <span className="text-white font-medium group-hover/budget:text-green-400">{formatCurrency(dept.budget)}</span>
                                            <Pencil size={12} className="opacity-0 group-hover/budget:opacity-100 transition-opacity" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-auto pt-4">
                                <span className={clsx("px-2 py-1 rounded text-xs font-medium border",
                                    dept.status === 'Active' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                        'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                )}>
                                    {dept.status}
                                </span>

                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => openEditModal(dept)}
                                        className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                        title="Edit"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(dept.id)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}
