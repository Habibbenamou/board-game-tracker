import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { router } from "expo-router";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useFocusEffect } from "expo-router";

import { Ionicons } from "@expo/vector-icons";

import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import {
  getGamesByGroupId,
  type Game,
} from "../../services/gameService";

import {
  getPlayersByGroupId,
  type Player,
} from "../../services/playerService";

import {
  colors,
  radius,
  spacing,
} from "../../constants/theme";

import { useGroup } from "../../context/GroupContext";

/*
 * --------------------------------------------------
 * Animated Game Card
 * --------------------------------------------------
 */

function AnimatedGameCard({
  game,
  onPress,
}: {
  game: Game;
  onPress: () => void;
}) {
  const opacity =
    useSharedValue(0);

  const translateY =
    useSharedValue(14);

  const scale =
    useSharedValue(1);

  useEffect(() => {
    opacity.value = withTiming(1, {
      duration: 350,
      easing: Easing.out(
        Easing.cubic
      ),
    });

    translateY.value = withSpring(
      0,
      {
        damping: 18,
        stiffness: 150,
      }
    );
  }, [
    opacity,
    translateY,
  ]);

  const animatedStyle =
    useAnimatedStyle(() => ({
      opacity: opacity.value,
      transform: [
        {
          translateY:
            translateY.value,
        },
        {
          scale: scale.value,
        },
      ],
    }));

  function handlePressIn() {
    scale.value = withSpring(
      0.98,
      {
        damping: 18,
        stiffness: 250,
      }
    );
  }

  function handlePressOut() {
    scale.value = withSpring(
      1,
      {
        damping: 16,
        stiffness: 220,
      }
    );
  }

  return (
    <Animated.View
      style={[
        styles.animatedCard,
        animatedStyle,
      ]}
    >
      <Pressable
        style={styles.gameCard}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {game.image_url ? (
          <Image
            source={{
              uri: game.image_url,
            }}
            style={styles.gameImage}
          />
        ) : (
          <View
            style={
              styles.gamePlaceholder
            }
          >
            <Ionicons
              name="dice-outline"
              size={30}
              color={
                colors.textMuted
              }
            />
          </View>
        )}

        <View style={styles.gameInfo}>
          <Text
            style={styles.gameName}
            numberOfLines={1}
          >
            {game.name}
          </Text>

          {game.category ? (
            <Text
              style={styles.gameCategory}
            >
              {game.category}
            </Text>
          ) : (
            <Text
              style={
                styles.gameCategoryMuted
              }
            >
              Board game
            </Text>
          )}

          {(game.min_players != null ||
            game.max_players != null) && (
            <View
              style={styles.gamePlayersInfo}
            >
              <Ionicons
                name="people-outline"
                size={12}
                color={
                  colors.textMuted
                }
              />

              <Text
                style={
                  styles.gamePlayersText
                }
              >
                {formatPlayerRange(
                  game.min_players,
                  game.max_players
                )}
              </Text>
            </View>
          )}
        </View>

        <View
          style={
            styles.gameChevronContainer
          }
        >
          <Ionicons
            name="chevron-forward"
            size={17}
            color={
              colors.textSecondary
            }
          />
        </View>
      </Pressable>
    </Animated.View>
  );
}

/*
 * --------------------------------------------------
 * Player Card
 * --------------------------------------------------
 */

