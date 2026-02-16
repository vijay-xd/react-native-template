import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

type AuthContextType = {
    session: Session | null;
    user: User | null;
    isLoading: boolean;
    signInWithEmail: (email: string) => Promise<{ error: any }>;
    signInAnonymously: () => Promise<void>;
    signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// MOCK USER FOR DEV BYPASS
const MOCK_USER = {
    id: 'dev-user-id-123',
    email: 'dev@runnit.app',
    user_metadata: {
        username: 'DevRunner',
        avatar_url: null,
    },
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    app_metadata: {},
} as any;

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isBypassed, setIsBypassed] = useState(false);

    useEffect(() => {
        // 1. Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!isBypassed) {
                setSession(session);
                setUser(session?.user ?? null);
            }
            setIsLoading(false);
        });

        // 2. Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!isBypassed) {
                setSession(session);
                setUser(session?.user ?? null);
            }
            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
    }, [isBypassed]);

    const signInWithEmail = async (email: string) => {
        return supabase.auth.signInWithOtp({ email });
    };

    const signInAnonymously = async () => {
        setIsBypassed(true);
        const mockSession = {
            access_token: 'mock-token',
            refresh_token: 'mock-refresh',
            expires_in: 3600,
            token_type: 'bearer',
            user: MOCK_USER
        } as unknown as Session;

        // Monkey-patch Supabase to prevent client-side "Not authenticated" errors
        (supabase.auth as any).getUser = async () => ({ data: { user: MOCK_USER }, error: null });
        (supabase.auth as any).getSession = async () => ({ data: { session: mockSession }, error: null });

        setSession(mockSession);
        setUser(MOCK_USER);
    };

    const signOut = async () => {
        if (isBypassed) {
            setIsBypassed(false);
            setSession(null);
            setUser(null);
        } else {
            await supabase.auth.signOut();
        }
    };

    return (
        <AuthContext.Provider value={{ session, user, isLoading, signInWithEmail, signInAnonymously, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
