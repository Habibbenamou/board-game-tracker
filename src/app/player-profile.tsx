import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import { useEffect, useState } from "react";

import {
  colors,
  radius,
  spacing,
} from "../constants/theme";

import {
  getPlayerById,
  type Player,
} from "../services/playerService";

export default function PlayerProfileScreen() {
  const { id } =
    useLocalSearchParams<{
      id: string;
    }>();

  const [player, setPlayer] =
    useState<Player | null>(null);

  const [loading, setLoading] =
    useState(true);

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
        "Error loading player profile:",
        error
      );

      setError(true);
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
          Loading profile...
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
          We couldn't load this player's profile.
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.back()}
        >
          <Text style={styles.buttonText}>
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          {player.avatar_url ? (
            <Image
              source={{
                uri: player.avatar_url,
              }}
              style={styles.avatarImage}
            />
          ) : (
            <Text style={styles.avatarText}>
              {player.name
                .charAt(0)
                .toUpperCase()}
            </Text>
          )}
        </View>

        <Text style={styles.name}>
          {player.name}
        </Text>

        <Text style={styles.label}>
          Player
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      colors.background,
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },

  center: {
    flex: 1,
    backgroundColor:
      colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },

  profileCard: {
    alignItems: "center",
    backgroundColor:
      colors.surface,
    borderWidth: 1,
    borderColor:
      colors.border,
    borderRadius: radius.lg,
    padding: spacing.xl,
  },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor:
      colors.background,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  avatarImage: {
    width: "100%",
    height: "100%",
  },

  avatarText: {
    fontSize: 42,
    fontWeight: "800",
    color: colors.primary,
  },

  name: {
    marginTop: spacing.lg,
    fontSize: 26,
    fontWeight: "800",
    color: colors.text,
  },

  label: {
    marginTop: 6,
    fontSize: 14,
    color: colors.textSecondary,
  },

  loadingText: {
    marginTop: spacing.md,
    color: colors.textSecondary,
  },

  errorTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.text,
    textAlign: "center",
  },

  errorText: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    textAlign: "center",
  },

  button: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    height: 50,
    borderRadius: radius.md,
    backgroundColor:
      colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});