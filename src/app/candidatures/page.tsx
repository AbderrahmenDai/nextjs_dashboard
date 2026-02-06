"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { useState, useEffect } from "react";
import {
    Plus, MoreVertical, FileText, XCircle, Search, Filter,
    Calendar, Clock, User, ArrowRight, ArrowLeft, CheckCircle, Edit, Trash2, X
} from "lucide-react";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

import { useSearchParams } from "next/navigation";

interface Candidature {
    id?: string;
    // Personal Info
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    birthDate: string; // ISO string
    gender: "MALE" | "FEMALE";
    address: string;

    // Professional Info
    positionAppliedFor: string;
    department: string;
    specialty: string;
    level: string;
    yearsOfExperience: number;
    language: string;

    // Application Info
    source: "WEBSITE" | "LINKEDIN" | "REFERRAL" | "OTHER";
    hiringRequestId?: string | null;
    recruiterComments: string;

    // Extended Info
    educationLevel: string;
    familySituation: string;
    studySpecialty: string;
    currentSalary: number;
    salaryExpectation: number;
    proposedSalary: number;
    noticePeriod: string;
    hrOpinion: string;
    managerOpinion: string;
    recruitmentMode: "EXTERNAL" | "INTERNAL";
    workSite: string;

    cvPath?: string;
    status: string;
    createdAt?: string;
}

const initialFormState: Candidature = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    birthDate: new Date().toISOString().split('T')[0],
    gender: "MALE",
    address: "",
    positionAppliedFor: "",
    department: "",
    specialty: "",
    level: "",
    yearsOfExperience: 0,
    language: "",
    source: "WEBSITE",
    hiringRequestId: null,
    recruiterComments: "",
    educationLevel: "",
    familySituation: "",
    studySpecialty: "",
    currentSalary: 0,
    salaryExpectation: 0,
    proposedSalary: 0,
    noticePeriod: "",
    hrOpinion: "",
    managerOpinion: "",
    recruitmentMode: "EXTERNAL",
    workSite: "",
    status: "En attente"
};

