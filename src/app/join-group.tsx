import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import { colors } from "../constants/theme";
import { joinGroup } from "../services/groupService";

export default function JoinGroupScreen() {
  const [joinCode, setJoinCode] = useState("");
  const [joining, setJoining] = useState(false);

  async function handleJoinGroup() {
    const code = joinCode.trim().toUpperCase();

    if (!code) {
      Alert.alert(
        "Join group",
        "Please enter a group code."
      );
      return;
    }

    try {
      setJoining(true);

      await joinGroup(code);

      Alert.alert(
        "Group joined!",
        "You have successfully joined the group.",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error("Error joining group:", error);

      Alert.alert(
        "Unable to join group",
        error?.message ||
          "The group code is invalid or you could not join this group."
      );
    } finally {
      setJoining(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === "ios" ? "padding" : undefined
      }
    >

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons
            name="people-outline"
            size={36}
            color={colors.primary}
          />
        </View>

        <Text style={styles.title}>
          Join a group
        </Text>

        <Text style={styles.description}>
          Enter the join code shared by the group owner
          or another member.
        </Text>

        <View style={styles.form}>
          <Text style={styles.label}>
            Group code
          </Text>

          <TextInput
            value={joinCode}
            onChangeText={setJoinCode}
            placeholder="e.g. ABC123"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={20}
            style={styles.input}
            editable={!joining}
            returnKeyType="join"
            onSubmitEditing={handleJoinGroup}
          />

          <Pressable
            style={[
              styles.joinButton,
              joining && styles.joinButtonDisabled,
            ]}
            onPress={handleJoinGroup}
            disabled={joining}
          >
            {joining ? (
              <ActivityIndicator
                color={colors.background}
              />
            ) : (
              <>
                <Ionicons
                  name="enter-outline"
                  size={20}
                  color={colors.background}
                />

                <Text style={styles.joinButtonText}>
                  Join Group
                </Text>
              </>
            )}
          </Pressable>
        </View>

        <View style={styles.infoCard}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={colors.primary}
          />

          <Text style={styles.infoText}>
            Your group administrator can find the join
            code in the group settings and share it with
            you.
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  headerSpacer: {
    width: 40,
  },

  headerTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
  },

  content: {
    flex: 1,
    padding: 24,
  },

  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: 32,
    marginBottom: 20,
  },

  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
  },

  description: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 32,
  },

  form: {
    width: "100%",
  },

  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },

  input: {
    height: 54,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 2,
    paddingHorizontal: 16,
    textAlign: "center",
  },

  joinButton: {
    height: 54,
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  joinButtonDisabled: {
    opacity: 0.6,
  },

  joinButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: "700",
  },

  infoCard: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
  },

  infoText: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
});