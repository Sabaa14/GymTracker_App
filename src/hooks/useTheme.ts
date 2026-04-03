// useTheme Hook - Get current theme based on darkMode setting
import { useMemo } from "react";
import { useSettings } from "./useState";
import { lightTheme, darkTheme, type Theme } from "../theme/colors";

export const useTheme = (): Theme => {
  const { settings } = useSettings();

  const theme = useMemo(() => {
    return settings.darkMode ? darkTheme : lightTheme;
  }, [settings.darkMode]);

  return theme;
};
