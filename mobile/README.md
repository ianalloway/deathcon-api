# Deathcon AI — Mobile App ⚰️

Cross-platform iOS + Android app built with Expo/React Native.
Powered by the [Deathcon API](../README.md) backend.

---

## Business Model

| Tier | Price | What you get |
|------|-------|--------------|
| Free | $0 | 10 messages/day, The Coach persona |
| Pro Monthly | $9.99/mo | Unlimited messages, all 4 personas, full history |
| Pro Yearly | $79.99/yr | Same as monthly, 33% savings |

**Revenue targets:**
- 500 Pro users → ~$5K/month
- 2,000 Pro users → ~$20K/month
- 10,000 Pro users → ~$100K/month

**Go-to-market:** TikTok/Instagram "AI coaching session" clips, r/selfimprovement, r/productivity, App Store optimization for "AI coach" / "life coach AI".

---

## The 4 AI Personas

| Persona | Tier | Style |
|---------|------|-------|
| ⚡ The Coach | Free | Action-first, no excuses |
| 🜃 The Philosopher | Pro | Stoic wisdom, Memento Mori |
| ♟️ The Strategist | Pro | Business systems, execution |
| 💀 The Mirror | Pro | Brutal honesty, zero filter |

---

## Quick Start

```bash
# 1. Install dependencies
cd mobile
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local — set EXPO_PUBLIC_API_URL to your backend

# 3. Start the Deathcon API backend
cd ..
python main.py  # runs on http://localhost:8000

# 4. Run the app
cd mobile
npx expo start
# Press 'i' for iOS simulator, 'a' for Android emulator
```

---

## Production Checklist

- [ ] Deploy Deathcon API to Render/Railway/Fly.io
- [ ] Set `EXPO_PUBLIC_API_URL` to deployed URL
- [ ] Add `assets/icon.png` (1024×1024) and `assets/splash.png`
- [ ] Integrate [RevenueCat](https://revenuecat.com) for real in-app purchases
  - Replace `upgradeToPro()` in `hooks/useUsage.ts` with RevenueCat purchase flow
- [ ] Set up push notifications with `expo-notifications`
- [ ] Add analytics (PostHog / Mixpanel)
- [ ] Submit to App Store + Google Play

---

## Project Structure

```
mobile/
├── app/
│   ├── _layout.tsx          # Root layout + onboarding redirect
│   ├── onboarding.tsx       # 3-slide onboarding flow
│   └── (tabs)/
│       ├── index.tsx        # Chat screen (main)
│       ├── history.tsx      # Conversation history
│       └── settings.tsx     # Settings + subscription
├── components/
│   ├── ChatBubble.tsx       # Message bubble with typing animation
│   ├── MessageInput.tsx     # Input bar with usage counter
│   ├── PersonaPicker.tsx    # Horizontal persona selector
│   └── PaywallModal.tsx     # Upgrade modal
├── hooks/
│   ├── useChat.ts           # Chat state + API calls
│   └── useUsage.ts          # Daily usage tracking + Pro state
├── services/
│   ├── api.ts               # Deathcon API client
│   └── storage.ts           # AsyncStorage persistence
└── constants/
    ├── theme.ts             # Colors, spacing, typography
    └── personas.ts          # Persona definitions + system prompts
```

---

Built by Deathconbot ⚰️ — *Memento Mori. Make the days count.*
