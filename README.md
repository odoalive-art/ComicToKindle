# ComicToKindle

ComicToKindle is an Electron desktop app foundation for a local comic library, Kindle-oriented conversion workflow, and delivery tooling.

The project currently contains the runnable application shell and UI system setup. The product workflows for comic scanning, image processing, EPUB generation, and Kindle delivery are not implemented yet.

## Stack

- Electron 39
- electron-vite 5
- React 19
- TypeScript 5
- Tailwind CSS 4
- shadcn/ui 4 with Radix primitives and Lucide icons
- electron-builder for packaging

## Requirements

- Node.js 22 or newer
- npm 10 or newer
- macOS, Windows, or Linux for development targets supported by Electron

Keep the repository in a local filesystem path such as:

```bash
/Users/linweiqiang/Dev/ComicToKindle
```

Do not work from iCloud Drive or another synced provider path. On 2026-06-11, running Node toolchain binaries from the iCloud path caused `esbuild` and `.bin` shims to hang.

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

This starts the Electron main process, preload script, and renderer dev server.

## Verification

```bash
npm run typecheck
npm run build
```

`npm run build` compiles the main process, preload script, and renderer into `out/`.

## Packaging

```bash
npm run build:mac
npm run build:win
npm run build:linux
```

Platform packages are produced by electron-builder. Cross-platform packaging may require running on the target OS or configuring the required platform toolchain.

## Project Layout

```txt
src/main/                 Electron main process
src/preload/              Preload bridge and exposed renderer types
src/renderer/             React renderer app
src/renderer/src/assets/  Tailwind and shadcn CSS tokens
src/renderer/src/components/ui/
                          shadcn/ui generated components
docs/                     Architecture, runbook, and handoff notes
```

## shadcn/ui

The shadcn configuration lives in `components.json`.

The configured aliases are:

```txt
@/*         -> src/renderer/src/*
@renderer/* -> src/renderer/src/*
```

Generated UI components should live under:

```txt
src/renderer/src/components/ui/
```

The initial component set includes button, sidebar, card, table, dialog, tabs, progress, scroll-area, and sonner, plus sidebar dependencies.

## Current Status

As of 2026-06-11:

- The Electron + Vite + React + TypeScript app builds successfully.
- Tailwind CSS and shadcn/ui are configured.
- The renderer still shows the default electron-vite placeholder screen.
- No comic library, converter, image upscaling, EPUB generation, or Kindle delivery feature exists yet.
