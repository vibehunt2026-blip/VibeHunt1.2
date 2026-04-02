// ─────────────────────────────────────────────────────────────────────────────
// src/navigation/MainTabs.js
//
// Navegação principal por tabs (Início, Mapa, Alertas, Perfil).
//
// NOTA IMPORTANTE — useCallback nos wrappers de ecrã:
//   HomeWithProps e ProfileWithProps são funções passadas como componentes
//   ao React Navigation. Se fossem definidas como arrow functions dentro
//   do render, cada re-render criaria uma nova referência → React Navigation
//   interpretaria isso como um componente diferente e remontaria o ecrã
//   inteiro, causando layout thrashing.
//   Com useCallback, a referência só muda quando as deps mudam.
//
// CORRECÇÕES APLICADAS:
//   - onSignOut agora é recebido e passado ao ProfileScreen (implementação real)
//   - Estado local de ProfileSetup e ThemeSwitcher gerido aqui (evita prop drilling)
// ─────────────────────────────────────────────────────────────────────────────

import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen    from '../features/events/screens/HomeScreen';
import MapScreen     from '../features/map/screens/MapScreen';
import AlertsScreen  from '../features/alerts/screens/AlertsScreen';
import ProfileScreen from '../features/profile/screens/ProfileScreen';
import ThemeSwitcherModal from '../shared/components/ThemeSwitcherModal';
import { colors } from '../shared/theme/colors';

const Tab = createBottomTabNavigator();

// Definição das tabs fora do componente para evitar recriação em cada render
const TABS = [
  { name: 'Início',  icon: 'home',          iconOut: 'home-outline'           },
  { name: 'Mapa',    icon: 'map',           iconOut: 'map-outline'            },
  { name: 'Alertas', icon: 'notifications', iconOut: 'notifications-outline', badge: 3 },
  { name: 'Perfil',  icon: 'person',        iconOut: 'person-outline'         },
];

export default function MainTabs({ userData, onSignOut }) {
  // ── Estado do modal de tema ───────────────────────────────────────────────
  // Gerido aqui em vez de no ProfileScreen para evitar que o modal
  // desapareça quando o ProfileScreen sofre re-render.
  const [themeModalVisible, setThemeModalVisible] = useState(false);

  // ── Wrappers estáveis com useCallback ─────────────────────────────────────
  const HomeWithProps = useCallback(
    () => <HomeScreen userData={userData} />,
    [userData]
  );

  const ProfileWithProps = useCallback(
    () => (
      <ProfileScreen
        userData={userData}
        onThemePress={() => setThemeModalVisible(true)}
        onSignOut={onSignOut}
      />
    ),
    [userData, onSignOut]
  );

  return (
    <>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarBackground: () => (
            <View style={[StyleSheet.absoluteFill, styles.tabBg]} />
          ),
          tabBarActiveTintColor:   colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
        }}
      >
        {TABS.map((tab) => (
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
                  {/* Badge de notificações não lidas */}
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

      {/* Modal de tema — renderizado fora das Tabs para não ser afectado
          pelo comportamento de re-mounting das screens do navigator */}
      <ThemeSwitcherModal
        visible={themeModalVisible}
        onClose={() => setThemeModalVisible(false)}
      />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
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
  iconWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute', top: -4, right: -8,
    backgroundColor: colors.secondary,
    borderRadius: 10, minWidth: 18, height: 18,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2, borderColor: colors.bg,
  },
  badgeText:   { color: colors.white, fontSize: 9, fontWeight: '800' },
  label:       { fontSize: 11, fontWeight: '500', color: colors.textMuted, marginTop: 2 },
  labelActive: { color: colors.primary, fontWeight: '700' },
});