export default function CandidaturesPage() {
    const { t } = useLanguage();
    const [candidatures, setCandidatures] = useState<Candidature[]>([]);
    const [departments, setDepartments] = useState<any[]>([]); // To populate dropdown
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<Candidature>(initialFormState);
    const [cvFile, setCvFile] = useState<File | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const searchParams = useSearchParams();

    const [selectedCandidature, setSelectedCandidature] = useState<Candidature | null>(null);
    const [potentialInterviewers, setPotentialInterviewers] = useState<any[]>([]);
    const [interviewForm, setInterviewForm] = useState({
        date: '',
        time: '',
        interviewerId: '',
        notes: ''
    });

    const loadData = async () => {
        try {
            const [cands, depts] = await Promise.all([
                api.getCandidatures(),
                api.getDepartments()
            ]);
            setCandidatures(cands);
            setDepartments(depts);
        } catch (error) {
            console.error("Failed to load data:", error);
        }
    };

    useEffect(() => {
        const newForRequestId = searchParams.get('newForRequestId');
        if (newForRequestId) {
            setFormData(prev => ({ ...prev, hiringRequestId: newForRequestId }));
            setIsFormOpen(true);
        }
    }, [searchParams]);

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = new FormData();
            // Append all fields
            Object.keys(formData).forEach(key => {
                const value = (formData as any)[key];
                if (value !== null && value !== undefined) {
                    data.append(key, value.toString());
                }
            });

            // Append file if exists
            if (cvFile) {
                data.append('cvFile', cvFile);
            }

            if (formData.id) {
                await api.updateCandidature(formData.id, data);
            } else {
                await api.createCandidature(data);
            }

            await loadData();
            setIsFormOpen(false);
            setCurrentStep(1);
            setFormData(initialFormState);
            setCvFile(null);
        } catch (error) {
            console.error("Failed to save candidature:", error);
            alert("Failed to save candidature. Please check the console.");
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this candidature?")) return;
        try {
            await api.deleteCandidature(id);
            await loadData();
            if (selectedCandidature?.id === id) setSelectedCandidature(null);
        } catch (error) {
            console.error("Failed to delete candidature:", error);
            alert("Failed to delete candidature.");
        }
    }

    const handleEdit = (cand: Candidature, e: React.MouseEvent) => {
        e.stopPropagation();
        setFormData({
            ...initialFormState, // Start with defaults
            ...cand, // Overlay existing data
            birthDate: cand.birthDate ? cand.birthDate.split('T')[0] : "",
            firstName: cand.firstName || "",
            lastName: cand.lastName || "",
            email: cand.email || "",
            phone: cand.phone || "",
            address: cand.address || "",
            positionAppliedFor: cand.positionAppliedFor || "",
            department: cand.department || "",
            specialty: cand.specialty || "",
            level: cand.level || "",
            yearsOfExperience: cand.yearsOfExperience || 0,
            language: cand.language || "",
            recruiterComments: cand.recruiterComments || "",
            educationLevel: cand.educationLevel || "",
            familySituation: cand.familySituation || "",
            studySpecialty: cand.studySpecialty || "",
            currentSalary: cand.currentSalary || 0,
            salaryExpectation: cand.salaryExpectation || 0,
            proposedSalary: cand.proposedSalary || 0,
            noticePeriod: cand.noticePeriod || "",
            hrOpinion: cand.hrOpinion || "",
            managerOpinion: cand.managerOpinion || "",
            workSite: cand.workSite || "",
            cvPath: cand.cvPath || "",
            // Ensure enums or selects are valid or default strings, not null
            source: cand.source || "WEBSITE",
            recruitmentMode: cand.recruitmentMode || "EXTERNAL",
            gender: cand.gender || "MALE",
        });
        setCurrentStep(1);
        setIsFormOpen(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value
        }));
    };

    const openDetails = async (cand: Candidature) => {
        setSelectedCandidature(cand);
        // Find users in the same department to be interviewers
        try {
            // We need a way to get users by dept. For now, let's just get ALL users and filter client-side 
            // since we don't have a specific endpoint for it yet, or we can assume getAllUsers returns everyone.
            const users = await api.getUsers();
            console.log(users);
            const deptUsers = users.filter((u: any) => u.dept === cand.department || u.role === 'Direction' || u.role === 'Responsable RH' || u.role === "HR_MANAGER" || u.role === "RECRUITER" || u.role === "DIRECTOR");
            console.log(deptUsers);
            setPotentialInterviewers(deptUsers);
        } catch (error) {
            console.error("Failed to load interviewers", error);
        }
    };

    const handleScheduleInterview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCandidature?.id) return;

        try {
            await api.createInterview({
                candidatureId: selectedCandidature.id,
                interviewerId: interviewForm.interviewerId,
                date: `${interviewForm.date}T${interviewForm.time}:00`,
                mode: 'Face-to-Face',
                notes: interviewForm.notes
            });
            alert("Interview Scheduled Successfully!");
            setInterviewForm({ date: '', time: '', interviewerId: '', notes: '' });
            loadData(); // Reload to update status potentially
        } catch (error) {
            console.error("Failed to schedule interview:", error);
            alert("Failed to schedule interview.");
        }
    };

    // --- Filtering & Pagination Logic ---
    const filteredCandidatures = candidatures.filter(cand => {
        const matchesSearch =
            cand.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cand.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cand.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cand.positionAppliedFor.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDept = departmentFilter ? cand.department === departmentFilter : true;
        const matchesStatus = statusFilter ? cand.status === statusFilter : true;
        return matchesSearch && matchesDept && matchesStatus;
    });

    const totalPages = Math.ceil(filteredCandidatures.length / itemsPerPage);
    const paginatedCandidatures = filteredCandidatures.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <DashboardLayout>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">{t('candidature.title')}</h1>
                    <p className="text-muted-foreground mt-1">{t('candidature.subtitle')}</p>
                </div>
                <button
                    onClick={() => {
                        setFormData(initialFormState);
                        setCurrentStep(1);
                        setIsFormOpen(true);
                    }}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-xl flex items-center gap-2 transition-colors font-medium shadow-lg shadow-primary/20"
                >
                    <Plus size={20} />
                    {t('common.newApplication')}
                </button>
            </div>

            {/* --- Filters & Search --- */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="relative col-span-1 md:col-span-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <input
                        type="text"
                        placeholder={t('common.search')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-card/50 border border-border rounded-xl pl-10 pr-4 py-2 text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all shadow-sm"
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <div className="relative col-span-1 md:col-span-1">
                        <select
                            value={departmentFilter}
                            onChange={(e) => setDepartmentFilter(e.target.value)}
                            className="w-full bg-card/50 border border-border rounded-xl px-4 py-2 text-foreground appearance-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all shadow-sm"
                        >
                            <option value="">{t('candidature.filters.allDepartments')}</option>
                            {['RH', 'Production', 'Méthode & Indus', 'Finance', 'Splay chaine', 'Maintenance', 'HSE', 'Qualité', 'Achat'].map((dept) => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                            {departments.map((dept: any) => (
                                !['RH', 'Production', 'Méthode & Indus', 'Finance', 'Splay chaine', 'Maintenance', 'HSE', 'Qualité', 'Achat'].includes(dept.name) && (
                                    <option key={dept.id} value={dept.name}>{dept.name}</option>
                                )
                            ))}
                        </select>
                    </div>
                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full bg-card/50 border border-border rounded-xl px-4 py-2 text-foreground appearance-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all shadow-sm"
                        >
                            <option value="">{t('candidature.filters.allStatuses')}</option>
                            <option value="">{t('candidature.filters.allStatuses')}</option>
                            <option value="En cours">En cours</option>
                            <option value="Embauché">Embauché</option>
                            <option value="Refus du candidat">Refus du candidat</option>
                            <option value="Non embauché">Non embauché</option>
                            <option value="Prioritaire">Prioritaire</option>
                            <option value="En attente">En attente</option>
                        </select>
                    </div>
                </div>
            </div>


            {/* --- List View (Cards) --- */}
            <div className="flex flex-col gap-3 relative z-10">
                {paginatedCandidatures.length === 0 ? (
                    <div className="p-12 bg-card rounded-xl border border-border text-center">
                        <div className="text-muted-foreground text-lg">
                            {t('candidature.noResults')}
                        </div>
                        <p className="text-sm text-muted-foreground/70 mt-2">
                            Try adjusting your search or filters
                        </p>
                    </div>
                ) : (
                    paginatedCandidatures.map((cand, idx) => (
                        <motion.div
                            key={cand.id || idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-card rounded-xl border border-border hover:border-primary/50 transition-all shadow-sm hover:shadow-lg hover:shadow-primary/10 p-5 cursor-pointer group"
                            onClick={() => openDetails(cand)}
                        >
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                {/* Left: Candidate Info */}
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/20">
                                            <span className="text-lg font-bold text-primary">
                                                {cand.firstName[0]}{cand.lastName[0]}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                                                {cand.firstName} {cand.lastName}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                {cand.email}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Middle: Position & Department */}
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <User size={16} className="text-muted-foreground" />
                                        <span className="text-sm font-medium text-foreground">
                                            {cand.positionAppliedFor}
                                        </span>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        📍 {cand.department}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {cand.yearsOfExperience} years exp. • {cand.source}
                                    </div>
                                </div>

                                {/* Right: Status & Actions */}
                                <div className="flex items-center gap-4">
                                    <div className="text-right space-y-1">
                                        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${cand.status === 'Embauché'
                                            ? 'bg-green-500/10 text-green-600 border border-green-500/20'
                                            : cand.status === 'En cours'
                                                ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                                                : cand.status === 'Prioritaire'
                                                    ? 'bg-orange-500/10 text-orange-600 border border-orange-500/20'
                                                    : cand.status === 'Non embauché' || cand.status === 'Refus du candidat'
                                                        ? 'bg-red-500/10 text-red-600 border border-red-500/20'
                                                        : 'bg-gray-500/10 text-gray-600 border border-gray-500/20'
                                            }`}>
                                            {cand.status}
                                        </div>
                                        {cand.createdAt && (
                                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Calendar size={12} />
                                                {new Date(cand.createdAt).toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            className="p-2 rounded-lg hover:bg-orange-500/10 hover:text-orange-600 transition-colors"
                                            onClick={(e) => handleEdit(cand, e)}
                                            title="Edit"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            className="p-2 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
                                            onClick={(e) => handleDelete(cand.id!, e)}
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                        <button
                                            className="p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openDetails(cand);
                                            }}
                                            title="View Details"
                                        >
                                            <MoreVertical size={20} className="text-muted-foreground" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* --- Pagination --- */}
            <div className="px-6 py-4 border-t border-border/50 flex justify-between items-center bg-muted/20">
                <div className="text-sm text-muted-foreground">
                    {t('candidature.showing')} <span className="text-foreground font-medium">{Math.min((currentPage - 1) * itemsPerPage + 1, filteredCandidatures.length)}</span> {t('candidature.to')} <span className="text-foreground font-medium">{Math.min(currentPage * itemsPerPage, filteredCandidatures.length)}</span> {t('candidature.of')} <span className="text-foreground font-medium">{filteredCandidatures.length}</span> {t('candidature.results')}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                    >
                        Previous
                    </button>
                    <div className="flex gap-1">
                        {Array.from({ length: totalPages }).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${currentPage === i + 1
                                    ? 'bg-primary text-primary-foreground shadow-md'
                                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                    >
                        Next
                    </button>
                </div>
            </div>


            {/* --- Details & Interview Modal --- */}
            {
                selectedCandidature && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
                        <div className="modal-card w-full max-w-4xl shadow-2xl max-h-[80vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
                            <div className="px-6 py-5 gradient-premium flex justify-between items-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]"></div>
                                <div className="relative z-10">
                                    <h2 className="text-2xl font-bold text-white mb-1 tracking-tight">
                                        {selectedCandidature.firstName} {selectedCandidature.lastName}
                                    </h2>
                                    <p className="text-white/80 text-sm flex items-center gap-2 font-medium">
                                        <span className="px-2 py-0.5 rounded bg-white/20 text-white border border-white/30 text-xs font-bold uppercase backdrop-blur-sm shadow-inner">{selectedCandidature.status}</span>
                                        • {selectedCandidature.positionAppliedFor} • {selectedCandidature.department}
                                    </p>
                                </div>
                                <button onClick={() => setSelectedCandidature(null)} className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all relative z-10">
                                    <X size={28} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 lg:grid-cols-3 gap-6 custom-scrollbar">
                                {/* Left Column: Details */}
                                <div className="lg:col-span-2 space-y-6">
                                    <section className="space-y-3">
                                        <h3 className="text-sm font-bold text-primary uppercase tracking-wider border-b border-border pb-2">{t('candidature.profileOverview')}</h3>
                                        <div className="grid grid-cols-2 gap-4 text-sm text-foreground">
                                            <div><span className="text-muted-foreground block text-xs uppercase font-semibold mb-0.5">{t('candidature.email')}</span> {selectedCandidature.email}</div>
                                            <div><span className="text-muted-foreground block text-xs uppercase font-semibold mb-0.5">{t('candidature.phone')}</span> {selectedCandidature.phone || "N/A"}</div>
                                            <div><span className="text-muted-foreground block text-xs uppercase font-semibold mb-0.5">{t('candidature.address')}</span> {selectedCandidature.address || "N/A"}</div>
                                            <div><span className="text-muted-foreground block text-xs uppercase font-semibold mb-0.5">{t('candidature.experience')}</span> {selectedCandidature.yearsOfExperience} Years</div>
                                            <div><span className="text-muted-foreground block text-xs uppercase font-semibold mb-0.5">{t('candidature.education')}</span> {selectedCandidature.educationLevel || "N/A"}</div>
                                            <div><span className="text-muted-foreground block text-xs uppercase font-semibold mb-0.5">{t('candidature.specialty')}</span> {selectedCandidature.specialty || "N/A"}</div>
                                        </div>
                                    </section>

                                    <section className="space-y-3">
                                        <h3 className="text-sm font-bold text-primary uppercase tracking-wider border-b border-border pb-2">{t('candidature.salaryExpectations')}</h3>
                                        <div className="grid grid-cols-3 gap-4 text-sm">
                                            <div className="bg-secondary/30 p-3 rounded-lg border border-border/50">
                                                <span className="text-muted-foreground block mb-1 text-xs uppercase font-bold">{t('candidature.currentSalary')}</span>
                                                <span className="text-xl font-bold text-foreground">{selectedCandidature.currentSalary?.toLocaleString()} TND</span>
                                            </div>
                                            <div className="bg-secondary/30 p-3 rounded-lg border border-border/50">
                                                <span className="text-muted-foreground block mb-1 text-xs uppercase font-bold">{t('candidature.expectedSalary')}</span>
                                                <span className="text-xl font-bold text-blue-500">{selectedCandidature.salaryExpectation?.toLocaleString()} TND</span>
                                            </div>
                                            <div className="bg-secondary/30 p-3 rounded-lg border border-border/50">
                                                <span className="text-muted-foreground block mb-1 text-xs uppercase font-bold">{t('candidature.proposedSalary')}</span>
                                                <span className="text-xl font-bold text-green-500">{selectedCandidature.proposedSalary?.toLocaleString()} TND</span>
                                            </div>
                                        </div>
                                    </section>

                                    <section className="space-y-3">
                                        <h3 className="text-sm font-bold text-primary uppercase tracking-wider border-b border-border pb-2">{t('candidature.evaluations')}</h3>
                                        <div className="space-y-3">
                                            <div className="bg-secondary/20 p-4 rounded-lg border-l-4 border-purple-500">
                                                <span className="text-purple-500 font-bold block mb-1 text-xs uppercase">{t('candidature.hrOpinion')}</span>
                                                <p className="text-foreground text-sm leading-relaxed">{selectedCandidature.hrOpinion || "No remarks."}</p>
                                            </div>
                                            <div className="bg-secondary/20 p-4 rounded-lg border-l-4 border-cyan-500">
                                                <span className="text-cyan-500 font-bold block mb-1 text-xs uppercase">{t('candidature.managerOpinion')}</span>
                                                <p className="text-foreground text-sm leading-relaxed">{selectedCandidature.managerOpinion || "No remarks."}</p>
                                            </div>
                                            {selectedCandidature.recruiterComments && (
                                                <div className="bg-secondary/20 p-4 rounded-lg border-l-4 border-primary/40">
                                                    <span className="text-muted-foreground font-bold block mb-1 text-xs uppercase">{t('candidature.recruiterComments')}</span>
                                                    <p className="text-foreground text-sm leading-relaxed">{selectedCandidature.recruiterComments}</p>
                                                </div>
                                            )}
                                        </div>
                                    </section>
                                </div>

                                {/* Right Column: Actions & Interview */}
                                <div className="space-y-6">
                                    <div className="bg-card p-5 rounded-xl border border-border shadow-lg">
                                        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                                            <Calendar className="text-primary" size={20} />
                                            {t('candidature.planInterview')}
                                        </h3>
                                        <form onSubmit={handleScheduleInterview} className="space-y-4">
                                            <div>
                                                <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">{t('candidature.interviewer')} (Manager)</label>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                                                    <select
                                                        required
                                                        value={interviewForm.interviewerId}
                                                        onChange={e => setInterviewForm({ ...interviewForm, interviewerId: e.target.value })}
                                                        className="w-full bg-secondary/50 border border-border rounded-lg pl-10 pr-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary/50 appearance-none"
                                                    >
                                                        <option value="">{t('candidature.interviewer')}</option>
                                                        {potentialInterviewers.map(u => (
                                                            <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">{t('candidature.date')}</label>
                                                    <input
                                                        type="date"
                                                        required
                                                        value={interviewForm.date}
                                                        onChange={e => setInterviewForm({ ...interviewForm, date: e.target.value })}
                                                        className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary/50"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">{t('candidature.time')}</label>
                                                    <input
                                                        type="time"
                                                        required
                                                        value={interviewForm.time}
                                                        onChange={e => setInterviewForm({ ...interviewForm, time: e.target.value })}
                                                        className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary/50"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">{t('candidature.notes')}</label>
                                                <textarea
                                                    rows={2}
                                                    value={interviewForm.notes}
                                                    onChange={e => setInterviewForm({ ...interviewForm, notes: e.target.value })}
                                                    className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary/50"
                                                    placeholder="e.g. Technical assessment..."
                                                />
                                            </div>
                                            <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2.5 rounded-lg transition-all shadow-lg shadow-primary/20 flex justify-center items-center gap-2">
                                                <Clock size={18} />
                                                {t('candidature.scheduleNow')}
                                            </button>
                                        </form>
                                    </div>

                                    <div className="bg-secondary/20 p-5 rounded-xl border border-border">
                                        <h3 className="text-sm font-bold text-muted-foreground uppercase mb-3">{t('candidature.quickActions')}</h3>
                                        <div className="space-y-2">
                                            <button className="w-full py-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/20 text-sm font-medium transition-colors">{t('candidature.markHired')}</button>
                                            <button
                                                onClick={async () => {
                                                    if (!selectedCandidature?.id) return;
                                                    if (!confirm("Voulez-vous vraiment rejeter ce candidat ? Un email sera envoyé.")) return;
                                                    try {
                                                        await api.updateCandidature(selectedCandidature.id, { status: 'Refus du candidat' });
                                                        // Update local state and reload
                                                        setSelectedCandidature(prev => prev ? ({ ...prev, status: 'Refus du candidat' }) : null);
                                                        loadData();
                                                        alert("Candidat rejeté et email envoyé.");
                                                    } catch (err) {
                                                        console.error(err);
                                                        alert("Erreur lors du rejet.");
                                                    }
                                                }}
                                                className="w-full py-2 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/20 text-sm font-medium transition-colors"
                                            >
                                                {t('candidature.reject')}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (selectedCandidature?.cvPath) {
                                                        const cleanPath = selectedCandidature.cvPath.replace(/\\/g, '/');
                                                        const url = `http://localhost:8080/${cleanPath}`;

                                                        // Helper to force download
                                                        fetch(url)
                                                            .then(response => response.blob())
                                                            .then(blob => {
                                                                const link = document.createElement('a');
                                                                link.href = window.URL.createObjectURL(blob);
                                                                // Infer filename from path
                                                                const filename = cleanPath.split('/').pop() || 'cv.pdf';
                                                                link.download = filename;
                                                                document.body.appendChild(link);
                                                                link.click();
                                                                document.body.removeChild(link);
                                                            })
                                                            .catch(err => {
                                                                console.error("Download failed, fallback to open", err);
                                                                window.open(url, '_blank');
                                                            });
                                                    } else {
                                                        alert("No CV available");
                                                    }
                                                }}
                                                className="w-full py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground border border-border text-sm font-medium transition-colors"
                                            >
                                                {t('candidature.downloadCV')}
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    if (selectedCandidature) {
                                                        handleEdit(selectedCandidature, e);
                                                        setSelectedCandidature(null);
                                                    }
                                                }}
                                                className="w-full py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-sm font-medium transition-colors"
                                            >
                                                Edit Candidature
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* --- Create Modal --- */}
            {
                isFormOpen && (

                    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 bg-black/60 backdrop-blur-sm">
                        <div className="modal-card w-full max-w-4xl p-0 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
                            {/* Modal Header */}
                            <div className="px-6 py-6 gradient-premium flex justify-between items-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]"></div>
                                <h2 className="text-2xl font-bold text-white flex items-center gap-3 relative z-10 tracking-tight">
                                    <div className="p-2 bg-white/20 rounded-xl shadow-inner">
                                        <FileText className="text-white" size={24} />
                                    </div>
                                    {t('common.newApplication')}
                                </h2>
                                <button onClick={() => setIsFormOpen(false)} className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all relative z-10">
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Stepper Indicator */}
                            <div className="px-6 py-4 border-b border-border bg-card/50">
                                <div className="flex items-center justify-center">
                                    <div className="flex items-center w-full max-w-2xl">
                                        {/* Step 1 */}
                                        <div className="flex flex-col items-center relative z-10 group">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${currentStep >= 1 ? 'bg-primary text-primary-foreground scale-110 shadow-lg shadow-primary/20' : 'bg-secondary text-muted-foreground'}`}>
                                                {currentStep > 1 ? <CheckCircle size={18} /> : 1}
                                            </div>
                                            <div className={`text-xs font-bold mt-2 uppercase tracking-wide transition-colors ${currentStep >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
                                                {t('candidature.personalInfo')}
                                            </div>
                                        </div>

                                        {/* Connector 1-2 */}
                                        <div className={`flex-1 h-1 mx-2 rounded-full transition-all duration-500 ${currentStep >= 2 ? 'bg-primary' : 'bg-secondary'}`} />

                                        {/* Step 2 */}
                                        <div className="flex flex-col items-center relative z-10 group">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${currentStep >= 2 ? 'bg-primary text-primary-foreground scale-110 shadow-lg shadow-primary/20' : 'bg-secondary text-muted-foreground'}`}>
                                                {currentStep > 2 ? <CheckCircle size={18} /> : 2}
                                            </div>
                                            <div className={`text-xs font-bold mt-2 uppercase tracking-wide transition-colors ${currentStep >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
                                                {t('candidature.professionalInfo')}
                                            </div>
                                        </div>

                                        {/* Connector 2-3 */}
                                        <div className={`flex-1 h-1 mx-2 rounded-full transition-all duration-500 ${currentStep >= 3 ? 'bg-primary' : 'bg-secondary'}`} />

                                        {/* Step 3 */}
                                        <div className="flex flex-col items-center relative z-10 group">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${currentStep >= 3 ? 'bg-primary text-primary-foreground scale-110 shadow-lg shadow-primary/20' : 'bg-secondary text-muted-foreground'}`}>
                                                3
                                            </div>
                                            <div className={`text-xs font-bold mt-2 uppercase tracking-wide transition-colors ${currentStep >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
                                                {t('candidature.evaluations')}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Body - Scrollable */}
                            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                                <form id="create-form" onSubmit={handleSave} className="space-y-6">

                                    {/* Step 1: Personal Info */}
                                    {currentStep === 1 && (
                                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-semibold text-foreground/80">{t('candidature.firstName')} <span className="text-destructive">*</span></label>
                                                    <input required name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary/30 transition-all outline-none" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-semibold text-foreground/80">{t('candidature.lastName')} <span className="text-destructive">*</span></label>
                                                    <input required name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary/30 transition-all outline-none" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-semibold text-foreground/80">{t('candidature.birthDate')}</label>
                                                    <input type="date" name="birthDate" value={formData.birthDate} onChange={handleInputChange} className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary/30 transition-all outline-none" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-semibold text-foreground/80">{t('common.email')} <span className="text-destructive">*</span></label>
                                                    <input type="email" required name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary/30 transition-all outline-none" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-semibold text-foreground/80">{t('common.phone')}</label>
                                                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary/30 transition-all outline-none" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-semibold text-foreground/80">{t('common.gender')}</label>
                                                    <div className="relative">
                                                        <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary/30 transition-all outline-none appearance-none">
                                                            <option value="MALE">Homme</option>
                                                            <option value="FEMALE">Femme</option>
                                                        </select>
                                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                                                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-semibold text-foreground/80">Situation familiale</label>
                                                    <div className="relative">
                                                        <select name="familySituation" value={formData.familySituation} onChange={handleInputChange} className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary/30 transition-all outline-none appearance-none">
                                                            <option value="">Sélectionner</option>
                                                            <option value="Célibataire">Célibataire</option>
                                                            <option value="Marié">Marié</option>
                                                        </select>
                                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                                                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-span-1 md:col-span-2 space-y-1.5">
                                                    <label className="text-sm font-semibold text-foreground/80">{t('common.address')}</label>
                                                    <input name="address" value={formData.address} onChange={handleInputChange} className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary/30 transition-all outline-none" />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 2: Professional Info */}
                                    {currentStep === 2 && (
                                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-semibold text-foreground/80">{t('candidature.position')} <span className="text-destructive">*</span></label>
                                                    <input required name="positionAppliedFor" value={formData.positionAppliedFor} onChange={handleInputChange} className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary/30 transition-all outline-none" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-semibold text-foreground/80">{t('common.department')}</label>
                                                    <div className="relative">
                                                        <select name="department" value={formData.department} onChange={handleInputChange} className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary/30 transition-all outline-none appearance-none">
                                                            <option value="">{t('common.department')}</option>
                                                            {departments.map((dept: any) => (
                                                                <option key={dept.id} value={dept.name}>{dept.name}</option>
                                                            ))}
                                                        </select>
                                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                                                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-semibold text-foreground/80">Site de travail</label>
                                                    <div className="relative">
                                                        <select name="workSite" value={formData.workSite} onChange={handleInputChange} className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary/30 transition-all outline-none appearance-none">
                                                            <option value="">Sélectionner</option>
                                                            <option value="TT">TT</option>
                                                            <option value="TTG">TTG</option>
                                                        </select>
                                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                                                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-semibold text-foreground/80">Spécialité</label>
                                                    <input name="specialty" value={formData.specialty} onChange={handleInputChange} className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary/30 transition-all outline-none" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-semibold text-foreground/80">{t('candidature.experience')}</label>
                                                    <input type="number" name="yearsOfExperience" value={formData.yearsOfExperience} onChange={handleInputChange} className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary/30 transition-all outline-none" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-semibold text-foreground/80">Niveau d&apos;études</label>
                                                    <div className="relative">
                                                        <select name="educationLevel" value={formData.educationLevel} onChange={handleInputChange} className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary/30 transition-all outline-none appearance-none">
                                                            <option value="">Sélectionner</option>
                                                            <option value="Bac/ BTP">Bac/ BTP</option>
                                                            <option value="Bac+2 / BTS">Bac+2 / BTS</option>
                                                            <option value="Bac+3">Bac+3</option>
                                                            <option value="Bac+4">Bac+4</option>
                                                            <option value="Bac+5 / Ingénieur">Bac+5 / Ingénieur</option>
                                                            <option value="Doctorat">Doctorat</option>
                                                        </select>
                                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                                                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-semibold text-foreground/80">{t('candidature.source')}</label>
                                                    <div className="relative">
                                                        <select name="source" value={formData.source} onChange={handleInputChange} className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary/30 transition-all outline-none appearance-none">
                                                            <option value="WEBSITE">Site Web</option>
                                                            <option value="LINKEDIN">LinkedIn</option>
                                                            <option value="REFERRAL">Cooptation</option>
                                                            <option value="OTHER">Autre</option>
                                                        </select>
                                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                                                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-semibold text-foreground/80">Mode de recrutement</label>
                                                    <div className="relative">
                                                        <select name="recruitmentMode" value={formData.recruitmentMode} onChange={handleInputChange} className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary/30 transition-all outline-none appearance-none">
                                                            <option value="EXTERNAL">Externe</option>
                                                            <option value="INTERNAL">Interne</option>
                                                        </select>
                                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                                                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 3: Evaluations & Offer */}
                                    {currentStep === 3 && (
                                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-semibold text-foreground/80">{t('candidature.currentSalary')}</label>
                                                    <div className="relative">
                                                        <input type="number" name="currentSalary" value={formData.currentSalary} onChange={handleInputChange} className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary/30 transition-all outline-none pr-8" />
                                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-xs">TND</span>
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-semibold text-foreground/80">{t('candidature.expectedSalary')}</label>
                                                    <div className="relative">
                                                        <input type="number" name="salaryExpectation" value={formData.salaryExpectation} onChange={handleInputChange} className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary/30 transition-all outline-none pr-8" />
                                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-xs">TND</span>
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-semibold text-foreground/80">{t('candidature.proposedSalary')}</label>
                                                    <div className="relative">
                                                        <input type="number" name="proposedSalary" value={formData.proposedSalary} onChange={handleInputChange} className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary/30 transition-all outline-none pr-8" />
                                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-xs">TND</span>
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-semibold text-foreground/80">Préavis</label>
                                                    <input name="noticePeriod" value={formData.noticePeriod} onChange={handleInputChange} className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary/30 transition-all outline-none" />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-semibold text-foreground/80">{t('candidature.recruiterComments')}</label>
                                                    <div className="relative">
                                                        <select name="recruiterComments" value={formData.recruiterComments} onChange={handleInputChange} className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary/30 transition-all outline-none appearance-none">
                                                            <option value="">Sélectionner</option>
                                                            <option value="Favorable">Favorable</option>
                                                            <option value="Defavorable">Défavorable</option>
                                                            <option value="Prioritaire">Prioritaire</option>
                                                            <option value="Passable">Passable</option>
                                                        </select>
                                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                                                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-semibold text-foreground/80">{t('candidature.hrOpinion')}</label>
                                                    <div className="relative">
                                                        <select name="hrOpinion" value={formData.hrOpinion} onChange={handleInputChange} className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary/30 transition-all outline-none appearance-none">
                                                            <option value="">Sélectionner</option>
                                                            <option value="Favorable">Favorable</option>
                                                            <option value="Defavorable">Défavorable</option>
                                                            <option value="Prioritaire">Prioritaire</option>
                                                            <option value="Passable">Passable</option>
                                                        </select>
                                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                                                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-semibold text-foreground/80">{t('candidature.managerOpinion')}</label>
                                                    <div className="relative">
                                                        <select name="managerOpinion" value={formData.managerOpinion} onChange={handleInputChange} className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary/30 transition-all outline-none appearance-none">
                                                            <option value="">Sélectionner</option>
                                                            <option value="Favorable">Favorable</option>
                                                            <option value="Defavorable">Défavorable</option>
                                                            <option value="Prioritaire">Prioritaire</option>
                                                            <option value="Passable">Passable</option>
                                                        </select>
                                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                                                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* CV Upload Section */}
                                            <div className="mt-6 border-t border-border pt-4">
                                                <h3 className="text-sm font-semibold text-primary mb-3">CV</h3>
                                                <div className="flex items-center gap-4 p-4 rounded-xl border border-dashed border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors group cursor-pointer relative">
                                                    <div className="p-3 rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                                                        <FileText size={24} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-semibold text-foreground">
                                                            {cvFile ? cvFile.name : (formData.cvPath ? `CV actuel : ${formData.cvPath.split(/[/\\]/).pop()} (Cliquer pour remplacer)` : "Cliquez pour télécharger ou glissez et déposez")}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground mt-0.5">
                                                            {formData.cvPath && !cvFile && (
                                                                <a
                                                                    href={`http://localhost:8080/${formData.cvPath.replace(/\\/g, '/')}`}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        e.preventDefault();
                                                                        // Force download logic
                                                                        const url = `http://localhost:8080/${formData.cvPath.replace(/\\/g, '/')}`;
                                                                        fetch(url)
                                                                            .then(response => response.blob())
                                                                            .then(blob => {
                                                                                const link = document.createElement('a');
                                                                                link.href = window.URL.createObjectURL(blob);
                                                                                const filename = formData.cvPath.split(/[/\\]/).pop() || 'cv.pdf';
                                                                                link.download = filename;
                                                                                document.body.appendChild(link);
                                                                                link.click();
                                                                                document.body.removeChild(link);
                                                                            })
                                                                            .catch(() => window.open(url, '_blank'));
                                                                    }}
                                                                    className="text-primary hover:underline mr-2 relative z-20"
                                                                >
                                                                    Voir CV actuel
                                                                </a>
                                                            )}
                                                            PDF, DOC, DOCX jusqu&apos;à 10MB
                                                        </p>
                                                        <input
                                                            type="file"
                                                            accept=".pdf,.doc,.docx"
                                                            onChange={(e) => setCvFile(e.target.files ? e.target.files[0] : null)}
                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                        />
                                                    </div>
                                                    {(cvFile || formData.cvPath) && (
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                setCvFile(null);
                                                            }}
                                                            className="p-1 hover:bg-destructive/10 text-destructive rounded-full relative z-20"
                                                            title={cvFile ? "Supprimer le fichier sélectionné" : "Garder le fichier actuel"}
                                                        >
                                                            {cvFile ? <XCircle size={18} /> : null}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </form>
                            </div>

                            {/* Modal Footer (Navigation) */}
                            <div className="px-6 py-4 border-t border-border bg-muted/30 flex justify-between items-center">
                                <div>
                                    {currentStep > 1 ? (
                                        <button
                                            type="button"
                                            onClick={() => setCurrentStep(currentStep - 1)}
                                            className="px-4 py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-medium transition-colors flex items-center gap-2"
                                        >
                                            <ArrowLeft size={18} />
                                            Back
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => setIsFormOpen(false)}
                                            className="px-4 py-2.5 rounded-xl text-muted-foreground hover:text-foreground font-medium transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>

                                <div>
                                    {currentStep < 3 ? (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                const form = document.querySelector('#create-form') as HTMLFormElement;
                                                if (form.checkValidity()) {
                                                    setCurrentStep(currentStep + 1);
                                                } else {
                                                    form.reportValidity();
                                                }
                                            }}
                                            className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-colors shadow-lg shadow-primary/20 flex items-center gap-2"
                                        >
                                            Next
                                            <ArrowRight size={18} />
                                        </button>
                                    ) : (
                                        <button
                                            form="create-form"
                                            type="submit"
                                            className="px-6 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium transition-colors shadow-lg shadow-green-600/20 flex items-center gap-2"
                                        >
                                            <CheckCircle size={18} />
                                            {t('common.save')}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </DashboardLayout>
    );
}
