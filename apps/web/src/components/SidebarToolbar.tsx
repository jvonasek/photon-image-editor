import type { PixelCrop } from 'react-image-crop'
import { Crop as CropIcon, SlidersHorizontal } from 'lucide-react'
import { InstagramIcon } from './icons/InstagramIcon'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { AdjustmentsControls } from './AdjustmentsControls'
import { CropControls } from './CropControls'
import { FilterControls } from './FilterControls'
import { ResizeControls } from './ResizeControls'
import { SliceControls } from './SliceControls'
import type { ImageDimensions } from '@/types'

interface SidebarToolbarProps {
  selectedFilter: string | null
  brightness: number
  contrast: number
  blur: number
  sliceCount: number
  isLandscape: boolean
  isProcessing: boolean
  currentDimensions: ImageDimensions
  completedCrop: PixelCrop | undefined
  onFilterChange: (name: string | null) => void
  onBrightnessChange: (value: number) => void
  onContrastChange: (value: number) => void
  onBlurChange: (value: number) => void
  onCropApply: () => void
  onCropClear: () => void
  onResize: (dimensions: ImageDimensions) => void
  onSliceCountChange: (delta: -1 | 1) => void
  onSliceDownload: () => void
}

const TAB_TRIGGER_CLASS =
  'h-10 w-10 p-0 rounded-md data-[state=active]:bg-accent data-[state=active]:border-border'

export function SidebarToolbar({
  selectedFilter,
  brightness,
  contrast,
  blur,
  sliceCount,
  isLandscape,
  isProcessing,
  currentDimensions,
  completedCrop,
  onFilterChange,
  onBrightnessChange,
  onContrastChange,
  onBlurChange,
  onCropApply,
  onCropClear,
  onResize,
  onSliceCountChange,
  onSliceDownload,
}: SidebarToolbarProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tabs
        defaultValue="adjustments"
        orientation="vertical"
        className="flex-1 min-h-0 flex flex-row gap-0"
      >
        <TabsList className="h-auto w-12 shrink-0 flex-col items-stretch justify-start gap-1 rounded-none border-r bg-transparent p-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <TabsTrigger
                value="adjustments"
                aria-label="Adjustments"
                className={TAB_TRIGGER_CLASS}
              >
                <SlidersHorizontal className="size-4" />
              </TabsTrigger>
            </TooltipTrigger>
            <TooltipContent side="right">Adjustments</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <TabsTrigger
                value="crop-resize"
                aria-label="Crop & Resize"
                className={TAB_TRIGGER_CLASS}
              >
                <CropIcon className="size-4" />
              </TabsTrigger>
            </TooltipTrigger>
            <TooltipContent side="right">Crop & Resize</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <TabsTrigger
                value="slice"
                aria-label="Instagram"
                className={TAB_TRIGGER_CLASS}
              >
                <InstagramIcon className="size-4" strokeWidth={2} />
              </TabsTrigger>
            </TooltipTrigger>
            <TooltipContent side="right">Instagram</TooltipContent>
          </Tooltip>
        </TabsList>

        <TabsContent
          value="adjustments"
          className="flex-1 min-w-0 min-h-0 overflow-y-auto p-4 space-y-4 mt-0"
        >
          <FilterControls
            value={selectedFilter}
            onChange={onFilterChange}
            disabled={isProcessing}
          />
          <AdjustmentsControls
            brightness={brightness}
            contrast={contrast}
            blur={blur}
            onBrightnessChange={onBrightnessChange}
            onContrastChange={onContrastChange}
            onBlurChange={onBlurChange}
            disabled={isProcessing}
          />
        </TabsContent>

        <TabsContent
          value="crop-resize"
          className="flex-1 min-w-0 min-h-0 overflow-y-auto p-4 mt-0 space-y-4"
        >
          <CropControls
            crop={completedCrop}
            onApply={onCropApply}
            onClear={onCropClear}
            isProcessing={isProcessing}
          />
          <Separator />
          <ResizeControls
            currentDimensions={currentDimensions}
            onApply={onResize}
            isProcessing={isProcessing}
          />
        </TabsContent>

        <TabsContent
          value="slice"
          className="flex-1 min-w-0 min-h-0 overflow-y-auto p-4 mt-0"
        >
          <SliceControls
            sliceCount={sliceCount}
            isLandscape={isLandscape}
            isProcessing={isProcessing}
            onSliceCountChange={onSliceCountChange}
            onDownload={onSliceDownload}
          />
        </TabsContent>
      </Tabs>
    </TooltipProvider>
  )
}
