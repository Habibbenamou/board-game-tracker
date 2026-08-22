import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  router,
  Stack,
  useLocalSearchParams,
} from "expo-router";

import { useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  colors,
  radius,
  spacing,
} from "../../constants/theme";

import { getGameById } from "../../services/gameService";

import type { Tables } from "../../types/database";

type Game = Tables<"games">;

export default function GameDetailsScreen() {
  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  const insets = useSafeAreaInsets();

  const [game, setGame] =
    useState<Game | null>(null);

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

    loadGame();
  }, [id]);

  async function loadGame() {
    try {
      setLoading(true);
      setError(false);

      const data = await getGameById(id);

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

  async function openUrl(
    url: string | null,
    label: string
  ) {
    if (!url) {
      Alert.alert(
        "Unavailable",
        `${label} is not available for this game.`
      );

      return;
    }

    try {
      const supported =
        await Linking.canOpenURL(url);

      if (!supported) {
        Alert.alert(
          "Unable to open link",
          "This link cannot be opened on your device."
        );

        return;
      }

      await Linking.openURL(url);
    } catch (error) {
      console.error(
        "Error opening URL:",
        error
      );

      Alert.alert(
        "Error",
        "Unable to open this link."
      );
    }
  }

  if (loading) {
    return (
      <>
        <Stack.Screen
          options={{
            headerShown: false,
          }}
        />

        <View style={styles.center}>
          <ActivityIndicator
            size="large"
            color={colors.primary}
          />

          <Text style={styles.loadingText}>
            Loading game...
          </Text>
        </View>
      </>
    );
  }

  if (error || !game) {
    return (
      <>
        <Stack.Screen
          options={{
            headerShown: false,
          }}
        />

        <View style={styles.center}>
          <Text style={styles.errorTitle}>
            Game not found
          </Text>

          <Text style={styles.errorText}>
            We couldn't load this game.
          </Text>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }

  const playerCount =
    game.min_players &&
    game.max_players
      ? `${game.min_players}–${game.max_players} players`
      : game.min_players
      ? `${game.min_players}+ players`
      : game.max_players
      ? `Up to ${game.max_players} players`
      : null;

  const playTime =
    game.min_playtime_minutes &&
    game.max_playtime_minutes
      ? `${game.min_playtime_minutes}–${game.max_playtime_minutes} min`
      : game.min_playtime_minutes
      ? `${game.min_playtime_minutes}+ min`
      : game.max_playtime_minutes
      ? `Up to ${game.max_playtime_minutes} min`
      : null;

  return (
    <>
      {/* Disable Expo Router's default header */}
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            {
              paddingBottom:
                Math.max(
                  insets.bottom,
                  spacing.xl
                ) + 40,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Custom Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backIcon}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Text style={styles.backIconText}>
                ‹
              </Text>
            </TouchableOpacity>

            <Text
              style={styles.headerTitle}
              numberOfLines={1}
            >
              {game.name}
            </Text>

            <View style={styles.headerSpacer} />
          </View>

          {/* Game image */}
          {game.image_url ? (
            <Image
              source={{
                uri: game.image_url,
              }}
              style={styles.gameImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text
                style={styles.placeholderIcon}
              >
                🎲
              </Text>

              <Text
                style={styles.placeholderText}
              >
                No image
              </Text>
            </View>
          )}

          {/* Game title */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>
              {game.name}
            </Text>

            {game.category ? (
              <View style={styles.categoryBadge}>
                <Text
                  style={styles.categoryText}
                >
                  {game.category}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Quick information */}
          {playerCount || playTime ? (
            <View style={styles.infoRow}>
              {playerCount ? (
                <View style={styles.infoCard}>
                  <Text style={styles.infoIcon}>
                    👥
                  </Text>

                  <Text style={styles.infoLabel}>
                    Players
                  </Text>

                  <Text style={styles.infoValue}>
                    {playerCount}
                  </Text>
                </View>
              ) : null}

              {playTime ? (
                <View style={styles.infoCard}>
                  <Text style={styles.infoIcon}>
                    ⏱
                  </Text>

                  <Text style={styles.infoLabel}>
                    Play time
                  </Text>

                  <Text style={styles.infoValue}>
                    {playTime}
                  </Text>
                </View>
              ) : null}
            </View>
          ) : null}

          {/* Description */}
          {game.description ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                About the game
              </Text>

              <Text style={styles.description}>
                {game.description}
              </Text>
            </View>
          ) : null}

          {/* Rules */}
          {game.rules_url ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Game rules
              </Text>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() =>
                  openUrl(
                    game.rules_url,
                    "Game rules"
                  )
                }
                activeOpacity={0.8}
              >
                <Text style={styles.actionIcon}>
                  📖
                </Text>

                <View style={styles.actionContent}>
                  <Text
                    style={styles.actionTitle}
                  >
                    Open Game Guide
                  </Text>

                  <Text
                    style={styles.actionSubtitle}
                  >
                    View the rules in your browser
                  </Text>
                </View>

                <Text style={styles.arrow}>
                  ›
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Official website */}
          {game.official_url ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Official website
              </Text>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() =>
                  openUrl(
                    game.official_url,
                    "Official website"
                  )
                }
                activeOpacity={0.8}
              >
                <Text style={styles.actionIcon}>
                  🌐
                </Text>

                <View style={styles.actionContent}>
                  <Text
                    style={styles.actionTitle}
                  >
                    Visit Official Website
                  </Text>

                  <Text
                    style={styles.actionSubtitle}
                  >
                    Open the game website
                  </Text>
                </View>

                <Text style={styles.arrow}>
                  ›
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    padding: spacing.lg,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    backgroundColor: colors.background,
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

  backButton: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xl,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  backButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    marginBottom: spacing.md,
  },

  backIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },

  backIconText: {
    fontSize: 32,
    lineHeight: 34,
    color: colors.text,
    marginTop: -3,
  },

  headerTitle: {
    flex: 1,
    marginHorizontal: spacing.md,
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
  },

  headerSpacer: {
    width: 40,
  },

  gameImage: {
    width: "100%",
    height: 220,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },

  imagePlaceholder: {
    width: "100%",
    height: 220,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },

  placeholderIcon: {
    fontSize: 52,
  },

  placeholderText: {
    marginTop: spacing.sm,
    color: colors.textMuted,
  },

  titleSection: {
    marginTop: spacing.lg,
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: colors.text,
  },

  categoryBadge: {
    alignSelf: "flex-start",
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },

  categoryText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
  },

  infoRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.lg,
  },

  infoCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },

  infoIcon: {
    fontSize: 20,
  },

  infoLabel: {
    marginTop: 8,
    fontSize: 12,
    color: colors.textMuted,
  },

  infoValue: {
    marginTop: 3,
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },

  section: {
    marginTop: spacing.xl,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.sm,
  },

  description: {
    fontSize: 15,
    lineHeight: 23,
    color: colors.textSecondary,
  },

  actionButton: {
    minHeight: 68,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
  },

  actionIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },

  actionContent: {
    flex: 1,
  },

  actionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },

  actionSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: colors.textMuted,
  },

  arrow: {
    fontSize: 28,
    color: colors.textMuted,
    marginLeft: spacing.sm,
  },
});