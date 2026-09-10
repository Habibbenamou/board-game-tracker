import {
    ActivityIndicator,
    Alert,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { router } from "expo-router";
import { useEffect, useState } from "react";

import {
    colors,
    radius,
    spacing,
} from "../constants/theme";

import {
    getMyPlayer,
    type Player,
} from "../services/playerService";

import { supabase } from "../services/supabase";

export default function ProfileScreen() {
  const [player, setPlayer] =
    useState<Player | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);

      const data =
        await getMyPlayer();

      setPlayer(data);
    } catch (error) {
      console.error(
        "Error loading profile:",
        error
      );

      Alert.alert(
        "Error",
        "Unable to load your profile."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    const {
      error,
    } = await supabase.auth.signOut();

    if (error) {
      Alert.alert(
        "Error",
        "Unable to log out."
      );

      return;
    }

    router.replace("/login");
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

  if (!player) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyEmoji}>
          👤
        </Text>

        <Text style={styles.emptyTitle}>
          Profile not found
        </Text>

        <Text style={styles.emptyText}>
          We couldn't find your player profile.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.profileCard}>
        {player.avatar_url ? (
          <Image
            source={{
              uri: player.avatar_url,
            }}
            style={styles.avatar}
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {player.name
                .charAt(0)
                .toUpperCase()}
            </Text>
          </View>
        )}

        <Text style={styles.name}>
          {player.name}
        </Text>

        <Text style={styles.usernameLabel}>
          Player profile
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() =>
            router.push("/edit-profile")
          }
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>
            Edit Profile
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutText}>
            Log Out
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
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

  emptyEmoji: {
    fontSize: 50,
  },

  emptyTitle: {
    marginTop: spacing.md,
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
  },

  emptyText: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    textAlign: "center",
  },

  profileCard: {
    alignItems: "center",
    padding: spacing.xl,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },

  avatarPlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
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

  usernameLabel: {
    marginTop: 4,
    color: colors.textSecondary,
    fontSize: 14,
  },

  actions: {
    marginTop: spacing.xl,
  },

  primaryButton: {
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  logoutButton: {
    height: 52,
    marginTop: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  logoutText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
});