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

import { router } from "expo-router";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { Ionicons } from "@expo/vector-icons";

import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from "react-native-reanimated";

import StatCard from "../../components/StatCard";

import {
  colors,
  radius,
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

  /*
   * --------------------------------------------------
   * Home entrance animation
   * --------------------------------------------------
   */

  const contentOpacity =
    useSharedValue(0);

  const contentTranslateY =
    useSharedValue(18);

  const contentAnimatedStyle =
    useAnimatedStyle(() => ({
      opacity: contentOpacity.value,
      transform: [
        {
          translateY:
            contentTranslateY.value,
        },
      ],
    }));

  /*
   * --------------------------------------------------
   * Group selector press animation
   * --------------------------------------------------
   */

  const groupSelectorScale =
    useSharedValue(1);

  const groupSelectorAnimatedStyle =
    useAnimatedStyle(() => ({
      transform: [
        {
          scale:
            groupSelectorScale.value,
        },
      ],
    }));

  /*
   * --------------------------------------------------
   * Load Home
   * --------------------------------------------------
   */

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

  /*
   * Animate Home once the initial data has loaded.
   */
  useEffect(() => {
    if (!loading) {
      contentOpacity.value = withTiming(1, {
        duration: 350,
        easing: Easing.out(
          Easing.cubic
        ),
      });

      contentTranslateY.value =
        withSpring(0, {
          damping: 18,
          stiffness: 140,
          mass: 0.8,
        });
    }
  }, [
    loading,
    contentOpacity,
    contentTranslateY,
  ]);

  async function handleRefresh() {
    setRefreshing(true);

    try {
      await loadHome();
    } finally {
      setRefreshing(false);
    }
  }

  function handleGroupPressIn() {
    groupSelectorScale.value =
      withSpring(0.985, {
        damping: 18,
        stiffness: 250,
      });
  }

  function handleGroupPressOut() {
    groupSelectorScale.value =
      withSpring(1, {
        damping: 16,
        stiffness: 220,
      });
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
        <View style={styles.loadingIconContainer}>
          <Ionicons
            name="dice-outline"
            size={30}
            color={colors.primaryLight}
          />
        </View>

        <ActivityIndicator
          size="small"
          color={colors.primaryLight}
          style={styles.loadingIndicator}
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
            tintColor={colors.primaryLight}
          />
        }
      >
        <View style={styles.emptyIconContainer}>
          <Ionicons
            name="people-outline"
            size={42}
            color={colors.primaryLight}
          />
        </View>

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
      <Animated.ScrollView
        style={[
          styles.container,
          contentAnimatedStyle,
        ]}
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
            tintColor={colors.primaryLight}
            colors={[colors.primaryLight]}
          />
        }
      >
        {/* -----------------------------------------
            Header
        ------------------------------------------ */}

        <View style={styles.header}>
          <Text style={styles.greeting}>
            Good evening
          </Text>

          <View style={styles.greetingIcon}>
            <Ionicons
              name="sparkles-outline"
              size={16}
              color={colors.secondary}
            />
          </View>
        </View>

        {/* -----------------------------------------
            Current Group Selector
        ------------------------------------------ */}

        <Animated.View
          style={[
            styles.groupSelectorWrapper,
            groupSelectorAnimatedStyle,
          ]}
        >
          <Pressable
            style={styles.groupSelector}
            onPress={() =>
              setGroupSelectorVisible(
                true
              )
            }
            onPressIn={
              handleGroupPressIn
            }
            onPressOut={
              handleGroupPressOut
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
                  size={19}
                  color={
                    colors.primaryLight
                  }
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
                  CURRENT GROUP
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

            <View style={styles.groupChevron}>
              <Ionicons
                name="chevron-down"
                size={18}
                color={
                  colors.textSecondary
                }
              />
            </View>
          </Pressable>
        </Animated.View>

        <Text style={styles.subtitle}>
          Your group's board game history
        </Text>

        {/* -----------------------------------------
            Statistics
        ------------------------------------------ */}

        <View style={styles.statsRow}>
          <StatCard
            icon="dice-outline"
            value={stats?.gamesPlayed ?? 0}
            label="Games Played"
          />

          <StatCard
            icon="trophy-outline"
            value={stats?.myWins ?? 0}
            label="Your Wins"
          />

          <StatCard
            icon="people-outline"
            value={stats?.players ?? 0}
            label="Players"
          />

          <StatCard
            icon="analytics-outline"
            value={`${stats?.myWinRate ?? 0}%`}
            label="Your Win Rate"
          />
        </View>

        {/* -----------------------------------------
            Recent Games
        ------------------------------------------ */}

        <View
          style={styles.sectionHeader}
        >
          <View>
            <Text
              style={
                styles.sectionTitle
              }
            >
              Recent Games
            </Text>

            <Text
              style={
                styles.sectionSubtitle
              }
            >
              Your latest sessions
            </Text>
          </View>

          <Pressable
            style={styles.sectionAction}
            onPress={() => router.push({
                          pathname: "/game-sessions",
                        })}
          >
            <Text
              style={
                styles.sectionActionText
              }
            >
              See all
            </Text>

            <Ionicons
              name="arrow-forward"
              size={14}
              color={
                colors.primaryLight
              }
            />
          </Pressable>
        </View>

        {sessions.length === 0 ? (
          <View style={styles.card}>
            <View
              style={
                styles.emptyCardIcon
              }
            >
              <Ionicons
                name="dice-outline"
                size={28}
                color={
                  colors.textMuted
                }
              />
            </View>

            <Text
              style={
                styles.emptyText
              }
            >
              No games played yet.
            </Text>

            <Text
              style={
                styles.cardHint
              }
            >
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
                  <Pressable
                    key={session.id}
                    style={({ pressed }) => [
                      styles.gameCard,
                      pressed &&
                        styles.gameCardPressed,
                    ]}
                    onPress={() => router.push({
                          pathname: "/session-details",
                          params: {
                            id: session.id,
                          },
                        })}
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
                        <Ionicons
                          name="dice-outline"
                          size={42}
                          color={
                            colors.textMuted
                          }
                        />
                      </View>
                    )}

                    <View
                      style={
                        styles.gameInfo
                      }
                    >
                      <View
                        style={
                          styles.gameTitleRow
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

                        <Ionicons
                          name="chevron-forward"
                          size={15}
                          color={
                            colors.textMuted
                          }
                        />
                      </View>

                      <View
                        style={
                          styles.gameDateRow
                        }
                      >
                        <Ionicons
                          name="calendar-outline"
                          size={13}
                          color={
                            colors.textMuted
                          }
                        />

                        <Text
                          style={
                            styles.gameDate
                          }
                        >
                          {formatDate(
                            session.played_at
                          )}
                        </Text>
                      </View>

                      <View
                        style={
                          styles.playerCountRow
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
                            styles.playerCount
                          }
                        >
                          {
                            participants.length
                          }{" "}
                          {participants.length ===
                          1
                            ? "player"
                            : "players"}
                        </Text>
                      </View>

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
                              <Ionicons
                                name="person"
                                size={15}
                                color={
                                  colors.textMuted
                                }
                              />
                            </View>
                          )}

                          <View
                            style={
                              styles.winnerInfo
                            }
                          >
                            <View
                              style={
                                styles.winnerLabelRow
                              }
                            >
                              <Ionicons
                                name="trophy"
                                size={11}
                                color={
                                  colors.warning
                                }
                              />

                              <Text
                                style={
                                  styles.winnerLabel
                                }
                              >
                                WINNER
                              </Text>
                            </View>

                            <Text
                              style={
                                styles.winnerName
                              }
                              numberOfLines={1}
                            >
                              {
                                winner.name
                              }
                            </Text>
                          </View>
                        </View>
                      ) : (
                        <View
                          style={
                            styles.noWinnerRow
                          }
                        >
                          <Ionicons
                            name="remove-circle-outline"
                            size={14}
                            color={
                              colors.textMuted
                            }
                          />

                          <Text
                            style={
                              styles.noWinner
                            }
                          >
                            No winner recorded
                          </Text>
                        </View>
                      )}
                    </View>
                  </Pressable>
                );
              }
            )}
          </ScrollView>
        )}

        {/* -----------------------------------------
            Leaderboard
        ------------------------------------------ */}

        <View
          style={styles.sectionHeader}
        >
          <View>
            <Text
              style={
                styles.sectionTitle
              }
            >
              Leaderboard
            </Text>

            <Text
              style={
                styles.sectionSubtitle
              }
            >
              Top players in your group
            </Text>
          </View>

          {leaderboardPlayers.length >
            0 && (
            <View
              style={
                styles.leaderboardBadge
              }
            >
              <Ionicons
                name="trophy-outline"
                size={13}
                color={
                  colors.warning
                }
              />

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
            </View>
          )}
        </View>

        {leaderboardPlayers.length ===
        0 ? (
          <View style={styles.card}>
            <View
              style={
                styles.emptyCardIcon
              }
            >
              <Ionicons
                name="trophy-outline"
                size={28}
                color={
                  colors.textMuted
                }
              />
            </View>

            <Text
              style={
                styles.emptyText
              }
            >
              No leaderboard yet.
            </Text>

            <Text
              style={
                styles.cardHint
              }
            >
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
                    index ===
                      leaderboardPlayers.length -
                        1 &&
                      styles.lastLeaderboardRow,
                  ]}
                >
                  {/* Position */}

                  <View
                    style={
                      styles.rankContainer
                    }
                  >
                    {index === 0 ? (
                      <View
                        style={
                          styles.firstPlaceIcon
                        }
                      >
                        <Ionicons
                          name="trophy"
                          size={17}
                          color={
                            colors.warning
                          }
                        />
                      </View>
                    ) : (
                      <Text
                        style={
                          styles.rankNumber
                        }
                      >
                        {index + 1}
                      </Text>
                    )}
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
                      <Ionicons
                        name="person"
                        size={18}
                        color={
                          colors.textMuted
                        }
                      />
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
      </Animated.ScrollView>

      {/* -----------------------------------------
          Group Selector Modal
      ------------------------------------------ */}

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
                styles.modalHandle
              }
            />

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
                  size={21}
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
                        style={[
                          styles.groupOptionIcon,
                          selected &&
                            styles.selectedGroupOptionIcon,
                        ]}
                      >
                        <Ionicons
                          name="people"
                          size={18}
                          color={
                            selected
                              ? colors.primaryLight
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
                        <View
                          style={
                            styles.selectedCheck
                          }
                        >
                          <Ionicons
                            name="checkmark"
                            size={16}
                            color={
                              colors.white
                            }
                          />
                        </View>
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
    paddingHorizontal: spacing.lg,
    paddingTop: 54,
    paddingBottom: 40,
  },

  loading: {
    flex: 1,
    backgroundColor:
      colors.background,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingIconContainer: {
    width: 62,
    height: 62,
    borderRadius: 20,
    backgroundColor:
      colors.surface,
    borderWidth: 1,
    borderColor:
      colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingIndicator: {
    marginTop: spacing.md,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
  },

  greeting: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textSecondary,
  },

  greetingIcon: {
    marginLeft: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor:
      colors.surfaceHighlight,
    alignItems: "center",
    justifyContent: "center",
  },

  /*
   * Current group selector
   */

  groupSelectorWrapper: {
    marginTop: spacing.md,
  },

  groupSelector: {
    minHeight: 68,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor:
      colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor:
      colors.border,
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
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor:
      "rgba(139, 92, 246, 0.12)",
    borderWidth: 1,
    borderColor:
      "rgba(139, 92, 246, 0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },

  groupSelectorText: {
    flex: 1,
  },

  groupSelectorLabel: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.8,
    color: colors.textMuted,
  },

  groupSelectorName: {
    marginTop: 3,
    fontSize: 17,
    fontWeight: "800",
    color: colors.text,
  },

  groupChevron: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor:
      colors.surfaceHighlight,
    alignItems: "center",
    justifyContent: "center",
  },

  subtitle: {
    marginTop: spacing.sm,
    fontSize: 14,
    color: colors.textSecondary,
  },

  /*
   * Statistics
   */

  statsRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.lg,
  },

  /*
   * Section headers
   */

  sectionHeader: {
    marginTop: spacing.xxl,
    marginBottom: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "800",
    color: colors.text,
  },

  sectionSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: colors.textMuted,
  },

  sectionAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 6,
    paddingLeft: 8,
  },

  sectionActionText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primaryLight,
  },

  /*
   * Recent games
   */

  gamesRow: {
    gap: spacing.md,
    paddingRight: spacing.lg,
  },

  gameCard: {
    width: 220,
    overflow: "hidden",
    backgroundColor:
      colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor:
      colors.border,
  },

  gameCardPressed: {
    opacity: 0.9,
    transform: [
      {
        scale: 0.985,
      },
    ],
  },

  gameImage: {
    width: "100%",
    height: 128,
  },

  gameImagePlaceholder: {
    width: "100%",
    height: 128,
    backgroundColor:
      colors.surfaceHighlight,
    alignItems: "center",
    justifyContent: "center",
  },

  gameInfo: {
    padding: spacing.md,
  },

  gameTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },

  gameName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
  },

  gameDateRow: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  gameDate: {
    fontSize: 11,
    fontWeight: "500",
    color: colors.textMuted,
  },

  playerCountRow: {
    marginTop: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  playerCount: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
  },

  winnerRow: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor:
      colors.border,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  winnerAvatar: {
    width: 34,
    height: 34,
    borderRadius: 12,
  },

  winnerAvatarPlaceholder: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor:
      colors.surfaceHighlight,
    alignItems: "center",
    justifyContent: "center",
  },

  winnerInfo: {
    flex: 1,
  },

  winnerLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  winnerLabel: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.6,
    color: colors.warning,
  },

  winnerName: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
  },

  noWinnerRow: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor:
      colors.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  noWinner: {
    fontSize: 11,
    color: colors.textMuted,
  },

  /*
   * Leaderboard
   */

  leaderboardBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: radius.full,
    backgroundColor:
      "rgba(245, 158, 11, 0.10)",
    borderWidth: 1,
    borderColor:
      "rgba(245, 158, 11, 0.16)",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  leaderboardCount: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.warning,
  },

  leaderboardCard: {
    overflow: "hidden",
    backgroundColor:
      colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor:
      colors.border,
  },

  leaderboardRow: {
    minHeight: 72,
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
    backgroundColor:
      "rgba(245, 158, 11, 0.035)",
  },

  lastLeaderboardRow: {
    borderBottomWidth: 0,
  },

  rankContainer: {
    width: 30,
    alignItems: "center",
    justifyContent: "center",
  },

  firstPlaceIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor:
      "rgba(245, 158, 11, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },

  rankNumber: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.textMuted,
  },

  leaderAvatar: {
    width: 42,
    height: 42,
    borderRadius: 14,
  },

  leaderAvatarPlaceholder: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor:
      colors.surfaceHighlight,
    alignItems: "center",
    justifyContent: "center",
  },

  leaderPlayerInfo: {
    flex: 1,
  },

  leaderPlayerName: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.text,
  },

  leaderPlayerStats: {
    marginTop: 3,
    fontSize: 11,
    color: colors.textMuted,
  },

  winRateContainer: {
    alignItems: "flex-end",
  },

  winRate: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.primaryLight,
  },

  winRateLabel: {
    marginTop: 1,
    fontSize: 9,
    fontWeight: "600",
    color: colors.textMuted,
  },

  /*
   * Empty cards
   */

  card: {
    backgroundColor:
      colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor:
      colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    alignItems: "center",
  },

  emptyCardIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor:
      colors.surfaceHighlight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },

  emptyText: {
    color: colors.textSecondary,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "600",
  },

  cardHint: {
    marginTop: 5,
    color: colors.textMuted,
    textAlign: "center",
    fontSize: 12,
    lineHeight: 17,
  },

  /*
   * Empty group state
   */

  emptyContent: {
    flexGrow: 1,
    padding: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyIconContainer: {
    width: 78,
    height: 78,
    borderRadius: 24,
    backgroundColor:
      colors.surface,
    borderWidth: 1,
    borderColor:
      colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
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
      "rgba(0, 0, 0, 0.65)",
    justifyContent: "flex-end",
  },

  groupModal: {
    backgroundColor:
      colors.surface,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
    borderWidth: 1,
    borderColor:
      colors.border,
  },

  modalHandle: {
    alignSelf: "center",
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor:
      colors.borderLight,
    marginBottom: spacing.lg,
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
    fontSize: 12,
    color: colors.textSecondary,
  },

  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor:
      colors.surfaceHighlight,
    alignItems: "center",
    justifyContent: "center",
  },

  groupList: {
    gap: spacing.sm,
  },

  groupOption: {
    minHeight: 60,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor:
      colors.background,
    borderWidth: 1,
    borderColor:
      colors.border,
    flexDirection: "row",
    alignItems: "center",
  },

  selectedGroupOption: {
    borderColor:
      colors.primary,
    backgroundColor:
      "rgba(139, 92, 246, 0.07)",
  },

  groupOptionIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor:
      colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },

  selectedGroupOptionIcon: {
    backgroundColor:
      "rgba(139, 92, 246, 0.12)",
  },

  groupOptionName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: colors.textSecondary,
  },

  selectedGroupOptionName: {
    fontWeight: "800",
    color: colors.text,
  },

  selectedCheck: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor:
      colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});