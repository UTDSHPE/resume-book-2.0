// frontend/context/AuthContext.tsx
"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, getIdTokenResult } from "firebase/auth";
import { auth } from "@/lib/firebase";

type AuthContextType = {
    user: any | null;
    role: string | null;
    loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    role: null,
    loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<any | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Firebase listener: fires on login, logout, refresh
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const tokenResult = await getIdTokenResult(firebaseUser, true);
                setUser(firebaseUser);
                setRole(tokenResult.claims.role as string || null);
            } else {
                setUser(null);
                setRole(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, role, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

// easy hook
export function useAuth() {
    return useContext(AuthContext);
}
