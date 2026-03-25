// src/screens/auth/AuthScreen.js
//
// Ecrã de login / registo com o design escuro da app.
// Alterna entre os dois modos sem mudar de ecrã.

import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView,
  ActivityIndicator, Alert, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';

export default function AuthScreen() {
  const { signIn, signUp } = useAuth();

  const [mode,            setMode]            = useState('login');   // 'login' | 'register'
  const [email,           setEmail]           = useState('');
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword,    setShowPassword]    = useState(false);
  const [loading,         setLoading]         = useState(false);
  const [emailFocused,    setEmailFocused]    = useState(false);
  const [passFocused,     setPassFocused]     = useState(false);
  const [confirmFocused,  setConfirmFocused]  = useState(false);

  // Animação do card ao trocar de modo
  const slideAnim = useRef(new Animated.Value(0)).current;

  const switchMode = (newMode) => {
    Animated.sequence([
      Animated.timing(slideAnim, { toValue: -8, duration: 100, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }),
    ]).start();
    setMode(newMode);
    setPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = async () => {
    // Validações básicas
    if (!email.trim() || !password) {
      Alert.alert('Atenção', 'Preenche o email e a password.');
      return;
    }
    if (!email.includes('@')) {
      Alert.alert('Email inválido', 'Introduz um email válido.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Password fraca', 'A password deve ter pelo menos 6 caracteres.');
      return;
    }
    if (mode === 'register' && password !== confirmPassword) {
      Alert.alert('Passwords diferentes', 'As passwords não coincidem.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await signIn(email.trim(), password);
        if (error) {
          Alert.alert(
            'Erro ao entrar',
            error.message === 'Invalid login credentials'
              ? 'Email ou password incorretos.'
              : error.message
          );
        }
        // Se sucesso, o AuthContext atualiza a sessão e App.js navega automaticamente
      } else {
        const { error } = await signUp(email.trim(), password);
        if (error) {
          Alert.alert('Erro ao registar', error.message);
        } else {
          // Se o Supabase tiver email confirmation ativado, avisar o utilizador
          Alert.alert(
            'Conta criada! 🎉',
            'Verifica o teu email para confirmar a conta, depois entra aqui.',
            [{ text: 'OK', onPress: () => switchMode('login') }]
          );
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.container}>
      {/* Fundo gradiente */}
      <LinearGradient
        colors={['#0A0A0F', '#1a0a2e', '#0A0A0F']}
        style={StyleSheet.absoluteFill}
      />
      {/* Blobs decorativos */}
      <View style={s.blob1} />
      <View style={s.blob2} />

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={s.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* ── Logo ── */}
            <View style={s.logoWrap}>
              <LinearGradient
                colors={[colors.primary, colors.secondary]}
                style={s.logoGrad}
              >
                <Text style={s.logoEmoji}>🎯</Text>
              </LinearGradient>
              <View style={s.logoGlow} />
            </View>

            <Text style={s.appName}>VibeHunt</Text>
            <Text style={s.tagline}>
              {mode === 'login'
                ? 'Bem-vindo de volta 👋'
                : 'Cria a tua conta 🚀'}
            </Text>

            {/* ── Formulário ── */}
            <Animated.View style={[s.form, { transform: [{ translateY: slideAnim }] }]}>

              {/* Email */}
              <View style={[s.fieldWrap, emailFocused && s.fieldFocused]}>
                <View style={s.fieldIcon}>
                  <Ionicons
                    name="mail-outline"
                    size={18}
                    color={emailFocused ? colors.primary : colors.textMuted}
                  />
                </View>
                <TextInput
                  style={s.input}
                  placeholder="O teu email"
                  placeholderTextColor={colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  returnKeyType="next"
                />
              </View>

              {/* Password */}
              <View style={[s.fieldWrap, passFocused && s.fieldFocused]}>
                <View style={s.fieldIcon}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={18}
                    color={passFocused ? colors.primary : colors.textMuted}
                  />
                </View>
                <TextInput
                  style={s.input}
                  placeholder="Password"
                  placeholderTextColor={colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setPassFocused(true)}
                  onBlur={() => setPassFocused(false)}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  returnKeyType={mode === 'register' ? 'next' : 'done'}
                  onSubmitEditing={mode === 'login' ? handleSubmit : undefined}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={s.eyeBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              </View>

              {/* Confirmar password (só no registo) */}
              {mode === 'register' && (
                <View style={[s.fieldWrap, confirmFocused && s.fieldFocused]}>
                  <View style={s.fieldIcon}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={18}
                      color={confirmFocused ? colors.primary : colors.textMuted}
                    />
                  </View>
                  <TextInput
                    style={s.input}
                    placeholder="Confirma a password"
                    placeholderTextColor={colors.textMuted}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    onFocus={() => setConfirmFocused(true)}
                    onBlur={() => setConfirmFocused(false)}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit}
                  />
                </View>
              )}

              {/* Botão de submissão */}
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={loading}
                activeOpacity={0.85}
                style={{ marginTop: spacing.sm }}
              >
                <LinearGradient
                  colors={
                    loading
                      ? [colors.bgCard2, colors.bgCard2]
                      : [colors.primary, colors.secondary]
                  }
                  style={s.submitBtn}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {loading ? (
                    <ActivityIndicator color={colors.textMuted} />
                  ) : (
                    <>
                      <Text style={s.submitText}>
                        {mode === 'login' ? 'Entrar' : 'Criar conta'}
                      </Text>
                      <Ionicons name="arrow-forward" size={18} color={colors.white} />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Trocar modo */}
              <TouchableOpacity
                style={s.switchWrap}
                onPress={() => switchMode(mode === 'login' ? 'register' : 'login')}
                activeOpacity={0.75}
              >
                <Text style={s.switchText}>
                  {mode === 'login'
                    ? 'Não tens conta?  '
                    : 'Já tens conta?  '}
                  <Text style={s.switchLink}>
                    {mode === 'login' ? 'Regista-te' : 'Entra aqui'}
                  </Text>
                </Text>
              </TouchableOpacity>

            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  blob1: {
    position: 'absolute', width: 300, height: 300, borderRadius: 150,
    backgroundColor: 'rgba(139,92,246,0.13)', top: -60, right: -80,
  },
  blob2: {
    position: 'absolute', width: 250, height: 250, borderRadius: 125,
    backgroundColor: 'rgba(236,72,153,0.09)', bottom: 80, left: -80,
  },

  scroll: {
    flexGrow: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: 60, paddingBottom: spacing.xl,
  },

  // Logo
  logoWrap: { position: 'relative', alignItems: 'center', marginBottom: spacing.md },
  logoGrad: {
    width: 84, height: 84, borderRadius: 26,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.primary, shadowOpacity: 0.55,
    shadowRadius: 22, shadowOffset: { width: 0, height: 10 },
    elevation: 18,
  },
  logoEmoji: { fontSize: 38 },
  logoGlow: {
    position: 'absolute', width: 116, height: 116, borderRadius: 58,
    backgroundColor: 'rgba(139,92,246,0.16)', top: -16, left: -16,
  },

  appName: {
    color: colors.textPrimary, fontSize: 38, fontWeight: '900',
    letterSpacing: -1, marginBottom: 4,
  },
  tagline: {
    color: colors.textSecondary, fontSize: 16,
    marginBottom: spacing.xl,
  },

  // Form
  form: { width: '100%', gap: spacing.sm },

  fieldWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1.5, borderColor: colors.border,
    paddingHorizontal: spacing.sm, height: 56,
    gap: 4,
  },
  fieldFocused: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(139,92,246,0.06)',
  },
  fieldIcon: { width: 30, alignItems: 'center' },
  input: {
    flex: 1, color: colors.textPrimary, fontSize: 15,
    height: '100%',
  },
  eyeBtn: { padding: 6 },

  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 17, borderRadius: radius.lg, gap: 8, minHeight: 56,
  },
  submitText: { color: colors.white, fontSize: 17, fontWeight: '700' },

  switchWrap: { alignItems: 'center', paddingVertical: spacing.md },
  switchText: { color: colors.textSecondary, fontSize: 14 },
  switchLink: { color: colors.primary, fontWeight: '700' },
});