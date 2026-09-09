import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { router } from "expo-router";
import { useState } from "react";

import {
    colors,
    radius,
    spacing,
} from "../constants/theme";

import {
    createGroup,
    joinGroup,
} from "../services/groupService";

export default function GroupSetupScreen() {
  const [mode, setMode] = useState<
    "choose" | "create" | "join"
  >("choose");

  const [groupName, setGroupName] =
    useState("");

  const [joinCode, setJoinCode] =
    useState("");

  const [createdCode, setCreatedCode] =
    useState<string | null>(null);

  const [saving, setSaving] =
    useState(false);

  async function handleCreateGroup() {
    if (!groupName.trim()) {
      Alert.alert(
        "Missing information",
        "Please enter a group name."
      );

      return;
    }

    try {
      setSaving(true);

      const group =
        await createGroup(
          groupName
        );

      setCreatedCode(
        group.join_code
      );

      Alert.alert(
        "Group created!",
        `Your group "${group.name}" has been created.`
      );
    } catch (error) {
      console.error(
        "Error creating group:",
        error
      );

      Alert.alert(
        "Error",
        "Unable to create the group. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleJoinGroup() {
    if (!joinCode.trim()) {
      Alert.alert(
        "Missing information",
        "Please enter the group code."
      );

      return;
    }

    try {
      setSaving(true);

      const group =
        await joinGroup(
          joinCode
        );

      Alert.alert(
        "Group joined!",
        `You joined "${group.name}".`,
        [
          {
            text: "Continue",
            onPress: () => {
              router.replace(
                "/(tabs)"
              );
            },
          },
        ]
      );
    } catch (error) {
      console.error(
        "Error joining group:",
        error
      );

      Alert.alert(
        "Unable to join",
        error instanceof Error
          ? error.message
          : "Unable to join the group. Please check the code and try again."
      );
    } finally {
      setSaving(false);
    }
  }

  if (createdCode) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.emoji}>
            🎉
          </Text>

          <Text style={styles.title}>
            Group Created!
          </Text>

          <Text style={styles.subtitle}>
            Share this code with the people
            you want to join your group.
          </Text>

          <View style={styles.codeCard}>
            <Text style={styles.codeLabel}>
              Group Code
            </Text>

            <Text style={styles.code}>
              {createdCode}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() =>
              router.replace(
                "/(tabs)"
              )
            }
            activeOpacity={0.8}
          >
            <Text
              style={styles.primaryButtonText}
            >
              Continue to App
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (mode === "create") {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>
          Create a Group
        </Text>

        <Text style={styles.subtitle}>
          Create a group for your board game
          collection.
        </Text>

        <Text style={styles.label}>
          Group name
        </Text>

        <TextInput
          value={groupName}
          onChangeText={setGroupName}
          placeholder="e.g. Friday Game Night"
          placeholderTextColor={
            colors.textMuted
          }
          style={styles.input}
          autoCapitalize="words"
          editable={!saving}
        />

        <TouchableOpacity
          style={[
            styles.primaryButton,
            saving &&
              styles.buttonDisabled,
          ]}
          onPress={handleCreateGroup}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator
              color="#FFFFFF"
            />
          ) : (
            <Text
              style={styles.primaryButtonText}
            >
              Create Group
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => setMode("choose")}
          disabled={saving}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryButtonText}>
            Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (mode === "join") {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>
          Join a Group
        </Text>

        <Text style={styles.subtitle}>
          Enter the code shared by your
          group administrator.
        </Text>

        <Text style={styles.label}>
          Group code
        </Text>

        <TextInput
          value={joinCode}
          onChangeText={(text) =>
            setJoinCode(
              text
                .toUpperCase()
                .replace(
                  /[^A-Z0-9]/g,
                  ""
                )
            )
          }
          placeholder="e.g. K7M4XP"
          placeholderTextColor={
            colors.textMuted
          }
          style={[
            styles.input,
            styles.codeInput,
          ]}
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={6}
          editable={!saving}
        />

        <TouchableOpacity
          style={[
            styles.primaryButton,
            saving &&
              styles.buttonDisabled,
          ]}
          onPress={handleJoinGroup}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator
              color="#FFFFFF"
            />
          ) : (
            <Text
              style={styles.primaryButtonText}
            >
              Join Group
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => setMode("choose")}
          disabled={saving}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryButtonText}>
            Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.centerContent}>
        <Text style={styles.emoji}>
          👥
        </Text>

        <Text style={styles.title}>
          Welcome!
        </Text>

        <Text style={styles.subtitle}>
          Create or join a group to start
          tracking your board games together.
        </Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => setMode("create")}
          activeOpacity={0.8}
        >
          <Text
            style={styles.primaryButtonText}
          >
            Create Group
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => setMode("join")}
          activeOpacity={0.8}
        >
          <Text
            style={styles.secondaryButtonText}
          >
            Join Group
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      colors.background,
    padding: spacing.xl,
    paddingTop: 80,
  },

  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emoji: {
    fontSize: 56,
    marginBottom: spacing.lg,
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: colors.text,
    textAlign: "center",
  },

  subtitle: {
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 21,
  },

  label: {
    marginBottom: 6,
    marginTop: spacing.md,
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontSize: 16,
  },

  codeInput: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 3,
  },

  primaryButton: {
    width: "100%",
    height: 52,
    marginTop: spacing.xl,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  secondaryButton: {
    width: "100%",
    height: 52,
    marginTop: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  secondaryButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  codeCard: {
    width: "100%",
    marginTop: spacing.xl,
    padding: spacing.xl,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },

  codeLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "600",
  },

  code: {
    marginTop: spacing.sm,
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: 5,
    color: colors.primary,
  },
});