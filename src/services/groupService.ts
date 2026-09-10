import type {
  Tables,
  TablesInsert,
} from "../types/database";
import { getMyPlayer } from "./playerService";

import { supabase } from "./supabase";

export type Group =
  Tables<"groups">;

export type GroupMember =
  Tables<"group_members">;

export type GroupInsert =
  TablesInsert<"groups">;


/**
 * Get the currently authenticated user.
 */
async function getCurrentUser() {
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

  if (!user) {
    throw new Error(
      "No authenticated user."
    );
  }

  return user;
}


/**
 * Generate a simple 6-character
 * group join code.
 *
 * Characters that can easily be
 * confused are intentionally avoided.
 */
function generateJoinCode(): string {
  const characters =
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let code = "";

  for (let i = 0; i < 6; i++) {
    const index =
      Math.floor(
        Math.random() *
          characters.length
      );

    code += characters[index];
  }

  return code;
}


/**
 * Create a new group.
 *
 * The authenticated user becomes
 * the creator and first member.
 */
export async function createGroup(
  name: string
): Promise<Group> {
  const user =
    await getCurrentUser();

  const player = await getMyPlayer();

  if (!player) {
    throw new Error(
      "No player profile found for the current user."
    );
  }
  
  const trimmedName =
    name.trim();

  if (!trimmedName) {
    throw new Error(
      "Group name is required."
    );
  }

  for (
    let attempt = 0;
    attempt < 5;
    attempt++
  ) {
    const joinCode =
      generateJoinCode();

    const {
      data: group,
      error,
    } = await supabase
      .from("groups")
      .insert({
        name: trimmedName,
        join_code: joinCode,
        created_by: user.id,
      })
      .select()
      .single();

    if (!error && group) {
      const {
        error: memberError,
      } = await supabase
        .from("group_members")
        .insert({
          group_id: group.id,
          player_id: player.id,
        });

      if (memberError) {
        await supabase
          .from("groups")
          .delete()
          .eq(
            "id",
            group.id
          );

        console.error(
          "Error creating group membership:",
          memberError
        );

        throw memberError;
      }

      return group;
    }

    if (
      error?.code === "23505"
    ) {
      continue;
    }

    if (error) {
      console.error(
        "Error creating group:",
        error
      );

      throw error;
    }
  }

  throw new Error(
    "Unable to generate a unique group code."
  );
}


/**
 * Get all groups that the current
 * authenticated user belongs to.
 */
export async function getMyGroups(): Promise<
  Group[]
> {
  const player = await getMyPlayer();

  if (!player) {
    throw new Error(
      "No player profile found for the current user."
    );
  }
  const {
    data: memberships,
    error: membershipError,
  } = await supabase
    .from("group_members")
    .select("group_id")
    .eq(
      "player_id",
      player.id
    );

  if (membershipError) {
    console.error(
      "Error fetching group memberships:",
      membershipError
    );

    throw membershipError;
  }

  if (
    !memberships ||
    memberships.length === 0
  ) {
    return [];
  }

  const groupIds =
    memberships.map(
      (membership) =>
        membership.group_id
    );

  const {
    data,
    error,
  } = await supabase
    .from("groups")
    .select("*")
    .in(
      "id",
      groupIds
    );

  if (error) {
    console.error(
      "Error fetching groups:",
      error
    );

    throw error;
  }

  return data ?? [];
}


/**
 * Get the current user's membership
 * records.
 */
export async function getMyGroupMemberships(): Promise<
  GroupMember[]
> {
  const player = await getMyPlayer();

  if (!player) {
    throw new Error(
      "No player profile found for the current user."
    );
  }
  const {
    data,
    error,
  } = await supabase
    .from("group_members")
    .select("*")
    .eq(
      "player_id",
      player.id
    );

  if (error) {
    console.error(
      "Error fetching group memberships:",
      error
    );

    throw error;
  }

  return data ?? [];
}

/**
 * Join a group using its 6-character
 * join code.
 */
export async function joinGroup(
  joinCode: string
): Promise<Group> {
  const normalizedCode =
    joinCode
      .trim()
      .toUpperCase();

  if (!normalizedCode) {
    throw new Error(
      "Join code is required."
    );
  }

  const { data, error } =
    await supabase.rpc(
      "join_group",
      {
        p_join_code:
          normalizedCode,
      }
    );

  if (error) {
    console.error(
      "Error joining group:",
      error
    );

    if (
      error.message
        ?.toLowerCase()
        .includes("group not found")
    ) {
      throw new Error(
        "Group not found. Check the join code."
      );
    }

    throw error;
  }

  if (!data) {
    throw new Error(
      "Unable to join group."
    );
  }

  return data;
}


/**
 * Leave a group.
 */
export async function leaveGroup(
  groupId: string
): Promise<void> {
  const player = await getMyPlayer();

  if (!player) {
    throw new Error(
      "No player profile found for the current user."
    );
  }
  const {
    error,
  } = await supabase
    .from("group_members")
    .delete()
    .eq(
      "group_id",
      groupId
    )
    .eq(
      "player_id",
      player.id
    );

  if (error) {
    console.error(
      "Error leaving group:",
      error
    );

    throw error;
  }
}