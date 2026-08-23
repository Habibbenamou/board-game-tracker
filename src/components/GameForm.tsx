import {
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

import * as ImagePicker from "expo-image-picker";

import { useRef, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  colors,
  radius,
  spacing,
} from "../constants/theme";

export type GameFormData = {
  name: string;
  category: string | null;
  description: string | null;
  min_players: number | null;
  max_players: number | null;
  min_playtime_minutes: number | null;
  max_playtime_minutes: number | null;
  rules_url: string | null;
  official_url: string | null;
  image_url: string | null;
};

type GameFormProps = {
  initialValues?: Partial<GameFormData>;
  submitLabel?: string;
  savingLabel?: string;
  saving?: boolean;

  onSubmit: (
    data: GameFormData
  ) => void | Promise<void>;
};

export default function GameForm({
  initialValues,
  submitLabel = "Save",
  savingLabel = "Saving...",
  saving = false,
  onSubmit,
}: GameFormProps) {
  const [name, setName] = useState(
    initialValues?.name ?? ""
  );

  const [category, setCategory] =
    useState(
      initialValues?.category ?? ""
    );

  const [description, setDescription] =
    useState(
      initialValues?.description ?? ""
    );

  const [minPlayers, setMinPlayers] =
    useState(
      initialValues?.min_players != null
        ? String(initialValues.min_players)
        : ""
    );

  const [maxPlayers, setMaxPlayers] =
    useState(
      initialValues?.max_players != null
        ? String(initialValues.max_players)
        : ""
    );

  const [minPlaytime, setMinPlaytime] =
    useState(
      initialValues?.min_playtime_minutes !=
      null
        ? String(
            initialValues.min_playtime_minutes
          )
        : ""
    );

  const [maxPlaytime, setMaxPlaytime] =
    useState(
      initialValues?.max_playtime_minutes !=
      null
        ? String(
            initialValues.max_playtime_minutes
          )
        : ""
    );

  const [rulesUrl, setRulesUrl] =
    useState(
      initialValues?.rules_url ?? ""
    );

  const [officialUrl, setOfficialUrl] =
    useState(
      initialValues?.official_url ?? ""
    );

  /*
   * Stores a newly selected local image URI.
   *
   * If the user is editing a game and does
   * not select a new image, this remains null
   * and the existing image URL is preserved.
   */
  const [selectedImageUri, setSelectedImageUri] =
    useState<string | null>(null);

  const insets = useSafeAreaInsets();

  const scrollViewRef =
    useRef<ScrollView>(null);

  async function pickImage() {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });

      if (
        !result.canceled &&
        result.assets.length > 0
      ) {
        const uri = result.assets[0].uri;

        console.log(
          "GameForm - selected image:",
          uri
        );

        setSelectedImageUri(uri);
      }
    } catch (error) {
      console.error(
        "Error selecting game image:",
        error
      );
    }
  }

  async function handleSubmit() {
    /*
     * IMPORTANT:
     *
     * If a new image was selected, use that
     * local URI.
     *
     * Otherwise keep the existing Supabase
     * image URL.
     */
    const imageUrl =
      selectedImageUri ??
      initialValues?.image_url ??
      null;

    const data: GameFormData = {
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

      image_url: imageUrl,
    };

    console.log(
      "GameForm - submitting image:",
      imageUrl
    );

    await onSubmit(data);
  }

  /**
   * Scroll the focused input into view.
   *
   * This preserves the keyboard fix from
   * the previous Add Game implementation.
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
          _height
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

  const displayedImage =
    selectedImageUri ??
    initialValues?.image_url ??
    null;

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
          {initialValues
            ? "Edit Game"
            : "Add Game"}
        </Text>

        <Text style={styles.subtitle}>
          {initialValues
            ? "Update the details of your board game."
            : "Add a board game to your collection."}
        </Text>

        {/* Game Image */}
        <TouchableOpacity
          style={styles.imagePicker}
          onPress={pickImage}
          activeOpacity={0.8}
          disabled={saving}
        >
          {displayedImage ? (
            <Image
              source={{
                uri: displayedImage,
              }}
              style={styles.imagePreview}
              resizeMode="cover"
            />
          ) : (
            <>
              <Text style={styles.imageIcon}>
                🖼️
              </Text>

              <Text
                style={styles.imagePickerTitle}
              >
                Add Game Image
              </Text>

              <Text
                style={styles.imagePickerSubtitle}
              >
                Choose an image from your gallery
              </Text>
            </>
          )}
        </TouchableOpacity>

        {displayedImage ? (
          <TouchableOpacity
            style={styles.changeImageButton}
            onPress={pickImage}
            disabled={saving}
            activeOpacity={0.8}
          >
            <Text
              style={styles.changeImageText}
            >
              Change Image
            </Text>
          </TouchableOpacity>
        ) : null}

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
                event.currentTarget as unknown as TextInput
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
                event.currentTarget as unknown as TextInput
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
                event.currentTarget as unknown as TextInput
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
                    event.currentTarget as unknown as TextInput
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
                    event.currentTarget as unknown as TextInput
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
                    event.currentTarget as unknown as TextInput
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
                    event.currentTarget as unknown as TextInput
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
                event.currentTarget as unknown as TextInput
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
                event.currentTarget as unknown as TextInput
              )
            }
          />

          <TouchableOpacity
            style={[
              styles.button,
              saving &&
                styles.buttonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={saving}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>
              {saving
                ? savingLabel
                : submitLabel}
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

  imagePicker: {
    marginTop: spacing.xl,
    width: "100%",
    height: 220,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  imagePreview: {
    width: "100%",
    height: "100%",
  },

  imageIcon: {
    fontSize: 42,
  },

  imagePickerTitle: {
    marginTop: spacing.sm,
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },

  imagePickerSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textMuted,
  },

  changeImageButton: {
    alignSelf: "center",
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },

  changeImageText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary,
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