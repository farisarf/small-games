import { createFileRoute, Link } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { ArrowLeft, RotateCcw, Swords } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type Move = 'Stein' | 'Papier' | 'Schere'

type Outcome = 'win' | 'lose' | 'draw'

const MOVES: Move[] = ['Stein', 'Papier', 'Schere']

const MOVE_STYLES: Record<Move, string> = {
  Stein: 'from-stone-100 to-stone-200 border-stone-300 text-stone-950',
  Papier: 'from-sky-50 to-sky-100 border-sky-200 text-sky-950',
  Schere: 'from-rose-50 to-rose-100 border-rose-200 text-rose-950',
}

const MOVE_COPY: Record<Move, { label: string; detail: string }> = {
  Stein: { label: 'Stein', detail: 'hart und stabil' },
  Papier: { label: 'Papier', detail: 'leicht und formbar' },
  Schere: { label: 'Schere', detail: 'scharf und präzise' },
}

const RULES: Record<Move, Move> = {
  Stein: 'Schere',
  Papier: 'Stein',
  Schere: 'Papier',
}

const determineOutcome = (playerMove: Move, botMove: Move): Outcome => {
  if (playerMove === botMove) return 'draw'
  return RULES[playerMove] === botMove ? 'win' : 'lose'
}

const getResultText = (outcome: Outcome) => {
  if (outcome === 'win') return 'Du gewinnst die Runde.'
  if (outcome === 'lose') return 'Der Bot gewinnt die Runde.'
  return 'Unentschieden.'
}

export const Route = createFileRoute('/rps')({
  component: RouteComponent,
})

function RouteComponent() {
  const [playerChoice, setPlayerChoice] = useState<Move | null>(null)
  const [botChoice, setBotChoice] = useState<Move | null>(null)
  const [outcome, setOutcome] = useState<Outcome | null>(null)
  const [status, setStatus] = useState('Wähle Stein, Papier oder Schere.')
  const [isPlaying, setIsPlaying] = useState(false)
  const [playerScore, setPlayerScore] = useState(0)
  const [botScore, setBotScore] = useState(0)
  const [draws, setDraws] = useState(0)

  const scoreLabel = useMemo(() => {
    if (playerScore > botScore) return 'Du führst'
    if (botScore > playerScore) return 'Bot führt'
    return 'Gleichstand'
  }, [botScore, playerScore])

  const playRound = (move: Move) => {
    if (isPlaying) return

    setIsPlaying(true)
    setPlayerChoice(move)
    setBotChoice(null)
    setOutcome(null)
    setStatus('Der Bot denkt nach...')

    window.setTimeout(() => {
      const botMove = MOVES[Math.floor(Math.random() * MOVES.length)]
      const roundOutcome = determineOutcome(move, botMove)

      setBotChoice(botMove)
      setOutcome(roundOutcome)
      setStatus(getResultText(roundOutcome))

      if (roundOutcome === 'win') {
        setPlayerScore((current) => current + 1)
      } else if (roundOutcome === 'lose') {
        setBotScore((current) => current + 1)
      } else {
        setDraws((current) => current + 1)
      }

      setIsPlaying(false)
    }, 650)
  }

  const resetGame = () => {
    if (isPlaying) return

    setPlayerChoice(null)
    setBotChoice(null)
    setOutcome(null)
    setPlayerScore(0)
    setBotScore(0)
    setDraws(0)
    setStatus('Wähle Stein, Papier oder Schere.')
  }

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
            <h1 className="text-2xl font-black tracking-tight text-zinc-900 md:text-4xl">Stein, Papier, Schere</h1>
            <p className="mt-1 max-w-2xl text-sm text-zinc-600 md:text-base">
              Spiele gegen einen Bot, sammle Punkte und starte jederzeit eine neue Runde.
            </p>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="border-zinc-300/80 bg-white/90 shadow-lg">
            <CardHeader className="border-b border-zinc-200/80 bg-zinc-50/80">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Swords className="h-5 w-5" /> Gegen den Bot
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6 p-5 md:p-6">
              <div className="rounded-3xl border border-zinc-200 bg-linear-to-br from-white to-zinc-50 p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">Status</p>
                <p className="mt-2 text-lg font-semibold text-zinc-950">{status}</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Du</p>
                    <p className="mt-1 text-2xl font-black text-zinc-950">{playerScore}</p>
                  </div>
                  <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Bot</p>
                    <p className="mt-1 text-2xl font-black text-zinc-950">{botScore}</p>
                  </div>
                  <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Unentschieden</p>
                    <p className="mt-1 text-2xl font-black text-zinc-950">{draws}</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {MOVES.map((move) => {
                  const isSelected = playerChoice === move

                  return (
                    <button
                      key={move}
                      type="button"
                      onClick={() => playRound(move)}
                      disabled={isPlaying}
                      className={`rounded-3xl border bg-linear-to-br p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${MOVE_STYLES[move]} ${isSelected ? 'ring-2 ring-zinc-950 ring-offset-2' : ''} ${isPlaying ? 'cursor-wait opacity-70' : ''}`}
                    >
                      <p className="text-lg font-black">{MOVE_COPY[move].label}</p>
                      <p className="mt-1 text-sm opacity-80">{MOVE_COPY[move].detail}</p>
                    </button>
                  )
                })}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button className="flex-1" variant="outline" onClick={resetGame} disabled={isPlaying}>
                  <RotateCcw className="h-4 w-4" /> Zurücksetzen
                </Button>
                <Button className="flex-1" onClick={() => playRound(MOVES[Math.floor(Math.random() * MOVES.length)])} disabled={isPlaying}>
                  Zufälligen Zug spielen
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-zinc-300/80 bg-white/90 shadow-lg">
              <CardHeader className="border-b border-zinc-200/80 bg-zinc-50/80">
                <CardTitle>Rundenübersicht</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-5 md:p-6">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Dein Zug</p>
                    <p className="mt-2 text-xl font-bold text-zinc-950">{playerChoice ?? '—'}</p>
                  </div>
                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Bot-Zug</p>
                    <p className="mt-2 text-xl font-bold text-zinc-950">{botChoice ?? '—'}</p>
                  </div>
                </div>

                <div className={`rounded-2xl border p-4 ${outcome === 'win' ? 'border-emerald-200 bg-emerald-50 text-emerald-950' : outcome === 'lose' ? 'border-rose-200 bg-rose-50 text-rose-950' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-70">Ergebnis</p>
                  <p className="mt-2 text-lg font-bold">{outcome ? getResultText(outcome) : 'Noch keine Runde gespielt.'}</p>
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm leading-relaxed text-zinc-600">
                  <p className="font-semibold text-zinc-900">Regelübersicht</p>
                  <p className="mt-2">Stein schlägt Schere, Schere schlägt Papier und Papier schlägt Stein.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-zinc-300/80 bg-white/90 shadow-lg">
              <CardHeader className="border-b border-zinc-200/80 bg-zinc-50/80">
                <CardTitle>Match-Stand</CardTitle>
              </CardHeader>
              <CardContent className="p-5 md:p-6">
                <div className="rounded-3xl border border-zinc-200 bg-linear-to-br from-zinc-50 to-white p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">Aktueller Stand</p>
                  <p className="mt-2 text-2xl font-black text-zinc-950">
                    {playerScore} : {botScore}
                  </p>
                  <p className="mt-2 text-sm text-zinc-600">{scoreLabel}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </main>
  )
}