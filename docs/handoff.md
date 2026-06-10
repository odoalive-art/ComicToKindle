# Handoff

## Snapshot

Date: 2026-06-11

ComicToKindle is at the desktop-app foundation stage. The technical base is ready for product UI and local workflow implementation.

## Completed

- Initialized a git repository.
- Created an Electron + Vite + React + TypeScript app.
- Installed npm dependencies.
- Added Tailwind CSS 4.
- Added shadcn/ui manual configuration.
- Added initial shadcn/ui components:
  - button
  - sidebar
  - card
  - table
  - dialog
  - tabs
  - progress
  - scroll-area
  - sonner
  - sidebar dependencies
- Configured aliases:
  - `@/*`
  - `@renderer/*`
- Moved the repository from iCloud Drive to `/Users/linweiqiang/Dev/ComicToKindle`.
- Verified `npm run build`.
- Verified `npm run dev` starts the Electron app, then stopped the dev process.

## Important Context

The repository should stay outside iCloud Drive. Toolchain binaries hung under the synced path during setup. The local path works normally.

The current renderer still shows the default electron-vite placeholder screen. shadcn/ui is installed and available, but the real app shell has not been built yet.

## Next Work

Recommended next steps:

1. Replace the placeholder renderer with the first app shell.
2. Add `TooltipProvider` and any other root providers needed by shadcn sidebar and tooltip components.
3. Define the first product navigation:
   - Library
   - Convert
   - Delivery
   - Tasks
   - Settings
4. Design the local data model before implementing comic scanning.
5. Decide how image processing and EPUB conversion will be executed from Electron main or worker processes.

## Verification Commands

```bash
npm run typecheck
npm run build
npm run dev
```
