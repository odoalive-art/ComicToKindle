# Operator Runbook

This runbook covers setup and verification for the current foundation stage.

## Repository Location

Use the local path:

```txt
/Users/linweiqiang/Dev/ComicToKindle
```

Do not use the old iCloud Drive path. On 2026-06-11, the project was moved because `esbuild` and Node `.bin` shims hung when executed from the synced directory.

## Install

```bash
npm install
```

If npm reports root-owned cache files under `~/.npm`, use a local cache for the install:

```bash
npm_config_cache=.npm-cache npm install
```

Keep `.npm-cache` untracked.

## Development Smoke Test

```bash
npm run dev
```

Expected result:

- Electron main process builds.
- Preload script builds.
- Renderer dev server starts at `http://localhost:5173/`.
- Electron window opens with the current placeholder UI.

Stop the dev process with `Ctrl+C`.

## Build Verification

```bash
npm run build
```

Expected result:

- TypeScript checks pass for node and web configs.
- electron-vite builds `out/main`, `out/preload`, and `out/renderer`.

## Packaging

```bash
npm run build:mac
npm run build:win
npm run build:linux
```

These scripts run `npm run build` and then invoke electron-builder for the requested target.

## Useful Checks

```bash
npm run typecheck
npm run lint
npm run format
git status --short
```

`npm run lint` and `npm run format` are available from the scaffold. Run them before broader application work or before publishing a branch.

## Environment Variables

No application-specific environment variables exist yet.

If future work adds converter paths, Kindle email settings, Send to Kindle automation flags, or model locations, update this file and `AGENTS.md`.

## Known Tooling Notes

- Keep the repository outside iCloud Drive, Dropbox, or similar synced folders.
- The shadcn CLI did not auto-detect this Electron Vite project as a standard Vite project. The project uses manual shadcn configuration through `components.json`.
- `npm run build` is the current source of truth for verifying the setup.
