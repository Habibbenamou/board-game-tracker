import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import {
  useFocusEffect,
} from "expo-router";

import {
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  colors,
  radius,
  spacing,
} from "../../constants/theme";

import {
  getGamesByGroupId,
  type Game,
} from "../../services/gameService";

import {
  getGroupLeaderboard,
  getGroupStats,
  type GroupStats,
  type LeaderboardPlayer,
} from "../../services/leaderboardService";

import { useGroup } from "../../context/GroupContext";

type TimeFilter =
  | "all"
  | "30"
  | "90";

export default function LeaderboardScreen() {
  const {
    currentGroup,
  } = useGroup();

  const [games, setGames] =
    useState<Game[]>([]);

  const [leaderboard, setLeaderboard] =
    useState<LeaderboardPlayer[]>(
      []
    );

  const [stats, setStats] =
    useState<GroupStats | null>(
      null
    );

  const [selectedGameId, setSelectedGameId] =
    useState<string | null>(null);

  const [timeFilter, setTimeFilter] =
    useState<TimeFilter>("all");

  const [loading, setLoading] =
    useState(true);

  const [filterLoading, setFilterLoading] =
    useState(false);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [
      currentGroup?.id,
    ])
  );

  async function loadData() {
    if (!currentGroup) {
      setGames([]);
      setLeaderboard([]);
      setStats(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const gamesData =
        await getGamesByGroupId(
          currentGroup.id
        );

      setGames(gamesData);

      await loadLeaderboardData(
        currentGroup.id,
        selectedGameId,
        timeFilter
      );
    } catch (error) {
      console.error(
        "Error loading leaderboard:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadLeaderboardData(
    groupId: string,
    gameId: string | null,
    selectedTime: TimeFilter
  ) {
    try {
      setFilterLoading(true);

      const startDate =
        getStartDate(selectedTime);

      const filters = {
        gameId,
        startDate,
      };

      const [
        leaderboardData,
        statsData,
      ] = await Promise.all([
        getGroupLeaderboard(
          groupId,
          filters
        ),
        getGroupStats(
          groupId,
          filters
        ),
      ]);

      setLeaderboard(
        leaderboardData
      );

      setStats(statsData);
    } catch (error) {
      console.error(
        "Error loading leaderboard data:",
        error
      );
    } finally {
      setFilterLoading(false);
    }
  }

  function getStartDate(
    filter: TimeFilter
  ): string | null {
    if (filter === "all") {
      return null;
    }

    const date =
      new Date();

    date.setDate(
      date.getDate() -
        Number(filter)
    );

    return date.toISOString();
  }

  async function handleGameFilter(
    gameId: string | null
  ) {
    if (!currentGroup) {
      return;
    }

    setSelectedGameId(gameId);

    await loadLeaderboardData(
      currentGroup.id,
      gameId,
      timeFilter
    );
  }

  async function handleTimeFilter(
    filter: TimeFilter
  ) {
    if (!currentGroup) {
      return;
    }

    setTimeFilter(filter);

    await loadLeaderboardData(
      currentGroup.id,
      selectedGameId,
      filter
    );
  }

  const selectedGameName =
    useMemo(() => {
      if (!selectedGameId) {
        return "All games";
      }

      return (
        games.find(
          (game) =>
            game.id ===
            selectedGameId
        )?.name ??
        "All games"
      );
    }, [
      games,
      selectedGameId,
    ]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />

        <Text style={styles.loadingText}>
          Loading stats...
        </Text>
      </View>
    );
  }

  if (!currentGroup) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyEmoji}>
          👥
        </Text>

        <Text style={styles.emptyTitle}>
          No group selected
        </Text>

        <Text style={styles.emptyText}>
          Select or join a group to see
          its statistics.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.content
        }
      >
        <Text style={styles.title}>
          Stats & Leaderboard
        </Text>

        <Text style={styles.subtitle}>
          {currentGroup.name}
        </Text>

        {/* Filters */}

        <Text style={styles.filterTitle}>
          Filters
        </Text>

        <Text style={styles.filterLabel}>
          Game
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.filterRow
          }
        >
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedGameId === null &&
                styles.filterChipSelected,
            ]}
            onPress={() =>
              handleGameFilter(null)
            }
            disabled={filterLoading}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedGameId === null &&
                  styles.filterChipTextSelected,
              ]}
            >
              All Games
            </Text>
          </TouchableOpacity>

          {games.map((game) => (
            <TouchableOpacity
              key={game.id}
              style={[
                styles.filterChip,
                selectedGameId ===
                  game.id &&
                  styles.filterChipSelected,
              ]}
              onPress={() =>
                handleGameFilter(
                  game.id
                )
              }
              disabled={filterLoading}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedGameId ===
                    game.id &&
                    styles.filterChipTextSelected,
                ]}
                numberOfLines={1}
              >
                {game.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.filterLabel}>
          Period
        </Text>

        <View style={styles.periodRow}>
          <TouchableOpacity
            style={[
              styles.periodButton,
              timeFilter === "all" &&
                styles.periodButtonSelected,
            ]}
            onPress={() =>
              handleTimeFilter(
                "all"
              )
            }
            disabled={filterLoading}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.periodButtonText,
                timeFilter === "all" &&
                  styles.periodButtonTextSelected,
              ]}
            >
              All time
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.periodButton,
              timeFilter === "30" &&
                styles.periodButtonSelected,
            ]}
            onPress={() =>
              handleTimeFilter(
                "30"
              )
            }
            disabled={filterLoading}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.periodButtonText,
                timeFilter === "30" &&
                  styles.periodButtonTextSelected,
              ]}
            >
              30 days
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.periodButton,
              timeFilter === "90" &&
                styles.periodButtonSelected,
            ]}
            onPress={() =>
              handleTimeFilter(
                "90"
              )
            }
            disabled={filterLoading}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.periodButtonText,
                timeFilter === "90" &&
                  styles.periodButtonTextSelected,
              ]}
            >
              90 days
            </Text>
          </TouchableOpacity>
        </View>

        {filterLoading ? (
          <View
            style={styles.filterLoading}
          >
            <ActivityIndicator
              size="small"
              color={colors.primary}
            />

            <Text
              style={
                styles.filterLoadingText
              }
            >
              Updating stats...
            </Text>
          </View>
        ) : null}

        {/* Summary */}

        <Text style={styles.sectionTitle}>
          Overview
        </Text>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>
              🎲
            </Text>

            <Text style={styles.statValue}>
              {stats?.totalGames ?? 0}
            </Text>

            <Text style={styles.statLabel}>
              Games played
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statIcon}>
              👥
            </Text>

            <Text style={styles.statValue}>
              {stats?.totalPlayers ?? 0}
            </Text>

            <Text style={styles.statLabel}>
              Players
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statIcon}>
              🏆
            </Text>

            <Text style={styles.statValue}>
              {stats?.totalWins ?? 0}
            </Text>

            <Text style={styles.statLabel}>
              Wins
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statIcon}>
              ⭐
            </Text>

            <Text
              style={styles.statValueSmall}
              numberOfLines={1}
            >
              {stats?.mostPlayedGame
                ?.name ?? "—"}
            </Text>

            <Text style={styles.statLabel}>
              Most played
            </Text>
          </View>
        </View>

        {/* Current filter summary */}

        <View style={styles.filterSummary}>
          <Text
            style={styles.filterSummaryText}
          >
            {selectedGameName}
            {" • "}
            {timeFilter === "all"
              ? "All time"
              : `Last ${timeFilter} days`}
          </Text>
        </View>

        {/* Leaderboard */}

        <View
          style={styles.leaderboardHeader}
        >
          <View>
            <Text style={styles.sectionTitle}>
              Leaderboard
            </Text>

            <Text
              style={styles.sectionSubtitle}
            >
              Ranked by wins, then win rate.
            </Text>
          </View>
        </View>

        {leaderboard.length === 0 ? (
          <View style={styles.emptyLeaderboard}>
            <Text
              style={styles.emptyLeaderboardIcon}
            >
              🏆
            </Text>

            <Text
              style={styles.emptyLeaderboardTitle}
            >
              No results yet
            </Text>

            <Text
              style={styles.emptyLeaderboardText}
            >
              Record some game sessions to
              build your leaderboard.
            </Text>
          </View>
        ) : (
          <View style={styles.leaderboardCard}>
            {leaderboard.map(
              (player, index) => (
                <View
                  key={player.id}
                  style={[
                    styles.playerRow,
                    index <
                      leaderboard.length -
                        1 &&
                      styles.playerRowBorder,
                  ]}
                >
                  <View
                    style={styles.rank}
                  >
                    <Text
                      style={
                        styles.rankText
                      }
                    >
                      {index + 1}
                    </Text>
                  </View>

                  {player.avatar_url ? (
                    <Image
                      source={{
                        uri: player.avatar_url,
                      }}
                      style={
                        styles.avatar
                      }
                    />
                  ) : (
                    <View
                      style={
                        styles.avatarPlaceholder
                      }
                    >
                      <Text
                        style={
                          styles.avatarText
                        }
                      >
                        {player.name
                          .charAt(0)
                          .toUpperCase()}
                      </Text>
                    </View>
                  )}

                  <View
                    style={styles.playerInfo}
                  >
                    <Text
                      style={
                        styles.playerName
                      }
                      numberOfLines={1}
                    >
                      {player.name}
                    </Text>

                    <Text
                      style={
                        styles.playerMeta
                      }
                    >
                      {player.games}{" "}
                      {player.games ===
                      1
                        ? "game"
                        : "games"}{" "}
                      •{" "}
                      {player.wins}{" "}
                      {player.wins ===
                      1
                        ? "win"
                        : "wins"}
                    </Text>
                  </View>

                  <View
                    style={
                      styles.winRateContainer
                    }
                  >
                    <Text
                      style={
                        styles.winRate
                      }
                    >
                      {player.winRate}%
                    </Text>

                    <Text
                      style={
                        styles.winRateLabel
                      }
                    >
                      win rate
                    </Text>
                  </View>
                </View>
              )
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    padding: spacing.lg,
    paddingTop: 60,
    paddingBottom: 40,
  },

  center: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },

  loadingText: {
    marginTop: spacing.md,
    color: colors.textSecondary,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.text,
  },

  subtitle: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
  },

  filterTitle: {
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },

  filterLabel: {
    marginBottom: spacing.sm,
    fontSize: 13,
    fontWeight: "700",
    color: colors.textSecondary,
  },

  filterRow: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },

  filterChip: {
    minHeight: 40,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    justifyContent: "center",
    maxWidth: 180,
  },

  filterChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  filterChipText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "600",
  },

  filterChipTextSelected: {
    color: "#FFFFFF",
  },

  periodRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },

  periodButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },

  periodButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },

  periodButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },

  periodButtonTextSelected: {
    color: "#FFFFFF",
  },

  filterLoading: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.md,
  },

  filterLoadingText: {
    marginLeft: spacing.sm,
    fontSize: 13,
    color: colors.textSecondary,
  },

  sectionTitle: {
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },

  sectionSubtitle: {
    marginBottom: spacing.md,
    color: colors.textSecondary,
    fontSize: 13,
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },

  statCard: {
    width: "48%",
    minHeight: 120,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  statIcon: {
    fontSize: 24,
  },

  statValue: {
    marginTop: spacing.sm,
    fontSize: 26,
    fontWeight: "800",
    color: colors.text,
  },

  statValueSmall: {
    marginTop: spacing.sm,
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
  },

  statLabel: {
    marginTop: 4,
    fontSize: 12,
    color: colors.textSecondary,
  },

  filterSummary: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  filterSummaryText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: "center",
  },

  leaderboardHeader: {
    marginTop: spacing.sm,
  },

  leaderboardCard: {
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },

  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 76,
    paddingHorizontal: spacing.md,
  },

  playerRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  rank: {
    width: 30,
    alignItems: "center",
  },

  rankText: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.textSecondary,
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginLeft: spacing.sm,
  },

  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginLeft: spacing.sm,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.primary,
  },

  playerInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },

  playerName: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },

  playerMeta: {
    marginTop: 4,
    fontSize: 12,
    color: colors.textSecondary,
  },

  winRateContainer: {
    alignItems: "flex-end",
    marginLeft: spacing.sm,
  },

  winRate: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.primary,
  },

  winRateLabel: {
    marginTop: 2,
    fontSize: 10,
    color: colors.textMuted,
  },

  emptyLeaderboard: {
    alignItems: "center",
    padding: spacing.xl,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  emptyLeaderboardIcon: {
    fontSize: 44,
  },

  emptyLeaderboardTitle: {
    marginTop: spacing.md,
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },

  emptyLeaderboardText: {
    marginTop: spacing.sm,
    textAlign: "center",
    color: colors.textSecondary,
  },

  emptyEmoji: {
    fontSize: 56,
  },

  emptyTitle: {
    marginTop: spacing.md,
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
    textAlign: "center",
  },

  emptyText: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    textAlign: "center",
  },
});