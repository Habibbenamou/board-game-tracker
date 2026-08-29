import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import {
    router,
    useLocalSearchParams,
} from "expo-router";

import { useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
    deleteGameSession,
    getGameSessionById,
    type GameSession,
} from "../services/gameSessionService";

import {
    deleteSessionPlayers,
    getSessionPlayers,
    type SessionPlayer,
} from "../services/sessionPlayerService";

import {
    getGameById,
    type Game,
} from "../services/gameService";

import {
    getPlayers,
    type Player,
} from "../services/playerService";

import {
    colors,
    radius,
    spacing,
} from "../constants/theme";

type SessionPlayerWithPlayer =
  SessionPlayer & {
    player: Player | null;
  };

export default function SessionDetailsScreen() {
  const { id } =
    useLocalSearchParams<{
      id: string;
    }>();
  
  const insets = useSafeAreaInsets();

  const [session, setSession] =
    useState<GameSession | null>(null);

  const [game, setGame] =
    useState<Game | null>(null);

  const [sessionPlayers, setSessionPlayers] =
    useState<SessionPlayerWithPlayer[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [deleting, setDeleting] =
    useState(false);

  useEffect(() => {
    if (id) {
      loadSession();
    }
  }, [id]);

  async function loadSession() {
    try {
      setLoading(true);

      const sessionData =
        await getGameSessionById(id);

      const [
        gameData,
        sessionPlayersData,
        playersData,
      ] = await Promise.all([
        getGameById(
          sessionData.game_id
        ),
        getSessionPlayers(id),
        getPlayers(),
      ]);

      const playersWithDetails =
        sessionPlayersData.map(
          (sessionPlayer) => ({
            ...sessionPlayer,
            player:
              playersData.find(
                (player) =>
                  player.id ===
                  sessionPlayer.player_id
              ) ?? null,
          })
        );

      setSession(sessionData);
      setGame(gameData);
      setSessionPlayers(
        playersWithDetails
      );
    } catch (error) {
      console.error(
        "Error loading session details:",
        error
      );

      Alert.alert(
        "Error",
        "Unable to load this game session."
      );

      router.back();
    } finally {
      setLoading(false);
    }
  }

  function formatDate(
    dateString: string
  ): string {
    const date = new Date(dateString);

    return date.toLocaleString([], {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getPlacementLabel(
    placement: number | null
  ): string {
    if (placement === null) {
      return "-";
    }

    if (placement === 1) {
      return "1st";
    }

    if (placement === 2) {
      return "2nd";
    }

    if (placement === 3) {
      return "3rd";
    }

    return `${placement}th`;
  }

  function getPlacementEmoji(
    placement: number | null
  ): string {
    if (placement === 1) {
      return "🥇";
    }

    if (placement === 2) {
      return "🥈";
    }

    if (placement === 3) {
      return "🥉";
    }

    return "";
  }

  function handleEdit() {
    router.push({
      pathname: "/edit-session",
      params: {
        id,
      },
    });
  }

  function handleDelete() {
    Alert.alert(
      "Delete game session?",
      "This will permanently remove this recorded game session and its player results.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress:
            confirmDelete,
        },
      ]
    );
  }

  async function confirmDelete() {
    try {
      setDeleting(true);

      /*
       * Delete session players first
       * because they reference the session.
       */
      await deleteSessionPlayers(id);

      await deleteGameSession(id);

      Alert.alert(
        "Session deleted",
        "The game session has been deleted.",
        [
          {
            text: "OK",
            onPress: () => {
              router.back();
            },
          },
        ]
      );
    } catch (error) {
      console.error(
        "Error deleting game session:",
        error
      );

      Alert.alert(
        "Error",
        "Unable to delete this game session."
      );
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />

        <Text style={styles.loadingText}>
          Loading session...
        </Text>
      </View>
    );
  }

  if (!session) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>
          Session not found
        </Text>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text
            style={styles.backButtonText}
          >
            Go Back
          </Text>
        </TouchableOpacity>
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

        {/* Game */}
        <View style={styles.gameHeader}>
          {game?.image_url ? (
            <Image
              source={{
                uri: game.image_url,
              }}
              style={styles.gameImage}
            />
          ) : (
            <View
              style={styles.gamePlaceholder}
            >
              <Text
                style={styles.placeholderEmoji}
              >
                🎲
              </Text>
            </View>
          )}

          <View style={styles.gameInfo}>
            <Text
              style={styles.gameName}
              numberOfLines={2}
            >
              {game?.name ??
                "Unknown game"}
            </Text>

            {game?.category ? (
              <Text
                style={styles.category}
              >
                {game.category}
              </Text>
            ) : null}
          </View>
        </View>

        {/* Date */}
        <View style={styles.dateCard}>
          <Text style={styles.dateIcon}>
            📅
          </Text>

          <View>
            <Text style={styles.cardLabel}>
              Played
            </Text>

            <Text style={styles.dateText}>
              {formatDate(
                session.played_at
              )}
            </Text>
          </View>
        </View>

        {/* Results */}
        <Text style={styles.sectionTitle}>
          Results
        </Text>

        {sessionPlayers.length ===
        0 ? (
          <View style={styles.emptyCard}>
            <Text
              style={styles.emptyCardText}
            >
              No player results were recorded
              for this session.
            </Text>
          </View>
        ) : (
          <View style={styles.results}>
            {sessionPlayers.map(
              (sessionPlayer) => {
                const placement =
                  sessionPlayer.placement;

                const winner =
                  sessionPlayer.is_winner;

                return (
                  <View
                    key={sessionPlayer.id}
                    style={[
                      styles.resultCard,
                      winner &&
                        styles.winnerCard,
                    ]}
                  >
                    <View
                      style={
                        styles.placement
                      }
                    >
                      <Text
                        style={
                          styles.placementEmoji
                        }
                      >
                        {getPlacementEmoji(
                          placement
                        )}
                      </Text>

                      <Text
                        style={
                          styles.placementText
                        }
                      >
                        {getPlacementLabel(
                          placement
                        )}
                      </Text>
                    </View>

                    {sessionPlayer
                      .player
                      ?.avatar_url ? (
                      <Image
                        source={{
                          uri: sessionPlayer
                            .player
                            .avatar_url,
                        }}
                        style={
                          styles.playerAvatar
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
                          {sessionPlayer.player?.name
                            ?.charAt(0)
                            .toUpperCase() ??
                            "?"}
                        </Text>
                      </View>
                    )}

                    <View
                      style={
                        styles.playerInfo
                      }
                    >
                      <Text
                        style={
                          styles.playerName
                        }
                        numberOfLines={1}
                      >
                        {sessionPlayer
                          .player?.name ??
                          "Unknown player"}
                      </Text>

                      {winner ? (
                        <Text
                          style={
                            styles.winnerText
                          }
                        >
                          Winner
                        </Text>
                      ) : null}
                    </View>

                    <View
                      style={
                        styles.scoreContainer
                      }
                    >
                      <Text
                        style={
                          styles.scoreLabel
                        }
                      >
                        Score
                      </Text>

                      <Text
                        style={
                          styles.score
                        }
                      >
                        {sessionPlayer
                          .score ??
                          "-"}
                      </Text>
                    </View>
                  </View>
                );
              }
            )}
          </View>
        )}

        {/* Notes */}
        {session.notes ? (
          <>
            <Text
              style={styles.sectionTitle}
            >
              Notes
            </Text>

            <View style={styles.notesCard}>
              <Text style={styles.notesText}>
                {session.notes}
              </Text>
            </View>
          </>
        ) : null}

        {/* Delete */}
              <View
                      style={[
                        styles.deleteSection,
                        {
                          paddingBottom:
                            Math.max(
                              insets.bottom,
                              spacing.lg
                            ) + spacing.md,
                        },
                      ]}
              > 

        <TouchableOpacity
            style={styles.editButton}
            onPress={handleEdit}
            activeOpacity={0.8}
          >

                            <Text
                              style={
                                styles.editButtonTitle
                              }
                            >
                              Edit Game
                            </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.deleteButton,
            deleting &&
              styles.deleteButtonDisabled,
          ]}
          onPress={handleDelete}
          disabled={deleting}
          activeOpacity={0.8}
        >
          <Text
            style={styles.deleteButtonText}
          >
            {deleting
              ? "Deleting..."
              : "Delete Session"}
          </Text>
        </TouchableOpacity>
        </View>
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
    paddingTop: 55,
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

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xl,
  },

  backText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
  },

  editText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary,
  },

  gameHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  gameImage: {
    width: 90,
    height: 90,
    borderRadius: radius.lg,
  },

  gamePlaceholder: {
    width: 90,
    height: 90,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },

  placeholderEmoji: {
    fontSize: 40,
  },

  gameInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },

  gameName: {
    fontSize: 25,
    fontWeight: "800",
    color: colors.text,
  },

  category: {
    marginTop: 5,
    color: colors.textSecondary,
    fontSize: 14,
  },

  dateCard: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xl,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  dateIcon: {
    fontSize: 25,
    marginRight: spacing.md,
  },

  cardLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },

  dateText: {
    marginTop: 3,
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },

  sectionTitle: {
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    fontSize: 20,
    fontWeight: "800",
    color: colors.text,
  },

  results: {
    gap: spacing.sm,
  },

  resultCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  winnerCard: {
    borderColor: colors.primary,
  },

  placement: {
    width: 48,
    alignItems: "center",
  },

  placementEmoji: {
    fontSize: 20,
    height: 24,
  },

  placementText: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "700",
    color: colors.textSecondary,
  },

  playerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },

  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    fontSize: 18,
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

  winnerText: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },

  scoreContainer: {
    alignItems: "flex-end",
    marginLeft: spacing.sm,
  },

  scoreLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },

  score: {
    marginTop: 2,
    fontSize: 19,
    fontWeight: "800",
    color: colors.text,
  },

  emptyCard: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  emptyCardText: {
    textAlign: "center",
    color: colors.textSecondary,
  },

  notesCard: {
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  notesText: {
    lineHeight: 21,
    color: colors.text,
    fontSize: 14,
  },

  backButton: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
  },

  backButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  emptyTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
  },

  editButton: {
    marginTop: spacing.md,
    height: 50,
    borderRadius: radius.md,
    borderWidth: 1,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  editButtonTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  deleteSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    backgroundColor: colors.background,
  },

  deleteButton: {
    marginTop: spacing.md,
    height: 50,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.danger,
    alignItems: "center",
    justifyContent: "center",
  },

  deleteButtonDisabled: {
    opacity: 0.5,
  },

  deleteButtonText: {
    color: colors.danger,
    fontSize: 15,
    fontWeight: "700",
  },
});