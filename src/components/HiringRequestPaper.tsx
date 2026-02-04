import React from 'react';
import { HiringRequest } from "@/types";
import { X, Printer, Calendar, MapPin, Building, Briefcase, GraduationCap, FileText, User } from "lucide-react";

interface HiringRequestPaperProps {
    request: HiringRequest;
    onClose: () => void;
}

export function HiringRequestPaper({ request, onClose }: HiringRequestPaperProps) {
    // Helper to format date
    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "N/A";
        return new Date(dateStr).toLocaleDateString('fr-FR');
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl overflow-hidden max-w-7xl w-full mx-auto my-8 border border-gray-200 dark:border-gray-800 relative animate-in fade-in zoom-in-95 duration-200">
            {/* Header with Gradient */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 flex justify-between items-center text-white shadow-md">
                <div>
                    <h2 className="text-2xl font-bold uppercase tracking-wider">Demande d'Autorisation d'Embauche</h2>
                    <p className="opacity-80 text-sm mt-1">{request.title}</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => window.print()} className="p-2 hover:bg-white/20 rounded-full transition-colors" title="Imprimer">
                        <Printer size={20} />
                    </button>
                    <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors" title="Fermer">
                        <X size={20} />
                    </button>
                </div>
            </div>

            <div className="p-8 space-y-8 overflow-y-auto max-h-[80vh] custom-scrollbar bg-slate-50/50 dark:bg-slate-900/50">

                {/* Status Banner if Rejected */}
                {request.status === 'Rejected' && (
                    <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r shadow-sm">
                        <h3 className="text-red-700 dark:text-red-400 font-bold mb-1">
                            Demande Refusée {request.approverName ? `par ${request.approverName}` : ''}
                        </h3>
                        <p className="text-red-600 dark:text-red-300">{request.rejectionReason || "Aucun motif spécifié"}</p>
                    </div>
                )}

                {/* Status Banner if Approved */}
                {request.status === 'Approved' && (
                    <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 rounded-r shadow-sm">
                        <h3 className="text-green-700 dark:text-green-400 font-bold mb-1">
                            Demande Approuvée {request.approverName ? `par ${request.approverName}` : ''}
                        </h3>
                        <p className="text-green-600 dark:text-green-300">Validée le {formatDate(request.approvedAt)}</p>
                    </div>
                )}

                {/* Section 1: General Info */}
                <section className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-6 pb-2 border-b border-gray-100 dark:border-gray-700">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                            <Briefcase size={20} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Informations Générales</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <InfoItem label="Service (Département)" value={request.departmentName} icon={<Building size={16} />} />
                        <InfoItem label="Site" value={request.site} icon={<MapPin size={16} />} />
                        <InfoItem label="Business Unit" value={request.businessUnit} />
                        <InfoItem label="Catégorie" value={request.category} className="capitalize" />
                    </div>
                </section>

                {/* Section 2: Position Details */}
                <section className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-6 pb-2 border-b border-gray-100 dark:border-gray-700">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                            <User size={20} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Détails du Poste</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <InfoItem label="Intitulé du Poste" value={request.roleName || request.title} />
                        <InfoItem label="Type de Contrat" value={request.contractType} />
                        <InfoItem label="Priorité" value={request.priority} />
                        <InfoItem label="Date Souhaitée" value={formatDate(request.desiredStartDate)} icon={<Calendar size={16} />} />
                    </div>
                </section>

                {/* Section 3: Justification & Budget */}
                <section className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-6 pb-2 border-b border-gray-100 dark:border-gray-700">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                            <FileText size={20} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Justification & Budget</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-6">
                        <InfoItem label="Type d'Augmentation" value={request.increaseType} />
                        {request.increaseType === 'Non-Budgeted' && (
                            <InfoItem label="Période" value={request.increaseDateRange} />
                        )}
                        <InfoItem label="Remplacement" value={request.replacementFor ? `Oui (${request.replacementFor})` : 'Non'} />
                        {request.replacementFor && (
                            <InfoItem label="Motif Départ" value={request.replacementReason} />
                        )}
                    </div>

                    <div className="space-y-6">
                        <div>
                            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2">Description du Poste</span>
                            <div className="p-4 bg-gray-50 dark:bg-slate-900/50 rounded-lg text-sm text-gray-700 dark:text-gray-300 leading-relaxed border border-gray-100 dark:border-gray-700">
                                {request.description || "Non spécifié"}
                            </div>
                        </div>
                        <div>
                            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2">Justification</span>
                            <div className="p-4 bg-gray-50 dark:bg-slate-900/50 rounded-lg text-sm text-gray-700 dark:text-gray-300 leading-relaxed border border-gray-100 dark:border-gray-700">
                                {request.reason || "Non spécifié"}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 4: Requirements */}
                <section className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-6 pb-2 border-b border-gray-100 dark:border-gray-700">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400">
                            <GraduationCap size={20} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Prérequis</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <div>
                            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2">Formation Requise</span>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{request.educationRequirements || "Non spécifié"}</p>
                        </div>
                        <div>
                            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2">Compétences Requises</span>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{request.skillsRequirements || "Non spécifié"}</p>
                        </div>
                    </div>
                </section>

                {/* Footer Info */}
                <div className="pt-6 border-t border-gray-200 dark:border-gray-800 flex justify-between text-xs text-gray-400">
                    <p>Demandé par <span className="font-medium text-gray-600 dark:text-gray-300">{request.requesterName || "Inconnu"}</span> le {formatDate(request.createdAt)}</p>
                    <p className="font-mono opacity-50">Ref: {request.id.slice(0, 8)}</p>
                </div>

            </div>
        </div>
    );
}

function InfoItem({ label, value, icon, className }: { label: string, value?: any, icon?: React.ReactNode, className?: string }) {
    if (!value) return null;
    return (
        <div className={`flex flex-col ${className}`}>
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                {icon}
                {label}
            </span>
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{value}</span>
        </div>
    );
}
