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

//  * Create the player identity for the
//  * currently authenticated user.
//  *
//  * Username:
//  * - unique
//  * - used for login
//  * - normalized to lowercase
//  *
//  * Display name:
//  * - shown throughout the app
//  * - can contain spaces
//  * - does not need to be unique
export async function createMyPlayer(
  username: string,
  displayName: string,
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

  const normalizedUsername =
    username.trim().toLowerCase();

  const trimmedDisplayName =
    displayName.trim();

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

  if (!trimmedDisplayName) {
    throw new Error(
      "Display name is required."
    );
  }

  /*
   * The database trigger normally creates
   * the player automatically when the Auth
   * user is created.
   *
   * We therefore first check whether the
   * player already exists.
   */
  const {
    data: existingPlayer,
    error: existingPlayerError,
  } =
    await supabase
      .from("players")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

  if (existingPlayerError) {
    console.error(
      "Error checking existing player:",
      existingPlayerError
    );

    throw existingPlayerError;
  }

  /*
   * Player already exists.
   *
   * Update it instead of trying to INSERT
   * another row with the same user_id.
   */
  if (existingPlayer) {
    const { data, error } =
      await supabase
        .from("players")
        .update({
          username:
            normalizedUsername,
          name: trimmedDisplayName,
          avatar_url: avatarUrl,
        })
        .eq("id", existingPlayer.id)
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

  /*
   * Fallback:
   * If the trigger didn't create the
   * player for some reason, create it here.
   */
  const { data, error } =
    await supabase
      .from("players")
      .insert({
        user_id: user.id,
        username:
          normalizedUsername,
        name: trimmedDisplayName,
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
 *
 * Username is intentionally not updated
 * here for the MVP. This keeps username
 * changes out of the initial implementation.
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
 * This is performed through a database
 * function so that creating the player
 * and adding them to the group happen
 * as one operation.
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
    data,
    error,
  } = await (supabase.rpc as any)(
    "create_guest_player",
    {
      p_group_id: groupId,
      p_name: trimmedName,
      p_avatar_url: avatarUrl,
    }
  );

  if (error) {
    console.error(
      "Error creating guest player:",
      error
    );

    throw error;
  }

  if (!data) {
    throw new Error(
      "Guest player was not created."
    );
  }

  return data as Player;
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