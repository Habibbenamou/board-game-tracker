import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { Ionicons } from "@expo/vector-icons";

import StatCard from "../../components/StatCard";

import {
  colors,
  spacing,
} from "../../constants/theme";

import { useGroup } from "../../context/GroupContext";

import {
  getGameSessionsByGroupId,
  type GameSessionWithDetails,
} from "../../services/gameSessionService";

import {
  getGroupStats,
  type HomeStats,
} from "../../services/homeService";

import {
  getGroupLeaderboard,
  type LeaderboardPlayer,
} from "../../services/leaderboardService";

export default function HomeScreen() {
  const {
    groups,
    currentGroup,
    setCurrentGroup,
  } = useGroup();

  const [stats, setStats] =
    useState<HomeStats | null>(null);

  const [sessions, setSessions] =
    useState<GameSessionWithDetails[]>(
      []
    );

  const [
    leaderboardPlayers,
    setLeaderboardPlayers,
  ] = useState<LeaderboardPlayer[]>(
    []
  );

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [groupSelectorVisible, setGroupSelectorVisible] =
    useState(false);

  const loadHome = useCallback(
    async () => {
      if (!currentGroup) {
        setStats(null);
        setSessions([]);
        setLeaderboardPlayers([]);
        return;
      }

      try {
        const [
          groupStats,
          groupSessions,
          groupLeaderboard,
        ] = await Promise.all([
          getGroupStats(
            currentGroup.id
          ),

          getGameSessionsByGroupId(
            currentGroup.id
          ),

          getGroupLeaderboard(
            currentGroup.id
          ),
        ]);

        setStats(groupStats);
        setSessions(groupSessions);

        /*
         * Home only displays the top 3 players.
         *
         * The leaderboard service still calculates
         * the leaderboard using all historical sessions.
         */
        setLeaderboardPlayers(
          groupLeaderboard.slice(0, 3)
        );
      } catch (error) {
        console.error(
          "Error loading home:",
          error
        );
      }
    },
    [currentGroup?.id]
  );

  useEffect(() => {
    async function load() {
      setLoading(true);

      try {
        await loadHome();
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [loadHome]);

  async function handleRefresh() {
    setRefreshing(true);

    try {
      await loadHome();
    } finally {
      setRefreshing(false);
    }
  }

  function handleSelectGroup(
    group: (typeof groups)[number]
  ) {
    setGroupSelectorVisible(false);

    if (
      group.id === currentGroup?.id
    ) {
      return;
    }

    setCurrentGroup(group);
  }

  function formatDate(
    date: string
  ) {
    return new Date(
      date
    ).toLocaleDateString(
      undefined,
      {
        day: "numeric",
        month: "short",
      }
    );
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />
      </View>
    );
  }

  if (!currentGroup) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={
          styles.emptyContent
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={
              handleRefresh
            }
          />
        }
      >
        <Text style={styles.emptyIcon}>
          👥
        </Text>

        <Text style={styles.emptyTitle}>
          No group yet
        </Text>

        <Text
          style={
            styles.emptyDescription
          }
        >
          Create or join a group to start
          tracking your board game sessions.
        </Text>
      </ScrollView>
    );
  }

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={
              handleRefresh
            }
          />
        }
      >
        {/* Header */}

        <Text style={styles.greeting}>
          Good evening 👋
        </Text>

        {/* Current Group Selector */}

        <Pressable
          style={styles.groupSelector}
          onPress={() =>
            setGroupSelectorVisible(
              true
            )
          }
        >
          <View
            style={
              styles.groupSelectorInfo
            }
          >
            <View
              style={
                styles.groupIcon
              }
            >
              <Ionicons
                name="people"
                size={18}
                color={colors.primary}
              />
            </View>

            <View
              style={
                styles.groupSelectorText
              }
            >
              <Text
                style={
                  styles.groupSelectorLabel
                }
              >
                Current group
              </Text>

              <Text
                style={
                  styles.groupSelectorName
                }
                numberOfLines={1}
              >
                {currentGroup.name}
              </Text>
            </View>
          </View>

          <Ionicons
            name="chevron-down"
            size={20}
            color={colors.textSecondary}
          />
        </Pressable>

        <Text style={styles.subtitle}>
          Your group's board game history
        </Text>

        {/* Statistics */}

        <View style={styles.statsRow}>
          <StatCard
            icon="🎲"
            value={
              stats?.gamesPlayed ?? 0
            }
            label="Games Played"
          />

          <StatCard
            icon="🏆"
            value={stats?.myWins ?? 0}
            label="Your Wins"
          />
        </View>

        <View style={styles.statsRow}>
          <StatCard
            icon="👥"
            value={stats?.players ?? 0}
            label="Players"
          />

          <StatCard
            icon="🎯"
            value={`${stats?.myWinRate ?? 0}%`}
            label="Your Win Rate"
          />
        </View>

        {/* Recent Games */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Recent Games
          </Text>

          <Text style={styles.seeAll}>
            See all
          </Text>
        </View>

        {sessions.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.emptyText}>
              No games played yet.
            </Text>

            <Text style={styles.cardHint}>
              Start a game session to see it
              here.
            </Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={
              false
            }
            contentContainerStyle={
              styles.gamesRow
            }
          >
            {sessions.map(
              (session) => {
                const game =
                  session.games;

                const participants =
                  session
                    .session_players ??
                  [];

                const winner =
                  participants.find(
                    (result) =>
                      result.is_winner
                  )?.players;

                return (
                  <View
                    key={session.id}
                    style={
                      styles.gameCard
                    }
                  >
                    {game?.image_url ? (
                      <Image
                        source={{
                          uri: game.image_url,
                        }}
                        style={
                          styles.gameImage
                        }
                      />
                    ) : (
                      <View
                        style={
                          styles.gameImagePlaceholder
                        }
                      >
                        <Text
                          style={
                            styles.gamePlaceholderIcon
                          }
                        >
                          🎲
                        </Text>
                      </View>
                    )}

                    <View
                      style={
                        styles.gameInfo
                      }
                    >
                      <Text
                        style={
                          styles.gameName
                        }
                        numberOfLines={1}
                      >
                        {game?.name ??
                          "Unknown game"}
                      </Text>

                      <Text
                        style={
                          styles.gameDate
                        }
                      >
                        {formatDate(
                          session.played_at
                        )}
                      </Text>

                      <Text
                        style={
                          styles.playerCount
                        }
                      >
                        👥{" "}
                        {
                          participants.length
                        }{" "}
                        {participants.length ===
                        1
                          ? "player"
                          : "players"}
                      </Text>

                      {winner ? (
                        <View
                          style={
                            styles.winnerRow
                          }
                        >
                          {winner.avatar_url ? (
                            <Image
                              source={{
                                uri: winner.avatar_url,
                              }}
                              style={
                                styles.winnerAvatar
                              }
                            />
                          ) : (
                            <View
                              style={
                                styles.winnerAvatarPlaceholder
                              }
                            >
                              <Text>
                                👤
                              </Text>
                            </View>
                          )}

                          <View
                            style={
                              styles.winnerInfo
                            }
                          >
                            <Text
                              style={
                                styles.winnerLabel
                              }
                            >
                              Winner
                            </Text>

                            <Text
                              style={
                                styles.winnerName
                              }
                              numberOfLines={1}
                            >
                              {winner.name}
                            </Text>
                          </View>
                        </View>
                      ) : (
                        <Text
                          style={
                            styles.noWinner
                          }
                        >
                          No winner recorded
                        </Text>
                      )}
                    </View>
                  </View>
                );
              }
            )}
          </ScrollView>
        )}

        {/* Leaderboard */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Leaderboard
          </Text>

          {leaderboardPlayers.length >
            0 && (
            <Text
              style={
                styles.leaderboardCount
              }
            >
              Top{" "}
              {
                leaderboardPlayers.length
              }
            </Text>
          )}
        </View>

        {leaderboardPlayers.length ===
        0 ? (
          <View style={styles.card}>
            <Text style={styles.emptyText}>
              No leaderboard yet.
            </Text>

            <Text style={styles.cardHint}>
              Play some games to start
              building the leaderboard.
            </Text>
          </View>
        ) : (
          <View
            style={
              styles.leaderboardCard
            }
          >
            {leaderboardPlayers.map(
              (
                player,
                index
              ) => (
                <View
                  key={player.id}
                  style={[
                    styles.leaderboardRow,
                    index === 0 &&
                      styles.firstPlaceRow,
                  ]}
                >
                  {/* Position */}

                  <View
                    style={
                      styles.rankContainer
                    }
                  >
                    <Text
                      style={[
                        styles.rank,
                        index === 0 &&
                          styles.firstRank,
                      ]}
                    >
                      {index === 0
                        ? "🥇"
                        : index === 1
                        ? "🥈"
                        : "🥉"}
                    </Text>
                  </View>

                  {/* Avatar */}

                  {player.avatar_url ? (
                    <Image
                      source={{
                        uri: player.avatar_url,
                      }}
                      style={
                        styles.leaderAvatar
                      }
                    />
                  ) : (
                    <View
                      style={
                        styles.leaderAvatarPlaceholder
                      }
                    >
                      <Text>
                        👤
                      </Text>
                    </View>
                  )}

                  {/* Player */}

                  <View
                    style={
                      styles.leaderPlayerInfo
                    }
                  >
                    <Text
                      style={
                        styles.leaderPlayerName
                      }
                      numberOfLines={1}
                    >
                      {player.name}
                    </Text>

                    <Text
                      style={
                        styles.leaderPlayerStats
                      }
                    >
                      {player.wins}{" "}
                      {player.wins === 1
                        ? "win"
                        : "wins"}{" "}
                      •{" "}
                      {player.games}{" "}
                      games
                    </Text>
                  </View>

                  {/* Win rate */}

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

      {/* Group Selector Modal */}

      <Modal
        visible={
          groupSelectorVisible
        }
        transparent
        animationType="fade"
        onRequestClose={() =>
          setGroupSelectorVisible(
            false
          )
        }
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() =>
            setGroupSelectorVisible(
              false
            )
          }
        >
          <Pressable
            style={styles.groupModal}
            onPress={(event) =>
              event.stopPropagation()
            }
          >
            <View
              style={
                styles.modalHeader
              }
            >
              <View>
                <Text
                  style={
                    styles.modalTitle
                  }
                >
                  Select Group
                </Text>

                <Text
                  style={
                    styles.modalSubtitle
                  }
                >
                  Choose which group you want
                  to use
                </Text>
              </View>

              <Pressable
                style={
                  styles.closeButton
                }
                onPress={() =>
                  setGroupSelectorVisible(
                    false
                  )
                }
              >
                <Ionicons
                  name="close"
                  size={22}
                  color={
                    colors.textSecondary
                  }
                />
              </Pressable>
            </View>

            <View
              style={
                styles.groupList
              }
            >
              {groups.map(
                (group) => {
                  const selected =
                    group.id ===
                    currentGroup.id;

                  return (
                    <Pressable
                      key={group.id}
                      style={[
                        styles.groupOption,
                        selected &&
                          styles.selectedGroupOption,
                      ]}
                      onPress={() =>
                        handleSelectGroup(
                          group
                        )
                      }
                    >
                      <View
                        style={
                          styles.groupOptionIcon
                        }
                      >
                        <Ionicons
                          name="people"
                          size={18}
                          color={
                            selected
                              ? colors.primary
                              : colors.textSecondary
                          }
                        />
                      </View>

                      <Text
                        style={[
                          styles.groupOptionName,
                          selected &&
                            styles.selectedGroupOptionName,
                        ]}
                        numberOfLines={1}
                      >
                        {group.name}
                      </Text>

                      {selected && (
                        <Ionicons
                          name="checkmark-circle"
                          size={22}
                          color={
                            colors.primary
                          }
                        />
                      )}
                    </Pressable>
                  );
                }
              )}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
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
    paddingBottom: 40,
  },

  loading: {
    flex: 1,
    backgroundColor:
      colors.background,
    alignItems: "center",
    justifyContent: "center",
  },

  greeting: {
    fontSize: 15,
    color: colors.textSecondary,
  },

  /*
   * Current group selector
   */

  groupSelector: {
    marginTop: spacing.sm,
    minHeight: 62,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  groupSelectorInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  groupIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor:
      colors.background,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },

  groupSelectorText: {
    flex: 1,
  },

  groupSelectorLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },

  groupSelectorName: {
    marginTop: 2,
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },

  subtitle: {
    marginTop: spacing.sm,
    fontSize: 15,
    color: colors.textSecondary,
  },

  statsRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.lg,
  },

  sectionHeader: {
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },

  seeAll: {
    color: colors.primary,
    fontWeight: "600",
  },

  leaderboardCount: {
    fontSize: 13,
    color: colors.textSecondary,
  },

  gamesRow: {
    gap: spacing.md,
    paddingRight: spacing.lg,
  },

  gameCard: {
    width: 220,
    backgroundColor:
      colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },

  gameImage: {
    width: "100%",
    height: 130,
  },

  gameImagePlaceholder: {
    width: "100%",
    height: 130,
    backgroundColor:
      colors.background,
    alignItems: "center",
    justifyContent: "center",
  },

  gamePlaceholderIcon: {
    fontSize: 42,
  },

  gameInfo: {
    padding: spacing.md,
  },

  gameName: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
  },

  gameDate: {
    marginTop: 3,
    fontSize: 12,
    color: colors.textSecondary,
  },

  playerCount: {
    marginTop: spacing.sm,
    fontSize: 13,
    color: colors.textSecondary,
  },

  winnerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor:
      colors.border,
  },

  winnerAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },

  winnerAvatarPlaceholder: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor:
      colors.background,
    alignItems: "center",
    justifyContent: "center",
  },

  winnerInfo: {
    flex: 1,
  },

  winnerLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },

  winnerName: {
    marginTop: 1,
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
  },

  noWinner: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor:
      colors.border,
    fontSize: 12,
    color: colors.textSecondary,
  },

  leaderboardCard: {
    backgroundColor:
      colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },

  leaderboardRow: {
    minHeight: 70,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor:
      colors.border,
    gap: spacing.sm,
  },

  firstPlaceRow: {
    minHeight: 80,
  },

  rankContainer: {
    width: 32,
    alignItems: "center",
  },

  rank: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textSecondary,
  },

  firstRank: {
    fontSize: 24,
  },

  leaderAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },

  leaderAvatarPlaceholder: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor:
      colors.background,
    alignItems: "center",
    justifyContent: "center",
  },

  leaderPlayerInfo: {
    flex: 1,
  },

  leaderPlayerName: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },

  leaderPlayerStats: {
    marginTop: 3,
    fontSize: 12,
    color: colors.textSecondary,
  },

  winRateContainer: {
    alignItems: "flex-end",
  },

  winRate: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.primary,
  },

  winRateLabel: {
    marginTop: 2,
    fontSize: 10,
    color: colors.textSecondary,
  },

  card: {
    backgroundColor:
      colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },

  emptyText: {
    color: colors.textSecondary,
    textAlign: "center",
    fontSize: 15,
  },

  cardHint: {
    marginTop: 6,
    color: colors.textSecondary,
    textAlign: "center",
    fontSize: 13,
  },

  emptyContent: {
    flexGrow: 1,
    padding: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },

  emptyTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.text,
  },

  emptyDescription: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 21,
    maxWidth: 320,
  },

  /*
   * Group selector modal
   */

  modalOverlay: {
    flex: 1,
    backgroundColor:
      "rgba(0, 0, 0, 0.55)",
    justifyContent: "flex-end",
  },

  groupModal: {
    backgroundColor:
      colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
  },

  modalSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textSecondary,
  },

  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor:
      colors.background,
    alignItems: "center",
    justifyContent: "center",
  },

  groupList: {
    gap: spacing.sm,
  },

  groupOption: {
    minHeight: 58,
    paddingHorizontal: spacing.md,
    borderRadius: 14,
    backgroundColor:
      colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
  },

  selectedGroupOption: {
    borderColor:
      colors.primary,
    backgroundColor:
      colors.background,
  },

  groupOptionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor:
      colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },

  groupOptionName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },

  selectedGroupOptionName: {
    fontWeight: "800",
  },
});