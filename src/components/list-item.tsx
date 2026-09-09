import type { ReactNode } from 'react';
import ChevronRight from 'lucide-react-native/icons/chevron-right';
import {
  Pressable,
  StyleSheet,
  View,
  type AccessibilityRole,
  type AccessibilityState,
  type ViewProps,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { MinTouchTarget, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ListItemProps = ViewProps & {
  title: string;
  subtitle?: string;
  /** Leading slot: an `Avatar`, an emoji in `ThemedText`, an icon… */
  leading?: ReactNode;
  /** Defaults to a chevron when there's an `onPress`; pass `null` to remove it. */
  trailing?: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
  /**
   * Semantic role of the `Pressable` when there's an `onPress`. Defaults to
   * "button" (an action); pass "link" when the row navigates (e.g. nested
   * inside a `<Link asChild>`) so web keeps real link semantics.
   */
  accessibilityRole?: AccessibilityRole;
  /** E.g. `{ expanded: true }` when this row toggles nested content. */
  accessibilityState?: AccessibilityState;
};

/** Generic list row: icon/avatar + title/subtitle + accessory. */
export function ListItem({
  title,
  subtitle,
  leading,
  trailing,
  onPress,
  accessibilityLabel,
  accessibilityRole = 'button',
  accessibilityState,
  style,
  ...rest
}: ListItemProps) {
  const theme = useTheme();

  const trailingContent =
    trailing !== undefined ? (
      trailing
    ) : onPress ? (
      <ChevronRight size={18} color={theme.textSecondary} strokeWidth={2.25} />
    ) : null;

  const content = (
    <View style={[styles.container, { backgroundColor: theme.backgroundElement }, style]} {...rest}>
      {leading ? <View style={styles.leading}>{leading}</View> : null}
      <View style={styles.texts}>
        <ThemedText type="default" numberOfLines={1}>
          {title}
        </ThemedText>
        {subtitle ? (
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
      {trailingContent}
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={accessibilityState}
      style={({ pressed }) => pressed && styles.pressed}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: MinTouchTarget,
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.large,
  },
  leading: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: {
    flex: 1,
    gap: Spacing.half,
  },
  pressed: {
    opacity: 0.7,
  },
});
