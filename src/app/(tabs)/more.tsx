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
  function openPlayers() {
    router.push("/players");
  }

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
          onPress={openPlayers}
          activeOpacity={0.8}
        >
          <View>
            <Text style={styles.menuTitle}>
              Players
            </Text>

            <Text style={styles.menuSubtitle}>
              Manage your players and profiles.
            </Text>
          </View>

          <Text style={styles.arrow}>
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
    minHeight: 76,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  menuTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
  },

  menuSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textSecondary,
  },

  arrow: {
    fontSize: 30,
    color: colors.textMuted,
    marginLeft: spacing.md,
  },
});