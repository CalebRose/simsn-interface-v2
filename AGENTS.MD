# Project Instructions

This code repository is a web-based application supporting an online sports management simulation community. It supports various sports including football, basketball, hockey, baseball, lacrosse, volleyball, and others.

## Architecture

- Keep components, hooks, contexts, and services in their existing top-level directories.
- Place direct Firebase or REST API access in `_services`, contexts, or hooks.
  Components should consume exported functions and state rather than duplicating fetch logic.
- Keep data access and UI state separable: fetch and mutation logic belongs outside render-heavy components.
- Add reusable UI to `src/_design`; use it before creating one-off variants.
- Sport-specific cross-page state belongs in the corresponding context.
  Use `LeagueContext`, `AuthContext`, `ForumContext`, or `DMContext` for shared concerns rather than sport contexts.
- Never expose admin-only data or actions in the UI bundle.
- Use semicolons.
- Use double quotes "" for string values.
- Two-space indentation

## Persisted schemas and migrations

- Persisted schemas must remain backward compatible. Never remove existing values or properties from user documents,
  Firestore documents, API payloads, or other persisted data shapes.
- Additive schema changes are preferred. When a field is renamed or replaced, preserve the old field and migrate read
  and write behavior carefully rather than dropping the old value.
- Update TypeScript types, Firestore rules, migration/backfill scripts, and UI consumers together when a persisted
  shape changes.
- Scripts under `scripts/` are operational tools. Read the script header and prerequisites before running them,
  especially scripts that write to Firestore or require `scripts/serviceAccountKey.json`.
- `scripts/seedForums.js` seeds the top-level forum and subforum structure in Firestore. It is intended to add missing
  forum documents without overwriting existing documents. Keep that idempotent behavior and do not add destructive
  deletion or reset behavior to this seeding script.

## TypeScript and React

- The project uses Tailwind CSS for as its CSS framework.
- The project uses strict TypeScript. Do not introduce `any` without an explicit, narrow justification.
- Preserve existing types and exported interfaces; do not silently widen return types.
- Follow React 18 patterns and use hooks appropriately.
- Use `useEffect` cleanup for subscriptions, polling, and timers.
- Use `useMemo` only for expensive derived values or referential stability that materially avoids re-computation.
- Do not use `useMemo` to synchronize state or replace fetch/loading/error state.
- Store fetched data in `useState` or an existing context/store; derive related values with normal expressions or `useMemo` when memoization is beneficial.
- Avoid `useState` when a value can be fully and reliably derived from existing props or state.
- Run lint and React profiling if memoization behavior is unclear; do not add memoization solely to “optimize” simple calculations.
- Keep new components accessible:
  - support keyboard interaction,
  - use semantic elements,
  - provide labels and accessible names,
  - preserve visible/focus states.
- Verify desktop, tablet, and mobile behavior for responsive changes.

## Firebase and security

- Never commit service-account credentials, private keys, tokens, or `.env` secrets.
- Add environment-variable names to README/setup documentation when introducing configuration.
- Treat every `VITE_` environment variable as browser-visible. Never place secrets or credentials in `VITE_` variables.
- Keep public Firebase client configuration separate from administrative credentials.
- Use `_services` for Firestore and Firebase authentication operations where practical.
- Add or update Firebase rules for every new restricted document or collection.
- Test rule changes with the existing scripts or emulator-based tests, especially authorization,
  owner-only writes, rate limits, and chat expiration.
- Do not make chat, forum, profile, or role checks rely only on frontend state.
- Public chat retention must be defined consistently in `CHAT_RETENTION_DAYS`, chat UI queries, and Firestore rules.
- Public chat documents should have an `expireAt` value of five weeks (35 days) from creation.

## Error handling

- Handle API and Firebase failures explicitly.
- Preserve the existing Notistack UX for user-visible errors where appropriate.
- Do not use broad success-shaped fallbacks or silently swallow failures.
- Add enough context to logs to diagnose errors without logging secrets or sensitive user data.

## Testing

- Add focused tests using the repository's existing conventions. Standalone Firebase rule and behavior checks belong in
  the `scripts/` directory when that is the established location for the test.
- Add focused tests for business logic and Firebase security behavior.
- The repository already contains standalone rule and migration scripts; update or add coverage when
  changing the behavior those scripts validate.
- A change is not complete until the relevant lint, type-check, build, and test commands pass.
- Before completing code changes, run the smallest relevant checks:
  - `npm ci` after dependency or lockfile changes
  - `npm run type-check`
  - `npm run lint`
  - `npm run build`
  - the relevant script in `scripts/` for migration or Firebase rule changes

## Change discipline

- Make the smallest complete change that addresses the request.
- Ensure generated code is clear and understandable to human developers. Use descriptive names, conventional structure,
  and comments only where they clarify non-obvious behavior.
- Preserve existing behavior outside the requested area.
- Do not modify `docs/` directly or revert unrelated worktree changes.
- Update directly related README or technical documentation when setup, architecture, or retention behavior changes.

## \_design directory rules

The following rules are regarding the `src/_design` directory in this codebase. This directory is for building out reusable components that can be used across the entire codebase. Component examples include the <Text> component and the <Border> component, along with <Modal>. When building out new features and pages in this directory, check the `src/_design` directory for any existing components that can be used and supported for this initiative.

- If there is generated code that is replicable across pages within the ./components directory and is not stored in the `src/_design` directory, we should consider hosting it there. Look at the components stored within `src/_design` for ideas and reference.

## Supporting Sports rules

- Any new fetch calls should be stored within the `src/services` directory. This directory hosts the endpoints that we can call and reference across our pages and within context.
- The ./context directory supports several stores that are used across the site. For any functions or variables that can be used across pages, that are related to a specific sport, they should be stored in the sport's context store. Below are the following stores:
  - SimFBAContext.tsx supports college football and pro football (NFL)
  - SimBBAContext.tsx supports college basketball and pro basketball (NBA)
  - SimHockeyContext.tsx supports college hockey and pro hockey (PHL)
  - SimBaseballContext.tsx supports college baseball and pro baseball (MLB)
  - SimLAXContext.tsx supports college lacrosse and pro lacrosse (PLAX)
  - SimVBContext.tsx supports college volleyball and pro volleyball (PVB)

## Reusable hooks

- If there are any reusable functions that can be called and used across site, we can create the related hook within the `src/_hooks` directory. These are for functions that may not fit within the scope of the context store but alone can take in a parameter (or none) and return values as needed. Examples include: useModal.tsx, useMobile.tsx, and useLoadMessage.tsx

## Firebase

- When creating new firebase functionality that either requires consistent watching or snapshots, consider polling so that we can control how often we read from the store (and also save up on costs)
