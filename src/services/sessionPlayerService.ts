import type {
    Tables,
    TablesInsert,
    TablesUpdate,
} from "../types/database";

import { supabase } from "./supabase";

export type SessionPlayer =
  Tables<"session_players">;

export type SessionPlayerInsert =
  TablesInsert<"session_players">;

export type SessionPlayerUpdate =
  TablesUpdate<"session_players">;

/**
 * Get all players belonging to a session.
 */
export async function getSessionPlayers(
  sessionId: string
): Promise<SessionPlayer[]> {
  const { data, error } =
    await supabase
      .from("session_players")
      .select("*")
      .eq("session_id", sessionId)
      .order("placement", {
        ascending: true,
        nullsFirst: false,
      });

  if (error) {
    console.error(
      "Error fetching session players:",
      error
    );

    throw error;
  }

  return data ?? [];
}

/**
 * Add a player to a game session.
 */
export async function createSessionPlayer(
  sessionPlayer: SessionPlayerInsert
): Promise<SessionPlayer> {
  const { data, error } =
    await supabase
      .from("session_players")
      .insert(sessionPlayer)
      .select()
      .single();

  if (error) {
    console.error(
      "Error creating session player:",
      error
    );

    throw error;
  }

  return data;
}

/**
 * Update a player's result in a session.
 */
export async function updateSessionPlayer(
  id: string,
  updates: SessionPlayerUpdate
): Promise<SessionPlayer> {
  const { data, error } =
    await supabase
      .from("session_players")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

  if (error) {
    console.error(
      "Error updating session player:",
      error
    );

    throw error;
  }

  return data;
}

/**
 * Delete one player from a session.
 */
export async function deleteSessionPlayer(
  id: string
): Promise<void> {
  const { error } =
    await supabase
      .from("session_players")
      .delete()
      .eq("id", id);

  if (error) {
    console.error(
      "Error deleting session player:",
      error
    );

    throw error;
  }
}

/**
 * Delete all players belonging to a session.
 *
 * Useful when editing a session and replacing
 * its participant list.
 */
export async function deleteSessionPlayers(
  sessionId: string
): Promise<void> {
  const { error } =
    await supabase
      .from("session_players")
      .delete()
      .eq("session_id", sessionId);

  if (error) {
    console.error(
      "Error deleting session players:",
      error
    );

    throw error;
  }
}