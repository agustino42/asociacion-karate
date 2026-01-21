"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Play, Pause, RotateCcw, Trophy, Plus, Minus } from "lucide-react"

export function GestionarCombateEquipo({ combate }: { combate: any }) {
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Estados de puntuación por equipo
  const [equipo1Points, setEquipo1Points] = useState({ yuko: 0, wazaari: 0, ippon: 0 })
  const [equipo2Points, setEquipo2Points] = useState({ yuko: 0, wazaari: 0, ippon: 0 })

  // Estados del cronómetro
  const [time, setTime] = useState(combate.duracion_minutos * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [category, setCategory] = useState(`${combate.categoria} (${combate.duracion_minutos} min)`)

  // Estados de finalización
  const [showHantei, setShowHantei] = useState(false)
  const [showWinnerDialog, setShowWinnerDialog] = useState(false)
  const [winner, setWinner] = useState({ equipo: 0, reason: '' })
  const [equipo1Votes, setEquipo1Votes] = useState(0)
  const [equipo2Votes, setEquipo2Votes] = useState(0)
  const [equipo1Win, setEquipo1Win] = useState(false)
  const [equipo2Win, setEquipo2Win] = useState(false)

  // Efecto para el cronómetro
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isRunning && time > 0) {
      interval = setInterval(() => {
        setTime(prev => {
          if (prev <= 1) {
            setIsRunning(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, time])

  // Funciones auxiliares
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getCategoryTime = (cat: string) => {
    if (cat.includes('3 min')) return 180
    if (cat.includes('2 min')) return 120
    if (cat.includes('1.5 min')) return 90
    return combate.duracion_minutos * 60
  }

  const getTotalPoints = (equipo: number) => {
    const points = equipo === 1 ? equipo1Points : equipo2Points
    return points.yuko * 1 + points.wazaari * 2 + points.ippon * 3
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2)
  }

  // Funciones de puntuación
  const addPoint = (equipo: number, type: 'yuko' | 'wazaari' | 'ippon') => {
    if (equipo === 1) {
      setEquipo1Points(prev => ({ ...prev, [type]: prev[type] + 1 }))
    } else {
      setEquipo2Points(prev => ({ ...prev, [type]: prev[type] + 1 }))
    }
  }

  const subtractPoint = (equipo: number) => {
    if (equipo === 1) {
      const total = getTotalPoints(1)
      if (total > 0) {
        if (equipo1Points.ippon > 0) {
          setEquipo1Points(prev => ({ ...prev, ippon: prev.ippon - 1 }))
        } else if (equipo1Points.wazaari > 0) {
          setEquipo1Points(prev => ({ ...prev, wazaari: prev.wazaari - 1 }))
        } else if (equipo1Points.yuko > 0) {
          setEquipo1Points(prev => ({ ...prev, yuko: prev.yuko - 1 }))
        }
      }
    } else {
      const total = getTotalPoints(2)
      if (total > 0) {
        if (equipo2Points.ippon > 0) {
          setEquipo2Points(prev => ({ ...prev, ippon: prev.ippon - 1 }))
        } else if (equipo2Points.wazaari > 0) {
          setEquipo2Points(prev => ({ ...prev, wazaari: prev.wazaari - 1 }))
        } else if (equipo2Points.yuko > 0) {
          setEquipo2Points(prev => ({ ...prev, yuko: prev.yuko - 1 }))
        }
      }
    }
  }

  // Funciones de votación y finalización
  const confirmVotes = () => {
    if (equipo1Win) {
      declareWinner(1, 'Victoria por Decisión')
    } else if (equipo2Win) {
      declareWinner(2, 'Victoria por Decisión')
    } else if (equipo1Votes > equipo2Votes) {
      declareWinner(1, 'Hantei (Decisión de Jueces)')
    } else if (equipo2Votes > equipo1Votes) {
      declareWinner(2, 'Hantei (Decisión de Jueces)')
    }
    setShowHantei(false)
  }

  const declareWinner = (equipo: number, reason: string) => {
    setWinner({ equipo, reason })
    setShowWinnerDialog(true)
    setIsRunning(false)
  }

  const finalizarCompetencia = () => {
    const total1 = getTotalPoints(1)
    const total2 = getTotalPoints(2)

    if (total1 > total2) {
      declareWinner(1, 'Victoria por Puntos')
    } else if (total2 > total1) {
      declareWinner(2, 'Victoria por Puntos')
    } else {
      setShowHantei(true)
    }
  }

  const handleFinalizarCombate = async () => {
    setLoading(true)
    setError(null)

    try {
      const total1 = getTotalPoints(1)
      const total2 = getTotalPoints(2)
      const ganadorId = winner.equipo === 1 ? combate.equipo1.id : winner.equipo === 2 ? combate.equipo2.id : null

      const { error: combateError } = await supabase
        .from("combates_equipos")
        .update({
          puntos_equipo1: total1,
          puntos_equipo2: total2,
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

      setShowWinnerDialog(false)
      router.push("/admin/combates")
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const reiniciarCombate = () => {
    setEquipo1Points({ yuko: 0, wazaari: 0, ippon: 0 })
    setEquipo2Points({ yuko: 0, wazaari: 0, ippon: 0 })
    setTime(getCategoryTime(category))
    setIsRunning(false)
    setEquipo1Votes(0)
    setEquipo2Votes(0)
    setEquipo1Win(false)
    setEquipo2Win(false)
    setWinner({ equipo: 0, reason: '' })
    setShowWinnerDialog(false)
  }

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.85)), url("/karate-bg.jpg")' }}>

      {/* Header */}
      <div className="bg-linear-to-r from-gray-900 to-black text-white py-4 px-8 border-b-4 border-blue-600">
        <div className="container mx-auto">
          <h1 className="text-3xl font-black tracking-widest text-center">PANEL DE CONTROL | COMBATE DE EQUIPOS</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-7xl">

        {/* Marcador Central y Cronómetro */}
        <div className="mb-6">
          <Card className="bg-black/80 border-4 border-gray-700">
            <CardContent className="p-6">
              <div className="grid grid-cols-3 gap-8 items-center">

                {/* Puntaje Total Equipo 1 */}
                <div className="text-center">
                  <div className="text-8xl font-black text-blue-500">{getTotalPoints(1)}</div>
                </div>

                {/* Cronómetro */}
                <div className="text-center space-y-4">
                  <div className="text-sm text-gray-400 font-bold">TIEMPO RESTANTE</div>
                  <div className={`text-6xl font-black ${time <= 10 && time > 0 ? 'text-red-500 animate-pulse' : 'text-white'}`}>{formatTime(time)}</div>

                  <div className="flex gap-2 justify-center">
                    <Select value={category} onValueChange={(value) => {
                      setCategory(value)
                      setTime(getCategoryTime(value))
                      setIsRunning(false)
                    }}>
                      <SelectTrigger className="w-48 bg-gray-800 text-white border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SENIOR (3 min)">SENIOR (3 min)</SelectItem>
                        <SelectItem value="JUNIOR (2 min)">JUNIOR (2 min)</SelectItem>
                        <SelectItem value="CADETE (1.5 min)">CADETE (1.5 min)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2 justify-center">
                    <Button
                      onClick={() => setIsRunning(!isRunning)}
                      className={`${isRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} font-bold`}
                      size="lg"
                    >
                      {isRunning ? <><Pause className="mr-2 h-4 w-4" /> STOP</> : <><Play className="mr-2 h-4 w-4" /> START</>}
                    </Button>
                    <Button onClick={() => {
                      setTime(getCategoryTime(category))
                      setIsRunning(false)
                    }} variant="outline" size="lg" className="font-bold">
                      <RotateCcw className="mr-2 h-4 w-4" /> RESET
                    </Button>
                  </div>
                </div>

                {/* Puntaje Total Equipo 2 */}
                <div className="text-center">
                  <div className="text-8xl font-black text-red-500">{getTotalPoints(2)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controles de Equipos */}
        <div className="grid grid-cols-2 gap-6 mb-6">

          {/* Equipo 1 (Azul) */}
          <Card className="bg-black/80 border-4 border-blue-600">
            <CardHeader className="bg-blue-600 pb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-blue-800 flex items-center justify-center text-white font-black text-2xl">
                  {getInitials(combate.equipo1.nombre)}
                </div>
                <div className="text-white">
                  <div className="font-black text-xl">{combate.equipo1.nombre}</div>
                  <div className="text-sm">Equipo 1</div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-4">
              {/* Botones de Puntuación */}
              <div className="grid grid-cols-4 gap-2">
                <Button onClick={() => addPoint(1, 'ippon')} className="bg-yellow-600 hover:bg-yellow-700 font-bold text-lg py-6">
                  IPPON<br /><span className="text-sm">(3 pts)</span>
                </Button>
                <Button onClick={() => addPoint(1, 'wazaari')} className="bg-orange-600 hover:bg-orange-700 font-bold text-lg py-6">
                  WAZA-ARI<br /><span className="text-sm">(2 pts)</span>
                </Button>
                <Button onClick={() => addPoint(1, 'yuko')} className="bg-green-600 hover:bg-green-700 font-bold text-lg py-6">
                  YUKO<br /><span className="text-sm">(1 pt)</span>
                </Button>
                <Button onClick={() => subtractPoint(1)} variant="destructive" className="font-bold text-lg py-6">
                  RESTAR<br /><span className="text-sm">(-1)</span>
                </Button>
              </div>

              {/* Desglose de Puntos */}
              <div className="bg-gray-800 p-3 rounded space-y-2">
                <div className="text-white text-sm font-bold">DESGLOSE:</div>
                <div className="grid grid-cols-3 gap-2 text-center text-white">
                  <div><span className="text-yellow-400">{equipo1Points.ippon}</span> Ippon</div>
                  <div><span className="text-orange-400">{equipo1Points.wazaari}</span> Waza-ari</div>
                  <div><span className="text-green-400">{equipo1Points.yuko}</span> Yuko</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Equipo 2 (Rojo) */}
          <Card className="bg-black/80 border-4 border-red-600">
            <CardHeader className="bg-red-600 pb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-red-800 flex items-center justify-center text-white font-black text-2xl">
                  {getInitials(combate.equipo2.nombre)}
                </div>
                <div className="text-white">
                  <div className="font-black text-xl">{combate.equipo2.nombre}</div>
                  <div className="text-sm">Equipo 2</div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-4">
              {/* Botones de Puntuación */}
              <div className="grid grid-cols-4 gap-2">
                <Button onClick={() => addPoint(2, 'ippon')} className="bg-yellow-600 hover:bg-yellow-700 font-bold text-lg py-6">
                  IPPON<br /><span className="text-sm">(3 pts)</span>
                </Button>
                <Button onClick={() => addPoint(2, 'wazaari')} className="bg-orange-600 hover:bg-orange-700 font-bold text-lg py-6">
                  WAZA-ARI<br /><span className="text-sm">(2 pts)</span>
                </Button>
                <Button onClick={() => addPoint(2, 'yuko')} className="bg-green-600 hover:bg-green-700 font-bold text-lg py-6">
                  YUKO<br /><span className="text-sm">(1 pt)</span>
                </Button>
                <Button onClick={() => subtractPoint(2)} variant="destructive" className="font-bold text-lg py-6">
                  RESTAR<br /><span className="text-sm">(-1)</span>
                </Button>
              </div>

              {/* Desglose de Puntos */}
              <div className="bg-gray-800 p-3 rounded space-y-2">
                <div className="text-white text-sm font-bold">DESGLOSE:</div>
                <div className="grid grid-cols-3 gap-2 text-center text-white">
                  <div><span className="text-yellow-400">{equipo2Points.ippon}</span> Ippon</div>
                  <div><span className="text-orange-400">{equipo2Points.wazaari}</span> Waza-ari</div>
                  <div><span className="text-green-400">{equipo2Points.yuko}</span> Yuko</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Botones de Control */}
        <div className="flex gap-4 justify-center mb-6">
          <Button onClick={finalizarCompetencia} size="lg" className="bg-green-600 hover:bg-green-700 font-bold px-8">
            FINALIZAR COMBATE
          </Button>
          <Button onClick={reiniciarCombate} variant="outline" size="lg" className="font-bold px-8">
            <RotateCcw className="mr-2 h-5 w-5" /> REINICIAR
          </Button>
          <Button variant="outline" onClick={() => router.back()} size="lg" className="font-bold px-8">
            VOLVER
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Panel Hantei */}
        <Dialog open={showHantei} onOpenChange={setShowHantei}>
          <DialogContent className="bg-black/90 text-white border-4 border-yellow-600">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-center text-yellow-400">PANEL HANTEI</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-lg">Los puntos están empatados. Decisión de los jueces:</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="text-center space-y-4">
                  <h3 className="text-xl font-bold text-blue-400">{combate.equipo1.nombre}</h3>
                  <div className="space-y-2">
                    <Button
                      onClick={() => setEquipo1Win(!equipo1Win)}
                      className={`w-full ${equipo1Win ? 'bg-green-600' : 'bg-gray-600'}`}
                    >
                      {equipo1Win ? 'GANADOR' : 'MARCAR GANADOR'}
                    </Button>
                    <div className="flex gap-2">
                      <Button onClick={() => setEquipo1Votes(Math.max(0, equipo1Votes - 1))} variant="outline" size="sm">
                        <Minus className="h-4 w-4" />
                      </Button>
                      <div className="flex-1 text-center py-2 bg-gray-800 rounded">
                        {equipo1Votes} votos
                      </div>
                      <Button onClick={() => setEquipo1Votes(equipo1Votes + 1)} variant="outline" size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="text-center space-y-4">
                  <h3 className="text-xl font-bold text-red-400">{combate.equipo2.nombre}</h3>
                  <div className="space-y-2">
                    <Button
                      onClick={() => setEquipo2Win(!equipo2Win)}
                      className={`w-full ${equipo2Win ? 'bg-green-600' : 'bg-gray-600'}`}
                    >
                      {equipo2Win ? 'GANADOR' : 'MARCAR GANADOR'}
                    </Button>
                    <div className="flex gap-2">
                      <Button onClick={() => setEquipo2Votes(Math.max(0, equipo2Votes - 1))} variant="outline" size="sm">
                        <Minus className="h-4 w-4" />
                      </Button>
                      <div className="flex-1 text-center py-2 bg-gray-800 rounded">
                        {equipo2Votes} votos
                      </div>
                      <Button onClick={() => setEquipo2Votes(equipo2Votes + 1)} variant="outline" size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={confirmVotes} className="bg-green-600 hover:bg-green-700 font-bold">
                CONFIRMAR DECISIÓN
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Diálogo de Ganador */}
        <Dialog open={showWinnerDialog} onOpenChange={setShowWinnerDialog}>
          <DialogContent className="bg-black/90 text-white border-4 border-yellow-600">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black text-center text-yellow-400">¡GANADOR!</DialogTitle>
            </DialogHeader>
            <div className="text-center space-y-4">
              <div className="text-6xl font-black">
                {winner.equipo === 1 ? (
                  <span className="text-blue-500">{combate.equipo1.nombre}</span>
                ) : (
                  <span className="text-red-500">{combate.equipo2.nombre}</span>
                )}
              </div>
              <div className="text-xl text-gray-300">{winner.reason}</div>
              <div className="text-lg">
                Puntuación Final: {getTotalPoints(1)} - {getTotalPoints(2)}
              </div>
            </div>
            <DialogFooter className="flex gap-2">
              <Button onClick={handleFinalizarCombate} disabled={loading} className="bg-green-600 hover:bg-green-700 font-bold">
                GUARDAR Y FINALIZAR
              </Button>
              <Button onClick={() => setShowWinnerDialog(false)} variant="outline">
                CONTINUAR COMBATE
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
