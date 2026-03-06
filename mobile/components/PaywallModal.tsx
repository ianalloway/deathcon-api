import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADII, SPACING, FONT_SIZE } from '../constants/theme';
import { PERSONAS } from '../constants/personas';

interface Props {
  visible: boolean;
  onClose: () => void;
  onUpgrade: (plan: 'monthly' | 'yearly') => void;
}

const FEATURES = [
  { icon: '♾️', label: 'Unlimited messages, every day' },
  { icon: '🜃', label: 'The Philosopher — Stoic wisdom' },
  { icon: '♟️', label: 'The Strategist — Business edge' },
  { icon: '💀', label: 'The Mirror — Brutal honesty' },
  { icon: '📜', label: 'Full conversation history' },
  { icon: '⚡', label: 'Priority response speed' },
];

export default function PaywallModal({ visible, onClose, onUpgrade }: Props) {
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('yearly');

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Close button */}
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Ionicons name="close" size={22} color={COLORS.textSub} />
        </TouchableOpacity>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {/* Header */}
          <Text style={styles.skull}>⚰️</Text>
          <Text style={styles.title}>Deathcon Pro</Text>
          <Text style={styles.subtitle}>
            Unlock the full arsenal. No limits, no excuses.
          </Text>

          {/* Features */}
          <View style={styles.features}>
            {FEATURES.map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <Text style={styles.featureIcon}>{f.icon}</Text>
                <Text style={styles.featureLabel}>{f.label}</Text>
              </View>
            ))}
          </View>

          {/* Plan toggle */}
          <View style={styles.planRow}>
            <Pressable
              style={[styles.planCard, plan === 'monthly' && styles.planSelected]}
              onPress={() => setPlan('monthly')}
            >
              <Text style={styles.planLabel}>Monthly</Text>
              <Text style={styles.planPrice}>$9.99</Text>
              <Text style={styles.planPer}>per month</Text>
            </Pressable>

            <Pressable
              style={[styles.planCard, plan === 'yearly' && styles.planSelected]}
              onPress={() => setPlan('yearly')}
            >
              <View style={styles.bestValueBadge}>
                <Text style={styles.bestValueText}>BEST VALUE</Text>
              </View>
              <Text style={styles.planLabel}>Yearly</Text>
              <Text style={styles.planPrice}>$79.99</Text>
              <Text style={styles.planPer}>$6.67/month</Text>
              <Text style={styles.planSave}>Save 33%</Text>
            </Pressable>
          </View>

          {/* CTA */}
          <TouchableOpacity
            style={styles.ctaBtn}
            onPress={() => onUpgrade(plan)}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaText}>
              {plan === 'yearly'
                ? 'Start Pro — $79.99/year'
                : 'Start Pro — $9.99/month'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.legalText}>
            Cancel anytime. Payment processed securely via App Store / Google Play.
          </Text>

          <TouchableOpacity onPress={onClose} style={styles.laterBtn}>
            <Text style={styles.laterText}>Maybe later</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  closeBtn: {
    position: 'absolute',
    top: SPACING.lg,
    right: SPACING.lg,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: RADII.full,
    backgroundColor: COLORS.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    padding: SPACING.xl,
    paddingTop: SPACING.xl * 2,
    alignItems: 'center',
  },
  skull: {
    fontSize: 56,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSub,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 22,
  },
  features: {
    alignSelf: 'stretch',
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  featureIcon: {
    fontSize: 18,
    width: 28,
    textAlign: 'center',
  },
  featureLabel: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    flex: 1,
  },
  planRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    alignSelf: 'stretch',
    marginBottom: SPACING.lg,
  },
  planCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
  },
  planSelected: {
    borderColor: COLORS.gold,
    backgroundColor: COLORS.goldSoft,
  },
  bestValueBadge: {
    position: 'absolute',
    top: -10,
    backgroundColor: COLORS.gold,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADII.full,
  },
  bestValueText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: '#000',
  },
  planLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSub,
    marginBottom: 2,
    marginTop: SPACING.sm,
  },
  planPrice: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.text,
  },
  planPer: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSub,
    marginTop: 2,
  },
  planSave: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.success,
    fontWeight: '600',
    marginTop: 2,
  },
  ctaBtn: {
    alignSelf: 'stretch',
    backgroundColor: COLORS.accent,
    borderRadius: RADII.full,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  ctaText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  legalText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: SPACING.lg,
  },
  laterBtn: {
    paddingVertical: SPACING.sm,
  },
  laterText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSub,
  },
});
