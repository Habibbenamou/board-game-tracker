import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import {
    router,
    useLocalSearchParams,
} from "expo-router";

import { useEffect, useState } from "react";

import {
    getGameSessionById,
    updateGameSession,
    type GameSession,
} from "../services/gameSessionService";

import {
    createSessionPlayer,
    deleteSessionPlayers,
    getSessionPlayers
} from "../services/sessionPlayerService";

import {
    getGames,
    type Game,
} from "../services/gameService";

import {
    getPlayers,
    type Player,
} from "../services/playerService";

import {
    colors,
    radius,
    spacing,
} from "../constants/theme";

type EditablePlayer = {
  player: Player;
  score: string;
  placement: string;
  isWinner: boolean;
};

export default function EditSessionScreen() {
  const { id } =
    useLocalSearchParams<{
      id: string;
    }>();

  const [session, setSession] =
    useState<GameSession | null>(null);

  const [games, setGames] =
    useState<Game[]>([]);

  const [players, setPlayers] =
    useState<Player[]>([]);

  const [selectedGameId, setSelectedGameId] =
    useState<string>("");

  const [selectedPlayers, setSelectedPlayers] =
    useState<EditablePlayer[]>([]);

  const [playedAt, setPlayedAt] =
    useState("");

  const [notes, setNotes] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  useEffect(() => {
    if (id) {
      loadSession();
    }
  }, [id]);

  async function loadSession() {
    try {
      setLoading(true);

      const [
        sessionData,
        gamesData,
        playersData,
        sessionPlayersData,
      ] = await Promise.all([
        getGameSessionById(id),
        getGames(),
        getPlayers(),
        getSessionPlayers(id),
      ]);

      setSession(sessionData);
      setGames(gamesData);
      setPlayers(playersData);

      setSelectedGameId(
        sessionData.game_id
      );

      setPlayedAt(
        formatDateForInput(
          sessionData.played_at
        )
      );

      setNotes(
        sessionData.notes ?? ""
      );

      const editablePlayers =
        sessionPlayersData
          .map((sessionPlayer) => {
            const player =
              playersData.find(
                (item) =>
                  item.id ===
                  sessionPlayer.player_id
              );

            if (!player) {
              return null;
            }

            return {
              player,
              score:
                sessionPlayer.score != null
                  ? String(
                      sessionPlayer.score
                    )
                  : "",
              placement:
                sessionPlayer.placement !=
                null
                  ? String(
                      sessionPlayer.placement
                    )
                  : "",
              isWinner:
                sessionPlayer.is_winner,
            };
          })
          .filter(
            (
              player
            ): player is EditablePlayer =>
              player !== null
          );

      setSelectedPlayers(
        editablePlayers
      );
    } catch (error) {
      console.error(
        "Error loading session for editing:",
        error
      );

      Alert.alert(
        "Error",
        "Unable to load this game session."
      );

      router.back();
    } finally {
      setLoading(false);
    }
  }

  function formatDateForInput(
    dateString: string
  ): string {
    const date = new Date(dateString);

    const year =
      date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    const hours = String(
      date.getHours()
    ).padStart(2, "0");

    const minutes = String(
      date.getMinutes()
    ).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}`;
  }

  function parseDate(
    value: string
  ): string | null {
    const trimmed =
      value.trim();

    if (!trimmed) {
      return null;
    }

    const date =
      new Date(
        trimmed.replace(" ", "T")
      );

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return null;
    }

    return date.toISOString();
  }

  function togglePlayer(
    player: Player
  ) {
    setSelectedPlayers(
      (current) => {
        const exists =
          current.some(
            (item) =>
              item.player.id ===
              player.id
          );

        if (exists) {
          return current.filter(
            (item) =>
              item.player.id !==
              player.id
          );
        }

        return [
          ...current,
          {
            player,
            score: "",
            placement: "",
            isWinner: false,
          },
        ];
      }
    );
  }

  function updatePlayerField(
    playerId: string,
    field:
      | "score"
      | "placement",
    value: string
  ) {
    setSelectedPlayers(
      (current) =>
        current.map((item) =>
          item.player.id ===
          playerId
            ? {
                ...item,
                [field]: value,
              }
            : item
        )
    );
  }

  function setWinner(
    playerId: string
  ) {
    setSelectedPlayers(
      (current) =>
        current.map((item) => ({
          ...item,
          isWinner:
            item.player.id ===
            playerId,
        }))
    );
  }

  async function handleSave() {
    if (!session) {
      return;
    }

    if (!selectedGameId) {
      Alert.alert(
        "Missing information",
        "Please select a game."
      );
      return;
    }

    if (
      selectedPlayers.length ===
      0
    ) {
      Alert.alert(
        "Missing information",
        "Please select at least one player."
      );
      return;
    }

    const parsedDate =
      parseDate(playedAt);

    if (!parsedDate) {
      Alert.alert(
        "Invalid date",
        "Please enter a valid date and time.\n\nExample: 2026-08-29 21:30"
      );
      return;
    }

    const invalidPlacement =
      selectedPlayers.some(
        (item) =>
          item.placement &&
          Number.isNaN(
            Number(item.placement)
          )
      );

    if (invalidPlacement) {
      Alert.alert(
        "Invalid placement",
        "Placements must be numbers."
      );
      return;
    }

    const invalidScore =
      selectedPlayers.some(
        (item) =>
          item.score &&
          Number.isNaN(
            Number(item.score)
          )
      );

    if (invalidScore) {
      Alert.alert(
        "Invalid score",
        "Scores must be numbers."
      );
      return;
    }

    try {
      setSaving(true);

      /*
       * Update the main session.
       */
      await updateGameSession(
        id,
        {
          game_id:
            selectedGameId,
          played_at:
            parsedDate,
          notes:
            notes.trim() || null,
        }
      );

      /*
       * Replace the session's player
       * results with the current list.
       *
       * This keeps the MVP implementation
       * simple and predictable.
       */
      await deleteSessionPlayers(
        id
      );

      for (
        const item of selectedPlayers
      ) {
        await createSessionPlayer({
          session_id: id,
          player_id:
            item.player.id,
          score:
            item.score.trim()
              ? Number(item.score)
              : null,
          placement:
            item.placement.trim()
              ? Number(
                  item.placement
                )
              : null,
          is_winner:
            item.isWinner,
        });
      }

      Alert.alert(
        "Session updated!",
        "The game session has been updated successfully.",
        [
          {
            text: "OK",
            onPress: () => {
              router.replace({
                pathname:
                  "/session-details",
                params: {
                  id,
                },
              });
            },
          },
        ]
      );
    } catch (error) {
      console.error(
        "Error updating game session:",
        error
      );

      Alert.alert(
        "Error",
        "Unable to update the game session. Please try again."
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
          Loading session...
        </Text>
      </View>
    );
  }

  if (!session) {
    return null;
  }

  const selectedIds =
    selectedPlayers.map(
      (item) =>
        item.player.id
    );

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.content
        }
      >

        {/* Game */}
        <Text style={styles.sectionTitle}>
          Game
        </Text>

        <View style={styles.gameList}>
          {games.map((game) => {
            const selected =
              game.id ===
              selectedGameId;

            return (
              <TouchableOpacity
                key={game.id}
                style={[
                  styles.gameCard,
                  selected &&
                    styles.gameCardSelected,
                ]}
                onPress={() =>
                  setSelectedGameId(
                    game.id
                  )
                }
                disabled={saving}
                activeOpacity={0.8}
              >
                {game.image_url ? (
                  <Image
                    source={{
                      uri: game.image_url,
                    }}
                    style={
                      styles.gameImage
                    }
                  />
                ) : (
                  <View
                    style={
                      styles.gamePlaceholder
                    }
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

                <View
                  style={
                    styles.gameInfo
                  }
                >
                  <Text
                    style={
                      styles.gameName
                    }
                    numberOfLines={1}
                  >
                    {game.name}
                  </Text>

                  {game.category ? (
                    <Text
                      style={
                        styles.gameCategory
                      }
                    >
                      {game.category}
                    </Text>
                  ) : null}
                </View>

                <View
                  style={[
                    styles.radio,
                    selected &&
                      styles.radioSelected,
                  ]}
                >
                  {selected ? (
                    <View
                      style={
                        styles.radioDot
                      }
                    />
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Date */}
        <Text style={styles.sectionTitle}>
          Date & Time
        </Text>

        <TextInput
          value={playedAt}
          onChangeText={
            setPlayedAt
          }
          placeholder="YYYY-MM-DD HH:MM"
          placeholderTextColor={
            colors.textMuted
          }
          style={styles.input}
          editable={!saving}
          autoCapitalize="none"
        />

        <Text style={styles.helperText}>
          Example: 2026-08-29 21:30
        </Text>

        {/* Players */}
        <Text style={styles.sectionTitle}>
          Players
        </Text>

        <Text style={styles.sectionSubtitle}>
          Select the players who
          participated.
        </Text>

        <View style={styles.playerList}>
          {players.map((player) => {
            const selected =
              selectedIds.includes(
                player.id
              );

            return (
              <TouchableOpacity
                key={player.id}
                style={[
                  styles.playerCard,
                  selected &&
                    styles.playerCardSelected,
                ]}
                onPress={() =>
                  togglePlayer(
                    player
                  )
                }
                disabled={saving}
                activeOpacity={0.8}
              >
                {player.avatar_url ? (
                  <Image
                    source={{
                      uri: player.avatar_url,
                    }}
                    style={
                      styles.avatar
                    }
                  />
                ) : (
                  <View
                    style={
                      styles.avatarPlaceholder
                    }
                  >
                    <Text
                      style={
                        styles.avatarText
                      }
                    >
                      {player.name
                        .charAt(0)
                        .toUpperCase()}
                    </Text>
                  </View>
                )}

                <Text
                  style={
                    styles.playerName
                  }
                  numberOfLines={1}
                >
                  {player.name}
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
          })}
        </View>

        {/* Results */}
        {selectedPlayers.length >
        0 ? (
          <>
            <Text
              style={styles.sectionTitle}
            >
              Results
            </Text>

            {selectedPlayers.map(
              (item) => (
                <View
                  key={
                    item.player.id
                  }
                  style={
                    styles.resultCard
                  }
                >
                  <View
                    style={
                      styles.resultHeader
                    }
                  >
                    {item.player
                      .avatar_url ? (
                      <Image
                        source={{
                          uri: item
                            .player
                            .avatar_url,
                        }}
                        style={
                          styles.resultAvatar
                        }
                      />
                    ) : (
                      <View
                        style={
                          styles.resultAvatarPlaceholder
                        }
                      >
                        <Text
                          style={
                            styles.avatarText
                          }
                        >
                          {item.player.name
                            .charAt(
                              0
                            )
                            .toUpperCase()}
                        </Text>
                      </View>
                    )}

                    <Text
                      style={
                        styles.resultPlayerName
                      }
                    >
                      {item.player.name}
                    </Text>

                    <TouchableOpacity
                      style={[
                        styles.winnerButton,
                        item.isWinner &&
                          styles.winnerButtonSelected,
                      ]}
                      onPress={() =>
                        setWinner(
                          item.player.id
                        )
                      }
                      disabled={
                        saving
                      }
                      activeOpacity={
                        0.8
                      }
                    >
                      <Text
                        style={[
                          styles.winnerButtonText,
                          item.isWinner &&
                            styles.winnerButtonTextSelected,
                        ]}
                      >
                        {item.isWinner
                          ? "🏆 Winner"
                          : "Winner"}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View
                    style={
                      styles.resultInputs
                    }
                  >
                    <View
                      style={
                        styles.resultInputContainer
                      }
                    >
                      <Text
                        style={
                          styles.inputLabel
                        }
                      >
                        Placement
                      </Text>

                      <TextInput
                        value={
                          item.placement
                        }
                        onChangeText={(
                          value
                        ) =>
                          updatePlayerField(
                            item.player
                              .id,
                            "placement",
                            value
                          )
                        }
                        placeholder="1"
                        placeholderTextColor={
                          colors.textMuted
                        }
                        keyboardType="number-pad"
                        style={
                          styles.smallInput
                        }
                        editable={
                          !saving
                        }
                      />
                    </View>

                    <View
                      style={
                        styles.resultInputContainer
                      }
                    >
                      <Text
                        style={
                          styles.inputLabel
                        }
                      >
                        Score
                      </Text>

                      <TextInput
                        value={
                          item.score
                        }
                        onChangeText={(
                          value
                        ) =>
                          updatePlayerField(
                            item.player
                              .id,
                            "score",
                            value
                          )
                        }
                        placeholder="0"
                        placeholderTextColor={
                          colors.textMuted
                        }
                        keyboardType="numeric"
                        style={
                          styles.smallInput
                        }
                        editable={
                          !saving
                        }
                      />
                    </View>
                  </View>
                </View>
              )
            )}
          </>
        ) : null}

        {/* Notes */}
        <Text style={styles.sectionTitle}>
          Notes
        </Text>

        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Add notes about this game..."
          placeholderTextColor={
            colors.textMuted
          }
          multiline
          textAlignVertical="top"
          style={[
            styles.input,
            styles.notesInput,
          ]}
          editable={!saving}
        />

        {/* Save */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            saving &&
              styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          <Text
            style={styles.saveButtonText}
          >
            {saving
              ? "Saving..."
              : "Save Changes"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      colors.background,
  },

  content: {
    padding: spacing.lg,
    paddingTop: 15,
    paddingBottom: 50,
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

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
    marginBottom: spacing.lg,
  },

  backText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
  },

  headerSpacer: {
    width: 50,
  },

  sectionTitle: {
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    fontSize: 20,
    fontWeight: "800",
    color: colors.text,
  },

  sectionSubtitle: {
    marginBottom: spacing.sm,
    color: colors.textSecondary,
  },

  gameList: {
    gap: spacing.sm,
  },

  gameCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor:
      colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  gameCardSelected: {
    borderColor:
      colors.primary,
  },

  gameImage: {
    width: 60,
    height: 60,
    borderRadius: radius.md,
  },

  gamePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: radius.md,
    backgroundColor:
      colors.background,
    alignItems: "center",
    justifyContent: "center",
  },

  placeholderEmoji: {
    fontSize: 28,
  },

  gameInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },

  gameName: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },

  gameCategory: {
    marginTop: 3,
    fontSize: 13,
    color: colors.textSecondary,
  },

  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: spacing.sm,
  },

  radioSelected: {
    borderColor:
      colors.primary,
  },

  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor:
      colors.primary,
  },

  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor:
      colors.surface,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontSize: 15,
  },

  helperText: {
    marginTop: 5,
    fontSize: 12,
    color: colors.textMuted,
  },

  playerList: {
    gap: spacing.sm,
  },

  playerCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor:
      colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  playerCardSelected: {
    borderColor:
      colors.primary,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },

  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor:
      colors.background,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
  },

  playerName: {
    flex: 1,
    marginLeft: spacing.md,
    fontSize: 15,
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
    backgroundColor:
      colors.primary,
    borderColor:
      colors.primary,
  },

  checkmark: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  resultCard: {
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor:
      colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  resultAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },

  resultAvatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor:
      colors.background,
    alignItems: "center",
    justifyContent: "center",
  },

  resultPlayerName: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },

  winnerButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
    borderRadius: radius.md,
    backgroundColor:
      colors.background,
  },

  winnerButtonSelected: {
    backgroundColor:
      colors.primary,
  },

  winnerButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textSecondary,
  },

  winnerButtonTextSelected: {
    color: "#FFFFFF",
  },

  resultInputs: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.md,
  },

  resultInputContainer: {
    flex: 1,
  },

  inputLabel: {
    marginBottom: 5,
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
  },

  smallInput: {
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor:
      colors.background,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontSize: 15,
  },

  notesInput: {
    height: 120,
    paddingTop: spacing.md,
  },

  saveButton: {
    marginTop: spacing.xl,
    height: 52,
    borderRadius: radius.md,
    backgroundColor:
      colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  saveButtonDisabled: {
    opacity: 0.6,
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});