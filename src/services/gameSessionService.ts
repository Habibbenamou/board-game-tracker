import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from "../types/database";

import type {
  QueryData,
} from "@supabase/supabase-js";

import { supabase } from "./supabase";

export type GameSession =
  Tables<"game_sessions">;

export type GameSessionInsert =
  TablesInsert<"game_sessions">;

export type GameSessionUpdate =
  TablesUpdate<"game_sessions">;


/**
 * Get all game sessions visible to
 * the currently authenticated user.
 */
export async function getGameSessions(): Promise<
  GameSession[]
> {
  const { data, error } =
    await supabase
      .from("game_sessions")
      .select("*")
      .order("played_at", {
        ascending: false,
      });

  if (error) {
    console.error(
      "Error fetching game sessions:",
      error
    );

    throw error;
  }

  return data ?? [];
}


/**
 * Get all sessions for a specific game.
 */
export async function getGameSessionsByGameId(
  gameId: string
): Promise<GameSession[]> {
  const { data, error } =
    await supabase
      .from("game_sessions")
      .select("*")
      .eq("game_id", gameId)
      .order("played_at", {
        ascending: false,
      });

  if (error) {
    console.error(
      "Error fetching game sessions for game:",
      error
    );

    throw error;
  }

  return data ?? [];
}


/**
 * Get game sessions with their game
 * and participating players.
 */
const gameSessionsWithDetailsQuery =
  supabase
    .from("game_sessions")
    .select(`
      *,
      games (
        id,
        name,
        category,
        image_url
      ),
      session_players (
        id,
        player_id,
        is_winner,
        placement,
        score,
        players (
          id,
          name,
          avatar_url
        )
      )
    `);

export type GameSessionWithDetails =
  QueryData<
    typeof gameSessionsWithDetailsQuery
  >[number];


/**
 * Get recent sessions for a group
 * with game and player information.
 */
export async function getGameSessionsByGroupId(
  groupId: string
): Promise<GameSessionWithDetails[]> {
  const { data, error } =
    await supabase
      .from("game_sessions")
      .select(`
        *,
        games (
          id,
          name,
          category,
          image_url
        ),
        session_players (
          id,
          player_id,
          is_winner,
          placement,
          score,
          players (
            id,
            name,
            avatar_url
          )
        )
      `)
      .eq("group_id", groupId)
      .order("played_at", {
        ascending: false,
      })
      .limit(10);

  if (error) {
    console.error(
      "Error fetching group game sessions:",
      error
    );

    throw error;
  }

  return data ?? [];
}


/**
 * Get a single game session.
 */
export async function getGameSessionById(
  id: string
): Promise<GameSession> {
  const { data, error } =
    await supabase
      .from("game_sessions")
      .select("*")
      .eq("id", id)
      .single();

  if (error) {
    console.error(
      "Error fetching game session:",
      error
    );

    throw error;
  }

  return data;
}


/**
 * Create a new game session.
 */
export async function createGameSession(
  session: GameSessionInsert
): Promise<GameSession> {
  const { data, error } =
    await supabase
      .from("game_sessions")
      .insert(session)
      .select()
      .single();

  if (error) {
    console.error(
      "Error creating game session:",
      error
    );

    throw error;
  }

  return data;
}


/**
 * Update a game session.
 *
 * The returned row is used to verify that
 * the UPDATE was actually allowed by RLS.
 */
export async function updateGameSession(
  id: string,
  updates: GameSessionUpdate
): Promise<GameSession> {
  const { data, error } =
    await supabase
      .from("game_sessions")
      .update(updates)
      .eq("id", id)
      .select("*");

  if (error) {
    console.error(
      "Error updating game session:",
      error
    );

    throw error;
  }

  /*
   * If RLS prevents the row from being updated,
   * Supabase can return an empty array without
   * a normal database error.
   */
  if (!data || data.length === 0) {
    const error = new Error(
      "Game session could not be updated. " +
      "The session may not exist or the current user " +
      "may not be allowed to update it."
    );

    console.error(
      "Game session update affected 0 rows:",
      {
        id,
        updates,
      }
    );

    throw error;
  }

  return data[0];
}


/**
 * Delete a game session.
 *
 * The returned row is used to verify that
 * the DELETE was actually allowed by RLS.
 */
export async function deleteGameSession(
  id: string
): Promise<void> {
  const { data, error } =
    await supabase
      .from("game_sessions")
      .delete()
      .eq("id", id)
      .select("id");

  if (error) {
    console.error(
      "Error deleting game session:",
      error
    );

    throw error;
  }

  /*
   * With RLS enabled, DELETE can match zero rows
   * when the row is not visible/allowed.
   */
  if (!data || data.length === 0) {
    const error = new Error(
      "Game session could not be deleted. " +
      "The session may not exist or the current user " +
      "may not be allowed to delete it."
    );

    console.error(
      "Game session delete affected 0 rows:",
      id
    );

    throw error;
  }
}