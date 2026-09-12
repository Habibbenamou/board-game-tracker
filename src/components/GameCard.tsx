import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import {
  colors,
  radius,
  spacing,
} from "../constants/theme";

type GameCardProps = {
  name: string;
  imageUrl?: string | null;
  category?: string | null;
  players?: string;
  playtime?: string;
  onPress?: () => void;
};

const AnimatedPressable =
  Animated.createAnimatedComponent(Pressable);

export default function GameCard({
  name,
  imageUrl,
  category,
  players,
  playtime,
  onPress,
}: GameCardProps) {
  const pressed = useSharedValue(0);

  const animatedStyle =
    useAnimatedStyle(() => {
      return {
        transform: [
          {
            scale: withSpring(
              pressed.value ? 0.97 : 1,
              {
                damping: 18,
                stiffness: 300,
              }
            ),
          },
        ],
        opacity: withSpring(
          pressed.value ? 0.9 : 1,
          {
            damping: 18,
            stiffness: 300,
          }
        ),
      };
    });

  const content = (
    <>
      {/* Game image */}

      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
        />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Ionicons
            name="dice-outline"
            size={38}
            color={colors.primaryLight}
          />
        </View>
      )}

      {/* Game information */}

      <View style={styles.info}>
        <Text
          style={styles.name}
          numberOfLines={1}
        >
          {name}
        </Text>

        {category ? (
          <Text
            style={styles.category}
            numberOfLines={1}
          >
            {category}
          </Text>
        ) : null}

        {(players || playtime) && (
          <View style={styles.metaRow}>
            {players ? (
              <View style={styles.metaPill}>
                <Ionicons
                  name="people-outline"
                  size={12}
                  color={colors.textSecondary}
                />

                <Text
                  style={styles.meta}
                  numberOfLines={1}
                >
                  {players}
                </Text>
              </View>
            ) : null}

            {playtime ? (
              <View style={styles.metaPill}>
                <Ionicons
                  name="time-outline"
                  size={12}
                  color={colors.textSecondary}
                />

                <Text
                  style={styles.meta}
                  numberOfLines={1}
                >
                  {playtime}
                </Text>
              </View>
            ) : null}
          </View>
        )}

        {/* Small navigation hint */}

        {onPress ? (
          <View style={styles.cardFooter}>
            <Text style={styles.viewText}>
              View details
            </Text>

            <Ionicons
              name="chevron-forward"
              size={15}
              color={colors.textMuted}
            />
          </View>
        ) : null}
      </View>
    </>
  );

  if (onPress) {
    return (
      <AnimatedPressable
        style={[
          styles.container,
          animatedStyle,
        ]}
        onPress={onPress}
        onPressIn={() => {
          pressed.value = 1;
        }}
        onPressOut={() => {
          pressed.value = 0;
        }}
      >
        {content}
      </AnimatedPressable>
    );
  }

  return (
    <View style={styles.container}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "48%",
    overflow: "hidden",
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  image: {
    width: "100%",
    height: 120,
    backgroundColor: colors.surfaceHighlight,
  },

  imagePlaceholder: {
    width: "100%",
    height: 120,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceHighlight,
  },

  info: {
    padding: spacing.md,
  },

  name: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "700",
    color: colors.text,
  },

  category: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textSecondary,
  },

  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: spacing.sm,
  },

  metaPill: {
    minHeight: 24,
    paddingHorizontal: 7,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    maxWidth: "100%",
  },

  meta: {
    flexShrink: 1,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "600",
    color: colors.textSecondary,
  },

  cardFooter: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  viewText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textMuted,
  },
});