import { Monitor, Moon, Sun } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTheme, type Theme } from '@/hooks/useTheme'

const ICONS: Record<Theme, typeof Sun> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
}

const LABELS: Record<Theme, string> = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
}

const OPTIONS: Theme[] = ['light', 'dark', 'system']

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const CurrentIcon = ICONS[theme]

  return (
    <Select value={theme} onValueChange={(value: Theme) => setTheme(value)}>
      <SelectTrigger aria-label="Select theme">
        <SelectValue>
          <CurrentIcon />
          <span>{LABELS[theme]}</span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent align="end">
        {OPTIONS.map((option) => {
          const Icon = ICONS[option]
          return (
            <SelectItem key={option} value={option}>
              <Icon />
              <span>{LABELS[option]}</span>
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}
