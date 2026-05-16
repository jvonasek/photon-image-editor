# Progress Log

## 2026-05-16 -- RAZ-12

- Implemented `useTheme` hook at `apps/web/src/hooks/useTheme.ts`.
- Cycle order: light -> dark -> system -> light; persists to `localStorage` (`theme`); defaults to `system`.
- Applies/removes `.dark` on `document.documentElement`; subscribes to `prefers-color-scheme: dark` in system mode with cleanup on change/unmount.
- Synchronous read in `useState` initializer and `useLayoutEffect` for class application to avoid theme flash.
- Validation: `eslint` clean on the new file; pre-existing lint/typecheck errors elsewhere in the repo are unchanged and out of scope.
- Status: DONE.

## 2026-05-16 -- RAZ-13

- Added `ThemeToggle` at `apps/web/src/components/ThemeToggle.tsx`: ghost icon Button using `useTheme`; renders Lucide `Sun`/`Moon`/`Monitor` per current mode; click calls `cycleTheme`; includes contextual `aria-label`.
- Refactored `App.tsx` header to a `<header>` with `flex items-center justify-between`, title on the left and `ThemeToggle` on the right.
- Validation: `bun run lint` / `bun run build` -- pre-existing errors only (ResizeControls effect rule, ui/button + ui/toggle fast-refresh, `utils/image.ts` Uint8Array Blob typing). Confirmed unchanged by stashing this change.
- Status: DONE.

## 2026-05-16 -- RAZ-22

- Changed header `<h1>` text in `apps/web/src/App.tsx` from "Image Editor" to "Photon Image Editor".
- Validation: `bun run lint` / `bun run build` -- pre-existing errors only (ResizeControls effect rule, ui/button + ui/toggle fast-refresh, `utils/image.ts` Uint8Array Blob typing). No new errors introduced.
- Status: DONE.

## 2026-05-16 -- RAZ-21

- Refactored `ThemeToggle` at `apps/web/src/components/ThemeToggle.tsx` to use the existing shadcn `Select` dropdown component, exposing all three theme options (Light/Dark/System) with icons instead of cycling on click.
- Updated `useTheme` at `apps/web/src/hooks/useTheme.ts` to expose `setTheme` (removed unused `cycleTheme`/`useCallback`/`THEME_ORDER`).
- Validation: `bun run lint` / `bun run build` -- pre-existing errors only (ResizeControls effect rule, ui/button + ui/toggle fast-refresh, `utils/image.ts` Uint8Array Blob typing). No new errors introduced.
- Status: DONE.

## 2026-05-16 -- RAZ-24

- Added shadcn `Slider` primitive at `apps/web/src/components/ui/slider.tsx` (radix-ui Slider, new-york style; npx/bunx blocked by missing npm, file added manually to match shadcn template).
- Added `AdjustmentsControls` at `apps/web/src/components/AdjustmentsControls.tsx`: header, right-aligned numeric label (button) that resets brightness to 0, and a Slider with range -100..100 step 1.
- Updated `usePhoton.ts`: `processImage` gained `adjustments: { brightness; contrast } | null` (applied after crop/resize, before filter; skips wasm when values are 0). New `applyAdjustmentsPreview(sourceBytes, brightness, contrast, filterName | null)` replaces `applyFilterPreview` as single live-preview entry point; brightness passes through to photon's `adjust_brightness` directly.
- Updated `App.tsx`: brightness state, unified `previewUrl` (replaces filterPreviewUrl), debounced (~75ms) preview scheduler that runs brightness then filter, fast path preserved when brightness=0 and no filter (no preview encode, displays edited/original bytes), brightness baked into Download via `processImage`, brightness preserved across Crop/Resize with re-render against new bytes, zeroed on Reset and on new upload, slider disabled while `isProcessing`.
- Updated `ImageEditor.tsx`: renders `AdjustmentsControls` between `FilterControls` and `CropControls` with Separator.
- Validation: `bun run lint` / `bun run build` -- pre-existing errors only (ResizeControls effect rule, ui/button + ui/toggle fast-refresh, `utils/image.ts` Uint8Array Blob typing). No new errors introduced by this change.
- Status: DONE.

## 2026-05-16 -- RAZ-25

- Added second `Contrast` slider to `apps/web/src/components/AdjustmentsControls.tsx` mirroring Brightness UI (range -100..100, step 1, click-numeric-to-reset, disabled while processing).
- Threaded `contrast` state through `apps/web/src/App.tsx`: new `useState`, `schedulePreview` now takes `contrastValue`, fast path activates only when brightness=0 AND contrast=0 AND no filter, contrast passed into `applyAdjustmentsPreview` and `processImage` (Download), zeroed on Reset and on new upload, preserved across Crop/Resize.
- Updated `apps/web/src/components/ImageEditor.tsx` props to accept `contrast` and `onContrastChange`, forwarded to `AdjustmentsControls`.
- Pipeline order unchanged: crop → resize → brightness → contrast → filter → encode (already correct from RAZ-24; `applyAdjustments` applies brightness before contrast).
- Validation: `bun run lint` / `bun run build` -- pre-existing errors only (ResizeControls effect rule, ui/button + ui/toggle fast-refresh, `utils/image.ts` Uint8Array Blob typing). No new errors introduced.
- Status: DONE.
