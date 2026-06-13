# Portable Design System Tokens

This folder extracts the reusable design rules currently used in ComicToKindle into files that can move to other projects.

## Files

- `color-tokens.css`
  Contains the semantic light and dark color variables plus sidebar-specific tokens.

- `typography.tokens.json`
  Contains the font stack, type scale, and weight guidance.

- `icon-system.json`
  Documents the icon library choice, default sizing, and usage rules.

## Suggested Migration Flow

1. Import `color-tokens.css` into the target project.
2. Map the color variables into your styling layer:
   Tailwind v4 can read them directly through `@theme inline`, while CSS-only projects can consume `var(--token-name)`.
3. Copy the `typeScale` and `fontFamily` entries from `typography.tokens.json` into your theme config or token pipeline.
4. Install `lucide-react` and keep `size-4` as the default icon size unless the destination system already defines a different default.

## Token Intent

- Colors are semantic rather than brand-hardcoded, which makes them easier to reuse across dashboards, internal tools, and content-heavy apps.
- Typography is tuned for dense operational UI rather than marketing pages.
- Icons assume a stroke-based product interface and shadcn-style component defaults.
