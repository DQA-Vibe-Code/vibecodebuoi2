# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

- `npm run dev` — dev server at http://localhost:3000
- `npm run build` — production build (also type-checks); `npx tsc --noEmit` for a faster type check
- `npm run lint` — ESLint (currently clean)
- No test runner is configured.
- Add UI components with `npx shadcn@latest add <name>` (style `base-nova`, built on `@base-ui/react`, not Radix — APIs differ, e.g. `render={...}` props instead of `asChild`).

## Architecture

Next.js App Router + TypeScript + Tailwind + shadcn/ui + lucide-react, source under `src/` (alias `@/*`). UI text is Vietnamese (`<html lang="vi">`); keep new strings in Vietnamese.

- `/` redirects to `/dashboard` ([src/app/page.tsx](src/app/page.tsx)).
- `/login` — [login-form.tsx](src/components/login-form.tsx) (shadcn login-04 layout) signs in with Firebase email/password and Google popup, plus register mode and password reset. Firebase error codes are mapped to Vietnamese in `translateError`.
- `/dashboard` — greeting, payment cards, engagement bar chart, balance area chart and payment history in a fintech-style layout (`src/components/dashboard/*`, all sample data). Pages share `AppShell` = sidebar-07 `AppSidebar` (team header, `nav-links`, `nav-main`, `nav-projects`, `nav-user`) + `TopNav` (pill nav, user menu); pill-nav entries are in `nav-items.ts`. `site-header`, `section-cards`, `chart-area-interactive`, `data-table` (dashboard-01) are no longer used.
- `/tasks` — feature module in `src/features/tasks/` (`components/`, `services/`, `types.ts`, `constants.ts`). `services/tasks-service.ts` does Firestore CRUD on the `tasks` collection (`getTasks`, `getTask`, `createTask`, `updateTask`, `deleteTask`). Pages are thin: `src/app/tasks/page.tsx` wraps `<TasksPage />` in `AppShell` ([app-shell.tsx](src/components/app-shell.tsx): AuthGuard + sidebar + top nav, shared with `/dashboard`). 
- `/customers` — feature module in `src/features/customers/`, same layout as tasks plus `schema.ts` (Zod). Form uses React Hook Form + `zodResolver`; list uses TanStack Table v9 (`useTable` + `tableFeatures`, not v8's `useReactTable`), default-sorted by priority high → medium → low via a custom `sortFn`. `assignedTo`/`createdBy`/`updatedBy` are stored as Firestore `DocumentReference`s to `users/{uid}` and converted to uid strings in the service. The `users` collection is written by `AuthProvider` on every sign-in (`src/lib/users-service.ts`). Interactions (call/email/meeting/note) live in the subcollection `customers/{id}/activities` (`activities-service.ts`, `date` stored as a Timestamp, exposed as `yyyy-mm-dd`), shown in `customer-detail-sheet.tsx`. Attachments: metadata in subcollection `customers/{id}/files`, content in Firebase Storage at `customers/{customerId}/files/{fileId}` (same id as the Firestore doc; `files-service.ts`, UI in `customer-files-section.tsx`, 10 MB limit enforced client-side and in `storage.rules`). `deleteCustomer` deletes files (Storage + docs) and activities before the customer doc.
- Rules live in `firestore.rules` and `storage.rules`; deploy with `npx firebase-tools deploy --only firestore:rules,storage` (overwrites the console rules, so every path must be listed there).
- `nav-documents.tsx` and `nav-secondary.tsx` are leftovers from dashboard-01 and are unused.

### Auth flow

Firebase is initialised in [src/lib/firebase.ts](src/lib/firebase.ts) from `NEXT_PUBLIC_FIREBASE_*` vars in `.env.local` (gitignored). `AuthProvider` ([auth-provider.tsx](src/components/auth-provider.tsx)) wraps the app in `layout.tsx` and exposes `useAuth()` (`user`, `loading`). `/dashboard` is wrapped in `AuthGuard`, which redirects to `/login` — this is **client-side only**; there is no server middleware or session cookie. The sidebar user menu uses the real Firebase user and `signOut`.

## Gotchas

- shadcn registry output has shipped `import { cn } from "cn"` (a stray npm package); `cn` must come from `@/lib/utils` (clsx + tailwind-merge). If `shadcn add` reintroduces it, rewrite the import. Back up files before re-running `shadcn add` with `-o`, and re-check page files it overwrites (e.g. sidebar-07 replaces `src/app/dashboard/page.tsx`).
- `data-table.tsx` compares `status === "Done"` and uses the English values in `data.json` and select `value`s as logic keys; only labels are translated (`statusLabels`). Don't translate the values.
