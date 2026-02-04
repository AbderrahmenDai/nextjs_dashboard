"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { Plus, Search, Filter, FileText, Edit, Trash2, Eye, X, Printer, Check, XCircle } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
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
    rejectionReason?: string;
    roleId?: string;
    selectedCandidates?: string[]; // IDs of selected candidates
}

interface Site {
    id: string;
    name: string;
}

interface Department {
    id: string;
    name: string;
    siteId?: string;
    // Assuming backend returns this if joined or we filter by name/site relation
}

interface Role {
    id: string;
    name: string;
    departmentId?: string;
}

interface Candidate {
    id: string;
    firstName: string;
    lastName: string;
    department: string; // usually a string name in Candidate model
}

// ... existing code ...

function RequestModal({
    isOpen,
    onClose,
    onSave,
    request,
    departments,
    sites,
    allRoles,
    isViewOnly = false,
    onPrint
}: {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<HiringRequest>) => void;
    request: HiringRequest | null;
    departments: Department[];
    sites: Site[];
    allRoles: Role[];
    isViewOnly?: boolean;
    onPrint: (req: HiringRequest) => void;
}) {
    const { t } = useLanguage();
    const { user } = useAuth();
    const [formData, setFormData] = useState<Partial<HiringRequest>>(() => {
        const defaults = {
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
            reason: "",
            educationRequirements: "",
            skillsRequirements: "",
            rejectionReason: "",
            roleId: "",
            selectedCandidates: []
        };
        // Merge request data if available, ensuring nulls become empty strings for inputs
        if (request) {
            return {
                ...defaults,
                ...request,
                // Handle specific nullables that crash value inputs
                replacementFor: request.replacementFor || "",
                replacementReason: request.replacementReason || "",
                description: request.description || "",
                reason: request.reason || "",
                educationRequirements: request.educationRequirements || "",
                skillsRequirements: request.skillsRequirements || "",
            };
        }
        return defaults;
    });

    // Cascading Filter States (Memoized)
    const filteredDepartments = useMemo(() => {
        if (formData.site) {
            const selectedSiteObj = sites.find(s => s.name === formData.site);
            if (selectedSiteObj) {
                return departments.filter(d => (d as any).siteId === selectedSiteObj.id);
            }
        }
        return departments;
    }, [formData.site, departments, sites]);

    const filteredRoles = useMemo(() => {
        if (formData.departmentId) {
            return allRoles.filter(r => r.departmentId === formData.departmentId);
        }
        return [];
    }, [formData.departmentId, allRoles]);


    useEffect(() => {
        if (!isOpen) {
            // Optional: reset if needed, but key handles it on mount
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start pt-20 justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
            <div className="modal-card w-full max-w-4xl p-0 overflow-hidden flex flex-col max-h-[90vh] relative group shadow-2xl">
                {/* Visual effects ommitted for brevity, assume they exist */}
                <div className="px-6 py-6 gradient-premium flex justify-between items-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]"></div>
                    <div className="flex flex-col relative z-10">
                        <h2 className="text-2xl font-bold text-white tracking-tight uppercase">
                            Demande d&apos;Autorisation d&apos;Embauche
                        </h2>
                        <p className="text-sm text-white/80 font-medium">Demande d&apos;Autorisation d&apos;Embauche</p>
                    </div>
                    <div className="flex items-center gap-2 relative z-10">
                        {isViewOnly && request && (
                            <button
                                onClick={() => onPrint(request)}
                                className="p-2.5 hover:bg-white/10 text-white rounded-xl transition-all"
                                title="Print Report"
                            >
                                <Printer size={24} />
                            </button>
                        )}
                        <button onClick={onClose} className="p-2.5 hover:bg-white/10 text-white hover:text-white/80 rounded-xl transition-all">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar bg-card/50 p-6 space-y-6">
                    {formData.status === 'Rejected' && formData.rejectionReason && (
                        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start gap-3">
                            <XCircle className="w-5 h-5 text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <h4 className="text-sm font-bold text-red-600 dark:text-red-500 uppercase tracking-wide mb-1">Demande Refusée</h4>
                                <p className="text-sm text-foreground/80">{formData.rejectionReason}</p>
                            </div>
                        </div>
                    )}

                    {/* Section 1: Header Info */}
                    <div className="flex flex-wrap gap-4 items-center justify-between bg-card border border-border/50 p-4 rounded-xl shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Cree par</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary border border-primary/20">
                                        {request?.requesterName ? request.requesterName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '??'}
                                    </div>
                                    <span className="text-sm font-bold text-foreground">
                                        {request?.requesterName || (isViewOnly ? "Système" : user?.name)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-6">
                            {['Ouvrier', 'Etam', 'Cadre'].map((cat) => (
                                <label key={cat} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="category"
                                        checked={formData.category === cat}
                                        onChange={() => setFormData({ ...formData, category: cat })}
                                        disabled={isViewOnly}
                                        className="w-4 h-4 text-primary"
                                    />
                                    <span className="text-sm font-bold uppercase">{cat}</span>
                                </label>
                            ))}
                        </div>
                    </div>

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
                                    {filteredDepartments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
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

                        <div className="grid grid-cols-1 gap-4">
                            <div>
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

                    {/* Section 1.5: Role Selection */}
                    <div className="bg-primary/5 border border-primary/10 p-4 rounded-2xl space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-primary uppercase mb-1.5 opacity-80">Role</label>
                                <select
                                    disabled={isViewOnly || !formData.departmentId}
                                    value={formData.roleId || ""}
                                    onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                                    className="input-field"
                                >
                                    <option value="">Select Role...</option>
                                    {filteredRoles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                </select>
                                {!formData.departmentId && <p className="text-[10px] text-muted-foreground mt-1">Select a department first.</p>}
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

                            {formData.status === 'Rejected' && (
                                <div className="flex flex-col gap-1 flex-1 mx-4 animate-in fade-in zoom-in duration-300">
                                    <span className="text-xs font-bold uppercase text-red-500">Motif du refus (Requis) :</span>
                                    <textarea
                                        required
                                        rows={1}
                                        placeholder="Veuillez indiquer le motif du refus..."
                                        value={formData.rejectionReason || ""}
                                        onChange={(e) => setFormData({ ...formData, rejectionReason: e.target.value })}
                                        className="bg-red-50 border border-red-200 rounded text-sm px-2 py-1 text-red-900 focus:outline-none focus:ring-1 focus:ring-red-500 w-full min-h-[40px]"
                                    />
                                </div>
                            )}

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
    const searchParams = useSearchParams();
    const [requests, setRequests] = useState<HiringRequest[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [sites, setSites] = useState<Site[]>([]);
    const [allRoles, setAllRoles] = useState<Role[]>([]);
    const [allCandidates, setAllCandidates] = useState<Candidate[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<HiringRequest | null>(null);
    const [isViewOnly, setIsViewOnly] = useState(false);

    // Filter by View ID if present in URL
    useEffect(() => {
        const viewId = searchParams.get('view');
        if (viewId && requests.length > 0) {
            const req = requests.find(r => r.id === viewId);
            if (req) {
                setSelectedRequest(req);
                setIsViewOnly(true);
                setIsModalOpen(true);
            }
        }
    }, [searchParams, requests]);

    const loadData = async () => {
        try {
            const [reqs, depts, sitesData, rolesData, candidatesData] = await Promise.all([
                api.getHiringRequests(),
                api.getDepartments(),
                api.getSites(),
                api.getRoles(),
                api.getCandidatures()
            ]);
            setRequests(reqs);
            setDepartments(depts);
            setSites(sitesData);
            setAllRoles(rolesData);
            setAllCandidates(candidatesData);
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
            const payload = { ...data, approverId: user?.id };
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

    // Quick Approve Function
    const handleQuickApprove = async (request: HiringRequest) => {
        if (!user?.id) return;

        try {
            let newStatus = '';

            // Determine next status based on current status and user role
            if (request.status === 'Pending HR' && user.role === 'HR_MANAGER') {
                newStatus = 'Pending Director';
            } else if (request.status === 'Pending Director' && user.role === 'PLANT_MANAGER') {
                newStatus = 'Approved';
            } else {
                alert("Vous n'avez pas la permission d'approuver cette demande à cette étape.");
                return;
            }

            const payload = {
                status: newStatus,
                approverId: user.id
            };

            await api.updateHiringRequest(request.id, payload);
            loadData();
            alert(`✅ Demande approuvée avec succès !`);
        } catch (error) {
            console.error("Failed to approve request:", error);
            alert("Échec de l'approbation");
        }
    };

    // Quick Reject Function
    const handleQuickReject = async (request: HiringRequest) => {
        if (!user?.id) return;

        const reason = prompt("📝 Veuillez indiquer le motif du refus (obligatoire):");

        if (!reason || reason.trim() === '') {
            alert("❌ Le motif de refus est obligatoire");
            return;
        }

        try {
            const payload = {
                status: 'Rejected',
                rejectionReason: reason,
                approverId: user.id
            };

            await api.updateHiringRequest(request.id, payload);
            loadData();
            alert(`❌ Demande rejetée`);
        } catch (error) {
            console.error("Failed to reject request:", error);
            alert("Échec du rejet");
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

    const handlePrint = (req: HiringRequest) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const date = new Date(req.createdAt).toLocaleDateString();
        const startDate = req.desiredStartDate ? new Date(req.desiredStartDate).toLocaleDateString() : 'N/A';

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Hiring Request - ${req.title}</title>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; line-height: 1.6; padding: 40px; }
                    .header { text-align: center; border-bottom: 3px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }
                    .header h1 { margin: 0; color: #1e40af; text-transform: uppercase; letter-spacing: 2px; }
                    .header p { margin: 5px 0 0; color: #666; font-weight: bold; }
                    
                    .section { margin-bottom: 30px; background: #fff; }
                    .section-title { background: #f3f4f6; padding: 8px 15px; font-weight: bold; text-transform: uppercase; border-left: 4px solid #3b82f6; margin-bottom: 15px; font-size: 14px; }
                    
                    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                    .field { margin-bottom: 10px; }
                    .label { font-weight: bold; font-size: 12px; color: #666; text-transform: uppercase; display: block; }
                    .value { font-size: 14px; color: #111; border-bottom: 1px solid #eee; padding-bottom: 2px; }
                    
                    .full-width { grid-column: span 2; }
                    
                    .text-block { background: #fafafa; padding: 15px; border: 1px solid #eee; border-radius: 4px; font-size: 13px; white-space: pre-wrap; }
                    
                    .footer { margin-top: 60px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 40px; text-align: center; }
                    .signature-box { border-top: 1px solid #333; padding-top: 10px; font-size: 12px; }
                    
                    @media print {
                        body { padding: 0; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Demande d&apos;Autorisation d&apos;Embauche</h1>
                    <p>Référence: HR-${req.id.substring(0, 8)}</p>
                </div>

                <div class="section">
                    <div class="section-title">Informations Générales</div>
                    <div class="grid">
                        <div class="field">
                            <span class="label">Titre du Poste</span>
                            <div class="value">${req.title}</div>
                        </div>
                        <div class="field">
                            <span class="label">Date de la Demande</span>
                            <div class="value">${date}</div>
                        </div>
                        <div class="field">
                            <span class="label">Département / Service</span>
                            <div class="value">${req.departmentName || req.departmentId}</div>
                        </div>
                        <div class="field">
                            <span class="label">Site / Lieu de Travail</span>
                            <div class="value">${req.site || 'N/A'}</div>
                        </div>
                        <div class="field">
                            <span class="label">Catégorie</span>
                            <div class="value">${req.category}</div>
                        </div>
                        <div class="field">
                            <span class="label">Type de Contrat</span>
                            <div class="value">${req.contractType}</div>
                        </div>
                        <div class="field">
                            <span class="label">Priorité</span>
                            <div class="value">${req.priority || 'Medium'}</div>
                        </div>
                        <div class="field">
                            <span class="label">Date Souhaitée d&apos;Engagement</span>
                            <div class="value">${startDate}</div>
                        </div>
                        <div class="field">
                            <span class="label">Demandeur</span>
                            <div class="value">${req.requesterName || 'N/A'}</div>
                        </div>
                        <div class="field">
                            <span class="label">Statut Actuel</span>
                            <div class="value">${req.status}</div>
                        </div>
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">Contexte de la Demande</div>
                    <div class="grid">
                        <div class="field full-width">
                            <span class="label">Type d&apos;Augmentation / Remplacement</span>
                            <div class="value">
                                ${req.replacementFor ? `Remplacement de: ${req.replacementFor} (Motif: ${req.replacementReason || 'N/A'})` : ''}
                                ${req.increaseType === 'Budgeted' ? `Augmentation Budgétée (${req.increaseDateRange || 'N/A'})` : ''}
                                ${req.increaseType === 'Non-Budgeted' ? 'Augmentation Non Budgétée' : ''}
                            </div>
                        </div>
                        <div class="field full-width">
                            <span class="label">Justification précise</span>
                            <div class="text-block">${req.reason || 'Aucune justification fournie.'}</div>
                        </div>
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">Missions et Caractéristiques du Poste</div>
                    <div class="text-block">${req.description || 'Aucune description fournie.'}</div>
                </div>

                <div class="section">
                    <div class="section-title">Profil Recherché</div>
                    <div class="grid">
                        <div class="field full-width">
                            <span class="label">Formation souhaitée</span>
                            <div class="value">${req.educationRequirements || 'N/A'}</div>
                        </div>
                        <div class="field full-width">
                            <span class="label">Compétences indispensables</span>
                            <div class="text-block">${req.skillsRequirements || 'N/A'}</div>
                        </div>
                    </div>
                </div>

                <div class="footer">
                    <div class="signature-box">
                        <strong>Signature du Demandeur</strong>
                        <br><br><br>
                        ${req.requesterName || ''}
                    </div>
                    <div class="signature-box">
                        <strong>Avis RH</strong>
                        <br><br><br>
                        Cachet et Signature
                    </div>
                    <div class="signature-box">
                        <strong>Direction Générale</strong>
                        <br><br><br>
                        Décision et Signature
                    </div>
                </div>

                <script>
                    window.onload = function() {
                        window.print();
                        // Optional: window.close();
                    };
                </script>
            </body>
            </html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
    };

    // Helper for Status Colors
    const getStatusColor = (status: string) => {
        switch (status) {
            case "Pending HR":
                return "bg-blue-500/10 text-blue-600 dark:text-blue-500 border-blue-500/20";
            case "Pending Director":
                return "bg-orange-500/10 text-orange-600 dark:text-orange-500 border-orange-500/20";
            case "Approved":
                return "bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20";
            case "Rejected":
                return "bg-red-500/10 text-red-600 dark:text-red-500 border-red-500/20";
            default:
                return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border-yellow-500/20";
        }
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col h-full relative">
                <RequestModal
                    key={selectedRequest?.id || (isModalOpen ? 'new' : 'closed')}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={selectedRequest ? handleUpdate : handleCreate}
                    request={selectedRequest}
                    departments={departments}
                    sites={sites}
                    allRoles={allRoles}
                    isViewOnly={isViewOnly}
                    onPrint={handlePrint}
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
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold text-muted-foreground border border-border/50">
                                                    {req.requesterName ? req.requesterName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '??'}
                                                </div>
                                                <span className="text-muted-foreground font-medium">{req.requesterName || "N/A"}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">{new Date(req.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={clsx("px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border", getStatusColor(req.status))}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                                                {/* Quick Approve Button - Only for HR_MANAGER on Pending HR or PLANT_MANAGER on Pending Director */}
                                                {((req.status === 'Pending HR' && user?.role === 'HR_MANAGER') ||
                                                    (req.status === 'Pending Director' && user?.role === 'PLANT_MANAGER')) && (
                                                        <button
                                                            onClick={() => handleQuickApprove(req)}
                                                            className="p-2 hover:bg-green-500/10 rounded-lg text-green-600 dark:text-green-500 hover:text-green-700 transition-colors"
                                                            title="Approuver rapidement"
                                                        >
                                                            <Check size={18} />
                                                        </button>
                                                    )}

                                                {/* Quick Reject Button - Only for HR_MANAGER on Pending HR or PLANT_MANAGER on Pending Director */}
                                                {((req.status === 'Pending HR' && user?.role === 'HR_MANAGER') ||
                                                    (req.status === 'Pending Director' && user?.role === 'PLANT_MANAGER')) && (
                                                        <button
                                                            onClick={() => handleQuickReject(req)}
                                                            className="p-2 hover:bg-red-500/10 rounded-lg text-red-600 dark:text-red-500 hover:text-red-700 transition-colors"
                                                            title="Rejeter"
                                                        >
                                                            <XCircle size={18} />
                                                        </button>
                                                    )}

                                                <button
                                                    onClick={() => openViewModal(req)}
                                                    className="p-2 hover:bg-secondary rounded-lg text-blue-500 dark:text-blue-400 hover:text-blue-600 transition-colors"
                                                    title={t('hiringRequest.viewDetails')}
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handlePrint(req)}
                                                    className="p-2 hover:bg-secondary rounded-lg text-primary hover:text-primary/80 transition-colors"
                                                    title="Print Report"
                                                >
                                                    <Printer size={18} />
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
