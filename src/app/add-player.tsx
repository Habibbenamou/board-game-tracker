import {
    Alert,
} from "react-native";

import { router } from "expo-router";

import { useState } from "react";

import PlayerForm, {
    type PlayerFormData,
} from "../components/PlayerForm";

import {
    createPlayer,
    updatePlayer,
} from "../services/playerService";

import {
    uploadPlayerImage,
} from "../services/playerImageService";

export default function AddPlayerScreen() {
  const [saving, setSaving] =
    useState(false);

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

      const player = await createPlayer({
        ...data,
        avatar_url: null,
      });

      if (selectedAvatarUri) {
        const avatarUrl = await uploadPlayerImage(
          player.id,
          selectedAvatarUri
        );

        await updatePlayer(player.id, {
          avatar_url: avatarUrl,
        });
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
        "Error adding player:",
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