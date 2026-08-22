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
} from "../services/gameService";

export default function AddGameScreen() {
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

    try {
      setSaving(true);

      await createGame(data);

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