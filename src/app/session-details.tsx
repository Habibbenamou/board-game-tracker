import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import {
  useEffect,
  useState,
} from "react";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import Ionicons from "@expo/vector-icons/Ionicons";

import Animated, {
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import {
  deleteGameSession,
  getGameSessionById,
  type GameSession,
} from "../services/gameSessionService";

import {
  deleteSessionPlayers,
  getSessionPlayersWithPlayers,
  type SessionPlayerWithPlayer,
} from "../services/sessionPlayerService";

import {
  getGameById,
  type Game,
} from "../services/gameService";

import {
  colors,
  radius,
  spacing,
} from "../constants/theme";

const AnimatedPressable =
  Animated.createAnimatedComponent(Pressable);

type ResultCardProps = {
  sessionPlayer: SessionPlayerWithPlayer;
  index: number;
};

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

function getPlacementIcon(
  placement: number | null
): keyof typeof Ionicons.glyphMap {
  if (placement === 1) {
    return "trophy";
  }

  if (
    placement === 2 ||
    placement === 3
  ) {
    return "medal-outline";
  }

  return "podium-outline";
}

function ResultCard({
  sessionPlayer,
  index,
}: ResultCardProps) {
  const pressed = useSharedValue(1);

  const animatedStyle =
    useAnimatedStyle(() => ({
      transform: [
        {
          scale: pressed.value,
        },
      ],
      opacity: pressed.value,
    }));

  const winner =
    sessionPlayer.is_winner;

  const placement =
    sessionPlayer.placement;

  const playerName =
    sessionPlayer.player?.name ??
    "Unknown player";

  const avatarLetter =
    playerName
      .charAt(0)
      .toUpperCase() || "?";

  function handlePressIn() {
    pressed.value = withSpring(0.985, {
      damping: 18,
      stiffness: 300,
    });
  }

  function handlePressOut() {
    pressed.value = withSpring(1, {
      damping: 18,
      stiffness: 300,
    });
  }

  return (
    <Animated.View
      entering={FadeInUp.duration(300).delay(
        Math.min(index * 50, 250)
      )}
    >
      <AnimatedPressable
        style={[
          styles.resultCard,
          winner && styles.winnerCard,
          animatedStyle,
        ]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View
          style={[
            styles.placement,
            winner && styles.winnerPlacement,
          ]}
        >
          <Ionicons
            name={getPlacementIcon(
              placement
            )}
            size={winner ? 20 : 18}
            color={
              winner
                ? colors.warning
                : colors.textMuted
            }
          />

          <Text
            style={[
              styles.placementText,
              winner &&
                styles.winnerPlacementText,
            ]}
          >
            {getPlacementLabel(
              placement
            )}
          </Text>
        </View>

        {sessionPlayer.player
          ?.avatar_url ? (
          <Image
            source={{
              uri: sessionPlayer.player
                .avatar_url,
            }}
            style={styles.playerAvatar}
          />
        ) : (
          <View
            style={[
              styles.avatarPlaceholder,
              winner &&
                styles.winnerAvatarPlaceholder,
            ]}
          >
            <Text
              style={[
                styles.avatarText,
                winner &&
                  styles.winnerAvatarText,
              ]}
            >
              {avatarLetter}
            </Text>
          </View>
        )}

        <View style={styles.playerInfo}>
          <Text
            style={styles.playerName}
            numberOfLines={1}
          >
            {playerName}
          </Text>

          {winner ? (
            <View style={styles.winnerBadge}>
              <Ionicons
                name="trophy"
                size={11}
                color={colors.warning}
              />

              <Text
                style={styles.winnerText}
              >
                Winner
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>
            Score
          </Text>

          <Text style={styles.score}>
            {sessionPlayer.score ?? "-"}
          </Text>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

function ActionButton({
  icon,
  label,
  variant,
  onPress,
  disabled = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  variant: "primary" | "danger";
  onPress: () => void;
  disabled?: boolean;
}) {
  const pressed = useSharedValue(1);

  const animatedStyle =
    useAnimatedStyle(() => ({
      transform: [
        {
          scale: pressed.value,
        },
      ],
    }));

  function handlePressIn() {
    pressed.value = withSpring(0.97, {
      damping: 18,
      stiffness: 300,
    });
  }

  function handlePressOut() {
    pressed.value = withSpring(1, {
      damping: 18,
      stiffness: 300,
    });
  }

  return (
    <AnimatedPressable
      style={[
        styles.actionButton,
        variant === "primary"
          ? styles.editButton
          : styles.deleteButton,
        disabled &&
          styles.actionButtonDisabled,
        animatedStyle,
      ]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
    >
      <Ionicons
        name={icon}
        size={19}
        color={
          variant === "primary"
            ? colors.white
            : colors.danger
        }
      />

      <Text
        style={[
          styles.actionButtonText,
          variant === "primary"
            ? styles.editButtonText
            : styles.deleteButtonText,
        ]}
      >
        {label}
      </Text>
    </AnimatedPressable>
  );
}

export default function SessionDetailsScreen() {
  const { id } =
    useLocalSearchParams<{
      id: string;
    }>();

  const insets =
    useSafeAreaInsets();

  const [session, setSession] =
    useState<GameSession | null>(null);

  const [game, setGame] =
    useState<Game | null>(null);

  const [
    sessionPlayers,
    setSessionPlayers,
  ] = useState<
    SessionPlayerWithPlayer[]
  >([]);

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

      /*
       * Load game + session players
       * independently.
       *
       * getSessionPlayersWithPlayers()
       * now handles both the session_players
       * rows and their Player records.
       */
      const [
        gameData,
        sessionPlayersData,
      ] = await Promise.all([
        getGameById(
          sessionData.game_id
        ),
        getSessionPlayersWithPlayers(id),
      ]);

      // console.log(
      //   "SESSION PLAYERS LOADED:",
      //   sessionPlayersData
      // );

      setSession(sessionData);
      setGame(gameData);
      setSessionPlayers(
        sessionPlayersData
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
          onPress: confirmDelete,
        },
      ]
    );
  }

  async function confirmDelete() {
    try {
      setDeleting(true);

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
        <View style={styles.loadingIcon}>
          <Ionicons
            name="time-outline"
            size={30}
            color={colors.primaryLight}
          />
        </View>

        <Text style={styles.loadingTitle}>
          Loading session
        </Text>

        <Text style={styles.loadingText}>
          Getting the game results...
        </Text>
      </View>
    );
  }

  if (!session) {
    return (
      <View style={styles.center}>
        <View style={styles.stateIcon}>
          <Ionicons
            name="alert-circle-outline"
            size={32}
            color={colors.primaryLight}
          />
        </View>

        <Text style={styles.emptyTitle}>
          Session not found
        </Text>

        <Text style={styles.emptyText}>
          This game session may have been
          deleted or is no longer available.
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.backButton,
            pressed &&
              styles.buttonPressed,
          ]}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={18}
            color={colors.white}
          />

          <Text
            style={styles.backButtonText}
          >
            Go Back
          </Text>
        </Pressable>
      </View>
    );
  }

  const winnerCount =
    sessionPlayers.filter(
      (player) => player.is_winner
    ).length;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom:
              Math.max(
                insets.bottom,
                spacing.lg
              ) +
              spacing.xl,
          },
        ]}
      >
        {/* Game Header */}
        <Animated.View
          entering={FadeInUp.duration(300)}
          style={styles.gameHeader}
        >
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
              <Ionicons
                name="dice-outline"
                size={40}
                color={colors.primaryLight}
              />
            </View>
          )}

          <View style={styles.gameInfo}>
            <View style={styles.recordedBadge}>
              <Ionicons
                name="checkmark-circle"
                size={13}
                color={colors.success}
              />

              <Text
                style={styles.recordedBadgeText}
              >
                Session recorded
              </Text>
            </View>

            <Text
              style={styles.gameName}
              numberOfLines={2}
            >
              {game?.name ??
                "Unknown game"}
            </Text>

            {game?.category ? (
              <Text style={styles.category}>
                {game.category}
              </Text>
            ) : null}
          </View>
        </Animated.View>

        {/* Date */}
        <Animated.View
          entering={FadeInUp.duration(300).delay(
            60
          )}
          style={styles.dateCard}
        >
          <View style={styles.dateIcon}>
            <Ionicons
              name="calendar-outline"
              size={22}
              color={colors.primaryLight}
            />
          </View>

          <View style={styles.dateInfo}>
            <Text style={styles.cardLabel}>
              Played
            </Text>

            <Text style={styles.dateText}>
              {formatDate(
                session.played_at
              )}
            </Text>
          </View>
        </Animated.View>

        {/* Results */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Results
            </Text>

            <Text style={styles.sectionSubtitle}>
              {sessionPlayers.length}{" "}
              {sessionPlayers.length === 1
                ? "player"
                : "players"}
              {winnerCount > 0
                ? ` • ${winnerCount} winner`
                : ""}
            </Text>
          </View>

          <View style={styles.sectionIcon}>
            <Ionicons
              name="trophy-outline"
              size={19}
              color={colors.primaryLight}
            />
          </View>
        </View>

        {sessionPlayers.length ===
        0 ? (
          <View style={styles.emptyCard}>
            <View
              style={styles.emptyCardIcon}
            >
              <Ionicons
                name="people-outline"
                size={25}
                color={colors.textMuted}
              />
            </View>

            <Text
              style={styles.emptyCardTitle}
            >
              No results recorded
            </Text>

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
              (sessionPlayer, index) => (
                <ResultCard
                  key={sessionPlayer.id}
                  sessionPlayer={
                    sessionPlayer
                  }
                  index={index}
                />
              )
            )}
          </View>
        )}

        {/* Notes */}
        {session.notes ? (
          <Animated.View
            entering={FadeInUp.duration(
              300
            ).delay(120)}
          >
            <View
              style={styles.sectionHeader}
            >
              <View>
                <Text
                  style={styles.sectionTitle}
                >
                  Notes
                </Text>

                <Text
                  style={styles.sectionSubtitle}
                >
                  Session details
                </Text>
              </View>

              <View style={styles.sectionIcon}>
                <Ionicons
                  name="document-text-outline"
                  size={19}
                  color={
                    colors.primaryLight
                  }
                />
              </View>
            </View>

            <View style={styles.notesCard}>
              <Ionicons
                name="chatbox-ellipses-outline"
                size={20}
                color={colors.textMuted}
              />

              <Text
                style={styles.notesText}
              >
                {session.notes}
              </Text>
            </View>
          </Animated.View>
        ) : null}

        {/* Actions */}
        <Animated.View
          entering={FadeInUp.duration(300).delay(
            160
          )}
          style={[
            styles.actionSection,
            {
              paddingBottom:
                Math.max(
                  insets.bottom,
                  spacing.lg
                ),
            },
          ]}
        >
          <Text
            style={styles.actionSectionTitle}
          >
            Session Actions
          </Text>

          <ActionButton
            icon="create-outline"
            label="Edit Session"
            variant="primary"
            onPress={handleEdit}
            disabled={deleting}
          />

          <ActionButton
            icon="trash-outline"
            label={
              deleting
                ? "Deleting..."
                : "Delete Session"
            }
            variant="danger"
            onPress={handleDelete}
            disabled={deleting}
          />
        </Animated.View>
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
    paddingHorizontal: spacing.lg,
    paddingTop: 58,
  },

  center: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },

  loadingIcon: {
    width: 64,
    height: 64,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingTitle: {
    marginTop: spacing.lg,
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
  },

  loadingText: {
    marginTop: 6,
    color: colors.textSecondary,
    fontSize: 14,
  },

  stateIcon: {
    width: 72,
    height: 72,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    marginTop: spacing.lg,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "800",
    color: colors.text,
    textAlign: "center",
  },

  emptyText: {
    marginTop: spacing.sm,
    maxWidth: 320,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    textAlign: "center",
  },

  backButton: {
    marginTop: spacing.xl,
    height: 46,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },

  backButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "700",
  },

  buttonPressed: {
    opacity: 0.8,
    transform: [
      {
        scale: 0.98,
      },
    ],
  },

  gameHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  gameImage: {
    width: 94,
    height: 94,
    borderRadius: radius.lg,
    backgroundColor:
      colors.surfaceHighlight,
  },

  gamePlaceholder: {
    width: 94,
    height: 94,
    borderRadius: radius.lg,
    backgroundColor:
      colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  gameInfo: {
    flex: 1,
    minWidth: 0,
    marginLeft: spacing.lg,
  },

  recordedBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 7,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor:
      "rgba(34, 197, 94, 0.10)",
    borderWidth: 1,
    borderColor:
      "rgba(34, 197, 94, 0.25)",
  },

  recordedBadgeText: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "700",
    color: colors.success,
  },

  gameName: {
    fontSize: 25,
    lineHeight: 30,
    fontWeight: "800",
    color: colors.text,
  },

  category: {
    marginTop: 5,
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "500",
  },

  dateCard: {
    marginTop: spacing.xl,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
  },

  dateIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor:
      colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  dateInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },

  cardLabel: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "600",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  dateText: {
    marginTop: 3,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    color: colors.text,
  },

  sectionHeader: {
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
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
    marginTop: 3,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "500",
    color: colors.textMuted,
  },

  sectionIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor:
      colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  results: {
    gap: spacing.sm,
  },

  resultCard: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  winnerCard: {
    backgroundColor:
      colors.surfaceElevated,
    borderColor:
      "rgba(245, 158, 11, 0.55)",
  },

  placement: {
    width: 48,
    alignItems: "center",
    justifyContent: "center",
  },

  winnerPlacement: {
    width: 52,
  },

  placementText: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
    color: colors.textMuted,
  },

  winnerPlacementText: {
    color: colors.warning,
  },

  playerAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor:
      colors.surfaceHighlight,
  },

  avatarPlaceholder: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor:
      colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  winnerAvatarPlaceholder: {
    borderColor:
      "rgba(245, 158, 11, 0.45)",
    backgroundColor:
      "rgba(245, 158, 11, 0.10)",
  },

  avatarText: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.primaryLight,
  },

  winnerAvatarText: {
    color: colors.warning,
  },

  playerInfo: {
    flex: 1,
    minWidth: 0,
    marginLeft: spacing.md,
  },

  playerName: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "700",
    color: colors.text,
  },

  winnerBadge: {
    alignSelf: "flex-start",
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  winnerText: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
    color: colors.warning,
  },

  scoreContainer: {
    minWidth: 48,
    alignItems: "flex-end",
    marginLeft: spacing.sm,
  },

  scoreLabel: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "600",
    color: colors.textMuted,
    textTransform: "uppercase",
  },

  score: {
    marginTop: 2,
    fontSize: 19,
    lineHeight: 23,
    fontWeight: "800",
    color: colors.text,
  },

  emptyCard: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },

  emptyCardIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor:
      colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },

  emptyCardTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "700",
    color: colors.text,
  },

  emptyCardText: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
    textAlign: "center",
  },

  notesCard: {
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "flex-start",
  },

  notesText: {
    flex: 1,
    marginLeft: spacing.sm,
    lineHeight: 21,
    color: colors.text,
    fontSize: 14,
  },

  actionSection: {
    marginTop: spacing.xxl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  actionSectionTitle: {
    marginBottom: spacing.sm,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
    color: colors.textMuted,
  },

  actionButton: {
    height: 50,
    borderRadius: radius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },

  editButton: {
    marginTop: spacing.sm,
    backgroundColor: colors.primary,
  },

  deleteButton: {
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.danger,
    backgroundColor:
      "rgba(239, 68, 68, 0.05)",
  },

  actionButtonDisabled: {
    opacity: 0.5,
  },

  actionButtonText: {
    fontSize: 15,
    fontWeight: "700",
  },

  editButtonText: {
    color: colors.white,
  },

  deleteButtonText: {
    color: colors.danger,
  },
});