import {
  Alert,
} from "react-native";

import { router } from "expo-router";
import { useState } from "react";

import GameForm, {
  type GameFormData,
} from "../components/GameForm";

import {
  createGame,
  updateGame,
} from "../services/gameService";

import {
  uploadGameImage,
} from "../services/gameImageService";

import {
  useGroup,
} from "../context/GroupContext";

export default function AddGameScreen() {
  const {
    currentGroup,
  } = useGroup();

  const [saving, setSaving] =
    useState(false);

  async function handleCreateGame(
    data: GameFormData
  ) {
    if (!data.name.trim()) {
      Alert.alert(
        "Missing information",
        "Please enter the game name."
      );

      return;
    }

    if (!currentGroup) {
      Alert.alert(
        "No group selected",
        "Please select a group before adding a game."
      );

      return;
    }

    try {
      setSaving(true);

      /*
       * Create the game in the current group
       * without an image first.
       *
       * We need the generated game ID before
       * uploading the image.
       */
      const createdGame =
        await createGame({
          ...data,
          group_id: currentGroup.id,
          image_url: null,
        });

      /*
       * GameForm puts the selected local image
       * URI into data.image_url.
       *
       * A local URI is different from the
       * Supabase URL stored in the database.
       */
      if (
        data.image_url &&
        !data.image_url.startsWith("http")
      ) {
        const imageUrl =
          await uploadGameImage(
            createdGame.id,
            data.image_url
          );

        await updateGame(
          createdGame.id,
          {
            image_url: imageUrl,
          }
        );
      }

      Alert.alert(
        "Game added!",
        `${data.name} has been added to your collection.`,
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
        "Error adding game:",
        error
      );

      Alert.alert(
        "Error",
        "Unable to add the game. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <GameForm
      submitLabel="Add Game"
      savingLabel="Adding..."
      saving={saving}
      onSubmit={handleCreateGame}
    />
  );
}