
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8080/api';

export const api = {
    // --- USERS ---
    login: async (email: string, password: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                // Try to get error message from response
                let errorMessage = 'Invalid email or password';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorData.error || errorMessage;
                } catch {
                    // If response is not JSON, use status text
                    errorMessage = response.statusText || errorMessage;
                }
                throw new Error(errorMessage);
            }

            const userData = await response.json();
            return userData;
        } catch (error: any) {
            // Handle network errors
            if (error instanceof TypeError && error.message.includes('fetch')) {
                throw new Error('Unable to connect to server. Please check if the backend is running on http://127.0.0.1:8080');
            }
            // Re-throw other errors (including our custom Error from above)
            throw error;
        }
    },

    getUsers: async (page = 1, limit = 10) => {
        const response = await fetch(`${API_BASE_URL}/users?page=${page}&limit=${limit}`);
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

    updateUserPassword: async (id: string, password: string) => {
        const response = await fetch(`${API_BASE_URL}/users/${id}/password`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password }),
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Failed to update password' }));
            throw new Error(error.message || 'Failed to update password');
        }
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
    getDepartments: async (page?: number, limit?: number) => {
        let url = `${API_BASE_URL}/departments`;
        if (page && limit) {
            url += `?page=${page}&limit=${limit}`;
        }
        const response = await fetch(url);
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
    getCandidatures: async (page?: number, limit?: number, department?: string, search?: string, status?: string) => {
        let url = `${API_BASE_URL}/candidatures`;
        const params = new URLSearchParams();
        if (page) params.append('page', page.toString());
        if (limit) params.append('limit', limit.toString());
        if (department) params.append('department', department);
        if (search) params.append('search', search);
        if (status) params.append('status', status);

        if (params.toString()) url += `?${params.toString()}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch candidatures');
        return response.json();
    },

    createCandidature: async (candidature: any) => {
        const isFormData = candidature instanceof FormData;
        const response = await fetch(`${API_BASE_URL}/candidatures`, {
            method: 'POST',
            headers: isFormData ? {} : { 'Content-Type': 'application/json' },
            body: isFormData ? candidature : JSON.stringify(candidature),
        });
        if (!response.ok) throw new Error('Failed to create candidature');
        return response.json();
    },

    updateCandidature: async (id: string, candidature: any) => {
        const isFormData = candidature instanceof FormData;
        const response = await fetch(`${API_BASE_URL}/candidatures/${id}`, {
            method: 'PUT',
            headers: isFormData ? {} : { 'Content-Type': 'application/json' },
            body: isFormData ? candidature : JSON.stringify(candidature),
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Failed to update candidature' }));
            throw new Error(error.message || 'Failed to update candidature');
        }
        return response.json();
    },

    deleteCandidature: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/candidatures/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete candidature');
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
    getHiringRequests: async (page?: number, limit?: number, requesterId?: string, search?: string, department?: string, site?: string) => {
        let url = `${API_BASE_URL}/hiring-requests`;
        const params = new URLSearchParams();
        if (page) params.append('page', page.toString());
        if (limit) params.append('limit', limit.toString());
        if (requesterId) params.append('requesterId', requesterId);
        if (search) params.append('search', search);
        if (department) params.append('department', department);
        if (site) params.append('site', site);

        if (params.toString()) url += `?${params.toString()}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch hiring requests');
        return response.json();
    },

    getHiringRequestById: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/hiring-requests/${id}`);
        if (!response.ok) {
            console.error(`Failed to fetch hiring request: ${response.status} ${response.statusText} for ID: ${id}`);
            throw new Error(`Failed to fetch hiring request: ${response.status}`);
        }
        return response.json();
    },

    createHiringRequest: async (request: any) => {
        const response = await fetch(`${API_BASE_URL}/hiring-requests`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request),
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || `Failed to create hiring request: ${response.status}`);
        }
        return response.json();
    },

    updateHiringRequest: async (id: string, request: any) => {
        const response = await fetch(`${API_BASE_URL}/hiring-requests/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request),
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Failed to update hiring request');
        }
        return response.json();
    },

    deleteHiringRequest: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/hiring-requests/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete hiring request');
        return response.json();
    },

    // --- NOTIFICATIONS ---
    getNotifications: async (receiverId: string) => {
        const response = await fetch(`${API_BASE_URL}/notifications/${receiverId}`);
        if (!response.ok) throw new Error('Failed to fetch notifications');
        return response.json();
    },

    getUnreadCount: async (receiverId: string) => {
        const response = await fetch(`${API_BASE_URL}/notifications/${receiverId}/unread-count`);
        if (!response.ok) throw new Error('Failed to fetch unread count');
        return response.json();
    },

    createNotification: async (notification: { senderId: string; receiverId: string; message: string }) => {
        const response = await fetch(`${API_BASE_URL}/notifications`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(notification),
        });
        if (!response.ok) throw new Error('Failed to create notification');
        return response.json();
    },

    markAsRead: async (notificationId: string) => {
        const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
            method: 'PUT',
        });
        if (!response.ok) throw new Error('Failed to mark notification as read');
        return response.json();
    },

    markAllAsRead: async (receiverId: string) => {
        const response = await fetch(`${API_BASE_URL}/notifications/${receiverId}/read-all`, {
            method: 'PUT',
        });
        if (!response.ok) throw new Error('Failed to mark all as read');
        return response.json();
    },

    deleteNotification: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/notifications/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete notification');
        return response.json();
    },

    // --- ROLES ---
    getRoles: async () => {
        const response = await fetch(`${API_BASE_URL}/roles`);
        if (!response.ok) throw new Error('Failed to fetch roles');
        return response.json();
    },

    createRole: async (role: any) => {
        const response = await fetch(`${API_BASE_URL}/roles`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(role),
        });
        if (!response.ok) throw new Error('Failed to create role');
        return response.json();
    },

    updateRole: async (id: string, role: any) => {
        const response = await fetch(`${API_BASE_URL}/roles/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(role),
        });
        if (!response.ok) throw new Error('Failed to update role');
        return response.json();
    },

    deleteRole: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/roles/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Failed to delete role' }));
            throw new Error(error.message || 'Failed to delete role');
        }
        return response.json();
    },

    // --- POSTS ---
    getPosts: async (departmentId?: string, status?: string) => {
        let url = `${API_BASE_URL}/posts`;
        const params = new URLSearchParams();
        if (departmentId) params.append('departmentId', departmentId);
        if (status) params.append('status', status);

        if (params.toString()) url += `?${params.toString()}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch posts');
        return response.json();
    },

    getPostById: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/posts/${id}`);
        if (!response.ok) throw new Error('Failed to fetch post');
        return response.json();
    },

    createPost: async (post: any) => {
        const response = await fetch(`${API_BASE_URL}/posts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(post),
        });
        if (!response.ok) throw new Error('Failed to create post');
        return response.json();
    },

    updatePost: async (id: string, post: any) => {
        const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(post),
        });
        if (!response.ok) throw new Error('Failed to update post');
        return response.json();
    },

    deletePost: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete post');
        return response.json();
    }
};
