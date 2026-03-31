// src/navigation/RootNavigator.js
import React from "react";
import MainTabs from "./MainTabs";
import OnboardingScreen from "../features/onboarding/screens/OnboardingScreen.js";
import { useUser } from "../shared/hooks/useUser";

export default function RootNavigator() {
  const { user, setUser } = useUser(); // Supondo que o seu hook também exporte setUser

  const handleOnboardingComplete = (userData) => {
    // 1. Aqui você salva os dados no seu Store global
    if (setUser) {
      setUser(userData); 
    }
    // Ao atualizar o 'user', o componente fará re-render 
    // e passará automaticamente para o <MainTabs />
  };

  if (!user) {
    // AGORA PASSAMOS A FUNÇÃO:
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  return <MainTabs />;
}