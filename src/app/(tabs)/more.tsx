import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { router } from "expo-router";

import Ionicons from "@expo/vector-icons/Ionicons";

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import {
  colors,
  radius,
  spacing,
} from "../../constants/theme";

import { useAuth } from "../../context/AuthContext";
import { useGroup } from "../../context/GroupContext";

type MenuItemProps = {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  subtitle: string;
  onPress: () => void;
  danger?: boolean;
};

const AnimatedPressable =
  Animated.createAnimatedComponent(Pressable);

function MenuItem({
  icon,
  title,
  subtitle,
  onPress,
  danger = false,
}: MenuItemProps) {
  const pressed = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: pressed.value,
      },
    ],
    opacity: pressed.value,
  }));

  function handlePressIn() {
    pressed.value = withSpring(0.985, {
      damping: 18,
      stiffness: 300,
    });
  }

  function handlePressOut() {
    pressed.value = withSpring(1, {
      damping: 18,
      stiffness: 300,
    });
  }

  return (
    <AnimatedPressable
      style={[
        styles.menuItem,
        danger && styles.logoutItem,
        animatedStyle,
      ]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <View
        style={[
          styles.icon,
          danger && styles.logoutIcon,
        ]}
      >
        <Ionicons
          name={icon}
          size={23}
          color={
            danger
              ? colors.danger
              : colors.primaryLight
          }
        />
      </View>

      <View style={styles.menuInfo}>
        <Text
          style={[
            styles.menuTitle,
            danger && styles.logoutText,
          ]}
        >
          {title}
        </Text>

        <Text style={styles.menuSubtitle}>
          {subtitle}
        </Text>
      </View>

      {!danger ? (
        <Ionicons
          name="chevron-forward"
          size={19}
          color={colors.textMuted}
        />
      ) : null}
    </AnimatedPressable>
  );
}

export default function MoreScreen() {
  const { signOut } = useAuth();
  const { currentGroup } = useGroup();

  async function handleLogout() {
    Alert.alert(
      "Log out",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut();

              router.replace("/login");
            } catch (error) {
              console.error(
                "Error logging out:",
                error
              );

              Alert.alert(
                "Error",
                "Unable to log out. Please try again."
              );
            }
          },
        },
      ]
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            More
          </Text>

          <Text style={styles.subtitle}>
            Manage your group, players and settings.
          </Text>
        </View>

        <View style={styles.headerIcon}>
          <Ionicons
            name="ellipsis-horizontal-circle-outline"
            size={27}
            color={colors.primaryLight}
          />
        </View>
      </View>

      {currentGroup ? (
        <View style={styles.groupBadge}>
          <View style={styles.groupBadgeIcon}>
            <Ionicons
              name="people"
              size={16}
              color={colors.primaryLight}
            />
          </View>

          <View style={styles.groupBadgeInfo}>
            <Text style={styles.groupBadgeLabel}>
              Current group
            </Text>

            <Text
              style={styles.groupBadgeName}
              numberOfLines={1}
            >
              {currentGroup.name}
            </Text>
          </View>
        </View>
      ) : null}

      <View style={styles.menu}>
        {/* Game History */}
        <MenuItem
          icon="time-outline"
          title="Game History"
          subtitle="View your recorded sessions"
          onPress={() =>
            router.push("/game-sessions")
          }
        />

        {/* Group Join Code */}
        <MenuItem
          icon="key-outline"
          title="Group Join Code"
          subtitle="Share your code with other players"
          onPress={() =>
            router.push("/group-join-code")
          }
        />

        {/* Profile */}
        <MenuItem
          icon="person-outline"
          title="Profile"
          subtitle="View and edit your profile"
          onPress={() =>
            router.push("/profile")
          }
        />

        {/* Players */}
        <MenuItem
          icon="people-outline"
          title="Players"
          subtitle="Manage your players"
          onPress={() =>
            router.push("/players")
          }
        />

        {/* Join Group */}
        <MenuItem
          icon="link-outline"
          title="Join a Group"
          subtitle="Join a group using an invite code"
          onPress={() =>
            router.push("/join-group")
          }
        />

        {/* Logout */}
        <MenuItem
          icon="log-out-outline"
          title="Log Out"
          subtitle="Sign out of your account"
          onPress={handleLogout}
          danger
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: 60,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "800",
    color: colors.text,
  },

  subtitle: {
    marginTop: 7,
    maxWidth: 300,
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

  groupBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xl,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },

  groupBadgeIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },

  groupBadgeInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },

  groupBadgeLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  groupBadgeName: {
    marginTop: 2,
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },

  menu: {
    marginTop: spacing.lg,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 76,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  icon: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
  },

  logoutIcon: {
    backgroundColor: "rgba(239, 68, 68, 0.08)",
  },

  menuInfo: {
    flex: 1,
    marginLeft: spacing.md,
    marginRight: spacing.sm,
  },

  menuTitle: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "700",
    color: colors.text,
  },

  menuSubtitle: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textSecondary,
  },

  logoutItem: {
    marginTop: spacing.sm,
    backgroundColor: colors.surface,
    borderColor: "rgba(239, 68, 68, 0.22)",
  },

  logoutText: {
    color: colors.danger,
  },
});