"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Users } from "lucide-react"

/**
 * Tipo que define la estructura de un Equipo
 * @property id - Identificador único del equipo
 * @property nombre - Nombre del equipo
 * @property entrenadores - Información del entrenador principal (puede ser null)
 */
type Equipo = {
  id: string
  nombre: string
  entrenadores: { nombre: string; apellido: string } | null
}

/**
 * Tipo que define la estructura de un Juez
 * @property id - Identificador único del juez
 * @property nombre - Nombre del juez
 * @property apellido - Apellido del juez
 */
type Juez = {
  id: string
  nombre: string
  apellido: string
}

/**
 * Tipo que define la estructura básica de un Atleta para los combates
 * @property id - Identificador único del atleta
 * @property nombre - Nombre del atleta
 * @property apellido - Apellido del atleta
 * @property cinturon - Nivel de cinturón del atleta
 */
type Atleta = {
  id: string
  nombre: string
  apellido: string
  cinturon: string
}

/**
 * Componente para crear un combate por equipos con 3 enfrentamientos individuales
 * 
 * FLUJO PRINCIPAL:
 * 1. Seleccionar dos equipos diferentes
 * 2. Cargar automáticamente los atletas activos de cada equipo
 * 3. Configurar 3 enfrentamientos (parejas de atletas)
 * 4. Asignar juez principal y fecha
 * 5. Crear combate en base de datos
 * 
 * @param equipos - Lista de equipos disponibles para seleccionar
 * @param jueces - Lista de jueces disponibles para asignar
 */
