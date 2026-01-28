"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { Plus, Search, Filter, FileText, Edit, Trash2, Eye, X } from "lucide-react";
import { useState, useEffect } from "react";
import { clsx } from "clsx";
import { api } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

// --- Types ---
interface HiringRequest {
    id: string;
    title: string;
    departmentId: string;
    departmentName?: string;
    category: string;
    status: string;
    requesterId?: string;
    requesterName?: string;
    createdAt: string;
    description?: string;
    budget?: number; // Kept as legacy but might not be on form
    contractType?: string;
    reason?: string;
    priority?: string;
    // New Fields
    site?: string;
    businessUnit?: string;
    desiredStartDate?: string;
    replacementFor?: string;
    replacementReason?: string;
    increaseType?: string; // 'Budgeted' | 'Non-Budgeted'
    increaseDateRange?: string;
    educationRequirements?: string;
    skillsRequirements?: string;
}

interface Site {
    id: string;
    name: string;
}

interface Department {
    id: string;
    name: string;
}

// ... existing code ...

function RequestModal({
    isOpen,
    onClose,
    onSave,
    request,
    departments,
    sites,
    isViewOnly = false
}: {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<HiringRequest>) => void;
    request: HiringRequest | null;
    departments: Department[];
    sites: Site[];
    isViewOnly?: boolean;
}) {
    const { t } = useLanguage();
    const [formData, setFormData] = useState<Partial<HiringRequest>>({
        title: "",
        departmentId: "",
        category: "Cadre",
        status: "Pending HR",
        contractType: "CDI",
        priority: "Medium",
        increaseType: "Budgeted",
        site: "",
        businessUnit: "",
        replacementReason: "",
        replacementFor: "",
        increaseDateRange: "",
        description: "",
        reason: "", // Justification
        educationRequirements: "",
        skillsRequirements: ""
    });

    useEffect(() => {
        if (isOpen) {
            if (request) {
                setFormData(request);
            } else {
                setFormData({
                    title: "",
                    departmentId: departments.length > 0 ? departments[0].id : "",
                    category: "Cadre",
                    status: "Pending HR",
                    contractType: "CDI",
                    priority: "Medium",
                    increaseType: "Budgeted",
                    site: sites.length > 0 ? sites[0].name : "",
                    businessUnit: "",
                    replacementFor: "",
                    replacementReason: "",
                    increaseDateRange: "",
                    description: "",
                    reason: "",
                    educationRequirements: "",
                    skillsRequirements: ""
                });
            }
        }
    }, [isOpen, request, departments, sites]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 md:pt-24 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
            <div className="glass-card w-full max-w-4xl p-0 overflow-hidden flex flex-col max-h-[90vh] relative group border border-primary/20 shadow-2xl">
                {/* Animated gradient border effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 opacity-50 pointer-events-none" />

                {/* Floating particles */}
                <div className="absolute top-10 left-10 w-2 h-2 bg-primary/40 rounded-full animate-pulse" />
                <div className="absolute top-20 right-20 w-1.5 h-1.5 bg-purple-400/40 rounded-full animate-pulse delay-300" />
                <div className="absolute bottom-20 left-20 w-2.5 h-2.5 bg-pink-400/40 rounded-full animate-pulse delay-700" />

                {/* Header with gradient */}
                <div className="bg-muted/30 backdrop-blur-md p-6 flex justify-between items-center border-b border-border/50 relative overflow-hidden">
                    {/* Animated background pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,var(--primary),transparent_70%)]" />
                    </div>

                    <div className="flex flex-col relative z-10">
                        <h2 className="text-2xl font-black uppercase tracking-wide bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent flex items-center gap-3">
                            <span className="w-1.5 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full animate-pulse" />
                            Demande d&apos;Autorisation d&apos;Embauche
                        </h2>
                        <span className="text-sm text-muted-foreground font-semibold ml-5 flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            CDI et CDD &gt; 6mois
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2.5 hover:bg-red-50 hover:text-red-600 rounded-xl text-slate-500 transition-all duration-200 hover:scale-110 hover:rotate-90 relative z-10 group/btn"
                    >
                        <X size={24} className="transition-transform duration-200" />
                        <span className="absolute inset-0 bg-red-500/10 rounded-xl scale-0 group-hover/btn:scale-100 transition-transform duration-200" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar bg-card/50 p-6 space-y-6">

                    {/* Top Row: Date & Category with animations */}
                    <div className="flex flex-wrap gap-4 items-center justify-between bg-card border border-border/50 p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group/card">
                        <div className="flex items-center gap-3 animate-in slide-in-from-left duration-500">
                            <span className="bg-primary/10 text-primary px-3 py-1.5 font-bold text-sm uppercase rounded-lg border border-primary/20">Date:</span>
                            <span className="text-foreground font-mono font-semibold">{new Date().toLocaleDateString()}</span>
                        </div>
                        <div className="flex gap-6 animate-in slide-in-from-right duration-500">
                            {['Ouvrier', 'Etam', 'Cadre'].map((cat) => (
                                <label key={cat} className="flex items-center gap-2.5 cursor-pointer group/radio hover:scale-105 transition-all duration-200 relative">
                                    <div className="relative">
                                        <input
                                            type="radio"
                                            name="category"
                                            checked={formData.category === cat}
                                            onChange={() => setFormData({ ...formData, category: cat })}
                                            disabled={isViewOnly}
                                            className="w-5 h-5 text-orange-500 focus:ring-2 focus:ring-orange-400 border-2 border-slate-300 cursor-pointer transition-all duration-200"
                                        />
                                        {formData.category === cat && (
                                            <span className="absolute inset-0 bg-orange-500/20 rounded-full animate-ping" />
                                        )}
                                    </div>
                                    <span className={`text-sm font-bold uppercase transition-all duration-200 ${formData.category === cat
                                        ? 'text-orange-600 scale-110'
                                        : 'text-muted-foreground group-hover/radio:text-foreground'
                                        }`}>{cat}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Section 1: Service / Site / BU / Position / Start Date */}
                    <div className="bg-primary/5 border border-primary/10 p-4 rounded-2xl space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-primary uppercase mb-1.5 opacity-80">Service (Dept)</label>
                                <select
                                    required
                                    disabled={isViewOnly}
                                    value={formData.departmentId || ""}
                                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                                    className="input-field"
                                >
                                    <option value="">Select...</option>
                                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-primary uppercase mb-1.5 opacity-80">Lieu de Travail (Site)</label>
                                <select
                                    disabled={isViewOnly}
                                    value={formData.site || ""}
                                    onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                                    className="input-field"
                                >
                                    <option value="">Select...</option>
                                    {sites.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-primary uppercase mb-1.5 opacity-80">BU</label>
                                <input
                                    type="text"
                                    disabled={isViewOnly}
                                    value={formData.businessUnit || ""}
                                    onChange={(e) => setFormData({ ...formData, businessUnit: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-1">
                                <label className="block text-xs font-bold text-primary uppercase mb-1.5 opacity-80">Libellé du Poste (Job Title)</label>
                                <input
                                    required
                                    type="text"
                                    disabled={isViewOnly}
                                    value={formData.title || ""}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                            <div className="md:col-span-1">
                                <label className="block text-xs font-bold text-primary uppercase mb-1.5 opacity-80">Date Souhaitée d&apos;Engagement</label>
                                <input
                                    type="date"
                                    disabled={isViewOnly}
                                    value={formData.desiredStartDate ? new Date(formData.desiredStartDate).toISOString().split('T')[0] : ""}
                                    onChange={(e) => setFormData({ ...formData, desiredStartDate: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Context / Reasons */}
                    <div className="bg-primary/5 border border-primary/10 p-4 rounded-2xl space-y-4">
                        {/* Replacement */}
                        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center border-b border-primary/10 pb-4">
                            <label className="flex items-center gap-2 min-w-[180px]">
                                <input type="checkbox" checked={!!formData.replacementFor} readOnly className="w-4 h-4 text-primary rounded border-primary/30 bg-card" />
                                <span className="text-sm font-bold text-foreground">En Remplacement de :</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Name..."
                                disabled={isViewOnly}
                                value={formData.replacementFor || ""}
                                onChange={(e) => setFormData({ ...formData, replacementFor: e.target.value })}
                                className="input-field"
                            />
                            <div className="flex items-center gap-2 flex-1 w-full">
                                <span className="text-sm font-bold text-foreground whitespace-nowrap">Motif de Départ :</span>
                                <input
                                    type="text"
                                    disabled={isViewOnly}
                                    value={formData.replacementReason || ""}
                                    onChange={(e) => setFormData({ ...formData, replacementReason: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                        </div>

                        {/* Budgeted Increase */}
                        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center border-b border-primary/10 pb-4">
                            <label className="flex items-center gap-2 min-w-[180px] cursor-pointer">
                                <input
                                    type="radio"
                                    name="increaseType"
                                    value="Budgeted"
                                    checked={formData.increaseType === 'Budgeted'}
                                    onChange={() => setFormData({ ...formData, increaseType: 'Budgeted' })}
                                    disabled={isViewOnly}
                                    className="w-4 h-4 text-primary focus:ring-primary border-primary/30"
                                />
                                <span className="text-sm font-bold text-foreground">En Augmentation Budgété</span>
                            </label>
                            <div className="flex items-center gap-2 flex-1 w-full">
                                <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Préciser du ... au ... :</span>
                                <input
                                    type="text"
                                    disabled={isViewOnly}
                                    value={formData.increaseDateRange || ""}
                                    onChange={(e) => setFormData({ ...formData, increaseDateRange: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                            <div className="flex gap-4 min-w-[150px]">
                                {['CDI', 'CDD'].map(type => (
                                    <label key={type} className="flex items-center gap-1 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="contractType"
                                            value={type}
                                            checked={formData.contractType === type}
                                            onChange={() => setFormData({ ...formData, contractType: type })}
                                            disabled={isViewOnly}
                                            className="w-4 h-4 text-primary"
                                        />
                                        <span className="text-xs font-bold text-foreground">{type}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Non-Budgeted */}
                        <div className="flex items-center gap-2">
                            <label className="flex items-center gap-2 min-w-[180px] cursor-pointer">
                                <input
                                    type="radio"
                                    name="increaseType"
                                    value="Non-Budgeted"
                                    checked={formData.increaseType === 'Non-Budgeted'}
                                    onChange={() => setFormData({ ...formData, increaseType: 'Non-Budgeted' })}
                                    disabled={isViewOnly}
                                    className="w-4 h-4 text-primary focus:ring-primary border-primary/30"
                                />
                                <span className="text-sm font-bold text-foreground">En Augmentation Non Budgété</span>
                            </label>
                        </div>
                    </div>

                    {/* Section 3: Justification */}
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-foreground uppercase bg-secondary px-3 py-1.5 rounded-lg border border-border/50 w-fit">Justification précise de la demande :</label>
                        <textarea
                            rows={3}
                            disabled={isViewOnly}
                            value={formData.reason || ""}
                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                            className="input-field min-h-[80px]"
                        />
                    </div>

                    {/* Section 4: Process Characteristics (Description) */}
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-foreground uppercase bg-secondary px-3 py-1.5 rounded-lg border border-border/50 w-fit">Caractéristiques du Poste à Pourvoir (Missions) :</label>
                        <textarea
                            rows={3}
                            disabled={isViewOnly}
                            value={formData.description || ""}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="input-field min-h-[80px]"
                        />
                    </div>

                    {/* Section 5: Candidate Requirements */}
                    <div className="space-y-4">
                        <label className="block text-sm font-bold text-foreground uppercase bg-secondary px-3 py-1.5 rounded-lg border border-border/50 w-fit">Caractéristiques requises du Candidat :</label>

                        <div>
                            <span className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wide">1. Formation souhaitée</span>
                            <input
                                type="text"
                                disabled={isViewOnly}
                                value={formData.educationRequirements || ""}
                                onChange={(e) => setFormData({ ...formData, educationRequirements: e.target.value })}
                                className="input-field"
                            />
                        </div>

                        <div>
                            <span className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wide">2. Connaissances / Compétences indispensables</span>
                            <textarea
                                rows={2}
                                disabled={isViewOnly}
                                value={formData.skillsRequirements || ""}
                                onChange={(e) => setFormData({ ...formData, skillsRequirements: e.target.value })}
                                className="input-field min-h-[60px]"
                            />
                        </div>
                    </div>

                    {/* Hidden/Extra fields that still technically exist but aren't on the form, keep hidden or minimal UI if strictly needed, else rely on defaults */}
                    {/* Status is usually managed by workflow actions, but we might want an admin override */}
                    {!isViewOnly && (
                        <div className="pt-4 border-t border-border mt-6 flex justify-between items-center bg-muted/20 p-4 rounded-xl">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold uppercase text-muted-foreground">Status:</span>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="bg-card border border-border rounded text-xs px-2 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                >
                                    <option value="Pending HR">Pending HR</option>
                                    <option value="Pending Director">Pending Director</option>
                                    <option value="Approved">Approved</option>
                                    <option value="Rejected">Rejected</option>
                                </select>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 text-muted-foreground hover:bg-muted rounded-xl transition-colors font-medium text-sm"
                                >
                                    {t('common.cancel')}
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                >
                                    {t('common.save')}
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}

export default function HiringRequestsPage() {
    const { t } = useLanguage();
    const [requests, setRequests] = useState<HiringRequest[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [sites, setSites] = useState<Site[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<HiringRequest | null>(null);
    const [isViewOnly, setIsViewOnly] = useState(false);

    const loadData = async () => {
        try {
            const [reqs, depts, sitesData] = await Promise.all([
                api.getHiringRequests(),
                api.getDepartments(),
                api.getSites()
            ]);
            setRequests(reqs);
            setDepartments(depts);
            setSites(sitesData);
        } catch (error) {
            console.error("Failed to load data:", error);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const { user } = useAuth(); // Get user from auth context

    const handleCreate = async (data: Partial<HiringRequest>) => {
        try {
            if (!user?.id) {
                alert("You must be logged in to create a request.");
                return;
            }

            // Pass the actual logged-in user's ID
            const payload = { ...data, requesterId: user.id };
            await api.createHiringRequest(payload);
            loadData();
            setIsModalOpen(false);
        } catch (error: any) {
            console.error("Failed to create request:", error);
            // Display specific error message from backend (e.g., role restriction)
            alert(error.message || "Failed to create request");
        }
    };

    const handleUpdate = async (data: Partial<HiringRequest>) => {
        if (!selectedRequest) return;
        try {
            const payload = { ...data };
            await api.updateHiringRequest(selectedRequest.id, payload);
            loadData();
            setIsModalOpen(false);
        } catch (error) {
            console.error("Failed to update request:", error);
            alert("Failed to update request");
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this request?")) {
            try {
                await api.deleteHiringRequest(id);
                setRequests(prev => prev.filter(r => r.id !== id));
            } catch (error) {
                console.error("Failed to delete request:", error);
                alert("Failed to delete request");
            }
        }
    };

    const openCreateModal = () => {
        setSelectedRequest(null);
        setIsViewOnly(false);
        setIsModalOpen(true);
    };

    const openEditModal = (req: HiringRequest) => {
        setSelectedRequest(req);
        setIsViewOnly(false);
        setIsModalOpen(true);
    };

    const openViewModal = (req: HiringRequest) => {
        setSelectedRequest(req);
        setIsViewOnly(true);
        setIsModalOpen(true);
    };

    // Helper for Status Colors
    const getStatusColor = (status: string) => {
        switch (status) {
            case "Approved": return "bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20";
            case "Rejected": return "bg-red-500/10 text-red-600 dark:text-red-500 border-red-500/20";
            case "Pending Director": return "bg-orange-500/10 text-orange-600 dark:text-orange-500 border-orange-500/20";
            default: return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border-yellow-500/20";
        }
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col h-full relative">
                <RequestModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={selectedRequest ? handleUpdate : handleCreate}
                    request={selectedRequest}
                    departments={departments}
                    sites={sites}
                    isViewOnly={isViewOnly}
                />

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground tracking-tight">{t('common.hiringRequests')}</h1>
                        <p className="text-muted-foreground mt-1">{t('hiringRequest.description')}</p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-primary/25 active:scale-95"
                    >
                        <Plus size={18} strokeWidth={2.5} />
                        {t('hiringRequest.newRequest')}
                    </button>
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col md:flex-row gap-4 glass-card p-4 rounded-xl mb-6 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <input
                            type="text"
                            placeholder={t('common.search')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-field pl-10 bg-card/50"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors whitespace-nowrap">
                        <Filter size={18} />
                        <span>Filters</span>
                    </button>
                </div>

                {/* List */}
                <div className="glass-card rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-border bg-secondary/30">
                                    <th className="px-6 py-4 font-bold text-foreground">{t('hiringRequest.title')}</th>
                                    <th className="px-6 py-4 font-bold text-foreground">{t('hiringRequest.department')}</th>
                                    <th className="px-6 py-4 font-bold text-foreground">{t('hiringRequest.category')}</th>
                                    <th className="px-6 py-4 font-bold text-foreground">{t('hiringRequest.priority')}</th>
                                    <th className="px-6 py-4 font-bold text-foreground">{t('hiringRequest.requester')}</th>
                                    <th className="px-6 py-4 font-bold text-foreground">{t('hiringRequest.date')}</th>
                                    <th className="px-6 py-4 font-bold text-foreground">{t('hiringRequest.status')}</th>
                                    <th className="px-6 py-4 font-bold text-foreground text-right">{t('common.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {requests.filter(r => r.title.toLowerCase().includes(searchTerm.toLowerCase())).map((req) => (
                                    <tr key={req.id} className="hover:bg-secondary/20 transition-colors group">
                                        <td className="px-6 py-4 font-medium text-foreground">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 dark:text-blue-400 ring-1 ring-blue-500/20">
                                                    <FileText size={16} />
                                                </div>
                                                {req.title}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">{req.departmentName || req.departmentId}</td>
                                        <td className="px-6 py-4 text-muted-foreground">{req.category}</td>
                                        <td className="px-6 py-4">
                                            <span className={clsx(
                                                "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border",
                                                req.priority === 'High' ? 'bg-red-500/10 text-red-600 dark:text-red-500 border-red-500/20' :
                                                    req.priority === 'Medium' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/20' :
                                                        'bg-blue-500/10 text-blue-600 dark:text-blue-500 border-blue-500/20'
                                            )}>
                                                {req.priority || 'Medium'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">{req.requesterName || "N/A"}</td>
                                        <td className="px-6 py-4 text-muted-foreground">{new Date(req.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={clsx("px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border", getStatusColor(req.status))}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                                                <button
                                                    onClick={() => openViewModal(req)}
                                                    className="p-2 hover:bg-secondary rounded-lg text-blue-500 dark:text-blue-400 hover:text-blue-600 transition-colors"
                                                    title={t('hiringRequest.viewDetails')}
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    onClick={() => openEditModal(req)}
                                                    className="p-2 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                                                    title={t('hiringRequest.editRequest')}
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(req.id)}
                                                    className="p-2 hover:bg-red-500/10 rounded-lg text-muted-foreground hover:text-red-500 transition-colors"
                                                    title={t('common.delete')}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {requests.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground bg-secondary/5">
                                            {searchTerm ? "No requests found matching your search." : "No hiring requests created yet."}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
