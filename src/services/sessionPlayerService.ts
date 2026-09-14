import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from "../types/database";

import { supabase } from "./supabase";

import {
  getPlayers,
  type Player,
} from "./playerService";

export type SessionPlayer =
  Tables<"session_players">;

export type SessionPlayerInsert =
  TablesInsert<"session_players">;

export type SessionPlayerUpdate =
  TablesUpdate<"session_players">;

export type SessionPlayerWithPlayer =
  SessionPlayer & {
    player: Player | null;
  };

/**
 * Get all players belonging to a session.
 *
 * Results are ordered by placement so the winner/
 * highest-ranked player appears first.
 */
export async function getSessionPlayers(
  sessionId: string
): Promise<SessionPlayer[]> {
  if (!sessionId) {
    throw new Error(
      "Session ID is required."
    );
  }

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
 * Get all players belonging to a session and
 * attach the corresponding player record.
 *
 * This keeps the relationship logic inside the
 * service instead of every screen having to
 * manually combine session_players + players.
 */
export async function getSessionPlayersWithPlayers(
  sessionId: string
): Promise<SessionPlayerWithPlayer[]> {
  if (!sessionId) {
    throw new Error(
      "Session ID is required."
    );
  }

  const [
    sessionPlayers,
    players,
  ] = await Promise.all([
    getSessionPlayers(sessionId),
    getPlayers(),
  ]);

  const playersById = new Map(
    players.map((player) => [
      player.id,
      player,
    ])
  );

  return sessionPlayers.map(
    (sessionPlayer) => ({
      ...sessionPlayer,
      player:
        playersById.get(
          sessionPlayer.player_id
        ) ?? null,
    })
  );
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
 * Add multiple players to a game session.
 *
 * Useful when recording a new session.
 */
export async function createSessionPlayers(
  sessionPlayers: SessionPlayerInsert[]
): Promise<SessionPlayer[]> {
  if (sessionPlayers.length === 0) {
    return [];
  }

  const { data, error } =
    await supabase
      .from("session_players")
      .insert(sessionPlayers)
      .select();

  if (error) {
    console.error(
      "Error creating session players:",
      error
    );

    throw error;
  }

  return data ?? [];
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
  if (!sessionId) {
    throw new Error(
      "Session ID is required."
    );
  }

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