import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

import {
    getGameSessions,
    type GameSession,
} from "../services/gameSessionService";

import {
    getGames,
    type Game,
} from "../services/gameService";

import {
    colors,
    radius,
    spacing,
} from "../constants/theme";

type SessionWithGame = GameSession & {
  game: Game | null;
};

export default function GameSessionsScreen() {
  const [sessions, setSessions] =
    useState<SessionWithGame[]>([]);

  const [loading, setLoading] =
    useState(true);

  useFocusEffect(
    useCallback(() => {
      loadSessions();
    }, [])
  );

  async function loadSessions() {
    try {
      setLoading(true);

      const [sessionsData, gamesData] =
        await Promise.all([
          getGameSessions(),
          getGames(),
        ]);

      const sessionsWithGames =
        sessionsData.map((session) => ({
          ...session,
          game:
            gamesData.find(
              (game) =>
                game.id === session.game_id
            ) ?? null,
        }));

      setSessions(sessionsWithGames);
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

  function renderSession({
    item,
  }: {
    item: SessionWithGame;
  }) {
    return (
      <TouchableOpacity
        style={styles.sessionCard}
        activeOpacity={0.8}
        onPress={() => {
          router.push({
            pathname: "/session-details",
            params: {
              id: item.id,
            },
          });
        }}
      >
        {item.game?.image_url ? (
          <Image
            source={{
              uri: item.game.image_url,
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

        <View style={styles.sessionInfo}>
          <Text
            style={styles.gameName}
            numberOfLines={1}
          >
            {item.game?.name ??
              "Unknown game"}
          </Text>

          <Text style={styles.date}>
            {formatDate(item.played_at)}
          </Text>

          {item.notes ? (
            <Text
              style={styles.notes}
              numberOfLines={2}
            >
              {item.notes}
            </Text>
          ) : null}
        </View>

        <Text style={styles.chevron}>
          ›
        </Text>
      </TouchableOpacity>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />

        <Text style={styles.loadingText}>
          Loading game history...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Game History
      </Text>

      <Text style={styles.subtitle}>
        Review the games you've played.
      </Text>

      {sessions.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>
            🎲
          </Text>

          <Text style={styles.emptyTitle}>
            No Games Played Yet
          </Text>

          <Text style={styles.emptyText}>
            Your recorded game sessions will
            appear here.
          </Text>

          <TouchableOpacity
            style={styles.playButton}
            onPress={() =>
              router.push("/(tabs)/play")
            }
            activeOpacity={0.8}
          >
            <Text
              style={styles.playButtonText}
            >
              Record a Game
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id}
          renderItem={renderSession}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            styles.listContent
          }
          refreshing={loading}
          onRefresh={loadSessions}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    paddingTop: 60,
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
    fontSize: 30,
    fontWeight: "800",
    color: colors.text,
  },

  subtitle: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
  },

  listContent: {
    paddingTop: spacing.xl,
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
  },

  gamePlaceholder: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },

  placeholderEmoji: {
    fontSize: 30,
  },

  sessionInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },

  gameName: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
  },

  date: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textSecondary,
  },

  notes: {
    marginTop: 6,
    fontSize: 13,
    color: colors.textMuted,
  },

  chevron: {
    marginHorizontal: spacing.sm,
    fontSize: 30,
    color: colors.textMuted,
  },

  empty: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    padding: spacing.xl,
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
    textAlign: "center",
    color: colors.textSecondary,
  },

  playButton: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xl,
    height: 50,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  playButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});