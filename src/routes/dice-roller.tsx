import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dices, Plus, RotateCcw, Trash2 } from "lucide-react"

export const Route = createFileRoute('/dice-roller')({
  component: RouteComponent,
})

type RollEntry = {
  id: number
  notation: string
  groups: Array<{
    id: number
    count: number
    sides: number
    rolls: number[]
  }>
  modifier: number
  total: number
  createdAt: string
}

type DiceGroup = {
  id: number
  count: number
  sides: number
}

const MAX_GROUPS = 6

function RouteComponent() {
  const [diceGroups, setDiceGroups] = useState<DiceGroup[]>([
    { id: 1, count: 1, sides: 6 },
    { id: 2, count: 1, sides: 8 },
    { id: 3, count: 1, sides: 20 },
  ])
  const [modifier, setModifier] = useState(0)
  const [isRolling, setIsRolling] = useState(false)
  const [previewGroups, setPreviewGroups] = useState<RollEntry['groups']>([])
  const [lastRoll, setLastRoll] = useState<RollEntry | null>(null)
  const [history, setHistory] = useState<RollEntry[]>([])

  const notation = useMemo(() => {
    const groupsNotation = diceGroups
      .filter((group) => group.count > 0)
      .map((group) => `${group.count}d${group.sides}`)
      .join(' + ')

    const mod = modifier === 0 ? '' : modifier > 0 ? `+${modifier}` : String(modifier)
    return `${groupsNotation || '0d6'}${mod}`
  }, [diceGroups, modifier])

  const clampInt = (value: number, min: number, max: number) => {
    if (Number.isNaN(value)) return min
    return Math.min(max, Math.max(min, Math.floor(value)))
  }

  const updateGroup = (id: number, patch: Partial<DiceGroup>) => {
    setDiceGroups((current) =>
      current.map((group) => (group.id === id ? { ...group, ...patch } : group)),
    )
  }

  const addGroup = () => {
    setDiceGroups((current) => {
      if (current.length >= MAX_GROUPS) return current
      const nextId = current.length > 0 ? Math.max(...current.map((group) => group.id)) + 1 : 1
      return [...current, { id: nextId, count: 1, sides: 6 }]
    })
  }

  const removeGroup = (id: number) => {
    setDiceGroups((current) => {
      if (current.length <= 1) return current
      return current.filter((group) => group.id !== id)
    })
  }

  const rollDice = () => {
    if (isRolling) return

    const activeGroups = diceGroups.filter((group) => group.count > 0)
    if (activeGroups.length === 0) return

    setIsRolling(true)

    const groups = activeGroups.map((group) => ({
      id: group.id,
      count: group.count,
      sides: group.sides,
      rolls: Array.from({ length: group.count }, () => Math.floor(Math.random() * group.sides) + 1),
    }))
    const total = groups
      .flatMap((group) => group.rolls)
      .reduce((sum, current) => sum + current, 0) + modifier

    const entry: RollEntry = {
      id: Date.now(),
      notation,
      groups,
      modifier,
      total,
      createdAt: new Date().toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    }

    const intervalId = window.setInterval(() => {
      setPreviewGroups(
        activeGroups.map((group) => ({
          id: group.id,
          count: group.count,
          sides: group.sides,
          rolls: Array.from({ length: group.count }, () => Math.floor(Math.random() * group.sides) + 1),
        })),
      )
    }, 85)

    window.setTimeout(() => {
      window.clearInterval(intervalId)
      setPreviewGroups(groups)
      setLastRoll(entry)
      setHistory((current) => [entry, ...current].slice(0, 6))
      setIsRolling(false)
    }, 1100)
  }

  const clearHistory = () => {
    setLastRoll(null)
    setHistory([])
  }

  return (
    <main className="min-h-svh bg-linear-to-br from-zinc-100 via-stone-50 to-slate-100 p-6 md:p-10">
      <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[340px_1fr]">
        <Card className="border-zinc-300/80 bg-white/90 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Dices className="h-5 w-5" /> Dice Roller
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Würfelgruppen</Label>
              <div className="space-y-2">
                {diceGroups.map((group, index) => (
                  <div key={group.id} className="grid grid-cols-[1fr_1fr_auto] items-end gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-2">
                    <div className="space-y-1">
                      <Label htmlFor={`dice-count-${group.id}`} className="text-xs text-muted-foreground">Anzahl</Label>
                      <Input
                        id={`dice-count-${group.id}`}
                        type="number"
                        min={1}
                        max={20}
                        value={group.count}
                        onChange={(e) => updateGroup(group.id, { count: clampInt(Number(e.target.value), 1, 20) })}
                        disabled={isRolling}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`dice-sides-${group.id}`} className="text-xs text-muted-foreground">Seiten</Label>
                      <Input
                        id={`dice-sides-${group.id}`}
                        type="number"
                        min={2}
                        max={100}
                        value={group.sides}
                        onChange={(e) => updateGroup(group.id, { sides: clampInt(Number(e.target.value), 2, 100) })}
                        disabled={isRolling}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10"
                      onClick={() => removeGroup(group.id)}
                      disabled={isRolling || diceGroups.length <= 1}
                      aria-label={`Würfelgruppe ${index + 1} entfernen`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={addGroup}
                disabled={isRolling || diceGroups.length >= MAX_GROUPS}
              >
                <Plus className="h-4 w-4" /> Würfeltyp hinzufügen
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dice-modifier">Modifier</Label>
              <Input
                id="dice-modifier"
                type="number"
                min={-100}
                max={100}
                value={modifier}
                onChange={(e) => setModifier(clampInt(Number(e.target.value), -100, 100))}
                disabled={isRolling}
              />
            </div>

            <div className="rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm">
              Notation: <span className="font-semibold">{notation}</span>
            </div>

            <Button className="w-full" onClick={rollDice} disabled={isRolling}>
              {isRolling ? 'Würfelt...' : 'Würfeln'}
            </Button>
            <Button className="w-full" variant="outline" onClick={clearHistory} disabled={history.length === 0 || isRolling}>
              <RotateCcw className="h-4 w-4" /> Verlauf löschen
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-zinc-300/80 bg-white/90 shadow-lg">
            <CardHeader>
              <CardTitle>Letzter Wurf</CardTitle>
            </CardHeader>
            <CardContent>
              {isRolling || lastRoll ? (
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    {isRolling
                      ? `${notation} wird geworfen...`
                      : `${lastRoll?.notation ?? notation} um ${lastRoll?.createdAt ?? '--:--:--'}`}
                  </div>
                  <div className="dice-tray" role="status" aria-live="polite">
                    {(isRolling ? previewGroups : (lastRoll?.groups ?? []))
                      .flatMap((group) => group.rolls.map((roll, index) => ({
                        value: roll,
                        sides: group.sides,
                        key: `${group.id}-${index}-${roll}`,
                      })))
                      .map((die) => (
                        <div key={die.key} className="flex flex-col items-center gap-1">
                          <div className="dice-cube">
                            {die.value}
                          </div>
                          <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                            d{die.sides}
                          </span>
                        </div>
                      ))}
                  </div>
                  {!isRolling && lastRoll && (
                    <>
                      <div className="text-sm text-muted-foreground">
                        Modifier: {lastRoll.modifier >= 0 ? `+${lastRoll.modifier}` : lastRoll.modifier}
                      </div>
                      <div className="text-3xl font-black">Gesamt: {lastRoll.total}</div>
                    </>
                  )}
                  {isRolling && <div className="text-sm text-muted-foreground">Die Würfel rollen...</div>}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Noch kein Wurf. Starte mit dem ersten Roll.</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-zinc-300/80 bg-white/90 shadow-lg">
            <CardHeader>
              <CardTitle>Verlauf</CardTitle>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <p className="text-sm text-muted-foreground">Keine Einträge vorhanden.</p>
              ) : (
                <ul className="space-y-2">
                  {history.map((entry) => (
                    <li key={entry.id} className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm">
                      <span className="font-medium">{entry.notation}</span>
                      <span className="text-muted-foreground">{entry.total}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
