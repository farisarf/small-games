import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState, useCallback } from 'react'
import { Link } from '@tanstack/react-router'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Coins, Play, RotateCcw } from "lucide-react"

export const Route = createFileRoute('/slot')({
  component: RouteComponent,
})

const SYMBOLS = ['🍒', '🍋', '🍇', '💎', '🔔', '7️⃣']
const SYMBOL_HEIGHT = 120
const VIEW_HEIGHT = SYMBOL_HEIGHT * 3

const easeOutElastic = (t: number) => {
  const p = 0.3
  return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1
}

function RouteComponent() {
  const [balance, setBalance] = useState(1000)
  const [bet, setBet] = useState([10])
  const [isSpinning, setIsSpinning] = useState(false)
  const [resultText, setResultText] = useState("Viel Glück!")

  const canvasRefs = [
    useRef<HTMLCanvasElement>(null),
    useRef<HTMLCanvasElement>(null),
    useRef<HTMLCanvasElement>(null)
  ]

  const reelState = useRef([
    { offset: 0, targetOffset: 0, startTime: 0, finalIndex: 0, symbols: [...SYMBOLS].sort(() => Math.random() - 0.5) },
    { offset: 0, targetOffset: 0, startTime: 0, finalIndex: 0, symbols: [...SYMBOLS].sort(() => Math.random() - 0.5) },
    { offset: 0, targetOffset: 0, startTime: 0, finalIndex: 0, symbols: [...SYMBOLS].sort(() => Math.random() - 0.5) },
  ])

  const draw = useCallback(() => {
    const now = performance.now()
    const duration = 2500

    reelState.current.forEach((reel, i) => {
      const canvas = canvasRefs[i].current
      const ctx = canvas?.getContext('2d')
      if (!canvas || !ctx) return

      if (reel.startTime > 0) {
        const elapsed = now - reel.startTime
        const progress = Math.min(elapsed / duration, 1)

        if (progress < 1) {
          const ease = easeOutElastic(progress)
          reel.offset = ease * reel.targetOffset
        } else {
          reel.offset = reel.targetOffset
          reel.startTime = 0

          if (i === 2) {
            setIsSpinning(false)
            checkWin()
          }
        }
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const totalHeight = reel.symbols.length * SYMBOL_HEIGHT

      for (let j = -5; j < reel.symbols.length + 5; j++) {
        const symbolIndex = ((j % reel.symbols.length) + reel.symbols.length) % reel.symbols.length
        const symbol = reel.symbols[symbolIndex]

        const yPos = (j * SYMBOL_HEIGHT) + (reel.offset % totalHeight)

        ctx.font = '70px serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(symbol, canvas.width / 2, yPos + SYMBOL_HEIGHT / 2)
      }
    })

    if (reelState.current.some(r => r.startTime > 0)) {
      requestAnimationFrame(draw)
    }
  }, [])

  useEffect(() => {
    draw()
  }, [draw])

  const checkWin = () => {
    const results = reelState.current.map(r => r.symbols[r.finalIndex])

    if (results[0] === results[1] && results[1] === results[2]) {
      const win = bet[0] * 15
      setBalance(b => b + win)
      setResultText(`JACKPOT: ${win}€!`)
    } else if (
      results[0] === results[1] ||
      results[1] === results[2] ||
      results[0] === results[2]
    ) {
      const win = Math.floor(bet[0] * 2)
      setBalance(b => b + win)
      setResultText(`Gewonnen: ${win}€`)
    } else {
      setResultText("Leider verloren")
    }
  }

  const spin = () => {
    if (isSpinning || balance < bet[0]) return

    setBalance(b => b - bet[0])
    setResultText("Viel Glück...")
    setIsSpinning(true)

    const now = performance.now()

    reelState.current.forEach((reel, i) => {
      const totalHeight = reel.symbols.length * SYMBOL_HEIGHT

      const randomIndex = Math.floor(Math.random() * reel.symbols.length)
      const rounds = 6 + i * 2

      reel.startTime = now + i * 150
      reel.targetOffset = rounds * totalHeight + randomIndex * SYMBOL_HEIGHT
      reel.finalIndex = randomIndex
    })

    requestAnimationFrame(draw)
  }

  return (
    <main className="min-h-svh bg-linear-to-br from-zinc-100 via-stone-50 to-slate-100 p-4 font-sans md:p-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="relative rounded-3xl border border-zinc-200/80 bg-white/80 px-4 py-4 shadow-sm backdrop-blur md:px-6">
          <Button asChild variant="ghost" size="icon" className="absolute left-3 top-3 h-10 w-10 rounded-full">
            <Link to="/" aria-label="Zurück zur Übersicht">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>

          <div className="pl-12 pr-2 md:pl-14">
            <h1 className="text-2xl font-black tracking-tight text-zinc-900 md:text-4xl">Slot Machine</h1>
            <p className="mt-1 max-w-2xl text-sm text-zinc-600 md:text-base">
              Drehe die Walzen und versuche, den Jackpot zu treffen.
            </p>
          </div>
        </header>

      <div className="absolute left-4 top-4 z-20 w-full max-w-70 hidden md:block">
        <Card className="shadow-2xl border-none bg-white/90 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Coins className="w-5 h-5 text-yellow-500" /> Guthaben
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-3xl font-black">{balance} €</div>

            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase">Einsatz</Label>
              <Slider value={bet} onValueChange={setBet} max={100} min={10} step={10} disabled={isSpinning} />
              <p className="text-right font-bold">{bet[0]} €</p>
            </div>

            <Button variant="outline" className="w-full gap-2" onClick={() => setBalance(1000)} disabled={isSpinning}>
              <RotateCcw className="w-4 h-4" /> Reset
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col items-center">
        <div className="bg-slate-800 p-8 rounded-[50px] shadow-2xl border-12 border-slate-700 relative">

          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-3/4 bg-slate-900 border-4 border-slate-700 rounded-t-2xl py-2 px-4 text-center">
            <span className="text-yellow-400 font-black text-sm uppercase animate-pulse">
              {resultText}
            </span>
          </div>

          <div className="flex gap-4 bg-slate-950 p-4 rounded-2xl overflow-hidden border-4 border-black relative">
            {canvasRefs.map((ref, i) => (
              <div key={i} className="relative bg-white rounded-lg overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
                <canvas ref={ref} width={130} height={VIEW_HEIGHT} />
                <div className="absolute inset-0 pointer-events-none bg-linear-to-b from-black/20 via-transparent to-black/20" />
              </div>
            ))}

            <div className="absolute top-1/2 left-0 w-full h-1 bg-red-500/40 z-20 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="mt-10 flex justify-center">
            <button
              onClick={spin}
              disabled={isSpinning || balance < bet[0]}
              className={`w-24 h-24 rounded-full flex justify-center items-center transition-all active:scale-90
                ${isSpinning ? 'bg-gray-600' : 'bg-red-600 hover:bg-red-500 shadow-[0_0_0_4px_white,0_0_0_10px_#ef4444,0_15px_30px_rgba(0,0,0,0.5)]'}
              `}
            >
              <Play className={`w-12 h-12 text-white fill-current ${isSpinning ? 'animate-pulse' : ''}`} />
            </button>
          </div>
        </div>
      </div>
      </div>
    </main>
  )
}