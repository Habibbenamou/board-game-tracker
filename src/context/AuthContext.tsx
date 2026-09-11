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

import {
  signIn as authSignIn,
  signOut as authSignOut,
  signUp as authSignUp,
} from "../services/authService";

import { supabase } from "../services/supabase";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;

  signIn: (
    username: string,
    password: string
  ) => Promise<{
    error: Error | null;
  }>;

  signUp: (
    username: string,
    password: string,
    displayName: string
  ) => Promise<{
    error: Error | null;
    user: User | null;
    session: Session | null;
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

  /*
   * Load the existing Supabase session
   * when the app starts.
   */
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

    /*
     * Keep the React auth state synchronized
     * with Supabase.
     */
    const {
      data: {
        subscription,
      },
    } =
      supabase.auth.onAuthStateChange(
        (_event, newSession) => {
          if (mounted) {
            setSession(newSession);
          }
        }
      );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /*
   * Sign in using username + password.
   *
   * The actual username -> Supabase Auth
   * lookup/implementation stays inside
   * authService.ts.
   */
  async function signIn(
    username: string,
    password: string
  ) {
    try {
      await authSignIn(
        username.trim(),
        password
      );

      return {
        error: null,
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

  /*
   * Sign up using:
   *
   * username
   * password
   * display name
   *
   * authService is responsible for
   * creating the Supabase Auth user.
   */
  async function signUp(
    username: string,
    password: string,
    displayName: string
  ) {
    try {
      const data =
        await authSignUp(
          username.trim(),
          password,
          displayName.trim()
        );

      return {
        user: data.user,
        session: data.session,
        error: null,
      };
    } catch (error) {
      console.error(
        "Error signing up:",
        error
      );

      return {
        user: null,
        session: null,
        error:
          error instanceof Error
            ? error
            : new Error(
                "Unable to create account."
              ),
      };
    }
  }

  /*
   * Sign out the current user.
   */
  async function signOut() {
    try {
      await authSignOut();

      /*
       * Supabase's auth state listener will
       * also update the session to null.
       */
      return {
        error: null,
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
    <AuthContext.Provider
      value={value}
    >
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