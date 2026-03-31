import { useTheme as useThemeContext } from "../../store/themeStore";

export const useTheme = () => {
  return useThemeContext();
};