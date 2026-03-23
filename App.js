import 'react-native-gesture-handler';
import React, { useState, useCallback, createRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, StyleSheet } from 'react-native';

import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import OnboardingScreen       from './src/screens/onboarding/OnboardingScreen';
import WelcomeAnimationScreen from './src/screens/onboarding/WelcomeAnimationScreen';
import ProfileCoachOverlay    from './src/screens/onboarding/ProfileCoachOverlay';
import EditButtonCoach        from './src/screens/onboarding/EditButtonCoach';
import ProfileSetupScreen     from './src/screens/onboarding/ProfileSetupScreen';
import ThemeSwitcherModal     from './src/components/ThemeSwitcherModal';
import MainNavigator          from './src/navigation/MainNavigator';

// Ref global de navegação — permite navegar programaticamente a partir do App.js
export const navigationRef = createRef();

function AppContent() {
  const { theme, themeColors } = useTheme();

  // ─── DEV: atalho de desenvolvimento ─────────────────────────────────────────
  // Muda DEV_SKIP para true para saltares o onboarding durante os testes.
  // Lembra-te de voltar para false antes de mostrar a app a alguém.
  const DEV_SKIP = false;

  const DEV_USER = {
    name:        'Teste',
    avatar:      '💩',
    bio:         'Utilizador de teste para desenvolvimento',
    city:        'Porto',
    birthYear:   '2000',
    instagram:   '@insta_teste',
    website:     '',
    interests:   ['music', 'art', 'dance'],
    schedule:    'night',
    exploration: 'explorer',
  };
  // ─────────────────────────────────────────────────────────────────────────────

  const [phase,           setPhase          ] = useState(DEV_SKIP ? 'main' : 'onboarding');
  const [coachPhase,      setCoachPhase     ] = useState(null);
  const [showSetup,       setShowSetup      ] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [userData,        setUserData       ] = useState(DEV_SKIP ? DEV_USER : null);
  const [editBtnLayout,   setEditBtnLayout  ] = useState(null);

  // ─────────────────────────────────────────────────────────────────────────────
  // TODAS AS CALLBACKS SÃO ESTABILIZADAS COM useCallback.
  //
  // Este é o ponto crítico para evitar o layout thrashing (bug 1 e 2).
  //
  // Porquê: estas funções são passadas como props ao MainNavigator, que as
  // passa ao ProfileWithProps / HomeWithProps. Se as funções tivessem novas
  // referências a cada render, o React Navigation detectaria um novo componente
  // e remontaria o ecrã inteiro — causando loops de measureInWindow e jitter.
  //
  // Com useCallback e deps vazias (ou mínimas), as referências são estáveis
  // e os ecrãs nunca remontam desnecessariamente.
  // ─────────────────────────────────────────────────────────────────────────────

  const handleOnboardingDone = useCallback((data) => {
    setUserData(data);
    setPhase('welcome');
  }, []); // setUserData e setPhase são estáveis (vêm de useState)

  const handleWelcomeDone = useCallback(() => {
    setPhase('main');
    setCoachPhase('tab');
  }, []);

  const handleProfileTabPressed = useCallback(() => {
    navigationRef.current?.navigate('Perfil');
    // Aguarda a renderização do ProfileScreen antes de mostrar o EditButtonCoach
    setTimeout(() => setCoachPhase('edit'), 350);
  }, []);

  const handleOpenSetup = useCallback(() => {
    setCoachPhase(null);
    setShowSetup(true);
  }, []);

  const handleSetupDone = useCallback((data) => {
    if (data) setUserData(data);
    setShowSetup(false);
  }, []);

  const handleThemePress = useCallback(() => {
    setShowThemePicker(true);
  }, []);

  const handleThemeClose = useCallback(() => {
    setShowThemePicker(false);
  }, []);

  // Esta callback é passada ao ProfileScreen para medir a posição do botão Editar.
  // É estável (useCallback + deps vazias) para não causar re-renders em cascata.
  const handleEditBtnLayout = useCallback((layout) => {
    setEditBtnLayout(layout);
  }, []);

  const navTheme = {
    dark: theme === 'dark',
    colors: {
      primary:      themeColors.primary,
      background:   themeColors.bg,
      card:         themeColors.bgCard,
      text:         themeColors.textPrimary,
      border:       themeColors.border,
      notification: themeColors.secondary,
    },
  };

  /* ── PRÉ-APP ─────────────────────────────────────────────── */
  if (phase === 'onboarding') {
    return (
      <>
        <StatusBar style="light" />
        <OnboardingScreen onComplete={handleOnboardingDone} />
      </>
    );
  }

  if (phase === 'welcome') {
    return (
      <>
        <StatusBar style="light" />
        <WelcomeAnimationScreen userData={userData} onContinue={handleWelcomeDone} />
      </>
    );
  }

  /* ── APP PRINCIPAL ───────────────────────────────────────── */
  return (
    <View style={[styles.root, { backgroundColor: themeColors.bg }]}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />

      <NavigationContainer theme={navTheme} ref={navigationRef}>
        <MainNavigator
          userData={userData}
          onOpenSetup={handleOpenSetup}
          onThemePress={handleThemePress}
          onEditBtnLayout={handleEditBtnLayout}
        />
      </NavigationContainer>

      {coachPhase === 'tab' && (
        <ProfileCoachOverlay onProfileTabPressed={handleProfileTabPressed} />
      )}
      {coachPhase === 'edit' && (
        <EditButtonCoach onEditPressed={handleOpenSetup} btnLayout={editBtnLayout} />
      )}
      {showSetup && (
        <ProfileSetupScreen userData={userData} onComplete={handleSetupDone} />
      )}
      <ThemeSwitcherModal visible={showThemePicker} onClose={handleThemeClose} />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});