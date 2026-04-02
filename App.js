import React from "react";
import { NavigationContainer } from "@react-navigation/native"; // Adiciona esta linha
import AppProviders from "./src/app/AppProviders";
import RootNavigator from "./src/navigation/RootNavigator";

export default function App() {
  return (
    <AppProviders>
      <NavigationContainer> 
        <RootNavigator />
      </NavigationContainer>
    </AppProviders>
  );
}