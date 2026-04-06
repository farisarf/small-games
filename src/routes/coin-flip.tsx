import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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
    <div className="flex min-h-svh p-6 justify-center items-center">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Münzwurf</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-5">
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
  )
}