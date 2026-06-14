import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, Pressable,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import Animated, {
  FadeInDown, FadeIn, useSharedValue, useAnimatedStyle,
  withSpring, withSequence, withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Mail, Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react-native';
import { COLORS, FONT, RADIUS, SPACING, ANIMATION } from '../utils/design';
import { GlassCard } from '../components/cards/GlassCard';
import { FlameLogo } from '../components/svg/FlameLogo';
import { authService } from '../services/supabase';

interface AuthScreenProps {
  onAuthenticated: (userId: string) => void;
}

type Mode = 'signin' | 'signup';

interface FieldProps {
  icon: React.FC<any>;
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'words';
  rightIcon?: React.ReactNode;
}

const Field: React.FC<FieldProps> = ({
  icon: Icon, placeholder, value, onChangeText,
  secureTextEntry, keyboardType = 'default',
  autoCapitalize = 'none', rightIcon,
}) => {
  const borderOpacity = useSharedValue(0.08);
  const focusStyle = useAnimatedStyle(() => ({
    borderColor: `rgba(255,77,0,${borderOpacity.value})`,
  }));

  return (
    <Animated.View style={[styles.field, focusStyle]}>
      <BlurView intensity={15} tint="dark" style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.02)']}
        style={StyleSheet.absoluteFill}
      />
      <Icon size={17} color={COLORS.textTertiary} style={{ zIndex: 1 }} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textTertiary}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        keyboardAppearance="dark"
        style={styles.fieldInput}
        selectionColor={COLORS.flame}
        onFocus={() => { borderOpacity.value = withSpring(0.8, ANIMATION.spring); }}
        onBlur={() => { borderOpacity.value = withSpring(0.08, ANIMATION.spring); }}
      />
      {rightIcon}
    </Animated.View>
  );
};

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthenticated }) => {
  const [mode, setMode] = useState<Mode>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const btnScale = useSharedValue(1);
  const errorShake = useSharedValue(0);

  const btnStyle = useAnimatedStyle(() => ({ transform: [{ scale: btnScale.value }] }));
  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: errorShake.value }],
  }));

  const shakeError = () => {
    errorShake.value = withSequence(
      withTiming(-10, { duration: 60 }),
      withTiming(10,  { duration: 60 }),
      withTiming(-8,  { duration: 60 }),
      withTiming(8,   { duration: 60 }),
      withTiming(0,   { duration: 60 }),
    );
  };

  const handleSubmit = async () => {
    setError('');
    if (!email || !password || (mode === 'signup' && !name)) {
      setError('Please fill in all fields.');
      shakeError();
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      shakeError();
      return;
    }

    btnScale.value = withSpring(0.95, ANIMATION.springSnappy);
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { user } = await authService.signUp(email.trim(), password, name.trim());
        if (user) onAuthenticated(user.id);
      } else {
        const { user } = await authService.signIn(email.trim(), password);
        if (user) onAuthenticated(user.id);
      }
    } catch (e: any) {
      const msg = e?.message ?? 'Something went wrong.';
      setError(msg.replace('Invalid login credentials', 'Wrong email or password.'));
      shakeError();
    } finally {
      setLoading(false);
      btnScale.value = withSpring(1, ANIMATION.spring);
    }
  };

  const toggleMode = () => {
    setMode(m => m === 'signin' ? 'signup' : 'signin');
    setError('');
    setName('');
    setEmail('');
    setPassword('');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000', '#07080F', '#000000']}
        style={StyleSheet.absoluteFill}
      />
      {/* ambient glow */}
      <View style={styles.glow}>
        <LinearGradient
          colors={[COLORS.flameGlow, 'transparent']}
          style={{ flex: 1, borderRadius: 300 }}
        />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.kav}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <Animated.View entering={FadeIn.delay(100).springify()} style={styles.logoWrap}>
            <FlameLogo size={72} animated />
            <Text style={styles.appName}>Flame</Text>
            <Text style={styles.tagline}>The browser from the future</Text>
          </Animated.View>

          {/* Card */}
          <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.cardWrap}>
            <GlassCard style={styles.card} intensity="high" radius={RADIUS.xxl} noPressEffect>

              <Text style={styles.cardTitle}>
                {mode === 'signin' ? 'Welcome back' : 'Create account'}
              </Text>
              <Text style={styles.cardSub}>
                {mode === 'signin'
                  ? 'Sign in to sync your data across devices'
                  : 'Join Flame and start your journey'}
              </Text>

              <View style={styles.fields}>
                {mode === 'signup' && (
                  <Animated.View entering={FadeInDown.springify()}>
                    <Field
                      icon={User}
                      placeholder="Your name"
                      value={name}
                      onChangeText={setName}
                      autoCapitalize="words"
                    />
                  </Animated.View>
                )}
                <Field
                  icon={Mail}
                  placeholder="Email address"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                />
                <Field
                  icon={Lock}
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPass}
                  rightIcon={
                    <Pressable onPress={() => setShowPass(v => !v)} style={styles.eyeBtn}>
                      {showPass
                        ? <EyeOff size={16} color={COLORS.textTertiary} />
                        : <Eye    size={16} color={COLORS.textTertiary} />}
                    </Pressable>
                  }
                />
              </View>

              {/* Error */}
              {error !== '' && (
                <Animated.View entering={FadeInDown.springify()} style={[styles.errorRow, shakeStyle]}>
                  <AlertCircle size={14} color={COLORS.rose} />
                  <Text style={styles.errorText}>{error}</Text>
                </Animated.View>
              )}

              {/* Submit */}
              <Animated.View style={btnStyle}>
                <Pressable
                  onPress={handleSubmit}
                  onPressIn={() => { btnScale.value = withSpring(0.97, ANIMATION.springSnappy); }}
                  onPressOut={() => { btnScale.value = withSpring(1, ANIMATION.spring); }}
                  style={styles.submitBtn}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={[COLORS.flame, COLORS.flameWarm]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                  />
                  {loading
                    ? <ActivityIndicator color="#fff" size="small" />
                    : <Text style={styles.submitText}>
                        {mode === 'signin' ? 'Sign In' : 'Create Account'}
                      </Text>
                  }
                </Pressable>
              </Animated.View>

              {/* Toggle mode */}
              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>
                  {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
                </Text>
                <Pressable onPress={toggleMode}>
                  <Text style={styles.toggleAction}>
                    {mode === 'signin' ? 'Sign Up' : 'Sign In'}
                  </Text>
                </Pressable>
              </View>

              {/* Skip */}
              <Pressable onPress={() => onAuthenticated('')} style={styles.skipBtn}>
                <Text style={styles.skipText}>Continue without account</Text>
              </Pressable>

            </GlassCard>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.void },
  glow: {
    position: 'absolute', width: 400, height: 400,
    borderRadius: 200, top: -80, alignSelf: 'center',
  },
  kav: { flex: 1 },
  scroll: {
    flexGrow: 1, justifyContent: 'center',
    paddingHorizontal: SPACING.xl, paddingVertical: SPACING.xxxl,
  },
  logoWrap: { alignItems: 'center', marginBottom: SPACING.xxxl, gap: SPACING.sm },
  appName: {
    fontSize: FONT.display, fontWeight: FONT.black,
    color: COLORS.textPrimary, letterSpacing: -1,
  },
  tagline: { fontSize: FONT.sm, color: COLORS.textTertiary },
  cardWrap: {},
  card: { borderRadius: RADIUS.xxl, overflow: 'hidden', padding: SPACING.xl, gap: SPACING.base },
  cardTitle: { fontSize: FONT.xl, fontWeight: FONT.bold, color: COLORS.textPrimary },
  cardSub: { fontSize: FONT.sm, color: COLORS.textTertiary, marginBottom: SPACING.xs },
  fields: { gap: SPACING.md },
  field: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    height: 52, borderRadius: RADIUS.lg, overflow: 'hidden',
    paddingHorizontal: SPACING.base, borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  fieldInput: {
    flex: 1, color: COLORS.textPrimary,
    fontSize: FONT.base, padding: 0,
  },
  eyeBtn: { padding: SPACING.xs },
  errorRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.xs,
    backgroundColor: 'rgba(244,63,94,0.12)',
    borderRadius: RADIUS.md, padding: SPACING.sm,
    borderWidth: 1, borderColor: 'rgba(244,63,94,0.25)',
  },
  errorText: { flex: 1, fontSize: FONT.sm, color: COLORS.rose },
  submitBtn: {
    height: 52, borderRadius: RADIUS.lg,
    overflow: 'hidden', alignItems: 'center', justifyContent: 'center',
  },
  submitText: { fontSize: FONT.md, fontWeight: FONT.bold, color: '#fff' },
  toggleRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: SPACING.xs,
  },
  toggleLabel: { fontSize: FONT.sm, color: COLORS.textTertiary },
  toggleAction: { fontSize: FONT.sm, color: COLORS.flame, fontWeight: FONT.semibold },
  skipBtn: { alignItems: 'center', paddingTop: SPACING.xs },
  skipText: { fontSize: FONT.xs, color: COLORS.textDisabled },
});
