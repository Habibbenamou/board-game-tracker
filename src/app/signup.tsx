import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { router } from "expo-router";

import { useRef, useState } from "react";

import Ionicons from "@expo/vector-icons/Ionicons";

import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { createMyPlayer } from "@/services/playerService";

import {
  colors,
  radius,
  spacing,
} from "../constants/theme";

import { signUp } from "../services/authService";

const AnimatedPressable =
  Animated.createAnimatedComponent(Pressable);

function AnimatedSignupButton({
  loading,
  disabled,
  onPress,
}: {
  loading: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: scale.value,
      },
    ],
  }));

  function handlePressIn() {
    if (disabled) return;

    scale.value = withSpring(0.98, {
      damping: 18,
      stiffness: 300,
    });
  }

  function handlePressOut() {
    scale.value = withSpring(1, {
      damping: 16,
      stiffness: 240,
    });
  }

  return (
    <AnimatedPressable
      style={[
        styles.signupButton,
        disabled && styles.signupButtonDisabled,
        animatedStyle,
      ]}
      onPress={onPress}
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={colors.white}
        />
      ) : (
        <>
          <Text style={styles.signupButtonText}>
            Create Account
          </Text>

          <Ionicons
            name="arrow-forward"
            size={19}
            color={colors.white}
          />
        </>
      )}
    </AnimatedPressable>
  );
}

