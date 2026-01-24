"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { Plus, Search, Filter, FileText, Edit, Trash2, Eye, X } from "lucide-react";
import { useState, useEffect } from "react";
import { clsx } from "clsx";
import { api } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";

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
    budget?: number;
    contractType?: string;
    reason?: string;
    priority?: string; // Added priority
}

interface Department {
    id: string;
    name: string;
}

// --- Modal Component ---
function RequestModal({
    isOpen,
    onClose,
    onSave,
    request,
    departments,
    isViewOnly = false
}: {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<HiringRequest>) => void;
    request: HiringRequest | null;
    departments: Department[];
    isViewOnly?: boolean;
}) {
    const { t } = useLanguage();
    const [formData, setFormData] = useState<Partial<HiringRequest>>({
        title: "",
        departmentId: "",
        category: "Cadre",
        status: "Pending HR",
        description: "",
        budget: 0,
        contractType: "CDI",
        reason: "",
        priority: "Medium"
    });

    useEffect(() => {
        if (isOpen) {
            if (request) {
                // eslint-disable-next-line react-hooks/exhaustive-deps
                setFormData(request);
            } else {
                setFormData({
                    title: "",
                    departmentId: departments.length > 0 ? departments[0].id : "",
                    category: "Cadre",
                    status: "Pending HR",
                    description: "",
                    budget: 0,
                    contractType: "CDI",
                    reason: "",
                    priority: "Medium"
                });
            }
        }
    }, [isOpen, request, departments]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl p-6 animate-in fade-in zoom-in duration-200 overflow-y-auto max-h-[90vh] custom-scrollbar">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">
                        {isViewOnly ? t('hiringRequest.viewDetails') : (request ? t('hiringRequest.editRequest') : t('hiringRequest.newRequest'))}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Title */}
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium text-slate-300 mb-1">{t('hiringRequest.title')}</label>
                            <input
                                required
                                disabled={isViewOnly}
                                type="text"
                                value={formData.title || ""}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                                placeholder="e.g. Senior Frontend Engineer"
                            />
                        </div>

                        {/* Department */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">{t('hiringRequest.department')}</label>
                            <select
                                required
                                disabled={isViewOnly}
                                value={formData.departmentId || ""}
                                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                                className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none disabled:opacity-50"
                            >
                                <option value="">Select Department</option>
                                {departments.map(dept => (
                                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">{t('hiringRequest.category')}</label>
                            <select
                                disabled={isViewOnly}
                                value={formData.category || "Cadre"}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none disabled:opacity-50"
                            >
                                <option value="Cadre">Cadre</option>
                                <option value="Etam">Etam</option>
                                <option value="Ouvrier">Ouvrier</option>
                                <option value="Stagiaire">Stagiaire</option>
                            </select>
                        </div>

                        {/* Priority */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Priority</label>
                            <select
                                disabled={isViewOnly}
                                value={formData.priority || "Medium"}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none disabled:opacity-50"
                            >
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                            </select>
                        </div>

                        {/* Contract Type */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">{t('hiringRequest.contractType')}</label>
                            <select
                                disabled={isViewOnly}
                                value={formData.contractType || "CDI"}
                                onChange={(e) => setFormData({ ...formData, contractType: e.target.value })}
                                className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none disabled:opacity-50"
                            >
                                <option value="CDI">CDI</option>
                                <option value="CDD">CDD</option>
                                <option value="Freelance">Freelance</option>
                                <option value="Internship">Internship</option>
                            </select>
                        </div>

                        {/* Budget */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">{t('hiringRequest.budget')}</label>
                            <input
                                disabled={isViewOnly}
                                type="number"
                                value={formData.budget || 0}
                                onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                                className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                            />
                        </div>

                        {/* Status (Only editable if not view only) */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">{t('hiringRequest.status')}</label>
                            <select
                                disabled={isViewOnly}
                                value={formData.status || "Pending HR"}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none disabled:opacity-50"
                            >
                                <option value="Pending HR">Pending HR</option>
                                <option value="Pending Director">Pending Director</option>
                                <option value="Approved">Approved</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">{t('hiringRequest.description')}</label>
                        <textarea
                            disabled={isViewOnly}
                            rows={3}
                            value={formData.description || ""}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                        />
                    </div>

                    {/* Reason */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">{t('hiringRequest.reason')}</label>
                        <textarea
                            disabled={isViewOnly}
                            rows={2}
                            value={formData.reason || ""}
                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                            className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                        />
                    </div>

                    {!isViewOnly && (
                        <div className="pt-4 flex justify-end gap-3 border-t border-white/10 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors font-medium"
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl font-medium shadow-lg shadow-primary/20 transition-all"
                            >
                                {t('common.save')}
                            </button>
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
    const [searchTerm, setSearchTerm] = useState("");

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<HiringRequest | null>(null);
    const [isViewOnly, setIsViewOnly] = useState(false);

    const loadData = async () => {
        try {
            const [reqs, depts] = await Promise.all([
                api.getHiringRequests(),
                api.getDepartments()
            ]);
            setRequests(reqs);
            setDepartments(depts);
        } catch (error) {
            console.error("Failed to load data:", error);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleCreate = async (data: Partial<HiringRequest>) => {
        try {
            // Hardcode requesterId for now since we don't have auth context fully
            // In a real app, backend would take user from token, or specific selector
            // We'll skip requesterId in frontend or send a placeholder if DB requires it.
            // DB has requesterId foreign key to User. Let's pick a user if possible or leave empty.
            const payload = { ...data, requesterId: 'user1' }; // Mock user ID or handle in backend
            await api.createHiringRequest(payload);
            loadData();
            setIsModalOpen(false);
        } catch (error) {
            console.error("Failed to create request:", error);
            alert("Failed to create request");
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
            case "Approved": return "bg-green-500/10 text-green-500 border-green-500/20";
            case "Rejected": return "bg-red-500/10 text-red-500 border-red-500/20";
            case "Pending Director": return "bg-orange-500/10 text-orange-500 border-orange-500/20";
            default: return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
        }
    };

    return (
        <DashboardLayout>
            <RequestModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={selectedRequest ? handleUpdate : handleCreate}
                request={selectedRequest}
                departments={departments}
                isViewOnly={isViewOnly}
            />

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">{t('common.hiringRequests')}</h1>
                    <p className="text-muted-foreground mt-1">{t('hiringRequest.description')}</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)]"
                >
                    <Plus size={20} />
                    {t('hiringRequest.newRequest')}
                </button>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4 glass-card p-4 rounded-xl">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <input
                        type="text"
                        placeholder={t('common.search')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm text-white placeholder:text-muted-foreground"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-medium text-muted-foreground hover:text-white hover:bg-white/10 transition-colors">
                    <Filter size={18} />
                    Filters
                </button>
            </div>

            {/* List */}
            <div className="glass-card rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/5">
                                <th className="px-6 py-4 font-semibold text-white">{t('hiringRequest.title')}</th>
                                <th className="px-6 py-4 font-semibold text-white">{t('hiringRequest.department')}</th>
                                <th className="px-6 py-4 font-semibold text-white">{t('hiringRequest.category')}</th>
                                <th className="px-6 py-4 font-semibold text-white">Priority</th>
                                <th className="px-6 py-4 font-semibold text-white">{t('hiringRequest.requester')}</th>
                                <th className="px-6 py-4 font-semibold text-white">{t('hiringRequest.date')}</th>
                                <th className="px-6 py-4 font-semibold text-white">{t('hiringRequest.status')}</th>
                                <th className="px-6 py-4 font-semibold text-white text-right">{t('common.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {requests.filter(r => r.title.toLowerCase().includes(searchTerm.toLowerCase())).map((req) => (
                                <tr key={req.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4 font-medium text-white">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                                                <FileText size={16} />
                                            </div>
                                            {req.title}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">{req.departmentName || req.departmentId}</td>
                                    <td className="px-6 py-4 text-muted-foreground">{req.category}</td>
                                    <td className="px-6 py-4">
                                        <span className={clsx(
                                            "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                                            req.priority === 'High' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                                                req.priority === 'Medium' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                                                    'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                                        )}>
                                            {req.priority || 'Medium'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">{req.requesterName || "N/A"}</td>
                                    <td className="px-6 py-4 text-muted-foreground">{new Date(req.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={clsx("px-3 py-1 rounded-full text-xs font-medium border", getStatusColor(req.status))}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => openViewModal(req)}
                                                className="p-2 hover:bg-white/10 rounded-lg text-blue-400 hover:text-blue-300 transition-colors"
                                                title={t('hiringRequest.viewDetails')}
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                onClick={() => openEditModal(req)}
                                                className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                                                title={t('hiringRequest.editRequest')}
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(req.id)}
                                                className="p-2 hover:bg-white/10 rounded-lg text-red-500 hover:text-red-400 transition-colors"
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
                                    <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground">
                                        No hiring requests found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
}
