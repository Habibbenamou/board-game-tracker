import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

import {
  router,
  useFocusEffect,
} from "expo-router";

import {
  useCallback,
  useMemo,
  useState,
} from "react";

import Ionicons from "@expo/vector-icons/Ionicons";

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import GameCard from "../../components/GameCard";

import {
  colors,
  radius,
  spacing,
} from "../../constants/theme";

import {
  getGamesByGroupId,
  type Game,
} from "../../services/gameService";

import { useGroup } from "../../context/GroupContext";

const AnimatedPressable =
  Animated.createAnimatedComponent(Pressable);

function formatPlayers(
  minPlayers: number | null,
  maxPlayers: number | null
): string | undefined {
  if (
    minPlayers == null &&
    maxPlayers == null
  ) {
    return undefined;
  }

  if (
    minPlayers != null &&
    maxPlayers != null
  ) {
    if (minPlayers === maxPlayers) {
      return `${minPlayers} player${
        minPlayers === 1 ? "" : "s"
      }`;
    }

    return `${minPlayers}-${maxPlayers} players`;
  }

  if (minPlayers != null) {
    return `${minPlayers}+ players`;
  }

  if (maxPlayers != null) {
    return `Up to ${maxPlayers} players`;
  }

  return undefined;
}

function formatPlaytime(
  minPlaytime: number | null,
  maxPlaytime: number | null
): string | undefined {
  if (
    minPlaytime == null &&
    maxPlaytime == null
  ) {
    return undefined;
  }

  if (
    minPlaytime != null &&
    maxPlaytime != null
  ) {
    if (minPlaytime === maxPlaytime) {
      return `${minPlaytime} min`;
    }

    return `${minPlaytime}-${maxPlaytime} min`;
  }

  if (minPlaytime != null) {
    return `${minPlaytime}+ min`;
  }

  if (maxPlaytime != null) {
    return `Up to ${maxPlaytime} min`;
  }

  return undefined;
}

function AddGameButton({
  onPress,
}: {
  onPress: () => void;
}) {
  const pressed = useSharedValue(0);

  const animatedStyle =
    useAnimatedStyle(() => ({
      transform: [
        {
          scale: withSpring(
            pressed.value ? 0.97 : 1,
            {
              damping: 18,
              stiffness: 300,
            }
          ),
        },
      ],
    }));

  return (
    <AnimatedPressable
      style={[
        styles.addButton,
        animatedStyle,
      ]}
      onPress={onPress}
      onPressIn={() => {
        pressed.value = 1;
      }}
      onPressOut={() => {
        pressed.value = 0;
      }}
    >
      <Ionicons
        name="add"
        size={21}
        color={colors.white}
      />

      <Text style={styles.addButtonText}>
        Add Game
      </Text>
    </AnimatedPressable>
  );
}

