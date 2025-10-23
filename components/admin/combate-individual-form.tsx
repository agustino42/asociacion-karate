"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Swords } from "lucide-react"

type Atleta = {
  id: string
  nombre: string
  apellido: string
  categoria_peso: string
  cinturon: string
}

type Juez = {
  id: string
  nombre: string
  apellido: string
}

export function CombateIndividualForm({ atletas, jueces }: { atletas: Atleta[]; jueces: Juez[] }) {
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    atleta1_id: "",
    atleta2_id: "",
    juez_principal_id: "",
    categoria: "Kumite",
    duracion_minutos: "3",
    fecha_combate: new Date().toISOString().split("T")[0],
    notas: "",
  })

  const atleta1 = atletas.find((a) => a.id === formData.atleta1_id)
  const atleta2 = atletas.find((a) => a.id === formData.atleta2_id)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (formData.atleta1_id === formData.atleta2_id) {
      setError("Debes seleccionar dos atletas diferentes")
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.from("combates_individuales").insert([
        {
          atleta1_id: formData.atleta1_id,
          atleta2_id: formData.atleta2_id,
          juez_principal_id: formData.juez_principal_id || null,
          categoria: formData.categoria,
          duracion_minutos: Number.parseInt(formData.duracion_minutos),
          fecha_combate: new Date(formData.fecha_combate).toISOString(),
          notas: formData.notas || null,
          estado: "programado",
        },
      ])

      if (error) throw error

      router.push("/admin/combates")
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Error al crear el combate")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Swords className="h-5 w-5" />
          Configuración del Combate
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-lg">Atleta 1 (Rojo)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="atleta1_id">Seleccionar Atleta *</Label>
                  <Select
                    value={formData.atleta1_id}
                    onValueChange={(value) => setFormData({ ...formData, atleta1_id: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar atleta" />
                    </SelectTrigger>
                    <SelectContent>
                      {atletas.map((atleta) => (
                        <SelectItem key={atleta.id} value={atleta.id} disabled={atleta.id === formData.atleta2_id}>
                          {atleta.nombre} {atleta.apellido} - {atleta.cinturon}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {atleta1 && (
                  <div className="p-3 bg-muted rounded-lg space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">Categoría:</span> {atleta1.categoria_peso}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Cinturón:</span> {atleta1.cinturon}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-lg">Atleta 2 (Azul)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="atleta2_id">Seleccionar Atleta *</Label>
                  <Select
                    value={formData.atleta2_id}
                    onValueChange={(value) => setFormData({ ...formData, atleta2_id: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar atleta" />
                    </SelectTrigger>
                    <SelectContent>
                      {atletas.map((atleta) => (
                        <SelectItem key={atleta.id} value={atleta.id} disabled={atleta.id === formData.atleta1_id}>
                          {atleta.nombre} {atleta.apellido} - {atleta.cinturon}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {atleta2 && (
                  <div className="p-3 bg-muted rounded-lg space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">Categoría:</span> {atleta2.categoria_peso}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Cinturón:</span> {atleta2.cinturon}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoría</Label>
              <Select
                value={formData.categoria}
                onValueChange={(value) => setFormData({ ...formData, categoria: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Kumite">Kumite</SelectItem>
                  <SelectItem value="Kata">Kata</SelectItem>
                  <SelectItem value="Exhibición">Exhibición</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duracion_minutos">Duración (minutos)</Label>
              <Input
                id="duracion_minutos"
                type="number"
                value={formData.duracion_minutos}
                onChange={(e) => setFormData({ ...formData, duracion_minutos: e.target.value })}
                min="1"
                max="10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fecha_combate">Fecha del Combate</Label>
              <Input
                id="fecha_combate"
                type="date"
                value={formData.fecha_combate}
                onChange={(e) => setFormData({ ...formData, fecha_combate: e.target.value })}
              />
            </div>
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
                <SelectItem value="0">Sin asignar</SelectItem>
                {jueces.map((juez) => (
                  <SelectItem key={juez.id} value={juez.id}>
                    {juez.nombre} {juez.apellido}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <Button type="submit" disabled={loading}>
              {loading ? "Creando..." : "Crear Combate"}
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
