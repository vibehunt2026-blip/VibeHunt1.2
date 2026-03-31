// App.js — com autenticação Supabase integrada
//
// Fluxo:
//   loading  → spinner enquanto a sessão carrega
//   auth     → AuthScreen se não há sessão
//   onboarding → OnboardingScreen para utilizadores novos (sem nome no perfil)
//   welcome  → WelcomeAnimationScreen após onboarding
//   main     → MainNavigator (app completa)
//
// Sempre que o utilizador completa o onboarding ou edita o perfil,
// os dados são guardados no Supabase via upsertProfile().

import 'react-native-gesture-handler';
import React, { useState, useCallback, createRef, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, StyleSheet, ActivityIndicator } from 'react-native';

import { ThemeProvider, useTheme }         from './src/context/ThemeContext';
import { AuthProvider, useAuth }           from './src/context/AuthContext';
import { getProfile, upsertProfile, normalizeProfile } from './src/services/ProfileService';

import AuthScreen             from './src/screens/auth/AuthScreen';
import OnboardingScreen       from './src/screens/onboarding/OnboardingScreen';
import WelcomeAnimationScreen from './src/screens/onboarding/WelcomeAnimationScreen';
import ProfileCoachOverlay    from './src/screens/onboarding/ProfileCoachOverlay';
import EditButtonCoach        from './src/screens/onboarding/EditButtonCoach';
import ProfileSetupScreen     from './src/screens/onboarding/ProfileSetupScreen';
import ThemeSwitcherModal     from './src/components/ThemeSwitcherModal';
import MainNavigator          from './src/navigation/MainNavigator';

export const navigationRef = createRef();

// ─── Ecrã de loading ──────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0F', alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" color="#8B5CF6" />
    </View>
  );
}

// ─── Conteúdo principal (precisa do AuthContext e do ThemeContext) ─────────────
function AppContent() {
  const { theme, themeColors }           = useTheme();
  const { session, loading: authLoading } = useAuth();

  const [phase,           setPhase]           = useState('loading');
  const [userData,        setUserData]         = useState(null);
  const [coachPhase,      setCoachPhase]       = useState(null);
  const [showSetup,       setShowSetup]        = useState(false);
  const [showThemePicker, setShowThemePicker]  = useState(false);
  const [editBtnLayout,   setEditBtnLayout]    = useState(null);

  // ── Decide a fase consoante a sessão ─────────────────────────────────────────
  useEffect(() => {
    if (authLoading) return; // ainda a carregar AsyncStorage

    if (!session) {
      setPhase('auth');
      return;
    }

    // Utilizador autenticado → carrega o perfil
    loadUserProfile(session.user.id);
  }, [session, authLoading]);

  const loadUserProfile = async (userId) => {
    try {
      const raw       = await getProfile(userId);
      const profile   = normalizeProfile(raw);
      setUserData(profile);

      // Sem nome → utilizador novo, passa pelo onboarding
      if (!profile.name) {
        setPhase('onboarding');
      } else {
        setPhase('main');
      }
    } catch {
      // Perfil ainda não existe (trigger pode demorar ms) → onboarding
      setPhase('onboarding');
    }
  };

  // ── Callbacks estáveis (useCallback evita remounts no Navigator) ─────────────

  const handleOnboardingDone = useCallback(async (data) => {
    setUserData(data);
    if (session?.user?.id) {
      try { await upsertProfile(session.user.id, data); }
      catch (err) { console.warn('upsertProfile (onboarding):', err.message); }
    }
    setPhase('welcome');
  }, [session]);

  const handleWelcomeDone = useCallback(() => {
    setPhase('main');
    setCoachPhase('tab');
  }, []);

  const handleProfileTabPressed = useCallback(() => {
    navigationRef.current?.navigate('Perfil');
    setTimeout(() => setCoachPhase('edit'), 350);
  }, []);

  const handleOpenSetup = useCallback(() => {
    setCoachPhase(null);
    setShowSetup(true);
  }, []);

  const handleSetupDone = useCallback(async (data) => {
    if (data) {
      setUserData(data);
      if (session?.user?.id) {
        try { await upsertProfile(session.user.id, data); }
        catch (err) { console.warn('upsertProfile (setup):', err.message); }
      }
    }
    setShowSetup(false);
  }, [session]);

  const handleThemePress = useCallback(() => setShowThemePicker(true),  []);
  const handleThemeClose = useCallback(() => setShowThemePicker(false), []);
  const handleEditBtnLayout = useCallback((layout) => setEditBtnLayout(layout), []);

  // handleSignOut é passado ao ProfileScreen para o botão "Terminar sessão"
  const { signOut } = useAuth();
  const handleSignOut = useCallback(async () => {
    await signOut();
    // O onAuthStateChange do AuthContext coloca session=null → useEffect → phase='auth'
  }, [signOut]);

  // ── Tema do NavigationContainer ───────────────────────────────────────────────
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

  // ── Renderização por fase ─────────────────────────────────────────────────────
  if (authLoading || phase === 'loading') return <LoadingScreen />;

  if (phase === 'auth') return (
    <>
      <StatusBar style="light" />
      <AuthScreen />
    </>
  );

  if (phase === 'onboarding') return (
    <>
      <StatusBar style="light" />
      <OnboardingScreen onComplete={handleOnboardingDone} />
    </>
  );

  if (phase === 'welcome') return (
    <>
      <StatusBar style="light" />
      <WelcomeAnimationScreen userData={userData} onContinue={handleWelcomeDone} />
    </>
  );

  // ── App principal ─────────────────────────────────────────────────────────────
  return (
    <View style={[s.root, { backgroundColor: themeColors.bg }]}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />

      <NavigationContainer theme={navTheme} ref={navigationRef}>
        <MainNavigator
          userData={userData}
          onOpenSetup={handleOpenSetup}
          onThemePress={handleThemePress}
          onEditBtnLayout={handleEditBtnLayout}
          onSignOut={handleSignOut}
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

// ─── Entry point ──────────────────────────────────────────────────────────────
export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const s = StyleSheet.create({ root: { flex: 1 } });