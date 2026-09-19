# Agent Instructions

## OboxSTEAM.Mobile

Expo (React Native) app for OboxSTEAM — same backend as `OboxSTEAM.FE` /
`OboxSTEAM.API` (`EXPO_PUBLIC_API_URL`). **Mobile v2** (locked): Parent UI
overhaul + weekly schedule; thin Student (schedule / QR check-in) and Mentor
(QR rotate / class-moment capture). Same design tokens — not a second product.
Android-first (Expo Go / EAS APK).

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

## Mobile v2 scope (locked)

### In scope

1. **Parent UI overhaul** — home + child detail (+ enrollment if needed): flatten
   stacked cards; lead with what’s next / blockers / new.
2. **Weekly schedule** — Parent (child via `studentId`) + Student —
   `GET /api/schedules/weekly`.
3. **Mentor QR rotate** — generate/rotate check-in token (~60s TTL) for offline
   sessions.
4. **Student QR check-in** — scan-first (needs BE `checkin-by-token`);
   `{ token }` or `{ code }` fallback.
5. **Mentor capture** — class moments via `POST /api/media/upload` (face
   pipeline); **not** session `evidence`.
6. **Role gate** — thin homes for Parent / Student / Mentor after
   `/api/account/me`; other roles → use website (`blocked`).
7. **Small add-on** — today’s check-in status on Parent child detail (after QR
   lands).

### Out of scope

- Parent payment CTA on mobile
- Parent photo gallery
- Session `evidence` on phone (stays on web)
- Full LMS (learn / quiz / research / portfolio edit)
- Manager / Expert chrome; inventing mobile-only endpoints; FE `components/ui`

### Implementation order

1. Parent UI overhaul  
2. Schedule (`/api/schedules/weekly`)  
3. Mentor QR + Student QR (Student waits on BE `checkin-by-token`)  
4. Mentor capture (`media/upload`)  
5. Parent child-detail check-in status (after QR)

**Nav (v2):** role-based root after login. Parent tabs: Con / Lịch / Thông báo /
Tài khoản. Student: Lịch + Check-in. Mentor: today’s session → QR / Capture.

---

## CodeGraph

Local code knowledge graph for cheaper TS/TSX navigation.

**Cursor MCP:** copy `.cursor/mcp.example.json` → `.cursor/mcp.json` (gitignored),
set `codegraph` `--path` to your absolute checkout, then restart Cursor.
`obox-api` reads `./specs` (same on every machine).

Prefer graph tools (`explore`, `callers`, `node`) over grep loops for structure
questions. Still **Read** configs, docs, env, and rules directly. When CodeGraph
is unavailable, use Grep / Read and note the fallback in any plan.
