import type { ComponentType } from 'react';

// Shared shape of a `lucide-react-native` icon component — every icon module
// exports one of these (see AGENTS.md §0: verified against the installed
// `lucide-react-native` package, not assumed). Import icons directly from
// their own module (e.g. `lucide-react-native/icons/chevron-right`), never
// from the package's barrel export — see AGENTS.md §5 on barrel imports.
export type IconComponent = ComponentType<{
  size?: number;
  color?: string;
  strokeWidth?: number;
}>;
