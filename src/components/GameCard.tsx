import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  colors,
  radius,
  spacing,
} from "../constants/theme";

type GameCardProps = {
  name: string;
  category?: string | null;
  imageUrl?: string | null;
  minPlayers?: number | null;
  maxPlayers?: number | null;
  minPlaytime?: number | null;
  maxPlaytime?: number | null;
  onPress?: () => void;
};

export default function GameCard({
  name,
  category,
  imageUrl,
  minPlayers,
  maxPlayers,
  minPlaytime,
  maxPlaytime,
  onPress,
}: GameCardProps) {
  const players =
    minPlayers && maxPlayers
      ? `${minPlayers}-${maxPlayers} players`
      : minPlayers
        ? `${minPlayers}+ players`
        : null;

  const playtime =
    minPlaytime && maxPlaytime
      ? `${minPlaytime}-${maxPlaytime} min`
      : minPlaytime
        ? `${minPlaytime}+ min`
        : null;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
        />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.placeholderText}>
            🎲
          </Text>
        </View>
      )}

      <View style={styles.content}>
        <Text
          style={styles.name}
          numberOfLines={2}
        >
          {name}
        </Text>

        {category && (
          <Text style={styles.category}>
            {category}
          </Text>
        )}

        {players && (
          <Text style={styles.info}>
            👥 {players}
          </Text>
        )}

        {playtime && (
          <Text style={styles.info}>
            ⏱️ {playtime}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    maxWidth: "48%",
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

  info: {
    marginTop: 6,
    fontSize: 12,
    color: colors.textSecondary,
  },
});