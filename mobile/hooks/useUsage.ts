import { useState, useCallback, useEffect } from 'react';
import {
  getUsageToday,
  incrementUsage,
  getIsPro,
  setIsPro as persistIsPro,
} from '../services/storage';
import { FREE_MESSAGE_LIMIT } from '../constants/theme';

export function useUsage() {
  const [usedToday, setUsedToday] = useState(0);
  const [isPro, setIsProState] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    const [usage, pro] = await Promise.all([getUsageToday(), getIsPro()]);
    setUsedToday(usage);
    setIsProState(pro);
    setLoaded(true);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const canSend = isPro || usedToday < FREE_MESSAGE_LIMIT;
  const remaining = isPro ? Infinity : Math.max(0, FREE_MESSAGE_LIMIT - usedToday);

  const consume = useCallback(async () => {
    if (!isPro) {
      const next = await incrementUsage();
      setUsedToday(next);
    }
  }, [isPro]);

  // In a real app this would call RevenueCat / StoreKit.
  // For now it just flips the flag locally so you can test the full UX.
  const upgradeToPro = useCallback(async () => {
    await persistIsPro(true);
    setIsProState(true);
  }, []);

  const restorePurchases = useCallback(async () => {
    // Placeholder: call your payments backend here
    await load();
  }, [load]);

  return {
    usedToday,
    remaining,
    canSend,
    isPro,
    loaded,
    consume,
    upgradeToPro,
    restorePurchases,
    refresh: load,
  };
}
