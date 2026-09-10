import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from "../types/database";

import { supabase } from "./supabase";

export type Player =
  Tables<"players">;

export type PlayerInsert =
  TablesInsert<"players">;

export type PlayerUpdate =
  TablesUpdate<"players">;


/**
 * Get all players visible to the
 * currently authenticated user.
 */
export async function getPlayers(): Promise<
  Player[]
> {
  const { data, error } =
    await supabase
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


/**
 * Get the player belonging to the
 * currently authenticated user.
 *
 * Every registered account should
 * have exactly one player record.
 */
export async function getMyPlayer(): Promise<
  Player | null
> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.error(
      "Error getting current user:",
      userError
    );

    throw userError;
  }

  if (!user) {
    throw new Error(
      "No authenticated user."
    );
  }

  const { data, error } =
    await supabase
      .from("players")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

  if (error) {
    console.error(
      "Error fetching current player:",
      error
    );

    throw error;
  }

  return data;
}


/**
 * Get a player by their ID.
 *
 * RLS determines whether the currently
 * authenticated user is allowed to see
 * this player.
 */
export async function getPlayerById(
  playerId: string
): Promise<Player | null> {
  if (!playerId) {
    throw new Error(
      "Player ID is required."
    );
  }

  const { data, error } =
    await supabase
      .from("players")
      .select("*")
      .eq("id", playerId)
      .maybeSingle();

  if (error) {
    console.error(
      "Error fetching player:",
      error
    );

    throw error;
  }

  return data;
}


/**
 * Create the player identity for
 * the currently authenticated user.
 */
export async function createMyPlayer(
  name: string,
  avatarUrl: string | null = null
): Promise<Player> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error(
      "No authenticated user."
    );
  }

  const trimmedName =
    name.trim();

  if (!trimmedName) {
    throw new Error(
      "Player name is required."
    );
  }

  const { data, error } =
    await supabase
      .from("players")
      .insert({
        user_id: user.id,
        name: trimmedName,
        avatar_url: avatarUrl,
      })
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


/**
 * Update the currently authenticated
 * user's player profile.
 */
export async function updateMyPlayer(
  updates: Pick<
    PlayerUpdate,
    "name" | "avatar_url"
  >
): Promise<Player> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error(
      "No authenticated user."
    );
  }

  const cleanedUpdates: Pick<
    PlayerUpdate,
    "name" | "avatar_url"
  > = {
    ...updates,
  };

  if (
    cleanedUpdates.name !== undefined
  ) {
    cleanedUpdates.name =
      cleanedUpdates.name.trim();

    if (!cleanedUpdates.name) {
      throw new Error(
        "Player name is required."
      );
    }
  }

  const { data, error } =
    await supabase
      .from("players")
      .update(cleanedUpdates)
      .eq("user_id", user.id)
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


/**
 * Update a player by their ID.
 *
 * Used for guest players that do not
 * have an authenticated user.
 *
 * RLS determines whether the current
 * user is allowed to update the player.
 */
export async function updatePlayer(
  playerId: string,
  updates: PlayerUpdate
): Promise<Player> {
  if (!playerId) {
    throw new Error(
      "Player ID is required."
    );
  }

  const cleanedUpdates: PlayerUpdate = {
    ...updates,
  };

  if (
    cleanedUpdates.name !== undefined
  ) {
    cleanedUpdates.name =
      cleanedUpdates.name.trim();

    if (!cleanedUpdates.name) {
      throw new Error(
        "Player name is required."
      );
    }
  }

  const { data, error } =
    await supabase
      .from("players")
      .update(cleanedUpdates)
      .eq("id", playerId)
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


/**
 * Create a guest player and add them
 * to the specified group.
 *
 * Guest players do not have an auth user,
 * so user_id remains null.
 */
export async function createGuestPlayer(
  groupId: string,
  name: string,
  avatarUrl: string | null = null
): Promise<Player> {
  if (!groupId) {
    throw new Error(
      "Group ID is required."
    );
  }

  const trimmedName =
    name.trim();

  if (!trimmedName) {
    throw new Error(
      "Player name is required."
    );
  }

  const {
    data: player,
    error: playerError,
  } =
    await supabase
      .from("players")
      .insert({
        user_id: null,
        name: trimmedName,
        avatar_url: avatarUrl,
      })
      .select()
      .single();

  if (playerError) {
    console.error(
      "Error creating guest player:",
      playerError
    );

    throw playerError;
  }

  const {
    error: membershipError,
  } = await supabase
    .from("group_members")
    .insert({
      group_id: groupId,
      player_id: player.id,
    });

  if (membershipError) {
    console.error(
      "Error adding guest player to group:",
      membershipError
    );

    await supabase
      .from("players")
      .delete()
      .eq("id", player.id);

    throw membershipError;
  }

  return player;
}


/**
 * Get all players belonging to
 * a specific group.
 */
export async function getPlayersByGroupId(
  groupId: string
): Promise<Player[]> {
  const { data, error } =
    await supabase
      .from("group_members")
      .select(
        `
          player_id,
          players (*)
        `
      )
      .eq(
        "group_id",
        groupId
      );

  if (error) {
    console.error(
      "Error fetching group players:",
      error
    );

    throw error;
  }

  return (
    data
      ?.map(
        (membership) =>
          membership.players
      )
      .filter(
        (
          player
        ): player is Player =>
          player !== null
      ) ?? []
  );
}
