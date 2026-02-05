"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface CreateVacancyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    sites: any[];
    departments: any[];
}

export function CreateVacancyModal({ isOpen, onClose, onSuccess, sites, departments }: CreateVacancyModalProps) {
    const { user } = useAuth();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const [formData, setFormData] = useState({
        title: "",
        site: "",
        departmentId: "",
        category: "Cadre",
        contractType: "CDI",
        desiredStartDate: "",
        description: "",
        educationRequirements: "",
        skillsRequirements: "",
    });
    const [loading, setLoading] = useState(false);

    // Filter departments by site
    const filteredDepartments = departments.filter(d => {
        if (!formData.site) return true;
        // Match by siteId (preferred) or site name (fallback/legacy)
        return (d.siteId && d.siteId === formData.site) || (d.site && d.site === formData.site);
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.site || !formData.departmentId) {
            alert("Veuillez remplir les champs obligatoires");
            return;
        }

        setLoading(true);
        try {
            // Resolve site name if we selected an ID
            const selectedSite = sites.find(s => (typeof s === 'object' ? s.id : s) === formData.site);
            const siteName = typeof selectedSite === 'object' ? selectedSite.name : formData.site;

            await api.createHiringRequest({
                ...formData,
                site: siteName, // Send Name to backend as per schema
                requesterId: user?.id,
                status: 'Approved',
                priority: 'Medium',
                budget: '0',
                reason: 'Creation de poste vacant',
            });
            onSuccess();
            onClose();
            // Reset form
            setFormData({
                title: "",
                site: "",
                departmentId: "",
                category: "Cadre",
                contractType: "CDI",
                desiredStartDate: "",
                description: "",
                educationRequirements: "",
                skillsRequirements: "",
            });
            alert("Poste vacant créé avec succès !");
        } catch (error) {
            console.error("Failed to create vacancy:", error);
            alert("Erreur lors de la création du poste");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="modal-card w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden bg-background border border-border rounded-xl shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-border bg-gradient-to-r from-blue-600/10 to-purple-600/10 dark:from-blue-600/5 dark:to-purple-600/5">
                    <div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Nouveau Poste Vacant
                        </h2>
                        <p className="text-sm text-muted-foreground">Création directe d'offre d'emploi</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <div className="space-y-6">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Titre du Poste *</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                className="input-field w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                placeholder="ex: Développeur Full Stack Senior"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Site */}
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Site *</label>
                                <select
                                    value={formData.site}
                                    onChange={e => setFormData({ ...formData, site: e.target.value })}
                                    className="input-field w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    required
                                >
                                    <option value="">Sélectionner un site</option>
                                    {sites.map((s: any, i: number) => {
                                        // Use ID if object, else string
                                        const val = typeof s === 'object' ? s.id : s;
                                        const label = typeof s === 'object' ? s.name : s;
                                        // Use ID as key if object
                                        const key = typeof s === 'object' ? s.id : `${s}-${i}`;
                                        return <option key={key} value={val}>{label}</option>;
                                    })}
                                </select>
                            </div>

                            {/* Department */}
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Département *</label>
                                <select
                                    value={formData.departmentId}
                                    onChange={e => setFormData({ ...formData, departmentId: e.target.value })}
                                    className="input-field w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    required
                                >
                                    <option value="">Sélectionner un département</option>
                                    {filteredDepartments.map((d: any) => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Catégorie</label>
                                <select
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    className="input-field w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                >
                                    <option value="Cadre">Cadre</option>
                                    <option value="Non Cadre">Non Cadre</option>
                                    <option value="Stagiaire">Stagiaire</option>
                                </select>
                            </div>

                            {/* Contract */}
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Contrat</label>
                                <select
                                    value={formData.contractType}
                                    onChange={e => setFormData({ ...formData, contractType: e.target.value })}
                                    className="input-field w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                >
                                    <option value="CDI">CDI</option>
                                    <option value="CDD">CDD</option>
                                    <option value="Stage">Stage</option>
                                    <option value="Alternance">Alternance</option>
                                </select>
                            </div>
                        </div>

                        {/* Date */}
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Date de démarrage souhaitée</label>
                            <input
                                type="date"
                                value={formData.desiredStartDate}
                                onChange={e => setFormData({ ...formData, desiredStartDate: e.target.value })}
                                className="input-field w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="input-field w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all min-h-[100px]"
                                placeholder="Responsabilités, contexte..."
                            />
                        </div>

                        {/* Requirements */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Compétences</label>
                                <textarea
                                    value={formData.skillsRequirements}
                                    onChange={e => setFormData({ ...formData, skillsRequirements: e.target.value })}
                                    className="input-field w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all min-h-[80px]"
                                    placeholder="React, Node.js..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Formation</label>
                                <textarea
                                    value={formData.educationRequirements}
                                    onChange={e => setFormData({ ...formData, educationRequirements: e.target.value })}
                                    className="input-field w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all min-h-[80px]"
                                    placeholder="Bac+5..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-border bg-secondary/30 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium hover:bg-secondary rounded-lg transition-colors">
                        Annuler
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-bold flex items-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
                    >
                        {loading ? 'Création...' : (
                            <>
                                <CheckCircle size={18} />
                                Créer le Poste
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        </div>,
        document.body
    );
}
