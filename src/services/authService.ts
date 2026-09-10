import { supabase } from "./supabase";

/**
 * Sign up a new user with email and password.
 */
export async function signUp(
  email: string,
  password: string,
  username: string
) {

  if (!username) {
    throw new Error(
      "Username is required."
    );
  }

  const {
    data,
    error,
  } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: {
        username,
      },
    },
  });

  if (error) {
    console.error(
      "Error signing up:",
      error
    );

    throw error;
  }

  return data;
}

/**
 * Sign in an existing user.
 */
export async function signIn(
  email: string,
  password: string
) {
  const { data, error } =
    await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

  if (error) {
    console.error(
      "Error signing in:",
      error
    );

    throw error;
  }

  return data;
}

/**
 * Sign out the current user.
 */
export async function signOut(): Promise<void> {
  const { error } =
    await supabase.auth.signOut();

  if (error) {
    console.error(
      "Error signing out:",
      error
    );

    throw error;
  }
}

/**
 * Get the currently authenticated user.
 */
export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error(
      "Error getting current user:",
      error
    );

    throw error;
  }

  return user;
}

/**
 * Get the current Supabase session.
 */
export async function getCurrentSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error(
      "Error getting current session:",
      error
    );

    throw error;
  }

  return session;
}