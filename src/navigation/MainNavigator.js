// ─────────────────────────────────────────────────────────────────────────────
// MainNavigator.js
//
// Navegação principal por tabs (Início, Mapa, Alertas, Perfil).
//
// PONTO CRÍTICO — useCallback nos wrappers de ecrã:
// HomeWithProps e ProfileWithProps são funções que injectam props nos ecrãs.
// Se fossem definidas como funções de seta normais dentro do render:
//
//   const HomeWithProps = () => <HomeScreen userData={userData} />;  ← ERRADO
//
// ...criavam uma NOVA referência a cada render do MainNavigator.
// O React Navigation interpreta isso como um componente diferente e
// REMONTA o ecrã inteiro — causando o layout thrashing e loops de
// measureInWindow no ProfileScreen.
//
// Com useCallback, a referência só muda quando os dados relevantes mudam.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen    from '../screens/HomeScreen';
import MapScreen     from '../screens/MapScreen';
import AlertsScreen  from '../screens/AlertsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator();

const TABS = [
  { name: 'Início',  icon: 'home',          iconOut: 'home-outline'           },
  { name: 'Mapa',    icon: 'map',           iconOut: 'map-outline'            },
  { name: 'Alertas', icon: 'notifications', iconOut: 'notifications-outline', badge: 3 },
  { name: 'Perfil',  icon: 'person',        iconOut: 'person-outline'         },
];

export default function MainNavigator({ userData, onOpenSetup, onThemePress, onEditBtnLayout }) {

  // useCallback garante que a referência do componente só muda quando
  // userData muda — evita remounts desnecessários do HomeScreen
  const HomeWithProps = useCallback(
    () => <HomeScreen userData={userData} />,
    [userData]
  );

  // A referência só muda quando um dos seus dados muda.
  // onOpenSetup, onThemePress e onEditBtnLayout são estáveis porque vêm
  // de useCallback no App.js — esta cadeia de estabilidade é essencial.
  const ProfileWithProps = useCallback(
    () => (
      <ProfileScreen
        userData={userData}
        onOpenSetup={onOpenSetup}
        onThemePress={onThemePress}
        onEditBtnLayout={onEditBtnLayout}
      />
    ),
    [userData, onOpenSetup, onThemePress, onEditBtnLayout]
  );

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => <View style={[StyleSheet.absoluteFill, styles.tabBg]} />,
        tabBarActiveTintColor:   colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      {TABS.map(tab => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={
            tab.name === 'Perfil'  ? ProfileWithProps :
            tab.name === 'Início'  ? HomeWithProps    :
            tab.name === 'Mapa'    ? MapScreen        :
            AlertsScreen
          }
          options={{
            tabBarIcon: ({ focused }) => (
              <View style={styles.iconWrap}>
                <Ionicons
                  name={focused ? tab.icon : tab.iconOut}
                  size={24}
                  color={focused ? colors.primary : colors.textMuted}
                />
                {tab.badge > 0 && !focused && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{tab.badge}</Text>
                  </View>
                )}
              </View>
            ),
            tabBarLabel: ({ focused }) => (
              <Text style={[styles.label, focused && styles.labelActive]}>
                {tab.name}
              </Text>
            ),
          }}
        />
      ))}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    borderTopWidth: 1,
    borderTopColor: 'rgba(45,45,62,0.8)',
    height: Platform.OS === 'ios' ? 88 : 68,
    paddingBottom: Platform.OS === 'ios' ? 28 : 10,
    paddingTop: 10,
    elevation: 0,
    backgroundColor: 'transparent',
  },
  tabBg: {
    backgroundColor: 'rgba(10,10,15,0.96)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(45,45,62,0.8)',
  },
  iconWrap: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute', top: -4, right: -8,
    backgroundColor: colors.secondary,
    borderRadius: 10, minWidth: 18, height: 18,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2, borderColor: colors.bg,
  },
  badgeText: { color: colors.white, fontSize: 9, fontWeight: '800' },
  label: { fontSize: 11, fontWeight: '500', color: colors.textMuted, marginTop: 2 },
  labelActive: { color: colors.primary, fontWeight: '700' },
});