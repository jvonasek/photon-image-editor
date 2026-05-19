## RAZ-45 — Add visible "active" state to SidebarToolbar

- Made the active toolbar tab visually distinct in `apps/web/src/components/SidebarToolbar.tsx` by updating `TAB_TRIGGER_CLASS`: inactive triggers now use `text-muted-foreground` (with `hover:text-foreground`), and active triggers flip to `text-accent-foreground` on top of the existing `bg-accent`/`border-border`, plus a `shadow-sm` lift. The icon color shift + shadow makes the selected tab clearly readable in both light and dark themes where `bg-accent` alone was too subtle.
- Validation: `bunx tsc -b` passes. `bun run lint` still reports the same 3 pre-existing errors in untouched files (`ResizeControls.tsx`, `ui/button.tsx`, `ui/toggle.tsx`); no new lint issues introduced.

## RAZ-44 — Update behavior of Instagram tab

- Restricted the vertical slices preview (`SliceOverlay`) on the main image so it only renders when the Instagram (`slice`) tab is active. Previously it was always visible for landscape images.
- Lifted active tab state into `apps/web/src/components/ImageEditor.tsx` (`useState('adjustments')`) and made `SidebarToolbar` `Tabs` controlled via new `activeTab` / `onActiveTabChange` props.
- `SliceOverlay` render condition changed from `isLandscape` to `isLandscape && activeTab === 'slice'`.
- Validation: `bunx tsc -b` passes. `bun run lint` still reports the same 3 pre-existing errors in untouched files. `bun run build` still fails on the pre-existing `vite-plugin-top-level-await` env issue, unrelated to this change.

## RAZ-43 — Add Info tab to SidebarToolbar

- Removed the always-visible file info block from the top of `apps/web/src/components/ImageEditor.tsx`; sidebar now opens directly into the toolbar tabs.
- Added a new "Info" tab to `apps/web/src/components/SidebarToolbar.tsx` using the lucide `Info` icon with the tooltip label `Info`.
- Tab content renders the same `fileName` and `WxH px · FORMAT` line that previously lived in the always-visible header; new `fileName` and `formatLabel` props are threaded from `ImageEditor` into `SidebarToolbar`.
- Typecheck (`tsc -b`) passes. Lint errors are pre-existing in untouched files (`ResizeControls.tsx`, `ui/button.tsx`, `ui/toggle.tsx`); `bun run build` still fails on the pre-existing `vite-plugin-top-level-await` env issue unrelated to this change.

## RAZ-42 — Change the SidebarToolbar orientation

- Switched `apps/web/src/components/SidebarToolbar.tsx` from vertical to horizontal orientation: `Tabs` now uses `orientation="horizontal"` and `flex-col` so the tab strip sits above panel content within the right sidebar.
- `TabsList` is now a horizontal row (`h-12 w-auto flex-row`) with a bottom border (`border-b`) instead of the prior `w-12 flex-col` left-border layout.
- Tooltip `side` for the three triggers updated from `"right"` to `"bottom"` to match the new orientation.
- Validation: `tsc --noEmit` and `eslint src/components/SidebarToolbar.tsx` both pass.

## RAZ-41 — feat(sidebar): add Instagram tab to SidebarToolbar

- Replaced the placeholder `Scissors` Lucide icon on the third tab trigger in `apps/web/src/components/SidebarToolbar.tsx` with the `InstagramIcon` component (`./icons/InstagramIcon`) introduced in RAZ-39. The trigger continues to use `value="slice"` so it renders the existing `SliceControls` panel (slice count stepper, Download Slices button, and landscape-only notice from RAZ-34).
- Updated `aria-label` from `"Slice"` to `"Instagram"` and the matching `TooltipContent` text from `"Slice"` to `"Instagram"`. Removed the now-unused `Scissors` import from `lucide-react`.
- Trigger position is unchanged — third in the icon strip, directly below the Crop & Resize trigger. `InstagramIcon` is rendered with `className="size-4"` and `strokeWidth={2}` to match adjacent Lucide icons (same 24×24 viewBox, `currentColor` stroke, no fill).
- Existing `SliceControls` already handles portrait images (disables stepper + Download Slices and shows the landscape-only notice via `isLandscape`), and the `SliceOverlay` on the canvas continues to update from the same `sliceCount` state in `App.tsx` — no app-state wiring change needed.
- Typecheck (`tsc -b` via `bunx tsc --noEmit`) passes. `bun run lint` reports only the same 3 pre-existing errors in untouched files (`ResizeControls.tsx`, `ui/button.tsx`, `ui/toggle.tsx`).

## RAZ-39 — feat(sidebar): InstagramIcon SVG component matching Lucide icon contract

