import { supabase } from "./supabase";

export type HomeStats = {
  gamesPlayed: number;
  players: number;
  myWins: number;
  myWinRate: number;
};

export type RecentGame = {
  id: string;
  name: string;
  category: string | null;
  image_url: string | null;
  gamesPlayed: number;
};


/**
 * Get statistics for a specific group.
 */
export async function getGroupStats(
  groupId: string
): Promise<HomeStats> {
  /*
   * Get the current user's player.
   */
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

  /*
   * Get the player's ID.
   */
  const {
    data: player,
    error: playerError,
  } = await supabase
    .from("players")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (playerError) {
    throw playerError;
  }

  /*
   * Get the number of players
   * in the group.
   */
  const {
    data: members,
    error: membersError,
  } = await supabase
    .from("group_members")
    .select("player_id")
    .eq("group_id", groupId);

  if (membersError) {
    throw membersError;
  }

  /*
   * Get all sessions for this group.
   */
  const {
    data: sessions,
    error: sessionsError,
  } = await supabase
    .from("game_sessions")
    .select("id")
    .eq("group_id", groupId);

  if (sessionsError) {
    throw sessionsError;
  }

  const sessionIds =
    sessions?.map(
      (session) => session.id
    ) ?? [];

  /*
   * No sessions yet.
   */
  if (sessionIds.length === 0) {
    return {
      gamesPlayed: 0,
      players:
        members?.length ?? 0,
      myWins: 0,
      myWinRate: 0,
    };
  }

  /*
   * Get this player's results
   * from those sessions.
   */
  const {
    data: myResults,
    error: resultsError,
  } = await supabase
    .from("session_players")
    .select("is_winner")
    .eq("player_id", player.id)
    .in(
      "session_id",
      sessionIds
    );

  if (resultsError) {
    throw resultsError;
  }

  const gamesPlayed =
    sessionIds.length;

  const gamesParticipated =
    myResults?.length ?? 0;

  const myWins =
    myResults?.filter(
      (result) =>
        result.is_winner
    ).length ?? 0;

  return {
    gamesPlayed,
    players:
      members?.length ?? 0,
    myWins,
    myWinRate:
      gamesParticipated > 0
        ? Math.round(
            (myWins /
              gamesParticipated) *
              100
          )
        : 0,
  };
}