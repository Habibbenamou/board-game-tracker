import {
    Alert,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

import {
    router,
} from "expo-router";

import Ionicons from "@expo/vector-icons/Ionicons";

import * as Clipboard from "expo-clipboard";

import Animated, {
    FadeInUp,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";

import {
    colors,
    radius,
    spacing
} from "../constants/theme";

import { useGroup } from "../context/GroupContext";

const AnimatedPressable =
  Animated.createAnimatedComponent(Pressable);

export default function GroupJoinCodeScreen() {
  const { currentGroup } = useGroup();

  const pressed = useSharedValue(1);

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: pressed.value,
      },
    ],
  }));

  async function handleCopyCode() {
    if (!currentGroup?.join_code) {
      return;
    }

    try {
      await Clipboard.setStringAsync(
        currentGroup.join_code
      );

      Alert.alert(
        "Code copied",
        "The group join code has been copied to your clipboard."
      );
    } catch (error) {
      console.error(
        "Error copying group join code:",
        error
      );

      Alert.alert(
        "Error",
        "Unable to copy the group code."
      );
    }
  }

  if (!currentGroup) {
    return (
      <View style={styles.center}>
        <View style={styles.stateIcon}>
          <Ionicons
            name="people-outline"
            size={32}
            color={colors.primaryLight}
          />
        </View>

        <Text style={styles.stateTitle}>
          No group selected
        </Text>

        <Text style={styles.stateText}>
          Select a group before viewing its
          join code.
        </Text>

        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={18}
            color={colors.white}
          />

          <Text style={styles.backButtonText}>
            Go Back
          </Text>
        </Pressable>
      </View>
    );
  }

  const joinCode = currentGroup.join_code;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            Group Join Code
          </Text>

          <Text style={styles.subtitle}>
            Share this code with players you want
            to invite.
          </Text>
        </View>

        <View style={styles.headerIcon}>
          <Ionicons
            name="key-outline"
            size={25}
            color={colors.primaryLight}
          />
        </View>
      </View>

      <Animated.View
        entering={FadeInUp.duration(350)}
        style={styles.content}
      >
        <View style={styles.groupCard}>
          <View style={styles.groupIcon}>
            <Ionicons
              name="people"
              size={28}
              color={colors.primaryLight}
            />
          </View>

          <Text style={styles.groupLabel}>
            CURRENT GROUP
          </Text>

          <Text
            style={styles.groupName}
            numberOfLines={1}
          >
            {currentGroup.name}
          </Text>
        </View>

        <View style={styles.codeCard}>
          <View style={styles.codeHeader}>
            <View style={styles.codeHeaderIcon}>
              <Ionicons
                name="link"
                size={17}
                color={colors.secondary}
              />
            </View>

            <Text style={styles.codeLabel}>
              INVITE CODE
            </Text>
          </View>

          <Text style={styles.code}>
            {joinCode || "------"}
          </Text>

          <Text style={styles.codeHint}>
            Players can enter this code from
            “Join a Group”.
          </Text>
        </View>

        {joinCode ? (
          <AnimatedPressable
            style={[
              styles.copyButton,
              buttonStyle,
            ]}
            onPress={handleCopyCode}
            onPressIn={() => {
              pressed.value = withSpring(0.97, {
                damping: 18,
                stiffness: 300,
              });
            }}
            onPressOut={() => {
              pressed.value = withSpring(1, {
                damping: 18,
                stiffness: 300,
              });
            }}
          >
            <Ionicons
              name="copy-outline"
              size={20}
              color={colors.white}
            />

            <Text style={styles.copyButtonText}>
              Copy Join Code
            </Text>
          </AnimatedPressable>
        ) : (
          <View style={styles.noCodeCard}>
            <Ionicons
              name="alert-circle-outline"
              size={20}
              color={colors.warning}
            />

            <Text style={styles.noCodeText}>
              This group does not currently have a
              join code.
            </Text>
          </View>
        )}

        <View style={styles.tipCard}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={colors.textMuted}
          />

          <Text style={styles.tipText}>
            Anyone with this code can request to
            join this group, so only share it with
            people you trust.
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    paddingTop: 24,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  title: {
    fontSize: 27,
    lineHeight: 33,
    fontWeight: "800",
    color: colors.text,
  },

  subtitle: {
    maxWidth: 290,
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },

  headerIcon: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  content: {
    marginTop: spacing.xl,
  },

  groupCard: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  groupIcon: {
    width: 58,
    height: 58,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },

  groupLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    color: colors.textMuted,
  },

  groupName: {
    marginTop: 5,
    maxWidth: "90%",
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "800",
    color: colors.text,
  },

  codeCard: {
    marginTop: spacing.lg,
    padding: spacing.xl,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.primaryDark,
    alignItems: "center",
  },

  codeHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  codeHeaderIcon: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },

  codeLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    color: colors.textSecondary,
  },

  code: {
    marginTop: spacing.md,
    fontSize: 36,
    lineHeight: 44,
    fontWeight: "900",
    letterSpacing: 6,
    color: colors.primaryLight,
    textAlign: "center",
  },

  codeHint: {
    marginTop: spacing.md,
    maxWidth: 280,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textMuted,
    textAlign: "center",
  },

  copyButton: {
    minHeight: 54,
    marginTop: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },

  copyButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.white,
  },

  tipCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  tipText: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textMuted,
  },

  noCodeCard: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  noCodeText: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    backgroundColor: colors.background,
  },

  stateIcon: {
    width: 64,
    height: 64,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  stateTitle: {
    marginTop: spacing.lg,
    fontSize: 20,
    fontWeight: "800",
    color: colors.text,
  },

  stateText: {
    marginTop: spacing.sm,
    maxWidth: 300,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    textAlign: "center",
  },

  backButton: {
    marginTop: spacing.xl,
    minHeight: 48,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },

  backButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.white,
  },
});