- Added `apps/web/src/components/icons/InstagramIcon.tsx`: a standalone SVG component matching the Lucide icon contract (24×24 viewBox, `stroke="currentColor"`, `fill="none"`, `strokeWidth={2}`, `strokeLinecap="round"`, `strokeLinejoin="round"`). Props accepted: `size`, `className`, `strokeWidth`, `color`, plus passthrough SVG attributes; component is `forwardRef<SVGSVGElement>`.
- Glyph composes the Instagram simplified mark: rounded rectangle outline (`rect rx=5`), inner circle path, and a small dot in the upper-right (`line` of length ~0.01). Same primitives lucide-react uses, so it renders at the same optical weight next to existing Lucide icons in `SidebarToolbar`.
- No new npm dependency introduced; component is self-contained.
- Typecheck (`tsc -b`) passes; `eslint` clean on the new file (the 3 pre-existing repo-wide lint errors in untouched files remain).

## RAZ-41 — feat(sidebar): add Instagram tab to SidebarToolbar — BLOCKED (re-confirmed 2026-05-19)

- Re-checked: `git log` shows no RAZ-39 commit (latest sidebar work is RAZ-40 `1c22ffd`); grep over `apps/web/src` still finds no `InstagramIcon` component or custom Instagram SVG. The only "Instagram" string remains the `Instagram Slices` literal in `SliceControls.tsx`.
- Cannot implement: the task requires the `InstagramIcon` component from RAZ-39 as the tab trigger icon, and RAZ-39 has not been implemented.
- Acceptance criterion "InstagramIcon renders at the same visual size and weight as the Lucide icons in adjacent tab triggers" is a property of the missing component. Substituting `lucide-react`'s `Instagram` icon would silently subsume RAZ-39 and violate one-task-per-loop.
- Status: BLOCKED on RAZ-39. See `state/blockers.md`.

## RAZ-40 — Add Crop & Resize tab to SidebarToolbar

- Replaced the separate `crop` and `resize` tabs scaffolded in RAZ-38 with a single combined `crop-resize` tab in `SidebarToolbar` (`apps/web/src/components/SidebarToolbar.tsx`). Tab trigger sits directly below the Adjustments trigger, uses the `Crop` Lucide icon, and shows a "Crop & Resize" tooltip.
- Tab panel renders `CropControls` and `ResizeControls` separated by a shadcn `Separator`. Crop selection state continues to live in `App.tsx`/`ImageEditor` (passed in via `completedCrop`), so switching away from the tab and back preserves the canvas selection. `ResizeControls` already syncs its width/height inputs from `currentDimensions` on mount via its existing `useEffect`. `isProcessing` is forwarded into both controls unchanged.
- Removed the unused `Maximize2` icon import. Typecheck (`tsc -b`) passes; lint reports only the 3 pre-existing errors in untouched files (`ResizeControls.tsx`, `ui/button.tsx`, `ui/toggle.tsx`). `vite build` still fails on the unrelated pre-existing `vite-plugin-top-level-await` env issue.

## RAZ-38 — Install shadcn Tabs + Tooltip; scaffold SidebarToolbar with Adjustments tab

- Added `apps/web/src/components/ui/tabs.tsx` and `apps/web/src/components/ui/tooltip.tsx` using the `radix-ui` package (already a dep), matching the existing shadcn `new-york` style of sibling primitives.
- New `SidebarToolbar` (`apps/web/src/components/SidebarToolbar.tsx`) wraps `Tabs` in vertical orientation: 48px icon-only `TabsList` strip on the left with a `TooltipProvider delayDuration={300}`, scrollable `TabsContent` on the right. Default active tab is `adjustments` containing `FilterControls` + `AdjustmentsControls`. Adjustments trigger uses the `SlidersHorizontal` Lucide icon with a "Adjustments" tooltip. Crop/Resize/Slice are preserved as additional tabs (Crop/Maximize2/Scissors icons) so existing functionality remains reachable while the parent RAZ-37 progressively reorganizes the sidebar.
- Updated `ImageEditor` (`apps/web/src/components/ImageEditor.tsx`) to host `SidebarToolbar` between an Info block pinned at the top and the Reset button + processing indicator pinned at the bottom (both outside the tabs); sidebar outer width (`w-80`) unchanged.
- Build (`bun run build`) passes. `bun run lint` reports only the 3 pre-existing errors in untouched files (`ResizeControls.tsx`, `ui/button.tsx`, `ui/toggle.tsx`).

## RAZ-35 — Slice guide overlay on image preview

- Added `SliceOverlay` component (`apps/web/src/components/SliceOverlay.tsx`): absolutely-positioned, `pointer-events-none` overlay rendering N−1 thin semi-transparent vertical lines at the inter-slice boundaries plus left/right dimmed trim zones for the discarded edges. Positions are derived from `computeSlicePlan(naturalWidth, naturalHeight, sliceCount)` then scaled by `displayWidth / naturalWidth`.
- Wired into `ImageEditor` as a sibling of the `<img>` inside `ReactCrop` so it inherits the same positioned container. Tracks rendered display size with state updated via the `<img onLoad>` handler and a `ResizeObserver` so the overlay re-syncs when the image element resizes (viewport change, sidebar reflow, etc.).
- Only rendered when `isLandscape` is true and `sliceCount >= 2`; trim zones clamp to ≥0 to handle the edge case where `centerOffset` would be negative.
- Build (typecheck + Vite) passes. Lint reports only the same 3 pre-existing errors in untouched files.

