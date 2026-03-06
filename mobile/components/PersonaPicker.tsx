import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PERSONAS, Persona } from '../constants/personas';
import { COLORS, RADII, SPACING, FONT_SIZE } from '../constants/theme';

interface Props {
  selectedId: string;
  isPro: boolean;
  onSelect: (persona: Persona) => void;
  onProPress: () => void;
}

export default function PersonaPicker({
  selectedId,
  isPro,
  onSelect,
  onProPress,
}: Props) {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {PERSONAS.map((p) => {
          const isSelected = p.id === selectedId;
          const locked = p.pro && !isPro;

          return (
            <TouchableOpacity
              key={p.id}
              style={[
                styles.card,
                isSelected && {
                  borderColor: p.color,
                  backgroundColor: p.color + '15',
                },
              ]}
              onPress={() => (locked ? onProPress() : onSelect(p))}
              activeOpacity={0.75}
            >
              <View style={styles.cardTop}>
                <Text style={styles.emoji}>{p.emoji}</Text>
                {locked && (
                  <Ionicons
                    name="lock-closed"
                    size={11}
                    color={COLORS.gold}
                    style={styles.lockIcon}
                  />
                )}
              </View>
              <Text
                style={[styles.name, isSelected && { color: p.color }]}
                numberOfLines={1}
              >
                {p.name}
              </Text>
              <Text style={styles.tagline} numberOfLines={1}>
                {p.tagline}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  scroll: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  card: {
    width: 90,
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    padding: SPACING.sm,
    alignItems: 'flex-start',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 4,
  },
  emoji: {
    fontSize: 20,
  },
  lockIcon: {
    marginLeft: 'auto',
  },
  name: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
    fontWeight: '600',
  },
  tagline: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSub,
    marginTop: 1,
  },
});
