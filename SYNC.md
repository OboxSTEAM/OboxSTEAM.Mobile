# FE → Mobile API sync checklist

Mobile **copies** Parent-needed modules from `OboxSTEAM.FE` (no git/npm link). When backend contracts change, re-copy from FE, then re-apply mobile adaptations.

## Folders to re-copy from FE

| FE path | Mobile destination | Notes |
|---------|-------------------|--------|
| `lib/api/client.ts`, `create-endpoint.ts`, `errors.ts`, `schemas.ts` | `src/lib/api/` | Keep envelope helpers |
| `lib/api/config.ts` | `src/lib/api/config.ts` | Use `EXPO_PUBLIC_API_URL` / `src/lib/env.ts` |
| `lib/api/interceptors/` | `src/lib/api/interceptors/` | Token R/W → SecureStore session |
| `lib/api/auth/` | `src/lib/api/auth/` | login, refresh-token |
| `lib/api/account/` | `src/lib/api/account/` | at least `getCurrentUser` |
| `lib/api/parent/` | `src/lib/api/parent/` | all parent endpoints |
| `lib/api/payments/` | `src/lib/api/payments/` | parent-checkout, get-by-id, cancel as needed |
| `lib/api/notifications/` | `src/lib/api/notifications/` | inbox, unread, mark read |
| `lib/api/entities/` | `src/lib/api/entities/` | user, linked-account, notification, payment, pagination (+ deps) |
| `lib/validations/auth.ts`, `parent.ts`, `payments.ts`, `notifications.ts`, `account.ts` | `src/lib/validations/` | request Zod |
| `lib/auth/session.ts` | `src/lib/auth/session.ts` | **rewrite** storage → SecureStore; keep token shape |
| `lib/auth/roles.ts` | `src/lib/auth/roles.ts` | keep `isParentRole` |
| `lib/errors/types.ts`, `resolve-app-error.ts` | `src/lib/errors/` | replace Sonner with RN toast |
| `lib/realtime/notification-hub.ts` | `src/lib/realtime/` | phase 1b; SecureStore token |

Optional: refresh FE OpenAPI first (`pnpm sync:api-spec` in FE), then update copied Zod if DTOs changed.

## After every re-copy

1. Rewrite imports to `@/` → `src/`.
2. Remove Next-only imports (`next/*`, RSC, Sonner, DOM).
3. Point auth interceptor at SecureStore session helpers.
4. Rebuild a **slim** `src/lib/api/index.ts` (Parent-used exports only — no FE mega-barrel).
5. Run TypeScript check; smoke login + `me` on device.

## Do not re-copy

- `components/ui/*`, web `app/` pages, GSAP/Motion/TipTap, manager tables, Redux store, full `lib/api/index.ts`.
