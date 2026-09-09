import Inbox from 'lucide-react-native/icons/inbox';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { Button } from '@/components/button';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { IconComponent } from '@/types/icon';

export type EmptyStateProps = ViewProps & {
  /** Preferred over `emoji` for new call sites — a `lucide-react-native` icon component. */
  icon?: IconComponent;
  /** @deprecated Pass `icon` (a Lucide icon component) instead — kept for existing call sites. */
  emoji?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

/**
 * Reusable empty state for a module's lists/screens (e.g. "No businesses
 * joined yet"). Not a full screen like `PlaceholderScreen` — it's embedded
 * within a real screen's content.
 */
export function EmptyState({
  icon: Icon,
  emoji,
  title,
  description,
  actionLabel,
  onAction,
  style,
  ...rest
}: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, style]} {...rest}>
      {emoji && !Icon ? (
        <ThemedText style={styles.emoji}>{emoji}</ThemedText>
      ) : (
        <View style={[styles.iconWell, { backgroundColor: theme.backgroundElement }]}>
          {Icon ? (
            <Icon size={26} color={theme.textSecondary} strokeWidth={1.75} />
          ) : (
            <Inbox size={26} color={theme.textSecondary} strokeWidth={1.75} />
          )}
        </View>
      )}
      <ThemedText type="smallBold" style={styles.title}>
        {title}
      </ThemedText>
      {description ? (
        <ThemedText type="small" themeColor="textSecondary" style={styles.description}>
          {description}
        </ThemedText>
      ) : null}
      {actionLabel && onAction ? (
        <Button title={actionLabel} variant="secondary" onPress={onAction} style={styles.action} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.five,
    paddingHorizontal: Spacing.four,
  },
  emoji: {
    fontSize: 36,
    marginBottom: Spacing.one,
  },
  iconWell: {
    width: 64,
    height: 64,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.one,
  },
  title: {
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
  },
  action: {
    marginTop: Spacing.three,
  },
});
