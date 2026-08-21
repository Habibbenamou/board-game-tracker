import type { Tables, TablesInsert, TablesUpdate } from "../types/database";
import { supabase } from "./supabase";

export type Game = Tables<"games">;
export type GameInsert = TablesInsert<"games">;
export type GameUpdate = TablesUpdate<"games">;

export async function getGames(): Promise<Game[]> {
  const { data, error } = await supabase
    .from("games")
    .select("*")
    .order("name", {
      ascending: true,
    });

  if (error) {
    console.error("Error fetching games:", error);
    throw error;
  }

  return data ?? [];
}

export async function getGameById(
  id: string
): Promise<Game> {
  const { data, error } = await supabase
    .from("games")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching game:", error);
    throw error;
  }

  return data;
}

export async function createGame(
  game: GameInsert
): Promise<Game> {
  const { data, error } = await supabase
    .from("games")
    .insert(game)
    .select()
    .single();

  if (error) {
    console.error("Error creating game:", error);
    throw error;
  }

  return data;
}

export async function updateGame(
  id: string,
  updates: GameUpdate
): Promise<Game> {
  const { data, error } = await supabase
    .from("games")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating game:", error);
    throw error;
  }

  return data;
}

export async function deleteGame(
  id: string
): Promise<void> {
  const { error } = await supabase
    .from("games")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting game:", error);
    throw error;
  }
}