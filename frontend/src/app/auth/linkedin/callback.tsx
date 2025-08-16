'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { signInWithCustomToken } from 'firebase/auth';

export default function LinkedInCallback() {
    const router = useRouter();

    useEffect(() => {
        const run = async () => {
            // After backend has redirected us with ?token=...
            const params = new URLSearchParams(window.location.search);
            const token = params.get('token');

            if (!token) {
                console.error("No custom token found in callback URL");
                router.push('/login'); // fallback if broken
                return;
            }

            try {
                // Sign in directly with the Firebase custom token
                await signInWithCustomToken(auth, token);

                // Redirect to dashboard (or recruiter dashboard if that's the flow)
                router.push('/dashboard/recruiter');
            } catch (err) {
                console.error("LinkedIn login failed", err);
                router.push('/login');
            }
        };
        run();
    }, [router]);

    return <div>Signing you in with LinkedIn…</div>;
}
