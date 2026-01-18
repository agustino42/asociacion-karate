'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Trophy, Clock, User, Users, Play, Award, Calendar, Timer, Zap, Crown, Swords, Target, ChevronRight, Medal, Star, ExternalLink } from 'lucide-react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

// Interfaces
interface Atleta {
  id: number
  nombre: string
  apellido: string
  cinturon: string
  categoria: string
  genero?: string
}

interface Juez {
  id: number
  nombre: string
  apellido: string
  nivel: string
}

interface Campeonato {
  id: number
  nombre: string
  fecha: string
  estado: 'planificado' | 'en_curso' | 'finalizado'
}

interface CombateCampeonato {
  id?: number
  campeonato_id?: number
  atleta1?: Atleta
  atleta2?: Atleta
  ganador?: Atleta
  juez?: Juez
  hora?: string
  estado: 'pendiente' | 'en_curso' | 'finalizado'
  ronda: number
  posicion: number
  combate_db_id?: number
  puntos_atleta1?: number
  puntos_atleta2?: number
}
// componente principal de la pagina o funciones y mas funcionalidades
const CampeonatosPage = () => {
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  const [combates, setCombates] = useState<CombateCampeonato[]>([])
  const [atletas, setAtletas] = useState<Atleta[]>([])
  const [jueces, setJueces] = useState<Juez[]>([])
  const [campeonato, setCampeonato] = useState<Campeonato | null>(null)
  const [categoria, setCategoria] = useState<string>('')
  const [generoSeleccionado, setGeneroSeleccionado] = useState<string>('')
  const [darkMode, setDarkMode] = useState(false)
  const [loading, setLoading] = useState(true)
  const [animatingWinner, setAnimatingWinner] = useState<{ ronda: number, posicion: number } | null>(null)

  const categorias = [
    'Senior Masculino',
    'Senior Femenino',
    'Junior Masculino',
    'Junior Femenino',
    'Cadete Masculino',
    'Cadete Femenino',
    'Infantil Masculino',
    'Infantil Femenino'
  ]

  // Cargar datos de Supabase
  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      // Cargar atletas
      const { data: atletasData } = await supabase
        .from('atletas')
        .select('*')
        .order('nombre')

      // Cargar jueces
      const { data: juecesData } = await supabase
        .from('jueces')
        .select('*')

      if (atletasData) {
        console.log('Atletas cargados:', atletasData.map(a => ({ nombre: a.nombre, genero: a.genero })))
        setAtletas(atletasData)
      }
      if (juecesData) setJueces(juecesData)

      // Inicializar combates vacíos para que el usuario seleccione atletas
      const combatesIniciales: CombateCampeonato[] = [
        // PRIMERA RONDA
        { estado: 'pendiente', ronda: 1, posicion: 1 },
        { estado: 'pendiente', ronda: 1, posicion: 2 },
        { estado: 'pendiente', ronda: 1, posicion: 3 },
        { estado: 'pendiente', ronda: 1, posicion: 4 },

        // SEMIFINALES
        { estado: 'pendiente', ronda: 2, posicion: 1 },
        { estado: 'pendiente', ronda: 2, posicion: 2 },

        // FINAL
        { estado: 'pendiente', ronda: 3, posicion: 1 }
      ]
      setCombates(combatesIniciales)
    } catch (error) {
      console.error('Error cargando datos:', error)
    } finally {
      setLoading(false)
    }
  }

  const iniciarCombate = async (combate: CombateCampeonato) => {
    if (!combate.atleta1 || !combate.atleta2) {
      alert('Faltan atletas para este combate')
      return
    }

    // Validación opcional del juez (ya que no existe juez_id en la tabla)
    // if (!combate.juez) {
    //   alert('Debe asignar un juez antes de iniciar el combate')
    //   return
    //
    // }

    try {
      // Si ya existe un combate en la BD, solo abrirlo
      if (combate.combate_db_id) {
        window.open(`/admin/combates/campeonato/${combate.combate_db_id}`, '_blank')
        return
      }

      // Crear combate en la base de datos con identificador de campeonato
      const rondaNombre = combate.ronda === 1 ? 'Primera Ronda' : combate.ronda === 2 ? 'Semifinal' : 'Final'

      console.log('Creando combate con:', {
        atleta1: `${combate.atleta1.nombre} ${combate.atleta1.apellido} (ID: ${combate.atleta1.id})`,
        atleta2: `${combate.atleta2.nombre} ${combate.atleta2.apellido} (ID: ${combate.atleta2.id})`
      })

      const { data: combateCreado, error } = await supabase
        .from('combates_individuales')
        .insert({
          atleta1_id: combate.atleta1.id,
          atleta2_id: combate.atleta2.id,
          categoria: `Campeonato - ${rondaNombre} (${combate.atleta1.categoria || 'Senior'})`,
          duracion_minutos: 3,
          estado: 'en_curso'
        })
        .select()
        .single()

      if (error) {
        console.error('Error de Supabase:', error)
        alert(`Error al crear el combate: ${error.message}`)
        return
      }

      if (!combateCreado) {
        alert('No se pudo crear el combate')
        return
      }

      // Actualizar el combate local con el ID de la base de datos
      const combatesActualizados = combates.map(c =>
        c.ronda === combate.ronda && c.posicion === combate.posicion
          ? { ...c, combate_db_id: combateCreado.id, estado: 'en_curso' as const }
          : c
      )
      setCombates(combatesActualizados)

      // Abrir en nueva ventana con la ruta específica de campeonato
      window.open(`/admin/combates/campeonato/${combateCreado.id}`, '_blank')
    } catch (error: any) {
      console.error('Error creando combate:', error)
      alert(`Error inesperado: ${error.message || 'Error desconocido'}`)
    }
  }

  // Función para actualizar el bracket cuando un combate termine
  const actualizarBracket = async () => {
    try {
      // Obtener todos los combates de campeonato
      const { data: combatesDB } = await supabase
        .from('combates_individuales')
        .select(`
          *,
          atleta1:atletas!combates_individuales_atleta1_id_fkey(*),
          atleta2:atletas!combates_individuales_atleta2_id_fkey(*),
          ganador:atletas!combates_individuales_ganador_id_fkey(*)
        `)
        .or('estado.eq.finalizado,estado.eq.en_curso')
        .like('categoria', 'Campeonato%')

      console.log('Combates de Campeonato en BD:', combatesDB?.length || 0)

      if (combatesDB && combatesDB.length > 0) {
        let huboActualizacion = false

        // Actualizar combates locales con los resultados
        const combatesActualizados = combates.map(combate => {
          // Buscar combate correspondiente en la BD por atletas
          const combateDB = combatesDB.find(c => {
            if (!combate.atleta1 || !combate.atleta2) return false

            return (
              (c.atleta1?.id === combate.atleta1.id && c.atleta2?.id === combate.atleta2.id) ||
              (c.atleta1?.id === combate.atleta2.id && c.atleta2?.id === combate.atleta1.id)
            )
          })

          if (combateDB) {
            // Actualizar estado del combate
            if (combateDB.estado === 'en_curso' && combate.estado === 'pendiente') {
              huboActualizacion = true
              return { ...combate, estado: 'en_curso' as const, combate_db_id: combateDB.id }
            }

            // Si el combate está finalizado y tiene ganador
            if (combateDB.estado === 'finalizado' && combateDB.ganador_id) {
              const ganadorData = combateDB.ganador ||
                (combateDB.ganador_id === combateDB.atleta1?.id ? combateDB.atleta1 : combateDB.atleta2)

              if (combate.estado !== 'finalizado' || !combate.ganador) {
                huboActualizacion = true

                const combateActualizado = {
                  ...combate,
                  ganador: ganadorData,
                  estado: 'finalizado' as const,
                  combate_db_id: combateDB.id,
                  puntos_atleta1: combateDB.puntos_atleta1 || 0,
                  puntos_atleta2: combateDB.puntos_atleta2 || 0
                }

                console.log(`Combate R${combate.ronda}-${combate.posicion} finalizado. Ganador: ${ganadorData.nombre} ${ganadorData.apellido} (${combateDB.puntos_atleta1 || 0}-${combateDB.puntos_atleta2 || 0})`)

                // Mostrar animación de ganador avanzando
                if (combate.ronda < 3 && ganadorData) {
                  setAnimatingWinner({ ronda: combate.ronda, posicion: combate.posicion })
                  setTimeout(() => setAnimatingWinner(null), 2000)
                }

                return combateActualizado
              }
            }
          }

          return combate
        })

        // Avanzar ganadores a siguiente ronda
        const combatesConAvance = combatesActualizados.map(combate => {
          // Si es semifinal o final y no tiene atletas, buscar ganadores de ronda anterior
          if (combate.ronda > 1 && (!combate.atleta1 || !combate.atleta2)) {
            const posicionBase = (combate.posicion - 1) * 2 + 1
            const combatesPrevios = combatesActualizados.filter(c =>
              c.ronda === combate.ronda - 1 &&
              (c.posicion === posicionBase || c.posicion === posicionBase + 1)
            )

            console.log(`Buscando ganadores para R${combate.ronda}-${combate.posicion}:`,
              combatesPrevios.map(c => `R${c.ronda}-${c.posicion}: ${c.ganador ? c.ganador.nombre : 'Sin ganador'}`))

            let nuevoAtleta1 = combate.atleta1
            let nuevoAtleta2 = combate.atleta2

            // Asignar ganadores a los slots correspondientes
            combatesPrevios.forEach(cp => {
              if (cp.ganador) {
                if (cp.posicion === posicionBase && !nuevoAtleta1) {
                  nuevoAtleta1 = cp.ganador
                  console.log(`✅ Asignando ${cp.ganador.nombre} a atleta1 de R${combate.ronda}-${combate.posicion}`)
                } else if (cp.posicion === posicionBase + 1 && !nuevoAtleta2) {
                  nuevoAtleta2 = cp.ganador
                  console.log(`✅ Asignando ${cp.ganador.nombre} a atleta2 de R${combate.ronda}-${combate.posicion}`)
                }
              }
            })

            if (nuevoAtleta1 !== combate.atleta1 || nuevoAtleta2 !== combate.atleta2) {
              huboActualizacion = true
              return { ...combate, atleta1: nuevoAtleta1, atleta2: nuevoAtleta2 }
            }
          }
          return combate
        })

        // Solo actualizar si hubo cambios
        if (huboActualizacion) {
          setCombates(combatesConAvance)

          // Mostrar notificación de actualización
          const combatesFin = combatesConAvance.filter(c => c.estado === 'finalizado')
          if (combatesFin.length > combates.filter(c => c.estado === 'finalizado').length) {
            // Nuevo combate finalizado
            const ultimoFinalizado = combatesFin[combatesFin.length - 1]
            if (ultimoFinalizado.ganador) {
              console.log(`¡Combate finalizado! Ganador: ${ultimoFinalizado.ganador.nombre} ${ultimoFinalizado.ganador.apellido}`)
            }
          }
        }
      }
    } catch (error) {
      console.error('Error actualizando bracket:', error)
    }
  }

  // Actualizar bracket cada 3 segundos para tiempo real
  useEffect(() => {
    const interval = setInterval(() => {
      actualizarBracket()
    }, 3000)
    return () => clearInterval(interval)
  }, [combates])

  // Actualizar bracket cuando la ventana recibe foco (cuando vuelves de un combate)
  useEffect(() => {
    const handleFocus = () => {
      console.log('Ventana enfocada - actualizando bracket...')
      actualizarBracket()
    }

    window.addEventListener('focus', handleFocus)

    // Actualizar inmediatamente al montar
    actualizarBracket()

    return () => window.removeEventListener('focus', handleFocus)
  }, [combates])

  const asignarAtleta = (ronda: number, posicion: number, atleta: Atleta, esAtleta1: boolean) => {
    setCombates(prev => prev.map(c =>
      c.ronda === ronda && c.posicion === posicion
        ? { ...c, [esAtleta1 ? 'atleta1' : 'atleta2']: atleta }
        : c
    ))
  }

  const asignarJuez = (ronda: number, posicion: number, juez: Juez) => {
    setCombates(prev => prev.map(c =>
      c.ronda === ronda && c.posicion === posicion ? { ...c, juez } : c
    ))
  }

  const asignarHora = (ronda: number, posicion: number, hora: string) => {
    setCombates(prev => prev.map(c =>
      c.ronda === ronda && c.posicion === posicion ? { ...c, hora } : c
    ))
  }

  const reiniciarCampeonato = async () => {
    if (confirm('¿Estás seguro de que quieres reiniciar el campeonato? Se perderán todos los resultados.')) {
      try {
        // Limpiar combates de la base de datos
        await supabase
          .from('combates_individuales')
          .delete()
          .neq('id', 0) // Eliminar todos

        // Reiniciar combates locales
        const combatesIniciales: CombateCampeonato[] = [
          { estado: 'pendiente', ronda: 1, posicion: 1 },
          { estado: 'pendiente', ronda: 1, posicion: 2 },
          { estado: 'pendiente', ronda: 1, posicion: 3 },
          { estado: 'pendiente', ronda: 1, posicion: 4 },
          { estado: 'pendiente', ronda: 2, posicion: 1 },
          { estado: 'pendiente', ronda: 2, posicion: 2 },
          { estado: 'pendiente', ronda: 3, posicion: 1 }
        ]
        setCombates(combatesIniciales)
        setCategoria('')
        alert('¡Campeonato reiniciado exitosamente!')
      } catch (error) {
        console.error('Error reiniciando campeonato:', error)
        alert('Error al reiniciar el campeonato')
      }
    }
  }

  const CombateCard = ({ combate }: { combate: CombateCampeonato }) => {
    const puedeIniciar = combate.atleta1 && combate.atleta2 && combate.juez

    // Verificar si este combate está esperando un ganador de ronda anterior
    const esperandoRival = combate.ronda > 1 && (!combate.atleta1 || !combate.atleta2)

    // Obtener combates previos que alimentan este combate
    const getCombatesPrevios = () => {
      if (combate.ronda === 1) return []
      const posicionBase = (combate.posicion - 1) * 2 + 1
      return combates.filter(c =>
        c.ronda === combate.ronda - 1 &&
        (c.posicion === posicionBase || c.posicion === posicionBase + 1)
      )
    }

    const combatesPrevios = getCombatesPrevios()

    // Obtener ganadores disponibles de la ronda anterior desde el estado local
    const ganadoresLocales = combate.ronda === 1 ? atletas : combatesPrevios
      .filter(c => c.ganador)
      .map(c => c.ganador!)

    // Debug: mostrar ganadores disponibles
    if (combate.ronda > 1 && ganadoresLocales.length === 0) {
      console.log(`Combate R${combate.ronda}-${combate.posicion}: Esperando ganadores de R${combate.ronda - 1}`)
      console.log('Combates previos:', combatesPrevios.map(c => ({
        ronda: c.ronda,
        posicion: c.posicion,
        estado: c.estado,
        ganador: c.ganador ? `${c.ganador.nombre} ${c.ganador.apellido}` : 'Sin ganador'
      })))
    }

    return (
      <Card className={`
        group relative overflow-hidden transition-all duration-500 hover:scale-105
        ${animatingWinner?.ronda === combate.ronda && animatingWinner?.posicion === combate.posicion
          ? 'animate-bounce border-4 border-yellow-400 shadow-2xl shadow-yellow-400/50 scale-110'
          : ''
        }
        ${combate.estado === 'finalizado'
          ? 'bg-linear-to-br from-emerald-900/50 to-green-800/50 border-emerald-600 shadow-emerald-900/50'
          : combate.estado === 'en_curso'
            ? 'bg-linear-to-br from-blue-900/50 to-indigo-800/50 border-blue-600 shadow-blue-900/50 animate-pulse'
            : 'bg-linear-to-br from-gray-800 to-gray-900 border-gray-600 hover:border-blue-500'
        }
        border-2 shadow-xl hover:shadow-2xl w-full max-w-xs mx-auto
      `}>
        {/* Estado visual indicator */}
        <div className={`absolute top-0 left-0 w-full h-1 ${combate.estado === 'finalizado' ? 'bg-linear-to-r from-emerald-400 to-green-500' :
          combate.estado === 'en_curso' ? 'bg-linear-to-r from-blue-400 to-indigo-500' :
            'bg-linear-to-r from-gray-300 to-gray-400'
          }`} />

        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Badge variant={combate.estado === 'finalizado' ? 'default' : 'secondary'} className="text-xs font-bold">
              {combate.estado === 'pendiente' && '⏳ Pendiente'}
              {combate.estado === 'en_curso' && '🔥 En Vivo'}
              {combate.estado === 'finalizado' && '✅ Finalizado'}
            </Badge>
            <div className="text-xs font-mono text-gray-400">
              R{combate.ronda}-{combate.posicion}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 text-white">
          {/* Atletas - Solo selector en Primera Ronda */}
          {combate.ronda === 1 ? (
            <div className="space-y-3">
              {/* Atleta 1 (Azul) */}
              <div className="space-y-2">
                <label className="text-xs font-semibold flex items-center gap-1 text-blue-400">
                  <Users className="h-3 w-3" />
                  Atleta Azul:
                </label>


                <Select
                  value={combate.atleta1?.id?.toString() || ''}
                  onValueChange={(value) => {
                    const atleta = atletas.find(a => a.id.toString() === value)
                    console.log('Seleccionando atleta1:', atleta)
                    if (atleta) asignarAtleta(combate.ronda, combate.posicion, atleta, true)
                  }}
                >
                  <SelectTrigger className="h-10 text-xs border-2 transition-colors border-blue-600 hover:border-blue-500 bg-gray-800 text-white">
                    <SelectValue placeholder="🥋 Atleta azul" />
                  </SelectTrigger>
                  <SelectContent>
                    {atletas
                      .filter(a => generoSeleccionado === 'todos' || !generoSeleccionado || a.genero === generoSeleccionado)
                      .map((atleta) => (
                        <SelectItem key={atleta.id} value={atleta.id.toString()} disabled={atleta.id.toString() === combate.atleta2?.id?.toString()}>
                          {atleta.nombre} {atleta.apellido} - {atleta.cinturon} {atleta.genero && `(${atleta.genero === 'Masculino' ? '👨' : '👩'})`}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* VS Divider */}
              <div className="relative">
                <Separator />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-gray-700 px-2 py-1 rounded-full border-2 border-orange-400 text-xs font-bold text-orange-300">
                    <Swords className="h-3 w-3 inline mr-1" />
                    VS
                  </div>
                </div>
              </div>

              {/* Atleta 2 (Rojo) */}
              <div className="space-y-2">
                <label className="text-xs font-semibold flex items-center gap-1 text-red-400">
                  <Users className="h-3 w-3" />
                  Atleta Rojo:
                </label>
                <Select
                  value={combate.atleta2?.id?.toString() || ''}
                  onValueChange={(value) => {
                    const atleta = atletas.find(a => a.id.toString() === value)
                    console.log('Seleccionando atleta2:', atleta)
                    if (atleta) asignarAtleta(combate.ronda, combate.posicion, atleta, false)
                  }}
                >
                  <SelectTrigger className="h-10 text-xs border-2 transition-colors border-red-600 hover:border-red-500 bg-gray-800 text-white">
                    <SelectValue placeholder="🥋 Atleta rojo" />
                  </SelectTrigger>
                  <SelectContent>
                    {atletas
                      .filter(a => generoSeleccionado === 'todos' || !generoSeleccionado || a.genero === generoSeleccionado)
                      .map((atleta) => (
                        <SelectItem key={atleta.id} value={atleta.id.toString()} disabled={atleta.id.toString() === combate.atleta1?.id?.toString()}>
                          {atleta.nombre} {atleta.apellido} - {atleta.cinturon} {atleta.genero && `(${atleta.genero === 'Masculino' ? '👨' : '👩'})`}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            /* Semifinales y Final - Solo mostrar ganadores */
            <div className="space-y-3">
              {/* Atleta 1 (Azul) - Ganador clasificado */}
              <div className="space-y-2">
                <label className="text-xs font-semibold flex items-center gap-1 text-blue-400">
                  <Crown className="h-3 w-3" />
                  Clasificado Azul:
                </label>
                {combate.atleta1 ? (
                  <div className="h-10 px-3 py-2 rounded-md border-2 border-blue-600 bg-linear-to-r from-blue-900/50 to-blue-800/50 text-white flex items-center gap-2 animate-in slide-in-from-left duration-500">
                    <Crown className="h-3 w-3 text-yellow-500 animate-bounce" />
                    <span className="text-xs font-bold">{combate.atleta1.nombre} {combate.atleta1.apellido}</span>
                    <Badge variant="outline" className="text-xs ml-auto bg-yellow-500/20">{combate.atleta1.cinturon}</Badge>
                  </div>
                ) : (
                  <div className="h-10 px-3 py-2 rounded-md border-2 border-blue-600/50 bg-gray-800/50 text-gray-400 flex items-center justify-center">
                    <span className="text-xs">⏳ Esperando ganador...</span>
                  </div>
                )}
              </div>

              {/* VS Divider */}
              <div className="relative">
                <Separator />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-gray-700 px-2 py-1 rounded-full border-2 border-orange-400 text-xs font-bold text-orange-300">
                    <Swords className="h-3 w-3 inline mr-1" />
                    VS
                  </div>
                </div>
              </div>

              {/* Atleta 2 (Rojo) - Ganador clasificado */}
              <div className="space-y-2">
                <label className="text-xs font-semibold flex items-center gap-1 text-red-400">
                  <Crown className="h-3 w-3" />
                  Clasificado Rojo:
                </label>
                {combate.atleta2 ? (
                  <div className="h-10 px-3 py-2 rounded-md border-2 border-red-600 bg-linear-to-r from-red-900/50 to-red-800/50 text-white flex items-center gap-2 animate-in slide-in-from-right duration-500">
                    <Crown className="h-3 w-3 text-yellow-500 animate-bounce" />
                    <span className="text-xs font-bold">{combate.atleta2.nombre} {combate.atleta2.apellido}</span>
                    <Badge variant="outline" className="text-xs ml-auto bg-yellow-500/20">{combate.atleta2.cinturon}</Badge>
                  </div>
                ) : (
                  <div className="h-10 px-3 py-2 rounded-md border-2 border-red-600/50 bg-gray-800/50 text-gray-400 flex items-center justify-center">
                    <span className="text-xs">⏳ Esperando ganador...</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Ganador o Estado de Avance */}
          {combate.ganador ? (
            <div className="space-y-2">
              <div className="bg-linear-to-r from-yellow-100 to-amber-100 border-2 border-yellow-300 rounded-xl p-3 animate-in slide-in-from-top duration-500">
                <div className="flex items-center gap-2">
                  <div className="bg-yellow-500 p-2 rounded-full">
                    <Crown className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-yellow-700 font-medium">🏆 GANADOR - AVANZA</div>
                    <div className="font-bold text-yellow-900 text-sm">
                      {combate.ganador.nombre} {combate.ganador.apellido}
                    </div>
                    {combate.ronda < 3 && (
                      <div className="text-xs text-yellow-600 mt-1">
                        ➜ Pasa a {combate.ronda === 1 ? 'Semifinal' : 'Final'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* Marcador Final */}
              {(combate.puntos_atleta1 !== undefined || combate.puntos_atleta2 !== undefined) && (
                <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-2">
                  <div className="text-xs text-gray-400 text-center mb-1">Marcador Final</div>
                  <div className="flex justify-center items-center gap-3">
                    <div className="text-center">
                      <div className="text-xs text-blue-400 mb-1">Azul</div>
                      <div className={`text-2xl font-bold ${combate.ganador.id === combate.atleta1?.id ? 'text-green-400' : 'text-gray-500'
                        }`}>
                        {combate.puntos_atleta1 || 0}
                      </div>
                    </div>
                    <div className="text-gray-500 text-xl">-</div>
                    <div className="text-center">
                      <div className="text-xs text-red-400 mb-1">Rojo</div>
                      <div className={`text-2xl font-bold ${combate.ganador.id === combate.atleta2?.id ? 'text-green-400' : 'text-gray-500'
                        }`}>
                        {combate.puntos_atleta2 || 0}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : esperandoRival && (
            <div className="bg-linear-to-r from-blue-900/30 to-indigo-900/30 border-2 border-blue-500/50 rounded-xl p-3 animate-pulse">
              <div className="text-center">
                <div className="text-xs text-blue-300 font-medium mb-2">⏳ ESPERANDO CLASIFICADOS</div>
                {combatesPrevios.map((cp, idx) => (
                  <div key={idx} className="text-xs text-gray-300 mb-1">
                    {cp.ganador ? (
                      <span className="text-green-400 flex items-center justify-center gap-1">
                        ✓ {cp.ganador.nombre} {cp.ganador.apellido}
                      </span>
                    ) : cp.estado === 'en_curso' ? (
                      <span className="text-yellow-400">🔥 Combate en curso...</span>
                    ) : (
                      <span className="text-gray-400">⏳ Pendiente R{cp.ronda}-{cp.posicion}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Configuración del Combate */}
          <div className="space-y-3">
            {/* Juez */}
            <div className="space-y-2">
              <label className="text-xs font-semibold flex items-center gap-1 text-gray-300">
                <User className="h-3 w-3" />
                Juez Asignado:
              </label>
              <Select
                value={combate.juez?.id?.toString() || ''}
                onValueChange={(value) => {
                  const juez = jueces.find(j => j.id.toString() === value)
                  if (juez) asignarJuez(combate.ronda, combate.posicion, juez)
                }}
              >
                <SelectTrigger className="h-9 text-sm border-2 transition-colors border-gray-600 hover:border-blue-500 bg-gray-800 text-white">
                  <SelectValue placeholder="👨⚖️ Seleccionar juez" />
                </SelectTrigger>
                <SelectContent>
                  {jueces.map(juez => (
                    <SelectItem key={juez.id} value={juez.id.toString()}>
                      <div className="flex items-center gap-2">
                        <Star className="h-3 w-3 text-yellow-500" />
                        <span>{juez.nombre} {juez.apellido}</span>
                        <Badge variant="outline" className="text-xs">{juez.nivel}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>


          </div>

          {/* Botón de Acción */}
          {combate.estado !== 'finalizado' && (
            <Button
              onClick={() => iniciarCombate(combate)}
              disabled={!puedeIniciar}
              size="lg"
              className={`w-full h-12 text-sm font-bold transition-all duration-300 ${puedeIniciar
                ? 'bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                : 'bg-gray-400 cursor-not-allowed opacity-60'
                }`}
            >
              {combate.estado === 'en_curso' ? (
                <>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  🔥 Abrir Combate
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  🥋 Iniciar Combate
                </>
              )}
            </Button>
          )}

          {/* Información adicional */}
          {!puedeIniciar && combate.estado === 'pendiente' && (
            <div className="text-xs text-center text-amber-300 bg-amber-900/30 p-2 rounded-lg border border-amber-600">
              <div className="font-semibold mb-1">⚠️ Completar:</div>
              <div className="space-y-1 text-xs">
                {!combate.atleta1 && <div>• Atleta Azul</div>}
                {!combate.atleta2 && <div>• Atleta Rojo</div>}
                {!combate.juez && <div>• Juez</div>}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  const ronda1 = combates.filter(c => c.ronda === 1)
  const ronda2 = combates.filter(c => c.ronda === 2)
  const ronda3 = combates.filter(c => c.ronda === 3)

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-900 via-slate-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold mb-4">Cargando Campeonato...</div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen transition-colors duration-300 bg-linear-to-br from-gray-900 via-slate-900 to-black">
      {/* Header Mejorado */}
      <div className="sticky top-0 z-40 backdrop-blur-lg border-b shadow-sm bg-gray-900/80 border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-linear-to-r from-blue-600 to-indigo-600 p-3 rounded-xl shadow-lg">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  🥋 Campeonato de Karate
                </h1>
                <p className="text-sm text-gray-400">
                  Sistema de Eliminación Directa • Torneo Profesional
                </p>
              </div>
            </div>

            {/* Controles */}
            <div className="flex flex-col xl:flex-row items-center gap-4 w-full xl:w-auto">
              {/* Selector de Género */}
              <Select value={generoSeleccionado} onValueChange={setGeneroSeleccionado}>
                <SelectTrigger className="w-full sm:w-40 bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="👥 Género" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="Masculino">👨 Masculino</SelectItem>
                  <SelectItem value="Femenino">👩 Femenino</SelectItem>
                </SelectContent>
              </Select>
              {/* Selector de Categoría */}
              {/** <Select value={categoria} onValueChange={setCategoria}>
                <SelectTrigger className="w-48 bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="🥋 Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>*/}

              {/* Botones de control */}
              <div className="flex gap-2 flex-wrap justify-center">
                <Button
                  onClick={() => {
                    cargarDatos()
                    console.log('Recargando atletas...')
                  }}
                  variant="outline"
                  size="sm"
                  className="bg-green-900/20 border-green-600 text-green-400 hover:bg-green-900/40"
                >
                  🔄 Recargar Atletas
                </Button>
                <Button
                  onClick={() => {
                    actualizarBracket()
                    console.log('Actualización manual del bracket')
                  }}
                  variant="outline"
                  size="sm"
                  className="bg-blue-900/20 border-blue-600 text-blue-400 hover:bg-blue-900/40"
                >
                  🔄 Actualizar
                </Button>
                <Button
                  onClick={reiniciarCampeonato}
                  variant="outline"
                  size="sm"
                  className="bg-red-900/20 border-red-600 text-red-400 hover:bg-red-900/40"
                >
                  🗑️ Reiniciar
                </Button>
              </div>

              {/* Stats rápidas */}
              <div className="flex gap-2 text-center flex-wrap justify-center">
                <div className="px-2 py-1 rounded-lg bg-blue-900/50">
                  <div className="text-sm font-bold text-blue-600">{atletas.length}</div>
                  <div className="text-xs text-blue-500">Atletas</div>
                </div>
                <div className="px-2 py-1 rounded-lg bg-green-900/50">
                  <div className="text-sm font-bold text-green-600">{combates.filter(c => c.estado === 'finalizado').length}</div>
                  <div className="text-xs text-green-500">Finalizados</div>
                </div>
                <div className="px-2 py-1 rounded-lg bg-orange-900/50">
                  <div className="text-sm font-bold text-orange-600">{combates.filter(c => c.estado === 'pendiente').length}</div>
                  <div className="text-xs text-orange-500">Pendientes</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Tabs para Mobile/Desktop */}
        <Tabs defaultValue="bracket" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="bracket" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Vista Bracket</span>
              <span className="sm:hidden">Bracket</span>
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Vista Lista</span>
              <span className="sm:hidden">Lista</span>
            </TabsTrigger>
          </TabsList>

          {/* Vista Bracket (Desktop) */}
          <TabsContent value="bracket" className="space-y-6">
            <div className="rounded-xl shadow-2xl p-4 sm:p-8 overflow-x-auto bg-gray-800">
              <div className="min-w-[320px] sm:min-w-[1600px]">
                <div className="grid grid-cols-1 sm:grid-cols-7 gap-4 sm:gap-8 items-center">

                  {/* PRIMERA RONDA */}
                  <div className="space-y-6 sm:space-y-12">
                    <div className="text-center mb-4 sm:mb-6">
                      <div className="bg-linear-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-full inline-block mb-2">
                        <h3 className="font-bold text-sm sm:text-xl">Primera Ronda</h3>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>8 Atletas</span>
                      </div>
                    </div>
                    <div className="grid gap-4 sm:gap-6">
                      {ronda1.map(combate => (
                        <CombateCard key={`${combate.ronda}-${combate.posicion}`} combate={combate} />
                      ))}
                    </div>
                  </div>

                  {/* CONECTORES 1 */}
                  <div className="hidden sm:block space-y-12">
                    {[1, 2, 3, 4].map(i => {
                      const isAnimating = animatingWinner?.ronda === 1 && animatingWinner?.posicion === i
                      return (
                        <div key={i} className="h-40 flex items-center">
                          <div className={`w-full h-1 rounded transition-all duration-1000 ${isAnimating
                            ? 'bg-linear-to-r from-yellow-400 to-amber-400 h-2 animate-pulse shadow-lg shadow-yellow-400/50'
                            : 'bg-linear-to-r from-blue-300 to-indigo-300 animate-pulse'
                            }`}></div>
                          <ChevronRight className={`h-6 w-6 mx-2 transition-all duration-500 ${isAnimating ? 'text-yellow-500 animate-bounce scale-125' : 'text-blue-500'
                            }`} />
                        </div>
                      )
                    })}
                  </div>

                  {/* SEMIFINALES */}
                  <div className="space-y-12 sm:space-y-24">
                    <div className="text-center mb-4 sm:mb-6">
                      <div className="bg-linear-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full inline-block mb-2">
                        <h3 className="font-bold text-sm sm:text-xl">Semifinales</h3>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Award className="h-4 w-4" />
                        <span>4 Atletas</span>
                      </div>
                    </div>
                    <div className="grid gap-6 sm:gap-12">
                      {ronda2.map(combate => (
                        <CombateCard key={`${combate.ronda}-${combate.posicion}`} combate={combate} />
                      ))}
                    </div>
                  </div>

                  {/* CONECTORES 2 */}
                  <div className="hidden sm:block space-y-24">
                    {[1, 2].map(i => {
                      const isAnimating = animatingWinner?.ronda === 2 && animatingWinner?.posicion === i
                      return (
                        <div key={i} className="h-40 flex items-center">
                          <div className={`w-full h-1 rounded transition-all duration-1000 ${isAnimating
                            ? 'bg-linear-to-r from-yellow-400 to-amber-400 h-2 animate-pulse shadow-lg shadow-yellow-400/50'
                            : 'bg-linear-to-r from-orange-300 to-red-300 animate-pulse'
                            }`}></div>
                          <ChevronRight className={`h-6 w-6 mx-2 transition-all duration-500 ${isAnimating ? 'text-yellow-500 animate-bounce scale-125' : 'text-orange-500'
                            }`} />
                        </div>
                      )
                    })}
                  </div>

                  {/* FINAL */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="text-center mb-6 sm:mb-10">
                      <div className="bg-linear-to-r from-yellow-500 to-amber-500 text-white px-6 py-3 rounded-full inline-block mb-3 shadow-lg">
                        <h3 className="font-bold text-lg sm:text-2xl flex items-center gap-2">
                          <Crown className="h-5 w-5 sm:h-6 w-6" />
                          FINAL
                        </h3>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Swords className="h-4 w-4" />
                        <span>2 Finalistas</span>
                      </div>
                    </div>
                    {ronda3.map(combate => (
                      <CombateCard key={`${combate.ronda}-${combate.posicion}`} combate={combate} />
                    ))}
                  </div>

                  {/* CONECTORES 3 */}
                  <div className="hidden sm:flex items-center justify-center">
                    <div className={`w-full h-2 rounded-full shadow-lg transition-all duration-1000 ${animatingWinner?.ronda === 3 && animatingWinner?.posicion === 1
                      ? 'bg-linear-to-r from-yellow-400 to-yellow-300 h-4 animate-pulse shadow-2xl shadow-yellow-400/75'
                      : 'bg-linear-to-r from-yellow-400 to-amber-400 animate-pulse'
                      }`}></div>
                    <ChevronRight className={`h-8 w-8 mx-2 transition-all duration-500 ${animatingWinner?.ronda === 3 ? 'text-yellow-300 animate-bounce scale-150' : 'text-yellow-500'
                      }`} />
                  </div>

                  {/* CAMPEÓN */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="text-center">
                      <div className="bg-linear-to-r from-yellow-500 to-amber-500 text-white px-6 py-2 rounded-full mb-4 shadow-lg">
                        <h3 className="font-bold text-xl sm:text-2xl flex items-center gap-2 justify-center">
                          <Crown className="h-6 w-6" />
                          CAMPEÓN
                        </h3>
                      </div>
                      <div className={`p-6 sm:p-8 rounded-2xl shadow-2xl border-4 transition-all duration-1000 ${ronda3[0]?.ganador
                        ? 'bg-linear-to-br from-yellow-400 via-amber-400 to-orange-400 border-yellow-300 animate-bounce scale-110 shadow-2xl shadow-yellow-400/50'
                        : 'bg-linear-to-br from-yellow-400 via-amber-400 to-orange-400 border-yellow-300 animate-pulse'
                        }`}>
                        <Trophy className={`mx-auto mb-4 drop-shadow-lg text-white transition-all duration-500 ${ronda3[0]?.ganador ? 'h-20 w-20 sm:h-24 w-24 animate-spin' : 'h-16 w-16 sm:h-20 w-20'
                          }`} />
                        {ronda3[0]?.ganador ? (
                          <div className="text-white text-center animate-in slide-in-from-bottom duration-1000">
                            <div className="font-bold text-xl sm:text-2xl mb-2 animate-pulse">
                              🏆 {ronda3[0].ganador.nombre} {ronda3[0].ganador.apellido}
                            </div>
                            <div className="text-sm opacity-90 flex items-center justify-center gap-1">
                              <Medal className="h-4 w-4" />
                              {ronda3[0].ganador.cinturon}
                            </div>
                            <div className="text-xs mt-2 opacity-75">¡CAMPEÓN DEL TORNEO!</div>
                          </div>
                        ) : (
                          <div className="text-white text-center">
                            <div className="font-bold text-lg">🏆 Por Definir</div>
                            <div className="text-sm opacity-75">Esperando final...</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Vista Lista (Mobile-friendly) */}
          <TabsContent value="list" className="space-y-4">
            <ScrollArea className="h-[70vh]">
              <div className="space-y-6">
                {/* Primera Ronda */}
                <div>
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">R1</div>
                    Primera Ronda
                  </h3>
                  <div className="grid gap-4">
                    {ronda1.map(combate => (
                      <CombateCard key={`${combate.ronda}-${combate.posicion}`} combate={combate} />
                    ))}
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Semifinales */}
                <div>
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm">R2</div>
                    Semifinales
                  </h3>
                  <div className="grid gap-4">
                    {ronda2.map(combate => (
                      <CombateCard key={`${combate.ronda}-${combate.posicion}`} combate={combate} />
                    ))}
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Final */}
                <div>
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <div className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm">F</div>
                    Final
                  </h3>
                  <div className="grid gap-4">
                    {ronda3.map(combate => (
                      <CombateCard key={`${combate.ronda}-${combate.posicion}`} combate={combate} />
                    ))}
                  </div>
                </div>

                {/* Campeón */}
                {ronda3[0]?.ganador && (
                  <div className="text-center py-8">
                    <div className="bg-linear-to-r from-yellow-400 to-amber-400 p-6 rounded-2xl shadow-xl inline-block">
                      <Trophy className="h-16 w-16 text-white mx-auto mb-2" />
                      <div className="text-white">
                        <div className="font-bold text-xl">🏆 CAMPEÓN</div>
                        <div className="text-lg">{ronda3[0].ganador.nombre} {ronda3[0].ganador.apellido}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default CampeonatosPage