export interface HiringRequest {
    id: string;
    title: string;
    departmentId: string;
    departmentName?: string;
    category: string;
    status: string;
    requesterId?: string;
    requesterName?: string;
    requestDate: string;
    createdAt: string;
    priority: string;
    roleId?: string;
    roleName?: string;
    
    // Details
    description?: string;
    budget?: number;
    currency?: string;
    contractType?: string;
    reason?: string;
    
    // Approval
    approvedAt?: string;
    approverId?: string;
    approverName?: string;
    rejectionReason?: string;

    // New Fields
    site?: string;
    businessUnit?: string;
    desiredStartDate?: string;
    
    // Logic fields
    replacementFor?: string;
    replacementReason?: string;
    increaseType?: 'Budgeted' | 'Non-Budgeted';
    increaseDateRange?: string;
    
    educationRequirements?: string;
    skillsRequirements?: string;
    selectedCandidates?: any[];
}

export interface Department { id: string; name: string; }
export interface Site { id: string; name: string; }
export interface Role { id: string; name: string; departmentId?: string; }
