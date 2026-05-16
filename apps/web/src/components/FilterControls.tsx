import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FILTER_CATALOG, FILTER_GROUP_ORDER, type FilterEntry, type FilterGroup } from '@/lib/filters'

const NONE_VALUE = '__none__'

interface FilterControlsProps {
  value: string | null
  onChange: (name: string | null) => void
  disabled: boolean
}

export function FilterControls({ value, onChange, disabled }: FilterControlsProps) {
  const handleChange = (next: string) => {
    onChange(next === NONE_VALUE ? null : next)
  }

  const grouped = new Map<FilterGroup, FilterEntry[]>()
  for (const group of FILTER_GROUP_ORDER) grouped.set(group, [])
  for (const entry of FILTER_CATALOG) {
    grouped.get(entry.group)!.push(entry)
  }
  for (const list of grouped.values()) {
    list.sort((a, b) => a.label.localeCompare(b.label))
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Filter</h3>
      <Select
        value={value ?? NONE_VALUE}
        onValueChange={handleChange}
        disabled={disabled}
      >
        <SelectTrigger size="sm" className="w-full">
          <SelectValue placeholder="None" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NONE_VALUE}>None</SelectItem>
          {FILTER_GROUP_ORDER.map((group) => {
            const entries = grouped.get(group) ?? []
            if (entries.length === 0) return null
            return (
              <SelectGroup key={group}>
                <SelectLabel>{group}</SelectLabel>
                {entries.map((f) => (
                  <SelectItem key={f.name} value={f.name}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            )
          })}
        </SelectContent>
      </Select>
    </div>
  )
}
