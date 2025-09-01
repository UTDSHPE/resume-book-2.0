// frontend/components/RoleRedirect.tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuth } from "firebase/auth";
import { app,auth, db, storage } from '@/lib/firebase'
import { useAuth } from "@/app/context/AuthContext";
import LoadingSpinner from "./LoadingSpinner";

export default function RoleRedirect() {
    const router = useRouter();
    const {user,userLoading} = useAuth();

    useEffect(() => {
        const user = auth.currentUser;

        if (!user) {
            router.replace("/login");
            return;
        }

        user.getIdTokenResult(true).then((idTokenResult) => {
            const role = idTokenResult.claims.role;
            if (!role) {
                router.replace("/redeem");
            } else {
                router.replace(`/dashboard/${role}`);
            }
        });
    }, [router]);

    return (
        <LoadingSpinner label="Redirecting to dashboard..."/>
    );
}
