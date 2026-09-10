import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  router,
  useFocusEffect,
} from "expo-router";
import { useCallback, useState } from "react";

import {
  colors,
  radius,
  spacing,
} from "../constants/theme";

import {
  getMyPlayer,
  getPlayersByGroupId,
  type Player,
} from "../services/playerService";

import {
  getMyGroups,
  type Group,
} from "../services/groupService";

export default function PlayersScreen() {
  const [players, setPlayers] =
    useState<Player[]>([]);

  const [currentGroup, setCurrentGroup] =
    useState<Group | null>(null);

  const [myPlayer, setMyPlayer] =
    useState<Player | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(false);

  useFocusEffect(
    useCallback(() => {
      loadPlayers();
    }, [])
  );

  async function loadPlayers() {
    try {
      setLoading(true);
      setError(false);

      const currentPlayer =
        await getMyPlayer();

      setMyPlayer(currentPlayer);

      const groups =
        await getMyGroups();

      if (
        !groups ||
        groups.length === 0
      ) {
        setCurrentGroup(null);
        setPlayers([]);
        return;
      }

      const group =
        groups[0];

      setCurrentGroup(group);

      const groupPlayers =
        await getPlayersByGroupId(
          group.id
        );

      setPlayers(groupPlayers);
    } catch (error) {
      console.error(
        "Error loading players:",
        error
      );

      setError(true);
    } finally {
      setLoading(false);
    }
  }

  function handlePlayerPress(
    player: Player
  ) {
    if (
      myPlayer &&
      player.id === myPlayer.id
    ) {
      router.push(
        "/edit-profile"
      );

      return;
    }

    router.push({
      pathname: "/player-profile",
      params: {
        id: player.id,
      },
    });
  }

  function handleAddGuestPlayer() {
    router.push("/add-player");
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />

        <Text style={styles.loadingText}>
          Loading players...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>
          Unable to load players
        </Text>

        <Text style={styles.errorText}>
          Please try again.
        </Text>

        <TouchableOpacity
          style={styles.retryButton}
          onPress={loadPlayers}
        >
          <Text
            style={styles.retryButtonText}
          >
            Retry
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!currentGroup) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyEmoji}>
          👥
        </Text>

        <Text style={styles.emptyTitle}>
          No group yet
        </Text>

        <Text style={styles.emptyText}>
          Join or create a group to see
          its players.
        </Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() =>
            router.push(
              "/group-setup"
            )
          }
        >
          <Text
            style={styles.primaryButtonText}
          >
            Join or Create Group
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>
            Players
          </Text>

          <Text style={styles.subtitle}>
            {currentGroup.name}
          </Text>
        </View>

        {/* <TouchableOpacity
          style={styles.addButton}
          onPress={
            handleAddGuestPlayer
          }
          activeOpacity={0.8}
        >
          <Text style={styles.addButtonText}>
            +
          </Text>
        </TouchableOpacity> */}
      </View>

      {players.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>
            👥
          </Text>

          <Text style={styles.emptyTitle}>
            No players yet
          </Text>

          <Text style={styles.emptyText}>
            Add a guest player to this
            group to start tracking
            their games.
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={
              handleAddGuestPlayer
            }
          >
            <Text
              style={styles.primaryButtonText}
            >
              + Add Guest Player
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={players}
          keyExtractor={(item) =>
            item.id
          }
          contentContainerStyle={
            styles.list
          }
          showsVerticalScrollIndicator={
            false
          }
          ListFooterComponent={
            <TouchableOpacity
              style={styles.guestButton}
              onPress={
                handleAddGuestPlayer
              }
              activeOpacity={0.8}
            >
              <View
                style={
                  styles.guestButtonIcon
                }
              >
                <Text
                  style={
                    styles.guestButtonIconText
                  }
                >
                  +
                </Text>
              </View>

              <View
                style={
                  styles.guestButtonInfo
                }
              >
                <Text
                  style={
                    styles.guestButtonTitle
                  }
                >
                  Add Guest Player
                </Text>

                <Text
                  style={
                    styles.guestButtonSubtitle
                  }
                >
                  Add someone without an account
                </Text>
              </View>

              <Text style={styles.chevron}>
                ›
              </Text>
            </TouchableOpacity>
          }
          renderItem={({
            item,
          }) => {
            const isMe =
              myPlayer?.id === item.id;

            const isGuest =
              !item.user_id;

            return (
              <TouchableOpacity
                style={styles.playerCard}
                onPress={() =>
                  handlePlayerPress(
                    item
                  )
                }
                activeOpacity={0.8}
              >
                <View
                  style={styles.avatar}
                >
                  {item.avatar_url ? (
                    <Image
                      source={{
                        uri: item.avatar_url,
                      }}
                      style={
                        styles.avatarImage
                      }
                    />
                  ) : (
                    <Text
                      style={
                        styles.avatarText
                      }
                    >
                      {item.name
                        .charAt(0)
                        .toUpperCase()}
                    </Text>
                  )}
                </View>

                <View
                  style={
                    styles.playerInfo
                  }
                >
                  <Text
                    style={
                      styles.playerName
                    }
                  >
                    {item.name}
                  </Text>

                  {isMe && (
                    <Text
                      style={
                        styles.youLabel
                      }
                    >
                      You
                    </Text>
                  )}

                  {!isMe && isGuest && (
                    <Text
                      style={
                        styles.guestLabel
                      }
                    >
                      Guest
                    </Text>
                  )}
                </View>

                <Text
                  style={styles.chevron}
                >
                  ›
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      colors.background,
    padding: spacing.lg,
    paddingTop: 60,
  },

  center: {
    flex: 1,
    backgroundColor:
      colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },

  header: {
    marginBottom: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: colors.text,
  },

  subtitle: {
    marginTop: 6,
    color: colors.textSecondary,
    fontSize: 14,
  },

  addButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor:
      colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: spacing.md,
  },

  addButtonText: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "400",
    lineHeight: 32,
  },

  list: {
    paddingBottom: spacing.xl,
  },

  guestButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor:
      colors.surface,
    borderWidth: 1,
    borderColor:
      colors.primary,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },

  guestButtonIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor:
      colors.background,
    alignItems: "center",
    justifyContent: "center",
  },

  guestButtonIconText: {
    fontSize: 28,
    fontWeight: "600",
    color: colors.primary,
  },

  guestButtonInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },

  guestButtonTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },

  guestButtonSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: colors.textSecondary,
  },

  playerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor:
      colors.surface,
    borderWidth: 1,
    borderColor:
      colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
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
    fontSize: 20,
    fontWeight: "800",
    color: colors.primary,
  },

  playerInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },

  playerName: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },

  youLabel: {
    marginTop: 3,
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary,
  },

  guestLabel: {
    marginTop: 3,
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
  },

  chevron: {
    marginLeft: spacing.sm,
    fontSize: 28,
    color: colors.textMuted,
  },

  loadingText: {
    marginTop: spacing.md,
    color: colors.textSecondary,
  },

  errorTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
    textAlign: "center",
  },

  errorText: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    textAlign: "center",
  },

  retryButton: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor:
      colors.primary,
  },

  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: spacing.xl,
  },

  emptyEmoji: {
    fontSize: 50,
    marginBottom: spacing.md,
  },

  emptyTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
    textAlign: "center",
  },

  emptyText: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 21,
  },

  primaryButton: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xl,
    height: 50,
    borderRadius: radius.md,
    backgroundColor:
      colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
