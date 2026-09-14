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

import {
  useRef,
  useState,
} from "react";

import Ionicons from "@expo/vector-icons/Ionicons";

import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import {
  colors,
  radius,
  spacing,
} from "../constants/theme";

import { signIn } from "../services/authService";

/*
 * --------------------------------------------------
 * Animated Button
 * --------------------------------------------------
 */

const AnimatedPressable =
  Animated.createAnimatedComponent(Pressable);

function AnimatedLoginButton({
  loading,
  disabled,
  onPress,
}: {
  loading: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  const scale =
    useSharedValue(1);

  const animatedStyle =
    useAnimatedStyle(() => ({
      transform: [
        {
          scale: scale.value,
        },
      ],
    }));

  function handlePressIn() {
    if (disabled) {
      return;
    }

    scale.value = withSpring(
      0.98,
      {
        damping: 18,
        stiffness: 300,
      }
    );
  }

  function handlePressOut() {
    scale.value = withSpring(
      1,
      {
        damping: 16,
        stiffness: 240,
      }
    );
  }

  return (
    <AnimatedPressable
      style={[
        styles.loginButton,
        disabled &&
          styles.loginButtonDisabled,
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
          <Text
            style={
              styles.loginButtonText
            }
          >
            Log In
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

/*
 * --------------------------------------------------
 * Login Screen
 * --------------------------------------------------
 */

export default function LoginScreen() {
  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const [usernameFocused, setUsernameFocused] =
    useState(false);

  const [passwordFocused, setPasswordFocused] =
    useState(false);

  const passwordInputRef =
    useRef<TextInput>(null);

  async function handleLogin() {
    const trimmedUsername =
      username.trim();

    if (
      !trimmedUsername ||
      !password
    ) {
      Alert.alert(
        "Missing information",
        "Please enter your username and password."
      );

      return;
    }

    try {
      setLoading(true);

      await signIn(
        trimmedUsername,
        password
      );

      router.replace("/(tabs)");
    } catch (error) {
      console.error(
        "Error logging in:",
        error
      );

      Alert.alert(
        "Login failed",
        "Incorrect username or password."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleUsernameSubmit() {
    passwordInputRef.current?.focus();
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
    >
      <ScrollView
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
              entering={FadeInDown.duration(
                450
              )}
              style={styles.header}
            >
              <View
                style={
                  styles.logoContainer
                }
              >
                <Ionicons
                  name="dice-outline"
                  size={38}
                  color={
                    colors.primaryLight
                  }
                />
              </View>

              <Text
                style={styles.title}
              >
                Welcome Back
              </Text>

              <Text
                style={styles.subtitle}
              >
                Log in to continue tracking
                your board game sessions.
              </Text>
            </Animated.View>

            {/* Form */}

            <Animated.View
              entering={FadeInUp.duration(
                500
              ).delay(100)}
              style={styles.form}
            >
              {/* Username */}

              <View
                style={
                  styles.fieldContainer
                }
              >
                <Text
                  style={styles.label}
                >
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
                    onChangeText={
                      setUsername
                    }
                    placeholder="Enter your username"
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
                      setUsernameFocused(
                        true
                      )
                    }
                    onBlur={() =>
                      setUsernameFocused(
                        false
                      )
                    }
                    editable={!loading}
                    style={
                      styles.input
                    }
                  />
                </View>
              </View>

              {/* Password */}

              <View
                style={
                  styles.fieldContainer
                }
              >
                <View
                  style={
                    styles.labelRow
                  }
                >
                  <Text
                    style={styles.label}
                  >
                    Password
                  </Text>
                </View>

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
                    ref={
                      passwordInputRef
                    }
                    value={password}
                    onChangeText={
                      setPassword
                    }
                    placeholder="Enter your password"
                    placeholderTextColor={
                      colors.textMuted
                    }
                    secureTextEntry={
                      !showPassword
                    }
                    autoComplete="password"
                    textContentType="password"
                    returnKeyType="done"
                    onSubmitEditing={
                      handleLogin
                    }
                    onFocus={() =>
                      setPasswordFocused(
                        true
                      )
                    }
                    onBlur={() =>
                      setPasswordFocused(
                        false
                      )
                    }
                    editable={!loading}
                    style={
                      styles.input
                    }
                  />

                  <Pressable
                    style={
                      styles.passwordToggle
                    }
                    onPress={() =>
                      setShowPassword(
                        (current) =>
                          !current
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
              </View>

              {/* Login */}

              <AnimatedLoginButton
                loading={loading}
                disabled={loading}
                onPress={
                  handleLogin
                }
              />

              {/* Sign up */}

              <Pressable
                style={
                  styles.signupButton
                }
                onPress={() =>
                  router.push(
                    "/signup"
                  )
                }
                disabled={loading}
              >
                <Text
                  style={
                    styles.signupText
                  }
                >
                  Don't have an account?{" "}
                </Text>

                <Text
                  style={
                    styles.signupLink
                  }
                >
                  Sign Up
                </Text>
              </Pressable>
            </Animated.View>

            {/* Footer */}

            <Animated.View
              entering={FadeInUp.duration(
                450
              ).delay(250)}
              style={
                styles.footer
              }
            >
              <View
                style={
                  styles.footerIcon
                }
              >
                <Ionicons
                  name="shield-checkmark-outline"
                  size={14}
                  color={
                    colors.textMuted
                  }
                />
              </View>

              <Text
                style={
                  styles.footerText
                }
              >
                Your game group and session
                data stays in your account.
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
    backgroundColor:
      colors.background,
  },

  scrollContent: {
    flexGrow: 1,
  },

  container: {
    flex: 1,
    backgroundColor:
      colors.background,
    paddingHorizontal:
      spacing.lg,
    paddingVertical:
      spacing.xxl,
    justifyContent: "center",
  },

  content: {
    width: "100%",
    maxWidth: 500,
    alignSelf: "center",
  },

  /*
   * Header
   */

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
    maxWidth: 330,
    fontSize: 14,
    lineHeight: 20,
    color:
      colors.textSecondary,
    textAlign: "center",
  },

  /*
   * Form
   */

  form: {
    marginTop: spacing.xxl,
  },

  fieldContainer: {
    marginBottom: spacing.lg,
  },

  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    paddingHorizontal:
      spacing.md,
    borderRadius: radius.lg,
    backgroundColor:
      colors.surface,
    borderWidth: 1,
    borderColor:
      colors.border,
  },

  inputContainerFocused: {
    borderColor:
      colors.primary,
    backgroundColor:
      colors.surfaceElevated,
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

  /*
   * Login button
   */

  loginButton: {
    minHeight: 54,
    marginTop: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor:
      colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },

  loginButtonDisabled: {
    opacity: 0.55,
  },

  loginButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "800",
  },

  /*
   * Sign up
   */

  signupButton: {
    marginTop: spacing.xl,
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  signupText: {
    fontSize: 13,
    color:
      colors.textSecondary,
  },

  signupLink: {
    fontSize: 13,
    fontWeight: "800",
    color:
      colors.primaryLight,
  },

  /*
   * Footer
   */

  footer: {
    marginTop: spacing.xxl,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  footerIcon: {
    width: 26,
    height: 26,
    borderRadius: 9,
    backgroundColor:
      colors.surface,
    borderWidth: 1,
    borderColor:
      colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },

  footerText: {
    flexShrink: 1,
    fontSize: 11,
    lineHeight: 16,
    color:
      colors.textMuted,
    textAlign: "center",
  },
});