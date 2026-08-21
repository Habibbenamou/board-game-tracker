import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import StatCard from "../../components/StatCard";
import GameCard from "../../components/GameCard";

import {
  colors,
  spacing,
} from "../../constants/theme";

export default function HomeScreen() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.greeting}>
        Good evening 👋
      </Text>

      <Text style={styles.title}>
        Board Game Tracker
      </Text>

      <Text style={styles.subtitle}>
        Your group's board game history
      </Text>

      <View style={styles.statsRow}>
        <StatCard
          icon="🎲"
          value={47}
          label="Games Played"
        />

        <StatCard
          icon="🏆"
          value={19}
          label="Your Wins"
        />
      </View>

      <View style={styles.statsRow}>
        <StatCard
          icon="👥"
          value={4}
          label="Players"
        />

        <StatCard
          icon="🎯"
          value="40%"
          label="Your Win Rate"
        />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Recent Games
        </Text>

        <Text style={styles.seeAll}>
          See all
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.gamesRow}
      >
        <GameCard
          name="Catan"
          category="Strategy"
          gamesPlayed={12}
        />

        <GameCard
          name="Wonderland's War"
          category="Strategy"
          gamesPlayed={8}
        />

        <GameCard
          name="Azul"
          category="Abstract"
          gamesPlayed={6}
        />
      </ScrollView>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Current Leader
        </Text>
      </View>

      <View style={styles.leaderCard}>
        <Text style={styles.leaderIcon}>
          👑
        </Text>

        <View>
          <Text style={styles.leaderName}>
            Habib
          </Text>

          <Text style={styles.leaderStats}>
            19 wins • 40.4% win rate
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    padding: spacing.lg,
    paddingTop: 60,
    paddingBottom: 40,
  },

  greeting: {
    fontSize: 15,
    color: colors.textSecondary,
  },

  title: {
    marginTop: spacing.xs,
    fontSize: 30,
    fontWeight: "800",
    color: colors.text,
  },

  subtitle: {
    marginTop: spacing.xs,
    fontSize: 15,
    color: colors.textSecondary,
  },

  statsRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.md,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },

  seeAll: {
    color: colors.primary,
    fontWeight: "600",
  },

  gamesRow: {
    gap: spacing.md,
  },

  leaderCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },

  leaderIcon: {
    fontSize: 32,
  },

  leaderName: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },

  leaderStats: {
    marginTop: 4,
    color: colors.textSecondary,
  },
});