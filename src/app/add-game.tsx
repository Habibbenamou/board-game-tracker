import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { router } from "expo-router";
import { useRef, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  colors,
  radius,
  spacing,
} from "../constants/theme";

import {
  createGame,
} from "../services/gameService";

export default function AddGameScreen() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] =
    useState("");

  const [minPlayers, setMinPlayers] =
    useState("");

  const [maxPlayers, setMaxPlayers] =
    useState("");

  const [minPlaytime, setMinPlaytime] =
    useState("");

  const [maxPlaytime, setMaxPlaytime] =
    useState("");

  const [rulesUrl, setRulesUrl] =
    useState("");

  const [officialUrl, setOfficialUrl] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const insets = useSafeAreaInsets();

  // Reference to the ScrollView
  const scrollViewRef =
    useRef<ScrollView>(null);

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert(
        "Missing information",
        "Please enter the game name."
      );

      return;
    }

    try {
      setSaving(true);

      await createGame({
        name: name.trim(),

        category:
          category.trim() || null,

        description:
          description.trim() || null,

        min_players:
          minPlayers
            ? Number(minPlayers)
            : null,

        max_players:
          maxPlayers
            ? Number(maxPlayers)
            : null,

        min_playtime_minutes:
          minPlaytime
            ? Number(minPlaytime)
            : null,

        max_playtime_minutes:
          maxPlaytime
            ? Number(maxPlaytime)
            : null,

        rules_url:
          rulesUrl.trim() || null,

        official_url:
          officialUrl.trim() || null,

        image_url: null,
      });

      Alert.alert(
        "Game added!",
        `${name} has been added to your collection.`,
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

  /**
   * Scroll the focused input into view.
   *
   * Android's KeyboardAvoidingView does not
   * always automatically scroll a ScrollView
   * when a lower input receives focus.
   */
  function handleInputFocus(
    input: TextInput
  ) {
    setTimeout(() => {
      input.measureLayout(
        scrollViewRef.current as any,
        (
          _x,
          y,
          _width,
          height
        ) => {
          scrollViewRef.current?.scrollTo({
            y: Math.max(
              0,
              y - 100
            ),
            animated: true,
          });
        },
        () => {
          // Ignore measurement errors.
        }
      );
    }, 100);
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
          ? 0
          : insets.top
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
              ) + 40,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>
          Add Game
        </Text>

        <Text style={styles.subtitle}>
          Add a board game to your collection.
        </Text>

        <View style={styles.form}>
          <Text style={styles.label}>
            Game name *
          </Text>

          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Catan"
            placeholderTextColor={
              colors.textMuted
            }
            style={styles.input}
            returnKeyType="next"
            onFocus={(event) =>
              handleInputFocus(
                event.currentTarget
              )
            }
          />

          <Text style={styles.label}>
            Category
          </Text>

          <TextInput
            value={category}
            onChangeText={setCategory}
            placeholder="e.g. Strategy"
            placeholderTextColor={
              colors.textMuted
            }
            style={styles.input}
            returnKeyType="next"
            onFocus={(event) =>
              handleInputFocus(
                event.currentTarget
              )
            }
          />

          <Text style={styles.label}>
            Description
          </Text>

          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Brief synopsis of the game..."
            placeholderTextColor={
              colors.textMuted
            }
            style={[
              styles.input,
              styles.textArea,
            ]}
            multiline
            textAlignVertical="top"
            onFocus={(event) =>
              handleInputFocus(
                event.currentTarget
              )
            }
          />

          <Text style={styles.sectionTitle}>
            Players
          </Text>

          <View style={styles.row}>
            <View style={styles.half}>
              <Text style={styles.label}>
                Minimum
              </Text>

              <TextInput
                value={minPlayers}
                onChangeText={setMinPlayers}
                placeholder="2"
                placeholderTextColor={
                  colors.textMuted
                }
                keyboardType="number-pad"
                style={styles.input}
                returnKeyType="next"
                onFocus={(event) =>
                  handleInputFocus(
                    event.currentTarget
                  )
                }
              />
            </View>

            <View style={styles.half}>
              <Text style={styles.label}>
                Maximum
              </Text>

              <TextInput
                value={maxPlayers}
                onChangeText={setMaxPlayers}
                placeholder="4"
                placeholderTextColor={
                  colors.textMuted
                }
                keyboardType="number-pad"
                style={styles.input}
                returnKeyType="next"
                onFocus={(event) =>
                  handleInputFocus(
                    event.currentTarget
                  )
                }
              />
            </View>
          </View>

          <Text style={styles.sectionTitle}>
            Play time
          </Text>

          <View style={styles.row}>
            <View style={styles.half}>
              <Text style={styles.label}>
                Minimum (minutes)
              </Text>

              <TextInput
                value={minPlaytime}
                onChangeText={
                  setMinPlaytime
                }
                placeholder="30"
                placeholderTextColor={
                  colors.textMuted
                }
                keyboardType="number-pad"
                style={styles.input}
                returnKeyType="next"
                onFocus={(event) =>
                  handleInputFocus(
                    event.currentTarget
                  )
                }
              />
            </View>

            <View style={styles.half}>
              <Text style={styles.label}>
                Maximum (minutes)
              </Text>

              <TextInput
                value={maxPlaytime}
                onChangeText={
                  setMaxPlaytime
                }
                placeholder="60"
                placeholderTextColor={
                  colors.textMuted
                }
                keyboardType="number-pad"
                style={styles.input}
                returnKeyType="next"
                onFocus={(event) =>
                  handleInputFocus(
                    event.currentTarget
                  )
                }
              />
            </View>
          </View>

          <Text style={styles.label}>
            Game rules / guide URL
          </Text>

          <TextInput
            value={rulesUrl}
            onChangeText={setRulesUrl}
            placeholder="https://..."
            placeholderTextColor={
              colors.textMuted
            }
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            style={styles.input}
            onFocus={(event) =>
              handleInputFocus(
                event.currentTarget
              )
            }
          />

          <Text style={styles.label}>
            Official game website
          </Text>

          <TextInput
            value={officialUrl}
            onChangeText={setOfficialUrl}
            placeholder="https://..."
            placeholderTextColor={
              colors.textMuted
            }
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            style={styles.input}
            onFocus={(event) =>
              handleInputFocus(
                event.currentTarget
              )
            }
          />

          <TouchableOpacity
            style={[
              styles.button,
              saving &&
                styles.buttonDisabled,
            ]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>
              {saving
                ? "Adding..."
                : "Add Game"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    paddingBottom: 100,
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: colors.text,
  },

  subtitle: {
    marginTop: 6,
    color: colors.textSecondary,
  },

  form: {
    marginTop: spacing.xl,
  },

  label: {
    marginBottom: 6,
    marginTop: spacing.md,
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },

  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontSize: 15,
  },

  textArea: {
    height: 120,
    paddingTop: spacing.md,
  },

  sectionTitle: {
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },

  row: {
    flexDirection: "row",
    gap: spacing.md,
  },

  half: {
    flex: 1,
  },

  button: {
    marginTop: spacing.xl,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});