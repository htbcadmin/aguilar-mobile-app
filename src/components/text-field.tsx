import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { GlassSurface } from '@/components/glass-surface';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { IconComponent } from '@/types/icon';

export type TextFieldProps = TextInputProps & {
  label: string;
  /** Leading icon (a `lucide-react-native` icon component), e.g. `Search`. */
  icon?: IconComponent;
  /**
   * Translucent Liquid-Glass/blur container instead of the flat
   * `backgroundElement` fill — for a field floating over content (a search
   * bar over a map or photo), never for a field sitting in a form on a flat
   * background: keep those on `'default'`.
   * @default 'default'
   */
  variant?: 'default' | 'glass';
  /**
   * Keeps `label` as the accessible name but doesn't render it visibly —
   * for a floating search field (usually paired with `variant="glass"` and
   * a `placeholder`) where a visible label above the field would sit
   * directly on the content it's floating over, not on the field itself.
   * @default false
   */
  hideLabel?: boolean;
};

const FOCUS_DURATION = 150;

/** Labeled text input for simple forms (e.g. "Crear plan"), styled on theme tokens. */
export function TextField({
  label,
  icon: Icon,
  variant = 'default',
  hideLabel = false,
  style,
  onFocus,
  onBlur,
  ...rest
}: TextFieldProps) {
  const theme = useTheme();
  const focus = useSharedValue(0);

  const animatedBorderStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(focus.value, [0, 1], [theme.border, theme.primary]),
    shadowOpacity: focus.value * 0.3,
  }));

  const handleFocus: TextInputProps['onFocus'] = (event) => {
    focus.value = withTiming(1, { duration: FOCUS_DURATION });
    onFocus?.(event);
  };
  const handleBlur: TextInputProps['onBlur'] = (event) => {
    focus.value = withTiming(0, { duration: FOCUS_DURATION });
    onBlur?.(event);
  };

  const input = (
    <TextInput
      placeholderTextColor={theme.textSecondary}
      accessibilityLabel={label}
      onFocus={handleFocus}
      onBlur={handleBlur}
      style={[styles.input, { color: theme.text }, style]}
      {...rest}
    />
  );

  return (
    <View style={styles.container}>
      {hideLabel ? null : <ThemedText type="smallBold">{label}</ThemedText>}
      {variant === 'glass' ? (
        <GlassSurface radius={Radius.medium} style={styles.field}>
          {Icon ? <Icon size={18} color={theme.textSecondary} strokeWidth={2} /> : null}
          {input}
        </GlassSurface>
      ) : (
        <Animated.View
          style={[
            styles.field,
            styles.defaultBorder,
            { backgroundColor: theme.backgroundElement, shadowColor: theme.primary },
            animatedBorderStyle,
          ]}
        >
          {Icon ? <Icon size={18} color={theme.textSecondary} strokeWidth={2} /> : null}
          {input}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.one,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    minHeight: 44,
    borderRadius: Radius.medium,
    paddingHorizontal: Spacing.three,
  },
  defaultBorder: {
    borderWidth: 1,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
});
