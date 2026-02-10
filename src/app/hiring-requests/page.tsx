"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { Plus, Search, Filter, FileText, Edit, Trash2, Eye, X, Printer, Check, XCircle, UserPlus, ChevronLeft, ChevronRight, Briefcase, CheckCircle, Clock } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { clsx } from "clsx";
import { api } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { HiringRequestPaper } from "@/components/HiringRequestPaper";
import { AssignCandidateModal } from "@/components/AssignCandidateModal";

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
    approverName?: string;
    approvedAt?: string;
    requestDate?: string;
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
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const [formData, setFormData] = useState<Partial<HiringRequest>>(() => {
        const defaults = {
            title: "",
            departmentId: "",
            category: "MOI",
            status: "Pending Responsable RH",
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
            const selectedDept = departments.find(d => d.id === formData.departmentId);
            if (selectedDept) {
                // Filter by departmentName (cross-site) OR specific departmentId
                return allRoles.filter(r =>
                    (r as any).departmentName === selectedDept.name ||
                    r.departmentId === formData.departmentId
                );
            }
        }
        return [];
    }, [formData.departmentId, allRoles, departments]);


    useEffect(() => {
        if (!isOpen) {
            // Optional: reset if needed, but key handles it on mount
        }
    }, [isOpen]);

    if (!isOpen || !mounted) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    if (isViewOnly && request) {
        return createPortal(
            <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/60 backdrop-blur-sm p-4 md:p-8">
                <div className="min-h-full flex items-center justify-center">
                    <HiringRequestPaper request={request as any} onClose={onClose} />
                </div>
            </div>,
            document.body
        );
    }

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="modal-card w-full max-w-4xl p-0 overflow-hidden flex flex-col max-h-[90vh] bg-background border border-border rounded-xl shadow-2xl relative">
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
                            {['MOI', 'MOS', 'MOD'].map((cat) => (
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

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg border border-border/50 mb-4">
                        <div className="flex items-center gap-1.5">
                            <span className="font-bold uppercase opacity-70">Créé par:</span>
                            <span className="font-semibold text-foreground">{formData.requesterName || "Inconnu"}</span>
                        </div>
                        <div className="w-px h-3 bg-border hidden sm:block"></div>
                        <div className="flex items-center gap-1.5">
                            <span className="font-bold uppercase opacity-70">Le:</span>
                            <span className="font-semibold text-foreground">{formData.createdAt ? new Date(formData.createdAt).toLocaleDateString('fr-FR') : "N/A"}</span>
                        </div>
                    </div>

                    {/* Section 0: Title */}
                    <div className="bg-card border border-border/50 p-4 rounded-xl shadow-sm">
                        <label className="block text-xs font-bold text-primary uppercase mb-1.5 opacity-80">Titre du Poste</label>
                        <input
                            type="text"
                            required
                            disabled={isViewOnly}
                            value={formData.title || ""}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="input-field font-bold text-lg"
                            placeholder="Ex: Ingénieur DevOps"
                        />
                    </div>

                    <div className="bg-primary/5 border border-primary/10 p-4 rounded-2xl space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-primary uppercase mb-1.5 opacity-80">Lieu de Travail (Site)</label>
                                <select
                                    disabled={isViewOnly}
                                    value={formData.site || ""}
                                    onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                                    className="input-field"
                                >
                                    <option value="">Sélectionner...</option>
                                    {sites.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-primary uppercase mb-1.5 opacity-80">Service (Dept)</label>
                                <select
                                    required
                                    disabled={isViewOnly}
                                    value={formData.departmentId || ""}
                                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                                    className="input-field"
                                >
                                    <option value="">Sélectionner...</option>
                                    {filteredDepartments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-primary uppercase mb-1.5 opacity-80">Date Souhaitée d&apos;Engagement</label>
                                <input
                                    type="date"
                                    disabled={isViewOnly}
                                    value={formData.desiredStartDate ? new Date(formData.desiredStartDate).toISOString().split('T')[0] : ""}
                                    onChange={(e) => setFormData({ ...formData, desiredStartDate: e.target.value })}
                                    className="input-field [color-scheme:light]"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-primary uppercase mb-1.5 opacity-80">Priorité</label>
                                <select
                                    disabled={isViewOnly}
                                    value={formData.priority || "Medium"}
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                    className="input-field"
                                >
                                    <option value="Low">Faible</option>
                                    <option value="Medium">Moyenne</option>
                                    <option value="High">Haute</option>
                                    <option value="Critical">Critique</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-primary uppercase mb-1.5 opacity-80">Type de Contrat</label>
                                <select
                                    disabled={isViewOnly}
                                    value={formData.contractType || "CDI"}
                                    onChange={(e) => setFormData({ ...formData, contractType: e.target.value })}
                                    className="input-field"
                                >
                                    <option value="CDI">CDI</option>
                                    <option value="CDD">CDD</option>
                                    <option value="CIVP">CIVP</option>
                                    <option value="Stage">Stage</option>
                                    <option value="Alternance">Alternance</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Section 1.5: Role Selection */}
                    <div className="bg-primary/5 border border-primary/10 p-4 rounded-2xl space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-primary uppercase mb-1.5 opacity-80">Poste</label>
                                <select
                                    disabled={isViewOnly || !formData.departmentId}
                                    value={formData.roleId || ""}
                                    onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                                    className="input-field"
                                >
                                    <option value="">Sélectionner un poste...</option>
                                    {filteredRoles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                </select>
                                {!formData.departmentId && <p className="text-[10px] text-muted-foreground mt-1">Sélectionner d&apos;abord un département.</p>}
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
                                className="input-field flex-1"
                            />
                            <div className="flex items-center gap-2 flex-1 w-full">
                                <span className="text-sm font-bold text-foreground whitespace-nowrap">Motif de Départ :</span>
                                <input
                                    type="text"
                                    disabled={isViewOnly}
                                    value={formData.replacementReason || ""}
                                    onChange={(e) => setFormData({ ...formData, replacementReason: e.target.value })}
                                    className="input-field flex-1"
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
                                    className="input-field flex-1"
                                />
                            </div>
                        </div>

                        {/* Non-Budgeted */}
                        <div className="flex items-center gap-2 pt-4 border-t border-primary/10">
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
                    </div >

                    {/* Section 4: Process Characteristics (Description) */}
                    < div className="space-y-2" >
                        <label className="block text-sm font-bold text-foreground uppercase bg-secondary px-3 py-1.5 rounded-lg border border-border/50 w-fit">Caractéristiques du Poste à Pourvoir (Missions) :</label>
                        <textarea
                            rows={3}
                            disabled={isViewOnly}
                            value={formData.description || ""}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="input-field min-h-[80px]"
                        />
                    </div >

                    {/* Section 5: Candidate Requirements */}
                    < div className="space-y-4" >
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
                    </div >

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
                                    <option value="Pending Responsable RH">Pending Responsable RH</option>
                                    <option value="Pending Plant Manager">Pending Plant Manager</option>
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
                </form >
            </div >
        </div >,
        document.body
    );
}

export default function HiringRequestsPage() {
    const { t } = useLanguage();
    const router = useRouter();
    const { user, isLoading } = useAuth(); // Single declaration
    const searchParams = useSearchParams();
    const [requests, setRequests] = useState<HiringRequest[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [sites, setSites] = useState<Site[]>([]);
    const [allRoles, setAllRoles] = useState<Role[]>([]);
    const [allCandidates, setAllCandidates] = useState<Candidate[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState("");
    const [selectedSite, setSelectedSite] = useState("");
    const [selectedRequester, setSelectedRequester] = useState(""); // Filtering by requester name locally on page (limited)
    const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, rejected: 0 });

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<HiringRequest | null>(null);
    const [requestToAssign, setRequestToAssign] = useState<HiringRequest | null>(null);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isViewOnly, setIsViewOnly] = useState(false);

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1
    });

    // Handle URL actions and filters
    useEffect(() => {
        const viewId = searchParams.get('view');
        const action = searchParams.get('action');

        if (action === 'create') {
            setSelectedRequest(null);
            setIsViewOnly(false);
            setIsModalOpen(true);
        } else if (viewId && requests.length > 0) {
            const req = requests.find(r => r.id === viewId);
            if (req) {
                setSelectedRequest(req);
                setIsViewOnly(true);
                setIsModalOpen(true);
            }
        }
    }, [searchParams, requests]);



    const loadData = async (page = 1) => {
        try {
            // Filter strictly for DEMANDEUR
            const requesterId = user?.role === 'DEMANDEUR' ? user.id : undefined;
            const limit = pagination.limit;

            const [reqsResponse, depts, sitesData, rolesData, candidatesData] = await Promise.all([
                api.getHiringRequests(page, limit, requesterId, searchTerm, selectedDepartment, selectedSite),
                api.getDepartments(),
                api.getSites(),
                api.getRoles(),
                api.getCandidatures()
            ]);

            if (reqsResponse.pagination) {
                setRequests(reqsResponse.data);
                setPagination({
                    page: reqsResponse.pagination.page,
                    limit: reqsResponse.pagination.limit,
                    total: reqsResponse.pagination.total,
                    totalPages: reqsResponse.pagination.totalPages
                });

                // Minimal stats based on total count
                setStats(prev => ({ ...prev, total: reqsResponse.pagination.total }));
            } else {
                // Fallback
                const allReqs = Array.isArray(reqsResponse) ? reqsResponse : [];
                setRequests(allReqs);
                setPagination({ page: 1, limit: allReqs.length, total: allReqs.length, totalPages: 1 });
            }

            setDepartments(depts);
            setSites(sitesData);
            setAllRoles(rolesData);
            setAllCandidates(candidatesData);
        } catch (error) {
            console.error("Failed to load data:", error);
        }
    };

    useEffect(() => {
        if (!isLoading) {
            loadData(pagination.page);
        }
    }, [isLoading, user?.id, pagination.page, searchTerm, selectedDepartment, selectedSite]); // Trigger on filter change

    // Reset page on filter change (except pagination.page itself)
    useEffect(() => {
        setPagination(prev => ({ ...prev, page: 1 }));
    }, [searchTerm, selectedDepartment, selectedSite]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            loadData(newPage);
        }
    };



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
            // Updated to match new workflow statuses
            if (request.status === 'Pending Responsable RH' && (user.role === 'HR_MANAGER' || user.role === 'Responsable RH' || user.role === 'Responsable RH (TTG)')) {
                newStatus = 'Pending Plant Manager';
            } else if (request.status === 'Pending HR Director' && (user.role === 'Directeur RH' || user.role === 'DRH' || user.role === 'DRH (TTG)')) {
                newStatus = 'Pending Plant Manager';
            } else if (request.status === 'Pending Plant Manager' && (user.role === 'PLANT_MANAGER' || user.role === 'Plant Manager' || user.role === 'Direction' || user.role === 'Plant Manager (TTG)')) {
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
                        <strong> Demandeur</strong>
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

                <AssignCandidateModal
                    isOpen={isAssignModalOpen}
                    onClose={() => setIsAssignModalOpen(false)}
                    hiringRequest={requestToAssign}
                    onSuccess={() => {
                        // Optional: reload data or show toast
                        // loadData(); // If we want to reflect assignment count if added
                    }}
                />

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div className="pl-1">
                        <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-xl border border-primary/20 shadow-sm">
                                <FileText className="w-6 h-6 text-primary" />
                            </div>
                            Demandes de Recrutement
                        </h1>
                        <p className="text-muted-foreground mt-2 ml-14 font-medium">Gérez le processus d&apos;approbation des recrutements.</p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-primary/25 active:scale-95"
                    >
                        <Plus size={18} strokeWidth={2.5} />
                        {t('hiringRequest.newRequest')}
                    </button>
                </div>

                {/* Dynamic Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-card border border-border/50 p-4 rounded-xl flex items-center justify-between shadow-sm relative overflow-hidden group hover:border-blue-500/30 transition-all duration-300">
                        <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-all duration-300"></div>
                        <div className="relative z-10">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-600 flex items-center justify-center mb-2">
                                <Briefcase size={20} strokeWidth={2.5} />
                            </div>
                            <span className="text-3xl font-black text-foreground block">{stats.total}</span>
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Postes</span>
                        </div>
                    </div>

                    <div className="bg-card border border-border/50 p-4 rounded-xl flex items-center justify-between shadow-sm relative overflow-hidden group hover:border-green-500/30 transition-all duration-300">
                        <div className="absolute inset-0 bg-green-500/5 group-hover:bg-green-500/10 transition-all duration-300"></div>
                        <div className="relative z-10">
                            <div className="w-10 h-10 rounded-lg bg-green-500/20 text-green-600 flex items-center justify-center mb-2">
                                <CheckCircle size={20} strokeWidth={2.5} />
                            </div>
                            <span className="text-3xl font-black text-foreground block">{stats.approved}</span>
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Approuvés</span>
                        </div>
                    </div>

                    <div className="bg-card border border-border/50 p-4 rounded-xl flex items-center justify-between shadow-sm relative overflow-hidden group hover:border-yellow-500/30 transition-all duration-300">
                        <div className="absolute inset-0 bg-yellow-500/5 group-hover:bg-yellow-500/10 transition-all duration-300"></div>
                        <div className="relative z-10">
                            <div className="w-10 h-10 rounded-lg bg-yellow-500/20 text-yellow-600 flex items-center justify-center mb-2">
                                <Clock size={20} strokeWidth={2.5} />
                            </div>
                            <span className="text-3xl font-black text-foreground block">{stats.pending}</span>
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">En Attente</span>
                        </div>
                    </div>

                    <div className="bg-card border border-border/50 p-4 rounded-xl flex items-center justify-between shadow-sm relative overflow-hidden group hover:border-red-500/30 transition-all duration-300">
                        <div className="absolute inset-0 bg-red-500/5 group-hover:bg-red-500/10 transition-all duration-300"></div>
                        <div className="relative z-10">
                            <div className="w-10 h-10 rounded-lg bg-red-500/20 text-red-600 flex items-center justify-center mb-2">
                                <XCircle size={20} strokeWidth={2.5} />
                            </div>
                            <span className="text-3xl font-black text-foreground block">{stats.rejected}</span>
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Rejetés</span>
                        </div>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="glass-card p-4 rounded-xl mb-6 flex flex-col gap-4">
                    {/* Search Bar */}
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <input
                            type="text"
                            placeholder={t('common.search')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-field pl-10 bg-card/50 w-full"
                        />
                    </div>

                    {/* Filter Dropdowns */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Department Filter */}
                        <div className="relative">
                            <select
                                value={selectedDepartment}
                                onChange={(e) => setSelectedDepartment(e.target.value)}
                                className="input-field w-full appearance-none cursor-pointer bg-card/50"
                            >
                                <option value="">Tous les Départements</option>
                                {departments.map((dept) => (
                                    <option key={dept.id} value={dept.name}>{dept.name}</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-muted-foreground">
                                <Filter size={14} />
                            </div>
                        </div>

                        {/* Site Filter */}
                        <div className="relative">
                            <select
                                value={selectedSite}
                                onChange={(e) => setSelectedSite(e.target.value)}
                                className="input-field w-full appearance-none cursor-pointer bg-card/50"
                            >
                                <option value="">Tous les Sites</option>
                                {sites.map((site) => (
                                    <option key={site.id} value={site.name}>{site.name}</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-muted-foreground">
                                <Filter size={14} />
                            </div>
                        </div>

                        {/* Requester Filter */}
                        <div className="relative">
                            <select
                                value={selectedRequester}
                                onChange={(e) => setSelectedRequester(e.target.value)}
                                className="input-field w-full appearance-none cursor-pointer bg-card/50"
                            >
                                <option value="">Tous les Demandeurs</option>
                                {Array.from(new Set(requests.map(r => r.requesterName).filter(Boolean))).map((name) => (
                                    <option key={name as string} value={name as string}>{name}</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-muted-foreground">
                                <Filter size={14} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card Grid View */}
                <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                        {requests.filter(req => {
                            // Only client-side filter left is 'selectedRequester' if implemented or other small things
                            const matchesRequester = selectedRequester ? req.requesterName === selectedRequester : true;
                            return matchesRequester;
                        }).map((req) => (
                            <motion.div
                                layout
                                key={req.id}
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                                className="group bg-card hover:bg-card/80 border border-border/50 hover:border-primary/20 rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden flex flex-col"
                            >
                                {/* Animated Motion Background (Video-like effect) */}
                                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" style={{ backgroundSize: '200% 200%', animation: 'moveGradient 3s ease infinite' }} />

                                {/* Glow Effect */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

                                {/* Header: Icon, Title, Priority */}
                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <div className="flex gap-3 items-start">
                                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 dark:text-blue-400 ring-1 ring-blue-500/20 shadow-sm group-hover:scale-110 transition-transform duration-300">
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-foreground leading-tight line-clamp-1" title={req.title}>{req.title}</h3>
                                            <p className="text-xs font-medium text-muted-foreground mt-1 flex items-center gap-1.5">
                                                {req.departmentName || req.departmentId}
                                                <span className="w-1 h-1 rounded-full bg-border"></span>
                                                {req.category}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={clsx(
                                        "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border shadow-sm",
                                        req.priority === 'High' ? 'bg-red-500/10 text-red-600 dark:text-red-500 border-red-500/20' :
                                            req.priority === 'Medium' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/20' :
                                                'bg-blue-500/10 text-blue-600 dark:text-blue-500 border-blue-500/20'
                                    )}>
                                        {req.priority || 'Medium'}
                                    </span>
                                </div>

                                {/* Status & Contract */}
                                <div className="flex items-center justify-between mb-5 relative z-10">
                                    <div className="flex flex-col gap-1.5">
                                        <span className={clsx("w-fit px-3 py-1 rounded-full text-[11px] font-bold uppercase border shadow-sm animate-in fade-in", getStatusColor(req.status))}>
                                            {req.status}
                                        </span>
                                        {req.approverName && (req.status === 'Approved' || req.status === 'Rejected') && (
                                            <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1 ml-1">
                                                {req.status === 'Rejected' ? <XCircle size={10} className="text-red-500" /> : <Check size={10} className="text-green-500" />}
                                                par {req.approverName.split(' ')[0]}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-xs font-semibold text-foreground/70 bg-secondary/50 px-2 py-1 rounded border border-border/50">
                                        {req.contractType}
                                    </span>
                                </div>

                                {/* Requester & Meta */}
                                <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-xl border border-border/30 mb-5 relative z-10 transition-colors group-hover:bg-secondary/50">
                                    <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center text-[10px] font-bold text-muted-foreground border border-border/50 shadow-sm">
                                        {req.requesterName ? req.requesterName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '??'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-foreground truncate">{req.requesterName || "Inconnu"}</p>
                                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                            <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                                            {req.site && (
                                                <>
                                                    <span className="w-1 h-1 rounded-full bg-border"></span>
                                                    <span>{req.site}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Spacer to push footer down */}
                                <div className="flex-1"></div>

                                {/* Actions Footer */}
                                <div className="flex items-center justify-end gap-2 pt-4 border-t border-border/50 relative z-10 opacity-80 group-hover:opacity-100 transition-opacity">
                                    {/* Quick Approve - HR/Plant Manager */}
                                    {((req.status === 'Pending HR' && user?.role === 'HR_MANAGER') ||
                                        (req.status === 'Pending Director' && user?.role === 'PLANT_MANAGER')) && (
                                            <>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleQuickReject(req); }}
                                                    className="p-2 hover:bg-red-500/10 rounded-lg text-red-600 dark:text-red-500 transition-colors"
                                                    title="Rejeter"
                                                >
                                                    <XCircle size={18} />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleQuickApprove(req); }}
                                                    className="p-2 hover:bg-green-500/10 rounded-lg text-green-600 dark:text-green-500 transition-colors"
                                                    title="Approuver"
                                                >
                                                    <Check size={18} />
                                                </button>
                                                <div className="w-px h-4 bg-border mx-1"></div>
                                            </>
                                        )}

                                    {/* View */}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); openViewModal(req); }}
                                        className="p-2 hover:bg-blue-500/10 rounded-lg text-blue-500 dark:text-blue-400 transition-colors"
                                        title={t('hiringRequest.viewDetails')}
                                    >
                                        <Eye size={18} />
                                    </button>

                                    {/* Print */}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handlePrint(req); }}
                                        className="p-2 hover:bg-secondary rounded-lg text-foreground/70 hover:text-foreground transition-colors"
                                        title="Print Report"
                                    >
                                        <Printer size={18} />
                                    </button>

                                    {/* Edit */}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); openEditModal(req); }}
                                        className="p-2 hover:bg-secondary rounded-lg text-foreground/70 hover:text-foreground transition-colors"
                                        title={t('hiringRequest.editRequest')}
                                    >
                                        <Edit size={18} />
                                    </button>

                                    {/* Add Candidate (Recruiter) - Opens Modal to Assign from List */}
                                    {(user?.role === 'RECRUITMENT_MANAGER' || user?.role === 'HR_MANAGER' || user?.role === 'Recruitment Manager' || user?.role === 'RECRUITER' || user?.role === 'Responsable Recrutement' || user?.role === 'Responsable Recrutement (TTG)') && req.status === 'Approved' && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setRequestToAssign(req);
                                                setIsAssignModalOpen(true);
                                            }}
                                            className="p-2 hover:bg-purple-500/10 rounded-lg text-purple-600 hover:text-purple-700 transition-colors"
                                            title="Assigner un Candidat"
                                        >
                                            <UserPlus size={18} />
                                        </button>
                                    )}

                                    {/* Delete */}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(req.id); }}
                                        className="p-2 hover:bg-red-500/10 rounded-lg text-muted-foreground hover:text-red-500 transition-colors ml-auto"
                                        title={t('common.delete')}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Empty State */}
                    {requests.length === 0 && (
                        <div className="col-span-full py-12 text-center text-muted-foreground bg-secondary/5 rounded-2xl border border-dashed border-border">
                            <p className="text-lg font-medium">{searchTerm ? "No requests found matching your search." : "No hiring requests created yet."}</p>
                            <button onClick={openCreateModal} className="mt-4 text-primary font-bold hover:underline">
                                {t('hiringRequest.newRequest')}
                            </button>
                        </div>
                    )}
                </motion.div>

                {/* Pagination Controls */}
                {pagination.totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-8">
                        <button
                            onClick={() => handlePageChange(pagination.page - 1)}
                            disabled={pagination.page === 1}
                            className="p-2 rounded-xl bg-card border border-border/50 shadow-sm hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronLeft size={20} />
                        </button>

                        <span className="text-sm font-bold text-muted-foreground">
                            Page {pagination.page} sur {pagination.totalPages}
                        </span>

                        <button
                            onClick={() => handlePageChange(pagination.page + 1)}
                            disabled={pagination.page === pagination.totalPages}
                            className="p-2 rounded-xl bg-card border border-border/50 shadow-sm hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
