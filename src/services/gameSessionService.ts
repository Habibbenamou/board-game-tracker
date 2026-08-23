import type {
    Tables,
    TablesInsert,
    TablesUpdate,
} from "../types/database";

import { supabase } from "./supabase";

export type GameSession =
  Tables<"game_sessions">;

export type GameSessionInsert =
  TablesInsert<"game_sessions">;

export type GameSessionUpdate =
  TablesUpdate<"game_sessions">;

export async function getGameSessions(): Promise<
  GameSession[]
> {
  const { data, error } = await supabase
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

export async function getGameSessionsByGameId(
  gameId: string
): Promise<GameSession[]> {
  const { data, error } = await supabase
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

export async function getGameSessionById(
  id: string
): Promise<GameSession> {
  const { data, error } = await supabase
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

export async function createGameSession(
  session: GameSessionInsert
): Promise<GameSession> {
  const { data, error } = await supabase
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

export async function updateGameSession(
  id: string,
  updates: GameSessionUpdate
): Promise<GameSession> {
  const { data, error } = await supabase
    .from("game_sessions")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(
      "Error updating game session:",
      error
    );

    throw error;
  }

  return data;
}

export async function deleteGameSession(
  id: string
): Promise<void> {
  const { error } = await supabase
    .from("game_sessions")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(
      "Error deleting game session:",
      error
    );

    throw error;
  }
}