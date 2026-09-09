import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { useTheme } from '@/hooks/use-theme';

// Native tab bar: on iOS this is the real `UITabBarController`, so on iOS 26+
// it renders Apple's Liquid Glass chrome automatically (no manual
// GlassView/BlurView needed) and gets the native minimize-on-scroll gesture
// for free. On Android it renders the real Material 3 `BottomNavigationView`
// — the platform-correct equivalent, not an imitation. `expo-router/unstable-
// native-tabs` is Expo's own "unstable-" prefixed API (may still change in a
// minor release), verified against the SDK 57 types actually installed here.
export default function TabsLayout() {
  const colors = useTheme();

  return (
    <NativeTabs
      tintColor={colors.primary}
      iconColor={{ default: colors.textSecondary, selected: colors.primary }}
      indicatorColor={colors.backgroundSelected}
      minimizeBehavior="onScrollDown"
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon sf="newspaper" md="article" />
        <NativeTabs.Trigger.Label>Tablón</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="incidents">
        <NativeTabs.Trigger.Icon sf="map" md="map" />
        <NativeTabs.Trigger.Label>Incidencias</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="bookings">
        <NativeTabs.Trigger.Icon sf="sportscourt" md="sports_tennis" />
        <NativeTabs.Trigger.Label>Reservas</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="community">
        <NativeTabs.Trigger.Icon sf="person.3" md="groups" />
        <NativeTabs.Trigger.Label>Comunidad</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="business">
        <NativeTabs.Trigger.Icon sf="storefront" md="storefront" />
        <NativeTabs.Trigger.Label>Comercio</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="appointments">
        <NativeTabs.Trigger.Icon sf="calendar" md="event" />
        <NativeTabs.Trigger.Label>Citas</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="more">
        <NativeTabs.Trigger.Icon sf="ellipsis" md="more_horiz" />
        <NativeTabs.Trigger.Label>Más</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
