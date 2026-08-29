import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { router } from "expo-router";
import { useEffect, useState } from "react";

import {
  getGames,
  type Game,
} from "../../services/gameService";

import {
  getPlayers,
  type Player,
} from "../../services/playerService";

import {
  colors,
  radius,
  spacing,
} from "../../constants/theme";

export default function PlayScreen() {
  const [games, setGames] =
    useState<Game[]>([]);

  const [players, setPlayers] =
    useState<Player[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [selectedGame, setSelectedGame] =
    useState<Game | null>(null);

  const [selectedPlayers, setSelectedPlayers] =
    useState<string[]>([]);

  useEffect(() => {
    loadGamesAndPlayers();
  }, []);

  async function loadGamesAndPlayers() {
    try {
      setLoading(true);

      const [gamesData, playersData] =
        await Promise.all([
          getGames(),
          getPlayers(),
        ]);

      setGames(gamesData);
      setPlayers(playersData);
    } catch (error) {
      console.error(
        "Error loading games and players:",
        error
      );

      Alert.alert(
        "Error",
        "Unable to load games and players."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleSelectGame(game: Game) {
    setSelectedGame(game);
    setSelectedPlayers([]);
  }

  function handleChangeGame() {
    setSelectedGame(null);
    setSelectedPlayers([]);
  }

  function togglePlayer(playerId: string) {
    setSelectedPlayers((current) => {
      if (current.includes(playerId)) {
        return current.filter(
          (id) => id !== playerId
        );
      }

      return [...current, playerId];
    });
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />

        <Text style={styles.loadingText}>
          Loading...
        </Text>
      </View>
    );
  }

  if (games.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emoji}>
          🎲
        </Text>

        <Text style={styles.title}>
          No Games Yet
        </Text>

        <Text style={styles.subtitle}>
          Add a game to your collection before
          recording a game session.
        </Text>
      </View>
    );
  }

  /*
   * Game has been selected.
   * Show player selection.
   */
  if (selectedGame) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>
          Record a Game
        </Text>

        <Text style={styles.subtitle}>
          Select the players who participated.
        </Text>

        {/* Selected game */}
        <View style={styles.selectedGame}>
          {selectedGame.image_url ? (
            <Image
              source={{
                uri: selectedGame.image_url,
              }}
              style={styles.selectedGameImage}
            />
          ) : (
            <View
              style={styles.selectedGamePlaceholder}
            >
              <Text style={styles.placeholderEmoji}>
                🎲
              </Text>
            </View>
          )}

          <View style={styles.selectedGameInfo}>
            <Text
              style={styles.selectedGameName}
              numberOfLines={1}
            >
              {selectedGame.name}
            </Text>

            {selectedGame.category ? (
              <Text
                style={styles.selectedGameCategory}
              >
                {selectedGame.category}
              </Text>
            ) : null}
          </View>

          <TouchableOpacity
            onPress={handleChangeGame}
            activeOpacity={0.8}
          >
            <Text style={styles.changeText}>
              Change
            </Text>
          </TouchableOpacity>
        </View>

        {/* Player selection */}
        <Text style={styles.sectionTitle}>
          Players
        </Text>

        {players.length === 0 ? (
          <View style={styles.emptyPlayers}>
            <Text style={styles.emptyPlayersEmoji}>
              👥
            </Text>

            <Text style={styles.emptyPlayersTitle}>
              No Players Yet
            </Text>

            <Text style={styles.emptyPlayersText}>
              Add players before recording a
              game session.
            </Text>
          </View>
        ) : (
          <FlatList
            data={players}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={
              styles.playerList
            }
            renderItem={({ item }) => {
              const selected =
                selectedPlayers.includes(
                  item.id
                );

              return (
                <TouchableOpacity
                  style={[
                    styles.playerCard,
                    selected &&
                      styles.playerCardSelected,
                  ]}
                  onPress={() =>
                    togglePlayer(item.id)
                  }
                  activeOpacity={0.8}
                >
                  {item.avatar_url ? (
                    <Image
                      source={{
                        uri: item.avatar_url,
                      }}
                      style={styles.playerAvatar}
                    />
                  ) : (
                    <View
                      style={
                        styles.playerAvatarPlaceholder
                      }
                    >
                      <Text
                        style={
                          styles.playerAvatarText
                        }
                      >
                        {item.name
                          .charAt(0)
                          .toUpperCase()}
                      </Text>
                    </View>
                  )}

                  <Text
                    style={styles.playerName}
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>

                  <View
                    style={[
                      styles.checkbox,
                      selected &&
                        styles.checkboxSelected,
                    ]}
                  >
                    {selected ? (
                      <Text
                        style={
                          styles.checkmark
                        }
                      >
                        ✓
                      </Text>
                    ) : null}
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )}

        {/* Continue */}
        {players.length > 0 ? (
          <View style={styles.bottomSection}>
            <Text style={styles.selectedCount}>
              {selectedPlayers.length}{" "}
              {selectedPlayers.length === 1
                ? "player"
                : "players"}{" "}
              selected
            </Text>

            <TouchableOpacity
              style={[
                styles.continueButton,
                selectedPlayers.length === 0 &&
                  styles.continueButtonDisabled,
              ]}
              disabled={
                selectedPlayers.length === 0
              }
              activeOpacity={0.8}
              onPress={() => {
                router.push({
                  pathname: "/record-session",
                  params: {
                    gameId: selectedGame.id,
                    playerIds: JSON.stringify(
                      selectedPlayers
                    ),
                  },
                });
              }}
            >
              <Text
                style={styles.continueButtonText}
              >
                Continue
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    );
  }

  /*
   * Game selection screen.
   */
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Record a Game
      </Text>

      <Text style={styles.subtitle}>
        Choose the game you played.
      </Text>

      <FlatList
        data={games}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          styles.listContent
        }
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.gameCard}
            onPress={() =>
              handleSelectGame(item)
            }
            activeOpacity={0.8}
          >
            {item.image_url ? (
              <Image
                source={{
                  uri: item.image_url,
                }}
                style={styles.gameImage}
              />
            ) : (
              <View
                style={styles.gamePlaceholder}
              >
                <Text
                  style={
                    styles.placeholderEmoji
                  }
                >
                  🎲
                </Text>
              </View>
            )}

            <View style={styles.gameInfo}>
              <Text
                style={styles.gameName}
                numberOfLines={1}
              >
                {item.name}
              </Text>

              {item.category ? (
                <Text
                  style={styles.gameCategory}
                >
                  {item.category}
                </Text>
              ) : null}
            </View>

            <Text style={styles.chevron}>
              ›
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    paddingTop: 60,
  },

  center: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },

  emoji: {
    fontSize: 56,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.text,
  },

  subtitle: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
  },

  loadingText: {
    marginTop: spacing.md,
    color: colors.textSecondary,
  },

  listContent: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },

  gameCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
    padding: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  gameImage: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
  },

  gamePlaceholder: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },

  placeholderEmoji: {
    fontSize: 30,
  },

  gameInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },

  gameName: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
  },

  gameCategory: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textSecondary,
  },

  chevron: {
    marginHorizontal: spacing.sm,
    fontSize: 30,
    color: colors.textMuted,
  },

  selectedGame: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xl,
    padding: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  selectedGameImage: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
  },

  selectedGamePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },

  selectedGameInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },

  selectedGameName: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
  },

  selectedGameCategory: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textSecondary,
  },

  changeText: {
    paddingHorizontal: spacing.sm,
    color: colors.primary,
    fontSize: 14,
    fontWeight: "700",
  },

  sectionTitle: {
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },

  playerList: {
    paddingBottom: spacing.md,
  },

  playerCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  playerCardSelected: {
    borderColor: colors.primary,
  },

  playerAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },

  playerAvatarPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },

  playerAvatarText: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.primary,
  },

  playerName: {
    flex: 1,
    marginLeft: spacing.md,
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },

  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  checkmark: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  emptyPlayers: {
    alignItems: "center",
    padding: spacing.xl,
    marginTop: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  emptyPlayersEmoji: {
    fontSize: 40,
  },

  emptyPlayersTitle: {
    marginTop: spacing.md,
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },

  emptyPlayersText: {
    marginTop: spacing.sm,
    textAlign: "center",
    color: colors.textSecondary,
  },

  bottomSection: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
  },

  selectedCount: {
    marginBottom: spacing.sm,
    textAlign: "center",
    color: colors.textSecondary,
    fontSize: 13,
  },

  continueButton: {
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  continueButtonDisabled: {
    opacity: 0.45,
  },

  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});