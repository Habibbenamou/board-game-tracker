/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

// import '@/global.css';

// import { Platform } from 'react-native';

// export const Colors = {
//   light: {
//     text: '#000000',
//     background: '#ffffff',
//     backgroundElement: '#F0F0F3',
//     backgroundSelected: '#E0E1E6',
//     textSecondary: '#60646C',
//   },
//   dark: {
//     text: '#ffffff',
//     background: '#000000',
//     backgroundElement: '#212225',
//     backgroundSelected: '#2E3135',
//     textSecondary: '#B0B4BA',
//   },
// } as const;

// export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

// export const Fonts = Platform.select({
//   ios: {
//     /** iOS `UIFontDescriptorSystemDesignDefault` */
//     sans: 'system-ui',
//     /** iOS `UIFontDescriptorSystemDesignSerif` */
//     serif: 'ui-serif',
//     /** iOS `UIFontDescriptorSystemDesignRounded` */
//     rounded: 'ui-rounded',
//     /** iOS `UIFontDescriptorSystemDesignMonospaced` */
//     mono: 'ui-monospace',
//   },
//   default: {
//     sans: 'normal',
//     serif: 'serif',
//     rounded: 'normal',
//     mono: 'monospace',
//   },
//   web: {
//     sans: 'var(--font-display)',
//     serif: 'var(--font-serif)',
//     rounded: 'var(--font-rounded)',
//     mono: 'var(--font-mono)',
//   },
// });

// export const Spacing = {
//   half: 2,
//   one: 4,
//   two: 8,
//   three: 16,
//   four: 24,
//   five: 32,
//   six: 64,
// } as const;

// export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
// export const MaxContentWidth = 800;

export const colors = {
  background: "#F7F5F0",
  surface: "#FFFFFF",
  primary: "#5B3FA3",
  primaryDark: "#432C7A",
  accent: "#E9A23B",

  text: "#1F1F1F",
  textSecondary: "#6B6B6B",
  textMuted: "#999999",

  border: "#E5E2DC",

  success: "#3D8B5F",
  danger: "#C94C4C",

  white: "#FFFFFF",
  black: "#000000",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
  round: 999,
};