import {
  Alert,
} from "react-native";

import { router } from "expo-router";

import { useState } from "react";

import PlayerForm, {
  type PlayerFormData,
} from "../components/PlayerForm";

import {
  createGuestPlayer,
  updatePlayer,
} from "../services/playerService";

import { useGroup } from "../context/GroupContext";

import {
  uploadPlayerImage,
} from "../services/playerImageService";

export default function AddPlayerScreen() {
  const [saving, setSaving] =
    useState(false);

  const {
    currentGroup,
  } = useGroup();  

  async function handleCreatePlayer(
    data: PlayerFormData,
    selectedAvatarUri: string | null
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
       * Get the current user's groups.
       *
       * MVP:
       * Use the first group because the
       * Players screen currently uses the
       * first group as the active group.
       */
      if (!currentGroup) {
        Alert.alert(
          "No group",
          "Please join or create a group before adding a player."
        );

        return;
}

      /*
       * Create the guest player and add
       * them to the current group.
       *
       * Guest players have no auth user,
       * so user_id remains null.
       */
      const player =
        await createGuestPlayer(
          currentGroup.id,
          data.name,
          null
        );

      /*
       * Upload the avatar after the player
       * has been created because the player
       * ID is used as part of the storage path.
       */
      if (selectedAvatarUri) {
        const avatarUrl =
          await uploadPlayerImage(
            player.id,
            selectedAvatarUri
          );

        await updatePlayer(
          player.id,
          {
            avatar_url: avatarUrl,
          }
        );
      }

      Alert.alert(
        "Player added!",
        `${data.name} has been added successfully.`,
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
        "Error adding guest player:",
        error
      );

      Alert.alert(
        "Error",
        "Unable to add the player. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <PlayerForm
      submitLabel="Add Player"
      savingLabel="Adding..."
      saving={saving}
      onSubmit={handleCreatePlayer}
    />
  );
}
