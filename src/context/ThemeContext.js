import React, { createContext, useContext, useState } from 'react';
import { darkColors, lightColors } from '../theme/colors';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark');

  const toggleTheme = (newTheme) => setTheme(newTheme);

  const themeColors = theme === 'dark' ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, themeColors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  // Fallback seguro: se usado fora do provider, retorna dark
  if (!ctx) return { theme: 'dark', toggleTheme: () => {}, themeColors: darkColors };
  return ctx;
}