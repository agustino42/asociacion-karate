"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Play, Pause, RotateCcw, Flame, Target, AlertTriangle, Clock, Swords } from "lucide-react"
import { SimuladorKarate } from "@/lib/karate-simulador"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

interface Atleta {
  id: string
  nombre: string
  apellido: string
  cinturon: string
}

interface EventoBatalla {
  tiempo: number
  atleta: 1 | 2
  tipo: 'tecnica' | 'falta'
  tecnica?: string
  falta?: { descripcion: string; tipo: string; penalizacion: number }
  puntos?: number
}

export function SimuladorEnTiempoReal() {
  const [atletas, setAtletas] = useState<Atleta[]>([])
  const [atleta1, setAtleta1] = useState<Atleta | null>(null)
  const [atleta2, setAtleta2] = useState<Atleta | null>(null)
  const [simulando, setSimulando] = useState(false)
  const [tiempoRestante, setTiempoRestante] = useState(60)
  const [puntos1, setPuntos1] = useState(0)
  const [puntos2, setPuntos2] = useState(0)
  const [faltas1, setFaltas1] = useState(0)
  const [faltas2, setFaltas2] = useState(0)
  const [eventos, setEventos] = useState<EventoBatalla[]>([])
  const [ganador, setGanador] = useState<Atleta | null>(null)
  const [simulador, setSimulador] = useState<SimuladorKarate | null>(null)
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null)

  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    cargarAtletas()
  }, [])

  const cargarAtletas = async () => {
    const { data } = await supabase
      .from("atletas")
      .select("id, nombre, apellido, cinturon")
      .eq("activo", true)
      .order("nombre")
      .limit(20)

    if (data) {
      setAtletas(data)
      // Seleccionar atletas aleatorios para la simulación
      if (data.length >= 2) {
        const shuffled = [...data].sort(() => Math.random() - 0.5)
        setAtleta1(shuffled[0])
        setAtleta2(shuffled[1])
      }
    }
  }

  const iniciarSimulacion = () => {
    if (!atleta1 || !atleta2) return

    setSimulando(true)
    setTiempoRestante(60)
    setPuntos1(0)
    setPuntos2(0)
    setFaltas1(0)
    setFaltas2(0)
    setEventos([])
    setGanador(null)

    const nuevoSimulador = new SimuladorKarate(1)
    setSimulador(nuevoSimulador)

    let tiempoActual = 0

    const id = setInterval(() => {
      tiempoActual += 1
      setTiempoRestante(60 - tiempoActual)

      // Simular evento cada 2-5 segundos
      if (Math.random() < 0.2) {
        const evento = nuevoSimulador.simularEvento(tiempoActual)
        if (evento) {
          setEventos(prev => [...prev, { ...evento, tiempo: tiempoActual }])
          const { puntos1: p1, puntos2: p2 } = nuevoSimulador.getPuntos()
          setPuntos1(p1)
          setPuntos2(p2)

          // Actualizar faltas
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
        clearInterval(id)
        setSimulando(false)
        setIntervalId(null)

        const { puntos1: finalP1, puntos2: finalP2 } = nuevoSimulador.getPuntos()
        const ganadorFinal = finalP1 > finalP2 ? atleta1 : finalP2 > finalP1 ? atleta2 : null
        setGanador(ganadorFinal)
        setPuntos1(finalP1)
        setPuntos2(finalP2)
      }
    }, 1000)

    setIntervalId(id)
  }

  const pausarSimulacion = () => {
    if (intervalId) {
      clearInterval(intervalId)
      setIntervalId(null)
      setSimulando(false)
    }
  }

  const reiniciarSimulacion = () => {
    if (intervalId) {
      clearInterval(intervalId)
      setIntervalId(null)
    }
    setSimulando(false)
    setTiempoRestante(60)
    setPuntos1(0)
    setPuntos2(0)
    setFaltas1(0)
    setFaltas2(0)
    setEventos([])
    setGanador(null)
    setSimulador(null)
  }

  const progresoBatalla = ((60 - tiempoRestante) / 60) * 100

  return (
    <div className="space-y-6">
      <Card className="border-2 border-orange-500 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Swords className="h-6 w-6 text-orange-600" />
            Batalla en Vivo
          </CardTitle>
          <CardDescription>
            Simulación automática entre atletas aleatorios
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Controles */}
          <div className="flex justify-center gap-4">
            {!simulando && !ganador && (
              <Button onClick={iniciarSimulacion} className="bg-green-600 hover:bg-green-700">
                <Play className="mr-2 h-4 w-4" />
                Iniciar Simulación
              </Button>
            )}
            {simulando && (
              <Button onClick={pausarSimulacion} variant="destructive">
                <Pause className="mr-2 h-4 w-4" />
                Pausar
              </Button>
            )}
            <Button onClick={reiniciarSimulacion} variant="outline">
              <RotateCcw className="mr-2 h-4 w-4" />
              Reiniciar
            </Button>
          </div>

          {/* Atletas */}
          {atleta1 && atleta2 && (
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
                  {atleta1.nombre} {atleta1.apellido}
                </p>
                <Badge variant="outline" className="border-red-300 text-red-700">
                  {atleta1.cinturon}
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
                  {atleta2.nombre} {atleta2.apellido}
                </p>
                <Badge variant="outline" className="border-blue-300 text-blue-700">
                  {atleta2.cinturon}
                </Badge>
              </div>
            </div>
          )}

          {/* Temporizador */}
          <div className="text-center space-y-4">
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

          {/* Ganador */}
          {ganador && (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-4">
                <Flame className="h-8 w-8 text-yellow-600 animate-bounce" />
                <h3 className="text-3xl font-bold text-yellow-700">¡BATALLA FINALIZADA!</h3>
                <Flame className="h-8 w-8 text-yellow-600 animate-bounce" />
              </div>
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 rounded-lg p-6 border-2 border-yellow-500">
                <h4 className="text-2xl font-bold text-green-700 mb-2">
                  🏆 GANADOR: {ganador.nombre} {ganador.apellido} 🏆
                </h4>
                <p className="text-lg text-muted-foreground">
                  {puntos1} - {puntos2}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabla de Eventos Recientes */}
      {eventos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              Eventos de la Batalla
            </CardTitle>
            <CardDescription>Últimos eventos ocurridos en la simulación</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Tiempo</TableHead>
                  <TableHead>Atleta</TableHead>
                  <TableHead>Evento</TableHead>
                  <TableHead className="text-center">Puntos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {eventos.slice(-10).map((evento, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-mono text-sm">
                      {Math.floor(evento.tiempo / 60)}:{(evento.tiempo % 60).toString().padStart(2, '0')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${evento.atleta === 1 ? 'bg-red-500' : 'bg-blue-500'}`} />
                        {evento.atleta === 1
                          ? `${atleta1?.nombre} ${atleta1?.apellido}`
                          : `${atleta2?.nombre} ${atleta2?.apellido}`
                        }
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {evento.tipo === 'tecnica' ? (
                          <Target className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        )}
                        <span className="text-sm">
                          {evento.tipo === 'tecnica' ? evento.tecnica : evento.falta?.descripcion}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={evento.tipo === 'falta' ? "destructive" : "default"}>
                        {evento.tipo === 'tecnica' ? '+' : ''}{evento.puntos || evento.falta?.penalizacion}
                      </Badge>
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
