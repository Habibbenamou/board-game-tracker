import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { router } from "expo-router";

import {
  colors,
  radius,
  spacing,
} from "../../constants/theme";

export default function MoreScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        More
      </Text>

      <Text style={styles.subtitle}>
        Calendar, wishlist and settings.
      </Text>

      <View style={styles.menu}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() =>
            router.push("/players")
          }
          activeOpacity={0.8}
        >
          <View style={styles.icon}>
            <Text style={styles.iconText}>
              👥
            </Text>
          </View>

          <View style={styles.menuInfo}>
            <Text style={styles.menuTitle}>
              Players
            </Text>

            <Text style={styles.menuSubtitle}>
              Manage your players
            </Text>
          </View>

          <Text style={styles.chevron}>
            ›
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() =>
            router.push("/game-sessions")
          }
          activeOpacity={0.8}
        >
          <View style={styles.icon}>
            <Text style={styles.iconText}>
              🎲
            </Text>
          </View>

          <View style={styles.menuInfo}>
            <Text style={styles.menuTitle}>
              Game History
            </Text>

            <Text style={styles.menuSubtitle}>
              View your recorded sessions
            </Text>
          </View>

          <Text style={styles.chevron}>
            ›
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    paddingTop: 60,
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: colors.text,
  },

  subtitle: {
    marginTop: 8,
    color: colors.textSecondary,
  },

  menu: {
    marginTop: spacing.xl,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    marginBottom: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  icon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },

  iconText: {
    fontSize: 25,
  },

  menuInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },

  menuTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },

  menuSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textSecondary,
  },

  chevron: {
    marginLeft: spacing.sm,
    fontSize: 28,
    color: colors.textMuted,
  },
});