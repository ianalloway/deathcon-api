import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  SafeAreaView,
  Switch,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADII, SPACING, FONT_SIZE } from '../../constants/theme';
import { FREE_MESSAGE_LIMIT } from '../../constants/theme';
import { clearMessages, getIsPro } from '../../services/storage';
import { useUsage } from '../../hooks/useUsage';
import { API_URL } from '../../services/api';
import { checkHealth } from '../../services/api';
import PaywallModal from '../../components/PaywallModal';

function SettingRow({
  icon,
  label,
  value,
  onPress,
  danger,
  right,
}: {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
  right?: React.ReactNode;
}) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <View style={styles.rowLeft}>
        <Ionicons
          name={icon as any}
          size={20}
          color={danger ? COLORS.error : COLORS.textSub}
          style={styles.rowIcon}
        />
        <Text style={[styles.rowLabel, danger && { color: COLORS.error }]}>
          {label}
        </Text>
      </View>
      {right ?? (
        <View style={styles.rowRight}>
          {value && <Text style={styles.rowValue}>{value}</Text>}
          {onPress && (
            <Ionicons
              name="chevron-forward"
              size={16}
              color={COLORS.textMuted}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
}

export default function SettingsScreen() {
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [apiHealthy, setApiHealthy] = useState<boolean | null>(null);
  const { usedToday, isPro, upgradeToPro, restorePurchases, refresh } =
    useUsage();

  useFocusEffect(
    useCallback(() => {
      refresh();
      checkHealth().then(setApiHealthy);
    }, [refresh]),
  );

  const handleUpgrade = async (plan: 'monthly' | 'yearly') => {
    await upgradeToPro();
    setPaywallVisible(false);
    Alert.alert('🎉 Pro Activated', 'Unlimited access unlocked.');
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear History',
      'Delete all conversations? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await clearMessages();
            Alert.alert('Done', 'Chat history cleared.');
          },
        },
      ],
    );
  };

  const handleRestore = async () => {
    await restorePurchases();
    Alert.alert(
      'Restore Complete',
      isPro ? 'Pro subscription restored!' : 'No active subscription found.',
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Profile header */}
        <View style={styles.profileHeader}>
          <Text style={styles.skull}>⚰️</Text>
          <Text style={styles.appName}>Deathcon AI</Text>
          {isPro ? (
            <View style={styles.proBadge}>
              <Text style={styles.proBadgeText}>⚡ PRO</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.upgradeBtn}
              onPress={() => setPaywallVisible(true)}
              activeOpacity={0.85}
            >
              <Text style={styles.upgradeBtnText}>Upgrade to Pro →</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Usage */}
        {!isPro && (
          <Section title="Usage">
            <View style={styles.usageBar}>
              <View style={styles.usageBarLabels}>
                <Text style={styles.usageLabel}>Today's messages</Text>
                <Text style={styles.usageCount}>
                  {usedToday} / {FREE_MESSAGE_LIMIT}
                </Text>
              </View>
              <View style={styles.track}>
                <View
                  style={[
                    styles.fill,
                    {
                      width: `${Math.min(
                        (usedToday / FREE_MESSAGE_LIMIT) * 100,
                        100,
                      )}%`,
                      backgroundColor:
                        usedToday >= FREE_MESSAGE_LIMIT
                          ? COLORS.error
                          : COLORS.accent,
                    },
                  ]}
                />
              </View>
            </View>
          </Section>
        )}

        {/* Subscription */}
        <Section title="Subscription">
          {isPro ? (
            <SettingRow
              icon="checkmark-circle"
              label="Deathcon Pro — Active"
              value="Unlimited"
            />
          ) : (
            <SettingRow
              icon="rocket-outline"
              label="Upgrade to Pro"
              onPress={() => setPaywallVisible(true)}
            />
          )}
          <SettingRow
            icon="refresh-outline"
            label="Restore Purchases"
            onPress={handleRestore}
          />
        </Section>

        {/* API */}
        <Section title="Connection">
          <SettingRow
            icon={apiHealthy === true ? 'cloud-done' : apiHealthy === false ? 'cloud-offline' : 'cloud-outline'}
            label="API Status"
            value={
              apiHealthy === null
                ? 'Checking...'
                : apiHealthy
                ? 'Connected'
                : 'Offline'
            }
          />
          <SettingRow icon="link-outline" label="API Endpoint" value={API_URL} />
        </Section>

        {/* Data */}
        <Section title="Data">
          <SettingRow
            icon="trash-outline"
            label="Clear Chat History"
            onPress={handleClearHistory}
            danger
          />
        </Section>

        {/* About */}
        <Section title="About">
          <SettingRow icon="information-circle-outline" label="Version" value="1.0.0" />
          <SettingRow
            icon="skull-outline"
            label="Memento Mori"
            value="Remember you will die"
          />
        </Section>

        <Text style={styles.footer}>
          Built by Deathconbot ⚰️{'\n'}
          Remember: every day counts.
        </Text>
      </ScrollView>

      <PaywallModal
        visible={paywallVisible}
        onClose={() => setPaywallVisible(false)}
        onUpgrade={handleUpgrade}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scroll: {
    paddingBottom: SPACING.xxl,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SPACING.sm,
  },
  skull: {
    fontSize: 52,
  },
  appName: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.text,
  },
  proBadge: {
    backgroundColor: COLORS.goldSoft,
    borderWidth: 1,
    borderColor: COLORS.gold,
    borderRadius: RADII.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  proBadgeText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.gold,
  },
  upgradeBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: RADII.full,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  upgradeBtnText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.text,
  },
  section: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.textSub,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: SPACING.sm,
  },
  sectionContent: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rowIcon: {
    marginRight: SPACING.md,
  },
  rowLabel: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    flex: 1,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  rowValue: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSub,
    maxWidth: 160,
    textAlign: 'right',
  },
  usageBar: {
    padding: SPACING.md,
  },
  usageBarLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  usageLabel: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
  },
  usageCount: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSub,
    fontWeight: '600',
  },
  track: {
    height: 6,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADII.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: RADII.full,
  },
  footer: {
    marginTop: SPACING.xxl,
    textAlign: 'center',
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
    lineHeight: 20,
  },
});
