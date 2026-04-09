import { createFileRoute, Link } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { ArrowLeft, RefreshCcw, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

const MIN_NUMBER = 1
const MAX_NUMBER = 100

export const Route = createFileRoute('/number-guessing')({
  component: RouteComponent,
})

function makeSecretNumber() {
  return Math.floor(Math.random() * (MAX_NUMBER - MIN_NUMBER + 1)) + MIN_NUMBER
}

function RouteComponent() {
  const [rangeMin, setRangeMin] = useState('1')
  const [rangeMax, setRangeMax] = useState('100')
  const [secretNumber, setSecretNumber] = useState(() => makeSecretNumber())
  const [guessInput, setGuessInput] = useState('')
  const [feedback, setFeedback] = useState('Der Bot hat eine Zahl zwischen 1 und 100 gewählt.')
  const [attempts, setAttempts] = useState(0)
  const [wins, setWins] = useState(0)
  const [history, setHistory] = useState<number[]>([])
  const [isSolved, setIsSolved] = useState(false)

  const parsedRangeMin = Number.parseInt(rangeMin, 10)
  const parsedRangeMax = Number.parseInt(rangeMax, 10)
  const isRangeValid = Number.isInteger(parsedRangeMin) && Number.isInteger(parsedRangeMax) && parsedRangeMin < parsedRangeMax
  const activeMin = isRangeValid ? parsedRangeMin : MIN_NUMBER
  const activeMax = isRangeValid ? parsedRangeMax : MAX_NUMBER

  const remainingHint = useMemo(() => {
    if (isSolved) {
      return `Geschafft in ${attempts} ${attempts === 1 ? 'Versuch' : 'Versuchen'}.`
    }

    return `Versuche die Zahl in möglichst wenigen Tipps zu finden.`
  }, [attempts, isSolved])

  const resetGame = (nextMin = activeMin, nextMax = activeMax) => {
    const nextSecret = Math.floor(Math.random() * (nextMax - nextMin + 1)) + nextMin

    setSecretNumber(nextSecret)
    setGuessInput('')
    setFeedback(`Der Bot hat eine neue Zahl zwischen ${nextMin} und ${nextMax} gewählt.`)
    setAttempts(0)
    setHistory([])
    setIsSolved(false)
  }

  const applyRange = () => {
    if (!isRangeValid) {
      setFeedback('Die untere Grenze muss kleiner als die obere Grenze sein.')
      return
    }

    resetGame(parsedRangeMin, parsedRangeMax)
  }

  const submitGuess = () => {
    if (isSolved) return

    const parsedGuess = Number.parseInt(guessInput, 10)

    if (!Number.isInteger(parsedGuess)) {
      setFeedback('Bitte gib eine ganze Zahl ein.')
      return
    }

    if (parsedGuess < activeMin || parsedGuess > activeMax) {
      setFeedback(`Die Zahl muss zwischen ${activeMin} und ${activeMax} liegen.`)
      return
    }

    setAttempts((current) => current + 1)
    setHistory((current) => [parsedGuess, ...current].slice(0, 8))

    if (parsedGuess === secretNumber) {
      setFeedback(`Treffer. ${parsedGuess} ist richtig.`)
      setWins((current) => current + 1)
      setIsSolved(true)
      return
    }

    setFeedback(parsedGuess < secretNumber ? 'Zu niedrig. Der Bot sagt: höher.' : 'Zu hoch. Der Bot sagt: niedriger.')
  }

  return (
    <main className="min-h-svh bg-linear-to-br from-slate-50 via-zinc-100 to-slate-200 p-4 md:p-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="relative rounded-3xl border border-slate-200/80 bg-white/80 px-4 py-4 shadow-sm backdrop-blur md:px-6">
          <Button asChild variant="ghost" size="icon" className="absolute left-3 top-3 h-10 w-10 rounded-full">
            <Link to="/" aria-label="Zurück zur Übersicht">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>

          <div className="pl-12 pr-2 md:pl-14">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 md:text-4xl">Number Guessing Game</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-600 md:text-base">
              Der Bot wählt eine Zahl zwischen 1 und 100. Du bekommst Hinweise und versuchst, sie mit so wenig Tipps wie möglich zu finden.
            </p>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="border-slate-300/80 bg-white/90 shadow-lg">
            <CardHeader className="border-b border-slate-200/80 bg-slate-50/80">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Target className="h-5 w-5" /> Zahlenraten gegen den Bot
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-5 p-5 md:p-6">
              <div className="rounded-3xl border border-slate-200 bg-linear-to-br from-white to-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Hinweis</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">{feedback}</p>
                <p className="mt-2 text-sm text-slate-600">{remainingHint}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <Input
                  type="number"
                  min={activeMin}
                  max={activeMax}
                  value={guessInput}
                  onChange={(event) => setGuessInput(event.target.value)}
                  placeholder="Dein Tipp..."
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      submitGuess()
                    }
                  }}
                  disabled={isSolved}
                />
                <Button onClick={submitGuess} disabled={isSolved}>
                  Tipp abgeben
                </Button>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button variant="outline" className="flex-1" onClick={() => resetGame()}>
                  <RefreshCcw className="h-4 w-4" /> Neue Zahl
                </Button>
                <Button
                  className="flex-1"
                  variant="secondary"
                  onClick={() => {
                    const suggestion = Math.floor((activeMin + activeMax) / 2)
                    setGuessInput(String(suggestion))
                  }}
                  disabled={isSolved}
                >
                  Bot-Tipp füllen
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-slate-300/80 bg-white/90 shadow-lg">
              <CardHeader className="border-b border-slate-200/80 bg-slate-50/80">
                <CardTitle>Range</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-5 md:p-6">
                <p className="text-sm text-slate-600">Lege den Zahlenbereich selbst fest.</p>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500" htmlFor="range-min">
                      Von
                    </label>
                    <Input
                      id="range-min"
                      type="number"
                      value={rangeMin}
                      onChange={(event) => setRangeMin(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          applyRange()
                        }
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500" htmlFor="range-max">
                      Bis
                    </label>
                    <Input
                      id="range-max"
                      type="number"
                      value={rangeMax}
                      onChange={(event) => setRangeMax(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          applyRange()
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-500">
                    Aktiver Bereich: {activeMin} bis {activeMax}
                  </p>
                  <Button variant="outline" size="sm" onClick={applyRange}>
                    Range anwenden
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-300/80 bg-white/90 shadow-lg">
              <CardHeader className="border-b border-slate-200/80 bg-slate-50/80">
                <CardTitle>Spielstand</CardTitle>
              </CardHeader>
              <CardContent className="p-5 md:p-6">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Versuche</p>
                    <p className="mt-1 text-2xl font-black text-slate-950">{attempts}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Treffer</p>
                    <p className="mt-1 text-2xl font-black text-slate-950">{wins}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Bot-Zahl</p>
                    <p className="mt-1 text-2xl font-black text-slate-950">{isSolved ? secretNumber : '???'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-300/80 bg-white/90 shadow-lg">
              <CardHeader className="border-b border-slate-200/80 bg-slate-50/80">
                <CardTitle>Letzte Tipps</CardTitle>
              </CardHeader>
              <CardContent className="p-5 md:p-6">
                {history.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {history.map((value, index) => (
                      <span
                        key={`${value}-${index}`}
                        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-700"
                      >
                        {value}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">Noch keine Tipps abgegeben.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </main>
  )
}