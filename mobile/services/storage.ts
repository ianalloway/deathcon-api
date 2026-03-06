import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_PERSONA_ID } from '../constants/personas';

const KEYS = {
  MESSAGES: 'deathcon:messages',
  USAGE: 'deathcon:usage',
  ONBOARDING_DONE: 'deathcon:onboarding_done',
  IS_PRO: 'deathcon:is_pro',
  SELECTED_PERSONA: 'deathcon:persona',
} as const;

// ── Message History ──────────────────────────────────────────────────────────

export interface StoredMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  personaId: string;
  timestamp: string;
}

export async function getMessages(): Promise<StoredMessage[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.MESSAGES);
    return raw ? (JSON.parse(raw) as StoredMessage[]) : [];
  } catch {
    return [];
  }
}

export async function saveMessage(msg: StoredMessage): Promise<void> {
  const current = await getMessages();
  // Keep only the last 200 messages to avoid unbounded growth
  const updated = [...current, msg].slice(-200);
  await AsyncStorage.setItem(KEYS.MESSAGES, JSON.stringify(updated));
}

export async function clearMessages(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.MESSAGES);
}

// ── Daily Usage ──────────────────────────────────────────────────────────────

interface UsageRecord {
  date: string; // YYYY-MM-DD
  count: number;
}

function today(): string {
  return new Date().toISOString().split('T')[0];
}

export async function getUsageToday(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.USAGE);
    if (!raw) return 0;
    const record = JSON.parse(raw) as UsageRecord;
    return record.date === today() ? record.count : 0;
  } catch {
    return 0;
  }
}

export async function incrementUsage(): Promise<number> {
  const current = await getUsageToday();
  const next = current + 1;
  await AsyncStorage.setItem(
    KEYS.USAGE,
    JSON.stringify({ date: today(), count: next }),
  );
  return next;
}

// ── Onboarding ───────────────────────────────────────────────────────────────

export async function hasSeenOnboarding(): Promise<boolean> {
  const val = await AsyncStorage.getItem(KEYS.ONBOARDING_DONE);
  return val === 'true';
}

export async function markOnboardingDone(): Promise<void> {
  await AsyncStorage.setItem(KEYS.ONBOARDING_DONE, 'true');
}

// ── Subscription ─────────────────────────────────────────────────────────────

export async function getIsPro(): Promise<boolean> {
  const val = await AsyncStorage.getItem(KEYS.IS_PRO);
  return val === 'true';
}

export async function setIsPro(value: boolean): Promise<void> {
  await AsyncStorage.setItem(KEYS.IS_PRO, value ? 'true' : 'false');
}

// ── Persona ───────────────────────────────────────────────────────────────────

export async function getSelectedPersona(): Promise<string> {
  const val = await AsyncStorage.getItem(KEYS.SELECTED_PERSONA);
  return val ?? DEFAULT_PERSONA_ID;
}

export async function setSelectedPersona(personaId: string): Promise<void> {
  await AsyncStorage.setItem(KEYS.SELECTED_PERSONA, personaId);
}
