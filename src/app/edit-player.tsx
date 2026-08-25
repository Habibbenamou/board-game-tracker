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

import PlayerForm, {
  type PlayerFormData,
} from "../components/PlayerForm";

import {
  deletePlayer,
  getPlayerById,
  updatePlayer,
  type Player,
} from "../services/playerService";

import {
  deletePlayerImage,
  uploadPlayerImage,
} from "../services/playerImageService";

import {
  colors,
  spacing,
} from "../constants/theme";

export default function EditPlayerScreen() {
  const { id } =
    useLocalSearchParams<{
      id: string;
    }>();
  
  const insets = useSafeAreaInsets(); // Use the safe area insets to avoid overlapping with notches or home indicators

  const [player, setPlayer] =
    useState<Player | null>(null);

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

    loadPlayer();
  }, [id]);

  async function loadPlayer() {
    try {
      setLoading(true);
      setError(false);

      const data =
        await getPlayerById(id);

      setPlayer(data);
    } catch (error) {
      console.error(
        "Error loading player:",
        error
      );

      setError(true);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdatePlayer(
    data: PlayerFormData,
    selectedImageUri: string | null
  ) {
    if (!data.name.trim()) {
      Alert.alert(
        "Missing information",
        "Please enter the player name."
      );

      return;
    }

    try {
      setSaving(true);

      /*
       * Start with the existing avatar.
       *
       * If the user does not select a new image,
       * the existing avatar remains unchanged.
       */
      let avatarUrl =
        player?.avatar_url ?? null;

      /*
       * If the user selected a new image,
       * upload it first.
       */
      if (selectedImageUri) {
        avatarUrl =
          await uploadPlayerImage(
            id,
            selectedImageUri
          );
      }

      /*
       * Update the player database record
       * with the new avatar URL.
       */
      await updatePlayer(id, {
        ...data,
        avatar_url: avatarUrl,
      });

      /*
       * Only after the database update succeeds,
       * delete the previous avatar.
       *
       * This prevents us from losing the old image
       * if the database update fails.
       */
      if (
        player?.avatar_url &&
        avatarUrl !== player.avatar_url
      ) {
        try {
          await deletePlayerImage(
            player.avatar_url
          );
        } catch (imageError) {
          console.error(
            "Unable to delete old player image:",
            imageError
          );

          /*
           * The player was successfully updated,
           * so don't fail the entire operation
           * because cleanup failed.
           */
        }
      }

      Alert.alert(
        "Player updated!",
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
        "Error updating player:",
        error
      );

      Alert.alert(
        "Error",
        "Unable to update the player. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  function handleDeletePlayer() {
    Alert.alert(
      "Delete player?",
      `Are you sure you want to delete "${player?.name}"? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: confirmDeletePlayer,
        },
      ]
    );
  }

  async function confirmDeletePlayer() {
    try {
      setDeleting(true);

      /*
       * Delete the player's avatar first.
       *
       * If there is no avatar, nothing happens.
       *
       * We intentionally continue even if image
       * deletion fails, just like Games.
       */
      if (player?.avatar_url) {
        try {
          await deletePlayerImage(
            player.avatar_url
          );
        } catch (imageError) {
          console.error(
            "Unable to delete player image:",
            imageError
          );
        }
      }

      /*
       * Delete the player database record.
       */
      await deletePlayer(id);

      Alert.alert(
        "Player deleted",
        `${player?.name} has been deleted.`,
        [
          {
            text: "OK",
            onPress: () => {
              router.replace(
                "/(tabs)/more"
              );
            },
          },
        ]
      );
    } catch (error) {
      console.error(
        "Error deleting player:",
        error
      );

      Alert.alert(
        "Error",
        "Unable to delete the player. Please try again."
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
          Loading player...
        </Text>
      </View>
    );
  }

  if (error || !player) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>
          Player not found
        </Text>

        <Text style={styles.errorText}>
          We couldn't load this player.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PlayerForm
        initialValues={player}
        submitLabel="Save Changes"
        savingLabel="Saving..."
        saving={saving}
        onSubmit={handleUpdatePlayer}
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
      {/* Use the safe area insets similar to the delete section in edit-game.tsx to avoid overlapping with notches or home indicators */}
        <Text style={styles.deleteWarning}>
          Deleting this player will permanently
          remove them from your collection.
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
              : handleDeletePlayer
          }
        >
          {deleting
            ? "Deleting..."
            : "Delete Player"}
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
    paddingBottom: spacing.lg,
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