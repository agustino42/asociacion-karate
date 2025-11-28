"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge" 
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Clock, Play, Pause, RotateCcw, Trophy, Plus, Minus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

/**
 * PANEL DE CONTROL - JUEZ O ÁRBITRO DE KARATE KUMITE
 * Sistema completo de gestión de combates con puntuación WKF,
 * cronómetro, penalizaciones y sistema de votación Hantei
 */

// Interfaz para datos de atleta (nombre, equipo, ubicación)
interface Athlete {
  name: string
  team?: string
  location?: string
  cinturon?: string
}

// Interfaz para penalizaciones (C, K, HC, H + descalificaciones)
interface Penalties {
  c: boolean        // Chukoku (Advertencia)
  k: boolean        // Keikoku (Advertencia de penalización)
  hc: boolean       // Hansoku-Chui (Penalización)
  h: boolean        // Hansoku (Descalificación por acumulación)
  kiken: boolean    // Descalificación por abandono/lesión
  shikkaku: boolean // Descalificación por conducta grave
}

// Props del componente
interface JuecesControlPanelProps {
  athlete1Name?: string
  athlete2Name?: string
  combateData?: any // Datos del combate de Supabase (opcional)
  onFinalizarCombate?: (ganador: any, razon: string) => void
}

function JuecesControlPanel({ 
  athlete1Name, 
  athlete2Name, 
  combateData, 
  onFinalizarCombate 
}: JuecesControlPanelProps = {}) {
  // ========== ESTADOS DE ATLETAS ==========
  // Información de los atletas (nombre, equipo, ubicación)
  const [athlete1, setAthlete1] = useState<Athlete>(() => {
    if (combateData?.atleta1) {
      return {
        name: `${combateData.atleta1.nombre} ${combateData.atleta1.apellido}`,
        cinturon: combateData.atleta1.cinturon
      }
    }
    return {
      name: athlete1Name || 'ATLETA 1',
      team: 'EQUIPO AZUL',
      location: 'VENEZUELA'
    }
  })
  
  const [athlete2, setAthlete2] = useState<Athlete>(() => {
    if (combateData?.atleta2) {
      return {
        name: `${combateData.atleta2.nombre} ${combateData.atleta2.apellido}`,
        cinturon: combateData.atleta2.cinturon
      }
    }
    return {
      name: athlete2Name || 'ATLETA 2',
      team: 'EQUIPO ROJO',
      location: 'VENEZUELA'
    }
  })
  
  // ========== ESTADOS DE PUNTUACIÓN ==========
  // Puntos por tipo: Yuko (1 punto), Waza-ari (2 puntos), Ippon (3 puntos)
  const [athlete1Points, setAthlete1Points] = useState({ yuko: 0, wazaari: 0, ippon: 0 })
  const [athlete2Points, setAthlete2Points] = useState({ yuko: 0, wazaari: 0, ippon: 0 })
  
  // ========== ESTADOS DE PENALIZACIONES ==========
  // Penalizaciones Categoría 1 y 2 para cada atleta
  const [athlete1C1, setAthlete1C1] = useState<Penalties>({ c: false, k: false, hc: false, h: false, kiken: false, shikkaku: false })
  const [athlete1C2, setAthlete1C2] = useState<Penalties>({ c: false, k: false, hc: false, h: false, kiken: false, shikkaku: false })
  const [athlete2C1, setAthlete2C1] = useState<Penalties>({ c: false, k: false, hc: false, h: false, kiken: false, shikkaku: false })
  const [athlete2C2, setAthlete2C2] = useState<Penalties>({ c: false, k: false, hc: false, h: false, kiken: false, shikkaku: false })
  
  // ========== ESTADOS DE CRONÓMETRO ==========
  // Tiempo en cuenta regresiva (segundos), estado de ejecución y categoría seleccionada
  const [time, setTime] = useState(() => {
    if (combateData?.duracion_minutos) {
      return combateData.duracion_minutos * 60
    }
    return 180 // 3 minutos por defecto
  })
  const [isRunning, setIsRunning] = useState(false)
  const [category, setCategory] = useState(() => {
    if (combateData?.categoria && combateData?.duracion_minutos) {
      return `${combateData.categoria} (${combateData.duracion_minutos} min)`
    }
    return 'SENIOR (3 min)'
  })
  
  // ========== ESTADOS DE VOTACIÓN HANTEI ==========
  // Sistema de votación para desempate
  const [showHantei, setShowHantei] = useState(false)
  const [athlete1Votes, setAthlete1Votes] = useState(0)
  const [athlete2Votes, setAthlete2Votes] = useState(0)
  const [athlete1Win, setAthlete1Win] = useState(false)
  const [athlete2Win, setAthlete2Win] = useState(false)
  
  // ========== ESTADOS DE GANADOR ==========
  // Diálogo y datos del ganador
  const [showWinnerDialog, setShowWinnerDialog] = useState(false)
  const [winner, setWinner] = useState<{ athlete: number, reason: string }>({ athlete: 0, reason: '' })

  // ========== EFECTO: CRONÓMETRO CUENTA REGRESIVA ==========
  // Decrementa el tiempo cada segundo cuando está activo
  // Se detiene automáticamente al llegar a 0
  useEffect(() => {
    let interval: NodeJS.Timeout
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
    return () => clearInterval(interval)
  }, [isRunning, time])

  // ========== FUNCIONES AUXILIARES ==========
  
  /** Formatea segundos a formato MM:SS */
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  /** Obtiene el tiempo en segundos según la categoría */
  const getCategoryTime = (cat: string) => {
    switch (cat) {
      case 'SENIOR (3 min)': return 180
      case 'JUNIOR (2 min)': return 120
      case 'CADETE (1.5 min)': return 90
      default: return 180
    }
  }

  /** Calcula el total de puntos: Yuko=1, Waza-ari=2, Ippon=3 */
  const getTotalPoints = (athlete: number) => {
    const points = athlete === 1 ? athlete1Points : athlete2Points
    return points.yuko * 1 + points.wazaari * 2 + points.ippon * 3
  }

  /** Obtiene las iniciales del nombre para el avatar */
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2)
  }

  // ========== FUNCIONES DE PUNTUACIÓN ==========
  
  /** Agrega un punto del tipo especificado al atleta */
  const addPoint = (athlete: number, type: 'yuko' | 'wazaari' | 'ippon') => {
    if (athlete === 1) {
      setAthlete1Points(prev => ({ ...prev, [type]: prev[type] + 1 }))
    } else {
      setAthlete2Points(prev => ({ ...prev, [type]: prev[type] + 1 }))
    }
  }

  /** Resta el punto más alto del atleta (para correcciones) */
  const subtractPoint = (athlete: number) => {
    if (athlete === 1) {
      const total = getTotalPoints(1)
      if (total > 0) {
        if (athlete1Points.ippon > 0) {
          setAthlete1Points(prev => ({ ...prev, ippon: prev.ippon - 1 }))
        } else if (athlete1Points.wazaari > 0) {
          setAthlete1Points(prev => ({ ...prev, wazaari: prev.wazaari - 1 }))
        } else if (athlete1Points.yuko > 0) {
          setAthlete1Points(prev => ({ ...prev, yuko: prev.yuko - 1 }))
        }
      }
    } else {
      const total = getTotalPoints(2)
      if (total > 0) {
        if (athlete2Points.ippon > 0) {
          setAthlete2Points(prev => ({ ...prev, ippon: prev.ippon - 1 }))
        } else if (athlete2Points.wazaari > 0) {
          setAthlete2Points(prev => ({ ...prev, wazaari: prev.wazaari - 1 }))
        } else if (athlete2Points.yuko > 0) {
          setAthlete2Points(prev => ({ ...prev, yuko: prev.yuko - 1 }))
        }
      }
    }
  }

  // ========== FUNCIONES DE VOTACIÓN Y FINALIZACIÓN ==========
  
  /** Confirma los votos del panel Hantei y determina ganador */
  const confirmVotes = () => {
    if (athlete1Win) {
      declareWinner(1, 'Victoria por Decisión')
    } else if (athlete2Win) {
      declareWinner(2, 'Victoria por Decisión')
    } else if (athlete1Votes > athlete2Votes) {
      declareWinner(1, 'Hantei (Decisión de Jueces)')
    } else if (athlete2Votes > athlete1Votes) {
      declareWinner(2, 'Hantei (Decisión de Jueces)')
    }
    setShowHantei(false)
  }

  /** Declara al ganador y muestra el diálogo con la razón */
  const declareWinner = async (athlete: number, reason: string) => {
    const ganador = athlete === 1 ? athlete1 : athlete2
    setWinner({ athlete, reason })
    setShowWinnerDialog(true)
    setIsRunning(false)
    
    // Si es un combate de campeonato, actualizar la base de datos automáticamente
    if (combateData && combateData.tipo === 'campeonato') {
      await finalizarCombateCampeonato(ganador, reason)
    }
    
    // Si hay callback, ejecutarlo (para campeonatos)
    if (onFinalizarCombate) {
      onFinalizarCombate(ganador, reason)
    }
  }

  /** Finaliza la competencia comparando puntos o activando Hantei */
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

  /** Finaliza un combate de campeonato y actualiza la base de datos */
  const finalizarCombateCampeonato = async (ganador: any, razon: string) => {
    if (!combateData) return

    try {
      // Determinar el ID del ganador correctamente
      let ganadorId = null
      if (combateData.atleta1 && combateData.atleta2) {
        // Comparar por el objeto atleta directamente
        if (ganador === athlete1) {
          ganadorId = combateData.atleta1.id
        } else if (ganador === athlete2) {
          ganadorId = combateData.atleta2.id
        }
      }

      if (!ganadorId) {
        console.error('No se pudo determinar el ganador')
        return
      }

      // Actualizar el combate en la base de datos
      const supabase = (await import('@/lib/supabase/client')).getSupabaseBrowserClient()
      const { error } = await supabase
        .from('combates_individuales')
        .update({
          ganador_id: ganadorId,
          estado: 'finalizado',
          resultado: razon,
          puntos_atleta1: getTotalPoints(1),
          puntos_atleta2: getTotalPoints(2)
        })
        .eq('id', combateData.id)

      if (error) {
        console.error('Error actualizando combate:', error)
        alert('Error al finalizar el combate: ' + error.message)
        return
      }

      console.log(`¡Combate finalizado exitosamente! Ganador: ${ganador.name} - El bracket se actualizará automáticamente.`)
      
      // Opcional: Mostrar mensaje de éxito
      setTimeout(() => {
        alert('¡Combate finalizado! El bracket del campeonato se ha actualizado automáticamente.')
      }, 1000)

    } catch (error) {
      console.error('Error finalizando combate:', error)
      alert('Error inesperado al finalizar el combate')
    }
  }

  /** Reinicia completamente el combate a valores iniciales */
  const reiniciarCombate = () => {
    setAthlete1Points({ yuko: 0, wazaari: 0, ippon: 0 })
    setAthlete2Points({ yuko: 0, wazaari: 0, ippon: 0 })
    setAthlete1C1({ c: false, k: false, hc: false, h: false, kiken: false, shikkaku: false })
    setAthlete1C2({ c: false, k: false, hc: false, h: false, kiken: false, shikkaku: false })
    setAthlete2C1({ c: false, k: false, hc: false, h: false, kiken: false, shikkaku: false })
    setAthlete2C2({ c: false, k: false, hc: false, h: false, kiken: false, shikkaku: false })
    setTime(getCategoryTime(category))
    setIsRunning(false)
    setAthlete1Votes(0)
    setAthlete2Votes(0)
    setAthlete1Win(false)
    setAthlete2Win(false)
    setWinner({ athlete: 0, reason: '' })
    setShowWinnerDialog(false)
  }

  // ========== RENDER ==========
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        
        {/* ===== SECCIÓN: MARCADOR CENTRAL Y CRONÓMETRO ===== */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-slate-800 to-gray-800 border-2 border-slate-600 shadow-2xl">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                
                {/* Puntaje Total Atleta 1 (Azul) */}
                <div className="text-center">
                  <div className="text-sm font-bold text-blue-400 mb-2 uppercase tracking-wider">Atleta Azul</div>
                  <div className="text-7xl md:text-8xl font-black text-blue-500 drop-shadow-lg">{getTotalPoints(1)}</div>
                </div>

                {/* Cronómetro Cuenta Regresiva con Selector de Categoría */}
                <div className="text-center space-y-6">
                  <div className="text-sm text-gray-300 font-bold uppercase tracking-wider">Tiempo Restante</div>
                  <div className={`text-5xl md:text-6xl font-black drop-shadow-lg ${
                    time <= 10 && time > 0 ? 'text-red-500 animate-pulse' : 'text-white'
                  }`}>
                    {formatTime(time)}
                  </div>
                  
                  <div className="flex justify-center">
                    <Select value={category} onValueChange={(value) => {
                      setCategory(value)
                      setTime(getCategoryTime(value))
                      setIsRunning(false)
                    }}>
                      <SelectTrigger className="w-52 bg-slate-700 text-white border-slate-500 font-semibold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SENIOR (3 min)">SENIOR (3 min)</SelectItem>
                        <SelectItem value="JUNIOR (2 min)">JUNIOR (2 min)</SelectItem>
                        <SelectItem value="CADETE (1.5 min)">CADETE (1.5 min)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-3 justify-center">
                    <Button 
                      onClick={() => setIsRunning(!isRunning)} 
                      className={`${
                        isRunning 
                          ? 'bg-red-600 hover:bg-red-700 shadow-red-500/25' 
                          : 'bg-green-600 hover:bg-green-700 shadow-green-500/25'
                      } font-bold text-lg px-6 py-3 shadow-lg transition-all duration-200`}
                      size="lg"
                    >
                      {isRunning ? (
                        <><Pause className="mr-2 h-5 w-5" /> PARAR</>
                      ) : (
                        <><Play className="mr-2 h-5 w-5" /> INICIAR</>
                      )}
                    </Button>
                    <Button 
                      onClick={() => {
                        setTime(getCategoryTime(category))
                        setIsRunning(false)
                      }} 
                      variant="outline" 
                      size="lg" 
                      className="font-bold text-lg px-6 py-3 border-2 hover:bg-slate-700"
                    >
                      <RotateCcw className="mr-2 h-5 w-5" /> REINICIAR
                    </Button>
                  </div>
                </div>

                {/* Puntaje Total Atleta 2 (Rojo) */}
                <div className="text-center">
                  <div className="text-sm font-bold text-red-400 mb-2 uppercase tracking-wider">Atleta Rojo</div>
                  <div className="text-7xl md:text-8xl font-black text-red-500 drop-shadow-lg">{getTotalPoints(2)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ===== SECCIÓN: CONTROLES DE ATLETAS ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* ===== ATLETA 1 (AZUL) ===== */}
          <Card className="bg-gradient-to-br from-slate-800 to-blue-900 border-2 border-blue-500 shadow-2xl">
            
            {/* Header con Avatar e Información */}
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 pb-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-blue-800 flex items-center justify-center text-white font-black text-2xl shadow-lg border-4 border-blue-300">
                  {getInitials(athlete1.name)}
                </div>
                <div className="text-white flex-1">
                  <div className="font-black text-xl md:text-2xl">{athlete1.name}</div>
                  {athlete1.cinturon && (
                    <div className="text-sm md:text-base opacity-90">{athlete1.cinturon}</div>
                  )}
                  {athlete1.team && (
                    <div className="text-sm md:text-base opacity-90">{athlete1.team}</div>
                  )}
                  {athlete1.location && (
                    <div className="text-xs md:text-sm opacity-75">{athlete1.location}</div>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-4 space-y-4">
              
              {/* Botones de Puntuación: Ippon, Waza-ari, Yuko y Restar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button 
                  onClick={() => addPoint(1, 'ippon')} 
                  className="bg-blue-600 hover:bg-blue-700 font-bold text-lg py-4 shadow-lg transition-all duration-200 hover:scale-105"
                >
                  IPPON
                  <div className="text-xs opacity-75">(3 pts)</div>
                </Button>
                <Button 
                  onClick={() => addPoint(1, 'wazaari')} 
                  className="bg-blue-600 hover:bg-blue-700 font-bold text-lg py-4 shadow-lg transition-all duration-200 hover:scale-105"
                >
                  WAZA-ARI
                  <div className="text-xs opacity-75">(2 pts)</div>
                </Button>
                <Button 
                  onClick={() => addPoint(1, 'yuko')} 
                  className="bg-blue-600 hover:bg-blue-700 font-bold text-lg py-4 shadow-lg transition-all duration-200 hover:scale-105"
                >
                  YUKO
                  <div className="text-xs opacity-75">(1 pt)</div>
                </Button>
                <Button 
                  onClick={() => subtractPoint(1)} 
                  variant="destructive" 
                  className="font-bold text-lg py-4 shadow-lg transition-all duration-200 hover:scale-105"
                >
                  <Minus className="mr-2 h-4 w-4" />
                  RESTAR
                </Button>
              </div>

              {/* Sistema de Penalizaciones */}
              <div className="space-y-3">
                
                {/* Categoría 1: Contacto excesivo, zonas prohibidas */}
                <div className="bg-blue-950/50 p-3 rounded border-2 border-blue-700">
                  <div className="text-blue-400 font-bold mb-2">CATEGORÍA 1</div>
                  <div className="grid grid-cols-4 gap-2">
                    <label className="flex items-center space-x-2 text-white">
                      <Checkbox checked={athlete1C1.c} onCheckedChange={(checked) => setAthlete1C1(prev => ({ ...prev, c: checked as boolean }))} />
                      <span className="text-sm font-bold">C</span>
                    </label>
                    <label className="flex items-center space-x-2 text-white">
                      <Checkbox checked={athlete1C1.k} onCheckedChange={(checked) => setAthlete1C1(prev => ({ ...prev, k: checked as boolean }))} />
                      <span className="text-sm font-bold">K</span>
                    </label>
                    <label className="flex items-center space-x-2 text-white">
                      <Checkbox checked={athlete1C1.hc} onCheckedChange={(checked) => setAthlete1C1(prev => ({ ...prev, hc: checked as boolean }))} />
                      <span className="text-sm font-bold">HC</span>
                    </label>
                    <label className="flex items-center space-x-2 text-white">
                      <Checkbox checked={athlete1C1.h} onCheckedChange={(checked) => setAthlete1C1(prev => ({ ...prev, h: checked as boolean }))} />
                      <span className="text-sm font-bold">H</span>
                    </label>
                  </div>
                </div>

                <div className="bg-blue-950/50 p-3 rounded border-2 border-blue-700">
                  <div className="text-blue-400 font-bold mb-2">CATEGORÍA 2</div>
                  <div className="grid grid-cols-4 gap-2">
                    <label className="flex items-center space-x-2 text-white">
                      <Checkbox checked={athlete1C2.c} onCheckedChange={(checked) => setAthlete1C2(prev => ({ ...prev, c: checked as boolean }))} />
                      <span className="text-sm font-bold">C</span>
                    </label>
                    <label className="flex items-center space-x-2 text-white">
                      <Checkbox checked={athlete1C2.k} onCheckedChange={(checked) => setAthlete1C2(prev => ({ ...prev, k: checked as boolean }))} />
                      <span className="text-sm font-bold">K</span>
                    </label>
                    <label className="flex items-center space-x-2 text-white">
                      <Checkbox checked={athlete1C2.hc} onCheckedChange={(checked) => setAthlete1C2(prev => ({ ...prev, hc: checked as boolean }))} />
                      <span className="text-sm font-bold">HC</span>
                    </label>
                    <label className="flex items-center space-x-2 text-white">
                      <Checkbox checked={athlete1C2.h} onCheckedChange={(checked) => setAthlete1C2(prev => ({ ...prev, h: checked as boolean }))} />
                      <span className="text-sm font-bold">H</span>
                    </label>
                  </div>
                </div>

                <div className="bg-red-950/50 p-3 rounded border-2 border-red-700">
                  <div className="text-red-400 font-bold mb-2">DESCALIFICACIÓN</div>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center space-x-2 text-white">
                      <Checkbox checked={athlete1C1.kiken} onCheckedChange={(checked) => setAthlete1C1(prev => ({ ...prev, kiken: checked as boolean }))} />
                      <span className="text-sm font-bold">KIKEN</span>
                    </label>
                    <label className="flex items-center space-x-2 text-white">
                      <Checkbox checked={athlete1C1.shikkaku} onCheckedChange={(checked) => setAthlete1C1(prev => ({ ...prev, shikkaku: checked as boolean }))} />
                      <span className="text-sm font-bold">SHIKAKU</span>
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ATLETA 2 (ROJO) */}
          <Card className="bg-gradient-to-br from-slate-800 to-red-900 border-2 border-red-500 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-red-600 to-red-700 pb-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-red-800 flex items-center justify-center text-white font-black text-2xl shadow-lg border-4 border-red-300">
                  {getInitials(athlete2.name)}
                </div>
                <div className="text-white flex-1">
                  <div className="font-black text-xl md:text-2xl">{athlete2.name}</div>
                  {athlete2.cinturon && (
                    <div className="text-sm md:text-base opacity-90">{athlete2.cinturon}</div>
                  )}
                  {athlete2.team && (
                    <div className="text-sm md:text-base opacity-90">{athlete2.team}</div>
                  )}
                  {athlete2.location && (
                    <div className="text-xs md:text-sm opacity-75">{athlete2.location}</div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* Botones de Puntuación */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button 
                  onClick={() => addPoint(2, 'ippon')} 
                  className="bg-red-600 hover:bg-red-700 font-bold text-lg py-4 shadow-lg transition-all duration-200 hover:scale-105"
                >
                  IPPON
                  <div className="text-xs opacity-75">(3 pts)</div>
                </Button>
                <Button 
                  onClick={() => addPoint(2, 'wazaari')} 
                  className="bg-red-600 hover:bg-red-700 font-bold text-lg py-4 shadow-lg transition-all duration-200 hover:scale-105"
                >
                  WAZA-ARI
                  <div className="text-xs opacity-75">(2 pts)</div>
                </Button>
                <Button 
                  onClick={() => addPoint(2, 'yuko')} 
                  className="bg-red-600 hover:bg-red-700 font-bold text-lg py-4 shadow-lg transition-all duration-200 hover:scale-105"
                >
                  YUKO
                  <div className="text-xs opacity-75">(1 pt)</div>
                </Button>
                <Button 
                  onClick={() => subtractPoint(2)} 
                  variant="destructive" 
                  className="font-bold text-lg py-4 shadow-lg transition-all duration-200 hover:scale-105"
                >
                  <Minus className="mr-2 h-4 w-4" />
                  RESTAR
                </Button>
              </div>

              {/* Penalizaciones */}
              <div className="space-y-3">
                <div className="bg-red-950/50 p-3 rounded border-2 border-red-700">
                  <div className="text-red-400 font-bold mb-2">CATEGORÍA 1</div>
                  <div className="grid grid-cols-4 gap-2">
                    <label className="flex items-center space-x-2 text-white">
                      <Checkbox checked={athlete2C1.c} onCheckedChange={(checked) => setAthlete2C1(prev => ({ ...prev, c: checked as boolean }))} />
                      <span className="text-sm font-bold">C</span>
                    </label>
                    <label className="flex items-center space-x-2 text-white">
                      <Checkbox checked={athlete2C1.k} onCheckedChange={(checked) => setAthlete2C1(prev => ({ ...prev, k: checked as boolean }))} />
                      <span className="text-sm font-bold">K</span>
                    </label>
                    <label className="flex items-center space-x-2 text-white">
                      <Checkbox checked={athlete2C1.hc} onCheckedChange={(checked) => setAthlete2C1(prev => ({ ...prev, hc: checked as boolean }))} />
                      <span className="text-sm font-bold">HC</span>
                    </label>
                    <label className="flex items-center space-x-2 text-white">
                      <Checkbox checked={athlete2C1.h} onCheckedChange={(checked) => setAthlete2C1(prev => ({ ...prev, h: checked as boolean }))} />
                      <span className="text-sm font-bold">H</span>
                    </label>
                  </div>
                </div>

                <div className="bg-red-950/50 p-3 rounded border-2 border-red-700">
                  <div className="text-red-400 font-bold mb-2">CATEGORÍA 2</div>
                  <div className="grid grid-cols-4 gap-2">
                    <label className="flex items-center space-x-2 text-white">
                      <Checkbox checked={athlete2C2.c} onCheckedChange={(checked) => setAthlete2C2(prev => ({ ...prev, c: checked as boolean }))} />
                      <span className="text-sm font-bold">C</span>
                    </label>
                    <label className="flex items-center space-x-2 text-white">
                      <Checkbox checked={athlete2C2.k} onCheckedChange={(checked) => setAthlete2C2(prev => ({ ...prev, k: checked as boolean }))} />
                      <span className="text-sm font-bold">K</span>
                    </label>
                    <label className="flex items-center space-x-2 text-white">
                      <Checkbox checked={athlete2C2.hc} onCheckedChange={(checked) => setAthlete2C2(prev => ({ ...prev, hc: checked as boolean }))} />
                      <span className="text-sm font-bold">HC</span>
                    </label>
                    <label className="flex items-center space-x-2 text-white">
                      <Checkbox checked={athlete2C2.h} onCheckedChange={(checked) => setAthlete2C2(prev => ({ ...prev, h: checked as boolean }))} />
                      <span className="text-sm font-bold">H</span>
                    </label>
                  </div>
                </div>

                <div className="bg-red-950/50 p-3 rounded border-2 border-red-700">
                  <div className="text-red-400 font-bold mb-2">DESCALIFICACIÓN</div>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center space-x-2 text-white">
                      <Checkbox checked={athlete2C1.kiken} onCheckedChange={(checked) => setAthlete2C1(prev => ({ ...prev, kiken: checked as boolean }))} />
                      <span className="text-sm font-bold">KIKEN</span>
                    </label>
                    <label className="flex items-center space-x-2 text-white">
                      <Checkbox checked={athlete2C1.shikkaku} onCheckedChange={(checked) => setAthlete2C1(prev => ({ ...prev, shikkaku: checked as boolean }))} />
                      <span className="text-sm font-bold">SHIKAKU</span>
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel de Votación Hantei */}
        <Card className="bg-gradient-to-r from-yellow-900 to-amber-900 border-2 border-yellow-500 mb-8 shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-yellow-600 to-amber-600">
            <CardTitle className="text-white text-xl md:text-2xl font-black text-center uppercase tracking-wider">
              🏆 Hantei - Votación de Jueces
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              {/* Atleta 1 Votos */}
              <div className="text-center space-y-4">
                <div className="text-blue-400 font-bold text-lg uppercase tracking-wider">Atleta Azul</div>
                <div className="flex gap-3 justify-center items-center">
                  <Button 
                    onClick={() => setAthlete1Votes(Math.max(0, athlete1Votes - 1))} 
                    variant="outline" 
                    size="lg"
                    className="h-12 w-12 border-2 hover:bg-blue-600"
                  >
                    <Minus className="h-5 w-5" />
                  </Button>
                  <div className="text-5xl font-black text-white w-20 text-center">{athlete1Votes}</div>
                  <Button 
                    onClick={() => setAthlete1Votes(athlete1Votes + 1)} 
                    variant="outline" 
                    size="lg"
                    className="h-12 w-12 border-2 hover:bg-blue-600"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>
                <label className="flex items-center justify-center space-x-3 text-white cursor-pointer">
                  <Checkbox 
                    checked={athlete1Win} 
                    onCheckedChange={(checked) => {
                      setAthlete1Win(checked as boolean)
                      if (checked) setAthlete2Win(false)
                    }} 
                    className="w-5 h-5"
                  />
                  <span className="font-bold text-lg">VICTORIA DIRECTA</span>
                </label>
              </div>

              {/* Confirmar */}
              <div className="flex items-center justify-center">
                <Button 
                  onClick={confirmVotes} 
                  className="bg-green-600 hover:bg-green-700 font-black text-xl px-8 py-6 shadow-lg transition-all duration-200 hover:scale-105" 
                  size="lg"
                >
                  <Trophy className="mr-3 h-6 w-6" />
                  CONFIRMAR
                </Button>
              </div>

              {/* Atleta 2 Votos */}
              <div className="text-center space-y-4">
                <div className="text-red-400 font-bold text-lg uppercase tracking-wider">Atleta Rojo</div>
                <div className="flex gap-3 justify-center items-center">
                  <Button 
                    onClick={() => setAthlete2Votes(Math.max(0, athlete2Votes - 1))} 
                    variant="outline" 
                    size="lg"
                    className="h-12 w-12 border-2 hover:bg-red-600"
                  >
                    <Minus className="h-5 w-5" />
                  </Button>
                  <div className="text-5xl font-black text-white w-20 text-center">{athlete2Votes}</div>
                  <Button 
                    onClick={() => setAthlete2Votes(athlete2Votes + 1)} 
                    variant="outline" 
                    size="lg"
                    className="h-12 w-12 border-2 hover:bg-red-600"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>
                <label className="flex items-center justify-center space-x-3 text-white cursor-pointer">
                  <Checkbox 
                    checked={athlete2Win} 
                    onCheckedChange={(checked) => {
                      setAthlete2Win(checked as boolean)
                      if (checked) setAthlete1Win(false)
                    }}
                    className="w-5 h-5"
                  />
                  <span className="font-bold text-lg">VICTORIA DIRECTA</span>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botones de Control */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Button 
            onClick={reiniciarCombate} 
            className="bg-red-600 hover:bg-red-700 font-black text-xl py-8 shadow-lg transition-all duration-200 hover:scale-105" 
            size="lg"
          >
            <RotateCcw className="mr-3 h-6 w-6" />
            REINICIAR COMBATE
          </Button>
          <Button 
            onClick={finalizarCompetencia} 
            className="bg-green-600 hover:bg-green-700 font-black text-xl py-8 shadow-lg transition-all duration-200 hover:scale-105" 
            size="lg"
          >
            <Trophy className="mr-3 h-6 w-6" />
            FINALIZAR COMPETENCIA
          </Button>
        </div>
      </div>

      {/* Dialog: Ganador */}
      <Dialog open={showWinnerDialog} onOpenChange={setShowWinnerDialog}>
        <DialogContent className="max-w-4xl bg-gradient-to-br from-slate-900 to-black border-4 border-yellow-500 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-center text-4xl md:text-6xl font-black text-yellow-400 uppercase tracking-wider">
              🏆 ¡GANADOR! 🏆
            </DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-8 py-12">
            <Trophy className={`mx-auto h-32 w-32 md:h-40 w-40 drop-shadow-2xl ${
              winner.athlete === 1 ? 'text-blue-500' : 'text-red-500'
            }`} />
            <div>
              <div className={`text-4xl md:text-6xl font-black mb-4 ${
                winner.athlete === 1 ? 'text-blue-500' : 'text-red-500'
              }`}>
                {winner.athlete === 1 ? athlete1.name : athlete2.name}
              </div>
              <div className="text-xl md:text-2xl text-yellow-400 font-bold bg-yellow-900/30 px-6 py-3 rounded-lg inline-block">
                {winner.reason}
              </div>
            </div>
            <div className="text-4xl md:text-6xl font-black text-white bg-slate-800/50 px-8 py-4 rounded-lg inline-block">
              {getTotalPoints(1)} - {getTotalPoints(2)}
            </div>
            
            {/* Botones de acción */}
            <div className="flex gap-4 justify-center mt-8">
              {combateData && (
                <Button 
                  onClick={() => {
                    // Redirigir al home de campeonatos
                    window.location.href = '/admin/combates/campionatos'
                  }}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xl px-8 py-4 shadow-lg transition-all duration-200 hover:scale-105"
                  size="lg"
                >
                  <Trophy className="mr-3 h-6 w-6" />
                  VER BRACKET ACTUALIZADO
                </Button>
              )}
              <Button 
                onClick={() => setShowWinnerDialog(false)}
                variant="outline"
                className="font-bold text-xl px-8 py-4 border-2 hover:bg-slate-700"
                size="lg"
              >
                CONTINUAR AQUÍ
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Hantei */}
      <Dialog open={showHantei} onOpenChange={setShowHantei}>
        <DialogContent className="max-w-2xl bg-gradient-to-br from-yellow-900 to-amber-900 border-4 border-yellow-500 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl md:text-4xl font-black text-center text-yellow-400 uppercase tracking-wider">
              ⚖️ EMPATE - HANTEI REQUERIDO
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-8 space-y-6">
            <p className="text-white text-lg md:text-xl leading-relaxed">
              Los puntos están empatados. Use el panel de votación para determinar el ganador.
            </p>
            <Button 
              onClick={() => setShowHantei(false)} 
              variant="outline" 
              className="font-bold text-lg px-8 py-4 border-2 hover:bg-yellow-600"
            >
              Entendido
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default JuecesControlPanel
export type { JuecesControlPanelProps }
