import type { PhotonImage } from '@silvia-odwyer/photon'

type PhotonModule = typeof import('@silvia-odwyer/photon')

export type FilterKind = 'string-preset' | 'fn'
export type FilterGroup = 'Color presets' | 'Artistic'

export interface FilterEntry {
  name: string
  label: string
  group: FilterGroup
  kind: FilterKind
}

function toLabel(name: string): string {
  const spaced = name.replace(/_/g, ' ')
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

const COLOR_PRESET_NAMES = [
  'bluechrome',
  'diamante',
  'flagblue',
  'islands',
  'liquid',
  'marine',
  'mauve',
  'oceanic',
  'perfume',
  'radio',
  'rosetint',
  'seagreen',
  'serenity',
  'twenties',
  'vintage',
] as const

const ARTISTIC_NAMES = [
  'cali',
  'dramatic',
  'duotone_horizon',
  'duotone_lilac',
  'duotone_ochre',
  'duotone_violette',
  'firenze',
  'golden',
  'lix',
  'lofi',
  'neue',
  'obsidian',
  'pastel_pink',
  'ryo',
] as const

export const FILTER_CATALOG: FilterEntry[] = [
  ...COLOR_PRESET_NAMES.map<FilterEntry>((name) => ({
    name,
    label: toLabel(name),
    group: 'Color presets',
    kind: 'string-preset',
  })),
  ...ARTISTIC_NAMES.map<FilterEntry>((name) => ({
    name,
    label: toLabel(name),
    group: 'Artistic',
    kind: 'fn',
  })),
]

export const FILTER_GROUP_ORDER: FilterGroup[] = ['Color presets', 'Artistic']

const FILTER_BY_NAME = new Map(FILTER_CATALOG.map((f) => [f.name, f]))

export function getFilter(name: string): FilterEntry | undefined {
  return FILTER_BY_NAME.get(name)
}

export function applyFilter(photon: PhotonModule, img: PhotonImage, name: string): void {
  const entry = FILTER_BY_NAME.get(name)
  if (!entry) throw new Error(`Unknown filter: ${name}`)

  switch (entry.kind) {
    case 'string-preset':
      photon.filter(img, entry.name)
      return
    case 'fn': {
      const fn = (photon as unknown as Record<string, (img: PhotonImage) => void>)[entry.name]
      if (typeof fn !== 'function') throw new Error(`Photon has no function named ${entry.name}`)
      fn(img)
      return
    }
  }
}
