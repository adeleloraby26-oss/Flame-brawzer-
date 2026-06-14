import React, { useEffect } from 'react';
import Svg, { Path, Defs, RadialGradient, Stop, Circle, LinearGradient } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { View } from 'react-native';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface FlameLogoProps {
  size?: number;
  animated?: boolean;
}

export const FlameLogo: React.FC<FlameLogoProps> = ({ size = 48, animated = true }) => {
  const pulse = useSharedValue(1);
  const flicker = useSharedValue(0);
  const glow = useSharedValue(0.6);

  useEffect(() => {
    if (!animated) return;

    pulse.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.95, { duration: 1000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1, true
    );

    flicker.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 80 }),
        withTiming(0.85, { duration: 60 }),
        withTiming(1, { duration: 100 }),
        withTiming(0.9, { duration: 40 }),
        withTiming(1, { duration: 150 }),
      ),
      -1, false
    );

    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.5, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
      ),
      -1, true
    );
  }, [animated]);

  const glowProps = useAnimatedProps(() => ({
    opacity: glow.value,
    r: interpolate(pulse.value, [0.95, 1.08], [size * 0.42, size * 0.48]),
  }));

  const innerFlameProps = useAnimatedProps(() => ({
    opacity: flicker.value,
  }));

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <RadialGradient id="glowGrad" cx="50%" cy="60%" r="50%">
            <Stop offset="0%" stopColor="#FF6A2A" stopOpacity="0.8" />
            <Stop offset="100%" stopColor="#FF4D00" stopOpacity="0" />
          </RadialGradient>
          <LinearGradient id="flameGrad" x1="50%" y1="100%" x2="50%" y2="0%">
            <Stop offset="0%" stopColor="#FF4D00" />
            <Stop offset="50%" stopColor="#FF7A30" />
            <Stop offset="100%" stopColor="#FFCC00" />
          </LinearGradient>
          <LinearGradient id="innerGrad" x1="50%" y1="100%" x2="50%" y2="0%">
            <Stop offset="0%" stopColor="#FF8A5A" />
            <Stop offset="100%" stopColor="#FFFBE0" />
          </LinearGradient>
          <RadialGradient id="coreGrad" cx="50%" cy="70%" r="30%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
            <Stop offset="100%" stopColor="#FFCC00" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Outer glow */}
        <AnimatedCircle cx="50" cy="58" fill="url(#glowGrad)" animatedProps={glowProps} />

        {/* Main flame body */}
        <Path
          d="M50 12 C50 12 62 26 66 38 C70 50 65 56 60 54 C64 44 56 36 52 28 C54 40 50 50 46 54 C40 58 35 52 38 42 C30 50 28 62 36 70 C42 76 58 76 64 70 C72 62 72 50 66 40 C62 32 56 20 50 12Z"
          fill="url(#flameGrad)"
        />

        {/* Inner bright flame */}
        <AnimatedPath
          d="M50 28 C50 28 57 38 59 46 C61 52 58 56 54 54 C57 48 53 42 50 36 C51 44 48 50 45 53 C41 56 38 52 40 46 C36 52 36 60 42 65 C46 68 54 68 58 65 C63 61 63 53 59 46 C57 41 54 34 50 28Z"
          fill="url(#innerGrad)"
          animatedProps={innerFlameProps}
        />

        {/* Core white hot center */}
        <Path
          d="M50 42 C50 42 54 47 54 52 C54 56 52 58 50 57 C48 58 46 56 46 52 C46 47 50 42 50 42Z"
          fill="url(#coreGrad)"
          opacity={0.9}
        />
      </Svg>
    </View>
  );
};

export default FlameLogo;
