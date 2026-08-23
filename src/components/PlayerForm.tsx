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

export type PlayerFormData = {
  name: string;
  avatar_url: string | null;
};

type PlayerFormProps = {
  initialValues?: Partial<PlayerFormData>;
  submitLabel?: string;
  savingLabel?: string;
  saving?: boolean;

  onSubmit: (
    data: PlayerFormData,
    selectedAvatarUri: string | null
  ) => void | Promise<void>;
};

export default function PlayerForm({
  initialValues,
  submitLabel = "Save",
  savingLabel = "Saving...",
  saving = false,
  onSubmit,
}: PlayerFormProps) {
  const [name, setName] = useState(
    initialValues?.name ?? ""
  );

  const [
    selectedAvatarUri,
    setSelectedAvatarUri,
  ] = useState<string | null>(null);

  const insets = useSafeAreaInsets();

  const scrollViewRef =
    useRef<ScrollView>(null);

  async function pickAvatar() {
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
      setSelectedAvatarUri(
        result.assets[0].uri
      );
    }
  }

  async function handleSubmit() {
    const data: PlayerFormData = {
      name: name.trim(),

      avatar_url:
        initialValues?.avatar_url ?? null,
    };

    await onSubmit(
      data,
      selectedAvatarUri
    );
  }

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

  const displayedAvatar =
    selectedAvatarUri ??
    initialValues?.avatar_url ??
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
            ? "Edit Player"
            : "Add Player"}
        </Text>

        <Text style={styles.subtitle}>
          {initialValues
            ? "Update this player's information."
            : "Add a player to your collection."}
        </Text>

        {/* Avatar */}
        <TouchableOpacity
          style={styles.avatarPicker}
          onPress={pickAvatar}
          activeOpacity={0.8}
          disabled={saving}
        >
          {displayedAvatar ? (
            <Image
              source={{
                uri: displayedAvatar,
              }}
              style={styles.avatarPreview}
              resizeMode="cover"
            />
          ) : (
            <Text style={styles.avatarPlaceholder}>
              {name
                .trim()
                .charAt(0)
                .toUpperCase() || "?"}
            </Text>
          )}
        </TouchableOpacity>

        <Text
          style={styles.avatarHint}
        >
          Tap to choose a profile image
        </Text>

        <View style={styles.form}>
          <Text style={styles.label}>
            Player name *
          </Text>

          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Habib"
            placeholderTextColor={
              colors.textMuted
            }
            style={styles.input}
            returnKeyType="done"
            autoCapitalize="words"
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

  avatarPicker: {
    alignSelf: "center",
    marginTop: spacing.xl,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  avatarPreview: {
    width: "100%",
    height: "100%",
  },

  avatarPlaceholder: {
    fontSize: 52,
    fontWeight: "800",
    color: colors.primary,
  },

  avatarHint: {
    marginTop: spacing.sm,
    textAlign: "center",
    fontSize: 13,
    color: colors.textMuted,
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