# Agent Notes

## Project State

ComicToKindle is a desktop app project for a local comic library, Kindle conversion workflow, and delivery tooling. The repository is currently at the foundation stage: Electron, Vite, React, TypeScript, Tailwind CSS, and shadcn/ui are installed and verified, but product workflows are not implemented.

The active repository path is:

```txt
/Users/linweiqiang/Dev/ComicToKindle
```

Do not use the old iCloud Drive path. The project was moved off iCloud Drive on 2026-06-11 because running Node toolchain binaries from the synced path caused `esbuild` and `.bin` shim hangs.

## Stack

- Electron 39 with electron-vite 5
- React 19 and TypeScript 5
- Tailwind CSS 4 via `@tailwindcss/vite`
- shadcn/ui 4, Radix primitives, Lucide icons
- electron-builder packaging

## Commands

```bash
npm install
npm run dev
npm run typecheck
npm run build
```

Use `npm run build` as the main verification command after setup or UI-system changes. It runs TypeScript checks and builds Electron main, preload, and renderer outputs.

## UI System

shadcn/ui is configured manually through `components.json` because the shadcn CLI does not auto-detect this Electron Vite project as a standard Vite app.

Aliases:

```txt
@/*          -> src/renderer/src/*
@renderer/*  -> src/renderer/src/*
```

Generated components belong in:

```txt
src/renderer/src/components/ui/
```

Existing generated components:

```txt
button, card, dialog, input, progress, scroll-area, separator, sheet,
sidebar, skeleton, sonner, table, tabs, tooltip
```

`src/renderer/src/hooks/use-mobile.ts` and `src/renderer/src/lib/utils.ts` are part of the shadcn setup.

## Current Product Boundary

The app does not yet implement:

- Local comic scanning or metadata storage
- CBZ, CBR, image-folder, EPUB, or PDF conversion logic
- Image enhancement or AI upscaling
- Send to Kindle web embedding
- Kindle email delivery
- Task queue, persistence, or settings

Avoid documenting these as existing features until code is added.

## Development Notes

- Keep docs in `docs/` aligned when adding product workflows.
- Keep README installation and verification commands synchronized with `package.json`.
- Do not add iCloud-specific toolchain workarounds unless the repository is moved back into a synced folder.
- Prefer shadcn/ui components and local patterns over custom component primitives.
