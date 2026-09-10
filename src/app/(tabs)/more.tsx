import {
  Alert,
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

import { useAuth } from "../../context/AuthContext";

export default function MoreScreen() {
  const { signOut } = useAuth();

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
            router.push("/profile")
          }
          activeOpacity={0.8}
        >
          <View style={styles.icon}>
            <Text style={styles.iconText}>
              👤
            </Text>
          </View>

          <View style={styles.menuInfo}>
            <Text style={styles.menuTitle}>
              Profile
            </Text>

            <Text style={styles.menuSubtitle}>
              View and edit your profile
            </Text>
          </View>

          <Text style={styles.chevron}>
            ›
          </Text>
        </TouchableOpacity>
        {/* Players */}
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

        {/* Game History */}
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

        {/* Logout */}
        <TouchableOpacity
          style={[
            styles.menuItem,
            styles.logoutItem,
          ]}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <View style={styles.icon}>
            <Text style={styles.iconText}>
              🚪
            </Text>
          </View>

          <View style={styles.menuInfo}>
            <Text
              style={[
                styles.menuTitle,
                styles.logoutText,
              ]}
            >
              Log Out
            </Text>

            <Text style={styles.menuSubtitle}>
              Sign out of your account
            </Text>
          </View>
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

  logoutItem: {
    marginTop: spacing.md,
  },

  logoutText: {
    color: "#D64545",
  },
});