import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions } from 'react-native';
import Animated, {
  FadeInDown, FadeIn, useSharedValue, useAnimatedStyle,
  withRepeat, withSequence, withTiming, withSpring,
  interpolate, withDelay, Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import {
  Zap, Shield, Clock, Search, Layers, Star,
  Settings, ChevronRight, Award, TrendingUp, Flame,
} from 'lucide-react-native';
import { COLORS, FONT, RADIUS, SPACING, ANIMATION } from '../utils/design';
import { GlassCard } from '../components/cards/GlassCard';
import { useBrowserStore } from '../store/browserStore';
import { FlameLogo } from '../components/svg/FlameLogo';

const { width: W } = Dimensions.get('window');

const RANK_COLORS: Record<string, [string, string]> = {
  Explorer: [COLORS.sky, COLORS.cyan],
  Navigator: [COLORS.emerald, '#059669'],
  Pioneer: [COLORS.violet, COLORS.indigo],
  Voyager: [COLORS.flame, COLORS.flameWarm],
  Legend: ['#F59E0B', '#EF4444'],
};

const RANK_XP: Record<string, number> = {
  Explorer: 5000,
  Navigator: 15000,
  Pioneer: 40000,
  Voyager: 100000,
  Legend: 999999,
};

const AnimatedProgressBar: React.FC<{ progress: number; colors: [string, string] }> = ({
  progress, colors,
}) => {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withDelay(600, withTiming(progress, { duration: 1200, easing: Easing.out(Easing.cubic) }));
  }, []);

  const barStyle = useAnimatedStyle(() => ({ width: `${width.value}%` as any }));

  return (
    <View style={progressStyles.track}>
      <Animated.View style={[progressStyles.fill, barStyle]}>
        <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
      </Animated.View>
    </View>
  );
};

const progressStyles = StyleSheet.create({
  track: {
    height: 6, borderRadius: 3, backgroundColor: COLORS.glass,
    overflow: 'hidden', flex: 1,
  },
  fill: { height: '100%', borderRadius: 3, overflow: 'hidden' },
});

const StatCard: React.FC<{
  icon: React.FC<any>;
  label: string;
  value: string;
  color: string;
  index: number;
}> = ({ icon: Icon, label, value, color, index }) => {
  const glow = useSharedValue(0.4);

  useEffect(() => {
    glow.value = withDelay(index * 200,
      withRepeat(
        withSequence(withTiming(0.9, { duration: 2400 }), withTiming(0.3, { duration: 2400 })),
        -1, true
      )
    );
  }, []);

  const glowStyle = useAnimatedStyle(() => ({ opacity: glow.value }));

  return (
    <Animated.View entering={FadeInDown.delay(300 + index * 70).springify()} style={statStyles.wrap}>
      <GlassCard style={statStyles.card} intensity="mid" radius={RADIUS.xl}>
        <Animated.View style={[statStyles.glow, { backgroundColor: color + '33' }, glowStyle]} />
        <View style={[statStyles.iconWrap, { backgroundColor: color + '22' }]}>
          <Icon size={18} color={color} />
        </View>
        <Text style={statStyles.value}>{value}</Text>
        <Text style={statStyles.label}>{label}</Text>
      </GlassCard>
    </Animated.View>
  );
};

const statStyles = StyleSheet.create({
  wrap: { flex: 1 },
  card: {
    padding: SPACING.base, borderRadius: RADIUS.xl,
    overflow: 'hidden', gap: SPACING.xs,
  },
  glow: {
    position: 'absolute', top: -20, right: -20,
    width: 70, height: 70, borderRadius: 35,
  },
  iconWrap: {
    width: 36, height: 36, borderRadius: RADIUS.md,
    alignItems: 'center', justifyContent: 'center',
  },
  value: { fontSize: FONT.lg, fontWeight: FONT.bold, color: COLORS.textPrimary },
  label: { fontSize: FONT.xs, color: COLORS.textTertiary },
});

