"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { ArrowLeft, Save, Send } from "lucide-react";
import Link from "next/link";
import { Button, Input, Label, Textarea } from "@/components/ui/form-elements";
import { useState } from "react";
import { clsx } from "clsx";

export default function CreateHiringRequestPage() {
    const [category, setCategory] = useState("Ouvrier");
    const [isReplacement, setIsReplacement] = useState(false);

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <Link
                        href="/hiring-requests"
                        className="p-2 hover:bg-white/5 rounded-xl text-muted-foreground hover:text-white transition-colors border border-transparent hover:border-white/10"
                    >
                        <ArrowLeft size={24} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">New Hiring Request</h1>
                        <p className="text-muted-foreground mt-1">Fill in the details to request a new hire.</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button variant="ghost">
                        <Save className="mr-2" size={18} />
                        Save Draft
                    </Button>
                    <Button>
                        <Send className="mr-2" size={18} />
                        Submit Request
                    </Button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto space-y-8">

                {/* General Info */}
                <section className="glass-card p-8 rounded-2xl space-y-6">
                    <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-4">General Information</h2>

                    {/* Category Selection */}
                    <div className="space-y-3">
                        <Label>Category</Label>
                        <div className="flex gap-4">
                            {["Ouvrier", "Etam", "Cadre"].map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setCategory(cat)}
                                    className={clsx(
                                        "flex-1 py-3 px-4 rounded-xl border font-medium transition-all duration-200",
                                        category === cat
                                            ? "bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                                            : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10 hover:text-white"
                                    )}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="date">Request Date</Label>
                            <Input type="date" id="date" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="desiredDate">Desired Start Date</Label>
                            <Input type="date" id="desiredDate" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="service">Service</Label>
                            <Input id="service" placeholder="e.g. Engineering" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bu">Business Unit (BU)</Label>
                            <Input id="bu" placeholder="e.g. Factory A" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="location">Work Location</Label>
                        <Input id="location" placeholder="e.g. Paris Office" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="jobTitle">Job Title</Label>
                        <Input id="jobTitle" placeholder="e.g. Senior Developer" />
                    </div>
                </section>

                {/* Reason */}
                <section className="glass-card p-8 rounded-2xl space-y-6">
                    <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-4">Reason for Request</h2>

                    <div className="space-y-4">
                        {/* Contract Type */}
                        <div className="flex gap-6 items-center p-4 bg-white/5 rounded-xl border border-white/10">
                            <span className="text-sm font-medium text-white">Contract Type:</span>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="contract" className="w-4 h-4 text-primary bg-transparent border-white/20 focus:ring-primary" />
                                <span className="text-sm text-muted-foreground">CDI</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="contract" className="w-4 h-4 text-primary bg-transparent border-white/20 focus:ring-primary" />
                                <span className="text-sm text-muted-foreground">CDD</span>
                            </label>
                        </div>

                        <div className="space-y-4 pt-4">
                            <label className="flex items-start gap-3 cursor-pointer group">
                                <div className="pt-1">
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isReplacement ? 'bg-primary border-primary text-black' : 'border-white/20 bg-transparent'}`}>
                                        {isReplacement && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                                    </div>
                                    <input type="checkbox" className="hidden" checked={isReplacement} onChange={() => setIsReplacement(!isReplacement)} />
                                </div>
                                <div className="flex-1">
                                    <span className="font-medium text-white group-hover:text-primary transition-colors">Replacement</span>
                                    <p className="text-xs text-muted-foreground">Replacing an employee who has left.</p>

                                    {isReplacement && (
                                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                                            <Input placeholder="Employee Name" />
                                            <Input placeholder="Reason for Leaving" />
                                        </div>
                                    )}
                                </div>
                            </label>

                            <label className="flex items-start gap-3 cursor-pointer group">
                                <div className="pt-1">
                                    <div className="w-5 h-5 rounded border border-white/20 bg-transparent group-hover:border-white/40 transition-colors" />
                                </div>
                                <div className="flex-1">
                                    <span className="font-medium text-white group-hover:text-primary transition-colors">Budgeted Headcount Increase</span>
                                    <p className="text-xs text-muted-foreground">Planned increase in workforce.</p>
                                </div>
                            </label>

                            <label className="flex items-start gap-3 cursor-pointer group">
                                <div className="pt-1">
                                    <div className="w-5 h-5 rounded border border-white/20 bg-transparent group-hover:border-white/40 transition-colors" />
                                </div>
                                <div className="flex-1">
                                    <span className="font-medium text-white group-hover:text-primary transition-colors">Non-Budgeted Headcount Increase</span>
                                    <p className="text-xs text-muted-foreground">Unplanned increase requiring special approval.</p>
                                </div>
                            </label>
                        </div>
                    </div>
                </section>

                {/* Justification & Characteristics */}
                <section className="glass-card p-8 rounded-2xl space-y-6">
                    <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-4">Position Details</h2>

                    <div className="space-y-2">
                        <Label htmlFor="justification">Detailed Justification</Label>
                        <Textarea id="justification" placeholder="Why is this recruitment necessary?" className="min-h-[120px]" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="characteristics">Position Characteristics</Label>
                        <Textarea id="characteristics" placeholder="Describe the key responsibilities and role details..." className="min-h-[120px]" />
                    </div>
                </section>

                {/* Candidate Requirements */}
                <section className="glass-card p-8 rounded-2xl space-y-6">
                    <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-4">Candidate Profile</h2>

                    <div className="space-y-2">
                        <Label htmlFor="education">Desired Education / Training</Label>
                        <Textarea id="education" placeholder="e.g. Master's in Computer Science..." />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="skills">Essential Knowledge & Skills</Label>
                        <Textarea id="skills" placeholder="List required technical and soft skills..." className="min-h-[120px]" />
                    </div>
                </section>

            </div>
        </DashboardLayout>
    );
}
