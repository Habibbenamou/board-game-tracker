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
import { useSafeAreaInsets } from "react-native-safe-area-context";

import GameForm, {
  type GameFormData,
} from "../components/GameForm";

import {
  deleteGame,
  getGameById,
  updateGame,
  type Game,
} from "../services/gameService";

import {
  deleteGameImage,
  uploadGameImage,
} from "../services/gameImageService";

import {
  colors,
  spacing,
} from "../constants/theme";

export default function EditGameScreen() {
  const { id } =
    useLocalSearchParams<{
      id: string;
    }>();

  const insets = useSafeAreaInsets();

  const [game, setGame] =
    useState<Game | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [deleting, setDeleting] =
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

      /*
       * Keep the current image by default.
       *
       * If the game currently has no image,
       * this will be null.
       */
      const oldImageUrl =
        game?.image_url ?? null;

      let imageUrl = oldImageUrl;

      /*
       * GameForm gives us the selected local
       * image URI in data.image_url.
       *
       * We upload it whenever it is different
       * from the image currently stored for
       * the game.
       */
      const hasNewImage =
        Boolean(data.image_url) &&
        data.image_url !== oldImageUrl;

      if (hasNewImage) {
        console.log(
          "Uploading new game image..."
        );

        imageUrl =
          await uploadGameImage(
            id,
            data.image_url!
          );

        console.log(
          "Game image uploaded:",
          imageUrl
        );
      }

      /*
       * Update the game record with the
       * newly uploaded Supabase image URL.
       */
      const updatedGame =
        await updateGame(id, {
          ...data,
          image_url: imageUrl,
        });

      /*
       * If an old image existed and we replaced
       * it with a new one, remove the old image
       * from Supabase Storage.
       *
       * When oldImageUrl is null, this block
       * is skipped.
       */
      if (
        oldImageUrl &&
        imageUrl &&
        imageUrl !== oldImageUrl
      ) {
        try {
          await deleteGameImage(
            oldImageUrl
          );
        } catch (imageError) {
          console.error(
            "Unable to delete old game image:",
            imageError
          );

          /*
           * The database update was successful,
           * so we don't fail the whole operation
           * just because old Storage cleanup
           * failed.
           */
        }
      }

      /*
       * Keep the local state synchronized with
       * the newly saved game.
       */
      setGame(updatedGame);

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

  function handleDeleteGame() {
    Alert.alert(
      "Delete game?",
      `Are you sure you want to delete "${game?.name}"? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: confirmDeleteGame,
        },
      ]
    );
  }

  async function confirmDeleteGame() {
    try {
      setDeleting(true);

      /*
       * Delete the stored image first.
       *
       * If there is no image, this does nothing.
       */
      if (game?.image_url) {
        try {
          await deleteGameImage(
            game.id
          );
        } catch (imageError) {
          console.error(
            "Unable to delete game image:",
            imageError
          );

          /*
           * Continue deleting the game even if
           * image cleanup fails.
           */
        }
      }

      await deleteGame(id);

      Alert.alert(
        "Game deleted",
        `${game?.name} has been deleted.`,
        [
          {
            text: "OK",
            onPress: () => {
              router.replace(
                "/(tabs)/games"
              );
            },
          },
        ]
      );
    } catch (error) {
      console.error(
        "Error deleting game:",
        error
      );

      Alert.alert(
        "Error",
        "Unable to delete the game. Please try again."
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
    <View style={styles.container}>
      <GameForm
        initialValues={game}
        submitLabel="Save Changes"
        savingLabel="Saving..."
        saving={saving}
        onSubmit={handleUpdateGame}
      />

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
        <Text style={styles.deleteWarning}>
          Deleting this game will permanently
          remove it from your collection.
        </Text>

        <Text
          style={[
            styles.deleteButton,
            deleting &&
              styles.deleteButtonDisabled,
          ]}
          onPress={
            deleting
              ? undefined
              : handleDeleteGame
          }
        >
          {deleting
            ? "Deleting..."
            : "Delete Game"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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

  deleteSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    backgroundColor: colors.background,
  },

  deleteWarning: {
    marginBottom: spacing.sm,
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: "center",
  },

  deleteButton: {
    paddingVertical: spacing.md,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "700",
    color: colors.danger,
  },

  deleteButtonDisabled: {
    opacity: 0.5,
  },
});