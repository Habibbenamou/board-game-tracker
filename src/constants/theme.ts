export const colors = {
  // Main surfaces
  background: "#0B0D12",
  surface: "#151821",
  surfaceElevated: "#1C202B",
  surfaceHighlight: "#232837",

  // Brand
  primary: "#8B5CF6",
  primaryLight: "#A78BFA",
  primaryDark: "#6D28D9",

  // Secondary accent
  secondary: "#22D3EE",

  // Semantic colors
  success: "#22C55E",
  warning: "#F59E0B",
  danger: "#EF4444",

  // Text
  text: "#F8FAFC",
  textSecondary: "#94A3B8",
  textMuted: "#64748B",

  // Borders
  border: "#252A36",
  borderLight: "#303646",

  // Common
  white: "#FFFFFF",
  black: "#000000",
  transparent: "transparent",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 40,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  xxl: 28,
  full: 999,
};

export const typography = {
  display: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "800" as const,
  },

  h1: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800" as const,
  },

  h2: {
    fontSize: 21,
    lineHeight: 27,
    fontWeight: "700" as const,
  },

  h3: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "700" as const,
  },

  body: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "400" as const,
  },

  bodyMedium: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "500" as const,
  },

  bodyBold: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "700" as const,
  },

  caption: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "500" as const,
  },

  small: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "600" as const,
  },
};

export const shadows = {
  card: {
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  },

  elevated: {
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 18,
    elevation: 8,
  },
};