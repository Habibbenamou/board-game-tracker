import { StyleSheet, Text, View } from "react-native";

import { colors } from "../../constants/theme";

export default function PlayScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>
        🎲
      </Text>

      <Text style={styles.title}>
        Record a Game
      </Text>

      <Text style={styles.subtitle}>
        Choose a game and record your group's results.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  emoji: {
    fontSize: 56,
  },

  title: {
    marginTop: 16,
    fontSize: 28,
    fontWeight: "800",
    color: colors.text,
  },

  subtitle: {
    marginTop: 8,
    textAlign: "center",
    color: colors.textSecondary,
  },
});