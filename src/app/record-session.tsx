import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
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

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { Ionicons } from "@expo/vector-icons";

import {
  getGameById,
  type Game,
} from "../services/gameService";

import {
  getPlayersByGroupId,
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

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGroup } from "../context/GroupContext";

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

  const {
    currentGroup,
  } = useGroup();

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

  const [animatedWinnerId, setAnimatedWinnerId] =
    useState<string | null>(null);

  const insets =
    useSafeAreaInsets();

  const scrollViewRef =
    useRef<ScrollView>(null);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [
      gameId,
      playerIds,
      currentGroup?.id,
    ])
  );

  async function loadData() {
    try {
      setLoading(true);

      if (!gameId || !playerIds) {
        throw new Error(
          "Missing game or player information."
        );
      }

      if (!currentGroup) {
        throw new Error(
          "No current group selected."
        );
      }

      const parsedPlayerIds: string[] =
        JSON.parse(playerIds);

      const [
        gameData,
        playersData,
      ] = await Promise.all([
        getGameById(gameId),
        getPlayersByGroupId(
          currentGroup.id
        ),
      ]);

      if (
        !gameData ||
        gameData.group_id !==
          currentGroup.id
      ) {
        throw new Error(
          "The selected game does not belong to the current group."
        );
      }

      const selectedPlayers =
        playersData.filter((player) =>
          parsedPlayerIds.includes(
            player.id
          )
        );

      if (
        selectedPlayers.length === 0
      ) {
        throw new Error(
          "No selected players belong to the current group."
        );
      }

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
    const currentWinner =
      results.find(
        (result) => result.isWinner
      );

    const isAlreadyWinner =
      currentWinner?.playerId ===
      playerId;

    setResults((current) =>
      current.map((result) => ({
        ...result,
        isWinner:
          result.playerId === playerId
            ? !result.isWinner
            : false,
      }))
    );

    if (!isAlreadyWinner) {
      setAnimatedWinnerId(playerId);

      setTimeout(() => {
        setAnimatedWinnerId(null);
      }, 750);
    }
  }

  /*
   * Formats a date as the user types.
   *
   * Example:
   * 26082026 -> 26-08-2026
   */
  function formatDateInput(
    value: string
  ) {
    const digits =
      value.replace(/\D/g, "");

    const limited =
      digits.slice(0, 8);

    let formatted = limited;

    if (limited.length > 4) {
      formatted =
        `${limited.slice(0, 2)}-${limited.slice(2, 4)}-${limited.slice(4)}`;
    } else if (limited.length > 2) {
      formatted =
        `${limited.slice(0, 2)}-${limited.slice(2)}`;
    }

    setManualDate(formatted);
  }

  /*
   * Formats time as the user types.
   *
   * Example:
   * 2030 -> 20:30
   */
  function formatTimeInput(
    value: string
  ) {
    const digits =
      value.replace(/\D/g, "");

    const limited =
      digits.slice(0, 4);

    let formatted = limited;

    if (limited.length > 2) {
      formatted =
        `${limited.slice(0, 2)}:${limited.slice(2)}`;
    }

    setManualTime(formatted);
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
     * Date: DD-MM-YYYY
     * Time: HH:mm
     */
    const dateMatch =
      manualDate.match(
        /^(\d{2})-(\d{2})-(\d{4})$/
      );

    const timeMatch =
      manualTime.match(
        /^(\d{2}):(\d{2})$/
      );

    if (!dateMatch) {
      Alert.alert(
        "Invalid date",
        "Please enter the date in DD-MM-YYYY format."
      );

      return null;
    }

    if (!timeMatch) {
      Alert.alert(
        "Invalid time",
        "Please enter the time in HH:mm format."
      );

      return null;
    }

    const day =
      Number(dateMatch[1]);

    const month =
      Number(dateMatch[2]);

    const year =
      Number(dateMatch[3]);

    const hours =
      Number(timeMatch[1]);

    const minutes =
      Number(timeMatch[2]);

    /*
     * Basic range validation.
     */
    if (
      month < 1 ||
      month > 12 ||
      day < 1 ||
      day > 31 ||
      hours < 0 ||
      hours > 23 ||
      minutes < 0 ||
      minutes > 59
    ) {
      Alert.alert(
        "Invalid date and time",
        "Please enter a valid date and time."
      );

      return null;
    }

    /*
     * Create the local date.
     *
     * This also lets us catch invalid
     * calendar dates such as 31-02-2026.
     */
    const dateTime =
      new Date(
        year,
        month - 1,
        day,
        hours,
        minutes,
        0,
        0
      );

    if (
      Number.isNaN(
        dateTime.getTime()
      ) ||
      dateTime.getFullYear() !== year ||
      dateTime.getMonth() !==
        month - 1 ||
      dateTime.getDate() !== day ||
      dateTime.getHours() !== hours ||
      dateTime.getMinutes() !== minutes
    ) {
      Alert.alert(
        "Invalid date and time",
        "Please enter a valid calendar date and time."
      );

      return null;
    }

    return dateTime.toISOString();
  }

  function validateResults(): boolean {
    const placements = results
      .filter(
        (result) =>
          result.placement.trim() !== ""
      )
      .map((result) =>
        Number(result.placement)
      );

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

    if (!currentGroup) {
      Alert.alert(
        "Error",
        "No current group is selected."
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

      const session =
        await createGameSession({
          group_id: currentGroup.id,
          game_id: gameId,
          played_at: playedAt,
          notes:
            notes.trim() || null,
        });

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

  function handleNotesFocus() {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({
        animated: true,
      });
    }, 100);
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : "height"
      }
      keyboardVerticalOffset={
        Platform.OS === "ios"
          ? insets.top
          : 0
      }
    >
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom:
              Math.max(
                insets.bottom,
                spacing.xl
              ) + 100,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={
          Platform.OS === "ios"
            ? "interactive"
            : "on-drag"
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>
              Record Game
            </Text>

            <Text style={styles.subtitle}>
              Enter the results of your game.
            </Text>
          </View>
        </View>

        {/* Game */}
        {game ? (
          <View style={styles.gameCard}>
            <View style={styles.gameIcon}>
              {game.image_url ? (
                <Image
                  source={{
                    uri: game.image_url,
                  }}
                  style={styles.gameImage}
                />
              ) : (
                <Ionicons
                  name="dice-outline"
                  size={28}
                  color={colors.primaryLight}
                />
              )}
            </View>

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
            <View style={styles.modeLeft}>
              <View
                style={[
                  styles.modeIcon,
                  useNow &&
                    styles.modeIconSelected,
                ]}
              >
                <Ionicons
                  name="time-outline"
                  size={20}
                  color={
                    useNow
                      ? colors.primaryLight
                      : colors.textSecondary
                  }
                />
              </View>

              <Text
                style={[
                  styles.modeButtonText,
                  useNow &&
                    styles.modeButtonTextSelected,
                ]}
              >
                Now
              </Text>
            </View>

            {useNow ? (
              <Ionicons
                name="checkmark-circle"
                size={22}
                color={colors.primaryLight}
              />
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
            <View style={styles.modeLeft}>
              <View
                style={[
                  styles.modeIcon,
                  !useNow &&
                    styles.modeIconSelected,
                ]}
              >
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={
                    !useNow
                      ? colors.primaryLight
                      : colors.textSecondary
                  }
                />
              </View>

              <Text
                style={[
                  styles.modeButtonText,
                  !useNow &&
                    styles.modeButtonTextSelected,
                ]}
              >
                Enter manually
              </Text>
            </View>

            {!useNow ? (
              <Ionicons
                name="checkmark-circle"
                size={22}
                color={colors.primaryLight}
              />
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
                formatDateInput
              }
              placeholder="DD-MM-YYYY"
              placeholderTextColor={
                colors.textMuted
              }
              style={styles.input}
              keyboardType="number-pad"
              maxLength={10}
              editable={!saving}
            />

            <Text style={styles.label}>
              Time
            </Text>

            <TextInput
              value={manualTime}
              onChangeText={
                formatTimeInput
              }
              placeholder="HH:mm"
              placeholderTextColor={
                colors.textMuted
              }
              style={styles.input}
              keyboardType="number-pad"
              maxLength={5}
              editable={!saving}
            />

            <View
              style={styles.helperRow}
            >
              <Ionicons
                name="information-circle-outline"
                size={16}
                color={colors.textMuted}
              />

              <Text
                style={styles.helperText}
              >
                Enter numbers only. Example:
                26082026 and 2030
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.nowCard}>
            <View style={styles.nowIcon}>
              <Ionicons
                name="time-outline"
                size={26}
                color={colors.primaryLight}
              />
            </View>

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

          const isAnimating =
            animatedWinnerId ===
            player.id;

          return (
            <WinnerPlayerCard
              key={player.id}
              player={player}
              result={result}
              isAnimating={isAnimating}
              saving={saving}
              onToggleWinner={() =>
                toggleWinner(
                  player.id
                )
              }
              onUpdateScore={(value) =>
                updateResult(
                  player.id,
                  "score",
                  value
                )
              }
              onUpdatePlacement={(value) =>
                updateResult(
                  player.id,
                  "placement",
                  value
                )
              }
            />
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
          onFocus={handleNotesFocus}
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
            <>
              <Text
                style={styles.saveButtonText}
              >
                Save Game Session
              </Text>

              <Ionicons
                name="checkmark-circle-outline"
                size={21}
                color="#FFFFFF"
              />
            </>
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
    </KeyboardAvoidingView>
  );
}

function WinnerPlayerCard({
  player,
  result,
  isAnimating,
  saving,
  onToggleWinner,
  onUpdateScore,
  onUpdatePlacement,
}: {
  player: Player;
  result: PlayerResult;
  isAnimating: boolean;
  saving: boolean;
  onToggleWinner: () => void;
  onUpdateScore: (value: string) => void;
  onUpdatePlacement: (value: string) => void;
}) {
  const shake = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (!isAnimating) {
      return;
    }

    shake.value = withSequence(
      withTiming(-4, { duration: 50 }),
      withTiming(4, { duration: 50 }),
      withTiming(-3, { duration: 50 }),
      withTiming(3, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );

    scale.value = withSequence(
      withTiming(1.025, { duration: 100 }),
      withTiming(1, { duration: 250 })
    );
  }, [isAnimating]);

  const animatedStyle =
    useAnimatedStyle(() => ({
      transform: [
        {
          translateX: shake.value,
        },
        {
          scale: scale.value,
        },
      ],
    }));

  return (
    <Animated.View
      style={[
        styles.playerCard,
        result.isWinner &&
          styles.playerCardWinner,
        isAnimating &&
          styles.playerCardWinnerHighlight,
        animatedStyle,
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
          onPress={
            onToggleWinner
          }
          disabled={saving}
          activeOpacity={0.8}
        >
          <Ionicons
            name={
              result.isWinner
                ? "trophy"
                : "trophy-outline"
            }
            size={15}
            color={
              result.isWinner
                ? "#FFFFFF"
                : colors.textSecondary
            }
          />

          <Text
            style={[
              styles.winnerButtonText,
              result.isWinner &&
                styles.winnerButtonTextSelected,
            ]}
          >
            {result.isWinner
              ? "Winner"
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
            value={result.score}
            onChangeText={
              onUpdateScore
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
            value={result.placement}
            onChangeText={
              onUpdatePlacement
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
    </Animated.View>
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

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
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

  gameIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor:
      colors.surfaceHighlight,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  gameImage: {
    width: "100%",
    height: "100%",
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

  modeLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  modeIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor:
      colors.surfaceHighlight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },

  modeIconSelected: {
    backgroundColor:
      "rgba(139, 92, 246, 0.15)",
  },

  modeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },

  modeButtonTextSelected: {
    color: colors.primaryLight,
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

  helperRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.sm,
    gap: 6,
  },

  helperText: {
    flex: 1,
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
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor:
      "rgba(139, 92, 246, 0.15)",
    alignItems: "center",
    justifyContent: "center",
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

  playerCardWinnerHighlight: {
    borderColor: "#F5C542",
    shadowColor: "#F5C542",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 6,
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
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
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
    minHeight: 54,
    marginTop: spacing.xl,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.sm,
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