import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import {
  ColorValue,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  colors,
  radius,
} from "../../constants/theme";

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import {
  useEffect,
} from "react";

function PlayTabIcon({
  color,
  focused,
}: {
  color: ColorValue;
  focused: boolean;
}) {
  const scale =
    useSharedValue(1);

  const glowOpacity =
    useSharedValue(0.65);

  useEffect(() => {
    /*
     * Slow breathing animation.
     *
     * This is intentionally subtle.
     * It should attract attention without
     * feeling like an alert.
     */
    scale.value =
      withRepeat(
        withSequence(
          withTiming(1.06, {
            duration: 1400,
          }),
          withTiming(1, {
            duration: 1400,
          })
        ),
        -1,
        false
      );

    glowOpacity.value =
      withRepeat(
        withSequence(
          withTiming(
            0.95,
            {
              duration: 1400,
            }
          ),
          withTiming(
            0.65,
            {
              duration: 1400,
            }
          )
        ),
        -1,
        false
      );
  }, [
    scale,
    glowOpacity,
  ]);

  const animatedStyle =
    useAnimatedStyle(() => ({
      transform: [
        {
          scale: scale.value,
        },
      ],
      opacity:
        glowOpacity.value,
    }));

  return (
    <Animated.View
      style={[
        {
          width: 44,
          height: 44,
          borderRadius: 15,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor:
            focused
              ? colors.primary
              : colors.surfaceHighlight,
        },
        animatedStyle,
      ]}
    >
      <Ionicons
        name={
          focused
            ? "play"
            : "play-outline"
        }
        size={focused ? 25 : 23}
        color={
          focused
            ? colors.white
            : color
        }
      />
    </Animated.View>
  );
}

export default function TabLayout() {
  const insets =
    useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor:
          colors.primaryLight,

        tabBarInactiveTintColor:
          colors.textMuted,

        tabBarStyle: {
          height:
            64 + insets.bottom,
          paddingBottom:
            insets.bottom + 4,
          paddingTop: 7,
          backgroundColor:
            colors.surface,
          borderTopWidth: 1,
          borderTopColor:
            colors.border,
        },

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },

        tabBarItemStyle: {
          borderRadius:
            radius.md,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarShowLabel: false,

          tabBarIcon: ({
            color,
            size,
            focused,
          }) => (
            <Ionicons
              name={
                focused
                  ? "home"
                  : "home-outline"
              }
              size={
                focused
                  ? size + 1
                  : size
              }
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="games"
        options={{
          title: "Games",
          tabBarShowLabel: false,

          tabBarIcon: ({
            color,
            size,
            focused,
          }) => (
            <Ionicons
              name={
                focused
                  ? "dice"
                  : "dice-outline"
              }
              size={
                focused
                  ? size + 1
                  : size
              }
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="play"
        options={{
          title: "Play",
          tabBarShowLabel: false,
          
          tabBarIcon: ({
            color,
            focused,
          }) => (
            <PlayTabIcon
              color={color}
              focused={focused}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="stats"
        options={{
          title: "Stats",
          tabBarShowLabel: false,

          tabBarIcon: ({
            color,
            size,
            focused,
          }) => (
            <Ionicons
              name={
                focused
                  ? "trophy"
                  : "trophy-outline"
              }
              size={
                focused
                  ? size + 1
                  : size
              }
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="more"
        options={{
          title: "More",
          tabBarShowLabel: false,

          tabBarIcon: ({
            color,
            size,
            focused,
          }) => (
            <Ionicons
              name={
                focused
                  ? "ellipsis-horizontal-circle"
                  : "ellipsis-horizontal-circle-outline"
              }
              size={
                focused
                  ? size + 1
                  : size
              }
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}