export function CombateEquipoForm({ equipos, jueces }: { equipos: Equipo[]; jueces: Juez[] }) {
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()
  
  // Estados para loading y manejo de errores
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Estados para almacenar listas de atletas por equipo
  const [atletas1, setAtletas1] = useState<Atleta[]>([])
  const [atletas2, setAtletas2] = useState<Atleta[]>([])

  /**
   * Estado principal del formulario con toda la configuración del combate
   * @property equipo1_id - ID del primer equipo seleccionado
   * @property equipo2_id - ID del segundo equipo seleccionado
   * @property juez_principal_id - ID del juez asignado (opcional)
   * @property fecha_combate - Fecha programada para el combate
   * @property notas - Observaciones adicionales
   * @property atleta1_peleaX - Atleta del equipo 1 para cada pelea (1, 2, 3)
   * @property atleta2_peleaX - Atleta del equipo 2 para cada pelea (1, 2, 3)
   */
  const [formData, setFormData] = useState({
    equipo1_id: "",
    equipo2_id: "",
    juez_principal_id: "",
    fecha_combate: new Date().toISOString().split("T")[0], // Fecha actual por defecto
    notas: "",
    // Atletas seleccionados para cada enfrentamiento
    atleta1_pelea1: "",
    atleta2_pelea1: "",
    atleta1_pelea2: "",
    atleta2_pelea2: "",
    atleta1_pelea3: "",
    atleta2_pelea3: "",
  })

  // Obtener objetos completos de equipos seleccionados
  const equipo1 = equipos.find((e) => e.id === formData.equipo1_id)
  const equipo2 = equipos.find((e) => e.id === formData.equipo2_id)

  /**
   * EFFECT: Cargar atletas del equipo 1 cuando se selecciona
   * Filtra solo atletas activos del equipo seleccionado
   */
  useEffect(() => {
    if (formData.equipo1_id) {
      supabase
        .from("atletas")
        .select("id, nombre, apellido, cinturon")
        .eq("equipo_id", formData.equipo1_id)
        .eq("activo", true)
        .then(({ data }) => setAtletas1(data || []))
    } else {
      setAtletas1([])
    }
  }, [formData.equipo1_id, supabase])

  /**
   * EFFECT: Cargar atletas del equipo 2 cuando se selecciona
   * Filtra solo atletas activos del equipo seleccionado
   */
  useEffect(() => {
    if (formData.equipo2_id) {
      supabase
        .from("atletas")
        .select("id, nombre, apellido, cinturon")
        .eq("equipo_id", formData.equipo2_id)
        .eq("activo", true)
        .then(({ data }) => setAtletas2(data || []))
    } else {
      setAtletas2([])
    }
  }, [formData.equipo2_id, supabase])

  /**
   * Maneja el envío del formulario para crear el combate por equipos
   * Realiza validaciones y crea:
   * - 1 registro en 'combates_equipos'
   * - 3 registros en 'enfrentamientos_equipo' (uno por cada pelea)
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // VALIDACIONES INICIALES
    if (formData.equipo1_id === formData.equipo2_id) {
      setError("Debes seleccionar dos equipos diferentes")
      setLoading(false)
      return
    }

    if (atletas1.length < 3 || atletas2.length < 3) {
      setError("Cada equipo debe tener al menos 3 atletas activos")
      setLoading(false)
      return
    }

    try {
      // PASO 1: Crear el combate por equipos (registro principal)
      const { data: combate, error: combateError } = await supabase
        .from("combates_equipos")
        .insert([
          {
            equipo1_id: formData.equipo1_id,
            equipo2_id: formData.equipo2_id,
            juez_principal_id: formData.juez_principal_id || null,
            fecha_combate: new Date(formData.fecha_combate).toISOString(),
            notas: formData.notas || null,
            estado: "programado", // Estado inicial del combate
          },
        ])
        .select()
        .single()

      if (combateError) throw combateError

      // PASO 2: Crear los 3 enfrentamientos individuales
      const enfrentamientos = [
        {
          combate_equipo_id: combate.id,
          atleta_equipo1_id: formData.atleta1_pelea1,
          atleta_equipo2_id: formData.atleta2_pelea1,
          orden_pelea: 1, // Primera pelea
        },
        {
          combate_equipo_id: combate.id,
          atleta_equipo1_id: formData.atleta1_pelea2,
          atleta_equipo2_id: formData.atleta2_pelea2,
          orden_pelea: 2, // Segunda pelea
        },
        {
          combate_equipo_id: combate.id,
          atleta_equipo1_id: formData.atleta1_pelea3,
          atleta_equipo2_id: formData.atleta2_pelea3,
          orden_pelea: 3, // Tercera pelea
        },
      ]

      const { error: enfrentamientosError } = await supabase.from("enfrentamientos_equipo").insert(enfrentamientos)

      if (enfrentamientosError) throw enfrentamientosError

      // REDIRECCIÓN Y ACTUALIZACIÓN
      router.push("/admin/combates")
      router.refresh() // Actualiza la cache de Next.js
    } catch (err: any) {
      setError(err.message || "Error al crear el combate por equipos")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Configuración del Combate por Equipos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SECCIÓN: SELECCIÓN DE EQUIPOS */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* TARJETA EQUIPO 1 */}
            <Card className="border-2 border-red-200">
              <CardHeader>
                <CardTitle className="text-lg">Equipo 1</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="equipo1_id">Seleccionar Equipo *</Label>
                  <Select
                    value={formData.equipo1_id}
                    onValueChange={(value) => setFormData({ ...formData, equipo1_id: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar equipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {equipos.map((equipo) => (
                        <SelectItem 
                          key={equipo.id} 
                          value={equipo.id} 
                          disabled={equipo.id === formData.equipo2_id} // Previene selección duplicada
                        >
                          {equipo.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* INFO DEL EQUIPO 1 SELECCIONADO */}
                {equipo1 && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">
                      <span className="font-medium">Entrenador:</span>{" "}
                      {equipo1.entrenadores
                        ? `${equipo1.entrenadores.nombre} ${equipo1.entrenadores.apellido}`
                        : "Sin asignar"}
                    </p>
                    <p className="text-sm mt-1">
                      <span className="font-medium">Atletas disponibles:</span> {atletas1.length}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* TARJETA EQUIPO 2 */}
            <Card className="border-2 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg">Equipo 2</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="equipo2_id">Seleccionar Equipo *</Label>
                  <Select
                    value={formData.equipo2_id}
                    onValueChange={(value) => setFormData({ ...formData, equipo2_id: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar equipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {equipos.map((equipo) => (
                        <SelectItem 
                          key={equipo.id} 
                          value={equipo.id} 
                          disabled={equipo.id === formData.equipo1_id} // Previene selección duplicada
                        >
                          {equipo.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* INFO DEL EQUIPO 2 SELECCIONADO */}
                {equipo2 && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">
                      <span className="font-medium">Entrenador:</span>{" "}
                      {equipo2.entrenadores
                        ? `${equipo2.entrenadores.nombre} ${equipo2.entrenadores.apellido}`
                        : "Sin asignar"}
                    </p>
                    <p className="text-sm mt-1">
                      <span className="font-medium">Atletas disponibles:</span> {atletas2.length}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* SECCIÓN: CONFIGURACIÓN DE ENFRENTAMIENTOS */}
          {formData.equipo1_id && formData.equipo2_id && atletas1.length >= 3 && atletas2.length >= 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Configurar Enfrentamientos (3 peleas)</h3>

              {/* GENERAR 3 CARTAS DE PELEA */}
              {[1, 2, 3].map((num) => (
                <Card key={num}>
                  <CardHeader>
                    <CardTitle className="text-base">Pelea {num}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* SELECTOR ATLETA EQUIPO 1 */}
                      <div className="space-y-2">
                        <Label>Atleta de {equipo1?.nombre}</Label>
                        <Select
                          value={formData[`atleta1_pelea${num}` as keyof typeof formData] as string}
                          onValueChange={(value) => setFormData({ ...formData, [`atleta1_pelea${num}`]: value } as any)}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar atleta" />
                          </SelectTrigger>
                          <SelectContent>
                            {atletas1.map((atleta) => (
                              <SelectItem key={atleta.id} value={atleta.id}>
                                {atleta.nombre} {atleta.apellido} - {atleta.cinturon}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* SELECTOR ATLETA EQUIPO 2 */}
                      <div className="space-y-2">
                        <Label>Atleta de {equipo2?.nombre}</Label>
                        <Select
                          value={formData[`atleta2_pelea${num}` as keyof typeof formData] as string}
                          onValueChange={(value) => setFormData({ ...formData, [`atleta2_pelea${num}`]: value } as any)}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar atleta" />
                          </SelectTrigger>
                          <SelectContent>
                            {atletas2.map((atleta) => (
                              <SelectItem key={atleta.id} value={atleta.id}>
                                {atleta.nombre} {atleta.apellido} - {atleta.cinturon}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* SECCIÓN: INFORMACIÓN ADICIONAL DEL COMBATE */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* FECHA DEL COMBATE */}
            <div className="space-y-2">
              <Label htmlFor="fecha_combate">Fecha del Combate</Label>
              <Input
                id="fecha_combate"
                type="date"
                value={formData.fecha_combate}
                onChange={(e) => setFormData({ ...formData, fecha_combate: e.target.value })}
              />
            </div>

            {/* JUEZ PRINCIPAL */}
            <div className="space-y-2">
              <Label htmlFor="juez_principal_id">Juez Principal</Label>
              <Select
                value={formData.juez_principal_id}
                onValueChange={(value) => setFormData({ ...formData, juez_principal_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar juez (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin asignar</SelectItem>
                  {jueces.map((juez) => (
                    <SelectItem key={juez.id} value={juez.id}>
                      {juez.nombre} {juez.apellido}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* NOTAS ADICIONALES */}
          <div className="space-y-2">
            <Label htmlFor="notas">Notas</Label>
            <Textarea
              id="notas"
              value={formData.notas}
              onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
              placeholder="Información adicional sobre el combate..."
              rows={3}
            />
          </div>

          {/* MENSAJES DE ERROR */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* BOTONES DE ACCIÓN */}
          <div className="flex gap-2">
            <Button 
              type="submit" 
              disabled={loading || atletas1.length < 3 || atletas2.length < 3}
            >
              {loading ? "Creando..." : "Crear Combate por Equipos"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

/**
 * MEJORAS FUTURAS SUGERIDAS:
 * 
 * 1. Validación de atletas duplicados (mismo atleta en múltiples peleas)
 * 2. Sistema de pesos y categorías para emparejamientos más justos
 * 3. Previsualización de los enfrentamientos configurados
 * 4. Historial de combates previos entre los equipos
 * 5. Notificaciones a entrenadores sobre el combate programado
 * 6. Soporte para más de 3 enfrentamientos (configurable)
 */