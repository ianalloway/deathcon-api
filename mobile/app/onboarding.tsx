import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Animated,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { markOnboardingDone } from '../services/storage';
import { COLORS, RADII, SPACING, FONT_SIZE } from '../constants/theme';
import { PERSONAS } from '../constants/personas';

const { width } = Dimensions.get('window');

interface Slide {
  id: string;
  emoji: string;
  title: string;
  body: string;
  cta?: string;
}

const SLIDES: Slide[] = [
  {
    id: 'welcome',
    emoji: '⚰️',
    title: 'Memento Mori',
    body:
      'You will die. Every day you waste is gone forever.\n\nDeathcon AI is your unflinching coach, philosopher, and strategist — built to make the days you have count.',
  },
  {
    id: 'personas',
    emoji: '🎭',
    title: 'Choose Your Guide',
    body:
      'Free: The Coach — direct, action-first.\n\nPro: The Philosopher, The Strategist, and The Mirror — for those who want the full truth.',
  },
  {
    id: 'start',
    emoji: '💀',
    title: 'Start for Free',
    body:
      '10 free messages every day. Upgrade anytime for unlimited access, all 4 personas, and full history.',
    cta: 'Start Now',
  },
];

export default function Onboarding() {
  const flatRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleFinish = async () => {
    await markOnboardingDone();
    router.replace('/(tabs)');
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      handleFinish();
    }
  };

  const isLast = currentIndex === SLIDES.length - 1;

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ref={flatRef}
        data={SLIDES}
        keyExtractor={(s) => s.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(idx);
        }}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Text style={styles.slideEmoji}>{item.emoji}</Text>
            <Text style={styles.slideTitle}>{item.title}</Text>
            <Text style={styles.slideBody}>{item.body}</Text>
          </View>
        )}
      />

      {/* Dots */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === currentIndex && styles.dotActive]}
          />
        ))}
      </View>

      {/* CTA */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.nextBtn}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <Text style={styles.nextText}>
            {isLast ? 'Start Now — Free' : 'Continue'}
          </Text>
        </TouchableOpacity>

        {!isLast && (
          <TouchableOpacity onPress={handleFinish} style={styles.skipBtn}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxl,
  },
  slideEmoji: {
    fontSize: 80,
    marginBottom: SPACING.xl,
  },
  slideTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  slideBody: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSub,
    textAlign: 'center',
    lineHeight: 24,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.lg,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: RADII.full,
    backgroundColor: COLORS.surfaceAlt,
  },
  dotActive: {
    backgroundColor: COLORS.accent,
    width: 18,
  },
  footer: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xl,
    gap: SPACING.md,
  },
  nextBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: RADII.full,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  nextText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  skipText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSub,
  },
});
