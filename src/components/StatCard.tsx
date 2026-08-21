import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../constants/theme";

type StatCardProps = {
  label: string;
  value: string | number;
  icon?: string;
};

export default function StatCard({
  label,
  value,
  icon,
}: StatCardProps) {
  return (
    <View style={styles.container}>
      {icon && <Text style={styles.icon}>{icon}</Text>}

      <Text style={styles.value}>{value}</Text>

      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    minHeight: 110,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },

  icon: {
    fontSize: 20,
    marginBottom: spacing.xs,
  },

  value: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.text,
  },

  label: {
    marginTop: spacing.xs,
    fontSize: 13,
    color: colors.textSecondary,
  },
});