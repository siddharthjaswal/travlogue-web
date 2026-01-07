import api from '@/lib/api';

export interface User {
    id: number;
    email: string;
    name?: string;
    picture?: string;
}

export interface AuthResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
    user: User;
}

export const authService = {
    // Login with Google (redirect)
    loginWithGoogle: () => {
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/auth/google`;
    },

    // Handle Google Callback
    handleGoogleCallback: async (params: string) => {
        // This typically involves sending the code to backend if not handled by cookie session
        // But in our current backend, /auth/google/callback returns JSON with tokens
        // So we need to call it via API wrapper if we want to capture the tokens
        // OR we let the browser hit it and if it returns JSON, we display it?
        // Actually, usually the callback should be handled by the frontend exchanging the code
        // OR the backend redirecting to frontend with tokens in URL params.

        // Given the Python backend returns JSON directly on GET /callback:
        // We should probably hit that endpoint with the params from frontend.
        const response = await api.get<AuthResponse>(`/auth/google/callback${params}`);
        return response.data;
    },

    // Logout
    logout: async () => {
        try {
            await api.post('/auth/logout');
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
        }
    },

    // Get current user
    getCurrentUser: async () => {
        const response = await api.get<any>('/users/me');
        const data = response.data;

        // Map backend response to frontend User interface
        const user: User = {
            id: data.id,
            email: data.email,
            name: data.first_name ? `${data.first_name} ${data.last_name || ''}`.trim() : data.username,
            picture: data.profile_photo_url,
        };
        return user;
    }
};
