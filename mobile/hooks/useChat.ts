import { useState, useCallback, useRef, useEffect } from 'react';
import { sendMessage, APIError } from '../services/api';
import {
  getMessages,
  saveMessage,
  clearMessages,
  StoredMessage,
} from '../services/storage';
import { getPersona } from '../constants/personas';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  personaId: string;
  timestamp: string;
  error?: boolean;
}

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useChat(personaId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Load persisted history on mount / persona change
  useEffect(() => {
    (async () => {
      const stored = await getMessages();
      setMessages(stored as Message[]);
    })();
  }, []);

  const send = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;
      setError(null);

      const userMsg: Message = {
        id: makeId(),
        role: 'user',
        content: text.trim(),
        personaId,
        timestamp: new Date().toISOString(),
      };

      // Optimistically add user message
      setMessages((prev) => [...prev, userMsg]);
      await saveMessage(userMsg as StoredMessage);

      // Placeholder while waiting for response
      const placeholderId = makeId();
      const placeholder: Message = {
        id: placeholderId,
        role: 'assistant',
        content: '',
        personaId,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, placeholder]);

      setIsLoading(true);
      abortRef.current = new AbortController();

      try {
        const persona = getPersona(personaId);
        const response = await sendMessage(
          text.trim(),
          persona.systemPrompt,
          abortRef.current.signal,
        );

        const assistantMsg: Message = {
          id: placeholderId,
          role: 'assistant',
          content: response.response,
          personaId,
          timestamp: new Date().toISOString(),
        };

        // Replace placeholder with real response
        setMessages((prev) =>
          prev.map((m) => (m.id === placeholderId ? assistantMsg : m)),
        );
        await saveMessage(assistantMsg as StoredMessage);
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;

        const errText =
          err instanceof APIError
            ? err.message
            : 'Something went wrong. Check your API connection.';

        setError(errText);
        // Replace placeholder with error state
        setMessages((prev) =>
          prev.map((m) =>
            m.id === placeholderId
              ? { ...m, content: errText, error: true }
              : m,
          ),
        );
      } finally {
        setIsLoading(false);
        abortRef.current = null;
      }
    },
    [isLoading, personaId],
  );

  const clear = useCallback(async () => {
    await clearMessages();
    setMessages([]);
    setError(null);
  }, []);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { messages, isLoading, error, send, clear, cancel };
}
