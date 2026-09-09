import {
  ActivityIndicator,
  Pressable,
  View,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated from 'react-native-reanimated';

import { GlassSurface } from '@/components/glass-surface';
import { ThemedText } from '@/components/themed-text';
import { MinTouchTarget, Radius, Spacing, ThemeColor } from '@/constants/theme';
import { usePressScale } from '@/hooks/use-press-scale';
import { useTheme } from '@/hooks/use-theme';
import type { IconComponent } from '@/types/icon';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'glass';

export type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  title: string;
  variant?: ButtonVariant;
  /** Loading state: disables the button and shows a spinner instead of the text. */
  loading?: boolean;
  /** Leading icon (a `lucide-react-native` icon component) — decorative; `title` still carries the label. */
  icon?: IconComponent;
  /** External layout style (e.g. `marginTop`) — applied on top of the variant. */
  style?: StyleProp<ViewStyle>;
};

const TEXT_COLOR_BY_VARIANT: Record<ButtonVariant, ThemeColor> = {
  primary: 'background',
  secondary: 'text',
  ghost: 'primary',
  // `glass` reads as a translucent, primary-tinted control (like `ghost`)
  // rather than a solid fill — Liquid Glass supplies the surface already.
  glass: 'primary',
};

export function Button({
  title,
  variant = 'primary',
  loading = false,
  icon: Icon,
  disabled,
  style,
  onPressIn,
  onPressOut,
  ...rest
}: ButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;
  const textColor = theme[TEXT_COLOR_BY_VARIANT[variant]];
  const { animatedStyle, onPressIn: scaleIn, onPressOut: scaleOut } = usePressScale();

  const content = (
    <>
      {Icon ? <Icon size={18} color={textColor} strokeWidth={2.25} /> : null}
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <ThemedText type="smallBold" style={{ color: textColor }}>
          {title}
        </ThemedText>
      )}
    </>
  );

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        disabled={isDisabled}
        onPressIn={(event) => {
          scaleIn();
          onPressIn?.(event);
        }}
        onPressOut={(event) => {
          scaleOut();
          onPressOut?.(event);
        }}
        style={({ pressed }) => [
          pressed && !isDisabled && styles.pressed,
          isDisabled && styles.disabled,
        ]}
        {...rest}
      >
        {variant === 'glass' ? (
          <GlassSurface glassStyle="clear" radius={Radius.pill} style={[styles.base, style]}>
            {content}
          </GlassSurface>
        ) : (
          <View
            style={[
              styles.base,
              variant === 'primary' && { backgroundColor: theme.primary },
              variant === 'secondary' && { backgroundColor: theme.backgroundElement },
              variant === 'ghost' && styles.ghost,
              style,
            ]}
          >
            {content}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    minHeight: MinTouchTarget,
    minWidth: MinTouchTarget,
    borderRadius: Radius.medium,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.5,
  },
});