export default function SignupScreen() {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [usernameFocused, setUsernameFocused] =
    useState(false);

  const [displayNameFocused, setDisplayNameFocused] =
    useState(false);

  const [passwordFocused, setPasswordFocused] =
    useState(false);

  const [
    confirmPasswordFocused,
    setConfirmPasswordFocused,
  ] = useState(false);

  const displayNameInputRef =
    useRef<TextInput>(null);

  const passwordInputRef =
    useRef<TextInput>(null);

  const confirmPasswordInputRef =
    useRef<TextInput>(null);
  
  const scrollViewRef = useRef<ScrollView>(null);

  function scrollToBottom() {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({
        animated: true,
      });
    }, 80);
  }

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

        router.replace("/group-setup");
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

  function handleUsernameSubmit() {
    displayNameInputRef.current?.focus();
  }

  function handleDisplayNameSubmit() {
    passwordInputRef.current?.focus();
  }

  function handlePasswordSubmit() {
    confirmPasswordInputRef.current?.focus();
  }

  function handleConfirmPasswordFocus() {
    setConfirmPasswordFocused(true);
    scrollToBottom();
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : "height"
      }
    >
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={
          styles.scrollContent
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <View style={styles.content}>
            {/* Header */}

            <Animated.View
              entering={FadeInDown.duration(450)}
              style={styles.header}
            >
              <View style={styles.logoContainer}>
                <Ionicons
                  name="dice-outline"
                  size={38}
                  color={colors.primaryLight}
                />
              </View>

              <Text style={styles.title}>
                Create Account
              </Text>

              <Text style={styles.subtitle}>
                Create your account and start
                tracking your board game sessions.
              </Text>
            </Animated.View>

            {/* Form */}

            <Animated.View
              entering={FadeInUp.duration(500).delay(100)}
              style={styles.form}
            >
              {/* Username */}

              <View style={styles.fieldContainer}>
                <Text style={styles.label}>
                  Username
                </Text>

                <View
                  style={[
                    styles.inputContainer,
                    usernameFocused &&
                      styles.inputContainerFocused,
                  ]}
                >
                  <Ionicons
                    name="person-outline"
                    size={19}
                    color={
                      usernameFocused
                        ? colors.primaryLight
                        : colors.textMuted
                    }
                  />

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
                    textContentType="username"
                    returnKeyType="next"
                    onSubmitEditing={
                      handleUsernameSubmit
                    }
                    onFocus={() =>
                      setUsernameFocused(true)
                    }
                    onBlur={() =>
                      setUsernameFocused(false)
                    }
                    editable={!loading}
                    style={styles.input}
                  />
                </View>

                <Text style={styles.hint}>
                  3+ characters • letters,
                  numbers, and _
                </Text>
              </View>

              {/* Display name */}

              <View style={styles.fieldContainer}>
                <Text style={styles.label}>
                  Display name
                </Text>

                <View
                  style={[
                    styles.inputContainer,
                    displayNameFocused &&
                      styles.inputContainerFocused,
                  ]}
                >
                  <Ionicons
                    name="happy-outline"
                    size={19}
                    color={
                      displayNameFocused
                        ? colors.primaryLight
                        : colors.textMuted
                    }
                  />

                  <TextInput
                    ref={displayNameInputRef}
                    value={displayName}
                    onChangeText={setDisplayName}
                    placeholder="How should we call you?"
                    placeholderTextColor={
                      colors.textMuted
                    }
                    autoCapitalize="words"
                    autoCorrect={false}
                    autoComplete="name"
                    textContentType="name"
                    returnKeyType="next"
                    onSubmitEditing={
                      handleDisplayNameSubmit
                    }
                    onFocus={() =>
                      setDisplayNameFocused(true)
                    }
                    onBlur={() =>
                      setDisplayNameFocused(false)
                    }
                    editable={!loading}
                    style={styles.input}
                  />
                </View>

                <Text style={styles.hint}>
                  This is the name other players
                  will see.
                </Text>
              </View>

              {/* Password */}

              <View style={styles.fieldContainer}>
                <Text style={styles.label}>
                  Password
                </Text>

                <View
                  style={[
                    styles.inputContainer,
                    passwordFocused &&
                      styles.inputContainerFocused,
                  ]}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={19}
                    color={
                      passwordFocused
                        ? colors.primaryLight
                        : colors.textMuted
                    }
                  />

                  <TextInput
                    ref={passwordInputRef}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="At least 6 characters"
                    placeholderTextColor={
                      colors.textMuted
                    }
                    secureTextEntry={
                      !showPassword
                    }
                    autoComplete="new-password"
                    textContentType="newPassword"
                    returnKeyType="next"
                    onSubmitEditing={
                      handlePasswordSubmit
                    }
                    onFocus={() =>
                      setPasswordFocused(true)
                    }
                    onBlur={() =>
                      setPasswordFocused(false)
                    }
                    editable={!loading}
                    style={styles.input}
                  />

                  <Pressable
                    style={styles.passwordToggle}
                    onPress={() =>
                      setShowPassword(
                        (current) => !current
                      )
                    }
                    disabled={loading}
                    hitSlop={8}
                  >
                    <Ionicons
                      name={
                        showPassword
                          ? "eye-off-outline"
                          : "eye-outline"
                      }
                      size={20}
                      color={
                        colors.textMuted
                      }
                    />
                  </Pressable>
                </View>

                <Text style={styles.hint}>
                  Minimum 6 characters.
                </Text>
              </View>

              {/* Confirm password */}

              <View style={styles.fieldContainer}>
                <Text style={styles.label}>
                  Confirm password
                </Text>

                <View
                  style={[
                    styles.inputContainer,
                    confirmPasswordFocused &&
                      styles.inputContainerFocused,
                  ]}
                >
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={19}
                    color={
                      confirmPasswordFocused
                        ? colors.primaryLight
                        : colors.textMuted
                    }
                  />

                  <TextInput
                    ref={confirmPasswordInputRef}
                    value={confirmPassword}
                    onChangeText={
                      setConfirmPassword
                    }
                    placeholder="Repeat your password"
                    placeholderTextColor={
                      colors.textMuted
                    }
                    secureTextEntry={
                      !showConfirmPassword
                    }
                    autoComplete="new-password"
                    textContentType="newPassword"
                    returnKeyType="done"
                    onSubmitEditing={
                      handleSignup
                    }
                    onFocus={() =>
                      handleConfirmPasswordFocus()
                    }
                    onBlur={() =>
                      setConfirmPasswordFocused(
                        false
                      )
                    }
                    editable={!loading}
                    style={styles.input}
                  />

                  <Pressable
                    style={styles.passwordToggle}
                    onPress={() =>
                      setShowConfirmPassword(
                        (current) => !current
                      )
                    }
                    disabled={loading}
                    hitSlop={8}
                  >
                    <Ionicons
                      name={
                        showConfirmPassword
                          ? "eye-off-outline"
                          : "eye-outline"
                      }
                      size={20}
                      color={
                        colors.textMuted
                      }
                    />
                  </Pressable>
                </View>
              </View>

              {/* Create account */}

              <AnimatedSignupButton
                loading={loading}
                disabled={loading}
                onPress={handleSignup}
              />

              {/* Login */}

              <Pressable
                style={styles.loginButton}
                onPress={() => router.back()}
                disabled={loading}
              >
                <Text style={styles.loginText}>
                  Already have an account?{" "}
                </Text>

                <Text style={styles.loginLink}>
                  Log In
                </Text>
              </Pressable>
            </Animated.View>

            {/* Footer */}

            <Animated.View
              entering={FadeInUp.duration(450).delay(250)}
              style={styles.footer}
            >
              <View style={styles.footerIcon}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={14}
                  color={colors.textMuted}
                />
              </View>

              <Text style={styles.footerText}>
                Your account keeps your game groups
                and session data together.
              </Text>
            </Animated.View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scrollContent: {
    flexGrow: 1,
  },

  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
  },

  content: {
    width: "100%",
    maxWidth: 500,
    alignSelf: "center",
    justifyContent: "center",
    flexGrow: 1,
  },

  header: {
    alignItems: "center",
  },

  logoContainer: {
    width: 78,
    height: 78,
    borderRadius: 26,
    backgroundColor:
      "rgba(139, 92, 246, 0.10)",
    borderWidth: 1,
    borderColor:
      "rgba(139, 92, 246, 0.20)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },

  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "800",
    color: colors.text,
    textAlign: "center",
  },

  subtitle: {
    marginTop: spacing.sm,
    maxWidth: 340,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    textAlign: "center",
  },

  form: {
    marginTop: spacing.xxl,
  },

  fieldContainer: {
    marginBottom: spacing.lg,
  },

  label: {
    marginBottom: spacing.sm,
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
  },

  inputContainer: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  inputContainerFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceElevated,
  },

  input: {
    flex: 1,
    minHeight: 52,
    marginLeft: spacing.sm,
    paddingVertical: 0,
    color: colors.text,
    fontSize: 15,
  },

  passwordToggle: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: spacing.sm,
  },

  hint: {
    marginTop: 6,
    paddingHorizontal: 2,
    fontSize: 11,
    lineHeight: 16,
    color: colors.textMuted,
  },

  signupButton: {
    minHeight: 54,
    marginTop: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },

  signupButtonDisabled: {
    opacity: 0.55,
  },

  signupButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "800",
  },

  loginButton: {
    marginTop: spacing.xl,
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  loginText: {
    fontSize: 13,
    color: colors.textSecondary,
  },

  loginLink: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.primaryLight,
  },

  footer: {
    marginTop: spacing.xxl,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  footerIcon: {
    width: 26,
    height: 26,
    borderRadius: 9,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },

  footerText: {
    flexShrink: 1,
    fontSize: 11,
    lineHeight: 16,
    color: colors.textMuted,
    textAlign: "center",
  },
});