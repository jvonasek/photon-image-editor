# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Client-side image editor built with React 19, TypeScript, Vite, and Photon WASM. Users upload images via drag-and-drop, then crop/resize/convert them entirely in the browser using WebAssembly-based image processing.

## Commands

```bash
bun run dev        # Vite dev server with HMR
bun run build      # TypeScript check + Vite production build
bun run lint       # ESLint
bun run preview    # Preview production build locally
```

From monorepo root (`../../`):
```bash
bun run dev        # All apps via turbo
bun run build      # Build all apps
bun run lint       # Lint all apps
bun run typecheck  # Type check all apps
```

## Architecture

**State flow**: `App.tsx` is the container — it holds all state (original file, edited bytes, dimensions, format) and passes props down to feature components (`ImageDropzone`, `ImageEditor`, `CropControls`, `ResizeControls`).

**Image processing pipeline**: `usePhoton` hook lazy-loads the `@silvia-odwyer/photon` WASM module on mount. All image manipulation (crop, resize) happens via WASM on `Uint8Array` buffers. The original file is preserved; edits produce new buffers.

**Resource lifecycle**: WASM `PhotonImage` objects must be freed with `.free()` in try-finally blocks. Object URLs must be revoked when replaced (tracked via refs `prevEditedUrl`, `prevOriginalUrl`).

**Dual dimension tracking**: `originalDimensions` (source file) and `currentDimensions` (post-edit) are tracked separately because crop/resize operations change the working dimensions.

## Key Conventions

- **Path aliases**: `@/` maps to `./src/`
- **Styling**: Tailwind CSS 4 with `cn()` utility from `@/lib/utils` for class merging. shadcn/ui components (`new-york` style) in `src/components/ui/`.
- **WASM config**: Vite requires `vite-plugin-wasm` and `vite-plugin-top-level-await` for Photon — don't remove these plugins.
- **Component props**: Define explicit TypeScript interfaces for all component props.
- **shadcn**: Configured via `components.json`. Add components with `npx shadcn@latest add <component>`. Not using RSC mode.

## Monorepo Context

This app lives at `apps/hdr/` in a Bun + Turbo monorepo. Sibling apps: `apps/web` (Next.js), `apps/api` (FastAPI). Refer to root `AGENT.md` for process rules and root `CLAUDE.md` for skill routing.