## RAZ-34 — SliceControls sidebar section + ZIP download handler

- Added `SliceControls` component (`apps/web/src/components/SliceControls.tsx`) rendering an "Instagram Slices" sidebar section under Resize: "4:5 per slice" label, `−`/N/`+` row, and "Download Slices" button. Renders the disabled state with the "Only available for landscape images." message when the current image is portrait or square.
- Wired into `ImageEditor` between Resize and the Reset button.
- `App.tsx` now owns `sliceCount` state, auto-recomputed via `useEffect` on `currentDimensions` change as `Math.max(2, Math.round(width / sliceWidth))` (where `sliceWidth = Math.round(height * 0.8)`).
- `handleSliceCountChange(delta)` clamps to a minimum of 2; `−` button is disabled at N=2.
- `handleSliceDownload` resolves source bytes (preferring `editedImageBytes`), invokes `sliceImage` with current adjustments/filter/blur, bundles results into a `JSZip` with `{baseName}_{paddedIndex}.jpg` filenames (pad width = number of digits in N), generates a `uint8array`, and downloads via the existing `downloadBlob` helper as `{baseName}.zip`. The handler does not mutate `editedImageBytes` or `currentDimensions`.
- The Download Slices button is disabled while `isProcessing` is true (the handler sets `isProcessing` for the duration of the slice + zip work).
- Typecheck (`tsc -b`) passes. Lint reports only the same 3 pre-existing errors in untouched files (`ResizeControls.tsx`, `ui/button.tsx`, `ui/toggle.tsx`).

## RAZ-33 — Slice math engine + WASM slicing function

- Added `computeSlicePlan(width, height, n)` to `apps/web/src/utils/image.ts` returning `{ centerOffset, sliceWidth, slices }` with 4:5 portrait slice rectangles using `sliceWidth = round(height * 0.8)` and symmetric center crop.
- Added `sliceImage(sourceBytes, n, dims, format, adjustments, filterName, blur)` to the `usePhoton` hook: decodes the source once, iterates rectangles from `computeSlicePlan`, applies brightness/contrast/filter/blur, encodes each slice to JPEG @ q85, frees each slice image, and frees the source `PhotonImage` in a `finally` block.
- Installed `jszip` (^3.10.1) as a production dependency for the next slice's download handler.
- Typecheck (`tsc -b`) passes; lint reports only the 3 pre-existing errors in untouched files (`ResizeControls.tsx`, `ui/button.tsx`, `ui/toggle.tsx`).
- No test framework is configured in `apps/web`; introducing one was out of scope for this task. The function is pure and small, and validated via typecheck.

## RAZ-31 — Menubar in Header

- Removed header title; added shadcn `Menubar` with File and View menus.
- File > New Image: disabled when no image is loaded; opens a shadcn `Dialog` to confirm discarding current edits before resetting back to the dropzone.
- View > Toggle Fullscreen: uses the browser Fullscreen API (`requestFullscreen` / `exitFullscreen`) and reflects current state in the menu label.
- Added `ui/menubar.tsx` and `ui/dialog.tsx` (shadcn new-york style, sourced via the existing `radix-ui` umbrella import convention).
- Widened editor sidebar and footer download sidebar from `w-64` to `w-80`.
- Download sidebar is now hidden entirely when no image is loaded.
- New `AppMenubar` component owns the confirm dialog and fullscreen state; `App.tsx` exposes a `handleNewImage` reset that clears the loaded file and all edits.
- Typecheck (`tsc -b`) passes. Lint reports 3 pre-existing errors in files untouched by this task (`ResizeControls.tsx`, `ui/button.tsx`, `ui/toggle.tsx`); `bun run build` still fails on the pre-existing `vite-plugin-top-level-await` env issue unrelated to this change.

## RAZ-30 — Rework the layout

- Removed outer page padding; layout now spans the full viewport (`h-screen` flex column).
- Header gets a clear bottom border and dedicated padding row, separating it from main.
- Main content fills remaining height; image area is edge-to-edge on the left with the image centered horizontally and vertically.
- Right sidebar (Info, filters, adjustments, crop, resize, Reset) keeps existing controls and width (`w-64`) with a left border to separate it from the image.
- Footer is clearly separated with a top border; left side shows the disclaimer, right side hosts a `w-64` download sidebar matching the main sidebar width.
- Download moved from the right sidebar into the new footer-right sidebar; no logic changed (still invokes the same `handleDownload`).
- Typecheck passes; lint errors reported are pre-existing in untouched files; `bun run build` fails on a pre-existing `vite-plugin-top-level-await` env issue unrelated to this change.
