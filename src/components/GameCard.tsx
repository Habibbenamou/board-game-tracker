import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { colors, radius, spacing } from "../constants/theme";

type GameCardProps = {
  name: string;
  category?: string;
  imageUrl?: string | null;
  gamesPlayed?: number;
  onPress?: () => void;
};

export default function GameCard({
  name,
  category,
  imageUrl,
  gamesPlayed = 0,
  onPress,
}: GameCardProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.image} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.placeholderText}>🎲</Text>
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>

        {category && (
          <Text style={styles.category}>
            {category}
          </Text>
        )}

        <Text style={styles.played}>
          Played {gamesPlayed} {gamesPlayed === 1 ? "time" : "times"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    width: 180,
  },

  image: {
    width: "100%",
    height: 150,
  },

  imagePlaceholder: {
    width: "100%",
    height: 150,
    backgroundColor: "#E8E3D9",
    justifyContent: "center",
    alignItems: "center",
  },

  placeholderText: {
    fontSize: 42,
  },

  content: {
    padding: spacing.md,
  },

  name: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
  },

  category: {
    marginTop: 4,
    fontSize: 13,
    color: colors.primary,
    fontWeight: "600",
  },

  played: {
    marginTop: spacing.sm,
    fontSize: 12,
    color: colors.textSecondary,
  },
});