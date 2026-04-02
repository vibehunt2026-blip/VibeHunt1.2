// ─────────────────────────────────────────────────────────────────────────────
// src/navigation/RootNavigator.js
//
// Navegador raiz — decide se mostra o Onboarding ou as Tabs principais.
//
// Lógica:
//   - Se user === null (store inicial) → mostra OnboardingScreen
//   - Após onComplete(), setUser() actualiza o store → re-render automático
//   - O utilizador vê as Tabs sem necessidade de navegação manual
//
// CORRECÇÕES APLICADAS:
//   - Confirmado que useUser() expõe { user, setUser, resetUser }
//   - Adicionado onSignOut ligado ao resetUser() do store
//   - Removido comentário ambíguo "Supondo que..."
// ─────────────────────────────────────────────────────────────────────────────

import React, { useCallback } from 'react';
import MainTabs          from './MainTabs';
import OnboardingScreen  from '../features/onboarding/screens/OnboardingScreen';
import { useUser }       from '../shared/hooks/useUser';

export default function RootNavigator() {
  // useUser() retorna { user, setUser, resetUser, … } — ver src/store/userStore.js
  const { user, setUser, resetUser } = useUser();

  // ── Callback chamado pelo OnboardingScreen ao terminar ────────────────────
  // Usa useCallback para estabilidade de referência (evita re-renders desnecessários
  // se RootNavigator for filho de algo que re-renderiza frequentemente).
  const handleOnboardingComplete = useCallback((userData) => {
    // Guarda os dados do onboarding no store global.
    // Isto provoca um re-render do RootNavigator que passa a mostrar MainTabs.
    setUser({
      name:        userData.name        || 'Caçador',
      interests:   userData.interests   || [],
      schedule:    userData.schedule    || '',
      exploration: userData.exploration || '',
      xp:          50,   // XP inicial por completar o onboarding
      level:       1,
      savedEvents:    [],
      checkedInEvents: [],
      createdAt: new Date(),
    });
  }, [setUser]);

  // ── Callback de logout ────────────────────────────────────────────────────
  // Limpa o store → user volta a null → RootNavigator mostra OnboardingScreen
  const handleSignOut = useCallback(() => {
    resetUser();
  }, [resetUser]);

  // ── Render condicional ────────────────────────────────────────────────────
  if (!user) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  return (
    <MainTabs
      userData={user}
      onSignOut={handleSignOut}
      // onOpenSetup e onThemePress são geridos internamente pelas Tabs
      // e não precisam de ser propagados a partir daqui
    />
  );
}