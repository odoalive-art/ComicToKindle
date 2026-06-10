# Architecture

This document describes the current application foundation as of 2026-06-11.

## Current Scope

ComicToKindle is a desktop application shell for a future local comic library, Kindle converter, and delivery tool.

Implemented:

- Electron application shell
- React renderer app
- TypeScript configuration for main, preload, and renderer code
- Tailwind CSS 4 setup
- shadcn/ui component setup
- Build and packaging scripts

Not implemented:

- Comic file scanning
- Metadata persistence
- Conversion pipeline
- Image processing or upscaling
- Kindle delivery
- Send to Kindle web embedding

## Runtime Layers

```txt
Electron main process
  src/main/index.ts
  Owns BrowserWindow creation, app lifecycle, shell-open behavior, and main-process IPC.

Preload process
  src/preload/index.ts
  Bridges safe Electron APIs into the renderer.

Renderer process
  src/renderer/src/
  Owns React UI, Tailwind styles, and shadcn/ui components.
```

## Build Pipeline

electron-vite builds three outputs:

```txt
src/main/      -> out/main/
src/preload/   -> out/preload/
src/renderer/  -> out/renderer/
```

`npm run build` runs:

```txt
typecheck:node
typecheck:web
electron-vite build
```

## UI System

The renderer uses Tailwind CSS 4 and shadcn/ui.

Important files:

```txt
components.json
electron.vite.config.ts
src/renderer/src/assets/main.css
src/renderer/src/lib/utils.ts
src/renderer/src/components/ui/
```

`components.json` is configured with:

```txt
style: new-york
tsx: true
baseColor: neutral
iconLibrary: lucide
```

The Vite renderer aliases are:

```txt
@/*          -> src/renderer/src/*
@renderer/*  -> src/renderer/src/*
```

## Planned Domain Boundaries

The next implementation phase should keep UI and system work separated:

```txt
Comic library domain
  Scans local directories, reads archives and image folders, stores metadata.

Conversion domain
  Normalizes pages, processes images, builds Kindle-friendly EPUB output.

Delivery domain
  Sends or hands off generated EPUB files through Kindle email, local export, or Send to Kindle web flow.

Task domain
  Tracks long-running scan, conversion, upscaling, and delivery jobs.
```

Electron main or dedicated service modules should own local filesystem and process execution. The renderer should call those capabilities through explicit preload or IPC APIs rather than using Node APIs directly.

## Storage

No storage layer exists yet. When persistence is added, document:

- Storage engine
- Database or file location
- Migration strategy
- Data model
- Backup and reset behavior

## Security Notes

The generated Electron scaffold currently sets `sandbox: false` for the BrowserWindow. Revisit this before implementing local file access, Send to Kindle embedding, or credential storage.

External links are opened with `shell.openExternal`, and new-window navigation is denied in the app window.
