import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";

import type {
    Session,
    User,
} from "@supabase/supabase-js";

import { supabase } from "../services/supabase";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;

  signIn: (
    email: string,
    password: string
  ) => Promise<{
    error: Error | null;
  }>;

  signUp: (
    email: string,
    password: string
  ) => Promise<{
    error: Error | null;
    user: User | null;
  }>;

  signOut: () => Promise<{
    error: Error | null;
  }>;
};

const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined
  );

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [session, setSession] =
    useState<Session | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      try {
        const {
          data,
          error,
        } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (mounted) {
          setSession(data.session);
        }
      } catch (error) {
        console.error(
          "Error loading auth session:",
          error
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadSession();

    const {
      data: {
        subscription,
      },
    } =
      supabase.auth.onAuthStateChange(
        (_event, newSession) => {
          setSession(newSession);
        }
      );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function signIn(
    email: string,
    password: string
  ) {
    try {
      const {
        error,
      } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      return {
        error: error
          ? new Error(error.message)
          : null,
      };
    } catch (error) {
      console.error(
        "Error signing in:",
        error
      );

      return {
        error:
          error instanceof Error
            ? error
            : new Error(
                "Unable to sign in."
              ),
      };
    }
  }

  async function signUp(
    email: string,
    password: string
  ) {
    try {
      const {
        data,
        error,
      } =
        await supabase.auth.signUp({
          email,
          password,
        });

      return {
        user: data.user,
        error: error
          ? new Error(error.message)
          : null,
      };
    } catch (error) {
      console.error(
        "Error signing up:",
        error
      );

      return {
        user: null,
        error:
          error instanceof Error
            ? error
            : new Error(
                "Unable to create account."
              ),
      };
    }
  }

  async function signOut() {
    try {
      const {
        error,
      } = await supabase.auth.signOut();

      return {
        error: error
          ? new Error(error.message)
          : null,
      };
    } catch (error) {
      console.error(
        "Error signing out:",
        error
      );

      return {
        error:
          error instanceof Error
            ? error
            : new Error(
                "Unable to sign out."
              ),
      };
    }
  }

  const value: AuthContextType = {
    session,
    user: session?.user ?? null,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}