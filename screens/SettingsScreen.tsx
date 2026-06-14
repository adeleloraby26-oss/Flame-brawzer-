import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  Pressable, Switch, StatusBar,
} from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import {
  Shield, Zap, Bell, Moon, Type, Globe,
  ChevronRight, ChevronLeft, Lock, Eye,
  Vibrate, Layout, Image, AlignJustify,
} from 'lucide-react-native';
import { COLORS, FONT, RADIUS, SPACING } from '../utils/design';
import { GlassCard } from '../components/cards/GlassCard';
import { useBrowserStore } from '../store/browserStore';

// ── Toggle Row ─────────────────────────────────────────────
const ToggleRow: React.FC<{
  icon: React.FC<any>;
  label: string;
  description?: string;
  value: boolean;
  color?: string;
  onToggle: (v: boolean) => void;
  index?: number;
}> = ({ icon: Icon, label, description, value, color = COLORS.flame, onToggle, index = 0 }) => (
  <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
    <View style={rowStyles.row}>
      <View style={[rowStyles.iconWrap, { backgroundColor: color + '22' }]}>
        <Icon size={16} color={color} />
      </View>
      <View style={rowStyles.info}>
        <Text style={rowStyles.label}>{label}</Text>
        {description && <Text style={rowStyles.desc}>{description}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: COLORS.glassMid, true: color + '88' }}
        thumbColor={value ? color : COLORS.textTertiary}
        ios_backgroundColor={COLORS.glassMid}
      />
    </View>
  </Animated.View>
);

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.base,
    gap: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  iconWrap: {
    width: 34, height: 34, borderRadius: RADIUS.sm,
    alignItems: 'center', justifyContent: 'center',
  },
  info: { flex: 1 },
  label: { fontSize: FONT.base, fontWeight: FONT.medium, color: COLORS.textPrimary },
  desc: { fontSize: FONT.xs, color: COLORS.textTertiary, marginTop: 2 },
});

// ── Link Row ───────────────────────────────────────────────
const LinkRow: React.FC<{
  icon: React.FC<any>;
  label: string;
  value?: string;
  color?: string;
  onPress: () => void;
  index?: number;
}> = ({ icon: Icon, label, value, color = COLORS.textSecondary, onPress, index = 0 }) => (
  <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
    <Pressable onPress={onPress} style={rowStyles.row}>
      <View style={[rowStyles.iconWrap, { backgroundColor: color + '22' }]}>
        <Icon size={16} color={color} />
      </View>
      <View style={rowStyles.info}>
        <Text style={rowStyles.label}>{label}</Text>
        {value && <Text style={rowStyles.desc}>{value}</Text>}
      </View>
      <ChevronRight size={15} color={COLORS.textTertiary} />
    </Pressable>
  </Animated.View>
);

// ── Section ────────────────────────────────────────────────
const Section: React.FC<{ title: string; children: React.ReactNode; delay?: number }> = ({
  title, children, delay = 0,
}) => (
  <Animated.View entering={FadeInDown.delay(delay).springify()} style={sectionStyles.wrap}>
    <Text style={sectionStyles.title}>{title}</Text>
    <GlassCard style={sectionStyles.card} intensity="mid" radius={RADIUS.xl}>
      {children}
    </GlassCard>
  </Animated.View>
);

const sectionStyles = StyleSheet.create({
  wrap: { paddingHorizontal: SPACING.xl, marginBottom: SPACING.xl },
  title: {
    fontSize: FONT.xs, fontWeight: FONT.semibold,
    color: COLORS.textTertiary, textTransform: 'uppercase',
    letterSpacing: 0.9, marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },
  card: { borderRadius: RADIUS.xl, overflow: 'hidden' },
});

// ── Main Screen ────────────────────────────────────────────
export const SettingsScreen: React.FC = () => {
  const { settings, updateSettings, setActiveScreen } = useBrowserStore();

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#07080F', '#000000']} style={StyleSheet.absoluteFill} />
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Header */}
      <Animated.View entering={FadeIn.springify()} style={styles.header}>
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
        <Pressable onPress={() => setActiveScreen('home')} style={styles.backBtn}>
          <ChevronLeft size={22} color={COLORS.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </Animated.View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Privacy & Security */}
        <Section title="Privacy & Security" delay={100}>
          <ToggleRow
            icon={Shield}
            label="Block Ads"
            description="Remove ads from web pages"
            value={settings.blockAds}
            color={COLORS.emerald}
            onToggle={(v) => updateSettings({ blockAds: v })}
            index={0}
          />
          <ToggleRow
            icon={Eye}
            label="Block Trackers"
            description="Prevent cross-site tracking"
            value={settings.blockTrackers}
            color={COLORS.cyan}
            onToggle={(v) => updateSettings({ blockTrackers: v })}
            index={1}
          />
          <ToggleRow
            icon={Lock}
            label="Save Passwords"
            description="Securely store login credentials"
            value={settings.savePasswords}
            color={COLORS.violet}
            onToggle={(v) => updateSettings({ savePasswords: v })}
            index={2}
          />
        </Section>

        {/* Appearance */}
        <Section title="Appearance" delay={200}>
          <ToggleRow
            icon={Zap}
            label="Animations"
            description="Enable motion effects"
            value={settings.enableAnimations}
            color={COLORS.flame}
            onToggle={(v) => updateSettings({ enableAnimations: v })}
            index={0}
          />
          <ToggleRow
            icon={AlignJustify}
            label="Compact Mode"
            description="Reduce spacing in UI"
            value={settings.compactMode}
            color={COLORS.amber}
            onToggle={(v) => updateSettings({ compactMode: v })}
            index={1}
          />
          <ToggleRow
            icon={Layout}
            label="Bottom Address Bar"
            description="Move search bar to bottom"
            value={settings.bottomAddressBar}
            color={COLORS.sky}
            onToggle={(v) => updateSettings({ bottomAddressBar: v })}
            index={2}
          />
          <ToggleRow
            icon={Image}
            label="Show Favicons"
            description="Display site icons in tabs"
            value={settings.showFavicons}
            color={COLORS.rose}
            onToggle={(v) => updateSettings({ showFavicons: v })}
            index={3}
          />
        </Section>

        {/* Browsing */}
        <Section title="Browsing" delay={300}>
          <ToggleRow
            icon={Type}
            label="Reader Mode"
            description="Simplified reading layout"
            value={settings.readerMode}
            color={COLORS.indigo}
            onToggle={(v) => updateSettings({ readerMode: v })}
            index={0}
          />
          <ToggleRow
            icon={Vibrate}
            label="Haptic Feedback"
            description="Vibration on interactions"
            value={settings.enableHaptics}
            color={COLORS.violet}
            onToggle={(v) => updateSettings({ enableHaptics: v })}
            index={1}
          />
          <LinkRow
            icon={Globe}
            label="Search Engine"
            value={settings.searchEngine}
            color={COLORS.cyan}
            onPress={() => {}}
            index={2}
          />
        </Section>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.void },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 52,
    paddingBottom: SPACING.base,
    paddingHorizontal: SPACING.base,
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glassBorder,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: RADIUS.md,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.glass,
  },
  headerTitle: {
    fontSize: FONT.lg,
    fontWeight: FONT.bold,
    color: COLORS.textPrimary,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingTop: SPACING.xl },
});
