import { useCallback, useEffect, useState } from 'react'
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from '@/components/ui/menubar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface AppMenubarProps {
  hasImage: boolean
  onNewImage: () => void
}

export function AppMenubar({ hasImage, onNewImage }: AppMenubarProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(
    typeof document !== 'undefined' && Boolean(document.fullscreenElement),
  )

  useEffect(() => {
    const handler = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  const handleNewImageSelected = useCallback(() => {
    if (!hasImage) return
    setConfirmOpen(true)
  }, [hasImage])

  const handleConfirmNewImage = useCallback(() => {
    setConfirmOpen(false)
    onNewImage()
  }, [onNewImage])

  const handleToggleFullscreen = useCallback(async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen()
    } else {
      await document.documentElement.requestFullscreen()
    }
  }, [])

  return (
    <>
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem disabled={!hasImage} onSelect={handleNewImageSelected}>
              New Image
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>View</MenubarTrigger>
          <MenubarContent>
            <MenubarItem onSelect={handleToggleFullscreen}>
              {isFullscreen ? 'Exit Fullscreen' : 'Toggle Fullscreen'}
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Discard current image?</DialogTitle>
            <DialogDescription>
              Loading a new image will discard the current one and reset all edits. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmNewImage}>
              Discard and start over
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
