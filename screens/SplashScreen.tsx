import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming,
  withSequence, withDelay, runOnJS, Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONT, ANIMATION } from '../utils/design';
import { FlameLogo } from '../components/svg/FlameLogo';

const { width: W, height: H } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleY = useSharedValue(20);
  const subtitleOpacity = useSharedValue(0);
  const exitOpacity = useSharedValue(1);
  const glowScale = useSharedValue(0.5);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    // Glow in
    glowOpacity.value = withDelay(100, withTiming(1, { duration: 600 }));
    glowScale.value = withDelay(100, withSpring(1.5, ANIMATION.springGentle));

    // Logo entrance
    logoOpacity.value = withDelay(200, withTiming(1, { duration: 400 }));
    logoScale.value = withDelay(200, withSpring(1, ANIMATION.springBouncy));

    // Title
    titleOpacity.value = withDelay(600, withTiming(1, { duration: 400 }));
    titleY.value = withDelay(600, withSpring(0, ANIMATION.spring));

    // Subtitle
    subtitleOpacity.value = withDelay(900, withTiming(1, { duration: 400 }));

    // Exit
    exitOpacity.value = withDelay(2000, withTiming(0, { duration: 600 }, () => {
      runOnJS(onFinish)();
    }));
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: glowScale.value }],
  }));

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleY.value }],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  const containerStyle = useAnimatedStyle(() => ({
    opacity: exitOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <LinearGradient
        colors={['#000000', '#07080F', '#000000']}
        style={StyleSheet.absoluteFill}
      />

      {/* Ambient glow */}
      <Animated.View style={[styles.glow, glowStyle]}>
        <LinearGradient
          colors={[COLORS.flameGlow, 'transparent']}
          style={{ flex: 1, borderRadius: 300 }}
        />
      </Animated.View>

      <Animated.View style={[styles.logoWrap, logoStyle]}>
        <FlameLogo size={96} animated />
      </Animated.View>

      <Animated.Text style={[styles.title, titleStyle]}>Flame</Animated.Text>
      <Animated.Text style={[styles.subtitle, subtitleStyle]}>
        The browser from the future
      </Animated.Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    gap: 16,
  },
  glow: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    top: H / 2 - 200,
    left: W / 2 - 200,
  },
  logoWrap: {
    marginBottom: 8,
  },
  title: {
    fontSize: 52,
    fontWeight: FONT.black,
    color: COLORS.textPrimary,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: FONT.base,
    color: COLORS.textTertiary,
    letterSpacing: 0.5,
  },
});
