import { createFileRoute } from "@tanstack/react-router"
import { Link } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, CircleDot, Coins, Dices, FerrisWheel } from "lucide-react"

export const Route = createFileRoute("/")({ component: App })

const apps = [
  {
    title: "Dice Roller",
    description: "Würfle frei mit Anzahl, Seiten und Modifier inklusive Verlaufsliste.",
    to: "/dice-roller",
    icon: Dices,
  },
  {
    title: "Coin Flip",
    description: "Wirf eine realistische Münze und erhalte zufällig Kopf oder Zahl.",
    to: "/coin-flip",
    icon: CircleDot,
  },
  {
    title: "Slot Machine",
    description: "Drehe die Walzen und versuche den Jackpot zu treffen.",
    to: "/slot",
    icon: Coins,
  },
  {
    title: "Wheel of Fortune",
    description: "Drehe das Glücksrad und lass einen Gewinner auswählen.",
    to: "/wof",
    icon: FerrisWheel,
  },
] as const

function App() {
  return (
    <main className="min-h-svh bg-linear-to-br from-slate-50 via-slate-100 to-slate-200 p-6 md:p-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Game Hub</p>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-5xl">Apps Schnell Start</h1>
          <p className="max-w-2xl text-sm text-slate-600 md:text-base">
            Wähle eine App und öffne sie direkt über die Karten. Alle vorhandenen Spiele sind hier zentral erreichbar.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {apps.map((app) => {
            const Icon = app.icon

            return (
              <Card key={app.to} className="group border-slate-300/80 bg-white/90 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <CardHeader className="space-y-3 pb-3">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white shadow-lg">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-xl font-bold text-slate-900">{app.title}</CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="text-sm leading-relaxed text-slate-600">{app.description}</p>
                </CardContent>

                <CardFooter>
                  <Button asChild className="w-full justify-between bg-slate-900 hover:bg-slate-800">
                    <Link to={app.to}>
                      Öffnen
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </section>
      </div>
    </main>
  )
}
