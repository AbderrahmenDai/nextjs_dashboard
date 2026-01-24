
const API_BASE_URL = 'http://localhost:8080/api';

export const api = {
    // --- USERS ---
    getUsers: async () => {
        const response = await fetch(`${API_BASE_URL}/users`);
        if (!response.ok) throw new Error('Failed to fetch users');
        return response.json();
    },

    createUser: async (user: any) => {
        const response = await fetch(`${API_BASE_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user),
        });
        if (!response.ok) throw new Error('Failed to create user');
        return response.json();
    },

    updateUser: async (id: string, user: any) => {
        const response = await fetch(`${API_BASE_URL}/users/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user),
        });
        if (!response.ok) throw new Error('Failed to update user');
        return response.json();
    },

    deleteUser: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/users/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete user');
        return response.json();
    },

    // --- DEPARTMENTS ---
    getDepartments: async () => {
        const response = await fetch(`${API_BASE_URL}/departments`);
        if (!response.ok) throw new Error('Failed to fetch departments');
        return response.json();
    },

    createDepartment: async (dept: any) => {
        const response = await fetch(`${API_BASE_URL}/departments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dept),
        });
        if (!response.ok) throw new Error('Failed to create department');
        return response.json();
    },

    updateDepartment: async (id: string, dept: any) => {
        const response = await fetch(`${API_BASE_URL}/departments/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dept),
        });
        if (!response.ok) throw new Error('Failed to update department');
        return response.json();
    },

    deleteDepartment: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/departments/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete department');
        return response.json();
    },

    // --- SITES ---
    getSites: async () => {
        const response = await fetch(`${API_BASE_URL}/sites`);
        if (!response.ok) throw new Error('Failed to fetch sites');
        return response.json();
    },

    updateSite: async (id: string, site: any) => {
        const response = await fetch(`${API_BASE_URL}/sites/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(site),
        });
        if (!response.ok) throw new Error('Failed to update site');
        return response.json();
    },
    // --- CANDIDATURES ---
    getCandidatures: async () => {
        const response = await fetch(`${API_BASE_URL}/candidatures`);
        if (!response.ok) throw new Error('Failed to fetch candidatures');
        return response.json();
    },

    createCandidature: async (candidature: any) => {
        const response = await fetch(`${API_BASE_URL}/candidatures`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(candidature),
        });
        if (!response.ok) throw new Error('Failed to create candidature');
        return response.json();
    },

    // --- INTERVIEWS ---
    getAllInterviews: async () => {
        const response = await fetch(`${API_BASE_URL}/interviews`);
        if (!response.ok) throw new Error('Failed to fetch interviews');
        return response.json();
    },

    getInterviews: async (candidatureId: string) => {
        const response = await fetch(`${API_BASE_URL}/interviews/candidature/${candidatureId}`);
        if (!response.ok) throw new Error('Failed to fetch interviews');
        return response.json();
    },

    createInterview: async (interview: any) => {
        const response = await fetch(`${API_BASE_URL}/interviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(interview),
        });
        if (!response.ok) throw new Error('Failed to create interview');
        return response.json();
    },

    updateInterview: async (id: string, interview: any) => {
        const response = await fetch(`${API_BASE_URL}/interviews/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(interview),
        });
        if (!response.ok) throw new Error('Failed to update interview');
        return response.json();
    },

    deleteInterview: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/interviews/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete interview');
        return response.json();
    },

    // --- HIRING REQUESTS ---
    getHiringRequests: async () => {
        const response = await fetch(`${API_BASE_URL}/hiring-requests`);
        if (!response.ok) throw new Error('Failed to fetch hiring requests');
        return response.json();
    },

    createHiringRequest: async (request: any) => {
        const response = await fetch(`${API_BASE_URL}/hiring-requests`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request),
        });
        if (!response.ok) throw new Error('Failed to create hiring request');
        return response.json();
    },

    updateHiringRequest: async (id: string, request: any) => {
        const response = await fetch(`${API_BASE_URL}/hiring-requests/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request),
        });
        if (!response.ok) throw new Error('Failed to update hiring request');
        return response.json();
    },

    deleteHiringRequest: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/hiring-requests/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete hiring request');
        return response.json();
    }
};
