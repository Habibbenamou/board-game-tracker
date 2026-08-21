import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  router,
} from "expo-router";

import { useEffect, useMemo, useState } from "react";

import GameCard from "../../components/GameCard";
import {
  colors,
  radius,
  spacing,
} from "../../constants/theme";

import {
  getGames,
  type Game,
} from "../../services/gameService";

export default function GamesScreen() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(
    null
  );
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadGames();
  }, []);

  async function loadGames() {
    try {
      setLoading(true);
      setError(null);

      const data = await getGames();

      setGames(data);
    } catch (err) {
      console.error(err);

      setError(
        "Unable to load your games."
      );
    } finally {
      setLoading(false);
    }
  }

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

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />

        <Text style={styles.loadingText}>
          Loading games...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>
          {error}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Games
      </Text>
    
      <Text style={styles.subtitle}>
        {games.length} games in your collection
      </Text>

      
      
      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Search games..."
        placeholderTextColor={colors.textMuted}
        style={styles.search}
      />

      <FlatList
        data={filteredGames}
        keyExtractor={(item) =>
          String(item.id)
        }
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <GameCard
            name={item.name}
            category={item.category}
            imageUrl={item.image_url}
            minPlayers={item.min_players}
            maxPlayers={item.max_players}
            minPlaytime={
              item.min_playtime_minutes
            }
            maxPlaytime={
              item.max_playtime_minutes
            }
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>
              🎲
            </Text>

            <Text style={styles.emptyTitle}>
              No games found
            </Text>

            <Text style={styles.emptyText}>
              Try a different search.
            </Text>
          </View>
        }
      />
      
      <TouchableOpacity style={styles.addButton}
        onPress={() => router.push("/add-game")}>
        <Text style={styles.addButtonText}>
            + Add Game
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 60,
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: colors.text,
    paddingHorizontal: spacing.lg,
  },

  subtitle: {
    marginTop: 6,
    color: colors.textSecondary,
    paddingHorizontal: spacing.lg,
  },

  addButton: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    height: 46,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  addButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  search: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontSize: 15,
  },

  list: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: 100,
  },

  row: {
    justifyContent: "space-between",
    gap: spacing.md,
  },

  center: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },

  loadingText: {
    marginTop: spacing.md,
    color: colors.textSecondary,
  },

  errorText: {
    color: colors.danger,
    textAlign: "center",
  },

  empty: {
    alignItems: "center",
    marginTop: 80,
  },

  emptyIcon: {
    fontSize: 48,
  },

  emptyTitle: {
    marginTop: spacing.md,
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },

  emptyText: {
    marginTop: 6,
    color: colors.textSecondary,
  },
});