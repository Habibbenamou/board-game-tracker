import { supabase } from "./supabase";

function normalizeUsername(
  username: string
): string {
  return username
    .trim()
    .toLowerCase();
}

function getAuthIdentifier(
  username: string
): string {
  const normalizedUsername =
    normalizeUsername(username);

  return `${normalizedUsername}@boardgametracker.local`;
}

function validateUsername(
  username: string
): string {
  const normalizedUsername =
    normalizeUsername(username);

  if (!normalizedUsername) {
    throw new Error(
      "Username is required."
    );
  }

  if (normalizedUsername.length < 3) {
    throw new Error(
      "Username must contain at least 3 characters."
    );
  }

  if (
    !/^[a-zA-Z0-9_]+$/.test(
      normalizedUsername
    )
  ) {
    throw new Error(
      "Username can only contain letters, numbers, and underscores."
    );
  }

  return normalizedUsername;
}

async function usernameExists(
  username: string
): Promise<boolean> {
  const normalizedUsername =
    normalizeUsername(username);

  const { data, error } =
    await supabase
      .from("players")
      .select("id")
      .eq(
        "username",
        normalizedUsername
      )
      .limit(1);

  if (error) {
    throw error;
  }

  return (
    data !== null &&
    data.length > 0
  );
}

export async function signUp(
  username: string,
  password: string,
  displayName: string
) {
  const normalizedUsername =
    validateUsername(username);

  const trimmedDisplayName =
    displayName.trim();

  if (!trimmedDisplayName) {
    throw new Error(
      "Display name is required."
    );
  }

  if (!password) {
    throw new Error(
      "Password is required."
    );
  }

  const exists =
    await usernameExists(
      normalizedUsername
    );

  if (exists) {
    throw new Error(
      "Username is already taken."
    );
  }

  const authIdentifier =
    getAuthIdentifier(
      normalizedUsername
    );

  const { data, error } =
    await supabase.auth.signUp({
      email: authIdentifier,
      password,
      options: {
        data: {
          username:
            normalizedUsername,
          display_name:
            trimmedDisplayName,
        },
      },
    });

  if (error) {
    throw error;
  }

  return data;
}

export async function signIn(
  username: string,
  password: string
) {
  const normalizedUsername =
    validateUsername(username);

  if (!password) {
    throw new Error(
      "Password is required."
    );
  }

  const authIdentifier =
    getAuthIdentifier(
      normalizedUsername
    );

  const { data, error } =
    await supabase.auth.signInWithPassword({
      email: authIdentifier,
      password,
    });

  if (error) {
    throw error;
  }

  return data;
}

export async function signOut() {
  const { error } =
    await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  return user;
}

export async function getCurrentSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return session;
}