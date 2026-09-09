import type { ReactNode } from 'react';
import MapPin from 'lucide-react-native/icons/map-pin';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const GRID_LINES = [0.25, 0.5, 0.75] as const;

export type MapBackgroundProps = ViewProps & {
  /** Overlaid content (markers, pins…) once there's real data. */
  children?: ReactNode;
  accessibilityLabel?: string;
};

/**
 * Basic, purely visual map background — no real geographic data. Meant as a
 * reusable base for Incidents (HAS-8) and, if applicable, Bus/routes
 * (HAS-15) while there's no map library integrated; once there is, that
 * module can swap the background without touching the rest of its screen's
 * layout.
 */
export function MapBackground({
  children,
  accessibilityLabel = 'Vista de mapa',
  style,
  ...rest
}: MapBackgroundProps) {
  const theme = useTheme();

  return (
    <View
      style={[styles.container, { backgroundColor: theme.backgroundElement }, style]}
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      {...rest}
    >
      {GRID_LINES.map((position) => (
        <View
          key={`h-${position}`}
          style={[
            styles.gridLineHorizontal,
            { top: `${position * 100}%`, backgroundColor: theme.border },
          ]}
        />
      ))}
      {GRID_LINES.map((position) => (
        <View
          key={`v-${position}`}
          style={[
            styles.gridLineVertical,
            { left: `${position * 100}%`, backgroundColor: theme.border },
          ]}
        />
      ))}
      <View style={[StyleSheet.absoluteFill, styles.pin]} pointerEvents="none">
        <MapPin
          size={30}
          color={theme.primary}
          strokeWidth={2}
          fill={theme.primary}
          fillOpacity={0.15}
        />
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    aspectRatio: 16 / 9,
    borderRadius: Radius.large,
    overflow: 'hidden',
  },
  gridLineHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
  },
  gridLineVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: StyleSheet.hairlineWidth,
  },
  pin: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
