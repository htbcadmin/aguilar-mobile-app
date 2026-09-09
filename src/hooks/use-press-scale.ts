import { useCallback } from 'react';
import { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

// Tuned for a snappy, tactile press — noticeable without feeling sluggish.
const SPRING_CONFIG = { damping: 16, stiffness: 380, mass: 0.5 };

/**
 * Shared press-feedback spring (scale down on press-in, spring back on
 * press-out) for interactive surfaces — `Button`, `FilterChip`, `Card`. Pair
 * it with the existing opacity-based `pressed` style rather than replacing
 * it: the spring adds tactile "give", the opacity keeps the affordance
 * visible even where the scale is subtle.
 */
export function usePressScale(pressedScale = 0.96) {
  const scale = useSharedValue(1);

  const onPressIn = useCallback(() => {
    scale.value = withSpring(pressedScale, SPRING_CONFIG);
  }, [pressedScale, scale]);

  const onPressOut = useCallback(() => {
    scale.value = withSpring(1, SPRING_CONFIG);
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return { animatedStyle, onPressIn, onPressOut };
}
