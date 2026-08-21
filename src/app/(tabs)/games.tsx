import { StyleSheet, Text, View } from "react-native";

import { colors } from "../../constants/theme";

export default function GamesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Games
      </Text>

      <Text style={styles.subtitle}>
        Your board game collection
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