import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { COLORS, RADII, SPACING, FONT_SIZE } from '../constants/theme';
import { getPersona } from '../constants/personas';
import type { Message } from '../hooks/useChat';

interface Props {
  message: Message;
}

function TypingDots() {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = (val: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(val, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(val, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      );

    const a1 = pulse(dot1, 0);
    const a2 = pulse(dot2, 160);
    const a3 = pulse(dot3, 320);
    a1.start();
    a2.start();
    a3.start();

    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
    };
  }, [dot1, dot2, dot3]);

  return (
    <View style={styles.dotsRow}>
      {[dot1, dot2, dot3].map((val, i) => (
        <Animated.View
          key={i}
          style={[styles.dot, { opacity: val }]}
        />
      ))}
    </View>
  );
}

export default function ChatBubble({ message }: Props) {
  const isUser = message.role === 'user';
  const persona = getPersona(message.personaId);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const isTyping = !isUser && message.content === '';
  const isError = message.error === true;

  return (
    <Animated.View
      style={[
        styles.row,
        isUser ? styles.rowUser : styles.rowAssistant,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      {!isUser && (
        <View style={[styles.avatar, { backgroundColor: persona.color + '25' }]}>
          <Text style={styles.avatarEmoji}>{persona.emoji}</Text>
        </View>
      )}

      <View
        style={[
          styles.bubble,
          isUser ? styles.bubbleUser : styles.bubbleAssistant,
          isError && styles.bubbleError,
        ]}
      >
        {isTyping ? (
          <TypingDots />
        ) : (
          <Text
            style={[
              styles.text,
              isUser ? styles.textUser : styles.textAssistant,
              isError && styles.textError,
            ]}
            selectable
          >
            {message.content}
          </Text>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    alignItems: 'flex-end',
  },
  rowUser: {
    justifyContent: 'flex-end',
  },
  rowAssistant: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: RADII.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
    marginBottom: 2,
  },
  avatarEmoji: {
    fontSize: 14,
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: RADII.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
  },
  bubbleUser: {
    backgroundColor: COLORS.userBubble,
    borderBottomRightRadius: RADII.xs,
  },
  bubbleAssistant: {
    backgroundColor: COLORS.assistantBubble,
    borderBottomLeftRadius: RADII.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bubbleError: {
    borderColor: COLORS.error + '60',
    backgroundColor: COLORS.error + '10',
  },
  text: {
    fontSize: FONT_SIZE.md,
    lineHeight: 22,
  },
  textUser: {
    color: COLORS.text,
  },
  textAssistant: {
    color: COLORS.text,
  },
  textError: {
    color: COLORS.error,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: RADII.full,
    backgroundColor: COLORS.textSub,
  },
});
