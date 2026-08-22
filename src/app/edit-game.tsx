import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import { useEffect, useState } from "react";

import GameForm, {
  type GameFormData,
} from "../components/GameForm";

import {
  getGameById,
  updateGame,
  type Game,
} from "../services/gameService";

import {
  colors,
  spacing,
} from "../constants/theme";

export default function EditGameScreen() {
  const { id } =
    useLocalSearchParams<{
      id: string;
    }>();

  const [game, setGame] =
    useState<Game | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState(false);

  useEffect(() => {
    if (!id) {
      setError(true);
      setLoading(false);
      return;
    }

    loadGame();
  }, [id]);

  async function loadGame() {
    try {
      setLoading(true);
      setError(false);

      const data =
        await getGameById(id);

      setGame(data);
    } catch (error) {
      console.error(
        "Error loading game:",
        error
      );

      setError(true);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateGame(
    data: GameFormData
  ) {
    if (!data.name.trim()) {
      Alert.alert(
        "Missing information",
        "Please enter the game name."
      );

      return;
    }

    try {
      setSaving(true);

      await updateGame(id, data);

      Alert.alert(
        "Game updated!",
        `${data.name} has been updated successfully.`,
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
        "Error updating game:",
        error
      );

      Alert.alert(
        "Error",
        "Unable to update the game. Please try again."
      );
    } finally {
      setSaving(false);
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
          Loading game...
        </Text>
      </View>
    );
  }

  if (error || !game) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>
          Game not found
        </Text>

        <Text style={styles.errorText}>
          We couldn't load this game.
        </Text>
      </View>
    );
  }

  return (
    <GameForm
      initialValues={game}
      submitLabel="Save Changes"
      savingLabel="Saving..."
      saving={saving}
      onSubmit={handleUpdateGame}
    />
  );
}

const styles = StyleSheet.create({
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

  errorTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.text,
  },

  errorText: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    textAlign: "center",
  },
});