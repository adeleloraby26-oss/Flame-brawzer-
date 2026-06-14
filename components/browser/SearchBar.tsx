import React, { useRef, useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, Pressable, Platform,
  KeyboardTypeOptions,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming,
  interpolate, interpolateColor, Extrapolation,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, Mic, X, ArrowLeft, Flame } from 'lucide-react-native';
import { COLORS, FONT, RADIUS, SPACING, ANIMATION, SEARCH_BAR_HEIGHT } from '../../utils/design';
import { useBrowserStore } from '../../store/browserStore';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedBlur = Animated.createAnimatedComponent(BlurView);

export const SearchBar: React.FC = () => {
  const { isAddressBarFocused, addressInput, activeTabId, tabs, setAddressInput, setAddressBarFocused, navigateTo, setActiveScreen } = useBrowserStore();
  const inputRef = useRef<TextInput>(null);
  const [localInput, setLocalInput] = useState('');

  const focused = useSharedValue(isAddressBarFocused ? 1 : 0);
  const glowOpacity = useSharedValue(0);

  React.useEffect(() => {
    focused.value = withSpring(isAddressBarFocused ? 1 : 0, ANIMATION.spring);
    glowOpacity.value = withTiming(isAddressBarFocused ? 1 : 0, { duration: 300 });
  }, [isAddressBarFocused]);

  const activeTab = tabs.find(t => t.id === activeTabId);
  const isHome = activeTab?.url === 'flame://home' || !activeTab;
  const displayText = isAddressBarFocused ? localInput : (activeTab?.url && activeTab.url !== 'flame://home' ? activeTab.url.replace(/^https?:\/\//, '') : '');

  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(focused.value, [0, 1], [1, 1.01], Extrapolation.CLAMP) },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const handleFocus = () => {
    setAddressBarFocused(true);
    setLocalInput(activeTab?.url && activeTab.url !== 'flame://home' ? activeTab.url : '');
    inputRef.current?.focus();
  };

  const handleBlur = () => {
    setAddressBarFocused(false);
    setLocalInput('');
  };

  const handleSubmit = () => {
    if (localInput.trim()) {
      navigateTo(localInput.trim());
      setLocalInput('');
    }
    inputRef.current?.blur();
  };

  const handleClear = () => {
    setLocalInput('');
    inputRef.current?.focus();
  };

  return (
    <Animated.View style={[styles.wrapper, containerStyle]}>
      {/* Glow effect */}
      <Animated.View style={[styles.glowContainer, glowStyle]}>
        <LinearGradient
          colors={[COLORS.flameGlow, 'transparent']}
          style={styles.glow}
        />
      </Animated.View>

      <Pressable onPress={handleFocus} style={styles.pressable}>
        <BlurView intensity={25} tint="dark" style={styles.blur} />
        <LinearGradient
          colors={['rgba(255,255,255,0.09)', 'rgba(255,255,255,0.03)']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={styles.border} />

        <View style={styles.inner}>
          {isAddressBarFocused ? (
            <Pressable onPress={handleBlur} style={styles.iconBtn}>
              <ArrowLeft size={18} color={COLORS.textSecondary} />
            </Pressable>
          ) : (
            <View style={styles.iconBtn}>
              {isHome ? (
                <Flame size={18} color={COLORS.flame} />
              ) : (
                <View style={styles.secureIndicator}>
                  <View style={[styles.securityDot, { backgroundColor: COLORS.secure }]} />
                </View>
              )}
            </View>
          )}

          {isAddressBarFocused ? (
            <TextInput
              ref={inputRef}
              value={localInput}
              onChangeText={setLocalInput}
              onSubmitEditing={handleSubmit}
              onBlur={handleBlur}
              autoFocus
              style={styles.input}
              placeholder="Search or enter URL"
              placeholderTextColor={COLORS.textTertiary}
              selectionColor={COLORS.flame}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardAppearance="dark"
              returnKeyType="go"
              selectTextOnFocus
            />
          ) : (
            <Text
              style={[styles.urlText, isHome && styles.placeholderText]}
              numberOfLines={1}
            >
              {isHome ? 'Search or enter URL' : displayText}
            </Text>
          )}

          {isAddressBarFocused && localInput.length > 0 ? (
            <Pressable onPress={handleClear} style={styles.iconBtn}>
              <X size={16} color={COLORS.textTertiary} />
            </Pressable>
          ) : (
            <Pressable style={styles.iconBtn}>
              <Mic size={18} color={COLORS.textSecondary} />
            </Pressable>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: SPACING.base,
    height: SEARCH_BAR_HEIGHT,
    position: 'relative',
  },
  pressable: {
    flex: 1,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  blur: {
    ...StyleSheet.absoluteFill,
    borderRadius: RADIUS.full,
  },
  border: {
    ...StyleSheet.absoluteFill,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  inner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  iconBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: FONT.base,
    fontWeight: FONT.medium,
    padding: 0,
  },
  urlText: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: FONT.base,
    fontWeight: FONT.medium,
  },
  placeholderText: {
    color: COLORS.textTertiary,
    fontWeight: FONT.regular,
  },
  secureIndicator: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  securityDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  glowContainer: {
    position: 'absolute',
    top: -10,
    left: 0,
    right: 0,
    height: SEARCH_BAR_HEIGHT + 20,
    zIndex: -1,
  },
  glow: {
    flex: 1,
    borderRadius: RADIUS.full,
  },
});
