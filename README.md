# OboxSTEAM Mobile (Parent)

Separate Expo (React Native) app for the Parent MVP. Shares the same backend as `OboxSTEAM.FE` via HTTPS + Bearer tokens.

## Stack

| Layer | Choice |
|-------|--------|
| App | Expo SDK 57 + Expo Router |
| Language | TypeScript |
| Styling | NativeWind v4 + Obox brand tokens |
| Forms | Zod + react-hook-form |
| Auth storage | `expo-secure-store` |
| Icons | `lucide-react-native` |
| Package manager | pnpm |

## Setup

```bash
pnpm install
cp .env.example .env   # set EXPO_PUBLIC_API_URL
pnpm start             # Expo Go on a physical phone (preferred)
```

### Env

| Variable | Required | Notes |
|----------|----------|--------|
| `EXPO_PUBLIC_API_URL` | Yes | Same API as FE (e.g. `https://api.oboxsteam.website`) |

Do **not** point a physical phone at `localhost` — use the VPS URL, or `adb reverse` / Android emulator `10.0.2.2` for local API.

## Layout

```text
app/                 # Expo Router screens (Phase 0: setup smoke screen)
src/
  lib/
    api/             # Parent-trimmed FE API slice (next step)
    auth/            # SecureStore session + roles
    tokens/          # Brand colors / radii
    validations/     # Zod request schemas (next step)
    errors/          # App error resolve (next step)
  components/        # RN UI only — do not copy FE shadcn
```

## Phase status

- [x] Phase 0 — Expo + NativeWind + env + SecureStore session stub
- [x] Cursor rules + `SYNC.md` (FE re-copy checklist)
- [ ] Copy Parent API / validations / errors from FE
- [ ] Phase 1 screens (login, complete-profile, children, notifications, profile)
- [ ] EAS preview APK

## Agent rules & FE sync

- Cursor rules: `.cursor/rules/` (conduct, context, Expo engineering, NativeWind styling, Parent API map)
- When FE API contracts change: follow **[`SYNC.md`](./SYNC.md)**

## Device workflow

1. **Preferred:** Android phone + Expo Go matching **SDK 57** ([expo.dev/go](https://expo.dev/go?sdkVersion=57&platform=android&device=true) — Play Store may lag) → `pnpm start` → scan QR
2. **Fallback:** one Android Studio AVD (Pixel 6 / API 34, 2 GB RAM)
