import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADII, SPACING, FONT_SIZE } from '../constants/theme';
import { FREE_MESSAGE_LIMIT } from '../constants/theme';

interface Props {
  onSend: (text: string) => void;
  isLoading: boolean;
  canSend: boolean;
  remaining: number;
  isPro: boolean;
  onPaywallPress: () => void;
}

export default function MessageInput({
  onSend,
  isLoading,
  canSend,
  remaining,
  isPro,
  onPaywallPress,
}: Props) {
  const [text, setText] = useState('');
  const inputRef = useRef<TextInput>(null);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    if (!canSend) {
      onPaywallPress();
      return;
    }
    onSend(trimmed);
    setText('');
  };

  const isDisabled = !text.trim() || isLoading;
  const showUsageWarning = !isPro && remaining <= 3;

  return (
    <View style={styles.wrapper}>
      {showUsageWarning && (
        <TouchableOpacity
          style={styles.usageBanner}
          onPress={onPaywallPress}
          activeOpacity={0.8}
        >
          <Text style={styles.usageText}>
            {remaining === 0
              ? '⚰️ Daily limit reached — upgrade for unlimited'
              : `⚡ ${remaining} free message${remaining === 1 ? '' : 's'} left today`}
          </Text>
          <Text style={styles.upgradeLink}>Upgrade →</Text>
        </TouchableOpacity>
      )}

      <View style={styles.row}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder={
            canSend
              ? 'Ask anything...'
              : 'Daily limit reached — upgrade for unlimited'
          }
          placeholderTextColor={COLORS.textMuted}
          multiline
          maxLength={2000}
          returnKeyType="default"
          onSubmitEditing={Platform.OS === 'ios' ? undefined : handleSend}
          blurOnSubmit={false}
          editable={canSend}
          selectionColor={COLORS.accent}
        />

        {isLoading ? (
          <View style={styles.sendBtn}>
            <ActivityIndicator size="small" color={COLORS.accent} />
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.sendBtn, isDisabled && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={isDisabled && canSend}
            activeOpacity={0.75}
          >
            <Ionicons
              name="arrow-up"
              size={20}
              color={isDisabled ? COLORS.textMuted : COLORS.text}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.bg,
    paddingBottom: SPACING.sm,
  },
  usageBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  usageText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSub,
  },
  upgradeLink: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gold,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    gap: SPACING.sm,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADII.xl,
    paddingHorizontal: SPACING.md,
    paddingTop: Platform.OS === 'ios' ? 10 : 8,
    paddingBottom: Platform.OS === 'ios' ? 10 : 8,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: RADII.full,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: COLORS.surfaceAlt,
  },
});
