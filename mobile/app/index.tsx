import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native'; // ← add ScrollView
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import {
  MessageCircle,
  Lock,
  Users,
  Zap,
  type LucideIcon,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Button from '@/components/Button';
import { Colors, Spacing, Radius } from '@/constants/Colors';
import { storage, STORAGE_KEYS } from '@/utils/storage';

type FeatureItem = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const features: FeatureItem[] = [
  {
    icon: Lock,
    title: 'Secure & Private',
    description: 'Password-protected rooms ensure only invited participants can join',
  },
  {
    icon: Users,
    title: 'Fully Anonymous',
    description: 'No one knows who is speaking. Perfect for honest discussions',
  },
  {
    icon: Zap,
    title: 'Real-time Messaging',
    description: 'Messages appear instantly for everyone in the room',
  },
];

const FeatureCard: React.FC<{ feature: FeatureItem; index: number }> = ({ feature, index }) => {
  const translateY = useSharedValue(30);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(800 + index * 150, withSpring(0, { damping: 15, stiffness: 150 }));
    opacity.value = withDelay(800 + index * 150, withTiming(1, { duration: 400 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const Icon = feature.icon;

  return (
    <Animated.View style={[styles.featureCard, animatedStyle]}>
      <View style={styles.featureIconContainer}>
        <Icon size={24} color={Colors.accent.primary} strokeWidth={2} />
      </View>
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{feature.title}</Text>
        <Text style={styles.featureDescription}>{feature.description}</Text>
      </View>
    </Animated.View>
  );
};

export default function OnboardingScreen() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const titleY = useSharedValue(50);
  const titleOpacity = useSharedValue(0);
  const subtitleY = useSharedValue(50);
  const subtitleOpacity = useSharedValue(0);
  const buttonsY = useSharedValue(50);
  const buttonsOpacity = useSharedValue(0);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const user = await storage.getItem(STORAGE_KEYS.USER);
      if (user) {
        router.replace('/dashboard');
        return;
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsChecking(false);
      startAnimations();
    }
  };

  const startAnimations = () => {
    logoScale.value = withSpring(1, { damping: 12, stiffness: 100 });
    logoOpacity.value = withTiming(1, { duration: 400 });

    titleY.value = withDelay(200, withSpring(0, { damping: 15, stiffness: 150 }));
    titleOpacity.value = withDelay(200, withTiming(1, { duration: 400 }));

    subtitleY.value = withDelay(400, withSpring(0, { damping: 15, stiffness: 150 }));
    subtitleOpacity.value = withDelay(400, withTiming(1, { duration: 400 }));

    buttonsY.value = withDelay(600, withSpring(0, { damping: 15, stiffness: 150 }));
    buttonsOpacity.value = withDelay(600, withTiming(1, { duration: 400 }));
  };

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: titleY.value }],
    opacity: titleOpacity.value,
  }));

  const subtitleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: subtitleY.value }],
    opacity: subtitleOpacity.value,
  }));

  const buttonsAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: buttonsY.value }],
    opacity: buttonsOpacity.value,
  }));

  if (isChecking) {
    return (
      <View style={styles.loadingContainer}>
        <MessageCircle size={48} color={Colors.accent.primary} strokeWidth={2} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <LinearGradient
        colors={[`${Colors.accent.primary}20`, 'transparent']}
        style={styles.gradient}
      />

      {/* ↓ ScrollView replaces the plain View so content scrolls above the sticky buttons */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
          <LinearGradient
            colors={[Colors.accent.primary, Colors.accent.secondary]}
            style={styles.logo}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <MessageCircle size={40} color="#fff" strokeWidth={2.5} />
          </LinearGradient>
        </Animated.View>

        <Animated.View style={titleAnimatedStyle}>
          <Text style={styles.title}>
            Anonymous Chat{'\n'}
            <Text style={styles.titleAccent}>Made Simple</Text>
          </Text>
        </Animated.View>

        <Animated.Text style={[styles.subtitle, subtitleAnimatedStyle]}>
          Create secure, password-protected chat rooms in seconds. Share the link, and chat
          anonymously with anyone.
        </Animated.Text>

        <View style={styles.featuresContainer}>
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </View>
      </ScrollView>

      {/* Sticky button area sits outside the ScrollView so it's always visible */}
      <Animated.View style={[styles.buttonsContainer, buttonsAnimatedStyle]}>
        <Button onPress={() => router.push('/register')} size="lg" style={styles.button}>
          Create a Room
        </Button>
        <Button
          onPress={() => router.push('/login')}
          variant="secondary"
          size="lg"
          style={styles.button}
        >
          Sign In
        </Button>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 400,
  },
  // ↓ new: ScrollView takes up the space between top safe area and buttons
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,       // slightly tighter than xxl to reclaim space
    paddingBottom: Spacing.xl,    // breathing room above the sticky buttons
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,     // tightened from xl
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 36,
    fontFamily: 'Manrope_700Bold',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.md,
    lineHeight: 44,
  },
  titleAccent: {
    color: Colors.accent.primary,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Manrope_400Regular',
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.lg,    // tightened from xl
  },
  featuresContainer: {
    gap: Spacing.md,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: Colors.bg.secondary,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border.primary,
    padding: Spacing.md,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: Radius.sm,
    backgroundColor: Colors.accent.glow,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontFamily: 'Manrope_600SemiBold',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    fontFamily: 'Manrope_400Regular',
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  buttonsContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    paddingTop: Spacing.sm,      // small top pad so content doesn't clip right at the edge
    gap: Spacing.md,
    backgroundColor: Colors.bg.primary, // matches screen bg so it looks "sticky"
  },
  button: {
    width: '100%',
  },
});