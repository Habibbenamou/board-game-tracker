import type {
    Tables,
    TablesInsert,
} from "../types/database";

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

  const trimmedName =
    name.trim();

  if (!trimmedName) {
    throw new Error(
      "Group name is required."
    );
  }

  /*
   * Try a few times in the extremely
   * unlikely event that a generated
   * join code already exists.
   */
  for (let attempt = 0; attempt < 5; attempt++) {
    const joinCode =
      generateJoinCode();

    const { data: group, error } =
      await supabase
        .from("groups")
        .insert({
          name: trimmedName,
          join_code: joinCode,
          created_by: user.id,
        })
        .select()
        .single();

    if (!error && group) {
      /*
       * Add the creator as the first
       * member of the group.
       */
      const { error: memberError } =
        await supabase
          .from("group_members")
          .insert({
            group_id: group.id,
            user_id: user.id,
          });

      if (memberError) {
        /*
         * If membership creation fails,
         * remove the group we just created.
         */
        await supabase
          .from("groups")
          .delete()
          .eq("id", group.id);

        console.error(
          "Error creating group membership:",
          memberError
        );

        throw memberError;
      }

      return group;
    }

    /*
     * PostgreSQL unique violation.
     * Try another join code.
     */
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
  const user =
    await getCurrentUser();

  const {
    data: memberships,
    error: membershipError,
  } = await supabase
    .from("group_members")
    .select("group_id")
    .eq(
      "user_id",
      user.id
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

  const { data, error } =
    await supabase
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
  const user =
    await getCurrentUser();

  const { data, error } =
    await supabase
      .from("group_members")
      .select("*")
      .eq(
        "user_id",
        user.id
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
  const user =
    await getCurrentUser();

  const { error } =
    await supabase
      .from("group_members")
      .delete()
      .eq(
        "group_id",
        groupId
      )
      .eq(
        "user_id",
        user.id
      );

  if (error) {
    console.error(
      "Error leaving group:",
      error
    );

    throw error;
  }
}