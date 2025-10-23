"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Zap, Play, Trophy, Users, Clock, Flame, Target, AlertTriangle, Swords } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { SimuladorKarate } from "@/lib/karate-simulador"
import { useRouter } from "next/navigation"

interface EventoBatalla {
  tiempo: number
  atleta: 1 | 2
  tipo: 'tecnica' | 'falta'
  tecnica?: string
  falta?: { descripcion: string; tipo: string; penalizacion: number }
  puntos?: number
}

interface BatallaSimulada {
  id: string
  atleta1: any
  atleta2: any
  puntos1: number
  puntos2: number
  ganador: any
  eventos: EventoBatalla[]
  fecha: Date
}

export function SimuladorCombateRapido() {
  const [atleta1Id, setAtleta1Id] = useState<string>("")
  const [atleta2Id, setAtleta2Id] = useState<string>("")
  const [atletas, setAtletas] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [simulando, setSimulando] = useState(false)
  const [tiempoRestante, setTiempoRestante] = useState(60) // 1 minuto
  const [puntos1, setPuntos1] = useState(0)
  const [puntos2, setPuntos2] = useState(0)
  const [faltas1, setFaltas1] = useState(0)
  const [faltas2, setFaltas2] = useState(0)
  const [eventos, setEventos] = useState<EventoBatalla[]>([])
  const [batallasSimuladas, setBatallasSimuladas] = useState<BatallaSimulada[]>([])
  const [ganador, setGanador] = useState<any>(null)
  const router = useRouter()

  const supabase = getSupabaseBrowserClient()

  const cargarAtletas = async () => {
    const { data } = await supabase
      .from("atletas")
      .select("id, nombre, apellido, cinturon")
      .eq("activo", true)
      .order("nombre")

    if (data) {
      setAtletas(data)
    }
  }

  const iniciarBatalla = async () => {
    if (!atleta1Id || !atleta2Id || atleta1Id === atleta2Id) return

    setLoading(true)
    setSimulando(true)
    setTiempoRestante(60)
    setPuntos1(0)
    setPuntos2(0)
    setFaltas1(0)
    setFaltas2(0)
    setEventos([])
    setGanador(null)

    const atleta1 = atletas.find(a => a.id === atleta1Id)
    const atleta2 = atletas.find(a => a.id === atleta2Id)

    if (!atleta1 || !atleta2) return

    const simulador = new SimuladorKarate(1) // 1 minuto
    let tiempoActual = 0

    const interval = setInterval(() => {
      tiempoActual += 1
      setTiempoRestante(60 - tiempoActual)

      // Simular evento cada 3-8 segundos
      if (Math.random() < 0.15) {
        const evento = simulador.simularEvento(tiempoActual)
        if (evento) {
          setEventos(prev => [...prev, { ...evento, tiempo: tiempoActual }])
          const { puntos1: p1, puntos2: p2 } = simulador.getPuntos()
          setPuntos1(p1)
          setPuntos2(p2)

          // Actualizar faltas en tiempo real
          if (evento.tipo === 'falta') {
            if (evento.atleta === 1) {
              setFaltas1(prev => prev + 1)
            } else {
              setFaltas2(prev => prev + 1)
            }
          }
        }
      }

      if (tiempoActual >= 60) {
        clearInterval(interval)
        setSimulando(false)
        setLoading(false)

        const { puntos1: finalP1, puntos2: finalP2 } = simulador.getPuntos()
        const ganadorFinal = finalP1 > finalP2 ? atleta1 : finalP2 > finalP1 ? atleta2 : null

        setGanador(ganadorFinal)
        setPuntos1(finalP1)
        setPuntos2(finalP2)

        // Agregar a historial
        const nuevaBatalla: BatallaSimulada = {
          id: Date.now().toString(),
          atleta1,
          atleta2,
          puntos1: finalP1,
          puntos2: finalP2,
          ganador: ganadorFinal,
          eventos: [...eventos],
          fecha: new Date()
        }

        setBatallasSimuladas(prev => [nuevaBatalla, ...prev.slice(0, 9)]) // Mantener últimas 10
      }
    }, 1000)

    setLoading(false)
  }

  const guardarBatallaReal = async (batalla: BatallaSimulada) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("combates_individuales")
        .insert({
          atleta1_id: batalla.atleta1.id,
          atleta2_id: batalla.atleta2.id,
          puntos_atleta1: batalla.puntos1,
          puntos_atleta2: batalla.puntos2,
          ganador_id: batalla.ganador?.id || null,
          estado: "finalizado",
          categoria: "Simulación Rápida",
          duracion_minutos: 1,
          fecha_combate: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error

      // Actualizar rankings
      if (batalla.ganador) {
        const perdedor = batalla.ganador.id === batalla.atleta1.id ? batalla.atleta2 : batalla.atleta1

        await Promise.all([
          supabase.rpc("actualizar_ranking_atleta", {
            p_atleta_id: batalla.ganador.id,
            p_resultado: "victoria",
            p_puntos: 3,
          }),
          supabase.rpc("actualizar_ranking_atleta", {
            p_atleta_id: perdedor.id,
            p_resultado: "derrota",
            p_puntos: 0,
          }),
        ])

        await supabase.rpc("recalcular_posiciones_atletas")
      }

      router.refresh()
      setBatallasSimuladas(prev => prev.filter(b => b.id !== batalla.id))

    } catch (error) {
      console.error("Error guardando batalla:", error)
    } finally {
      setLoading(false)
    }
  }

  const progresoBatalla = ((60 - tiempoRestante) / 60) * 100

  return (
    <div className="space-y-6">
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-950/50 dark:to-blue-950/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Swords className="h-5 w-5 text-purple-600" />
            Simulador de Batalla de Karate
          </CardTitle>
          <CardDescription>Simula una batalla épica de 1 minuto entre dos atletas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <Target className="h-4 w-4 text-red-600" />
                Atleta 1
              </label>
              <Select value={atleta1Id} onValueChange={setAtleta1Id} onOpenChange={cargarAtletas}>
                <SelectTrigger className="border-red-200 focus:border-red-400">
                  <SelectValue placeholder="Seleccionar atleta" />
                </SelectTrigger>
                <SelectContent>
                  {atletas.map((atleta) => (
                    <SelectItem key={atleta.id} value={atleta.id}>
                      {atleta.nombre} {atleta.apellido} ({atleta.cinturon})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-600" />
                Atleta 2
              </label>
              <Select value={atleta2Id} onValueChange={setAtleta2Id} onOpenChange={cargarAtletas}>
                <SelectTrigger className="border-blue-200 focus:border-blue-400">
                  <SelectValue placeholder="Seleccionar atleta" />
                </SelectTrigger>
                <SelectContent>
                  {atletas.map((atleta) => (
                    <SelectItem key={atleta.id} value={atleta.id}>
                      {atleta.nombre} {atleta.apellido} ({atleta.cinturon})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={iniciarBatalla}
            disabled={!atleta1Id || !atleta2Id || atleta1Id === atleta2Id || loading || simulando}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3"
            size="lg"
          >
            <Play className="mr-2 h-5 w-5" />
            {simulando ? "BATALLA EN CURSO..." : "INICIAR BATALLA ÉPICA"}
          </Button>
        </CardContent>
      </Card>

      {simulando && (
        <Card className="border-2 border-orange-500 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 animate-pulse">
          <CardContent className="pt-6">
            <div className="text-center space-y-6">
              <div className="flex items-center justify-center gap-4">
                <Flame className="h-8 w-8 text-orange-600 animate-bounce" />
                <h3 className="text-2xl font-bold text-orange-700">¡BATALLA EN VIVO!</h3>
                <Flame className="h-8 w-8 text-orange-600 animate-bounce" />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <Clock className="h-6 w-6 text-orange-600" />
                  <span className="text-4xl font-bold font-mono tabular-nums text-orange-700">
                    {Math.floor(tiempoRestante / 60)}:{(tiempoRestante % 60).toString().padStart(2, '0')}
                  </span>
                </div>
                <Progress value={progresoBatalla} className="h-4 bg-orange-200" />
                <p className="text-sm text-muted-foreground">
                  {tiempoRestante === 0 ? "¡TIEMPO FINALIZADO!" : "Tiempo restante"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="text-center space-y-4">
                  <div className="space-y-2">
                    <div className="w-24 h-24 mx-auto bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center border-4 border-red-500 shadow-lg">
                      <span className="text-4xl font-bold text-red-600">{puntos1}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <span className="text-lg font-bold text-yellow-600">{faltas1}</span>
                    </div>
                  </div>
                  <p className="font-semibold text-red-700 text-lg">
                    {atletas.find(a => a.id === atleta1Id)?.nombre} {atletas.find(a => a.id === atleta1Id)?.apellido}
                  </p>
                  <Badge variant="outline" className="border-red-300 text-red-700">
                    {atletas.find(a => a.id === atleta1Id)?.cinturon}
                  </Badge>
                </div>

                <div className="text-center space-y-4">
                  <div className="space-y-2">
                    <div className="w-24 h-24 mx-auto bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center border-4 border-blue-500 shadow-lg">
                      <span className="text-4xl font-bold text-blue-600">{puntos2}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <span className="text-lg font-bold text-yellow-600">{faltas2}</span>
                    </div>
                  </div>
                  <p className="font-semibold text-blue-700 text-lg">
                    {atletas.find(a => a.id === atleta2Id)?.nombre} {atletas.find(a => a.id === atleta2Id)?.apellido}
                  </p>
                  <Badge variant="outline" className="border-blue-300 text-blue-700">
                    {atletas.find(a => a.id === atleta2Id)?.cinturon}
                  </Badge>
                </div>
              </div>

              <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg p-4 border">
                <h4 className="text-center font-bold text-lg mb-3 text-gray-700 dark:text-gray-300">Estadísticas en Tiempo Real</h4>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{puntos1}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Puntos Totales</div>
                    <div className="text-lg font-semibold text-yellow-600">{faltas1}</div>
                    <div className="text-xs text-gray-500">Faltas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{puntos2}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Puntos Totales</div>
                    <div className="text-lg font-semibold text-yellow-600">{faltas2}</div>
                    <div className="text-xs text-gray-500">Faltas</div>
                  </div>
                </div>
              </div>

              {eventos.length > 0 && (
                <div className="max-h-40 overflow-y-auto space-y-2 bg-white/50 dark:bg-black/20 rounded-lg p-4">
                  <p className="text-sm font-medium text-center mb-3">Últimos Eventos:</p>
                  {eventos.slice(-5).map((evento, idx) => (
                    <div
                      key={idx}
                      className={`p-2 rounded text-sm flex items-center justify-between ${
                        evento.atleta === 1
                          ? "bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500"
                          : "bg-blue-100 dark:bg-blue-900/30 border-l-4 border-blue-500"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {evento.tipo === 'tecnica' ? (
                          <Target className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        )}
                        <span className="font-medium">
                          {evento.atleta === 1
                            ? atletas.find(a => a.id === atleta1Id)?.nombre
                            : atletas.find(a => a.id === atleta2Id)?.nombre
                          }
                        </span>
                        <span className="text-muted-foreground">
                          {evento.tipo === 'tecnica' ? evento.tecnica : evento.falta?.descripcion}
                        </span>
                      </div>
                      <Badge variant={evento.tipo === 'falta' ? "destructive" : "default"}>
                        {evento.tipo === 'tecnica' ? '+' : ''}{evento.puntos}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {ganador && !simulando && (
        <Card className="border-4 border-yellow-500 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950">
          <CardContent className="pt-6">
            <div className="text-center space-y-6">
              <div className="flex items-center justify-center gap-4">
                <Trophy className="h-12 w-12 text-yellow-600 animate-bounce" />
                <h3 className="text-3xl font-bold text-yellow-700">¡BATALLA FINALIZADA!</h3>
                <Trophy className="h-12 w-12 text-yellow-600 animate-bounce" />
              </div>

              <div className="space-y-4">
                <h4 className="text-xl font-bold text-green-700">🏆 GANADOR: {ganador.nombre} {ganador.apellido} 🏆</h4>
                <div className="flex justify-center gap-8">
                  <div className="text-center">
                    <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center border-4 ${
                      ganador.id === atleta1Id ? 'border-green-500 bg-green-100' : 'border-gray-300 bg-gray-100'
                    }`}>
                      <span className="text-4xl font-bold">{puntos1}</span>
                    </div>
                    <p className="mt-2 font-semibold">{atletas.find(a => a.id === atleta1Id)?.nombre}</p>
                  </div>
                  <div className="text-center">
                    <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center border-4 ${
                      ganador.id === atleta2Id ? 'border-green-500 bg-green-100' : 'border-gray-300 bg-gray-100'
                    }`}>
                      <span className="text-4xl font-bold">{puntos2}</span>
                    </div>
                    <p className="mt-2 font-semibold">{atletas.find(a => a.id === atleta2Id)?.nombre}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/70 dark:bg-black/30 rounded-lg p-4 max-h-60 overflow-y-auto">
                <h5 className="font-bold mb-3">Resumen de la Batalla:</h5>
                <div className="space-y-2">
                  {eventos.map((evento, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <span>
                        <strong>{Math.floor(evento.tiempo / 60)}:{(evento.tiempo % 60).toString().padStart(2, '0')}</strong> -
                        {evento.atleta === 1
                          ? atletas.find(a => a.id === atleta1Id)?.nombre
                          : atletas.find(a => a.id === atleta2Id)?.nombre
                        }: {evento.tipo === 'tecnica' ? evento.tecnica : evento.falta?.descripcion}
                      </span>
                      <Badge variant={evento.tipo === 'falta' ? "destructive" : "default"} className="text-xs">
                        {evento.tipo === 'tecnica' ? '+' : ''}{evento.puntos}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {batallasSimuladas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-600" />
              Registro de Batallas Simuladas
            </CardTitle>
            <CardDescription>Historial de las últimas batallas simuladas</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Atleta 1</TableHead>
                  <TableHead>VS</TableHead>
                  <TableHead>Atleta 2</TableHead>
                  <TableHead>Resultado</TableHead>
                  <TableHead>Ganador</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batallasSimuladas.map((batalla) => (
                  <TableRow key={batalla.id}>
                    <TableCell className="text-sm">
                      {batalla.fecha.toLocaleDateString()} {batalla.fecha.toLocaleTimeString()}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{batalla.atleta1.nombre} {batalla.atleta1.apellido}</p>
                        <p className="text-xs text-muted-foreground">{batalla.atleta1.cinturon}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-bold">
                      {batalla.puntos1} - {batalla.puntos2}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{batalla.atleta2.nombre} {batalla.atleta2.apellido}</p>
                        <p className="text-xs text-muted-foreground">{batalla.atleta2.cinturon}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={batalla.ganador ? "default" : "secondary"}>
                        {batalla.ganador ? "Victoria" : "Empate"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {batalla.ganador ? (
                        <div>
                          <p className="font-medium text-sm">{batalla.ganador.nombre} {batalla.ganador.apellido}</p>
                          <Trophy className="h-4 w-4 text-yellow-500 inline ml-1" />
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Empate</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        onClick={() => guardarBatallaReal(batalla)}
                        disabled={loading}
                        size="sm"
                        variant="outline"
                      >
                        <Users className="h-4 w-4 mr-1" />
                        Guardar Real
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
