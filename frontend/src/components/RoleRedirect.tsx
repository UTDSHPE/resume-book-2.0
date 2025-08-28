// frontend/components/RoleRedirect.tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuth } from "firebase/auth";
import { app,auth, db, storage } from '@/lib/firebase'
import { useAuth } from "@/app/context/AuthContext";

export default function RoleRedirect() {
    const router = useRouter();
    const {user,role,loading} = useAuth();

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
        <div className="bg-white flex items-center  min-h-screen w-full">
            <span className="loading loading-spinner mx-auto loading-xl text-primary"></span>
        </div>
    );
}
