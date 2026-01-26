"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { useState, useEffect } from "react";
import {
    Plus, MoreVertical, FileText, XCircle, Search, Filter,
    Calendar, Clock, User
} from "lucide-react";
import { api } from "@/lib/api";
import { AnimatePresence, motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

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
    hiringRequestId?: number | null;
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
    const [formData, setFormData] = useState<Candidature>(initialFormState);
    const [cvFile, setCvFile] = useState<File | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

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
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
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

            await api.createCandidature(data);
            await loadData();
            setIsFormOpen(false);
            setFormData(initialFormState);
            setCvFile(null);
        } catch (error) {
            console.error("Failed to create candidature:", error);
            alert("Failed to create candidature. Please check the console.");
        }
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
                    onClick={() => setIsFormOpen(true)}
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
                                    <button
                                        className="p-2 rounded-lg hover:bg-secondary/50 transition-colors opacity-0 group-hover:opacity-100"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openDetails(cand);
                                        }}
                                    >
                                        <MoreVertical size={20} className="text-muted-foreground" />
                                    </button>
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
                    <div className="fixed inset-0 z-50 flex items-start pt-20 justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <div className="bg-card border border-border rounded-2xl w-full max-w-5xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
                            <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-muted/30">
                                <div>
                                    <h2 className="text-2xl font-bold text-foreground mb-1">
                                        {selectedCandidature.firstName} {selectedCandidature.lastName}
                                    </h2>
                                    <p className="text-muted-foreground text-sm flex items-center gap-2">
                                        <span className="px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 text-xs font-bold uppercase">{selectedCandidature.status}</span>
                                        • {selectedCandidature.positionAppliedFor} • {selectedCandidature.department}
                                    </p>
                                </div>
                                <button onClick={() => setSelectedCandidature(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                                    <XCircle size={28} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 custom-scrollbar">
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
                                                <span className="text-xl font-bold text-foreground">{selectedCandidature.currentSalary?.toLocaleString()} €</span>
                                            </div>
                                            <div className="bg-secondary/30 p-3 rounded-lg border border-border/50">
                                                <span className="text-muted-foreground block mb-1 text-xs uppercase font-bold">{t('candidature.expectedSalary')}</span>
                                                <span className="text-xl font-bold text-blue-500">{selectedCandidature.salaryExpectation?.toLocaleString()} €</span>
                                            </div>
                                            <div className="bg-secondary/30 p-3 rounded-lg border border-border/50">
                                                <span className="text-muted-foreground block mb-1 text-xs uppercase font-bold">{t('candidature.proposedSalary')}</span>
                                                <span className="text-xl font-bold text-green-500">{selectedCandidature.proposedSalary?.toLocaleString()} €</span>
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
                                            <button className="w-full py-2 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/20 text-sm font-medium transition-colors">{t('candidature.reject')}</button>
                                            <button className="w-full py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground border border-border text-sm font-medium transition-colors">{t('candidature.downloadCV')}</button>
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

                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <div className="bg-card border border-border rounded-2xl w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
                            {/* Modal Header */}
                            <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-muted/30">
                                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                    <FileText className="text-primary" size={24} />
                                    {t('common.newApplication')}
                                </h2>
                                <button onClick={() => setIsFormOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                                    <XCircle size={24} />
                                </button>
                            </div>

                            {/* Modal Body - Scrollable */}
                            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                                <form id="create-form" onSubmit={handleCreate} className="space-y-8">

                                    {/* Section 1: Personal Info */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-primary mb-4 border-b border-primary/20 pb-2">{t('candidature.personalInfo')}</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium text-muted-foreground">{t('candidature.firstName')}</label>
                                                <input required name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-primary/50" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium text-muted-foreground">{t('candidature.lastName')}</label>
                                                <input required name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-primary/50" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium text-muted-foreground">{t('candidature.birthDate')}</label>
                                                <input type="date" name="birthDate" value={formData.birthDate} onChange={handleInputChange} className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-primary/50" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium text-muted-foreground">{t('common.email')}</label>
                                                <input type="email" required name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-primary/50" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium text-muted-foreground">{t('common.phone')}</label>
                                                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-primary/50" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium text-muted-foreground">{t('common.gender')}</label>
                                                <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-primary/50">
                                                    <option value="MALE">Male</option>
                                                    <option value="FEMALE">Female</option>
                                                </select>
                                            </div>
                                            <div className="col-span-1 md:col-span-3 space-y-1">
                                                <label className="text-sm font-medium text-muted-foreground">{t('common.address')}</label>
                                                <input name="address" value={formData.address} onChange={handleInputChange} className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-primary/50" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 2: Professional Info */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-primary mb-4 border-b border-primary/20 pb-2">{t('candidature.professionalInfo')}</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium text-muted-foreground">{t('candidature.position')}</label>
                                                <input required name="positionAppliedFor" value={formData.positionAppliedFor} onChange={handleInputChange} className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-primary/50" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium text-muted-foreground">{t('common.department')}</label>
                                                <select name="department" value={formData.department} onChange={handleInputChange} className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-primary/50">
                                                    <option value="">{t('common.department')}</option>
                                                    {departments.map((dept: any) => (
                                                        <option key={dept.id} value={dept.name}>{dept.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium text-muted-foreground">Work Site</label>
                                                <input name="workSite" value={formData.workSite} onChange={handleInputChange} className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-primary/50" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium text-muted-foreground">Specialty</label>
                                                <input name="specialty" value={formData.specialty} onChange={handleInputChange} className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-primary/50" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium text-muted-foreground">Level</label>
                                                <input name="level" value={formData.level} onChange={handleInputChange} className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-primary/50" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium text-muted-foreground">{t('candidature.experience')}</label>
                                                <input type="number" name="yearsOfExperience" value={formData.yearsOfExperience} onChange={handleInputChange} className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-primary/50" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium text-muted-foreground">Languages</label>
                                                <input name="language" value={formData.language} onChange={handleInputChange} className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-primary/50" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium text-muted-foreground">{t('candidature.source')}</label>
                                                <select name="source" value={formData.source} onChange={handleInputChange} className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-primary/50">
                                                    <option value="WEBSITE">Website</option>
                                                    <option value="LINKEDIN">LinkedIn</option>
                                                    <option value="REFERRAL">Referral</option>
                                                    <option value="OTHER">Other</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium text-muted-foreground">Recruitment Mode</label>
                                                <select name="recruitmentMode" value={formData.recruitmentMode} onChange={handleInputChange} className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-primary/50">
                                                    <option value="EXTERNAL">External</option>
                                                    <option value="INTERNAL">Internal</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 3: Extended Details */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-primary mb-4 border-b border-primary/20 pb-2">{t('candidature.extendedInfo')}</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium text-muted-foreground">{t('candidature.education')}</label>
                                                <input name="educationLevel" value={formData.educationLevel} onChange={handleInputChange} className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-primary/50" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium text-muted-foreground">Study Specialty</label>
                                                <input name="studySpecialty" value={formData.studySpecialty} onChange={handleInputChange} className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-primary/50" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium text-muted-foreground">Family Situation</label>
                                                <input name="familySituation" value={formData.familySituation} onChange={handleInputChange} className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-primary/50" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium text-muted-foreground">{t('candidature.currentSalary')}</label>
                                                <input type="number" name="currentSalary" value={formData.currentSalary} onChange={handleInputChange} className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-primary/50" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium text-muted-foreground">{t('candidature.expectedSalary')}</label>
                                                <input type="number" name="salaryExpectation" value={formData.salaryExpectation} onChange={handleInputChange} className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-primary/50" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium text-muted-foreground">{t('candidature.proposedSalary')}</label>
                                                <input type="number" name="proposedSalary" value={formData.proposedSalary} onChange={handleInputChange} className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-primary/50" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium text-muted-foreground">Notice Period</label>
                                                <input name="noticePeriod" value={formData.noticePeriod} onChange={handleInputChange} className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-primary/50" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium text-muted-foreground">{t('candidature.recruiterComments')}</label>
                                                <select name="recruiterComments" value={formData.recruiterComments} onChange={handleInputChange} className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-primary/50">
                                                    <option value="">Select Opinion</option>
                                                    <option value="Favorable">Favorable</option>
                                                    <option value="Defavorable">Defavorable</option>
                                                    <option value="Prioritaire">Prioritaire</option>
                                                    <option value="Passable">Passable</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium text-muted-foreground">{t('candidature.hrOpinion')}</label>
                                                <select name="hrOpinion" value={formData.hrOpinion} onChange={handleInputChange} className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-primary/50">
                                                    <option value="">Select Opinion</option>
                                                    <option value="Favorable">Favorable</option>
                                                    <option value="Defavorable">Defavorable</option>
                                                    <option value="Prioritaire">Prioritaire</option>
                                                    <option value="Passable">Passable</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium text-muted-foreground">{t('candidature.managerOpinion')}</label>
                                                <select name="managerOpinion" value={formData.managerOpinion} onChange={handleInputChange} className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-primary/50">
                                                    <option value="">Select Opinion</option>
                                                    <option value="Favorable">Favorable</option>
                                                    <option value="Defavorable">Defavorable</option>
                                                    <option value="Prioritaire">Prioritaire</option>
                                                    <option value="Passable">Passable</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* CV Upload Section */}
                                        <div className="mt-6 border-t border-border pt-4">
                                            <h3 className="text-sm font-semibold text-primary mb-3">CV / Resume</h3>
                                            <div className="flex items-center gap-4 p-4 rounded-xl border border-dashed border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors">
                                                <div className="p-2 rounded-full bg-primary/10 text-primary">
                                                    <FileText size={24} />
                                                </div>
                                                <div className="flex-1">
                                                    <input
                                                        type="file"
                                                        accept=".pdf,.doc,.docx"
                                                        onChange={(e) => setCvFile(e.target.files ? e.target.files[0] : null)}
                                                        className="w-full text-sm text-foreground
                                            file:mr-4 file:py-2 file:px-4
                                            file:rounded-full file:border-0
                                            file:text-sm file:font-semibold
                                            file:bg-primary file:text-primary-foreground
                                            hover:file:bg-primary/90
                                            cursor-pointer bg-transparent"
                                                    />
                                                </div>
                                                {cvFile && (
                                                    <div className="text-xs text-green-500 font-bold px-3 py-1 bg-green-500/10 rounded-full border border-green-500/20">
                                                        {cvFile.name}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                </form>
                            </div>

                            {/* Modal Footer */}
                            <div className="px-6 py-4 border-t border-border bg-muted/30 flex justify-end gap-3">
                                <button onClick={() => setIsFormOpen(false)} className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground transition-colors">
                                    {t('common.cancel')}
                                </button>
                                <button form="create-form" type="submit" className="px-6 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-colors shadow-lg shadow-primary/20">
                                    {t('common.save')}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </DashboardLayout>
    );
}
