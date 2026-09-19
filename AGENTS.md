# Agent Instructions

## OboxSTEAM.Mobile

Expo (React Native) app for OboxSTEAM — same backend as `OboxSTEAM.FE` /
`OboxSTEAM.API` (`EXPO_PUBLIC_API_URL`). Parent-first today; v2 adds thin
Student and Mentor surfaces that share the existing design tokens (not a second
product). Android-first (Expo Go / EAS APK).

**Read first for product work:**

- `.cursor/rules/context.mdc` — roles, routes, scope
- `.cursor/rules/expo-engineering-rule.mdc` — stack, API layout, SecureStore
- `.cursor/rules/styling-rule.mdc` — NativeWind tokens (do not invent brand)
- `.cursor/rules/api-spec.mdc` — OpenAPI sync + envelope mapping
- `.cursor/rules/agent-conduct.mdc` — confidence, Codegraph-first, lean replies
- Endpoint truth: `src/lib/api/**` + `specs/oboxsteam.openapi.json` (not a separate API rule file)

**Run:**

```bash
pnpm install
cp .env.example .env   # set EXPO_PUBLIC_API_URL
pnpm start:clean       # preferred on Android / Cursor (no Console Ninja hooks)
# or: pnpm start
```

Expo Go must match **project SDK** (see [expo.dev/go](https://expo.dev/go)).
Do not point a physical phone at `localhost` — use the VPS URL, or
`adb reverse` / emulator `10.0.2.2` for local API.

**API spec refresh** (same Swagger as FE):

```bash
pnpm sync:api-spec
# → specs/oboxsteam.openapi.json ; MCP obox-api reads ./specs
```

**Conventions:** pnpm only; `@/` → `src/`; auth tokens only in SecureStore;
Zod at request/response boundaries; Vietnamese copy aligned with FE Parent
phrasing; no FE `components/ui` / shadcn; role gate after `GET /api/account/me`
(unsupported roles → `blocked` + logout). Prefer existing tokens and components
over new hex or web-style multi-column dashboards.

---

## FE → Mobile API sync

Mobile **copies** needed modules from `OboxSTEAM.FE` (no git/npm link). When
backend contracts change, re-copy from FE, then re-apply mobile adaptations.

### Folders to re-copy from FE

| FE path | Mobile destination | Notes |
|---------|-------------------|--------|
| `lib/api/client.ts`, `create-endpoint.ts`, `errors.ts`, `schemas.ts` | `src/lib/api/` | Keep envelope helpers |
| `lib/api/config.ts` | `src/lib/api/config.ts` | Use `EXPO_PUBLIC_API_URL` / `src/lib/env.ts` |
| `lib/api/interceptors/` | `src/lib/api/interceptors/` | Token R/W → SecureStore session |
| `lib/api/auth/` | `src/lib/api/auth/` | login, refresh-token |
| `lib/api/account/` | `src/lib/api/account/` | at least `getCurrentUser` |
| `lib/api/parent/` | `src/lib/api/parent/` | links + progression |
| `lib/api/notifications/` | `src/lib/api/notifications/` | inbox, unread, mark read |
| `lib/api/entities/` | `src/lib/api/entities/` | user, linked-account, notification, pagination (+ deps) |
| `lib/validations/auth.ts`, `parent.ts`, `notifications.ts`, `account.ts` | `src/lib/validations/` | request Zod |
| `lib/auth/session.ts` | `src/lib/auth/session.ts` | **rewrite** storage → SecureStore; keep token shape |
| `lib/auth/roles.ts` | `src/lib/auth/roles.ts` | Parent + Student/Mentor helpers as roles ship |
| `lib/errors/types.ts`, `resolve-app-error.ts` | `src/lib/errors/` | replace Sonner with RN toast |
| `lib/realtime/notification-hub.ts` | `src/lib/realtime/` | SecureStore token |

**When checkout / payments ship:** re-add `lib/api/payments/` +
`lib/validations/payments.ts` (not present in mobile today).

**Upcoming (fill when implementing):** schedule/weekly APIs; mentor
`checkin-token`; student `checkin-by-token`; `media/upload`. Prefer FE wrappers
when they exist; otherwise Zod from OpenAPI (`pnpm sync:api-spec` + obox-api).

### After every re-copy

1. Rewrite imports to `@/` → `src/`.
2. Remove Next-only imports (`next/*`, RSC, Sonner, DOM).
3. Point auth interceptor at SecureStore session helpers.
4. Rebuild a **slim** `src/lib/api/index.ts` (role-needed exports only — no FE mega-barrel).
5. Run TypeScript check; smoke login + `me` on device.

### Do not re-copy

- `components/ui/*`, web `app/` pages, GSAP/Motion/TipTap, manager tables,
  Redux store, full `lib/api/index.ts`, Expert/LMS chrome.

---

## Roadmap (implementation order)

1. **ParentProgress IA** — flatten children list / child detail / enrollment
   timeline; one progress signal; keep tokens & `ScreenState` (no new BE).
2. **Schedule** — week strip + day list; Parent child switcher (existing weekly API).
3. **Mentor QR** — full-screen QR + 6-digit + countdown (`checkin-token`).
4. **Student check-in** — camera / paste code (`checkin-by-token` when BE ready).
5. **Mentor capture** — camera → preview → `media/upload` (+ `expo-camera`).

**Nav (v2):** role-based root after login. Parent tabs: Con / Lịch / Thông báo /
Tài khoản. Student: Lịch + Check-in. Mentor: today’s session → QR / Capture.
Manager/Expert stay on website (`blocked` pattern).

---

## CodeGraph

Local code knowledge graph for cheaper TS/TSX navigation.

**Cursor MCP:** copy `.cursor/mcp.example.json` → `.cursor/mcp.json` (gitignored),
set `codegraph` `--path` to your absolute checkout, then restart Cursor.
`obox-api` reads `./specs` (same on every machine).

Prefer graph tools (`explore`, `callers`, `node`) over grep loops for structure
questions. Still **Read** configs, docs, env, and rules directly. When CodeGraph
is unavailable, use Grep / Read and note the fallback in any plan.
