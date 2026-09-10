import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { router } from "expo-router";
import { useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import PlayerForm, {
    type PlayerFormData,
} from "../components/PlayerForm";

import {
    getMyPlayer,
    updateMyPlayer,
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

export default function EditProfileScreen() {
  const insets =
    useSafeAreaInsets();

  const [player, setPlayer] =
    useState<Player | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState(false);

  useEffect(() => {
    loadPlayer();
  }, []);

  async function loadPlayer() {
    try {
      setLoading(true);
      setError(false);

      const data =
        await getMyPlayer();

      if (!data) {
        throw new Error(
          "Your player profile does not exist."
        );
      }

      setPlayer(data);
    } catch (error) {
      console.error(
        "Error loading profile:",
        error
      );

      setError(true);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateProfile(
    data: PlayerFormData,
    selectedImageUri: string | null
  ) {
    if (!data.name.trim()) {
      Alert.alert(
        "Missing information",
        "Please enter a username."
      );

      return;
    }

    if (!player) {
      return;
    }

    try {
      setSaving(true);

      /*
       * Keep the current avatar unless
       * the user selects a new image.
       */
      let avatarUrl =
        player.avatar_url ?? null;

      /*
       * Upload the new image first.
       */
      if (selectedImageUri) {
        avatarUrl =
          await uploadPlayerImage(
            player.id,
            selectedImageUri
          );
      }

      /*
       * Update the current user's player.
       */
      await updateMyPlayer({
        name: data.name,
        avatar_url: avatarUrl,
      });

      /*
       * Delete the old image only after
       * the database update succeeds.
       */
      if (
        player.avatar_url &&
        avatarUrl !== player.avatar_url
      ) {
        try {
          await deletePlayerImage(
            player.avatar_url
          );
        } catch (imageError) {
          console.error(
            "Unable to delete old profile image:",
            imageError
          );
        }
      }

      Alert.alert(
        "Profile updated!",
        "Your profile has been updated successfully.",
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
        "Error updating profile:",
        error
      );

      Alert.alert(
        "Error",
        "Unable to update your profile. Please try again."
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
          Loading profile...
        </Text>
      </View>
    );
  }

  if (error || !player) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>
          Profile unavailable
        </Text>

        <Text style={styles.errorText}>
          We couldn't load your profile.
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom:
            Math.max(
              insets.bottom,
              spacing.lg
            ),
        },
      ]}
    >
      <PlayerForm
        initialValues={player}
        submitLabel="Save Changes"
        savingLabel="Saving..."
        saving={saving}
        onSubmit={handleUpdateProfile}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      colors.background,
  },

  center: {
    flex: 1,
    backgroundColor:
      colors.background,
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