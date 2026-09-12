import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  useFocusEffect,
} from "expo-router";

import {
  useCallback,
  useMemo,
  useState,
} from "react";

import { Ionicons } from "@expo/vector-icons";

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

  const topThree =
    leaderboard.slice(0, 3);

  const remainingPlayers =
    leaderboard.slice(3);

  if (loading) {
    return (
      <View style={styles.center}>
        <View style={styles.loadingIcon}>
          <Ionicons
            name="stats-chart"
            size={28}
            color={colors.primaryLight}
          />
        </View>

        <ActivityIndicator
          size="small"
          color={colors.primary}
          style={styles.loadingSpinner}
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
        <View style={styles.emptyIcon}>
          <Ionicons
            name="people-outline"
            size={36}
            color={colors.primaryLight}
          />
        </View>

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
        {/* Header */}

        <View style={styles.header}>
          <View>
            <View style={styles.titleRow}>
              <View style={styles.titleIcon}>
                <Ionicons
                  name="trophy-outline"
                  size={22}
                  color={
                    colors.primaryLight
                  }
                />
              </View>

              <Text style={styles.title}>
                Stats
              </Text>
            </View>

            <Text style={styles.subtitle}>
              {currentGroup.name}
            </Text>
          </View>
        </View>

        {/* Filters */}

        <View style={styles.filterCard}>
          <View
            style={styles.filterHeader}
          >
            <View>
              <Text
                style={styles.filterTitle}
              >
                Filters
              </Text>

              <Text
                style={
                  styles.filterSubtitle
                }
              >
                Narrow down your group's
                results.
              </Text>
            </View>

            <View
              style={styles.filterIcon}
            >
              <Ionicons
                name="options-outline"
                size={20}
                color={
                  colors.primaryLight
                }
              />
            </View>
          </View>

          {/* Game filter */}

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
              <Ionicons
                name="grid-outline"
                size={15}
                color={
                  selectedGameId === null
                    ? "#FFFFFF"
                    : colors.textSecondary
                }
              />

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

            {games.map((game) => {
              const selected =
                selectedGameId ===
                game.id;

              return (
                <TouchableOpacity
                  key={game.id}
                  style={[
                    styles.filterChip,
                    selected &&
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
                  <Ionicons
                    name="dice-outline"
                    size={15}
                    color={
                      selected
                        ? "#FFFFFF"
                        : colors.textSecondary
                    }
                  />

                  <Text
                    style={[
                      styles.filterChipText,
                      selected &&
                        styles.filterChipTextSelected,
                    ]}
                    numberOfLines={1}
                  >
                    {game.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Period filter */}

          <Text style={styles.filterLabel}>
            Period
          </Text>

          <View
            style={styles.periodRow}
          >
            <PeriodButton
              label="All time"
              icon="infinite-outline"
              selected={
                timeFilter === "all"
              }
              disabled={filterLoading}
              onPress={() =>
                handleTimeFilter(
                  "all"
                )
              }
            />

            <PeriodButton
              label="30 days"
              icon="calendar-outline"
              selected={
                timeFilter === "30"
              }
              disabled={filterLoading}
              onPress={() =>
                handleTimeFilter(
                  "30"
                )
              }
            />

            <PeriodButton
              label="90 days"
              icon="calendar-number-outline"
              selected={
                timeFilter === "90"
              }
              disabled={filterLoading}
              onPress={() =>
                handleTimeFilter(
                  "90"
                )
              }
            />
          </View>

          {filterLoading ? (
            <View
              style={
                styles.filterLoading
              }
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
        </View>

        {/* Active filter */}

        <View
          style={styles.activeFilter}
        >
          <Ionicons
            name="funnel-outline"
            size={15}
            color={colors.primaryLight}
          />

          <Text
            style={
              styles.activeFilterText
            }
            numberOfLines={1}
          >
            {selectedGameName}
            {"  •  "}
            {timeFilter === "all"
              ? "All time"
              : `Last ${timeFilter} days`}
          </Text>
        </View>

        {/* Overview */}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Overview
            </Text>

            <Text
              style={styles.sectionSubtitle}
            >
              A quick look at the group's
              activity.
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <StatBox
            icon="dice-outline"
            value={
              stats?.totalGames ?? 0
            }
            label="Games played"
          />

          <StatBox
            icon="people-outline"
            value={
              stats?.totalPlayers ?? 0
            }
            label="Players"
          />
        </View>

        <View style={styles.statsRow}>
          <StatBox
            icon="trophy-outline"
            value={
              stats?.totalWins ?? 0
            }
            label="Wins"
            accent
          />

          <View
            style={[
              styles.statBox,
              styles.mostPlayedCard,
            ]}
          >
            <View
              style={
                styles.statIconContainer
              }
            >
              <Ionicons
                name="flame-outline"
                size={21}
                color={
                  colors.warning
                }
              />
            </View>

            <Text
              style={
                styles.mostPlayedName
              }
              numberOfLines={2}
            >
              {stats?.mostPlayedGame
                ?.name ?? "—"}
            </Text>

            <Text
              style={styles.statLabel}
            >
              Most played
            </Text>
          </View>
        </View>

        {/* Leaderboard */}

        <View
          style={styles.leaderboardSection}
        >
          <View
            style={styles.sectionHeader}
          >
            <View>
              <Text
                style={styles.sectionTitle}
              >
                Leaderboard
              </Text>

              <Text
                style={
                  styles.sectionSubtitle
                }
              >
                Ranked by wins, then win
                rate.
              </Text>
            </View>

            {leaderboard.length > 0 ? (
              <View
                style={
                  styles.playerCountBadge
                }
              >
                <Ionicons
                  name="people-outline"
                  size={14}
                  color={
                    colors.textSecondary
                  }
                />

                <Text
                  style={
                    styles.playerCountText
                  }
                >
                  {leaderboard.length}
                </Text>
              </View>
            ) : null}
          </View>

          {leaderboard.length === 0 ? (
            <View
              style={
                styles.emptyLeaderboard
              }
            >
              <View
                style={
                  styles.emptyLeaderboardIcon
                }
              >
                <Ionicons
                  name="trophy-outline"
                  size={34}
                  color={
                    colors.primaryLight
                  }
                />
              </View>

              <Text
                style={
                  styles.emptyLeaderboardTitle
                }
              >
                No results yet
              </Text>

              <Text
                style={
                  styles.emptyLeaderboardText
                }
              >
                Record some game sessions
                to build your leaderboard.
              </Text>
            </View>
          ) : (
            <>
              {/* Top 3 */}

              {topThree.length > 0 ? (
                <View
                  style={
                    styles.podiumCard
                  }
                >
                  {topThree.map(
                    (player, index) => (
                      <PodiumPlayer
                        key={player.id}
                        player={player}
                        position={
                          index + 1
                        }
                      />
                    )
                  )}
                </View>
              ) : null}

              {/* Remaining players */}

              {remainingPlayers.length >
              0 ? (
                <View
                  style={
                    styles.remainingCard
                  }
                >
                  {remainingPlayers.map(
                    (
                      player,
                      index
                    ) => (
                      <LeaderboardRow
                        key={player.id}
                        player={player}
                        rank={
                          index + 4
                        }
                        isLast={
                          index ===
                          remainingPlayers.length -
                            1
                        }
                      />
                    )
                  )}
                </View>
              ) : null}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function PeriodButton({
  label,
  icon,
  selected,
  disabled,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  selected: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.periodButton,
        selected &&
          styles.periodButtonSelected,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Ionicons
        name={icon}
        size={16}
        color={
          selected
            ? "#FFFFFF"
            : colors.textSecondary
        }
      />

      <Text
        style={[
          styles.periodButtonText,
          selected &&
            styles.periodButtonTextSelected,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function StatBox({
  icon,
  value,
  label,
  accent = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: number;
  label: string;
  accent?: boolean;
}) {
  return (
    <View style={styles.statBox}>
      <View
        style={[
          styles.statIconContainer,
          accent &&
            styles.statIconContainerAccent,
        ]}
      >
        <Ionicons
          name={icon}
          size={21}
          color={
            accent
              ? colors.warning
              : colors.primaryLight
          }
        />
      </View>

      <Text style={styles.statValue}>
        {value}
      </Text>

      <Text style={styles.statLabel}>
        {label}
      </Text>
    </View>
  );
}

function PodiumPlayer({
  player,
  position,
}: {
  player: LeaderboardPlayer;
  position: number;
}) {
  const isFirst =
    position === 1;

  const rankIcon =
    position === 1
      ? "trophy"
      : position === 2
        ? "medal-outline"
        : "medal-outline";

  return (
    <View
      style={[
        styles.podiumPlayer,
        isFirst &&
          styles.podiumPlayerFirst,
      ]}
    >
      <View
        style={[
          styles.podiumRank,
          isFirst &&
            styles.podiumRankFirst,
        ]}
      >
        <Ionicons
          name={rankIcon}
          size={isFirst ? 18 : 16}
          color={
            isFirst
              ? colors.warning
              : colors.textSecondary
          }
        />

        <Text
          style={[
            styles.podiumRankText,
            isFirst &&
              styles.podiumRankTextFirst,
          ]}
        >
          #{position}
        </Text>
      </View>

      {player.avatar_url ? (
        <Image
          source={{
            uri: player.avatar_url,
          }}
          style={[
            styles.podiumAvatar,
            isFirst &&
              styles.podiumAvatarFirst,
          ]}
        />
      ) : (
        <View
          style={[
            styles.podiumAvatarPlaceholder,
            isFirst &&
              styles.podiumAvatarFirst,
          ]}
        >
          <Text
            style={
              styles.podiumAvatarText
            }
          >
            {player.name
              .charAt(0)
              .toUpperCase()}
          </Text>
        </View>
      )}

      <Text
        style={styles.podiumName}
        numberOfLines={1}
      >
        {player.name}
      </Text>

      <Text style={styles.podiumWins}>
        {player.wins}{" "}
        {player.wins === 1
          ? "win"
          : "wins"}
      </Text>

      <View
        style={
          styles.podiumWinRate
        }
      >
        <Text
          style={
            styles.podiumWinRateText
          }
        >
          {player.winRate}%
        </Text>

        <Text
          style={
            styles.podiumWinRateLabel
          }
        >
          win rate
        </Text>
      </View>
    </View>
  );
}

function LeaderboardRow({
  player,
  rank,
  isLast,
}: {
  player: LeaderboardPlayer;
  rank: number;
  isLast: boolean;
}) {
  return (
    <View
      style={[
        styles.leaderboardRow,
        !isLast &&
          styles.leaderboardRowBorder,
      ]}
    >
      <View style={styles.rank}>
        <Text style={styles.rankText}>
          {rank}
        </Text>
      </View>

      {player.avatar_url ? (
        <Image
          source={{
            uri: player.avatar_url,
          }}
          style={styles.avatar}
        />
      ) : (
        <View
          style={styles.avatarPlaceholder}
        >
          <Text
            style={styles.avatarText}
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
          style={styles.playerName}
          numberOfLines={1}
        >
          {player.name}
        </Text>

        <Text
          style={styles.playerMeta}
        >
          {player.games}{" "}
          {player.games === 1
            ? "game"
            : "games"}{" "}
          •{" "}
          {player.wins}{" "}
          {player.wins === 1
            ? "win"
            : "wins"}
        </Text>
      </View>

      <View
        style={styles.winRateContainer}
      >
        <Text
          style={styles.winRate}
        >
          {player.winRate}%
        </Text>

        <View
          style={
            styles.winRateTrack
          }
        >
          <View
            style={[
              styles.winRateFill,
              {
                width: `${Math.min(
                  player.winRate,
                  100
                )}%`,
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      colors.background,
  },

  content: {
    padding: spacing.lg,
    paddingTop: 60,
    paddingBottom: 50,
  },

  center: {
    flex: 1,
    backgroundColor:
      colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },

  loadingIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor:
      colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingSpinner: {
    marginTop: spacing.lg,
  },

  loadingText: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
  },

  header: {
    marginBottom: spacing.sm,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  titleIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor:
      "rgba(139, 92, 246, 0.14)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
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

  filterCard: {
    marginTop: spacing.xl,
    padding: spacing.md,
    borderRadius: radius.xl,
    backgroundColor:
      colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },

  filterHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },

  filterTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },

  filterSubtitle: {
    marginTop: 3,
    color: colors.textSecondary,
    fontSize: 12,
  },

  filterIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor:
      "rgba(139, 92, 246, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },

  filterLabel: {
    marginBottom: spacing.sm,
    fontSize: 13,
    fontWeight: "700",
    color: colors.textSecondary,
  },

  filterRow: {
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },

  filterChip: {
    minHeight: 40,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    maxWidth: 200,
  },

  filterChipSelected: {
    backgroundColor:
      colors.primary,
    borderColor:
      colors.primary,
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
    minHeight: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  periodButtonSelected: {
    borderColor:
      colors.primary,
    backgroundColor:
      colors.primary,
  },

  periodButtonText: {
    fontSize: 12,
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
    fontSize: 12,
    color: colors.textSecondary,
  },

  activeFilter: {
    marginTop: spacing.md,
    minHeight: 38,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor:
      "rgba(139, 92, 246, 0.08)",
    borderWidth: 1,
    borderColor:
      "rgba(139, 92, 246, 0.18)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  activeFilterText: {
    flex: 1,
    textAlign: "center",
    color: colors.primaryLight,
    fontSize: 12,
    fontWeight: "600",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },

  sectionTitle: {
    marginTop: spacing.xl,
    marginBottom: 4,
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },

  sectionSubtitle: {
    marginBottom: spacing.md,
    color: colors.textSecondary,
    fontSize: 12,
  },

  statsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },

  statBox: {
    flex: 1,
    minHeight: 128,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor:
      colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor:
      "rgba(139, 92, 246, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },

  statIconContainerAccent: {
    backgroundColor:
      "rgba(245, 158, 11, 0.12)",
  },

  statValue: {
    marginTop: spacing.md,
    fontSize: 27,
    fontWeight: "800",
    color: colors.text,
  },

  statLabel: {
    marginTop: 3,
    fontSize: 12,
    color: colors.textSecondary,
  },

  mostPlayedCard: {
    borderColor:
      "rgba(245, 158, 11, 0.2)",
  },

  mostPlayedName: {
    marginTop: spacing.md,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "800",
    color: colors.text,
  },

  leaderboardSection: {
    marginTop: spacing.sm,
  },

  playerCountBadge: {
    minWidth: 38,
    height: 30,
    paddingHorizontal: 9,
    borderRadius: radius.full,
    backgroundColor:
      colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },

  playerCountText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
  },

  podiumCard: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.xl,
    backgroundColor:
      colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "stretch",
  },

  podiumPlayer: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.lg,
  },

  podiumPlayerFirst: {
    backgroundColor:
      "rgba(245, 158, 11, 0.06)",
    borderWidth: 1,
    borderColor:
      "rgba(245, 158, 11, 0.16)",
  },

  podiumRank: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: spacing.sm,
  },

  podiumRankFirst: {
    marginBottom: spacing.md,
  },

  podiumRankText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.textSecondary,
  },

  podiumRankTextFirst: {
    color: colors.warning,
  },

  podiumAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: spacing.sm,
  },

  podiumAvatarFirst: {
    width: 58,
    height: 58,
    borderRadius: 29,
  },

  podiumAvatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: spacing.sm,
    backgroundColor:
      colors.background,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },

  podiumAvatarText: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.primary,
  },

  podiumName: {
    maxWidth: "95%",
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
  },

  podiumWins: {
    marginTop: 3,
    fontSize: 11,
    color: colors.textSecondary,
  },

  podiumWinRate: {
    marginTop: spacing.sm,
    alignItems: "center",
  },

  podiumWinRateText: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.primaryLight,
  },

  podiumWinRateLabel: {
    marginTop: 1,
    fontSize: 9,
    color: colors.textMuted,
  },

  remainingCard: {
    marginTop: spacing.md,
    borderRadius: radius.lg,
    backgroundColor:
      colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },

  leaderboardRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 74,
    paddingHorizontal: spacing.md,
  },

  leaderboardRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor:
      colors.border,
  },

  rank: {
    width: 26,
    alignItems: "center",
  },

  rankText: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.textMuted,
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginLeft: spacing.sm,
  },

  avatarPlaceholder: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginLeft: spacing.sm,
    backgroundColor:
      colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary,
  },

  playerInfo: {
    flex: 1,
    marginLeft: spacing.md,
    minWidth: 0,
  },

  playerName: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },

  playerMeta: {
    marginTop: 3,
    fontSize: 11,
    color: colors.textSecondary,
  },

  winRateContainer: {
    width: 64,
    marginLeft: spacing.sm,
    alignItems: "flex-end",
  },

  winRate: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.primaryLight,
  },

  winRateTrack: {
    width: 58,
    height: 4,
    marginTop: 5,
    borderRadius: 2,
    overflow: "hidden",
    backgroundColor:
      colors.surfaceHighlight,
  },

  winRateFill: {
    height: "100%",
    borderRadius: 2,
    backgroundColor:
      colors.primary,
  },

  emptyLeaderboard: {
    alignItems: "center",
    padding: spacing.xl,
    borderRadius: radius.lg,
    backgroundColor:
      colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  emptyLeaderboardIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor:
      "rgba(139, 92, 246, 0.12)",
    alignItems: "center",
    justifyContent: "center",
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
    lineHeight: 20,
    color: colors.textSecondary,
  },

  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor:
      "rgba(139, 92, 246, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    marginTop: spacing.lg,
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
    textAlign: "center",
  },

  emptyText: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
});