export const ProfileScreen: React.FC = () => {
  const { profile, setActiveScreen } = useBrowserStore();
  const rankColors = RANK_COLORS[profile.rank] || RANK_COLORS.Explorer;
  const xpForNext = RANK_XP[profile.rank] || 5000;
  const xpProgress = Math.min((profile.xp / xpForNext) * 100, 100);

  const avatarGlow = useSharedValue(0.5);
  useEffect(() => {
    avatarGlow.value = withRepeat(
      withSequence(withTiming(1, { duration: 2000 }), withTiming(0.3, { duration: 2000 })),
      -1, true
    );
  }, []);
  const glowStyle = useAnimatedStyle(() => ({ opacity: avatarGlow.value }));

  const stats = [
    { icon: Search, label: 'Searches', value: profile.stats.totalSearches.toLocaleString(), color: COLORS.cyan },
    { icon: Layers, label: 'Tabs Opened', value: profile.stats.totalTabsOpened.toLocaleString(), color: COLORS.violet },
    { icon: Shield, label: 'Blocked', value: `${profile.stats.dataBlocked} MB`, color: COLORS.emerald },
    { icon: Clock, label: 'Time Saved', value: `${profile.stats.timeSaved}h`, color: COLORS.flame },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#07080F', '#000000']} style={StyleSheet.absoluteFill} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero banner */}
        <Animated.View entering={FadeIn.springify()} style={styles.banner}>
          <LinearGradient
            colors={[...rankColors, 'transparent'] as any}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.bannerContent}>
            {/* Avatar */}
            <View style={styles.avatarWrap}>
              <Animated.View style={[styles.avatarGlow, { backgroundColor: rankColors[0] }, glowStyle]} />
              <View style={styles.avatar}>
                <LinearGradient colors={rankColors} style={StyleSheet.absoluteFill} />
                <FlameLogo size={44} animated />
              </View>
              <View style={[styles.verifiedBadge, { backgroundColor: rankColors[0] }]}>
                <Star size={9} color="#fff" fill="#fff" />
              </View>
            </View>

            <Text style={styles.name}>{profile.name}</Text>
            <Text style={styles.email}>{profile.email}</Text>

            {/* Rank badge */}
            <View style={styles.rankBadge}>
              <LinearGradient colors={rankColors} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
              <Award size={13} color="#fff" />
              <Text style={styles.rankText}>{profile.rank}</Text>
            </View>
          </View>
        </Animated.View>

        {/* XP Progress */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.xpSection}>
          <GlassCard style={styles.xpCard} intensity="mid" radius={RADIUS.xl}>
            <View style={styles.xpHeader}>
              <View style={styles.xpInfo}>
                <Zap size={15} color={rankColors[0]} />
                <Text style={styles.xpLabel}>Level {profile.level}</Text>
              </View>
              <Text style={styles.xpValue}>{profile.xp.toLocaleString()} XP</Text>
            </View>
            <AnimatedProgressBar progress={xpProgress} colors={rankColors} />
            <Text style={styles.xpSub}>{(xpForNext - profile.xp).toLocaleString()} XP to next rank</Text>
          </GlassCard>
        </Animated.View>

        {/* Stats grid */}
        <Animated.View entering={FadeInDown.delay(280).springify()} style={styles.statsSection}>
          <Text style={styles.sectionLabel}>Statistics</Text>
          <View style={styles.statsGrid}>
            {stats.slice(0, 2).map((s, i) => (
              <StatCard key={s.label} {...s} index={i} />
            ))}
          </View>
          <View style={[styles.statsGrid, { marginTop: SPACING.sm }]}>
            {stats.slice(2).map((s, i) => (
              <StatCard key={s.label} {...s} index={i + 2} />
            ))}
          </View>
        </Animated.View>

        {/* Quick actions */}
        <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.actionsSection}>
          <Text style={styles.sectionLabel}>Account</Text>
          <GlassCard style={styles.actionsCard} intensity="mid" radius={RADIUS.xl}>
            {[
              { icon: Settings, label: 'Settings', color: COLORS.textSecondary, onPress: () => setActiveScreen('settings') },
              { icon: TrendingUp, label: 'View Activity', color: COLORS.textSecondary, onPress: () => setActiveScreen('history') },
              { icon: Flame, label: 'Flame Pro', color: COLORS.flame, onPress: () => {} },
            ].map((item, i, arr) => (
              <Pressable
                key={item.label}
                onPress={item.onPress}
                style={[styles.actionRow, i < arr.length - 1 && styles.actionBorder]}
              >
                <View style={[styles.actionIcon, { backgroundColor: item.color + '22' }]}>
                  <item.icon size={16} color={item.color} />
                </View>
                <Text style={[styles.actionLabel, { color: item.color === COLORS.flame ? COLORS.flame : COLORS.textPrimary }]}>
                  {item.label}
                </Text>
                <ChevronRight size={15} color={COLORS.textTertiary} />
              </Pressable>
            ))}
          </GlassCard>
        </Animated.View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.void },
  scroll: { flex: 1 },
  scrollContent: {},
  banner: {
    height: 260, overflow: 'hidden',
    alignItems: 'center', justifyContent: 'flex-end',
    paddingBottom: SPACING.xxl,
  },
  bannerContent: { alignItems: 'center', gap: SPACING.sm },
  avatarWrap: { position: 'relative', marginBottom: SPACING.xs },
  avatarGlow: {
    position: 'absolute', top: -15, left: -15,
    width: 90, height: 90, borderRadius: 45,
  },
  avatar: {
    width: 76, height: 76, borderRadius: 38,
    overflow: 'hidden', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.3)',
  },
  verifiedBadge: {
    position: 'absolute', bottom: 0, right: -2,
    width: 22, height: 22, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: COLORS.void,
  },
  name: { fontSize: FONT.xl, fontWeight: FONT.bold, color: COLORS.textPrimary },
  email: { fontSize: FONT.sm, color: COLORS.textSecondary },
  rankBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: SPACING.md, paddingVertical: 5,
    borderRadius: RADIUS.full, overflow: 'hidden',
  },
  rankText: { fontSize: FONT.sm, fontWeight: FONT.bold, color: '#fff' },
  xpSection: { paddingHorizontal: SPACING.xl, marginTop: SPACING.xl },
  xpCard: { padding: SPACING.base, borderRadius: RADIUS.xl, overflow: 'hidden', gap: SPACING.sm },
  xpHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  xpInfo: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  xpLabel: { fontSize: FONT.base, fontWeight: FONT.semibold, color: COLORS.textPrimary },
  xpValue: { fontSize: FONT.sm, color: COLORS.textSecondary, fontWeight: FONT.medium },
  xpSub: { fontSize: FONT.xs, color: COLORS.textTertiary },
  statsSection: { paddingHorizontal: SPACING.xl, marginTop: SPACING.xl },
  statsGrid: { flexDirection: 'row', gap: SPACING.sm },
  sectionLabel: {
    fontSize: FONT.xs, fontWeight: FONT.semibold,
    color: COLORS.textTertiary, textTransform: 'uppercase',
    letterSpacing: 0.9, marginBottom: SPACING.sm,
  },
  actionsSection: { paddingHorizontal: SPACING.xl, marginTop: SPACING.xl },
  actionsCard: { borderRadius: RADIUS.xl, overflow: 'hidden' },
  actionRow: {
    flexDirection: 'row', alignItems: 'center',
    padding: SPACING.base, gap: SPACING.md,
  },
  actionBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  actionIcon: {
    width: 34, height: 34, borderRadius: RADIUS.sm,
    alignItems: 'center', justifyContent: 'center',
  },
  actionLabel: { flex: 1, fontSize: FONT.base, fontWeight: FONT.medium },
});
