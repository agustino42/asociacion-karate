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

type Equipo = {
  id: string
  nombre: string
  entrenadores: { nombre: string; apellido: string } | null
}

type Juez = {
  id: string
  nombre: string
  apellido: string
}

type Atleta = {
  id: string
  nombre: string
  apellido: string
  cinturon: string
}

export function CombateEquipoForm({ equipos, jueces }: { equipos: Equipo[]; jueces: Juez[] }) {
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [atletas1, setAtletas1] = useState<Atleta[]>([])
  const [atletas2, setAtletas2] = useState<Atleta[]>([])

  const [formData, setFormData] = useState({
    equipo1_id: "",
    equipo2_id: "",
    juez_principal_id: "",
    fecha_combate: new Date().toISOString().split("T")[0],
    notas: "",
    // Atletas seleccionados para cada enfrentamiento
    atleta1_pelea1: "",
    atleta2_pelea1: "",
    atleta1_pelea2: "",
    atleta2_pelea2: "",
    atleta1_pelea3: "",
    atleta2_pelea3: "",
  })

  const equipo1 = equipos.find((e) => e.id === formData.equipo1_id)
  const equipo2 = equipos.find((e) => e.id === formData.equipo2_id)

  // Cargar atletas del equipo 1
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

  // Cargar atletas del equipo 2
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

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
      // Crear el combate por equipos
      const { data: combate, error: combateError } = await supabase
        .from("combates_equipos")
        .insert([
          {
            equipo1_id: formData.equipo1_id,
            equipo2_id: formData.equipo2_id,
            juez_principal_id: formData.juez_principal_id || null,
            fecha_combate: new Date(formData.fecha_combate).toISOString(),
            notas: formData.notas || null,
            estado: "programado",
          },
        ])
        .select()
        .single()

      if (combateError) throw combateError

      // Crear los 3 enfrentamientos individuales
      const enfrentamientos = [
        {
          combate_equipo_id: combate.id,
          atleta_equipo1_id: formData.atleta1_pelea1,
          atleta_equipo2_id: formData.atleta2_pelea1,
          orden_pelea: 1,
        },
        {
          combate_equipo_id: combate.id,
          atleta_equipo1_id: formData.atleta1_pelea2,
          atleta_equipo2_id: formData.atleta2_pelea2,
          orden_pelea: 2,
        },
        {
          combate_equipo_id: combate.id,
          atleta_equipo1_id: formData.atleta1_pelea3,
          atleta_equipo2_id: formData.atleta2_pelea3,
          orden_pelea: 3,
        },
      ]

      const { error: enfrentamientosError } = await supabase.from("enfrentamientos_equipo").insert(enfrentamientos)

      if (enfrentamientosError) throw enfrentamientosError

      router.push("/admin/combates")
      router.refresh()
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
          <div className="grid md:grid-cols-2 gap-6">
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
                        <SelectItem key={equipo.id} value={equipo.id} disabled={equipo.id === formData.equipo2_id}>
                          {equipo.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
                        <SelectItem key={equipo.id} value={equipo.id} disabled={equipo.id === formData.equipo1_id}>
                          {equipo.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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

          {formData.equipo1_id && formData.equipo2_id && atletas1.length >= 3 && atletas2.length >= 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Configurar Enfrentamientos (3 peleas)</h3>

              {[1, 2, 3].map((num) => (
                <Card key={num}>
                  <CardHeader>
                    <CardTitle className="text-base">Pelea {num}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
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

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fecha_combate">Fecha del Combate</Label>
              <Input
                id="fecha_combate"
                type="date"
                value={formData.fecha_combate}
                onChange={(e) => setFormData({ ...formData, fecha_combate: e.target.value })}
              />
            </div>

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

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={loading || atletas1.length < 3 || atletas2.length < 3}>
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
