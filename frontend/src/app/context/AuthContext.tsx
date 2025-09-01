// frontend/context/AuthContext.tsx
"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, getIdTokenResult } from "firebase/auth";
import { auth } from "@/lib/firebase";

//firebase user contains their UID, email, connected name, 
//photURL if set,providerData(which auth provider)
//Has methods getIdToken
type AuthContextType = {
    user: any | null;//firebase user contains their UID, email, connected name, photURL if set,providerData(which auth provider)
};

const AuthContext = createContext<AuthContextType>({
    user: null,
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<any | null>(null);

    useEffect(() => {
        // Firebase listener: fires on login, logout, refresh
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const tokenResult = await getIdTokenResult(firebaseUser, true);
                setUser(firebaseUser);
                
            } else {
                setUser(null);
                
            }
            
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user}}>
            {children}
        </AuthContext.Provider>
    );
}

// easy hook
export function useAuth() {
    return useContext(AuthContext);
}
