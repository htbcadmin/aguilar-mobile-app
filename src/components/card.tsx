import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type ViewProps } from 'react-native';
import Animated from 'react-native-reanimated';

import { MinTouchTarget, Radius, Spacing } from '@/constants/theme';
import { usePressScale } from '@/hooks/use-press-scale';
import { useTheme } from '@/hooks/use-theme';

export type CardProps = ViewProps & {
  /** When passed, the whole Card becomes pressable (accessible as a button). */
  onPress?: () => void;
  accessibilityLabel?: string;
};

export function Card({ style, onPress, accessibilityLabel, children, ...rest }: CardProps) {
  const theme = useTheme();
  const content = (
    <View style={[styles.card, { backgroundColor: theme.backgroundElement }, style]} {...rest}>
      {children}
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <AnimatedCardPressable onPress={onPress} accessibilityLabel={accessibilityLabel}>
      {content}
    </AnimatedCardPressable>
  );
}

/** Isolates the press-scale hook so plain `Card`s (no `onPress`) skip it entirely. */
function AnimatedCardPressable({
  onPress,
  accessibilityLabel,
  children,
}: {
  onPress: () => void;
  accessibilityLabel?: string;
  children: ReactNode;
}) {
  const { animatedStyle, onPressIn, onPressOut } = usePressScale(0.98);

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={({ pressed }) => [styles.pressableMinSize, pressed && styles.pressed]}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.large,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  pressableMinSize: {
    minHeight: MinTouchTarget,
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});
