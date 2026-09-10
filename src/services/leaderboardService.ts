import { supabase } from "./supabase";

export type LeaderboardPlayer = {
  id: string;
  name: string;
  avatar_url: string | null;
  games: number;
  wins: number;
  winRate: number;
};

const PAGE_SIZE = 1000;

export async function getGroupLeaderboard(
  groupId: string
): Promise<LeaderboardPlayer[]> {
  const results: {
    player_id: string;
    is_winner: boolean;
    players: {
      id: string;
      name: string;
      avatar_url: string | null;
    } | null;
  }[] = [];

  let from = 0;

  while (true) {
    const to = from + PAGE_SIZE - 1;

    const { data, error } = await supabase
      .from("session_players")
      .select(`
        player_id,
        is_winner,
        players (
          id,
          name,
          avatar_url
        ),
        game_sessions!inner (
          group_id
        )
      `)
      .eq("game_sessions.group_id", groupId)
      .range(from, to);

    if (error) {
      console.error(
        "Error fetching group leaderboard:",
        error
      );
      throw error;
    }

    const page = data ?? [];

    results.push(...page);

    if (page.length < PAGE_SIZE) {
      break;
    }

    from += PAGE_SIZE;
  }

  const leaderboard: Record<
    string,
    {
      id: string;
      name: string;
      avatar_url: string | null;
      games: number;
      wins: number;
    }
  > = {};

  for (const result of results) {
    const player = result.players;

    if (!player) {
      continue;
    }

    if (!leaderboard[player.id]) {
      leaderboard[player.id] = {
        id: player.id,
        name: player.name,
        avatar_url: player.avatar_url,
        games: 0,
        wins: 0,
      };
    }

    leaderboard[player.id].games += 1;

    if (result.is_winner) {
      leaderboard[player.id].wins += 1;
    }
  }

  return Object.values(leaderboard)
    .map((player) => ({
      ...player,
      winRate:
        player.games > 0
          ? Math.round((player.wins / player.games) * 100)
          : 0,
    }))
    .sort((a, b) => {
      if (b.wins !== a.wins) {
        return b.wins - a.wins;
      }

      if (b.winRate !== a.winRate) {
        return b.winRate - a.winRate;
      }

      return b.games - a.games;
    });
}