function AnimatedPlayerCard({
  player,
  selected,
  disabled,
  onPress,
}: {
  player: Player;
  selected: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  const scale =
    useSharedValue(1);

  const checkScale =
    useSharedValue(
      selected ? 1 : 0.7
    );

  const checkOpacity =
    useSharedValue(
      selected ? 1 : 0
    );

  useEffect(() => {
    checkScale.value =
      withSpring(
        selected ? 1 : 0.7,
        {
          damping: 14,
          stiffness: 220,
        }
      );

    checkOpacity.value =
      withTiming(
        selected ? 1 : 0,
        {
          duration: 140,
        }
      );
  }, [
    selected,
    checkScale,
    checkOpacity,
  ]);

  const animatedStyle =
    useAnimatedStyle(() => ({
      transform: [
        {
          scale: scale.value,
        },
      ],
    }));

  const checkAnimatedStyle =
    useAnimatedStyle(() => ({
      opacity:
        checkOpacity.value,
      transform: [
        {
          scale:
            checkScale.value,
        },
      ],
    }));

  function handlePressIn() {
    if (disabled) {
      return;
    }

    scale.value = withSpring(
      0.985,
      {
        damping: 18,
        stiffness: 250,
      }
    );
  }

  function handlePressOut() {
    if (disabled) {
      return;
    }

    scale.value = withSpring(
      1,
      {
        damping: 16,
        stiffness: 220,
      }
    );
  }

  return (
    <Animated.View
      style={[
        styles.playerCardWrapper,
        animatedStyle,
      ]}
    >
      <Pressable
        style={[
          styles.playerCard,
          selected &&
            styles.playerCardSelected,
          disabled &&
            styles.playerCardDisabled,
        ]}
        disabled={disabled}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {player.avatar_url ? (
          <Image
            source={{
              uri: player.avatar_url,
            }}
            style={
              styles.playerAvatar
            }
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
              {player.name
                .charAt(0)
                .toUpperCase()}
            </Text>
          </View>
        )}

        <View
          style={
            styles.playerInfo
          }
        >
          <Text
            style={[
              styles.playerName,
              disabled &&
                styles.playerNameDisabled,
            ]}
            numberOfLines={1}
          >
            {player.name}
          </Text>

          <Text
            style={[
              styles.playerStatus,
              disabled &&
                styles.playerStatusDisabled,
            ]}
          >
            {selected
              ? "Playing"
              : disabled
              ? "Maximum reached"
              : "Tap to select"}
          </Text>
        </View>

        <Animated.View
          style={[
            styles.checkbox,
            selected &&
              styles.checkboxSelected,
            !selected &&
              disabled &&
              styles.checkboxDisabled,
            checkAnimatedStyle,
          ]}
        >
          <Ionicons
            name="checkmark"
            size={16}
            color={
              colors.white
            }
          />
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

/*
 * --------------------------------------------------
 * Helpers
 * --------------------------------------------------
 */

function formatPlayerRange(
  minPlayers: number | null | undefined,
  maxPlayers: number | null | undefined
): string {
  if (
    minPlayers != null &&
    maxPlayers != null
  ) {
    if (minPlayers === maxPlayers) {
      return `${minPlayers} players`;
    }

    return `${minPlayers}–${maxPlayers} players`;
  }

  if (minPlayers != null) {
    return `${minPlayers}+ players`;
  }

  if (maxPlayers != null) {
    return `Up to ${maxPlayers} players`;
  }

  return "";
}

/*
 * --------------------------------------------------
 * Play Screen
 * --------------------------------------------------
 */

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

  const {
    currentGroup,
  } = useGroup();

  useFocusEffect(
    useCallback(() => {
      loadGamesAndPlayers();
    }, [currentGroup?.id])
  );

  async function loadGamesAndPlayers() {
    try {
      setLoading(true);

      if (!currentGroup) {
        setGames([]);
        setPlayers([]);
        setSelectedGame(null);
        setSelectedPlayers([]);
        return;
      }

      const [
        gamesData,
        playersData,
      ] = await Promise.all([
        getGamesByGroupId(
          currentGroup.id
        ),

        getPlayersByGroupId(
          currentGroup.id
        ),
      ]);

      setGames(gamesData);
      setPlayers(playersData);

      setSelectedGame(null);
      setSelectedPlayers([]);
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

  function handleSelectGame(
    game: Game
  ) {
    setSelectedGame(game);
    setSelectedPlayers([]);
  }

  function handleChangeGame() {
    setSelectedGame(null);
    setSelectedPlayers([]);
  }

  function togglePlayer(
    playerId: string
  ) {
    if (!selectedGame) {
      return;
    }

    setSelectedPlayers(
      (current) => {
        /*
         * Remove player if already selected.
         *
         * This must always be allowed, even when
         * the maximum number of players is reached.
         */
        if (
          current.includes(playerId)
        ) {
          return current.filter(
            (id) =>
              id !== playerId
          );
        }

        /*
         * Do not allow a new player to be added
         * once the game's maximum is reached.
         */
        const maxPlayers =
          selectedGame.max_players;

        if (
          maxPlayers != null &&
          current.length >=
            maxPlayers
        ) {
          return current;
        }

        return [
          ...current,
          playerId,
        ];
      }
    );
  }

  /*
   * --------------------------------------------------
   * Player limits
   * --------------------------------------------------
   */
  
  const minPlayers =
    selectedGame?.min_players ??
    1;

  const maxPlayers =
    selectedGame?.max_players ??
    players.length;

  const selectedCount =
    selectedPlayers.length;

  const minimumReached =
    selectedCount >=
    minPlayers;

  const maximumReached =
    selectedCount >=
    maxPlayers;

  const enoughPlayersAvailable =
    players.length >=
    minPlayers;

  const canContinue =
    minimumReached &&
    selectedCount <=
      maxPlayers &&
    enoughPlayersAvailable;

  const playerRangeText =
    formatPlayerRange(
      selectedGame?.min_players,
      selectedGame?.max_players
    );

  if (loading) {
    return (
      <View style={styles.center}>
        <View
          style={
            styles.loadingIcon
          }
        >
          <Ionicons
            name="play-circle-outline"
            size={32}
            color={
              colors.primaryLight
            }
          />
        </View>

        <ActivityIndicator
          size="small"
          color={
            colors.primaryLight
          }
          style={
            styles.loadingSpinner
          }
        />

        <Text
          style={
            styles.loadingText
          }
        >
          Loading your games...
        </Text>
      </View>
    );
  }

  if (games.length === 0) {
    return (
      <View style={styles.center}>
        <View
          style={
            styles.emptyIcon
          }
        >
          <Ionicons
            name="dice-outline"
            size={42}
            color={
              colors.primaryLight
            }
          />
        </View>

        <Text style={styles.title}>
          No Games Yet
        </Text>

        <Text
          style={styles.subtitle}
        >
          Add a game to your collection
          before recording a game session.
        </Text>
      </View>
    );
  }

  /*
   * --------------------------------------------------
   * Player selection
   * --------------------------------------------------
   */

  if (selectedGame) {
    return (
      <View style={styles.container}>
        <View style={styles.screenHeader}>
          <View
            style={
              styles.headerContent
            }
          >
            <Text
              style={
                styles.stepLabel
              }
            >
              STEP 2 OF 2
            </Text>

            <Text
              style={styles.title}
            >
              Who played?
            </Text>

            <Text
              style={
                styles.subtitle
              }
            >
              Select {playerRangeText || "the players"}{" "}
              who participated.
            </Text>
          </View>

          <View
            style={
              styles.stepIndicator
            }
          >
            <Ionicons
              name="people-outline"
              size={20}
              color={
                colors.primaryLight
              }
            />
          </View>
        </View>

        {/* Selected game */}

        <View
          style={
            styles.selectedGame
          }
        >
          {selectedGame.image_url ? (
            <Image
              source={{
                uri:
                  selectedGame.image_url,
              }}
              style={
                styles.selectedGameImage
              }
            />
          ) : (
            <View
              style={
                styles.selectedGamePlaceholder
              }
            >
              <Ionicons
                name="dice-outline"
                size={28}
                color={
                  colors.textMuted
                }
              />
            </View>
          )}

          <View
            style={
              styles.selectedGameInfo
            }
          >
            <Text
              style={
                styles.selectedGameLabel
              }
            >
              GAME
            </Text>

            <Text
              style={
                styles.selectedGameName
              }
              numberOfLines={1}
            >
              {selectedGame.name}
            </Text>

            {selectedGame.category ? (
              <Text
                style={
                  styles.selectedGameCategory
                }
              >
                {selectedGame.category}
              </Text>
            ) : null}

            {playerRangeText ? (
              <View
                style={
                  styles.selectedGamePlayers
                }
              >
                <Ionicons
                  name="people-outline"
                  size={11}
                  color={
                    colors.textMuted
                  }
                />

                <Text
                  style={
                    styles.selectedGamePlayersText
                  }
                >
                  {playerRangeText}
                </Text>
              </View>
            ) : null}
          </View>

          <Pressable
            onPress={
              handleChangeGame
            }
            style={
              styles.changeButton
            }
          >
            <Ionicons
              name="swap-horizontal"
              size={16}
              color={
                colors.primaryLight
              }
            />

            <Text
              style={
                styles.changeText
              }
            >
              Change
            </Text>
          </Pressable>
        </View>

        {/* Player selection */}

        <View
          style={
            styles.playersHeader
          }
        >
          <View>
            <Text
              style={
                styles.sectionTitle
              }
            >
              Players
            </Text>

            <Text
              style={
                styles.selectionHint
              }
            >
              {maximumReached
                ? "Maximum players reached"
                : `Select ${minPlayers}${
                    minPlayers !==
                    maxPlayers
                      ? `–${maxPlayers}`
                      : ""
                  }`}
            </Text>
          </View>

          <View
            style={[
              styles.selectedBadge,
              maximumReached &&
                styles.selectedBadgeMax,
              minimumReached &&
                !maximumReached &&
                styles.selectedBadgeValid,
            ]}
          >
            <Ionicons
              name={
                minimumReached
                  ? "checkmark-circle"
                  : "people-outline"
              }
              size={13}
              color={
                minimumReached
                  ? colors.success
                  : colors.primaryLight
              }
            />

            <Text
              style={[
                styles.selectedBadgeText,
                minimumReached &&
                  styles.selectedBadgeTextValid,
              ]}
            >
              {selectedCount}
              {maxPlayers !==
                Infinity
                ? ` / ${maxPlayers}`
                : ""}
            </Text>
          </View>
        </View>

        {!enoughPlayersAvailable ? (
          <View
            style={
              styles.warningBanner
            }
          >
            <View
              style={
                styles.warningIcon
              }
            >
              <Ionicons
                name="alert-circle-outline"
                size={18}
                color={
                  colors.warning
                }
              />
            </View>

            <View
              style={
                styles.warningContent
              }
            >
              <Text
                style={
                  styles.warningTitle
                }
              >
                Not enough players
              </Text>

              <Text
                style={
                  styles.warningText
                }
              >
                {selectedGame.name} requires at
                least {minPlayers} players, but
                this group only has {players.length}.
              </Text>
            </View>
          </View>
        ) : null}

        {players.length === 0 ? (
          <View
            style={
              styles.emptyPlayers
            }
          >
            <View
              style={
                styles.emptyPlayersIcon
              }
            >
              <Ionicons
                name="people-outline"
                size={28}
                color={
                  colors.textMuted
                }
              />
            </View>

            <Text
              style={
                styles.emptyPlayersTitle
              }
            >
              No Players Yet
            </Text>

            <Text
              style={
                styles.emptyPlayersText
              }
            >
              Add players before recording a
              game session.
            </Text>
          </View>
        ) : (
          <FlatList
            data={players}
            keyExtractor={(item) =>
              item.id
            }
            showsVerticalScrollIndicator={
              false
            }
            contentContainerStyle={
              styles.playerList
            }
            renderItem={({ item }) => {
              const selected =
                selectedPlayers.includes(
                  item.id
                );

              /*
               * A selected player is never disabled.
               * This allows the user to remove a player
               * after reaching the maximum.
               */
              const disabled =
                !selected &&
                maximumReached;

              return (
                <AnimatedPlayerCard
                  player={item}
                  selected={selected}
                  disabled={disabled}
                  onPress={() =>
                    togglePlayer(
                      item.id
                    )
                  }
                />
              );
            }}
          />
        )}

        {/* Continue */}

        {players.length > 0 ? (
          <View
            style={
              styles.bottomSection
            }
          >
            <View
              style={
                styles.selectedSummary
              }
            >
              <Ionicons
                name={
                  minimumReached
                    ? "checkmark-circle"
                    : "people-outline"
                }
                size={15}
                color={
                  minimumReached
                    ? colors.success
                    : colors.textSecondary
                }
              />

              <Text
                style={[
                  styles.selectedCount,
                  minimumReached &&
                    styles.selectedCountValid,
                ]}
              >
                {selectedCount}{" "}
                {selectedCount === 1
                  ? "player"
                  : "players"}{" "}
                selected
              </Text>
            </View>

            <Pressable
              style={[
                styles.continueButton,
                !canContinue &&
                  styles.continueButtonDisabled,
              ]}
              disabled={!canContinue}
              onPress={() => {
                if (
                  !selectedGame
                ) {
                  return;
                }

                router.push({
                  pathname:
                    "/record-session",
                  params: {
                    gameId:
                      selectedGame.id,
                    playerIds:
                      JSON.stringify(
                        selectedPlayers
                      ),
                  },
                });
              }}
            >
              <Text
                style={
                  styles.continueButtonText
                }
              >
                {minimumReached
                  ? "Continue"
                  : `Select at least ${minPlayers}`}
              </Text>

              <Ionicons
                name="arrow-forward"
                size={19}
                color={
                  colors.white
                }
              />
            </Pressable>
          </View>
        ) : null}
      </View>
    );
  }

  /*
   * --------------------------------------------------
   * Game selection
   * --------------------------------------------------
   */

  return (
    <View style={styles.container}>
      <View style={styles.screenHeader}>
        <View
          style={{
            flex: 1,
          }}
        >
          <Text
            style={
              styles.stepLabel
            }
          >
            STEP 1 OF 2
          </Text>

          <Text
            style={styles.title}
          >
            What are you playing?
          </Text>

          <Text
            style={
              styles.subtitle
            }
          >
            Choose the game you played.
          </Text>
        </View>

        <View
          style={
            styles.stepIndicator
          }
        >
          <Ionicons
            name="dice-outline"
            size={20}
            color={
              colors.primaryLight
            }
          />
        </View>
      </View>

      <FlatList
        data={games}
        keyExtractor={(item) =>
          item.id
        }
        contentContainerStyle={
          styles.listContent
        }
        showsVerticalScrollIndicator={
          false
        }
        renderItem={({ item }) => (
          <AnimatedGameCard
            game={item}
            onPress={() =>
              handleSelectGame(
                item
              )
            }
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      colors.background,
    paddingHorizontal:
      spacing.lg,
    paddingTop: 54,
  },

  center: {
    flex: 1,
    backgroundColor:
      colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },

  loadingIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor:
      colors.surface,
    borderWidth: 1,
    borderColor:
      colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingSpinner: {
    marginTop: spacing.md,
  },

  loadingText: {
    marginTop: spacing.sm,
    color:
      colors.textSecondary,
    fontSize: 13,
  },

  emptyIcon: {
    width: 82,
    height: 82,
    borderRadius: 26,
    backgroundColor:
      colors.surface,
    borderWidth: 1,
    borderColor:
      colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },

  screenHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  headerContent: {
    flex: 1,
    paddingRight: spacing.md,
  },

  stepLabel: {
    marginBottom: 5,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    color:
      colors.primaryLight,
  },

  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
    color: colors.text,
  },

  subtitle: {
    marginTop: spacing.sm,
    fontSize: 14,
    lineHeight: 20,
    color:
      colors.textSecondary,
  },

  stepIndicator: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor:
      "rgba(139, 92, 246, 0.10)",
    borderWidth: 1,
    borderColor:
      "rgba(139, 92, 246, 0.18)",
    alignItems: "center",
    justifyContent: "center",
  },

  /*
   * Game list
   */

  listContent: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },

  animatedCard: {
    marginBottom: spacing.md,
  },

  gameCard: {
    minHeight: 88,
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor:
      colors.surface,
    borderWidth: 1,
    borderColor:
      colors.border,
  },

  gameImage: {
    width: 70,
    height: 70,
    borderRadius: radius.md,
  },

  gamePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: radius.md,
    backgroundColor:
      colors.surfaceHighlight,
    alignItems: "center",
    justifyContent: "center",
  },

  gameInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },

  gameName: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
  },

  gameCategory: {
    marginTop: 4,
    fontSize: 12,
    color:
      colors.textSecondary,
  },

  gameCategoryMuted: {
    marginTop: 4,
    fontSize: 12,
    color:
      colors.textMuted,
  },

  gamePlayersInfo: {
    marginTop: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  gamePlayersText: {
    fontSize: 10,
    fontWeight: "600",
    color:
      colors.textMuted,
  },

  gameChevronContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor:
      colors.surfaceHighlight,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: spacing.sm,
  },

  /*
   * Selected game
   */

  selectedGame: {
    marginTop: spacing.xl,
    minHeight: 84,
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.sm,
    borderRadius: radius.xl,
    backgroundColor:
      colors.surface,
    borderWidth: 1,
    borderColor:
      colors.border,
  },

  selectedGameImage: {
    width: 66,
    height: 66,
    borderRadius: radius.md,
  },

  selectedGamePlaceholder: {
    width: 66,
    height: 66,
    borderRadius: radius.md,
    backgroundColor:
      colors.surfaceHighlight,
    alignItems: "center",
    justifyContent: "center",
  },

  selectedGameInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },

  selectedGameLabel: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.8,
    color:
      colors.textMuted,
  },

  selectedGameName: {
    marginTop: 3,
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
  },

  selectedGameCategory: {
    marginTop: 2,
    fontSize: 11,
    color:
      colors.textSecondary,
  },

  selectedGamePlayers: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  selectedGamePlayersText: {
    fontSize: 10,
    fontWeight: "600",
    color:
      colors.textMuted,
  },

  changeButton: {
    minHeight: 34,
    paddingHorizontal: spacing.sm,
    borderRadius: 10,
    backgroundColor:
      "rgba(139, 92, 246, 0.08)",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  changeText: {
    fontSize: 11,
    fontWeight: "700",
    color:
      colors.primaryLight,
  },

  /*
   * Players
   */

  playersHeader: {
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text,
  },

  selectionHint: {
    marginTop: 2,
    fontSize: 11,
    color:
      colors.textMuted,
  },

  selectedBadge: {
    minWidth: 44,
    height: 30,
    paddingHorizontal: 9,
    borderRadius: 15,
    backgroundColor:
      "rgba(139, 92, 246, 0.10)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },

  selectedBadgeValid: {
    backgroundColor:
      "rgba(34, 197, 94, 0.10)",
  },

  selectedBadgeMax: {
    backgroundColor:
      "rgba(245, 158, 11, 0.10)",
  },

  selectedBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    color:
      colors.primaryLight,
  },

  selectedBadgeTextValid: {
    color: colors.success,
  },

  warningBanner: {
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor:
      "rgba(245, 158, 11, 0.08)",
    borderWidth: 1,
    borderColor:
      "rgba(245, 158, 11, 0.20)",
    flexDirection: "row",
    alignItems: "center",
  },

  warningIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor:
      "rgba(245, 158, 11, 0.10)",
    alignItems: "center",
    justifyContent: "center",
  },

  warningContent: {
    flex: 1,
    marginLeft: spacing.sm,
  },

  warningTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.warning,
  },

  warningText: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 16,
    color:
      colors.textSecondary,
  },

  playerList: {
    paddingBottom: spacing.md,
  },

  playerCardWrapper: {
    marginBottom: spacing.sm,
  },

  playerCard: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor:
      colors.surface,
    borderWidth: 1,
    borderColor:
      colors.border,
  },

  playerCardSelected: {
    borderColor:
      colors.primary,
    backgroundColor:
      "rgba(139, 92, 246, 0.06)",
  },

  playerCardDisabled: {
    opacity: 0.45,
  },

  playerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 16,
  },

  playerAvatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor:
      colors.surfaceHighlight,
    alignItems: "center",
    justifyContent: "center",
  },

  playerAvatarText: {
    fontSize: 19,
    fontWeight: "800",
    color:
      colors.primaryLight,
  },

  playerInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },

  playerName: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },

  playerNameDisabled: {
    color: colors.textSecondary,
  },

  playerStatus: {
    marginTop: 3,
    fontSize: 11,
    color:
      colors.textMuted,
  },

  playerStatusDisabled: {
    color: colors.warning,
  },

  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor:
      colors.borderLight,
    alignItems: "center",
    justifyContent: "center",
  },

  checkboxSelected: {
    backgroundColor:
      colors.primary,
    borderColor:
      colors.primary,
  },

  checkboxDisabled: {
    borderColor:
      colors.border,
    backgroundColor:
      colors.surfaceHighlight,
  },

  /*
   * Empty players
   */

  emptyPlayers: {
    alignItems: "center",
    padding: spacing.xl,
    marginTop: spacing.md,
    borderRadius: radius.xl,
    backgroundColor:
      colors.surface,
    borderWidth: 1,
    borderColor:
      colors.border,
  },

  emptyPlayersIcon: {
    width: 54,
    height: 54,
    borderRadius: 17,
    backgroundColor:
      colors.surfaceHighlight,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyPlayersTitle: {
    marginTop: spacing.md,
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
  },

  emptyPlayersText: {
    marginTop: spacing.sm,
    textAlign: "center",
    color:
      colors.textSecondary,
    lineHeight: 20,
  },

  /*
   * Bottom action
   */

  bottomSection: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    backgroundColor:
      colors.background,
  },

  selectedSummary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    marginBottom: spacing.sm,
  },

  selectedCount: {
    textAlign: "center",
    color:
      colors.textSecondary,
    fontSize: 12,
  },

  selectedCountValid: {
    color: colors.success,
    fontWeight: "600",
  },

  continueButton: {
    minHeight: 54,
    borderRadius: radius.lg,
    backgroundColor:
      colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },

  continueButtonDisabled: {
    opacity: 0.4,
  },

  continueButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "800",
  },
});