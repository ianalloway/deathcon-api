import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  SectionList,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADII, SPACING, FONT_SIZE } from '../../constants/theme';
import { getMessages, clearMessages, StoredMessage } from '../../services/storage';
import { getPersona } from '../../constants/personas';

interface ConversationGroup {
  title: string;
  data: StoredMessage[][];
}

function groupByDate(messages: StoredMessage[]): ConversationGroup[] {
  if (messages.length === 0) return [];

  // Split into conversation sessions (gap > 30 min = new session)
  const sessions: StoredMessage[][] = [];
  let current: StoredMessage[] = [];

  for (let i = 0; i < messages.length; i++) {
    if (i === 0) {
      current.push(messages[i]);
      continue;
    }
    const prev = new Date(messages[i - 1].timestamp).getTime();
    const curr = new Date(messages[i].timestamp).getTime();
    if (curr - prev > 30 * 60 * 1000) {
      if (current.length > 0) sessions.push(current);
      current = [];
    }
    current.push(messages[i]);
  }
  if (current.length > 0) sessions.push(current);

  // Group sessions by date label
  const dateMap = new Map<string, StoredMessage[][]>();
  for (const session of sessions) {
    const date = new Date(session[0].timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    let label: string;
    if (date.toDateString() === today.toDateString()) {
      label = 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      label = 'Yesterday';
    } else {
      label = date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      });
    }

    const existing = dateMap.get(label) ?? [];
    dateMap.set(label, [...existing, session]);
  }

  return Array.from(dateMap.entries())
    .map(([title, data]) => ({ title, data }))
    .reverse();
}

function SessionCard({ session }: { session: StoredMessage[] }) {
  const firstUser = session.find((m) => m.role === 'user');
  const firstAssistant = session.find((m) => m.role === 'assistant');
  const persona = getPersona(session[0]?.personaId ?? 'coach');
  const time = new Date(session[0].timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
  const messageCount = session.length;

  return (
    <View style={styles.sessionCard}>
      <View style={styles.sessionHeader}>
        <View style={styles.sessionPersona}>
          <Text style={styles.personaEmoji}>{persona.emoji}</Text>
          <Text style={[styles.personaName, { color: persona.color }]}>
            {persona.name}
          </Text>
        </View>
        <Text style={styles.sessionTime}>{time}</Text>
      </View>

      {firstUser && (
        <Text style={styles.preview} numberOfLines={2}>
          {firstUser.content}
        </Text>
      )}
      {firstAssistant && (
        <Text style={styles.previewAssistant} numberOfLines={1}>
          ↳ {firstAssistant.content}
        </Text>
      )}

      <Text style={styles.messageCount}>
        {messageCount} message{messageCount !== 1 ? 's' : ''}
      </Text>
    </View>
  );
}

export default function HistoryScreen() {
  const [groups, setGroups] = useState<ConversationGroup[]>([]);

  const load = useCallback(async () => {
    const msgs = await getMessages();
    setGroups(groupByDate(msgs));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const handleClear = () => {
    Alert.alert(
      'Clear All History',
      'This will permanently delete all your conversations.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            await clearMessages();
            setGroups([]);
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>History</Text>
        {groups.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={styles.clearBtn}>
            <Ionicons name="trash-outline" size={20} color={COLORS.textSub} />
          </TouchableOpacity>
        )}
      </View>

      {groups.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>📜</Text>
          <Text style={styles.emptyTitle}>No conversations yet</Text>
          <Text style={styles.emptyBody}>
            Your chat history will appear here.
          </Text>
        </View>
      ) : (
        <SectionList
          sections={groups}
          keyExtractor={(item, idx) => item[0]?.id ?? String(idx)}
          renderItem={({ item }) => <SessionCard session={item} />}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.text,
  },
  clearBtn: {
    padding: SPACING.sm,
  },
  list: {
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  sectionHeader: {
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.textSub,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  sessionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionPersona: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  personaEmoji: {
    fontSize: 14,
  },
  personaName: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  sessionTime: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSub,
  },
  preview: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    lineHeight: 20,
  },
  previewAssistant: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSub,
    lineHeight: 18,
  },
  messageCount: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
    paddingHorizontal: SPACING.xl,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.text,
  },
  emptyBody: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSub,
    textAlign: 'center',
  },
});
