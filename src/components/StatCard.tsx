import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import React from "react";

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring
} from "react-native-reanimated";

import {
  colors,
  radius,
  spacing,
} from "../constants/theme";

type StatCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  value: string | number;
  label: string;
};

export default function StatCard({
  icon,
  value,
  label,
}: StatCardProps) {
  const opacity =
    useSharedValue(0);

  const translateY =
    useSharedValue(10);

  const scale =
    useSharedValue(0.96);

  /*
   * Start the card animation after
   * the component mounts.
   */
  React.useEffect(() => {
    opacity.value = withDelay(
      100,
      withSpring(1, {
        damping: 18,
        stiffness: 150,
      })
    );

    translateY.value = withDelay(
      100,
      withSpring(0, {
        damping: 18,
        stiffness: 150,
      })
    );

    scale.value = withDelay(
      100,
      withSpring(1, {
        damping: 16,
        stiffness: 160,
      })
    );
  }, [
    opacity,
    translateY,
    scale,
  ]);

  const animatedStyle =
    useAnimatedStyle(() => ({
      opacity: opacity.value,
      transform: [
        {
          translateY:
            translateY.value,
        },
        {
          scale: scale.value,
        },
      ],
    }));

  return (
    <Animated.View
      style={[
        styles.container,
        animatedStyle,
      ]}
    >
      <View style={styles.iconContainer}>
        <Ionicons
          name={icon}
          size={19}
          color={colors.primaryLight}
        />
      </View>

      <Text style={styles.value}>
        {value}
      </Text>

      <Text style={styles.label}>
        {label}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 118,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor:
      colors.surface,
    borderWidth: 1,
    borderColor:
      colors.border,
  },

  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(139, 92, 246, 0.10)",
    borderWidth: 1,
    borderColor:
      "rgba(139, 92, 246, 0.16)",
    marginBottom: spacing.sm,
  },

  value: {
    fontSize: 25,
    lineHeight: 30,
    fontWeight: "800",
    color: colors.text,
  },

  label: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "500",
    color: colors.textSecondary,
  },
});