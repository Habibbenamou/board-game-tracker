import { supabase } from "./supabase";

export type LeaderboardPlayer = {
  id: string;
  name: string;
  avatar_url: string | null;
  games: number;
  wins: number;
  winRate: number;
};

export type LeaderboardFilters = {
  gameId?: string | null;
  startDate?: string | null;
};

export type GroupStats = {
  totalGames: number;
  totalPlayers: number;
  totalWins: number;
  mostPlayedGame: {
    id: string;
    name: string;
    games: number;
  } | null;
};

const PAGE_SIZE = 1000;

type SessionPlayerRow = {
  player_id: string;
  is_winner: boolean;
  session_id: string;
  game_sessions: {
    id: string;
    group_id: string;
    game_id: string;
    played_at: string;
    games: {
      id: string;
      name: string;
    } | null;
  } | null;
  players: {
    id: string;
    name: string;
    avatar_url: string | null;
  } | null;
};

async function getGroupSessionPlayers(
  groupId: string,
  filters?: LeaderboardFilters
): Promise<SessionPlayerRow[]> {
  const results: SessionPlayerRow[] = [];

  let from = 0;

  while (true) {
    const to = from + PAGE_SIZE - 1;

    let query = supabase
      .from("session_players")
      .select(`
        player_id,
        is_winner,
        session_id,
        players (
          id,
          name,
          avatar_url
        ),
        game_sessions!inner (
          id,
          group_id,
          game_id,
          played_at,
          games (
            id,
            name
          )
        )
      `)
      .eq(
        "game_sessions.group_id",
        groupId
      );

    if (filters?.gameId) {
      query = query.eq(
        "game_sessions.game_id",
        filters.gameId
      );
    }

    if (filters?.startDate) {
      query = query.gte(
        "game_sessions.played_at",
        filters.startDate
      );
    }

    const {
      data,
      error,
    } = await query.range(from, to);

    if (error) {
      console.error(
        "Error fetching group session players:",
        error
      );

      throw error;
    }

    const page =
      (data as SessionPlayerRow[]) ?? [];

    results.push(...page);

    if (page.length < PAGE_SIZE) {
      break;
    }

    from += PAGE_SIZE;
  }

  return results;
}

export async function getGroupLeaderboard(
  groupId: string,
  filters?: LeaderboardFilters
): Promise<LeaderboardPlayer[]> {
  if (!groupId) {
    throw new Error(
      "Group ID is required."
    );
  }

  const results =
    await getGroupSessionPlayers(
      groupId,
      filters
    );

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
        avatar_url:
          player.avatar_url,
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
          ? Math.round(
              (player.wins /
                player.games) *
                100
            )
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

export async function getGroupStats(
  groupId: string,
  filters?: LeaderboardFilters
): Promise<GroupStats> {
  if (!groupId) {
    throw new Error(
      "Group ID is required."
    );
  }

  const results =
    await getGroupSessionPlayers(
      groupId,
      filters
    );

  const sessionIds =
    new Set<string>();

  const playerIds =
    new Set<string>();

  const gameCounts: Record<
    string,
    {
      id: string;
      name: string;
      games: number;
    }
  > = {};

  let totalWins = 0;

  for (const result of results) {
    sessionIds.add(result.session_id);

    playerIds.add(result.player_id);

    if (result.is_winner) {
      totalWins += 1;
    }

    const game =
      result.game_sessions?.games;

    if (game) {
      if (!gameCounts[game.id]) {
        gameCounts[game.id] = {
          id: game.id,
          name: game.name,
          games: 0,
        };
      }
    }
  }

  /*
   * Count each game session once.
   *
   * session_players contains one row
   * per player, so we cannot simply count
   * the rows.
   */
  const countedSessions =
    new Set<string>();

  for (const result of results) {
    const session =
      result.game_sessions;

    if (!session) {
      continue;
    }

    if (
      countedSessions.has(
        session.id
      )
    ) {
      continue;
    }

    countedSessions.add(session.id);

    const game =
      session.games;

    if (game) {
      if (!gameCounts[game.id]) {
        gameCounts[game.id] = {
          id: game.id,
          name: game.name,
          games: 0,
        };
      }

      gameCounts[game.id].games += 1;
    }
  }

  const mostPlayedGame =
    Object.values(gameCounts)
      .sort(
        (a, b) =>
          b.games - a.games
      )[0] ?? null;

  return {
    totalGames:
      sessionIds.size,
    totalPlayers:
      playerIds.size,
    totalWins,
    mostPlayedGame,
  };
}