export default function GamesScreen() {
  const {
    currentGroup,
  } = useGroup();

  const [games, setGames] =
    useState<Game[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [search, setSearch] =
    useState("");

  const loadGames =
    useCallback(async () => {
      try {
        setLoading(true);
        setError(null);

        if (!currentGroup) {
          setGames([]);
          return;
        }

        const data =
          await getGamesByGroupId(
            currentGroup.id
          );

        setGames(data);
      } catch (err) {
        console.error(
          "Error loading games:",
          err
        );

        setError(
          "Unable to load your games."
        );
      } finally {
        setLoading(false);
      }
    }, [currentGroup?.id]);

  useFocusEffect(
    useCallback(() => {
      loadGames();
    }, [loadGames])
  );

  const filteredGames = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) {
      return games;
    }

    return games.filter((game) => {
      return (
        game.name
          .toLowerCase()
          .includes(query) ||
        game.category
          ?.toLowerCase()
          .includes(query)
      );
    });
  }, [games, search]);

  const hasSearch =
    search.trim().length > 0;

  if (loading) {
    return (
      <View style={styles.center}>
        <View style={styles.loadingIcon}>
          <Ionicons
            name="dice-outline"
            size={30}
            color={colors.primaryLight}
          />
        </View>

        <Text style={styles.loadingTitle}>
          Loading games
        </Text>

        <Text style={styles.loadingText}>
          Getting your collection...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <View style={styles.stateIconDanger}>
          <Ionicons
            name="alert-circle-outline"
            size={30}
            color={colors.danger}
          />
        </View>

        <Text style={styles.emptyTitle}>
          Something went wrong
        </Text>

        <Text style={styles.emptyText}>
          {error}
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.retryButton,
            pressed &&
              styles.buttonPressed,
          ]}
          onPress={loadGames}
        >
          <Ionicons
            name="refresh-outline"
            size={18}
            color={colors.white}
          />

          <Text style={styles.retryButtonText}>
            Retry
          </Text>
        </Pressable>
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
          No group yet
        </Text>

        <Text style={styles.emptyText}>
          Join or create a group to see
          its games.
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
            Games
          </Text>

          <View style={styles.collectionRow}>
            <Text
              style={styles.subtitle}
              numberOfLines={1}
            >
              {currentGroup.name}
            </Text>

            <View style={styles.dot} />

            <Text style={styles.gameCount}>
              {games.length}{" "}
              {games.length === 1
                ? "game"
                : "games"}
            </Text>
          </View>
        </View>

        <View style={styles.headerIcon}>
          <Ionicons
            name="dice-outline"
            size={25}
            color={colors.primaryLight}
          />
        </View>
      </View>

      {/* Search */}

      <View style={styles.searchContainer}>
        <Ionicons
          name="search-outline"
          size={20}
          color={colors.textMuted}
        />

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search games..."
          placeholderTextColor={
            colors.textMuted
          }
          style={styles.searchInput}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
        />

        {hasSearch && (
          <Pressable
            onPress={() => setSearch("")}
            hitSlop={8}
            style={styles.clearButton}
          >
            <Ionicons
              name="close-circle"
              size={20}
              color={colors.textMuted}
            />
          </Pressable>
        )}
      </View>

      {/* Search results count */}

      {hasSearch && (
        <View style={styles.resultsRow}>
          <Text style={styles.resultsText}>
            {filteredGames.length}{" "}
            {filteredGames.length === 1
              ? "result"
              : "results"}
          </Text>
        </View>
      )}

      {/* Games */}

      <FlatList
        data={filteredGames}
        keyExtractor={(item) =>
          String(item.id)
        }
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={[
          styles.list,
          filteredGames.length === 0 &&
            styles.listEmpty,
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <GameCard
            name={item.name}
            category={item.category}
            imageUrl={item.image_url}
            players={formatPlayers(
              item.min_players,
              item.max_players
            )}
            playtime={formatPlaytime(
              item.min_playtime_minutes,
              item.max_playtime_minutes
            )}
            onPress={() =>
              router.push({
                pathname: "/games/[id]",
                params: {
                  id: item.id,
                },
              })
            }
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIconContainer}>
              <Ionicons
                name={
                  hasSearch
                    ? "search-outline"
                    : "dice-outline"
                }
                size={32}
                color={colors.primaryLight}
              />
            </View>

            <Text style={styles.emptyTitle}>
              {hasSearch
                ? "No games found"
                : "No games yet"}
            </Text>

            <Text style={styles.emptyText}>
              {hasSearch
                ? "Try a different search."
                : `Add a game to ${currentGroup.name}'s collection.`}
            </Text>

            {!hasSearch && (
              <Pressable
                style={({ pressed }) => [
                  styles.emptyAddButton,
                  pressed &&
                    styles.buttonPressed,
                ]}
                onPress={() =>
                  router.push("/add-game")
                }
              >
                <Ionicons
                  name="add"
                  size={20}
                  color={colors.white}
                />

                <Text
                  style={
                    styles.emptyAddButtonText
                  }
                >
                  Add your first game
                </Text>
              </Pressable>
            )}
          </View>
        }
      />

      {/* Floating-ish bottom Add Game button */}

      {filteredGames.length > 0 && (
        <View style={styles.addButtonContainer}>
          <AddGameButton
            onPress={() =>
              router.push("/add-game")
            }
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 58,
  },

  header: {
    paddingHorizontal: spacing.lg,
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

  collectionRow: {
    marginTop: 5,
    flexDirection: "row",
    alignItems: "center",
  },

  subtitle: {
    flexShrink: 1,
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "500",
  },

  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.textMuted,
    marginHorizontal: 7,
  },

  gameCount: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "500",
  },

  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    marginLeft: spacing.md,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  searchContainer: {
    height: 50,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
  },

  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    paddingVertical: 0,
    color: colors.text,
    fontSize: 15,
  },

  clearButton: {
    marginLeft: spacing.sm,
  },

  resultsRow: {
    paddingHorizontal: spacing.lg,
    marginTop: 8,
  },

  resultsText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },

  list: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: 18,
    gap: spacing.md,
  },

  listEmpty: {
    flexGrow: 1,
  },

  row: {
    justifyContent: "space-between",
    gap: spacing.md,
  },

  addButtonContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
  },

  addButton: {
    height: 50,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },

  addButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "700",
  },

  buttonPressed: {
    opacity: 0.78,
    transform: [
      {
        scale: 0.98,
      },
    ],
  },

  empty: {
    flex: 1,
    minHeight: 320,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },

  emptyIconContainer: {
    width: 68,
    height: 68,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },

  emptyTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
  },

  emptyText: {
    marginTop: 7,
    maxWidth: 300,
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },

  emptyAddButton: {
    marginTop: spacing.lg,
    height: 44,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },

  emptyAddButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "700",
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
    width: 68,
    height: 68,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },

  stateIconDanger: {
    width: 68,
    height: 68,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.danger,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },

  retryButton: {
    marginTop: spacing.lg,
    height: 44,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },

  retryButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "700",
  },
});