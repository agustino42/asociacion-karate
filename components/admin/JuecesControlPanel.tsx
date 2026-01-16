"use client"

// NO CAMBIAR NADA - Este código debe mantenerse exactamente como está
// Importaciones necesarias para el componente
import { useState, useEffect } from "react" // Hooks de React para estado y efectos
import { motion, AnimatePresence } from "framer-motion" // Librería para animaciones
import { useTheme } from "next-themes" // Hook para manejar el tema (claro/oscuro)
import { Button } from "@/components/ui/button" // Componente de botón
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card" // Componentes de tarjeta
import { Checkbox } from "@/components/ui/checkbox" // Componente de casilla de verificación
import { Play, Pause, RotateCcw, Trophy, Plus, Minus, Star, Zap, Volume2, VolumeX } from "lucide-react" // Iconos de Lucide
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog" // Componentes de diálogo
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select" // Componente de selección
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip" // Componentes de tooltip
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog" // Componentes de diálogo de alerta
import useSound from "use-sound" // Hook para reproducir sonidos
import { getSupabaseBrowserClient } from "@/lib/supabase/client" // Cliente de Supabase
import { useRouter } from "next/navigation" // Hook para navegación
import { useToast } from "@/hooks/use-toast" // Hook para notificaciones

/**
 * PANEL DE CONTROL - JUEZ O ÁRBITRO DE KARATE KUMITE
 * Sistema completo de gestión de combates con puntuación WKF,
 * cronómetro, penalizaciones y sistema de votación Hantei
 */

// Interfaz para datos de atleta (nombre, equipo, ubicación)
interface Atleta {
  id?: string
  nombre: string
  equipo: string
  ubicacion: string
}

// Props del componente
interface PanelControlJuecesProps {
  combateId?: string
  atleta1Data?: Atleta
  atleta2Data?: Atleta
}

// Interfaz para penalizaciones (C, K, HC, H + descalificaciones)
// Sistema de penalizaciones WKF Karate Kumite:
// - C: Chukoku (Advertencia verbal)
// - K: Keikoku (Advertencia con penalización - NO otorga puntos al oponente)
// - HC: Hansoku-Chui (Penalización - NO otorga puntos al oponente)
// - H: Hansoku (Descalificación por acumulación de penalizaciones)
// - Kiken: Descalificación por abandono o lesión
// - Shikkaku: Descalificación por conducta grave
interface Penalizaciones {
  c: boolean        // Chukoku (Advertencia)
  k: boolean        // Keikoku (Advertencia de penalización)
  hc: boolean       // Hansoku-Chui (Penalización)
  h: boolean        // Hansoku (Descalificación por acumulación)
  kiken: boolean    // Descalificación por abandono/lesión
  shikkaku: boolean // Descalificación por conducta grave
}

