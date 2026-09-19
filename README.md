# OboxSTEAM Mobile

Expo (React Native) client for OboxSTEAM — same HTTPS API as `OboxSTEAM.FE` /
`OboxSTEAM.API`. Parent-first; Student and Mentor thin surfaces planned (see
[`AGENTS.md`](./AGENTS.md)).

## Stack

| Layer           | Choice                            |
| -----------------| -----------------------------------|
| App             | Expo SDK 57 + Expo Router         |
| Language        | TypeScript                        |
| Styling         | NativeWind v4 + Obox brand tokens |
| Forms           | Zod + react-hook-form             |
| Auth storage    | `expo-secure-store`               |
| Icons           | `lucide-react-native`             |
| Package manager | pnpm                              |

## Setup

```bash
pnpm install
cp .env.example .env   # set EXPO_PUBLIC_API_URL
pnpm start:clean       # Expo without Console Ninja hooks (preferred on Android)
# or: pnpm start
```

> If Expo Go kicks back to home: use **`pnpm start:clean`**, and in Cursor run
> **Console Ninja: Pause**. Do not use Play Store Expo Go for SDK 57 — install
> from [expo.dev/go](https://expo.dev/go?sdkVersion=57&platform=android&device=true).

### Env

| Variable | Required | Notes |
|----------|----------|--------|
| `EXPO_PUBLIC_API_URL` | Yes | Same API as FE (e.g. `https://api.oboxsteam.website`) |

Do **not** point a physical phone at `localhost` — use the VPS URL, or
`adb reverse` / Android emulator `10.0.2.2` for local API.

## Layout

```text
app/                 # Expo Router screens
src/
  lib/
    api/             # API client + domain helpers + interceptors
    auth/            # SecureStore session + roles
    tokens/          # Brand colors / radii
    validations/     # Zod request schemas
    errors/          # App error resolve → RN toast
  components/        # RN UI only — do not copy FE shadcn
```

## Status (v2)

- [x] Expo + NativeWind + SecureStore session
- [x] Parent auth gate, children list, progression, notifications, profile
- [x] Agent entry (`AGENTS.md`) + OpenAPI sync
- [ ] Parent UI overhaul (what’s next / blockers / new)
- [ ] Weekly schedule — Parent + Student (`GET /api/schedules/weekly`)
- [ ] Mentor QR rotate + Student QR check-in
- [ ] Mentor capture (`POST /api/media/upload`)
- [ ] Parent child-detail today’s check-in status
- [ ] EAS preview APK (optional)

See locked scope + order in [`AGENTS.md`](./AGENTS.md).

## Agent context

New sessions: start at **[`AGENTS.md`](./AGENTS.md)**. Cursor rules live under
`.cursor/rules/`. OpenAPI: `pnpm sync:api-spec` → `specs/oboxsteam.openapi.json`
(MCP **obox-api**). Local MCP: copy `.cursor/mcp.example.json` → `.cursor/mcp.json`
and set your Codegraph absolute path (file is gitignored).

## Device workflow

1. **Preferred:** Android phone + Expo Go matching **SDK 57** → `pnpm start:clean` → scan QR
2. **Fallback:** Android Studio AVD (Pixel 6 / API 34)

`.npmrc` uses `node-linker=hoisted` (required for stable Expo Go with pnpm).
