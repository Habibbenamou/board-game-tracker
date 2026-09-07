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

import { colors, radius, spacing } from "../constants/theme";
import { signUp } from "../services/authService";

export default function SignupScreen() {
  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  async function handleSignup() {
    if (
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      Alert.alert(
        "Missing information",
        "Please complete all fields."
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
        email,
        password
      );

      /*
       * Depending on the Supabase project's
       * email confirmation settings, a newly
       * registered user may or may not have
       * an active session immediately.
       */
      if (data.session) {
        router.replace("/(tabs)");
      } else {
        Alert.alert(
          "Account created",
          "Your account has been created. Please check your email to confirm your account before logging in.",
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

      Alert.alert(
        "Sign up failed",
        "Unable to create your account. Please check your information and try again."
      );
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
          <Text style={styles.label}>
            Email
          </Text>

          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={
              colors.textMuted
            }
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
          />

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
            style={styles.input}
          />

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
            style={styles.input}
          />

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