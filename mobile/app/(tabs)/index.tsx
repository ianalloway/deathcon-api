import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE } from '../../constants/theme';
import { getPersona } from '../../constants/personas';
import { getSelectedPersona, setSelectedPersona } from '../../services/storage';
import { useChat } from '../../hooks/useChat';
import { useUsage } from '../../hooks/useUsage';
import ChatBubble from '../../components/ChatBubble';
import MessageInput from '../../components/MessageInput';
import PersonaPicker from '../../components/PersonaPicker';
import PaywallModal from '../../components/PaywallModal';
import type { Persona } from '../../constants/personas';

export default function ChatScreen() {
  const [personaId, setPersonaId] = useState('coach');
  const [paywallVisible, setPaywallVisible] = useState(false);
  const flatRef = useRef<FlatList>(null);

  const { messages, isLoading, error, send, clear } = useChat(personaId);
  const { canSend, remaining, isPro, consume, upgradeToPro, refresh } = useUsage();

  // Reload usage when screen gains focus (e.g., returning from settings)
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  // Load saved persona on mount
  useEffect(() => {
    getSelectedPersona().then(setPersonaId);
  }, []);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 80);
    }
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!canSend) {
      setPaywallVisible(true);
      return;
    }
    await consume();
    send(text);
  };

  const handlePersonaSelect = async (persona: Persona) => {
    setPersonaId(persona.id);
    await setSelectedPersona(persona.id);
  };

  const handleUpgrade = async (plan: 'monthly' | 'yearly') => {
    // In production: integrate RevenueCat / StoreKit here
    // For now, simulate a successful purchase
    await upgradeToPro();
    setPaywallVisible(false);
    Alert.alert(
      '🎉 Welcome to Pro',
      "You now have unlimited messages and all 4 personas. Let's get to work.",
    );
  };

  const handleClear = () => {
    Alert.alert(
      'Clear Conversation',
      'This will delete all messages. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: clear },
      ],
    );
  };

  const persona = getPersona(personaId);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerEmoji}>{persona.emoji}</Text>
          <View>
            <Text style={styles.headerName}>{persona.name}</Text>
            <Text style={styles.headerTagline}>{persona.tagline}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleClear} style={styles.headerBtn}>
          <Ionicons name="trash-outline" size={20} color={COLORS.textSub} />
        </TouchableOpacity>
      </View>

      {/* Persona picker */}
      <PersonaPicker
        selectedId={personaId}
        isPro={isPro}
        onSelect={handlePersonaSelect}
        onProPress={() => setPaywallVisible(true)}
      />

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {messages.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>{persona.emoji}</Text>
            <Text style={styles.emptyTitle}>Start a conversation</Text>
            <Text style={styles.emptyBody}>{persona.description}</Text>
          </View>
        ) : (
          <FlatList
            ref={flatRef}
            data={messages}
            keyExtractor={(m) => m.id}
            renderItem={({ item }) => <ChatBubble message={item} />}
            contentContainerStyle={styles.messageList}
            showsVerticalScrollIndicator={false}
            keyboardDismissMode="interactive"
          />
        )}

        <MessageInput
          onSend={handleSend}
          isLoading={isLoading}
          canSend={canSend}
          remaining={remaining}
          isPro={isPro}
          onPaywallPress={() => setPaywallVisible(true)}
        />
      </KeyboardAvoidingView>

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
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerEmoji: {
    fontSize: 26,
  },
  headerName: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  headerTagline: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSub,
    marginTop: 1,
  },
  headerBtn: {
    padding: SPACING.sm,
  },
  messageList: {
    paddingVertical: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    gap: SPACING.md,
  },
  emptyEmoji: {
    fontSize: 56,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  emptyBody: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSub,
    textAlign: 'center',
    lineHeight: 22,
  },
});
