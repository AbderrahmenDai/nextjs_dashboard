"use client";

import { useState, useEffect } from "react";
import { X, Search, Check, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";
import { createPortal } from "react-dom";

interface Candidate {
    id: string;
    firstName: string;
    lastName: string;
    positionAppliedFor: string;
    department: string;
    hiringRequestId?: string; // To check if already assigned
}

interface AssignCandidateModalProps {
    isOpen: boolean;
    onClose: () => void;
    hiringRequest: { id: string; title: string } | null;
    onSuccess: () => void;
}

export function AssignCandidateModal({ isOpen, onClose, hiringRequest, onSuccess }: AssignCandidateModalProps) {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            fetchCandidates();
            setSelectedCandidateId(null);
            setSearchTerm("");
        }
        return () => setMounted(false);
    }, [isOpen]);

    const fetchCandidates = async () => {
        setLoading(true);
        try {
            const data = await api.getCandidatures();
            setCandidates(data);
        } catch (error) {
            console.error("Failed to fetch candidates", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async () => {
        if (!selectedCandidateId || !hiringRequest) return;
        setSaving(true);
        try {
            // Assign candidate to request
            await api.updateCandidature(selectedCandidateId, { hiringRequestId: hiringRequest.id });
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Failed to assign candidate", error);
            alert("Une erreur est survenue lors de l'assignation.");
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen || !mounted || !hiringRequest) return null;

    // Filter logic: show all unassigned or search matches
    // Maybe better to show ALL candidates but mark assigned ones? 
    // Usually you pick from "Pool", so exclude ones already assigned to *other* active requests?
    // For simplicity, showing all matches search text.
    const filteredCandidates = candidates.filter(c =>
    (c.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.positionAppliedFor.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col max-h-[85vh]">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Assigner un Candidat</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Pour la demande: <span className="font-semibold text-primary">{hiringRequest.title}</span>
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Rechercher par nom ou poste..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Chargement des candidats...</div>
                    ) : filteredCandidates.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 flex flex-col items-center gap-2">
                            <AlertCircle size={32} className="opacity-50" />
                            <span>Aucun candidat trouvé</span>
                        </div>
                    ) : (
                        filteredCandidates.map(candidate => (
                            <div
                                key={candidate.id}
                                onClick={() => setSelectedCandidateId(candidate.id)}
                                className={`
                                    p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-4 group
                                    ${selectedCandidateId === candidate.id
                                        ? 'bg-primary/5 border-primary shadow-sm ring-1 ring-primary/20'
                                        : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-700/50'
                                    }
                                `}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${selectedCandidateId === candidate.id ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400'
                                    }`}>
                                    {candidate.firstName[0]}{candidate.lastName[0]}
                                </div>
                                <div className="flex-1">
                                    <h4 className={`font-semibold ${selectedCandidateId === candidate.id ? 'text-primary' : 'text-gray-900 dark:text-gray-100'}`}>
                                        {candidate.firstName} {candidate.lastName}
                                    </h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                        <span>{candidate.positionAppliedFor}</span>
                                        {candidate.hiringRequestId && (
                                            <span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded text-[10px] font-bold">Déjà Assigné</span>
                                        )}
                                    </p>
                                </div>
                                {selectedCandidateId === candidate.id && (
                                    <div className="text-primary animate-in zoom-in spin-in-90 duration-200">
                                        <Check size={20} strokeWidth={3} />
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-slate-900 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-800 transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleAssign}
                        disabled={!selectedCandidateId || saving}
                        className="px-6 py-2.5 rounded-xl font-bold text-white bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {saving ? 'Assignation...' : 'Assigner le Candidat'}
                        {!saving && <Check size={18} strokeWidth={2.5} />}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
