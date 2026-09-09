import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { type BadgeVariant } from '@/components/badge';
import { GlassSurface } from '@/components/glass-surface';
import { ThemedText } from '@/components/themed-text';
import { MinTouchTarget, Radius, Spacing, ThemeColor } from '@/constants/theme';
import { usePressScale } from '@/hooks/use-press-scale';
import { useTheme } from '@/hooks/use-theme';
import type { IconComponent } from '@/types/icon';

export type FilterChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  /** Badge variant applied when selected (unselected always renders neutral). */
  variant?: BadgeVariant;
  /** E.g. an already-taken time slot — not selectable, no pressed feedback. */
  disabled?: boolean;
  /**
   * Overrides the default `Filtrar por ${label}` reading — e.g. for a
   * view-switcher ("Ver como mapa") rather than an actual filter.
   */
  accessibilityLabel?: string;
  /** Optional leading icon (a `lucide-react-native` icon component). */
  icon?: IconComponent;
};

const COLOR_BY_VARIANT: Record<BadgeVariant, ThemeColor> = {
  neutral: 'textSecondary',
  primary: 'primary',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
};

/**
 * Tappable pill for filter rows (category, type…) and view switchers — this
 * IS the "tabs" segment of the design system. Selected reads as a tinted
 * Liquid-Glass/blur pill (chrome that floats above the row, not a content
 * fill) with a small spring "pop" on selection; unselected stays a flat
 * neutral pill matching `Badge`.
 */
export function FilterChip({
  label,
  selected,
  onPress,
  variant = 'primary',
  disabled = false,
  accessibilityLabel,
  icon: Icon,
}: FilterChipProps) {
  const theme = useTheme();
  const tintColor = theme[COLOR_BY_VARIANT[variant]];
  const { animatedStyle: pressStyle, onPressIn, onPressOut } = usePressScale(0.93);

  // Bouncy pop when a chip becomes selected — a lightweight "fun" cue that
  // distinguishes a freshly-tapped filter from one that was already active.
  const selectedScale = useSharedValue(selected ? 1 : 0.94);
  useEffect(() => {
    selectedScale.value = withSpring(selected ? 1 : 0.94, { damping: 14, stiffness: 260 });
  }, [selected, selectedScale]);
  const selectedStyle = useAnimatedStyle(() => ({ transform: [{ scale: selectedScale.value }] }));

  return (
    <Animated.View style={pressStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={disabled ? undefined : onPressIn}
        onPressOut={disabled ? undefined : onPressOut}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityState={{ selected, disabled }}
        accessibilityLabel={accessibilityLabel ?? `Filtrar por ${label}`}
        style={[styles.pressable, disabled && styles.disabled]}
      >
        {selected ? (
          <Animated.View style={selectedStyle}>
            <GlassSurface
              glassStyle="clear"
              tintColor={tintColor}
              radius={Radius.pill}
              style={styles.pill}
            >
              {Icon ? <Icon size={14} color={tintColor} strokeWidth={2.4} /> : null}
              <ThemedText type="small" style={[styles.label, { color: tintColor }]}>
                {label}
              </ThemedText>
            </GlassSurface>
          </Animated.View>
        ) : (
          <View
            style={[styles.pill, styles.neutralPill, { backgroundColor: theme.backgroundElement }]}
          >
            {Icon ? <Icon size={14} color={theme.textSecondary} strokeWidth={2.2} /> : null}
            <ThemedText type="small" themeColor="textSecondary">
              {label}
            </ThemedText>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pressable: {
    minHeight: MinTouchTarget,
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.4,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.one,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
  },
  neutralPill: {
    borderRadius: Radius.pill,
  },
  label: {
    fontWeight: '700',
  },
});
