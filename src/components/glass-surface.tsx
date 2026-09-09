import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { BlurView } from 'expo-blur';
import { Platform, StyleSheet, useColorScheme, View, type ViewProps } from 'react-native';

import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type GlassSurfaceProps = ViewProps & {
  /** iOS Liquid Glass style when available. @default 'regular' */
  glassStyle?: 'regular' | 'clear';
  /** Corner radius. @default Radius.large (matches `Card`) */
  radius?: number;
  /**
   * Tints the glass with a theme color (e.g. `theme.primary` for a selected
   * state) instead of the neutral system material. iOS 26+: native
   * `GlassView` tint. Fallback (older iOS / Android): a low-opacity color
   * wash layered under the blur — approximates the same reading.
   */
  tintColor?: string;
};

/**
 * Floating "chrome" surface for toolbars, floating headers and filter bars
 * — NOT for content cards. Apple's HIG reserves Liquid Glass for the
 * navigation/control layer that floats above content; using it on content
 * surfaces hurts legibility, so regular screen content keeps using `Card`'s
 * flat `backgroundElement` fill instead of this component.
 *
 * - **iOS 26+**: real Liquid Glass, via `expo-glass-effect`'s `GlassView`
 *   (`UIVisualEffectView`-backed).
 * - **iOS <26**: native blur via `expo-blur`, matching the translucent
 *   toolbar material iOS has used since iOS 7.
 * - **Android**: `expo-blur`'s documented Android behavior — a semi-
 *   transparent tinted surface, not a real-time blur (there is no Android
 *   equivalent of `UIVisualEffectView`). That's not a shortcoming here: it
 *   matches Material 3's own bottom-nav/toolbar surfaces, which use a flat
 *   tonal-elevation color rather than blur — so the result still reads as
 *   platform-correct chrome rather than a faked-up glass effect.
 */
export function GlassSurface({
  glassStyle = 'regular',
  radius,
  tintColor,
  style,
  children,
  ...rest
}: GlassSurfaceProps) {
  const theme = useTheme();
  const isDark = useColorScheme() === 'dark';
  const borderRadius = radius ?? Radius.large;

  if (Platform.OS === 'ios' && isLiquidGlassAvailable()) {
    return (
      <GlassView
        glassEffectStyle={glassStyle}
        colorScheme={isDark ? 'dark' : 'light'}
        tintColor={tintColor}
        style={[{ borderRadius }, style]}
        {...rest}
      >
        {children}
      </GlassView>
    );
  }

  return (
    <BlurView
      tint={isDark ? 'systemChromeMaterialDark' : 'systemChromeMaterialLight'}
      intensity={80}
      style={[styles.fallback, { borderRadius, borderColor: theme.border }, style]}
      {...rest}
    >
      {tintColor ? (
        <View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { backgroundColor: tintColor, opacity: 0.18 }]}
        />
      ) : null}
      {children}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  fallback: {
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
  },
});
