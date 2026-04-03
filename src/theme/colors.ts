// Theme Colors - Light and Dark modes
export const lightTheme = {
  background: "#f5f5f5",
  surface: "#fff",
  surfaceSecondary: "#f9f9f9",
  text: "#333",
  textSecondary: "#666",
  textTertiary: "#999",
  border: "#ddd",
  borderLight: "#eee",
  borderLighter: "#f0f0f0",
  success: "#4caf50",
  warning: "#ff9800",
  error: "#f44336",
  primary: "#ff6b00",
  disabled: "#e0e0e0",
};

export const darkTheme = {
  background: "#1a1a1a",
  surface: "#2a2a2a",
  surfaceSecondary: "#333333",
  text: "#ffffff",
  textSecondary: "#cccccc",
  textTertiary: "#999999",
  border: "#444444",
  borderLight: "#3a3a3a",
  borderLighter: "#2f2f2f",
  success: "#4caf50",
  warning: "#ff9800",
  error: "#f44336",
  primary: "#ff6b00",
  disabled: "#555555",
};

export type Theme = typeof lightTheme;
