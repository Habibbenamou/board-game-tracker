import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useEffect, useState } from "react";

import GameCard from "../../components/GameCard";
import { colors, spacing } from "../../constants/theme";
import { getGames } from "../../services/gameService";

export default function GamesScreen() {
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(
    null
  );

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

      <FlatList
        data={games}
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
          />
        )}
      />
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

  list: {
    padding: spacing.lg,
    gap: spacing.md,
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
});