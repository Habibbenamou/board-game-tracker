import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";

import { useCallback, useState } from "react";

import {
  getGameById,
  type Game,
} from "../services/gameService";

import {
  getPlayers,
  type Player,
} from "../services/playerService";

import {
  createGameSession,
} from "../services/gameSessionService";

import {
  createSessionPlayer,
} from "../services/sessionPlayerService";

import {
  colors,
  radius,
  spacing,
} from "../constants/theme";

type PlayerResult = {
  playerId: string;
  score: string;
  placement: string;
  isWinner: boolean;
};

export default function RecordSessionScreen() {
  const {
    gameId,
    playerIds,
  } = useLocalSearchParams<{
    gameId: string;
    playerIds: string;
  }>();

  const [game, setGame] =
    useState<Game | null>(null);

  const [players, setPlayers] =
    useState<Player[]>([]);

  const [results, setResults] =
    useState<PlayerResult[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [useNow, setUseNow] =
    useState(true);

  const [manualDate, setManualDate] =
    useState("");

  const [manualTime, setManualTime] =
    useState("");

  const [notes, setNotes] =
    useState("");

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  async function loadData() {
    try {
      setLoading(true);

      if (!gameId || !playerIds) {
        throw new Error(
          "Missing game or player information."
        );
      }

      const parsedPlayerIds: string[] =
        JSON.parse(playerIds);

      const [
        gameData,
        playersData,
      ] = await Promise.all([
        getGameById(gameId),
        getPlayers(),
      ]);

      const selectedPlayers =
        playersData.filter((player) =>
          parsedPlayerIds.includes(
            player.id
          )
        );

      setGame(gameData);
      setPlayers(selectedPlayers);

      setResults(
        selectedPlayers.map((player) => ({
          playerId: player.id,
          score: "",
          placement: "",
          isWinner: false,
        }))
      );
    } catch (error) {
      console.error(
        "Error loading session data:",
        error
      );

      Alert.alert(
        "Error",
        "Unable to load the game and players."
      );

      router.back();
    } finally {
      setLoading(false);
    }
  }

  function updateResult(
    playerId: string,
    field:
      | "score"
      | "placement",
    value: string
  ) {
    setResults((current) =>
      current.map((result) =>
        result.playerId === playerId
          ? {
              ...result,
              [field]: value,
            }
          : result
      )
    );
  }

  function toggleWinner(
    playerId: string
  ) {
    setResults((current) =>
      current.map((result) => ({
        ...result,
        isWinner:
          result.playerId === playerId
            ? !result.isWinner
            : false,
      }))
    );
  }

  function getPlayedAt(): string | null {
    /*
     * Use the current date and time.
     */
    if (useNow) {
      return new Date().toISOString();
    }

    if (
      !manualDate.trim() ||
      !manualTime.trim()
    ) {
      Alert.alert(
        "Missing date and time",
        "Please enter both the date and time."
      );

      return null;
    }

    /*
     * Expected:
     *
     * Date: YYYY-MM-DD
     * Time: HH:mm
     */
    const dateTime = new Date(
      `${manualDate.trim()}T${manualTime.trim()}`
    );

    if (
      Number.isNaN(
        dateTime.getTime()
      )
    ) {
      Alert.alert(
        "Invalid date and time",
        "Please enter a valid date and time."
      );

      return null;
    }

    return dateTime.toISOString();
  }

function validateResults(): boolean {
  /*
   * Placements are optional.
   *
   * If a placement is provided,
   * it must be a whole number starting from 1.
   */
  const placements = results
    .filter(
      (result) =>
        result.placement.trim() !== ""
    )
    .map((result) =>
      Number(result.placement)
    );

  /*
   * Validate provided placements.
   */
  if (
    placements.some(
      (placement) =>
        !Number.isInteger(placement) ||
        placement < 1
    )
  ) {
    Alert.alert(
      "Invalid placement",
      "Placements must be whole numbers starting from 1."
    );

    return false;
  }

  /*
   * Make sure provided placements are unique.
   *
   * Empty placements are ignored.
   */
  const uniquePlacements =
    new Set(placements);

  if (
    uniquePlacements.size !==
    placements.length
  ) {
    Alert.alert(
      "Duplicate placement",
      "Each player must have a different placement."
    );

    return false;
  }

  /*
   * Scores are optional.
   *
   * If provided, they must be valid numbers.
   */
  const invalidScore =
    results.some((result) => {
      if (!result.score.trim()) {
        return false;
      }

      return Number.isNaN(
        Number(result.score)
      );
    });

  if (invalidScore) {
    Alert.alert(
      "Invalid score",
      "Scores must be valid numbers."
    );

    return false;
  }

  /*
   * Require exactly one winner.
   */
  const winnerCount =
    results.filter(
      (result) => result.isWinner
    ).length;

  if (winnerCount !== 1) {
    Alert.alert(
      "Select a winner",
      "Please select exactly one winner."
    );

    return false;
  }

  return true;
}

  async function handleSaveSession() {
    if (!gameId) {
      Alert.alert(
        "Error",
        "Game information is missing."
      );

      return;
    }

    const playedAt =
      getPlayedAt();

    if (!playedAt) {
      return;
    }

    if (!validateResults()) {
      return;
    }

    try {
      setSaving(true);

      /*
       * 1. Create the game session.
       */
      const session =
        await createGameSession({
          game_id: gameId,
          played_at: playedAt,
          notes:
            notes.trim() || null,
        });

      /*
       * 2. Add every player and their result.
       */
      await Promise.all(
        results.map((result) =>
          createSessionPlayer({
            session_id: session.id,
            player_id: result.playerId,
            score:
              result.score.trim()
                ? Number(result.score)
                : null,
            placement:
              result.placement.trim() !== ""
                ? Number(result.placement)
                : null,
            is_winner:
              result.isWinner,
          })
        )
      );

      Alert.alert(
        "Game recorded!",
        `${game?.name ?? "The game"} has been recorded successfully.`,
        [
          {
            text: "OK",
            onPress: () => {
              router.replace(
                "/(tabs)/play"
              );
            },
          },
        ]
      );
    } catch (error) {
      console.error(
        "Error saving game session:",
        error
      );

      Alert.alert(
        "Error",
        "Unable to save the game session. Please try again."
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
          Loading...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.content
        }
      >
        <Text style={styles.title}>
          Record Game
        </Text>

        <Text style={styles.subtitle}>
          Enter the results of your game.
        </Text>

        {/* Game */}
        {game ? (
          <View style={styles.gameCard}>
            <Text style={styles.gameEmoji}>
              🎲
            </Text>

            <View
              style={styles.gameInfo}
            >
              <Text
                style={styles.gameName}
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
          </View>
        ) : null}

        {/* Date / Time */}
        <Text style={styles.sectionTitle}>
          Date & Time
        </Text>

        <View
          style={styles.modeContainer}
        >
          <TouchableOpacity
            style={[
              styles.modeButton,
              useNow &&
                styles.modeButtonSelected,
            ]}
            onPress={() =>
              setUseNow(true)
            }
            disabled={saving}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.modeButtonText,
                useNow &&
                  styles.modeButtonTextSelected,
              ]}
            >
              Now
            </Text>

            {useNow ? (
              <Text
                style={styles.checkmark}
              >
                ✓
              </Text>
            ) : null}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modeButton,
              !useNow &&
                styles.modeButtonSelected,
            ]}
            onPress={() =>
              setUseNow(false)
            }
            disabled={saving}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.modeButtonText,
                !useNow &&
                  styles.modeButtonTextSelected,
              ]}
            >
              Enter manually
            </Text>

            {!useNow ? (
              <Text
                style={styles.checkmark}
              >
                ✓
              </Text>
            ) : null}
          </TouchableOpacity>
        </View>

        {!useNow ? (
          <View
            style={styles.manualContainer}
          >
            <Text style={styles.label}>
              Date
            </Text>

            <TextInput
              value={manualDate}
              onChangeText={
                setManualDate
              }
              placeholder="YYYY-MM-DD"
              placeholderTextColor={
                colors.textMuted
              }
              style={styles.input}
              keyboardType="numbers-and-punctuation"
              editable={!saving}
            />

            <Text style={styles.label}>
              Time
            </Text>

            <TextInput
              value={manualTime}
              onChangeText={
                setManualTime
              }
              placeholder="HH:mm"
              placeholderTextColor={
                colors.textMuted
              }
              style={styles.input}
              keyboardType="numbers-and-punctuation"
              editable={!saving}
            />

            <Text
              style={styles.helperText}
            >
              Example: 2026-08-26 at
              20:30
            </Text>
          </View>
        ) : (
          <View style={styles.nowCard}>
            <Text style={styles.nowIcon}>
              🕐
            </Text>

            <View
              style={styles.nowInfo}
            >
              <Text
                style={styles.nowTitle}
              >
                Current date and time
              </Text>

              <Text
                style={styles.nowText}
              >
                The session will use the
                current date and time when
                saved.
              </Text>
            </View>
          </View>
        )}

        {/* Results */}
        <Text style={styles.sectionTitle}>
          Results
        </Text>

        <Text style={styles.sectionSubtitle}>
          Enter the score and placement for
          each player, then select the winner.
        </Text>

        {players.map((player) => {
          const result =
            results.find(
              (item) =>
                item.playerId ===
                player.id
            );

          if (!result) {
            return null;
          }

          return (
            <View
              key={player.id}
              style={[
                styles.playerCard,
                result.isWinner &&
                  styles.playerCardWinner,
              ]}
            >
              <View
                style={
                  styles.playerHeader
                }
              >
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

                <Text
                  style={styles.playerName}
                  numberOfLines={1}
                >
                  {player.name}
                </Text>

                <TouchableOpacity
                  style={[
                    styles.winnerButton,
                    result.isWinner &&
                      styles.winnerButtonSelected,
                  ]}
                  onPress={() =>
                    toggleWinner(
                      player.id
                    )
                  }
                  disabled={saving}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.winnerButtonText,
                      result.isWinner &&
                        styles.winnerButtonTextSelected,
                    ]}
                  >
                    {result.isWinner
                      ? "✓ Winner"
                      : "Winner"}
                  </Text>
                </TouchableOpacity>
              </View>

              <View
                style={styles.resultRow}
              >
                <View
                  style={styles.resultField}
                >
                  <Text
                    style={styles.label}
                  >
                    Score
                  </Text>

                  <TextInput
                    value={
                      result.score
                    }
                    onChangeText={(
                      value
                    ) =>
                      updateResult(
                        player.id,
                        "score",
                        value
                      )
                    }
                    placeholder="Optional"
                    placeholderTextColor={
                      colors.textMuted
                    }
                    keyboardType="numeric"
                    style={styles.input}
                    editable={!saving}
                  />
                </View>

                <View
                  style={styles.resultField}
                >
                  <Text
                    style={styles.label}
                  >
                    Placement
                  </Text>

                  <TextInput
                    value={
                      result.placement
                    }
                    onChangeText={(
                      value
                    ) =>
                      updateResult(
                        player.id,
                        "placement",
                        value
                      )
                    }
                    placeholder="1"
                    placeholderTextColor={
                      colors.textMuted
                    }
                    keyboardType="number-pad"
                    style={styles.input}
                    editable={!saving}
                  />
                </View>
              </View>
            </View>
          );
        })}

        {/* Notes */}
        <Text style={styles.sectionTitle}>
          Notes
        </Text>

        <Text style={styles.sectionSubtitle}>
          Add anything you want to remember
          about this game session.
        </Text>

        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="How did the game go? Any memorable moments?"
          placeholderTextColor={
            colors.textMuted
          }
          style={[
            styles.input,
            styles.notesInput,
          ]}
          multiline
          textAlignVertical="top"
          editable={!saving}
        />

        {/* Save */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            saving &&
              styles.saveButtonDisabled,
          ]}
          onPress={
            handleSaveSession
          }
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator
              color="#FFFFFF"
            />
          ) : (
            <Text
              style={styles.saveButtonText}
            >
              Save Game Session
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() =>
            router.back()
          }
          disabled={saving}
          activeOpacity={0.8}
        >
          <Text
            style={styles.cancelButtonText}
          >
            Cancel
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    padding: spacing.lg,
    paddingTop: 60,
    paddingBottom: 40,
  },

  center: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: spacing.md,
    color: colors.textSecondary,
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

  gameCard: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xl,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  gameEmoji: {
    width: 52,
    height: 52,
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: 30,
    borderRadius: radius.md,
    backgroundColor: colors.background,
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

  sectionTitle: {
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },

  sectionSubtitle: {
    marginBottom: spacing.md,
    color: colors.textSecondary,
    fontSize: 13,
  },

  modeContainer: {
    gap: spacing.sm,
  },

  modeButton: {
    minHeight: 56,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  modeButtonSelected: {
    borderColor: colors.primary,
  },

  modeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },

  modeButtonTextSelected: {
    color: colors.primary,
  },

  checkmark: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.primary,
  },

  manualContainer: {
    marginTop: spacing.md,
  },

  label: {
    marginBottom: 6,
    marginTop: spacing.sm,
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },

  input: {
    height: 48,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: 15,
  },

  helperText: {
    marginTop: spacing.sm,
    color: colors.textMuted,
    fontSize: 13,
  },

  nowCard: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
  },

  nowIcon: {
    fontSize: 30,
  },

  nowInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },

  nowTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },

  nowText: {
    marginTop: 4,
    lineHeight: 20,
    color: colors.textSecondary,
    fontSize: 13,
  },

  playerCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  playerCardWinner: {
    borderColor: colors.primary,
  },

  playerHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background,
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
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },

  winnerButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },

  winnerButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  winnerButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textSecondary,
  },

  winnerButtonTextSelected: {
    color: "#FFFFFF",
  },

  resultRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.sm,
  },

  resultField: {
    flex: 1,
  },

  notesInput: {
    height: 120,
    paddingTop: spacing.md,
  },

  saveButton: {
    height: 54,
    marginTop: spacing.xl,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
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

  cancelButton: {
    height: 50,
    marginTop: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
  },

  cancelButtonText: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: "600",
  },
});