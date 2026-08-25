import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  router,
  useFocusEffect,
} from "expo-router";

import {
  useCallback,
  useState,
} from "react";

import {
  getPlayers,
  type Player,
} from "../services/playerService";

import {
  colors,
  radius,
  spacing,
} from "../constants/theme";

export default function PlayersScreen() {
  const [players, setPlayers] =
    useState<Player[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(false);

  /*
   * Reload the players every time the
   * screen becomes active.
   *
   * This makes changes from:
   * - Add Player
   * - Edit Player
   * - Delete Player
   *
   * appear automatically when we return
   * to this screen.
   */
  useFocusEffect(
    useCallback(() => {
      loadPlayers();
    }, [])
  );

  async function loadPlayers() {
    try {
      setLoading(true);
      setError(false);

      const data =
        await getPlayers();

      setPlayers(data);
    } catch (error) {
      console.error(
        "Error loading players:",
        error
      );

      setError(true);
    } finally {
      setLoading(false);
    }
  }

  /*
   * Open the edit-player screen.
   *
   * We pass the player ID so edit-player.tsx
   * can load the correct player.
   */
  function handlePlayerPress(
    player: Player
  ) {
    router.push({
      pathname: "/edit-player",
      params: {
        id: player.id,
      },
    });
  }

  function renderPlayer({
    item,
  }: {
    item: Player;
  }) {
    const firstLetter =
      item.name
        .trim()
        .charAt(0)
        .toUpperCase();

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          handlePlayerPress(item)
        }
        activeOpacity={0.8}
      >
        {item.avatar_url ? (
          <Image
            source={{
              uri: item.avatar_url,
            }}
            style={styles.avatar}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {firstLetter}
            </Text>
          </View>
        )}

        <View style={styles.playerInfo}>
          <Text
            style={styles.playerName}
            numberOfLines={1}
          >
            {item.name}
          </Text>

          <Text
            style={styles.playerSubtitle}
          >
            Player
          </Text>
        </View>
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
          Loading players...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>
          Unable to load players
        </Text>

        <Text style={styles.errorText}>
          Something went wrong while loading
          your players.
        </Text>

        <TouchableOpacity
          style={styles.retryButton}
          onPress={loadPlayers}
          activeOpacity={0.8}
        >
          <Text style={styles.retryText}>
            Try Again
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            Players
          </Text>

          <Text style={styles.subtitle}>
            Manage the players in your
            collection.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() =>
            router.push("/add-player")
          }
          activeOpacity={0.8}
        >
          <Text style={styles.addButtonText}>
            +
          </Text>
        </TouchableOpacity>
      </View>

      {/* Player list */}
      {players.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>
            👥
          </Text>

          <Text style={styles.emptyTitle}>
            No players yet
          </Text>

          <Text style={styles.emptyText}>
            Add your first player to start
            recording game sessions.
          </Text>

          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() =>
              router.push("/add-player")
            }
            activeOpacity={0.8}
          >
            <Text
              style={
                styles.emptyButtonText
              }
            >
              Add Player
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={players}
          keyExtractor={(item) =>
            item.id
          }
          renderItem={renderPlayer}
          contentContainerStyle={
            styles.listContent
          }
          showsVerticalScrollIndicator={
            false
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      colors.background,
    paddingHorizontal:
      spacing.lg,
  },

  center: {
    flex: 1,
    backgroundColor:
      colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },

  header: {
    paddingTop: 60,
    paddingBottom:
      spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: colors.text,
  },

  subtitle: {
    marginTop: 6,
    color: colors.textSecondary,
  },

  addButton: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor:
      colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  addButtonText: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "400",
    lineHeight: 32,
  },

  listContent: {
    paddingBottom:
      spacing.xl,
    gap: spacing.md,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor:
      colors.surface,
    borderWidth: 1,
    borderColor:
      colors.border,
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor:
      colors.primary,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  avatarText: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "800",
  },

  playerInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },

  playerName: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
  },

  playerSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textSecondary,
  },

  loadingText: {
    marginTop: spacing.md,
    color: colors.textSecondary,
  },

  errorTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
    textAlign: "center",
  },

  errorText: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    textAlign: "center",
  },

  retryButton: {
    marginTop: spacing.lg,
    paddingHorizontal:
      spacing.xl,
    paddingVertical:
      spacing.md,
    borderRadius: radius.md,
    backgroundColor:
      colors.primary,
  },

  retryText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom:
      spacing.xl,
  },

  emptyIcon: {
    fontSize: 48,
  },

  emptyTitle: {
    marginTop: spacing.md,
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
  },

  emptyText: {
    marginTop: spacing.sm,
    maxWidth: 300,
    textAlign: "center",
    lineHeight: 20,
    color: colors.textSecondary,
  },

  emptyButton: {
    marginTop: spacing.lg,
    paddingHorizontal:
      spacing.xl,
    paddingVertical:
      spacing.md,
    borderRadius: radius.md,
    backgroundColor:
      colors.primary,
  },

  emptyButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});