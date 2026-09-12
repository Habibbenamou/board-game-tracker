import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import {
    colors,
    spacing,
} from "../constants/theme";

type SectionHeaderProps = {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

export default function SectionHeader({
  title,
  actionLabel,
  onActionPress,
}: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {title}
      </Text>

      {actionLabel ? (
        <TouchableOpacity
          onPress={onActionPress}
          disabled={!onActionPress}
          activeOpacity={0.7}
        >
          <Text style={styles.action}>
            {actionLabel}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  title: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "700",
    color: colors.text,
  },

  action: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primaryLight,
  },
});