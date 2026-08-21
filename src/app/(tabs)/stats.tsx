import { StyleSheet, Text, View } from "react-native";

import { colors } from "../../constants/theme";

export default function StatsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Leaderboard
      </Text>

      <Text style={styles.subtitle}>
        See who's dominating the table.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
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
});