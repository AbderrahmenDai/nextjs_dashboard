import React from 'react';
import { HiringRequest } from "@/types";
import { X, Printer, Calendar, MapPin, Building, Briefcase, GraduationCap, FileText, User, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface HiringRequestPaperProps {
    request: HiringRequest;
    onClose: () => void;
}

export function HiringRequestPaper({ request, onClose }: HiringRequestPaperProps) {
    const router = useRouter();
    const { user } = useAuth();

    // Helper to format date
    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "N/A";
        return new Date(dateStr).toLocaleDateString('fr-FR');
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl overflow-hidden max-w-7xl w-full mx-auto my-8 border border-gray-200 dark:border-gray-800 relative animate-in fade-in zoom-in-95 duration-200 print:shadow-none print:border-none print:m-0 print:w-full print:max-w-none">
            {/* Header with Gradient */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 print:p-4 flex justify-between items-center text-white shadow-md print:shadow-none print:from-white print:to-white print:text-black print:border-b-2 print:border-black">
                <div>
                    <h2 className="text-2xl print:text-xl font-bold uppercase tracking-wider">Demande d'Autorisation d'Embauche</h2>
                    <p className="opacity-80 text-sm mt-1 text-white print:text-black">{request.title}</p>
                </div>
                <div className="flex gap-2 print:hidden">
                    {request.status === 'Approved' && 'role' in (user || {}) && (['RECRUITMENT_MANAGER', 'HR_MANAGER', 'Recruitment Manager', 'RECRUITER', 'Responsable Recrutement'].includes((user as any)?.role)) && (
                        <button
                            onClick={() => router.push(`/candidatures?newForRequestId=${request.id}`)}
                            className="p-2 hover:bg-white/20 rounded-full transition-colors"
                            title="Ajouter Candidat"
                        >
                            <UserPlus size={20} />
                        </button>
                    )}
                    <button onClick={() => window.print()} className="p-2 hover:bg-white/20 rounded-full transition-colors" title="Imprimer">
                        <Printer size={20} />
                    </button>
                    <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors" title="Fermer">
                        <X size={20} />
                    </button>
                </div>
            </div>

            <div className="p-8 print:p-2 space-y-8 print:space-y-2 bg-slate-50/50 dark:bg-slate-900/50 print:bg-white">

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

                {/* Section 1: General Info - 4 col in print */}
                <section className="bg-white dark:bg-slate-800 p-6 print:p-1 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 print:break-inside-avoid print:border-none print:shadow-none print:bg-transparent">
                    <div className="flex items-center gap-3 mb-6 print:mb-1 pb-2 border-b border-gray-100 dark:border-gray-700 print:border-b print:pb-0.5">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400 print:hidden">
                            <Briefcase size={20} />
                        </div>
                        <h3 className="text-lg print:text-xs font-semibold text-gray-800 dark:text-gray-200">Informations Générales</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 print:grid-cols-4 print:gap-x-2 print:gap-y-1">
                        <InfoItem label="Service (Département)" value={request.departmentName} icon={<Building size={16} className="print:w-3 print:h-3" />} />
                        <InfoItem label="Site" value={request.site} icon={<MapPin size={16} className="print:w-3 print:h-3" />} />
                        <InfoItem label="Business Unit" value={request.businessUnit} />
                        <InfoItem label="Catégorie" value={request.category} className="capitalize" />
                    </div>
                </section>

                {/* Section 2: Position Details - 4 col in print */}
                <section className="bg-white dark:bg-slate-800 p-6 print:p-1 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 print:break-inside-avoid print:border-none print:shadow-none print:bg-transparent">
                    <div className="flex items-center gap-3 mb-6 print:mb-1 pb-2 border-b border-gray-100 dark:border-gray-700 print:border-b print:pb-0.5">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400 print:hidden">
                            <User size={20} />
                        </div>
                        <h3 className="text-lg print:text-xs font-semibold text-gray-800 dark:text-gray-200">Détails du Poste</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 print:grid-cols-4 print:gap-x-2 print:gap-y-1">
                        <InfoItem label="Intitulé du Poste" value={request.roleName || request.title} />
                        <InfoItem label="Type de Contrat" value={request.contractType} />
                        <InfoItem label="Priorité" value={request.priority} />
                        <InfoItem label="Date Souhaitée" value={formatDate(request.desiredStartDate)} icon={<Calendar size={16} className="print:w-3 print:h-3" />} />
                    </div>
                </section>

                {/* Section 3: Justification & Budget - Dense Grid in Print */}
                <section className="bg-white dark:bg-slate-800 p-6 print:p-1 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 print:break-inside-avoid print:border-none print:shadow-none print:bg-transparent">
                    <div className="flex items-center gap-3 mb-6 print:mb-1 pb-2 border-b border-gray-100 dark:border-gray-700 print:border-b print:pb-0.5">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400 print:hidden">
                            <FileText size={20} />
                        </div>
                        <h3 className="text-lg print:text-xs font-semibold text-gray-800 dark:text-gray-200">Justification & Budget</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 print:grid-cols-4 print:gap-y-1 mb-6 print:mb-1">
                        <InfoItem label="Type d'Augmentation" value={request.increaseType} />
                        {request.increaseType === 'Non-Budgeted' && (
                            <InfoItem label="Période" value={request.increaseDateRange} />
                        )}
                        <InfoItem label="Remplacement" value={request.replacementFor ? `Oui (${request.replacementFor})` : 'Non'} />
                        {request.replacementFor && (
                            <InfoItem label="Motif Départ" value={request.replacementReason} />
                        )}
                    </div>

                    <div className="space-y-6 print:space-y-1">
                        <div>
                            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2 print:mb-0 print:text-[9px]">Description du Poste</span>
                            <div className="p-4 print:p-0.5 bg-gray-50 dark:bg-slate-900/50 rounded-lg text-sm print:text-[10px] text-gray-700 dark:text-gray-300 leading-tight border border-gray-100 dark:border-gray-700 print:border-none print:bg-transparent">
                                {request.description || "Non spécifié"}
                            </div>
                        </div>
                        <div>
                            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2 print:mb-0 print:text-[9px]">Justification</span>
                            <div className="p-4 print:p-0.5 bg-gray-50 dark:bg-slate-900/50 rounded-lg text-sm print:text-[10px] text-gray-700 dark:text-gray-300 leading-tight border border-gray-100 dark:border-gray-700 print:border-none print:bg-transparent">
                                {request.reason || "Non spécifié"}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 4: Requirements - Compact 2-col in print */}
                <section className="bg-white dark:bg-slate-800 p-6 print:p-1 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 print:break-inside-avoid print:border-none print:shadow-none print:bg-transparent">
                    <div className="flex items-center gap-3 mb-6 print:mb-1 pb-2 border-b border-gray-100 dark:border-gray-700 print:border-b print:pb-0.5">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400 print:hidden">
                            <GraduationCap size={20} />
                        </div>
                        <h3 className="text-lg print:text-xs font-semibold text-gray-800 dark:text-gray-200">Prérequis</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 print:gap-y-1">
                        <div>
                            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2 print:mb-0 print:text-[9px]">Formation Requise</span>
                            <p className="text-sm print:text-[10px] text-gray-700 dark:text-gray-300 leading-tight">{request.educationRequirements || "Non spécifié"}</p>
                        </div>
                        <div>
                            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2 print:mb-0 print:text-[9px]">Compétences Requises</span>
                            <p className="text-sm print:text-[10px] text-gray-700 dark:text-gray-300 leading-tight">{request.skillsRequirements || "Non spécifié"}</p>
                        </div>
                    </div>
                </section>

                {/* Circuit de Validation - Signature Style */}
                <section className="mt-4 pt-2 print:mt-1 print:pt-1 border-t border-gray-200 dark:border-gray-700 print:break-inside-avoid">
                    <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 print:mb-1 text-center">Circuit de Validation</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:gap-2">
                        {/* 1. Demandeur */}
                        <div className="bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4 print:p-1 flex flex-col items-center justify-between min-h-[140px] print:min-h-[60px] shadow-sm relative print:border print:rounded-none">
                            <div className="w-full text-center border-b border-dashed border-gray-200 dark:border-gray-700 pb-2 mb-2 print:pb-0.5 print:mb-0.5">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider print:text-[9px]">Demandeur</span>
                            </div>
                            <div className="text-center my-auto">
                                <div className="font-serif italic text-lg print:text-xs text-gray-800 dark:text-gray-200 mb-1 print:mb-0">{request.requesterName || "Inconnu"}</div>
                                <div className="text-[10px] text-gray-400 print:text-[8px]">Créé le {formatDate(request.createdAt)}</div>
                            </div>
                        </div>

                        {/* 2. Avis RH */}
                        <div className="bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4 print:p-1 flex flex-col items-center justify-between min-h-[140px] print:min-h-[60px] shadow-sm print:border print:rounded-none">
                            <div className="w-full text-center border-b border-dashed border-gray-200 dark:border-gray-700 pb-2 mb-2 print:pb-0.5 print:mb-0.5">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider print:text-[9px]">Ressources Humaines</span>
                            </div>

                            <div className="my-auto w-full flex justify-center">
                                {request.status === 'Pending HR' && (
                                    <div className="text-center px-4 py-2 bg-yellow-50 border border-yellow-100 rounded-lg print:p-0 print:border-none print:bg-transparent">
                                        <span className="text-sm font-bold text-yellow-700 block print:text-[10px]">En Attente</span>
                                    </div>
                                )}

                                {['Pending Director', 'Approved'].includes(request.status) && (
                                    <div className="text-center px-4 py-2 bg-green-50 border border-green-100 rounded-lg transform -rotate-2 print:rotate-0 print:p-0 print:border-none print:bg-transparent">
                                        <span className="text-sm font-bold text-green-700 block uppercase tracking-wide border-2 border-green-600 px-2 py-1 rounded print:text-[10px] print:border print:px-1 print:py-0">Avis Favorable</span>
                                    </div>
                                )}

                                {request.status === 'Rejected' && (
                                    <div className="text-center px-4 py-2 bg-red-50 border border-red-100 rounded-lg transform rotate-2 print:rotate-0 print:p-0 print:border-none print:bg-transparent">
                                        <span className="text-sm font-bold text-red-700 block uppercase tracking-wide border-2 border-red-600 px-2 py-1 rounded print:text-[10px] print:border print:px-1 print:py-0">Refusé</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 3. Direction Générale */}
                        <div className="bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4 print:p-1 flex flex-col items-center justify-between min-h-[140px] print:min-h-[60px] shadow-sm print:border print:rounded-none">
                            <div className="w-full text-center border-b border-dashed border-gray-200 dark:border-gray-700 pb-2 mb-2 print:pb-0.5 print:mb-0.5">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider print:text-[9px]">Direction Générale</span>
                            </div>

                            <div className="my-auto w-full flex justify-center">
                                {request.status === 'Pending HR' && (
                                    <span className="text-gray-300 text-xs italic print:text-[9px]">En attente RH</span>
                                )}

                                {request.status === 'Pending Director' && (
                                    <div className="text-center px-4 py-2 bg-yellow-50 border border-yellow-100 rounded-lg print:p-0 print:border-none print:bg-transparent">
                                        <span className="text-sm font-bold text-yellow-700 block print:text-[10px]">En Attente</span>
                                    </div>
                                )}

                                {request.status === 'Approved' && (
                                    <div className="flex flex-col items-center">
                                        <div className="text-center px-4 py-2 bg-green-50 border border-green-100 rounded-lg transform -rotate-2 mb-2 print:rotate-0 print:mb-0 print:p-0 print:border-none print:bg-transparent">
                                            <span className="text-sm font-bold text-green-700 block uppercase tracking-wide border-2 border-green-600 px-2 py-1 rounded print:text-[10px] print:border print:px-1 print:py-0">Accordé</span>
                                        </div>
                                        {request.approverName && <span className="font-serif italic text-xs text-gray-600 print:text-[9px]">{request.approverName}</span>}
                                    </div>
                                )}

                                {request.status === 'Rejected' && (
                                    <span className="text-gray-300 text-xs">-</span>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

            </div>
            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    @page { margin: 5mm; size: A4 portrait; }
                    body { -webkit-print-color-adjust: exact; background: white; }
                    .no-print { display: none !important; }
                    /* Force black text for contrast */
                    p, span, div { color: black !important; }
                    /* Remove shadows and rounded corners for print crispness */
                    * { box-shadow: none !important; }
                    /* Hide backgrounds slightly to save ink? User just wants layout fix. */
                    .print\\:hidden { display: none !important; }
                }
            `}</style>
        </div>
    );
}

function InfoItem({ label, value, icon, className }: { label: string, value?: any, icon?: React.ReactNode, className?: string }) {
    if (!value) return null;
    return (
        <div className={`flex flex-col ${className}`}>
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1.5 print:text-[8px] print:mb-0">
                {icon && <span className="print:hidden">{icon}</span>}
                {label}
            </span>
            <span className="text-sm font-semibold text-gray-900 print:text-[10px] print:leading-tight">{value}</span>
        </div>
    );
}