function PanelControlJueces({ combateId, atleta1Data, atleta2Data }: PanelControlJuecesProps = {}) {
  const { theme } = useTheme()
  const router = useRouter()
  const { toast } = useToast()
  const supabase = getSupabaseBrowserClient()
  const [montado, setMontado] = useState(false)
  const [sonidoActivado, setSonidoActivado] = useState(true)
  const [guardandoCombate, setGuardandoCombate] = useState(false)

  // Hooks para sonidos
  // 
  {/**  const [reproducirSonidoPunto] = useSound('/sounds/point.mp3', { volume: 0.5 })
  const [reproducirSonidoGanador] = useSound('/sounds/winner.mp3', { volume: 0.5 })*/}

  useEffect(() => {
    setMontado(true)
  }, [])

  // ========== ESTADOS DE ATLETAS ==========
  // Información de los atletas (nombre, equipo, ubicación)
  const [atleta1, setAtleta1] = useState<Atleta>(
    atleta1Data || { nombre: 'CARMEN LINARES', equipo: 'DRAGONES ROJOS', ubicacion: 'BARINAS' }
  )
  const [atleta2, setAtleta2] = useState<Atleta>(
    atleta2Data || { nombre: 'LAURA SÁNCHEZ', equipo: 'TURPIALES', ubicacion: 'BARINAS' }
  )

  // Actualizar atletas cuando cambien los props
  useEffect(() => {
    if (atleta1Data) {
      setAtleta1(atleta1Data)
    }
    if (atleta2Data) {
      setAtleta2(atleta2Data)
    }
  }, [atleta1Data, atleta2Data])
  
  // ========== ESTADOS DE PUNTUACIÓN ==========
  // Puntos por tipo: Yuko (1 punto), Waza-ari (2 puntos), Ippon (3 puntos)
  const [puntosAtleta1, setPuntosAtleta1] = useState({ yuko: 0, wazaari: 0, ippon: 0 })
  const [puntosAtleta2, setPuntosAtleta2] = useState({ yuko: 0, wazaari: 0, ippon: 0 })
  
  // ========== ESTADOS DE PENALIZACIONES ==========
  // Penalizaciones Categoría 1 y 2 para cada atleta
  const [atleta1C1, setAtleta1C1] = useState<Penalizaciones>({ c: false, k: false, hc: false, h: false, kiken: false, shikkaku: false })
  const [atleta1C2, setAtleta1C2] = useState<Penalizaciones>({ c: false, k: false, hc: false, h: false, kiken: false, shikkaku: false })
  const [atleta2C1, setAtleta2C1] = useState<Penalizaciones>({ c: false, k: false, hc: false, h: false, kiken: false, shikkaku: false })
  const [atleta2C2, setAtleta2C2] = useState<Penalizaciones>({ c: false, k: false, hc: false, h: false, kiken: false, shikkaku: false })
  
  // ========== ESTADOS DE CRONÓMETRO ==========
  // Tiempo en cuenta regresiva (segundos), estado de ejecución y categoría seleccionada
  const [tiempo, setTiempo] = useState(180) // 3 minutos por defecto
  const [estaEjecutandose, setEstaEjecutandose] = useState(false)
  const [categoria, setCategoria] = useState('SENIOR (3 min)')
  
  // ========== ESTADOS DE VOTACIÓN HANTEI ==========
  // Sistema de votación para desempate
  const [mostrarHantei, setMostrarHantei] = useState(false)
  const [votosAtleta1, setVotosAtleta1] = useState(0)
  const [votosAtleta2, setVotosAtleta2] = useState(0)
  const [atleta1Gana, setAtleta1Gana] = useState(false)
  const [atleta2Gana, setAtleta2Gana] = useState(false)
  const [mostrarDialogoVotos, setMostrarDialogoVotos] = useState(false)

  // ========== ESTADOS DE GANADOR ==========
  // Diálogo y datos del ganador
  const [mostrarDialogoGanador, setMostrarDialogoGanador] = useState(false)
  const [ganador, setGanador] = useState<{ atleta: number, razon: string }>({ atleta: 0, razon: '' })

  // ========== ESTADO SENSHU ==========
  // Atleta que anotó el primer punto (1 o 2, null si ninguno)
  const [senshu, setSenshu] = useState<number | null>(null)

  // ========== ESTADOS PARA ALERTAS ==========
  const [mostrarAlertaFinalizar, setMostrarAlertaFinalizar] = useState(false)
  const [mostrarAlertaReiniciar, setMostrarAlertaReiniciar] = useState(false)
  const [mostrarAlertaDescalificacion, setMostrarAlertaDescalificacion] = useState(false)
  const [atletaDescalificar, setAtletaDescalificar] = useState<number | null>(null)
  const [tipoDescalificacion, setTipoDescalificacion] = useState<'kiken' | 'shikkaku' | null>(null)
  const [panelDeshabilitado, setPanelDeshabilitado] = useState(false)

  // ========== EFECTO: CRONÓMETRO CUENTA REGRESIVA ==========
  // Decrementa el tiempo cada segundo cuando está activo
  // Se detiene automáticamente al llegar a 0 y determina el ganador según reglas
  useEffect(() => {
    let intervalo: NodeJS.Timeout
    if (estaEjecutandose && tiempo > 0) {
      intervalo = setInterval(() => {
        setTiempo(prev => {
          if (prev <= 1) {
            setEstaEjecutandose(false)
            // Verificar resultado al finalizar el tiempo
            const total1 = obtenerPuntosTotales(1)
            const total2 = obtenerPuntosTotales(2)
            const diferencia = Math.abs(total1 - total2)

            if (diferencia >= 8) {
              // Victoria por ventaja de 8 puntos o más
              const ganador = total1 > total2 ? 1 : 2
              declararGanador(ganador, "Ventaja ≥8 puntos")
            } else if (total1 === total2) {
              // Empate - activar Hantei
              setMostrarHantei(true)
            } else {
              // Diferencia de puntos - declarar ganador por puntos
              const ganador = total1 > total2 ? 1 : 2
              declararGanador(ganador, "Puntos")
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(intervalo)
  }, [estaEjecutandose, tiempo])

  // ========== FUNCIONES AUXILIARES ==========
  
  /** Formatea segundos a formato MM:SS */
  const formatearTiempo = (segundos: number) => {
    const minutos = Math.floor(segundos / 60)
    const segs = segundos % 60
    return `${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`
  }

  /** Obtiene el tiempo en segundos según la categoría */
  const obtenerTiempoCategoria = (cat: string) => {
    switch (cat) {
      case 'SENIOR (3 min)': return 180
      case 'JUNIOR (2 min)': return 120
      case 'CADETE (1.5 min)': return 90
      default: return 180
    }
  }

  /** Calcula el total de puntos: Yuko=1, Waza-ari=2, Ippon=3 */
  const obtenerPuntosTotales = (atleta: number) => {
    const puntos = atleta === 1 ? puntosAtleta1 : puntosAtleta2
    return puntos.yuko * 1 + puntos.wazaari * 2 + puntos.ippon * 3
  }

  /** Obtiene las iniciales del nombre para el avatar */
  const obtenerIniciales = (nombre: string) => {
    return nombre.split(' ').map(n => n[0]).join('').substring(0, 2)
  }

  // ========== FUNCIONES DE PUNTUACIÓN ==========

  /** Agrega un punto del tipo especificado al atleta */
  const agregarPunto = (atleta: number, tipo: 'yuko' | 'wazaari' | 'ippon') => {
    // Establecer SENSHU si es el primer punto del combate
    if (senshu === null) {
      setSenshu(atleta)
    }

    if (atleta === 1) {
      setPuntosAtleta1(prev => {
        const nuevosPuntos = { ...prev, [tipo]: prev[tipo] + 1 }
        const total = nuevosPuntos.yuko * 1 + nuevosPuntos.wazaari * 2 + nuevosPuntos.ippon * 3
        if (total >= 8) {
          declararGanador(1, "Ventaja ≥8 puntos")
        }
        return nuevosPuntos
      })
    } else {
      setPuntosAtleta2(prev => {
        const nuevosPuntos = { ...prev, [tipo]: prev[tipo] + 1 }
        const total = nuevosPuntos.yuko * 1 + nuevosPuntos.wazaari * 2 + nuevosPuntos.ippon * 3
        if (total >= 8) {
          declararGanador(2, "Ventaja ≥8 puntos")
        }
        return nuevosPuntos
      })
    }
   {/**  if (sonidoActivado) {
      reproducirSonidoPunto()
    }*/}
  }

  /** Aplica penalización progresiva de Categoría 1 - SIN OTORGAR PUNTOS AL OPONENTE */
  const aplicarPenalizacionC1 = (atleta: number, tipoPenalizacion: 'c' | 'k' | 'hc' | 'h', marcado: boolean) => {
    if (atleta === 1) {
      setAtleta1C1(prev => {
        let nuevoEstado = { ...prev }

        if (tipoPenalizacion === 'c') {
          nuevoEstado.c = marcado
          // Si desmarcamos C, desmarcar también K, HC, H
          if (!marcado) {
            nuevoEstado.k = false
            nuevoEstado.hc = false
            nuevoEstado.h = false
          }
        } else if (tipoPenalizacion === 'k') {
          if (marcado) {
            nuevoEstado.c = true // Marcar C automáticamente
            nuevoEstado.k = true
            // NOTA: NO se otorgan puntos al oponente - Modificación solicitada
          } else {
            nuevoEstado.k = false
            nuevoEstado.hc = false
            nuevoEstado.h = false
          }
        } else if (tipoPenalizacion === 'hc') {
          if (marcado) {
            nuevoEstado.c = true // Marcar C automáticamente
            nuevoEstado.k = true // Marcar K automáticamente
            nuevoEstado.hc = true
            // NOTA: NO se otorgan puntos al oponente - Modificación solicitada
          } else {
            nuevoEstado.hc = false
            nuevoEstado.h = false
          }
        } else if (tipoPenalizacion === 'h') {
          if (marcado) {
            nuevoEstado.c = true // Marcar C automáticamente
            nuevoEstado.k = true // Marcar K automáticamente
            nuevoEstado.hc = true // Marcar HC automáticamente
            nuevoEstado.h = true
            // Descalificación automática
          } else {
            nuevoEstado.h = false
          }
        }

        return nuevoEstado
      })
    } else {
      setAtleta2C1(prev => {
        let nuevoEstado = { ...prev }

        if (tipoPenalizacion === 'c') {
          nuevoEstado.c = marcado
          if (!marcado) {
            nuevoEstado.k = false
            nuevoEstado.hc = false
            nuevoEstado.h = false
          }
        } else if (tipoPenalizacion === 'k') {
          if (marcado) {
            nuevoEstado.c = true
            nuevoEstado.k = true
            // NOTA: NO se otorgan puntos al oponente - Modificación solicitada
          } else {
            nuevoEstado.k = false
            nuevoEstado.hc = false
            nuevoEstado.h = false
          }
        } else if (tipoPenalizacion === 'hc') {
          if (marcado) {
            nuevoEstado.c = true
            nuevoEstado.k = true
            nuevoEstado.hc = true
            // NOTA: NO se otorgan puntos al oponente - Modificación solicitada
          } else {
            nuevoEstado.hc = false
            nuevoEstado.h = false
          }
        } else if (tipoPenalizacion === 'h') {
          if (marcado) {
            nuevoEstado.c = true
            nuevoEstado.k = true
            nuevoEstado.hc = true
            nuevoEstado.h = true
          } else {
            nuevoEstado.h = false
          }
        }

        return nuevoEstado
      })
    }
  }

  /** Aplica penalización progresiva de Categoría 2 - SIN OTORGAR PUNTOS AL OPONENTE */
  const aplicarPenalizacionC2 = (atleta: number, tipoPenalizacion: 'c' | 'k' | 'hc' | 'h', marcado: boolean) => {
    if (atleta === 1) {
      setAtleta1C2(prev => {
        let nuevoEstado = { ...prev }

        if (tipoPenalizacion === 'c') {
          nuevoEstado.c = marcado
          // Si desmarcamos C, desmarcar también K, HC, H
          if (!marcado) {
            nuevoEstado.k = false
            nuevoEstado.hc = false
            nuevoEstado.h = false
          }
        } else if (tipoPenalizacion === 'k') {
          if (marcado) {
            nuevoEstado.c = true // Marcar C automáticamente
            nuevoEstado.k = true
            // NOTA: NO se otorgan puntos al oponente - Modificación solicitada
          } else {
            nuevoEstado.k = false
            nuevoEstado.hc = false
            nuevoEstado.h = false
          }
        } else if (tipoPenalizacion === 'hc') {
          if (marcado) {
            nuevoEstado.c = true // Marcar C automáticamente
            nuevoEstado.k = true // Marcar K automáticamente
            nuevoEstado.hc = true
            // NOTA: NO se otorgan puntos al oponente - Modificación solicitada
          } else {
            nuevoEstado.hc = false
            nuevoEstado.h = false
          }
        } else if (tipoPenalizacion === 'h') {
          if (marcado) {
            nuevoEstado.c = true // Marcar C automáticamente
            nuevoEstado.k = true // Marcar K automáticamente
            nuevoEstado.hc = true // Marcar HC automáticamente
            nuevoEstado.h = true
            // Descalificación automática
          } else {
            nuevoEstado.h = false
          }
        }

        return nuevoEstado
      })
    } else {
      setAtleta2C2(prev => {
        let nuevoEstado = { ...prev }

        if (tipoPenalizacion === 'c') {
          nuevoEstado.c = marcado
          if (!marcado) {
            nuevoEstado.k = false
            nuevoEstado.hc = false
            nuevoEstado.h = false
          }
        } else if (tipoPenalizacion === 'k') {
          if (marcado) {
            nuevoEstado.c = true
            nuevoEstado.k = true
            // NOTA: NO se otorgan puntos al oponente - Modificación solicitada
          } else {
            nuevoEstado.k = false
            nuevoEstado.hc = false
            nuevoEstado.h = false
          }
        } else if (tipoPenalizacion === 'hc') {
          if (marcado) {
            nuevoEstado.c = true
            nuevoEstado.k = true
            nuevoEstado.hc = true
            // NOTA: NO se otorgan puntos al oponente - Modificación solicitada
          } else {
            nuevoEstado.hc = false
            nuevoEstado.h = false
          }
        } else if (tipoPenalizacion === 'h') {
          if (marcado) {
            nuevoEstado.c = true
            nuevoEstado.k = true
            nuevoEstado.hc = true
            nuevoEstado.h = true
          } else {
            nuevoEstado.h = false
          }
        }

        return nuevoEstado
      })
    }
  }

  /** Resta el punto más alto del atleta (para correcciones) */
  const restarPunto = (atleta: number) => {
    if (atleta === 1) {
      const total = obtenerPuntosTotales(1)
      if (total > 0) {
        if (puntosAtleta1.ippon > 0) {
          setPuntosAtleta1(prev => ({ ...prev, ippon: prev.ippon - 1 }))
        } else if (puntosAtleta1.wazaari > 0) {
          setPuntosAtleta1(prev => ({ ...prev, wazaari: prev.wazaari - 1 }))
        } else if (puntosAtleta1.yuko > 0) {
          setPuntosAtleta1(prev => ({ ...prev, yuko: prev.yuko - 1 }))
        }
      }
    } else {
      const total = obtenerPuntosTotales(2)
      if (total > 0) {
        if (puntosAtleta2.ippon > 0) {
          setPuntosAtleta2(prev => ({ ...prev, ippon: prev.ippon - 1 }))
        } else if (puntosAtleta2.wazaari > 0) {
          setPuntosAtleta2(prev => ({ ...prev, wazaari: prev.wazaari - 1 }))
        } else if (puntosAtleta2.yuko > 0) {
          setPuntosAtleta2(prev => ({ ...prev, yuko: prev.yuko - 1 }))
        }
      }
    }
  }

  // ========== FUNCIONES DE VOTACIÓN Y FINALIZACIÓN ==========
  
  /** Confirma los votos del panel Hantei y declara al ganador */
  const confirmarVotos = () => {
    if (votosAtleta1 > votosAtleta2) {
      declararGanador(1, "Hantei")
    } else if (votosAtleta2 > votosAtleta1) {
      declararGanador(2, "Hantei")
    }
    setMostrarHantei(false)
  }

  /** Declara al ganador y muestra el diálogo con la razón */
  const declararGanador = async (atleta: number, razon: string) => {
    setGanador({ atleta, razon })
    setMostrarDialogoGanador(true)
    setEstaEjecutandose(false)
    if (atleta === 1) {
      setAtleta1Gana(true)
    } else {
      setAtleta2Gana(true)
    }
    
    // Guardar el combate en la base de datos
    await guardarCombateEnBD(atleta, razon)
  }

  /** Guarda el combate finalizado en la base de datos */
  const guardarCombateEnBD = async (atletaGanador: number, razonVictoria: string) => {
    setGuardandoCombate(true)
    try {
      // Si ya existe un combateId, actualizar ese combate
      if (combateId && atleta1.id && atleta2.id) {
        const ganadorId = atletaGanador === 1 ? atleta1.id : atletaGanador === 2 ? atleta2.id : null
        
        const { error: errorActualizar } = await supabase
          .from('combates_individuales')
          .update({
            ganador_id: ganadorId,
            puntos_atleta1: obtenerPuntosTotales(1),
            puntos_atleta2: obtenerPuntosTotales(2),
            estado: 'finalizado'
          })
          .eq('id', combateId)

        if (errorActualizar) throw errorActualizar

        // Actualizar rankings si hay ganador
        if (ganadorId) {
          const perdedorId = ganadorId === atleta1.id ? atleta2.id : atleta1.id
          
          await Promise.all([
            supabase.rpc('actualizar_ranking_atleta', {
              p_atleta_id: ganadorId,
              p_resultado: 'victoria',
              p_puntos: 3
            }),
            supabase.rpc('actualizar_ranking_atleta', {
              p_atleta_id: perdedorId,
              p_resultado: 'derrota',
              p_puntos: 0
            })
          ])

          await supabase.rpc('recalcular_posiciones_atletas')
        }

        toast({
          title: "Combate actualizado",
          description: `El resultado del combate se ha guardado correctamente.`,
        })
        return
      }

      // Si no existe combateId, crear uno nuevo (lógica original)
      // Buscar o crear atletas en la base de datos
      const { data: atletasExistentes } = await supabase
        .from('atletas')
        .select('id, nombre, apellido')
        .or(`nombre.ilike.%${atleta1.nombre.split(' ')[0]}%,nombre.ilike.%${atleta2.nombre.split(' ')[0]}%`)

      let atleta1Id, atleta2Id

      // Buscar atleta 1
      const atleta1Existente = atletasExistentes?.find(a => 
        a.nombre.toLowerCase().includes(atleta1.nombre.split(' ')[0].toLowerCase())
      )
      
      if (atleta1Existente) {
        atleta1Id = atleta1Existente.id
      } else {
        // Crear atleta 1
        const nombreCompleto = atleta1.nombre.split(' ')
        const { data: nuevoAtleta1 } = await supabase
          .from('atletas')
          .insert({
            nombre: nombreCompleto[0] || atleta1.nombre,
            apellido: nombreCompleto.slice(1).join(' ') || 'Sin Apellido',
            cinturon: 'Negro',
            categoria: categoria.includes('SENIOR') ? 'Senior' : categoria.includes('JUNIOR') ? 'Junior' : 'Cadete',
            equipo: atleta1.equipo
          })
          .select('id')
          .single()
        atleta1Id = nuevoAtleta1?.id
      }

      // Buscar atleta 2
      const atleta2Existente = atletasExistentes?.find(a => 
        a.nombre.toLowerCase().includes(atleta2.nombre.split(' ')[0].toLowerCase())
      )
      
      if (atleta2Existente) {
        atleta2Id = atleta2Existente.id
      } else {
        // Crear atleta 2
        const nombreCompleto = atleta2.nombre.split(' ')
        const { data: nuevoAtleta2 } = await supabase
          .from('atletas')
          .insert({
            nombre: nombreCompleto[0] || atleta2.nombre,
            apellido: nombreCompleto.slice(1).join(' ') || 'Sin Apellido',
            cinturon: 'Negro',
            categoria: categoria.includes('SENIOR') ? 'Senior' : categoria.includes('JUNIOR') ? 'Junior' : 'Cadete',
            equipo: atleta2.equipo
          })
          .select('id')
          .single()
        atleta2Id = nuevoAtleta2?.id
      }

      if (!atleta1Id || !atleta2Id) {
        throw new Error('No se pudieron crear o encontrar los atletas')
      }

      // Determinar ganador
      const ganadorId = atletaGanador === 1 ? atleta1Id : atletaGanador === 2 ? atleta2Id : null
      
      // Crear el combate
      const { data: combateCreado, error: errorCombate } = await supabase
        .from('combates_individuales')
        .insert({
          atleta1_id: atleta1Id,
          atleta2_id: atleta2Id,
          ganador_id: ganadorId,
          puntos_atleta1: obtenerPuntosTotales(1),
          puntos_atleta2: obtenerPuntosTotales(2),
          categoria: categoria.includes('SENIOR') ? 'Senior' : categoria.includes('JUNIOR') ? 'Junior' : 'Cadete',
          estado: 'finalizado',
          fecha_combate: new Date().toISOString(),
          duracion_minutos: categoria.includes('SENIOR') ? 3 : categoria.includes('JUNIOR') ? 2 : 1.5
        })
        .select('id')
        .single()

      if (errorCombate) {
        throw errorCombate
      }

      // Actualizar rankings si hay ganador
      if (ganadorId) {
        const perdedorId = ganadorId === atleta1Id ? atleta2Id : atleta1Id
        
        await Promise.all([
          supabase.rpc('actualizar_ranking_atleta', {
            p_atleta_id: ganadorId,
            p_resultado: 'victoria',
            p_puntos: 3
          }),
          supabase.rpc('actualizar_ranking_atleta', {
            p_atleta_id: perdedorId,
            p_resultado: 'derrota',
            p_puntos: 0
          })
        ])

        await supabase.rpc('recalcular_posiciones_atletas')
      }

      toast({
        title: "Combate guardado",
        description: `El resultado del combate se ha guardado correctamente en la base de datos.`,
      })

    } catch (error) {
      console.error('Error al guardar combate:', error)
      toast({
        title: "Error al guardar",
        description: "No se pudo guardar el combate en la base de datos. El resultado se mantiene en el panel.",
        variant: "destructive"
      })
    } finally {
      setGuardandoCombate(false)
    }
  }

  /** Finaliza la competencia */
  const finalizarCompetencia = () => {
    // Primero verificar descalificaciones (incluyendo Hansoku de C1 y C2)
    const atleta1Descalificado = atleta1C1.kiken || atleta1C1.shikkaku || atleta1C1.h || atleta1C2.h
    const atleta2Descalificado = atleta2C1.kiken || atleta2C1.shikkaku || atleta2C1.h || atleta2C2.h

    if (atleta1Descalificado && !atleta2Descalificado) {
      const razon = atleta1C1.kiken ? "KIKEN" : atleta1C1.shikkaku ? "SHIKKAKU" : "HANSOKU"
      declararGanador(2, razon)
    } else if (atleta2Descalificado && !atleta1Descalificado) {
      const razon = atleta2C1.kiken ? "KIKEN" : atleta2C1.shikkaku ? "SHIKKAKU" : "HANSOKU"
      declararGanador(1, razon)
    } else if (atleta1Descalificado && atleta2Descalificado) {
      // Ambos descalificados - determinar tipo de doble descalificación
      const razonAtleta1 = atleta1C1.kiken ? "KIKEN" : atleta1C1.shikkaku ? "SHIKKAKU" : "HANSOKU"
      const razonAtleta2 = atleta2C1.kiken ? "KIKEN" : atleta2C1.shikkaku ? "SHIKKAKU" : "HANSOKU"

      if (razonAtleta1 === "KIKEN" && razonAtleta2 === "KIKEN") {
        // Doble KIKEN - resolver por puntos acumulados o Hantei si empate
        const total1 = obtenerPuntosTotales(1)
        const total2 = obtenerPuntosTotales(2)
        if (total1 > total2) {
          declararGanador(1, "Doble KIKEN - Puntos")
        } else if (total2 > total1) {
          declararGanador(2, "Doble KIKEN - Puntos")
        } else {
          setMostrarHantei(true)
        }
      } else {
        // Otras dobles descalificaciones (ej: doble SHIKKAKU, doble HANSOKU, mixtas) - combate nulo
        declararGanador(0, "Doble Descalificación")
      }
    } else {
      // Ninguno descalificado, proceder con lógica normal
      if (mostrarHantei) {
        // Si Hantei está activo, mostrar diálogo con votos de los jueces
        setMostrarDialogoVotos(true)
        setMostrarHantei(false)
      } else {
        // Si no hay Hantei, verificar puntos
        const total1 = obtenerPuntosTotales(1)
        const total2 = obtenerPuntosTotales(2)
        if (total1 > total2) {
          declararGanador(1, "Puntos")
        } else if (total2 > total1) {
          declararGanador(2, "Puntos")
        } else {
          setMostrarHantei(true)
        }
      }
    }
    setEstaEjecutandose(false)
  }

  /** Reinicia completamente el combate a valores iniciales */
  const reiniciarCombate = () => {
    setPuntosAtleta1({ yuko: 0, wazaari: 0, ippon: 0 })
    setPuntosAtleta2({ yuko: 0, wazaari: 0, ippon: 0 })
    setAtleta1C1({ c: false, k: false, hc: false, h: false, kiken: false, shikkaku: false })
    setAtleta1C2({ c: false, k: false, hc: false, h: false, kiken: false, shikkaku: false })
    setAtleta2C1({ c: false, k: false, hc: false, h: false, kiken: false, shikkaku: false })
    setAtleta2C2({ c: false, k: false, hc: false, h: false, kiken: false, shikkaku: false })
    setTiempo(obtenerTiempoCategoria(categoria))
    setEstaEjecutandose(false)
    setVotosAtleta1(0)
    setVotosAtleta2(0)
    setAtleta1Gana(false)
    setAtleta2Gana(false)
    setGanador({ atleta: 0, razon: '' })
    setMostrarDialogoGanador(false)
    setSenshu(null)
    setPanelDeshabilitado(false)
  }

  // ========== RENDER ==========
  if (!montado) {
    return null
  }

return (
  <TooltipProvider>
    <div className={`min-h-screen bg-cover bg-center bg-no-repeat relative overflow-hidden ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`} style={{ backgroundImage: `linear-gradient(${theme === 'dark' ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.8)'}, ${theme === 'dark' ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.8)'}), url("/karate-bg.jpg")` }}>

      {/* Elementos decorativos de fondo */}
      <div className={`absolute inset-0 bg-linear-to-br ${theme === 'dark' ? 'from-blue-900/20 via-transparent to-red-900/20' : 'from-blue-100/30 via-transparent to-red-100/30'}`}></div>
      <div className={`absolute top-0 left-0 w-full h-full`} style={{ background: `radial-gradient(circle at 30% 20%, ${theme === 'dark' ? 'rgba(59,130,246,0.1)' : 'rgba(59,130,246,0.05)'}, transparent 50%)` }}></div>
      <div className={`absolute top-0 right-0 w-full h-full`} style={{ background: `radial-gradient(circle at 70% 80%, ${theme === 'dark' ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.05)'}, transparent 50%)` }}></div>

      {/* ===== HEADER: TÍTULO DEL PANEL ===== */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative bg-linear-to-r from-gray-900 via-gray-800 to-black text-white py-1 px-4 border-b-2 border-gradient-to-r from-blue-600 to-red-600 shadow-lg"
      >
        <div className="container mx-auto relative">
          <div className="flex items-center justify-center gap-2">
            <Star className="h-5 w-5 text-yellow-400 animate-pulse" />
            <h1 className="text-2xl font-black tracking-wider text-center bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent">
              PANEL DE CONTROL | JUEZ O ÁRBITRO
            </h1>
            <Star className="h-5 w-5 text-yellow-400 animate-pulse" />
          </div>
          <div className="absolute top-1 left-2">
            <Zap className="h-4 w-4 text-blue-400 opacity-60" />
          </div>
          <div className="absolute top-1 right-2 flex gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => setSonidoActivado(!sonidoActivado)}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10 p-1"
                >
                  {sonidoActivado ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {sonidoActivado ? "Desactivar sonidos" : "Activar sonidos"}
              </TooltipContent>
            </Tooltip>
            <Zap className="h-4 w-4 text-red-400 opacity-60" />
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-1 max-w-6xl relative">

        {/* ===== SECCIÓN: MARCADOR CENTRAL Y CRONÓMETRO ===== */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-4"
        >
          <Card className="bg-gradient-to-br from-black/90 to-gray-900/90 border-4 border-gradient-to-r from-gray-600 to-gray-800 shadow-2xl backdrop-blur-sm">
            <CardContent className="p-3">
              <div className="grid grid-cols-3 gap-4 items-center">

                {/* Puntaje Atleta 1 - Más Centrado */}
                <motion.div
                  className="text-center relative"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-blue-800/20 rounded-full blur-xl"></div>
                  <motion.div
                    key={obtenerPuntosTotales(1)}
                    initial={{ scale: 1.2, color: "#3b82f6" }}
                    animate={{ scale: 1, color: "#3b82f6" }}
                    transition={{ duration: 0.3 }}
                    className="text-8xl font-black text-blue-400 relative drop-shadow-2xl"
                  >
                    {obtenerPuntosTotales(1)}
                  </motion.div>
                  <div className="text-lg text-blue-300 font-bold mt-4 tracking-wider">ATLETA 1</div>
                </motion.div>

                {/* Centro: Cronómetro, Categoría y Controles */}
                <div className="text-center space-y-6 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-full blur-2xl"></div>

                  {/* Cronómetro */}
                  <motion.div
                    className="text-sm text-gray-300 font-bold tracking-wider"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    TIEMPO RESTANTE
                  </motion.div>
                  <motion.div
                    className={`text-7xl font-black relative ${tiempo <= 10 && tiempo > 0 ? 'text-red-400 animate-pulse' : 'text-white'} drop-shadow-2xl`}
                    animate={tiempo <= 10 && tiempo > 0 ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.5, repeat: tiempo <= 10 && tiempo > 0 ? Infinity : 0 }}
                  >
                    {formatearTiempo(tiempo)}
                  </motion.div>

                  {/* Selector de Categoría - Más Prominente */}
                  <div className="flex gap-3 justify-center relative z-10">
                    <Select value={categoria} onValueChange={(valor) => {
                      setCategoria(valor)
                      setTiempo(obtenerTiempoCategoria(valor))
                      setEstaEjecutandose(false)
                    }}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SelectTrigger className="w-56 bg-gradient-to-r from-gray-800 to-gray-700 text-white border-2 border-gray-600 hover:border-gray-500 transition-all duration-300 shadow-lg text-lg py-3">
                            <SelectValue />
                          </SelectTrigger>
                        </TooltipTrigger>
                        <TooltipContent>
                          Seleccionar categoría de combate
                        </TooltipContent>
                      </Tooltip>
                      <SelectContent className="bg-gray-800 border-gray-600 z-50">
                        <SelectItem value="SENIOR (3 min)" className="text-white hover:bg-gray-700 text-lg py-3">SENIOR (3 min)</SelectItem>
                        <SelectItem value="JUNIOR (2 min)" className="text-white hover:bg-gray-700 text-lg py-3">JUNIOR (2 min)</SelectItem>
                        <SelectItem value="CADETE (1.5 min)" className="text-white hover:bg-gray-700 text-lg py-3">CADETE (1.5 min)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Controles de Play/Stop/Reset */}
                  <motion.div
                    className="flex gap-3 justify-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() => setEstaEjecutandose(!estaEjecutandose)}
                          disabled={panelDeshabilitado}
                          className={`${estaEjecutandose ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-red-500/50' : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-green-500/50'} font-bold shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
                          size="lg"
                        >
                          {estaEjecutandose ? <><Pause className="mr-2 h-5 w-5" /> DETENER</> : <><Play className="mr-2 h-5 w-5" /> INICIAR</>}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {estaEjecutandose ? "Detener el cronómetro" : "Iniciar el cronómetro"}
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button onClick={() => {
                          setTiempo(obtenerTiempoCategoria(categoria))
                          setEstaEjecutandose(false)
                        }} disabled={panelDeshabilitado} variant="outline" size="lg" className="font-bold border-2 border-gray-600 hover:border-gray-500 hover:bg-gray-800 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                          <RotateCcw className="mr-2 h-5 w-5" /> REINICIAR
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Reiniciar tiempo al valor inicial
                      </TooltipContent>
                    </Tooltip>
                  </motion.div>
                </div>

                {/* Puntaje Atleta 2 - Más Centrado */}
                <motion.div
                  className="text-center relative"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 to-red-800/20 rounded-full blur-xl"></div>
                  <motion.div
                    key={obtenerPuntosTotales(2)}
                    initial={{ scale: 1.2, color: "#ef4444" }}
                    animate={{ scale: 1, color: "#ef4444" }}
                    transition={{ duration: 0.3 }}
                    className="text-9xl font-black text-red-400 relative drop-shadow-2xl"
                  >
                    {obtenerPuntosTotales(2)}
                  </motion.div>
                  <div className="text-lg text-red-300 font-bold mt-4 tracking-wider">ATLETA 2</div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ===== SECCIÓN: CONTROLES DE ATLETAS ===== */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          
          {/* ===== ATLETA 1 (AZUL) ===== */}
          <Card className="bg-black/80 border-4 border-blue-600">
            
            {/* Header con Avatar e Información */}
            <CardHeader className="bg-blue-600 pb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-blue-800 flex items-center justify-center text-white font-black text-2xl">
                  {obtenerIniciales(atleta1.nombre)}
                </div>
                <div className="text-white">
                  <div className="font-black text-xl">{atleta1.nombre}</div>
                  <div className="text-sm">{atleta1.equipo}</div>
                  <div className="text-xs opacity-90">{atleta1.ubicacion}</div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-4 space-y-4">
              
              {/* Botones de Puntuación: Ippon, Waza-ari, Yuko y Restar */}
              <div className="grid grid-cols-4 gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={() => agregarPunto(1, 'ippon')} disabled={panelDeshabilitado} className="bg-blue-600 hover:bg-blue-700 font-bold disabled:opacity-50 disabled:cursor-not-allowed">
                      IPPON
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Otorgar Ippon (3 puntos) - Técnica perfecta
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={() => agregarPunto(1, 'wazaari')} disabled={panelDeshabilitado} className="bg-blue-600 hover:bg-blue-700 font-bold disabled:opacity-50 disabled:cursor-not-allowed">
                      WAZA-ARI
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Otorgar Waza-ari (2 puntos) - Técnica buena
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={() => agregarPunto(1, 'yuko')} disabled={panelDeshabilitado} className="bg-blue-600 hover:bg-blue-700 font-bold disabled:opacity-50 disabled:cursor-not-allowed">
                      YUKO
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Otorgar Yuko (1 punto) - Técnica básica
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={() => restarPunto(1)} disabled={panelDeshabilitado} variant="destructive" className="font-bold disabled:opacity-50 disabled:cursor-not-allowed">
                      RESTAR
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Restar el punto más alto (corrección)
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* Sistema de Penalizaciones */}
              <div className="space-y-3">
                
                {/* Categoría 1: Contacto excesivo, zonas prohibidas */}
                <div className="bg-blue-950/50 p-3 rounded border-2 border-blue-700">
                  <div className="text-blue-400 font-bold mb-2">CATEGORÍA 1</div>
                  <div className="grid grid-cols-4 gap-2">
                    <label className="flex items-center space-x-2 text-white">
                      <Checkbox checked={atleta1C1.c} onCheckedChange={(marcado) => aplicarPenalizacionC1(1, 'c', marcado as boolean)} />
                      <span className="text-sm font-bold">C</span>
                    </label>
                    <label className="flex items-center space-x-2 text-white">
                      <Checkbox checked={atleta1C1.k} disabled={!atleta1C1.c} onCheckedChange={(marcado) => aplicarPenalizacionC1(1, 'k', marcado as boolean)} />
                      <span className="text-sm font-bold">K</span>
                    </label>
                    <label className="flex items-center space-x-2 text-white">
                      <Checkbox checked={atleta1C1.hc} disabled={!atleta1C1.k} onCheckedChange={(marcado) => aplicarPenalizacionC1(1, 'hc', marcado as boolean)} />
                      <span className="text-sm font-bold">HC</span>
                    </label>
                    <label className="flex items-center space-x-2 text-white">
                      <Checkbox checked={atleta1C1.h} disabled={!atleta1C1.hc} onCheckedChange={(marcado) => aplicarPenalizacionC1(1, 'h', marcado as boolean)} />
                      <span className="text-sm font-bold">H</span>
                    </label>
                  </div>
                </div>

                <div className="bg-blue-950/50 p-3 rounded border-2 border-blue-700">
                  <div className="text-blue-400 font-bold mb-2">CATEGORÍA 2</div>
                  <div className="grid grid-cols-4 gap-2">
                    <label className="flex items-center space-x-2 text-white">
                      <Checkbox checked={atleta1C2.c} onCheckedChange={(marcado) => aplicarPenalizacionC2(1, 'c', marcado as boolean)} />
                      <span className="text-sm font-bold">C</span>
                    </label>
                    <label className="flex items-center space-x-2 text-white">
                      <Checkbox checked={atleta1C2.k} disabled={!atleta1C2.c} onCheckedChange={(marcado) => aplicarPenalizacionC2(1, 'k', marcado as boolean)} />
                      <span className="text-sm font-bold">K</span>
                    </label>
                    <label className="flex items-center space-x-2 text-white">
                      <Checkbox checked={atleta1C2.hc} disabled={!atleta1C2.k} onCheckedChange={(marcado) => aplicarPenalizacionC2(1, 'hc', marcado as boolean)} />
                      <span className="text-sm font-bold">HC</span>
                    </label>
                    <label className="flex items-center space-x-2 text-white">
                      <Checkbox checked={atleta1C2.h} disabled={!atleta1C2.hc} onCheckedChange={(marcado) => aplicarPenalizacionC2(1, 'h', marcado as boolean)} />
                      <span className="text-sm font-bold">H</span>
                    </label>
                  </div>
                </div>

                <div className="bg-red-950/50 p-3 rounded border-2 border-red-700">
                  <div className="text-red-400 font-bold mb-2">DESCALIFICACIÓN</div>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center space-x-2 text-white">
                      <Checkbox checked={atleta1C1.kiken} onCheckedChange={(marcado) => {
                        if (marcado) {
                          setAtletaDescalificar(1)
                          setTipoDescalificacion('kiken')
                          setMostrarAlertaDescalificacion(true)
                        } else {
                          setAtleta1C1(prev => ({ ...prev, kiken: false }))
                        }
                      }} />
                      <span className="text-sm font-bold">KIKEN</span>
                    </label>
                    <label className="flex items-center space-x-2 text-white">
                      <Checkbox checked={atleta1C1.shikkaku} onCheckedChange={(marcado) => {
                        if (marcado) {
                          setAtletaDescalificar(1)
                          setTipoDescalificacion('shikkaku')
                          setMostrarAlertaDescalificacion(true)
                        } else {
                          setAtleta1C1(prev => ({ ...prev, shikkaku: false }))
                        }
                      }} />
                      <span className="text-sm font-bold">SHIKKAKU</span>
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ATLETA 2 (ROJO) */}
          <Card className="bg-black/80 border-4 border-red-600">
            <CardHeader className="bg-red-600 pb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-red-800 flex items-center justify-center text-white font-black text-2xl">
                  {obtenerIniciales(atleta2.nombre)}
                </div>
                <div className="text-white">
                  <div className="font-black text-xl">{atleta2.nombre}</div>
                  <div className="text-sm">{atleta2.equipo}</div>
                  <div className="text-xs opacity-90">{atleta2.ubicacion}</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* Botones de Puntuación */}
              <div className="grid grid-cols-4 gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={() => agregarPunto(2, 'ippon')} disabled={panelDeshabilitado} className="bg-red-600 hover:bg-red-700 font-bold disabled:opacity-50 disabled:cursor-not-allowed">
                      IPPON
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Otorgar Ippon (3 puntos) - Técnica perfecta
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={() => agregarPunto(2, 'wazaari')} disabled={panelDeshabilitado} className="bg-red-600 hover:bg-red-700 font-bold disabled:opacity-50 disabled:cursor-not-allowed">
                      WAZA-ARI
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Otorgar Waza-ari (2 puntos) - Técnica buena
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={() => agregarPunto(2, 'yuko')} disabled={panelDeshabilitado} className="bg-red-600 hover:bg-red-700 font-bold disabled:opacity-50 disabled:cursor-not-allowed">
                      YUKO
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Otorgar Yuko (1 punto) - Técnica básica
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={() => restarPunto(2)} disabled={panelDeshabilitado} variant="destructive" className="font-bold disabled:opacity-50 disabled:cursor-not-allowed">
                      RESTAR
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Restar el punto más alto (corrección)
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* Penalizaciones */}
              <div className="space-y-3">
                <div className="bg-red-950/50 p-3 rounded border-2 border-red-700">
                  <div className="text-red-400 font-bold mb-2">CATEGORÍA 1</div>
                  <div className="grid grid-cols-4 gap-2">
                    <label className="flex items-center space-x-2 text-white">
                      <Checkbox checked={atleta2C1.c} disabled={panelDeshabilitado} onCheckedChange={(marcado) => aplicarPenalizacionC1(2, 'c', marcado as boolean)} />
                      <span className="text-sm font-bold">C</span>
                    </label>
                    <label className="flex items-center space-x-2 text-white">
                      <Checkbox checked={atleta2C1.k} disabled={!atleta2C1.c || panelDeshabilitado} onCheckedChange={(marcado) => aplicarPenalizacionC1(2, 'k', marcado as boolean)} />
                      <span className="text-sm font-bold">K</span>
                    </label>
                    <label className="flex items-center space-x-2 text-white">
                      <Checkbox checked={atleta2C1.hc} disabled={!atleta2C1.k || panelDeshabilitado} onCheckedChange={(marcado) => aplicarPenalizacionC1(2, 'hc', marcado as boolean)} />
                      <span className="text-sm font-bold">HC</span>
                    </label>
                    <label className="flex items-center space-x-2 text-white">
                      <Checkbox checked={atleta2C1.h} disabled={!atleta2C1.hc || panelDeshabilitado} onCheckedChange={(marcado) => aplicarPenalizacionC1(2, 'h', marcado as boolean)} />
                      <span className="text-sm font-bold">H</span>
                    </label>
                  </div>
                </div>

                <div className="bg-red-950/50 p-3 rounded border-2 border-red-700">
                  <div className="text-red-400 font-bold mb-2">CATEGORÍA 2</div>
                  <div className="grid grid-cols-4 gap-2">
                    <label className="flex items-center space-x-2 text-white">
                      <Checkbox checked={atleta2C2.c} disabled={panelDeshabilitado} onCheckedChange={(marcado) => aplicarPenalizacionC2(2, 'c', marcado as boolean)} />
                      <span className="text-sm font-bold">C</span>
                    </label>
                    <label className="flex items-center space-x-2 text-white">
                      <Checkbox checked={atleta2C2.k} disabled={!atleta2C2.c || panelDeshabilitado} onCheckedChange={(marcado) => aplicarPenalizacionC2(2, 'k', marcado as boolean)} />
                      <span className="text-sm font-bold">K</span>
                    </label>
                    <label className="flex items-center space-x-2 text-white">
                      <Checkbox checked={atleta2C2.hc} disabled={!atleta2C2.k || panelDeshabilitado} onCheckedChange={(marcado) => aplicarPenalizacionC2(2, 'hc', marcado as boolean)} />
                      <span className="text-sm font-bold">HC</span>
                    </label>
                    <label className="flex items-center space-x-2 text-white">
                      <Checkbox checked={atleta2C2.h} disabled={!atleta2C2.hc || panelDeshabilitado} onCheckedChange={(marcado) => aplicarPenalizacionC2(2, 'h', marcado as boolean)} />
                      <span className="text-sm font-bold">H</span>
                    </label>
                  </div>
                </div>

                <div className="bg-red-950/50 p-3 rounded border-2 border-red-700">
                  <div className="text-red-400 font-bold mb-2">DESCALIFICACIÓN</div>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center space-x-2 text-white">
                      <Checkbox checked={atleta2C1.kiken} disabled={panelDeshabilitado} onCheckedChange={(marcado) => {
                        if (marcado) {
                          setAtletaDescalificar(2)
                          setTipoDescalificacion('kiken')
                          setMostrarAlertaDescalificacion(true)
                        } else {
                          setAtleta2C1(prev => ({ ...prev, kiken: false }))
                        }
                      }} />
                      <span className="text-sm font-bold">KIKEN</span>
                    </label>
                    <label className="flex items-center space-x-2 text-white">
                      <Checkbox checked={atleta2C1.shikkaku} disabled={panelDeshabilitado} onCheckedChange={(marcado) => {
                        if (marcado) {
                          setAtletaDescalificar(2)
                          setTipoDescalificacion('shikkaku')
                          setMostrarAlertaDescalificacion(true)
                        } else {
                          setAtleta2C1(prev => ({ ...prev, shikkaku: false }))
                        }
                      }} />
                      <span className="text-sm font-bold">SHIKKAKU</span>
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel de Votación Hantei */}
        <Card className="bg-black/80 border-2 border-yellow-500 mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-yellow-400 text-lg font-black">HANTEI - VOTACIÓN DE JUECES</CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <div className="grid grid-cols-2 gap-4">
              {/* Atleta 1 Votos */}
              <div className="text-center space-y-2">
                <div className="text-blue-400 font-bold text-sm">ATLETA 1</div>
                <div className="flex gap-1 justify-center items-center">
                  <Button onClick={() => { setVotosAtleta1(Math.max(0, votosAtleta1 - 1)); setMostrarHantei(false); }} disabled={panelDeshabilitado} variant="outline" size="sm">
                    <Minus className="h-3 w-3" />
                  </Button>
                  <div className="text-2xl font-black text-white w-12">{votosAtleta1}</div>
                  <Button onClick={() => { setVotosAtleta1(votosAtleta1 + 1); setMostrarHantei(false); }} disabled={panelDeshabilitado} variant="outline" size="sm">
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Atleta 2 Votos */}
              <div className="text-center space-y-2">
                <div className="text-red-400 font-bold text-sm">ATLETA 2</div>
                <div className="flex gap-1 justify-center items-center">
                  <Button onClick={() => { setVotosAtleta2(Math.max(0, votosAtleta2 - 1)); setMostrarHantei(false); }} disabled={panelDeshabilitado} variant="outline" size="sm">
                    <Minus className="h-3 w-3" />
                  </Button>
                  <div className="text-2xl font-black text-white w-12">{votosAtleta2}</div>
                  <Button onClick={() => { setVotosAtleta2(votosAtleta2 + 1); setMostrarHantei(false); }} disabled={panelDeshabilitado} variant="outline" size="sm">
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botones de Control */}
        <div className="grid grid-cols-2 gap-6">
          <AlertDialog open={mostrarAlertaReiniciar} onOpenChange={setMostrarAlertaReiniciar}>
            <AlertDialogTrigger asChild>
              <Button className="bg-red-600 hover:bg-red-700 font-black text-xl py-8" size="lg">
                REINICIAR COMBATE
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-gray-900 border-2 border-red-600">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-red-400 font-black text-xl">CONFIRMAR REINICIO</AlertDialogTitle>
                <AlertDialogDescription className="text-gray-300 text-lg">
                  Esta acción reiniciará completamente el combate, eliminando todos los puntos, penalizaciones y configuraciones actuales. ¿Está seguro de que desea continuar?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-gray-700 hover:bg-gray-600 text-white">
                  CANCELAR
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    reiniciarCombate()
                    setMostrarAlertaReiniciar(false)
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold"
                >
                  CONFIRMAR REINICIO
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog open={mostrarAlertaFinalizar} onOpenChange={setMostrarAlertaFinalizar}>
            <AlertDialogTrigger asChild>
              <Button disabled={mostrarDialogoGanador || panelDeshabilitado} className="bg-green-600 hover:bg-green-700 font-black text-xl py-8 disabled:opacity-50 disabled:cursor-not-allowed" size="lg">
                FINALIZAR COMPETENCIA
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-gray-900 border-2 border-green-600">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-green-400 font-black text-xl">CONFIRMAR FINALIZACIÓN</AlertDialogTitle>
                <AlertDialogDescription className="text-gray-300 text-lg">
                  Esta acción finalizará la competencia y declarará al ganador basado en los puntos actuales y penalizaciones. ¿Está seguro de que desea continuar?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-gray-700 hover:bg-gray-600 text-white">
                  CANCELAR
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    finalizarCompetencia()
                    setMostrarAlertaFinalizar(false)
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold"
                >
                  CONFIRMAR FINALIZACIÓN
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog open={mostrarAlertaDescalificacion} onOpenChange={setMostrarAlertaDescalificacion}>
            <AlertDialogContent className="bg-gray-900 border-2 border-red-600">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-red-400 font-black text-xl">CONFIRMAR DESCALIFICACIÓN</AlertDialogTitle>
                <AlertDialogDescription className="text-gray-300 text-lg">
                  ¿Está seguro de descalificar al atleta {atletaDescalificar === 1 ? atleta1.nombre : atleta2.nombre} por {tipoDescalificacion === 'kiken' ? 'KIKEN' : 'SHIKKAKU'}?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-gray-700 hover:bg-gray-600 text-white">
                  CANCELAR
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    if (atletaDescalificar === 1) {
                      setAtleta1C1(prev => ({ ...prev, kiken: tipoDescalificacion === 'kiken', shikkaku: tipoDescalificacion === 'shikkaku' }))
                      if (tipoDescalificacion === 'kiken') {
                        // KIKEN: Agregar 4 YUKO al oponente (Atleta 2)
                        setPuntosAtleta2(prev => ({ ...prev, yuko: prev.yuko + 4 }))
                      }
                      declararGanador(2, tipoDescalificacion === 'kiken' ? 'KIKEN' : 'SHIKKAKU')
                    } else {
                      setAtleta2C1(prev => ({ ...prev, kiken: tipoDescalificacion === 'kiken', shikkaku: tipoDescalificacion === 'shikkaku' }))
                      if (tipoDescalificacion === 'kiken') {
                        // KIKEN: Agregar 4 YUKO al oponente (Atleta 1)
                        setPuntosAtleta1(prev => ({ ...prev, yuko: prev.yuko + 4 }))
                      }
                      declararGanador(1, tipoDescalificacion === 'kiken' ? 'KIKEN' : 'SHIKKAKU')
                    }
                    setPanelDeshabilitado(true)
                    setMostrarAlertaDescalificacion(false)
                    setAtletaDescalificar(null)
                    setTipoDescalificacion(null)
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold"
                >
                  CONFIRMAR DESCALIFICACIÓN
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Diálogo: Ganador */}
      <Dialog open={mostrarDialogoGanador} onOpenChange={setMostrarDialogoGanador}>
        <DialogContent className="max-w-lg bg-linear-to-br from-black via-gray-900 to-black border-4 border-yellow-500 shadow-2xl backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-black text-yellow-400 mb-4 flex items-center justify-center gap-4">
              {ganador.atleta === 0 ? (
                <>
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    ⚠️
                  </motion.div>
                  COMBATE NULO
                  <motion.div
                    animate={{ rotate: [0, -360] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    ⚠️
                  </motion.div>
                </>
              ) : ganador.razon.includes('Doble KIKEN') ? (
                <>
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    🏥
                  </motion.div>
                  DOBLE KIKEN RESUELTO
                  <motion.div
                    animate={{ rotate: [0, -360] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    🏥
                  </motion.div>
                </>
              ) : (
                <>
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    🏆
                  </motion.div>
                  <motion.div
                    animate={{ rotate: [0, -360] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    🏆
                  </motion.div>
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          <motion.div
            className="text-center space-y-4 py-4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {ganador.atleta === 0 ? (
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="mx-auto h-16 w-16 text-red-500 text-6xl">🚫</div>
              </motion.div>
            ) : (
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Trophy className={`mx-auto h-16 w-16 ${ganador.atleta === 1 ? 'text-blue-600' : 'text-red-600'} drop-shadow-2xl`} />
              </motion.div>
            )}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8, delay: 0.5, type: "spring", stiffness: 200 }}
            >
              {ganador.atleta === 0 ? (
                <div className="text-center space-y-4">
                  <div className="text-2xl text-red-400 font-bold tracking-wider">DOBLE DESCALIFICACIÓN</div>
                  <div className="text-lg text-gray-300">
                    Ambos competidores han sido descalificados
                  </div>
                  <div className="text-sm text-gray-400 mt-4">
                    Ninguno avanza a la siguiente ronda
                  </div>
                </div>
              ) : (
                <>
                  <div className={`text-3xl font-black ${ganador.atleta === 1 ? 'text-blue-400' : 'text-red-400'} drop-shadow-2xl`}>
                    GANADOR: {ganador.atleta === 1 ? atleta1.nombre : atleta2.nombre}
                  </div>
                  <div className="text-2xl text-yellow-400 font-bold mt-4 tracking-wider">{ganador.razon}</div>
                  {guardandoCombate && (
                    <div className="text-sm text-gray-400 mt-2 animate-pulse">
                      💾 Guardando resultado en la base de datos...
                    </div>
                  )}
                </>
              )}
            </motion.div>
            <motion.div
              className="text-center space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              {ganador.razon.includes('Hantei') ? (
                <>
                  <div className="text-lg text-gray-300 font-bold">VOTOS DE LOS JUECES</div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-blue-300">
                      <div className="font-bold">{atleta1.nombre}</div>
                      <div>Votos: {votosAtleta1}</div>
                    </div>
                    <div className="text-red-300">
                      <div className="font-bold">{atleta2.nombre}</div>
                      <div>Votos: {votosAtleta2}</div>
                    </div>
                  </div>
                </>
              ) : ganador.atleta !== 0 ? (
                <>
                  <div className="text-lg text-gray-300 font-bold">PUNTOS DETALLADOS DEL GANADOR</div>
                  <div className="text-center">
                    <div className={ganador.atleta === 1 ? 'text-blue-300' : 'text-red-300'}>
                      <div className="font-bold text-xl">{ganador.atleta === 1 ? atleta1.nombre : atleta2.nombre}</div>
                      <div>Yuko: {ganador.atleta === 1 ? puntosAtleta1.yuko : puntosAtleta2.yuko}</div>
                      <div>Waza-ari: {ganador.atleta === 1 ? puntosAtleta1.wazaari : puntosAtleta2.wazaari}</div>
                      <div>Ippon: {ganador.atleta === 1 ? puntosAtleta1.ippon : puntosAtleta2.ippon}</div>
                    </div>
                  </div>
                  <div className="text-lg text-gray-300 font-bold">PENALIZACIONES DETALLADAS</div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-blue-300">
                      <div className="font-bold">{atleta1.nombre}</div>
                      <div>C1: {(atleta1C1.c ? 'C ' : '') + (atleta1C1.k ? 'K ' : '') + (atleta1C1.hc ? 'HC ' : '') + (atleta1C1.h ? 'H ' : '') || 'Ninguna'}</div>
                      <div>C2: {(atleta1C2.c ? 'C ' : '') + (atleta1C2.k ? 'K ' : '') + (atleta1C2.hc ? 'HC ' : '') + (atleta1C2.h ? 'H ' : '') || 'Ninguna'}</div>
                      <div>Desc: {(atleta1C1.kiken ? 'KIKEN ' : '') + (atleta1C1.shikkaku ? 'SHIKKAKU ' : '') || 'Ninguna'}</div>
                    </div>
                    <div className="text-red-300">
                      <div className="font-bold">{atleta2.nombre}</div>
                      <div>C1: {(atleta2C1.c ? 'C ' : '') + (atleta2C1.k ? 'K ' : '') + (atleta2C1.hc ? 'HC ' : '') + (atleta2C1.h ? 'H ' : '') || 'Ninguna'}</div>
                      <div>C2: {(atleta2C2.c ? 'C ' : '') + (atleta2C2.k ? 'K ' : '') + (atleta2C2.hc ? 'HC ' : '') + (atleta2C2.h ? 'H ' : '') || 'Ninguna'}</div>
                      <div>Desc: {(atleta2C1.kiken ? 'KIKEN ' : '') + (atleta2C1.shikkaku ? 'SHIKKAKU ' : '') || 'Ninguna'}</div>
                    </div>
                  </div>
                </>
              ) : null}
            </motion.div>
            <motion.div
              className="text-4xl font-black text-white bg-linear-to-r from-gray-800 to-gray-900 rounded-xl py-3 px-6 border-4 border-yellow-500 shadow-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              {ganador.razon.includes('Hantei') ? `${votosAtleta1} - ${votosAtleta2}` : `${obtenerPuntosTotales(1)} - ${obtenerPuntosTotales(2)}`}
            </motion.div>
            
            {/* Botones de acción */}
            <motion.div
              className="flex gap-4 justify-center mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
            >
              <Button
                onClick={() => {
                  setMostrarDialogoGanador(false)
                  reiniciarCombate()
                }}
                className="bg-blue-600 hover:bg-blue-700 font-bold text-lg py-3 px-6"
              >
                NUEVO COMBATE
              </Button>
              <Button
                onClick={() => {
                  router.push('/admin/combates')
                }}
                disabled={guardandoCombate}
                className="bg-green-600 hover:bg-green-700 font-bold text-lg py-3 px-6 disabled:opacity-50"
              >
                {guardandoCombate ? 'GUARDANDO...' : 'VER RESULTADOS'}
              </Button>
            </motion.div>
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* Diálogo: Hantei */}
      <Dialog open={mostrarHantei && (votosAtleta1 + votosAtleta2) === 0} onOpenChange={setMostrarHantei}>
        <DialogContent className="max-w-xl bg-black border-4 border-yellow-500">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black text-center text-yellow-400">EMPATE - HANTEI REQUERIDO</DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <p className="text-white text-lg mb-4">Los puntos están empatados. Use el panel de votación para determinar el ganador.</p>
            <Button onClick={() => setMostrarHantei(false)} variant="outline" className="font-bold">
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo: Votos de los Jueces */}
      <Dialog open={mostrarDialogoVotos} onOpenChange={setMostrarDialogoVotos}>
        <DialogContent className="max-w-lg bg-linear-to-br from-black via-gray-900 to-black border-4 border-yellow-500 shadow-2xl backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-black text-yellow-400 mb-4 flex items-center justify-center gap-4">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                ⚖️
              </motion.div>
              VOTOS DE LOS JUECES
              <motion.div
                animate={{ rotate: [0, -360] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                ⚖️
              </motion.div>
            </DialogTitle>
          </DialogHeader>
          <motion.div
            className="text-center space-y-6 py-8"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="text-lg text-gray-300 font-bold">RESULTADO DE LA VOTACIÓN</div>
            <div className="grid grid-cols-2 gap-8 text-center">
              <div className="space-y-4">
                <div className="text-blue-400 font-bold text-xl">{atleta1.nombre}</div>
                <motion.div
                  className="text-6xl font-black text-blue-400"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.5, type: "spring", stiffness: 200 }}
                >
                  {votosAtleta1}
                </motion.div>
                <div className="text-sm text-gray-400">VOTOS</div>
              </div>
              <div className="space-y-4">
                <div className="text-red-400 font-bold text-xl">{atleta2.nombre}</div>
                <motion.div
                  className="text-6xl font-black text-red-400"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.5, type: "spring", stiffness: 200 }}
                >
                  {votosAtleta2}
                </motion.div>
                <div className="text-sm text-gray-400">VOTOS</div>
              </div>
            </div>
            <div className="text-center space-y-4">
              <div className="text-lg text-yellow-400 font-bold">
                {votosAtleta1 > votosAtleta2 ? `GANADOR: ${atleta1.nombre}` :
                 votosAtleta2 > votosAtleta1 ? `GANADOR: ${atleta2.nombre}` :
                 'EMPATE EN VOTOS'}
              </div>
              <div className="flex gap-4 justify-center">
                <Button onClick={confirmarVotos} className="bg-green-600 hover:bg-green-700 font-bold text-lg py-3 px-6">
                  CONFIRMAR GANADOR
                </Button>
                <Button onClick={() => setMostrarDialogoVotos(false)} variant="outline" className="font-bold text-lg py-3 px-6">
                  CANCELAR
                </Button>
              </div>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </div>
  </TooltipProvider>
)
}

export default PanelControlJueces
