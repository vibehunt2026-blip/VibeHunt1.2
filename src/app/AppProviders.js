import React from "react";
import { UserProvider } from "../store/userStore";
import { ThemeProvider } from "../store/themeStore";

export default function AppProviders({ children }) {
  return (
    <UserProvider>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </UserProvider>
  );
}