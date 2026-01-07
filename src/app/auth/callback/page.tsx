'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function AuthCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');

        if (accessToken && refreshToken) {
            if (typeof window !== 'undefined') {
                localStorage.setItem('token', accessToken);
                localStorage.setItem('refreshToken', refreshToken);

                // Force a page reload to ensure AuthProvider picks up the new token
                // Or simply redirect, and AuthProvider initialization will check localStorage
                window.location.href = '/';
            }
        } else {
            // Handle error or missing tokens
            console.error('Missing tokens in callback URL');
            router.push('/login?error=auth_failed');
        }
    }, [searchParams, router]);

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">Authenticating...</h2>
                <p className="text-gray-500">Please wait while we log you in.</p>
            </div>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AuthCallbackContent />
        </Suspense>
    );
}
