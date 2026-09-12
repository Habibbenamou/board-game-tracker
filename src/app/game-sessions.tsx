import {
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";

import {
  router,
  useFocusEffect,
} from "expo-router";

import { useCallback, useState } from "react";

import Ionicons from "@expo/vector-icons/Ionicons";

import Animated, {
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import {
  getGameSessionsByGroupId,
  type GameSession,
} from "../services/gameSessionService";

import {
  getGamesByGroupId,
  type Game,
} from "../services/gameService";

import {
  colors,
  radius,
  spacing,
} from "../constants/theme";

import { useGroup } from "../context/GroupContext";

type SessionWithGame = GameSession & {
  game: Game | null;
};

const AnimatedPressable =
  Animated.createAnimatedComponent(Pressable);

type SessionCardProps = {
  item: SessionWithGame;
  index: number;
};

function SessionCard({
  item,
  index,
}: SessionCardProps) {
  const pressed = useSharedValue(0);

  const animatedStyle =
    useAnimatedStyle(() => ({
      transform: [
        {
          scale: withSpring(
            pressed.value ? 0.98 : 1,
            {
              damping: 18,
              stiffness: 300,
            }
          ),
        },
      ],
    }));

  function handlePress() {
    router.push({
      pathname: "/session-details",
      params: {
        id: item.id,
      },
    });
  }

  return (
    <Animated.View
      entering={FadeInUp.duration(320).delay(
        Math.min(index * 55, 300)
      )}
    >
      <AnimatedPressable
        style={[
          styles.sessionCard,
          animatedStyle,
        ]}
        onPress={handlePress}
        onPressIn={() => {
          pressed.value = 1;
        }}
        onPressOut={() => {
          pressed.value = 0;
        }}
      >
        {/* Game image */}

        {item.game?.image_url ? (
          <Image
            source={{
              uri: item.game.image_url,
            }}
            style={styles.gameImage}
          />
        ) : (
          <View style={styles.gamePlaceholder}>
            <Ionicons
              name="dice-outline"
              size={30}
              color={colors.primaryLight}
            />
          </View>
        )}

        {/* Session information */}

        <View style={styles.sessionInfo}>
          <Text
            style={styles.gameName}
            numberOfLines={1}
          >
            {item.game?.name ??
              "Unknown game"}
          </Text>

          <View style={styles.dateRow}>
            <Ionicons
              name="calendar-outline"
              size={13}
              color={colors.textMuted}
            />

            <Text style={styles.date}>
              {formatDate(item.played_at)}
            </Text>
          </View>

          {item.notes ? (
            <Text
              style={styles.notes}
              numberOfLines={2}
            >
              {item.notes}
            </Text>
          ) : null}
        </View>

        {/* Chevron */}

        <View style={styles.chevronContainer}>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={colors.textMuted}
          />
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

function formatDate(
  dateString: string
): string {
  const date = new Date(dateString);

  return date.toLocaleString([], {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function EmptyHistory({
  groupName,
}: {
  groupName: string;
}) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIconContainer}>
        <Ionicons
          name="dice-outline"
          size={34}
          color={colors.primaryLight}
        />
      </View>

      <Text style={styles.emptyTitle}>
        No Games Played Yet
      </Text>

      <Text style={styles.emptyText}>
        Your recorded game sessions for{" "}
        {groupName} will appear here.
      </Text>

      <Pressable
        style={({ pressed }) => [
          styles.playButton,
          pressed && styles.buttonPressed,
        ]}
        onPress={() =>
          router.push("/(tabs)/play")
        }
      >
        <Ionicons
          name="play"
          size={18}
          color={colors.white}
        />

        <Text style={styles.playButtonText}>
          Record a Game
        </Text>
      </Pressable>
    </View>
  );
}

export default function GameSessionsScreen() {
  const {
    currentGroup,
  } = useGroup();

  const [sessions, setSessions] =
    useState<SessionWithGame[]>([]);

  const [loading, setLoading] =
    useState(true);

  useFocusEffect(
    useCallback(() => {
      loadSessions();
    }, [currentGroup?.id])
  );

  async function loadSessions() {
    try {
      setLoading(true);

      if (!currentGroup) {
        setSessions([]);
        return;
      }

      const [
        sessionsData,
        gamesData,
      ] = await Promise.all([
        getGameSessionsByGroupId(
          currentGroup.id
        ),
        getGamesByGroupId(
          currentGroup.id
        ),
      ]);

      const sessionsWithGames =
        sessionsData.map((session) => ({
          ...session,
          game:
            gamesData.find(
              (game) =>
                game.id ===
                session.game_id
            ) ?? null,
        }));

      setSessions(
        sessionsWithGames
      );
    } catch (error) {
      console.error(
        "Error loading game sessions:",
        error
      );

      Alert.alert(
        "Error",
        "Unable to load game history."
      );
    } finally {
      setLoading(false);
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
          Loading game history
        </Text>

        <Text style={styles.loadingText}>
          Getting your recent sessions...
        </Text>
      </View>
    );
  }

  if (!currentGroup) {
    return (
      <View style={styles.center}>
        <View style={styles.stateIcon}>
          <Ionicons
            name="people-outline"
            size={30}
            color={colors.primaryLight}
          />
        </View>

        <Text style={styles.emptyTitle}>
          No group selected
        </Text>

        <Text style={styles.emptyText}>
          Select or join a group to see
          its game history.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}

      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>
            Game History
          </Text>

          <Text style={styles.subtitle}>
            {currentGroup.name}
          </Text>
        </View>

        <View style={styles.headerIcon}>
          <Ionicons
            name="time-outline"
            size={25}
            color={colors.primaryLight}
          />
        </View>
      </View>

      {sessions.length === 0 ? (
        <EmptyHistory
          groupName={currentGroup.name}
        />
      ) : (
        <>
          {/* Session count */}

          <View style={styles.summaryRow}>
            <View style={styles.summaryIcon}>
              <Ionicons
                name="game-controller-outline"
                size={16}
                color={colors.primaryLight}
              />
            </View>

            <Text style={styles.summaryText}>
              {sessions.length}{" "}
              {sessions.length === 1
                ? "session"
                : "sessions"}{" "}
              recorded
            </Text>
          </View>

          <FlatList
            data={sessions}
            keyExtractor={(item) =>
              item.id
            }
            renderItem={({
              item,
              index,
            }) => (
              <SessionCard
                item={item}
                index={index}
              />
            )}
            showsVerticalScrollIndicator={
              false
            }
            contentContainerStyle={
              styles.listContent
            }
            refreshing={loading}
            onRefresh={loadSessions}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: 60,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerText: {
    flex: 1,
    minWidth: 0,
  },

  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "800",
    color: colors.text,
  },

  subtitle: {
    marginTop: 5,
    fontSize: 14,
    fontWeight: "500",
    color: colors.textSecondary,
  },

  headerIcon: {
    width: 48,
    height: 48,
    marginLeft: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  summaryRow: {
    marginTop: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
  },

  summaryIcon: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
  },

  summaryText: {
    marginLeft: spacing.sm,
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },

  listContent: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },

  sessionCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
    padding: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  gameImage: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceHighlight,
  },

  gamePlaceholder: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceHighlight,
    alignItems: "center",
    justifyContent: "center",
  },

  sessionInfo: {
    flex: 1,
    minWidth: 0,
    marginLeft: spacing.md,
  },

  gameName: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "700",
    color: colors.text,
  },

  dateRow: {
    marginTop: 5,
    flexDirection: "row",
    alignItems: "center",
  },

  date: {
    marginLeft: 5,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textSecondary,
  },

  notes: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textMuted,
  },

  chevronContainer: {
    width: 30,
    height: 30,
    marginLeft: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
  },

  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },

  emptyIconContainer: {
    width: 72,
    height: 72,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },

  emptyTitle: {
    marginTop: spacing.md,
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
    textAlign: "center",
    color: colors.textSecondary,
  },

  playButton: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xl,
    height: 50,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },

  playButtonText: {
    color: colors.white,
    fontSize: 15,
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

  center: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
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
    width: 68,
    height: 68,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
});