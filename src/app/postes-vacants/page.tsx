"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Briefcase, Calendar, MapPin, Users, Clock, TrendingUp, Filter, Search, Eye, CheckCircle, XCircle, AlertCircle, X, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { CreateVacancyModal } from "@/components/CreateVacancyModal";

interface HiringRequest {
    id: string;
    title: string;
    departmentName?: string;
    category: string;
    status: string;
    contractType?: string;
    priority?: string;
    site?: string;
    businessUnit?: string;
    desiredStartDate?: string;
    createdAt: string;
    description?: string;
    educationRequirements?: string;
    skillsRequirements?: string;
    rejectionReason?: string;
}

export default function PostesVacantsPage() {
    const [positions, setPositions] = useState<HiringRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [selectedPosition, setSelectedPosition] = useState<HiringRequest | null>(null);
    const { user } = useAuth();
    const router = useRouter();

    // New state for modal
    const [departments, setDepartments] = useState<any[]>([]);
    const [sites, setSites] = useState<string[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Helper to check if user can act on the request
    const canAct = (status: string) => {
        if (!user) return false;
        if (user.role === 'Admin') return true;
        if (status === 'Pending HR' && user.role === 'HR') return true;
        if (status === 'Pending Manager' && user.role === 'Manager') return true;
        return false;
    };

    useEffect(() => {
        const init = async () => {
            try {
                const [deptData, siteData] = await Promise.all([
                    api.getDepartments(),
                    api.getSites()
                ]);
                setDepartments(deptData || []);
                setSites(siteData || []);
            } catch (e) {
                console.error("Failed to load metadata", e);
            }
            loadPositions();
        };
        init();
    }, []);

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1
    });

    const loadPositions = async (page = 1) => {
        try {
            setLoading(true);
            const response = await api.getHiringRequests(page, 10);

            if (response.pagination) {
                setPositions(response.data);
                setPagination(response.pagination);
            } else {
                setPositions(Array.isArray(response) ? response : []);
            }
        } catch (error) {
            console.error("Failed to load positions:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            loadPositions(newPage);
        }
    };

    const handleApprove = async (id: string, currentStatus: string) => {
        // Determine next status based on current status
        let nextStatus = 'Approved';
        let confirmMessage = 'Êtes-vous sûr de vouloir approuver ce poste?';

        if (currentStatus === 'Pending HR') {
            nextStatus = 'Pending Manager';
            confirmMessage = 'Approuver et envoyer au Manager pour validation?';
        } else if (currentStatus === 'Pending Manager') {
            nextStatus = 'Approved';
            confirmMessage = 'Approuver définitivement ce poste?';
        }

        if (!confirm(confirmMessage)) return;

        try {
            await api.updateHiringRequest(id, { status: nextStatus });
            await loadPositions(); // Reload data
            setSelectedPosition(null);

            if (nextStatus === 'Pending Manager') {
                alert('Poste approuvé par RH. En attente de validation Manager.');
            } else {
                alert('Poste approuvé avec succès!');
            }
        } catch (error) {
            console.error("Failed to approve position:", error);
            alert('Erreur lors de l\'approbation du poste');
        }
    };

    const handleReject = async (id: string) => {
        const reason = prompt('Veuillez indiquer la raison du rejet:');

        if (!reason || reason.trim() === '') {
            alert('La raison du rejet est obligatoire');
            return;
        }

        try {
            await api.updateHiringRequest(id, {
                status: 'Rejected',
                rejectionReason: reason.trim()
            });
            await loadPositions(); // Reload data
            setSelectedPosition(null);
            alert('Poste rejeté');
        } catch (error) {
            console.error("Failed to reject position:", error);
            alert('Erreur lors du rejet du poste');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Approved': return 'from-green-500 to-emerald-500';
            case 'Pending HR': return 'from-yellow-500 to-orange-500';
            case 'Pending Manager': return 'from-blue-500 to-cyan-500';
            case 'Rejected': return 'from-red-500 to-rose-500';
            default: return 'from-gray-500 to-slate-500';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Approved': return <CheckCircle className="w-5 h-5" />;
            case 'Rejected': return <XCircle className="w-5 h-5" />;
            default: return <AlertCircle className="w-5 h-5" />;
        }
    };

    const getPriorityColor = (priority?: string) => {
        switch (priority) {
            case 'High': return 'text-red-400 bg-red-500/20';
            case 'Medium': return 'text-yellow-400 bg-yellow-500/20';
            case 'Low': return 'text-green-400 bg-green-500/20';
            default: return 'text-gray-400 bg-gray-500/20';
        }
    };

    const filteredPositions = positions.filter(pos => {
        const matchesSearch = pos.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pos.departmentName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === "all" || pos.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const stats = {
        total: positions.length,
        approved: positions.filter(p => p.status === 'Approved').length,
        pending: positions.filter(p => p.status?.includes('Pending')).length,
        rejected: positions.filter(p => p.status === 'Rejected').length,
    };

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="mb-8 animate-in slide-in-from-top duration-500 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="pl-1">
                    <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl border border-primary/20 shadow-sm">
                            <Briefcase className="w-6 h-6 text-primary" />
                        </div>
                        Postes Vacants
                    </h1>
                    <p className="text-muted-foreground mt-2 ml-14 font-medium">Toutes les demandes d'embauche en cours.</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-primary/25 active:scale-95"
                >
                    <Plus size={18} strokeWidth={2.5} />
                    Nouveau Poste
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="glass-card p-6 rounded-2xl group hover:scale-105 transition-all duration-300 animate-in fade-in slide-in-from-bottom duration-500">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                            <Briefcase className="w-6 h-6 text-blue-400" />
                        </div>
                        <TrendingUp className="w-5 h-5 text-blue-400 opacity-50" />
                    </div>
                    <h3 className="text-3xl font-black text-foreground mb-1">{stats.total}</h3>
                    <p className="text-sm text-muted-foreground font-medium">Total Postes</p>
                </div>

                <div className="glass-card p-6 rounded-2xl group hover:scale-105 transition-all duration-300 animate-in fade-in slide-in-from-bottom duration-500 delay-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-green-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                            <CheckCircle className="w-6 h-6 text-green-400" />
                        </div>
                        <TrendingUp className="w-5 h-5 text-green-400 opacity-50" />
                    </div>
                    <h3 className="text-3xl font-black text-foreground mb-1">{stats.approved}</h3>
                    <p className="text-sm text-muted-foreground font-medium">Approuvés</p>
                </div>

                <div className="glass-card p-6 rounded-2xl group hover:scale-105 transition-all duration-300 animate-in fade-in slide-in-from-bottom duration-500 delay-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-yellow-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                            <Clock className="w-6 h-6 text-yellow-400" />
                        </div>
                        <TrendingUp className="w-5 h-5 text-yellow-400 opacity-50" />
                    </div>
                    <h3 className="text-3xl font-black text-foreground mb-1">{stats.pending}</h3>
                    <p className="text-sm text-muted-foreground font-medium">En Attente</p>
                </div>

                <div className="glass-card p-6 rounded-2xl group hover:scale-105 transition-all duration-300 animate-in fade-in slide-in-from-bottom duration-500 delay-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-red-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                            <XCircle className="w-6 h-6 text-red-400" />
                        </div>
                        <TrendingUp className="w-5 h-5 text-red-400 opacity-50" />
                    </div>
                    <h3 className="text-3xl font-black text-foreground mb-1">{stats.rejected}</h3>
                    <p className="text-sm text-muted-foreground font-medium">Rejetés</p>
                </div>
            </div>

            {/* Filters */}
            <div className="glass-card p-6 rounded-2xl mb-8 animate-in fade-in slide-in-from-bottom duration-500 delay-400">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Rechercher un poste..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-background/50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="relative group">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="pl-12 pr-8 py-3 bg-background/50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none appearance-none cursor-pointer min-w-[200px]"
                        >
                            <option value="all">Tous les statuts</option>
                            <option value="Approved">Approuvés</option>
                            <option value="Pending HR">En attente RH</option>
                            <option value="Pending Manager">En attente Manager</option>
                            <option value="Rejected">Rejetés</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Positions Grid */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-muted-foreground">Chargement des postes...</p>
                    </div>
                </div>
            ) : filteredPositions.length === 0 ? (
                <div className="glass-card p-12 rounded-2xl text-center">
                    <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-bold text-foreground mb-2">Aucun poste trouvé</h3>
                    <p className="text-muted-foreground">Essayez de modifier vos filtres de recherche</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-gray-100">
                    {filteredPositions.map((position, index) => (
                        <div
                            key={position.id}
                            className="glass-card p-6 rounded-2xl group hover:scale-105 transition-all duration-300 cursor-pointer relative overflow-hidden animate-in fade-in slide-in-from-bottom bg-gray-200"
                            style={{ animationDelay: `${index * 50}ms` }}
                            onClick={() => setSelectedPosition(position)}
                        >
                            {/* Gradient overlay on hover */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${getStatusColor(position.status)} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                            {/* Status Badge */}
                            <div className="flex items-center justify-between mb-4 relative z-10">
                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r ${getStatusColor(position.status)} text-white text-xs font-bold shadow-lg`}>
                                    {getStatusIcon(position.status)}
                                    <span>{position.status}</span>
                                </div>
                                {position.priority && (
                                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${getPriorityColor(position.priority)}`}>
                                        {position.priority}
                                    </span>
                                )}
                            </div>

                            {/* Title */}
                            <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors relative z-10">
                                {position.title || 'Sans titre'}
                            </h3>

                            {/* Department */}
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4 relative z-10">
                                <Users className="w-4 h-4" />
                                <span>{position.departmentName || 'Non assigné'}</span>
                            </div>

                            {/* Details */}
                            <div className="space-y-2 mb-4 relative z-10">
                                {position.site && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <MapPin className="w-4 h-4 text-blue-400" />
                                        <span className="text-foreground">{position.site}</span>
                                    </div>
                                )}
                                {position.contractType && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Briefcase className="w-4 h-4 text-purple-400" />
                                        <span className="text-foreground">{position.contractType}</span>
                                    </div>
                                )}
                                {position.desiredStartDate && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="w-4 h-4 text-green-400" />
                                        <span className="text-foreground">{new Date(position.desiredStartDate).toLocaleDateString()}</span>
                                    </div>
                                )}
                            </div>

                            {/* Category Badge */}
                            <div className="flex items-center justify-between relative z-10">
                                <span className="px-3 py-1 bg-primary/20 text-primary rounded-lg text-xs font-bold">
                                    {position.category}
                                </span>
                                <button className="p-2 hover:bg-primary/20 rounded-lg transition-colors group/btn">
                                    <Eye className="w-5 h-5 text-muted-foreground group-hover/btn:text-primary transition-colors" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination Controls */}
            {!loading && pagination.totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8 pb-8">
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
            )
            }

            {/* Detail Modal */}
            {
                selectedPosition && mounted && createPortal(
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
                        <div
                            className="modal-card w-full max-w-2xl p-0 overflow-hidden flex flex-col max-h-[90vh] relative animate-in fade-in zoom-in duration-300 shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header with status gradient */}
                            <div className={`px-6 py-6 bg-gradient-to-br ${getStatusColor(selectedPosition.status)} relative overflow-hidden`}>
                                <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]" />
                                <div className="flex justify-between items-start relative z-10">
                                    <div>
                                        <h2 className="text-3xl font-bold text-white mb-2 uppercase tracking-tight">{selectedPosition.title}</h2>
                                        <div className="flex gap-2">
                                            <span className="px-3 py-1 bg-white/20 text-white rounded-xl text-xs font-bold backdrop-blur-md uppercase border border-white/30 shadow-inner">
                                                {selectedPosition.status}
                                            </span>
                                            <span className="px-3 py-1 bg-white/20 text-white rounded-xl text-xs font-bold backdrop-blur-md uppercase border border-white/30">
                                                {selectedPosition.category}
                                            </span>
                                        </div>
                                    </div>
                                    <button onClick={() => setSelectedPosition(null)} className="p-2 hover:bg-white/10 text-white hover:text-white/80 rounded-xl transition-all">
                                        <X size={24} />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar bg-white dark:bg-slate-900 text-gray-900">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <div className="flex items-center gap-2 text-blue-600 mb-2">
                                            <Users className="w-5 h-5" />
                                            <span className="text-xs uppercase font-bold text-gray-500">Département</span>
                                        </div>
                                        <p className="text-gray-900 font-semibold">{selectedPosition.departmentName || 'Non assigné'}</p>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <div className="flex items-center gap-2 text-purple-600 mb-2">
                                            <Briefcase className="w-5 h-5" />
                                            <span className="text-xs uppercase font-bold text-gray-500">Type de contrat</span>
                                        </div>
                                        <p className="text-gray-900 font-semibold">{selectedPosition.contractType || 'Non spécifié'}</p>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <div className="flex items-center gap-2 text-green-600 mb-2">
                                            <MapPin className="w-5 h-5" />
                                            <span className="text-xs uppercase font-bold text-gray-500">Site</span>
                                        </div>
                                        <p className="text-gray-900 font-semibold">{selectedPosition.site || 'Non spécifié'}</p>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <div className="flex items-center gap-2 text-yellow-600 mb-2">
                                            <Calendar className="w-5 h-5" />
                                            <span className="text-xs uppercase font-bold text-gray-500">Date souhaitée</span>
                                        </div>
                                        <p className="text-gray-900 font-semibold">
                                            {selectedPosition.desiredStartDate ? new Date(selectedPosition.desiredStartDate).toLocaleDateString() : 'Non spécifiée'}
                                        </p>
                                    </div>
                                </div>

                                {selectedPosition.description && (
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <h4 className="text-sm uppercase font-bold text-gray-500 mb-2">Description</h4>
                                        <p className="text-gray-700 text-sm leading-relaxed">{selectedPosition.description}</p>
                                    </div>
                                )}

                                {selectedPosition.educationRequirements && (
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <h4 className="text-sm uppercase font-bold text-gray-500 mb-2">Formation requise</h4>
                                        <p className="text-gray-700 text-sm leading-relaxed">{selectedPosition.educationRequirements}</p>
                                    </div>
                                )}

                                {selectedPosition.skillsRequirements && (
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <h4 className="text-sm uppercase font-bold text-gray-500 mb-2">Compétences requises</h4>
                                        <p className="text-gray-700 text-sm leading-relaxed">{selectedPosition.skillsRequirements}</p>
                                    </div>
                                )}
                            </div>

                            {/* Footer with Action Buttons */}
                            <div className="p-4 bg-gray-50 border-t border-gray-100">
                                {((selectedPosition.status === 'Pending HR' || selectedPosition.status === 'Pending Manager') && canAct(selectedPosition.status)) ? (
                                    <div className="flex gap-3 justify-end">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleReject(selectedPosition.id);
                                            }}
                                            className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-lg font-medium transition-all hover:scale-105 hover:shadow-lg hover:shadow-red-500/50 flex items-center gap-2"
                                        >
                                            <XCircle className="w-5 h-5" />
                                            Rejeter
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleApprove(selectedPosition.id, selectedPosition.status);
                                            }}
                                            className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-lg font-medium transition-all hover:scale-105 hover:shadow-lg hover:shadow-green-500/50 flex items-center gap-2"
                                        >
                                            <CheckCircle className="w-5 h-5" />
                                            Approuver
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex justify-end">
                                        <button
                                            onClick={() => setSelectedPosition(null)}
                                            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg font-medium transition-all hover:scale-105"
                                        >
                                            Fermer
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>,
                    document.body
                )
            }
            <CreateVacancyModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={loadPositions}
                sites={sites}
                departments={departments}
            />
        </DashboardLayout >
    );
}
