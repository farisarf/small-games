import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState, useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { ArrowLeft, Trash2, Plus, Settings2 } from "lucide-react"

export const Route = createFileRoute('/wof')({
  component: RouteComponent,
})

const PALETTE = ['#E5243B', '#DDA63A', '#4C9F38', '#C5192D', '#FF3A21', '#FCC30B', '#A21942', '#FD6925', '#DD1367', '#0A97D9'];

function RouteComponent() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [participants, setParticipants] = useState([
    { color: '#E5243B', label: 'Carlos' },
    { color: '#DDA63A', label: 'Boru' },
    { color: '#4C9F38', label: 'Dimas' },
    { color: '#0A97D9', label: 'Lubel' },
  ])
  const [newName, setNewName] = useState('')
  const [speedSetting, setSpeedSetting] = useState([50])
  const [spinText, setSpinText] = useState('SPIN')
  const [spinBg, setSpinBg] = useState('#222')

  const engine = useRef({
    angVel: 0,
    ang: 0,
    lastIndex: -1,
    isSpinning: false
  })

  const dia = 600
  const rad = dia / 2
  const PI = Math.PI
  const TAU = 2 * PI
  const friction = useMemo(() => 0.985 + (speedSetting[0] / 10000), [speedSetting])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const draw = () => {
      const tot = participants.length
      const arc = TAU / tot
      ctx.clearRect(0, 0, dia, dia)
      participants.forEach((p, i) => {
        const angle = arc * i
        ctx.save()
        ctx.beginPath()
        ctx.fillStyle = p.color
        ctx.moveTo(rad, rad)
        ctx.arc(rad, rad, rad, angle, angle + arc)
        ctx.lineTo(rad, rad)
        ctx.fill()
        ctx.translate(rad, rad)
        ctx.rotate(angle + arc / 2)
        ctx.textAlign = 'right'
        ctx.fillStyle = '#fff'
        ctx.font = `bold ${Math.max(14, Math.round(dia / 30))}px sans-serif`
        ctx.fillText(p.label, rad - Math.max(14, Math.round(dia / 30)), 7)
        ctx.restore()
      })
    }

    draw()

    let requestID: number
    const frame = () => {
      const e = engine.current
      if (e.angVel > 0) {
        e.angVel *= friction
        if (e.angVel < 0.001) { e.angVel = 0; e.isSpinning = false; }
        e.ang += e.angVel
        e.ang %= TAU
        canvas.style.transform = `rotate(${e.ang - PI / 2}rad)`
        
        const tot = participants.length
        const currentIndex = Math.floor(tot - (e.ang / TAU) * tot) % tot
        if (currentIndex !== e.lastIndex) {
          e.lastIndex = currentIndex
          setSpinText(participants[currentIndex].label)
          setSpinBg(participants[currentIndex].color)
        }
      }
      requestID = requestAnimationFrame(frame)
    }

    requestID = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(requestID)
  }, [participants, friction])

  const handleSpin = () => {
    if (engine.current.isSpinning || participants.length < 2) return
    engine.current.isSpinning = true
    const baseSpeed = 0.15 + (speedSetting[0] / 400)
    engine.current.angVel = Math.random() * (baseSpeed * 0.2) + baseSpeed
  }

  const configPanel = (
    <Card className="border-none bg-white/90 shadow-2xl backdrop-blur-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Settings2 className="w-5 h-5" /> Konfiguration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tempo</Label>
          <Slider value={speedSetting} onValueChange={setSpeedSetting} max={100} step={1} />
        </div>

        <div className="space-y-3 pt-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Teilnehmer</Label>
          <div className="flex gap-2">
            <Input 
              value={newName} 
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Name..."
              className="h-9"
              onKeyDown={(e) => e.key === 'Enter' && (setParticipants([...participants, { label: newName, color: PALETTE[participants.length % PALETTE.length] }]), setNewName(''))}
            />
            <Button size="sm" onClick={() => (setParticipants([...participants, { label: newName, color: PALETTE[participants.length % PALETTE.length] }]), setNewName(''))}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-1 max-h-[30vh] overflow-y-auto pr-1 custom-scrollbar">
          {participants.map((p, i) => (
            <div key={i} className="flex items-center justify-between bg-slate-50 p-2 rounded border text-sm group">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-2 h-2 shrink-0 rounded-full" style={{ backgroundColor: p.color }} />
                <span className="truncate">{p.label}</span>
              </div>
              <button onClick={() => setParticipants(participants.filter((_, idx) => idx !== i))} className="text-slate-400 hover:text-red-500 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <main className="min-h-svh bg-linear-to-br from-zinc-100 via-stone-50 to-slate-100 p-4 md:p-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="relative rounded-3xl border border-zinc-200/80 bg-white/80 px-4 py-4 shadow-sm backdrop-blur md:px-6">
          <Button asChild variant="ghost" size="icon" className="absolute left-3 top-3 h-10 w-10 rounded-full">
            <Link to="/" aria-label="Zurück zur Übersicht">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>

          <div className="pl-12 pr-2 md:pl-14">
            <h1 className="text-2xl font-black tracking-tight text-zinc-900 md:text-4xl">Wheel of Fortune</h1>
            <p className="mt-1 max-w-2xl text-sm text-zinc-600 md:text-base">
              Lege Teilnehmer fest und drehe das Glücksrad für eine zufällige Auswahl.
            </p>
          </div>
        </header>

        <div className="relative flex flex-col items-center justify-start gap-6 overflow-x-hidden overflow-y-auto md:justify-center md:overflow-hidden">
          <div className="relative flex w-full flex-col items-center justify-center">
            <div className="relative aspect-square w-[clamp(280px,90vw,600px)] rounded-full bg-white p-3 shadow-[0_20px_50px_rgba(0,0,0,0.2)] md:p-4">
          <canvas
            ref={canvasRef}
            width={dia}
            height={dia}
            className="block h-auto w-full will-change-transform rounded-full"
            style={{ transform: `rotate(${-PI / 2}rad)` }}
          />
          <button
            onClick={handleSpin}
            disabled={participants.length < 2}
            style={{ 
              backgroundColor: spinBg,
              boxShadow: `0 0 0 4px white, 0 0 0 10px ${spinBg}, 0 15px 30px rgba(0,0,0,0.5)`
            }}
            className="absolute top-1/2 left-1/2 w-[24%] h-[24%] -mt-[12%] -ml-[12%] 
                       rounded-full flex justify-center items-center text-center 
                       font-black text-white uppercase cursor-pointer select-none 
                       transition-all duration-300 z-10 border-none outline-none
                       hover:scale-105 active:scale-95
                       after:content-[''] after:absolute after:-top-5.5 after:left-1/2 after:-ml-3
                       after:border-l-12 after:border-l-transparent 
                       after:border-r-12 after:border-r-transparent 
                       after:border-b-20 after:border-b-current"
          >
            <span className="text-[10px] md:text-sm px-2 leading-none drop-shadow-md overflow-hidden">
              {participants.length < 2 ? 'Bereit?' : spinText}
            </span>
          </button>
        </div>

        <div className="mt-6 flex flex-col items-center gap-4 md:mt-8">
          <p className="text-center text-[11px] font-medium uppercase tracking-widest text-slate-400 animate-pulse">
            {engine.current.isSpinning ? "Viel Glück!" : "Klicke auf den Button zum Drehen"}
          </p>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="h-11 w-11 rounded-full border-slate-300 bg-white shadow-sm hover:bg-slate-50">
                <Settings2 className="h-4 w-4" />
                <span className="sr-only">Konfiguration öffnen</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[calc(100%-2rem)] rounded-2xl border-none bg-transparent p-0 shadow-none sm:max-w-105">
              {configPanel}
            </DialogContent>
          </Dialog>
            </div>

            <div className="mt-6 flex flex-col items-center gap-4 md:mt-8">
              <p className="text-center text-[11px] font-medium uppercase tracking-widest text-slate-400 animate-pulse">
                {engine.current.isSpinning ? "Viel Glück!" : "Klicke auf den Button zum Drehen"}
              </p>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon" className="h-11 w-11 rounded-full border-slate-300 bg-white shadow-sm hover:bg-slate-50">
                    <Settings2 className="h-4 w-4" />
                    <span className="sr-only">Konfiguration öffnen</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[calc(100%-2rem)] rounded-2xl border-none bg-transparent p-0 shadow-none sm:max-w-105">
                  {configPanel}
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}