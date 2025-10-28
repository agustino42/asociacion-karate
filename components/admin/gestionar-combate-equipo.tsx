"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Trophy, Play, CheckCircle, Clock, Flame, Plus, Minus } from "lucide-react"

export function GestionarCombateEquipo({ combate }: { combate: any }) {
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [puntos1, setPuntos1] = useState(combate.puntos_equipo1)
  const [puntos2, setPuntos2] = useState(combate.puntos_equipo2)

  const [timeLeft, setTimeLeft] = useState(combate.duracion_minutos * 60) // in seconds
  const [isTimerRunning, setIsTimerRunning] = useState(false)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isTimerRunning && timeLeft > 0 && combate.estado === "en_curso") {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isTimerRunning, timeLeft, combate.estado])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleIniciarCombate = async () => {
    setLoading(true)
    const { error } = await supabase.from("combates_equipos").update({ estado: "en_curso" }).eq("id", combate.id)

    if (!error) {
      setIsTimerRunning(true)
      router.refresh()
    } else {
      setError(error.message)
    }
    setLoading(false)
  }

  const handleActualizarPuntos = async () => {
    setLoading(true)
    setError(null)

    try {
      const ganadorId = puntos1 > puntos2 ? combate.equipo1.id : puntos2 > puntos1 ? combate.equipo2.id : null

      const { error } = await supabase
        .from("combates_equipos")
        .update({
          puntos_equipo1: puntos1,
          puntos_equipo2: puntos2,
          equipo_ganador_id: ganadorId,
        })
        .eq("id", combate.id)

      if (error) throw error

      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleFinalizarCombate = async () => {
    setLoading(true)
    setError(null)

    try {
      const ganadorId = puntos1 > puntos2 ? combate.equipo1.id : puntos2 > puntos1 ? combate.equipo2.id : null

      const { error: combateError } = await supabase
        .from("combates_equipos")
        .update({
          puntos_equipo1: puntos1,
          puntos_equipo2: puntos2,
          equipo_ganador_id: ganadorId,
          estado: "finalizado",
        })
        .eq("id", combate.id)

      if (combateError) throw combateError

      if (ganadorId) {
        const perdedorId = ganadorId === combate.equipo1.id ? combate.equipo2.id : combate.equipo1.id

        await Promise.all([
          supabase.rpc("actualizar_ranking_equipo", {
            p_equipo_id: ganadorId,
            p_resultado: "victoria",
            p_puntos: 3,
          }),
          supabase.rpc("actualizar_ranking_equipo", {
            p_equipo_id: perdedorId,
            p_resultado: "derrota",
            p_puntos: 0,
          }),
        ])

        await supabase.rpc("recalcular_posiciones_equipos")
      }

      setIsTimerRunning(false)
      router.push("/admin/combates")
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const progressPercentage = ((combate.duracion_minutos * 60 - timeLeft) / (combate.duracion_minutos * 60)) * 100

  return (
    <div className="space-y-6">
      {combate.estado === "en_curso" && (
        <Card className="border-2 border-orange-500 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2">
                <Flame className="h-6 w-6 text-orange-600 animate-pulse" />
                <Badge className="bg-orange-600 text-lg px-4 py-1">COMBATE EN VIVO</Badge>
                <Flame className="h-6 w-6 text-orange-600 animate-pulse" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-center gap-3">
                  <Clock className="h-8 w-8 text-orange-600" />
                  <span className="text-6xl font-bold font-mono tabular-nums">{formatTime(timeLeft)}</span>
                </div>
                <Progress value={progressPercentage} className="h-3" />
                <p className="text-sm text-muted-foreground">
                  {timeLeft === 0 ? "¡Tiempo finalizado!" : "Tiempo restante"}
                </p>
              </div>

              <div className="flex items-center justify-center gap-4">
                <Button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  variant={isTimerRunning ? "outline" : "default"}
                  size="lg"
                >
                  {isTimerRunning ? "Pausar" : "Reanudar"}
                </Button>
                <Button onClick={() => setTimeLeft(combate.duracion_minutos * 60)} variant="outline" size="lg">
                  Reiniciar Timer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Estado del Combate</CardTitle>
            <Badge
              variant={
                combate.estado === "finalizado" ? "outline" : combate.estado === "en_curso" ? "default" : "secondary"
              }
              className={combate.estado === "en_curso" ? "bg-orange-600" : ""}
            >
              {combate.estado.replace("_", " ").toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card
              className={`border-4 transition-all ${puntos1 > puntos2 ? "border-green-500 shadow-lg shadow-green-500/50" : "border-red-200"}`}
            >
              <CardHeader className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950">
                <CardTitle className="text-xl flex items-center justify-between">
                  <span>
                    {combate.equipo1.nombre}
                  </span>
                  {combate.equipo_ganador?.id === combate.equipo1.id && (
                    <Trophy className="h-6 w-6 text-yellow-500 animate-bounce" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="text-center">
                  <p className="text-7xl font-bold text-red-600 font-mono tabular-nums">{puntos1}</p>
                  <p className="text-sm text-muted-foreground mt-2">Puntos</p>
                </div>

                {combate.estado !== "finalizado" && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setPuntos1(Math.max(0, puntos1 - 1))}
                      variant="outline"
                      size="lg"
                      className="flex-1"
                    >
                      <Minus className="h-5 w-5" />
                    </Button>
                    <Button
                      onClick={() => setPuntos1(puntos1 + 1)}
                      size="lg"
                      className="flex-1 bg-red-600 hover:bg-red-700"
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card
              className={`border-4 transition-all ${puntos2 > puntos1 ? "border-green-500 shadow-lg shadow-green-500/50" : "border-blue-200"}`}
            >
              <CardHeader className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
                <CardTitle className="text-xl flex items-center justify-between">
                  <span>
                    {combate.equipo2.nombre}
                  </span>
                  {combate.equipo_ganador?.id === combate.equipo2.id && (
                    <Trophy className="h-6 w-6 text-yellow-500 animate-bounce" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="text-center">
                  <p className="text-7xl font-bold text-blue-600 font-mono tabular-nums">{puntos2}</p>
                  <p className="text-sm text-muted-foreground mt-2">Puntos</p>
                </div>

                {combate.estado !== "finalizado" && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setPuntos2(Math.max(0, puntos2 - 1))}
                      variant="outline"
                      size="lg"
                      className="flex-1"
                    >
                      <Minus className="h-5 w-5" />
                    </Button>
                    <Button
                      onClick={() => setPuntos2(puntos2 + 1)}
                      size="lg"
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2 flex-wrap">
            {combate.estado === "programado" && (
              <Button
                onClick={handleIniciarCombate}
                disabled={loading}
                size="lg"
                className="bg-green-600 hover:bg-green-700"
              >
                <Play className="mr-2 h-5 w-5" />
                Iniciar Combate
              </Button>
            )}

            {combate.estado === "en_curso" && (
              <>
                <Button onClick={handleActualizarPuntos} disabled={loading} variant="outline" size="lg">
                  Actualizar Puntos
                </Button>
                <Button
                  onClick={handleFinalizarCombate}
                  disabled={loading}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Finalizar Combate
                </Button>
              </>
            )}

            <Button variant="outline" onClick={() => router.back()} size="lg">
              Volver
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Información del Combate</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Categoría</p>
              <p className="font-medium">{combate.categoria}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Duración</p>
              <p className="font-medium">{combate.duracion_minutos} minutos</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fecha</p>
              <p className="font-medium">{new Date(combate.fecha_combate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Juez</p>
              <p className="font-medium">
                {combate.juez ? `${combate.juez.nombre} ${combate.juez.apellido}` : "Sin asignar"}
              </p>
            </div>
          </div>
          {combate.notas && (
            <div>
              <p className="text-sm text-muted-foreground">Notas</p>
              <p className="font-medium">{combate.notas}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
