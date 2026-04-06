import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

export const Route = createFileRoute('/coin-flip')({
  component: RouteComponent,
})

function RouteComponent() {
  const [result, setResult] = useState<'Kopf' | 'Zahl' | null>(null)
  const [isFlipping, setIsFlipping] = useState(false)
  const [face, setFace] = useState<'Kopf' | 'Zahl'>('Kopf')
  const [flipTurns, setFlipTurns] = useState(10)

  const flipCoin = () => {
    if (isFlipping) return

    const outcome: 'Kopf' | 'Zahl' = Math.random() > 0.5 ? 'Kopf' : 'Zahl'
    const turns = 8 + Math.floor(Math.random() * 5)

    setResult(null)
    setIsFlipping(true)
    setFlipTurns(turns)

    window.setTimeout(() => {
      setFace(outcome)
      setResult(outcome)
      setIsFlipping(false)
    }, 1400)
  }

  return (
    <main className="min-h-svh bg-linear-to-br from-zinc-100 via-stone-50 to-slate-100 p-6 md:p-10">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <header className="relative rounded-3xl border border-zinc-200/80 bg-white/80 px-4 py-4 shadow-sm backdrop-blur md:px-6">
          <Button asChild variant="ghost" size="icon" className="absolute left-3 top-3 h-10 w-10 rounded-full">
            <Link to="/" aria-label="Zurück zur Übersicht">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>

          <div className="pl-12 pr-2 md:pl-14">
            <h1 className="text-2xl font-black tracking-tight text-zinc-900 md:text-4xl">Münzwurf</h1>
            <p className="mt-1 max-w-2xl text-sm text-zinc-600 md:text-base">
              Wirf eine Münze und erhalte sofort Kopf oder Zahl.
            </p>
          </div>
        </header>

        <Card className="mx-auto w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-5 p-6">
            <div className="coin-stage" aria-live="polite" aria-label={result ? `Ergebnis: ${result}` : 'Münze bereit'}>
              <div
                className={`coin ${isFlipping ? 'is-flipping' : ''}`}
                data-face={face}
                style={{ ['--coin-turns' as string]: String(flipTurns) }}
              >
                <div className="coin-face coin-front" aria-label="Kopf Seite">
                  <div className="coin-rim" />
                  <div className="coin-core">
                    <div className="coin-symbol">KOPF</div>
                    <div className="coin-year">2026</div>
                  </div>
                </div>
                <div className="coin-face coin-back" aria-label="Zahl Seite">
                  <div className="coin-rim" />
                  <div className="coin-core">
                    <div className="coin-symbol">ZAHL</div>
                    <div className="coin-year">1 TOKEN</div>
                  </div>
                </div>
              </div>
            </div>

            <Button onClick={flipCoin} className="w-full" disabled={isFlipping}>
              Münze werfen
            </Button>

            {result && (
              <div className="text-center text-lg font-medium">
                Ergebnis: {result}
              </div>
            )}

            {isFlipping && (
              <div className="text-sm text-muted-foreground">Die Münze flippt...</div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}