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

import { createMyPlayer } from "@/services/playerService";
import { colors, radius, spacing } from "../constants/theme";
import { signUp } from "../services/authService";

export default function SignupScreen() {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] =
    useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  async function handleSignup() {
    const trimmedUsername =
      username.trim();

    const trimmedDisplayName =
      displayName.trim();

    if (
      !trimmedUsername ||
      !trimmedDisplayName ||
      !password ||
      !confirmPassword
    ) {
      Alert.alert(
        "Missing information",
        "Please complete all fields."
      );

      return;
    }

    if (trimmedUsername.length < 3) {
      Alert.alert(
        "Username too short",
        "Your username must contain at least 3 characters."
      );

      return;
    }

    if (
      !/^[a-zA-Z0-9_]+$/.test(
        trimmedUsername
      )
    ) {
      Alert.alert(
        "Invalid username",
        "Username can only contain letters, numbers, and underscores."
      );

      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        "Passwords don't match",
        "Please make sure both passwords are identical."
      );

      return;
    }

    if (password.length < 6) {
      Alert.alert(
        "Password too short",
        "Your password must contain at least 6 characters."
      );

      return;
    }

    try {
      setLoading(true);

      const data = await signUp(
        trimmedUsername,
        password,
        trimmedDisplayName
      );

      if (data.session) {
        await createMyPlayer(
          trimmedUsername,
          trimmedDisplayName
        );

        router.replace(
          "/group-setup"
        );
      } else {
        Alert.alert(
          "Account created",
          "Your account was created successfully. You can now log in.",
          [
            {
              text: "OK",
              onPress: () =>
                router.replace("/login"),
            },
          ]
        );
      }
    } catch (error) {
      console.error(
        "Error signing up:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "";

      if (
        message
          .toLowerCase()
          .includes("username")
      ) {
        Alert.alert(
          "Username unavailable",
          "That username is already taken. Please choose another one."
        );
      } else if (
        message
          .toLowerCase()
          .includes("display name")
      ) {
        Alert.alert(
          "Invalid display name",
          "Please enter a display name."
        );
      } else {
        Alert.alert(
          "Sign up failed",
          "Unable to create your account. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>
          🎲
        </Text>

        <Text style={styles.title}>
          Create Account
        </Text>

        <Text style={styles.subtitle}>
          Create your Board Game Tracker account.
        </Text>

        <View style={styles.form}>
          {/* Username */}

          <Text style={styles.label}>
            Username
          </Text>

          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="Choose a username"
            placeholderTextColor={
              colors.textMuted
            }
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="username"
            style={styles.input}
          />

          <Text style={styles.hint}>
            Used to log in • 3+ characters •
            letters, numbers, _
          </Text>

          {/* Display name */}

          <Text style={styles.label}>
            Display name
          </Text>

          <TextInput
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="How should we call you?"
            placeholderTextColor={
              colors.textMuted
            }
            autoCapitalize="words"
            autoCorrect={false}
            autoComplete="name"
            style={styles.input}
          />

          <Text style={styles.hint}>
            This is the name other players will see.
          </Text>

          {/* Password */}

          <Text style={styles.label}>
            Password
          </Text>

          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="At least 6 characters"
            placeholderTextColor={
              colors.textMuted
            }
            secureTextEntry
            autoComplete="new-password"
            style={styles.input}
          />

          {/* Confirm password */}

          <Text style={styles.label}>
            Confirm password
          </Text>

          <TextInput
            value={confirmPassword}
            onChangeText={
              setConfirmPassword
            }
            placeholder="Repeat your password"
            placeholderTextColor={
              colors.textMuted
            }
            secureTextEntry
            autoComplete="new-password"
            style={styles.input}
          />

          {/* Create account */}

          <TouchableOpacity
            style={[
              styles.button,
              loading &&
                styles.buttonDisabled,
            ]}
            onPress={handleSignup}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator
                color="#FFFFFF"
              />
            ) : (
              <Text style={styles.buttonText}>
                Create Account
              </Text>
            )}
          </TouchableOpacity>

          {/* Login */}

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() =>
              router.back()
            }
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryText}>
              Already have an account?{" "}
              <Text style={styles.linkText}>
                Log In
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    padding: spacing.lg,
  },

  content: {
    width: "100%",
    maxWidth: 500,
    alignSelf: "center",
  },

  emoji: {
    fontSize: 56,
    textAlign: "center",
  },

  title: {
    marginTop: spacing.md,
    fontSize: 30,
    fontWeight: "800",
    color: colors.text,
    textAlign: "center",
  },

  subtitle: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    textAlign: "center",
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

  hint: {
    marginTop: 6,
    fontSize: 12,
    color: colors.textMuted,
  },

  input: {
    height: 50,
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

  secondaryButton: {
    marginTop: spacing.lg,
    alignItems: "center",
  },

  secondaryText: {
    color: colors.textSecondary,
    fontSize: 14,
  },

  linkText: {
    color: colors.primary,
    fontWeight: "700",
  },
});