import type {
    Tables,
    TablesInsert,
    TablesUpdate,
} from "../types/database";

import { supabase } from "./supabase";

export type Player = Tables<"players">;

export type PlayerInsert =
  TablesInsert<"players">;

export type PlayerUpdate =
  TablesUpdate<"players">;

export async function getPlayers(): Promise<
  Player[]
> {
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .order("name", {
      ascending: true,
    });

  if (error) {
    console.error(
      "Error fetching players:",
      error
    );

    throw error;
  }

  return data ?? [];
}

export async function getPlayerById(
  id: string
): Promise<Player> {
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(
      "Error fetching player:",
      error
    );

    throw error;
  }

  return data;
}

export async function createPlayer(
  player: PlayerInsert
): Promise<Player> {
  const { data, error } = await supabase
    .from("players")
    .insert(player)
    .select()
    .single();

  if (error) {
    console.error(
      "Error creating player:",
      error
    );

    throw error;
  }

  return data;
}

export async function updatePlayer(
  id: string,
  updates: PlayerUpdate
): Promise<Player> {
  const { data, error } = await supabase
    .from("players")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(
      "Error updating player:",
      error
    );

    throw error;
  }

  return data;
}

export async function deletePlayer(
  id: string
): Promise<void> {
  const { error } = await supabase
    .from("players")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(
      "Error deleting player:",
      error
    );

    throw error;
  }
}