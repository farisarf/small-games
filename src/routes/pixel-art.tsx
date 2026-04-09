import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, Download, Eraser, Paintbrush, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const DEFAULT_SIZE = 16
const MIN_SIZE = 4
const MAX_SIZE = 64
const DEFAULT_COLOR = '#111827'
const BACKGROUND_COLOR = '#ffffff'

type Cell = string

export const Route = createFileRoute('/pixel-art')({
  component: RouteComponent,
})

function createGrid(size: number): Cell[] {
  return Array.from({ length: size * size }, () => BACKGROUND_COLOR)
}

function RouteComponent() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gridSize, setGridSize] = useState(String(DEFAULT_SIZE))
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLOR)
  const [pixels, setPixels] = useState<Cell[]>(() => createGrid(DEFAULT_SIZE))
  const [isDrawing, setIsDrawing] = useState(false)
  const [status, setStatus] = useState('Klicke auf einen Pixel, um ihn zu färben.')

  const parsedGridSize = Number.parseInt(gridSize, 10)
  const activeGridSize = Number.isInteger(parsedGridSize) ? Math.min(MAX_SIZE, Math.max(MIN_SIZE, parsedGridSize)) : DEFAULT_SIZE

  const canvasDimension = 640
  const cellSize = canvasDimension / activeGridSize

  useEffect(() => {
    setPixels(createGrid(activeGridSize))
    setIsDrawing(false)
    setStatus(`Neue Leinwand: ${activeGridSize} x ${activeGridSize} Pixel.`)
  }, [activeGridSize])

  const drawCanvas = useMemo(() => {
    return (ctx: CanvasRenderingContext2D) => {
      ctx.clearRect(0, 0, canvasDimension, canvasDimension)

      for (let row = 0; row < activeGridSize; row += 1) {
        for (let column = 0; column < activeGridSize; column += 1) {
          const index = row * activeGridSize + column
          const color = pixels[index] ?? BACKGROUND_COLOR

          ctx.fillStyle = color
          ctx.fillRect(column * cellSize, row * cellSize, cellSize, cellSize)

          ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)'
          ctx.strokeRect(column * cellSize, row * cellSize, cellSize, cellSize)
        }
      }
    }
  }, [activeGridSize, cellSize, pixels])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    drawCanvas(ctx)
  }, [drawCanvas])

  const paintAt = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top

    if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
      return
    }

    const column = Math.min(activeGridSize - 1, Math.max(0, Math.floor((x / rect.width) * activeGridSize)))
    const row = Math.min(activeGridSize - 1, Math.max(0, Math.floor((y / rect.height) * activeGridSize)))
    const index = row * activeGridSize + column

    setPixels((current) => {
      if (current[index] === selectedColor) return current

      const next = [...current]
      next[index] = selectedColor
      return next
    })
    setStatus(`Pixel ${column + 1}, ${row + 1} gefärbt.`)
  }

  const handleCanvasPointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    event.preventDefault()
    setIsDrawing(true)
    paintAt(event.clientX, event.clientY)
  }

  const handleCanvasPointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    paintAt(event.clientX, event.clientY)
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    setPixels(createGrid(activeGridSize))
    setStatus('Leinwand geleert.')
  }

  const exportImage = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = `pixel-art-${activeGridSize}x${activeGridSize}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <main className="min-h-svh bg-linear-to-br from-slate-50 via-zinc-100 to-slate-200 p-4 md:p-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="relative rounded-3xl border border-slate-200/80 bg-white/80 px-4 py-4 shadow-sm backdrop-blur md:px-6">
          <Button asChild variant="ghost" size="icon" className="absolute left-3 top-3 h-10 w-10 rounded-full">
            <Link to="/" aria-label="Zurück zur Übersicht">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>

          <div className="pl-12 pr-2 md:pl-14">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 md:text-4xl">Pixel Art Canvas</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-600 md:text-base">
              Stelle die Größe frei ein und male einzelne Pixel direkt auf der Leinwand.
            </p>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="border-slate-300/80 bg-white/90 shadow-lg">
            <CardHeader className="border-b border-slate-200/80 bg-slate-50/80">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Paintbrush className="h-5 w-5" /> Leinwand
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-5 p-5 md:p-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
                <canvas
                  ref={canvasRef}
                  width={canvasDimension}
                  height={canvasDimension}
                  className="block h-auto w-full touch-none select-none rounded-2xl bg-white"
                  onPointerDown={handleCanvasPointerDown}
                  onPointerMove={handleCanvasPointerMove}
                  onPointerUp={stopDrawing}
                  onPointerLeave={stopDrawing}
                  onPointerCancel={stopDrawing}
                  aria-label="Pixel Art Canvas"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button variant="outline" className="flex-1" onClick={clearCanvas}>
                  <Eraser className="h-4 w-4" /> Leeren
                </Button>
                <Button className="flex-1" onClick={exportImage}>
                  <Download className="h-4 w-4" /> Exportieren
                </Button>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                {status}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-slate-300/80 bg-white/90 shadow-lg">
              <CardHeader className="border-b border-slate-200/80 bg-slate-50/80">
                <CardTitle>Größe</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-5 md:p-6">
                <div className="space-y-2">
                  <Label htmlFor="grid-size">Rastergröße</Label>
                  <Input
                    id="grid-size"
                    type="number"
                    min={MIN_SIZE}
                    max={MAX_SIZE}
                    value={gridSize}
                    onChange={(event) => setGridSize(event.target.value)}
                  />
                </div>

                <p className="text-sm text-slate-500">
                  Aktuell: {activeGridSize} x {activeGridSize} Pixel
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-300/80 bg-white/90 shadow-lg">
              <CardHeader className="border-b border-slate-200/80 bg-slate-50/80">
                <CardTitle>Farbe</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-5 md:p-6">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl border border-slate-200" style={{ backgroundColor: selectedColor }} />
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="color-picker">Aktive Farbe</Label>
                    <Input id="color-picker" type="color" value={selectedColor} onChange={(event) => setSelectedColor(event.target.value)} className="h-10 w-full p-1" />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {['#111827', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#a855f7', '#ec4899', '#ffffff'].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`h-11 rounded-xl border transition-all ${selectedColor === color ? 'border-slate-950 ring-2 ring-slate-950 ring-offset-2' : 'border-slate-200'}`}
                      style={{ backgroundColor: color }}
                      aria-label={`Farbe ${color}`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  <Sparkles className="h-4 w-4" />
                  Ziehe über die Leinwand, um mehrere Pixel in Folge zu malen.
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-300/80 bg-white/90 shadow-lg">
              <CardHeader className="border-b border-slate-200/80 bg-slate-50/80">
                <CardTitle>Hinweise</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-5 md:p-6 text-sm leading-relaxed text-slate-600">
                <p>Die Leinwand skaliert automatisch mit der gewählten Rastergröße.</p>
                <p>Beim Ändern der Größe wird die Leinwand neu initialisiert.</p>
                <p>Mit Export kannst du dein Bild als PNG herunterladen.</p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </main>
  )
}