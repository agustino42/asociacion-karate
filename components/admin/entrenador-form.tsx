"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { crearEntrenador, actualizarEntrenador, type EntrenadorFormData } from "@/app/actions/entrenadores"
import { useRouter } from "next/navigation"

type EntrenadorFormProps = {
  entrenador?: any
}

export function EntrenadorForm({ entrenador }: EntrenadorFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    nombre: entrenador?.nombre || "",
    apellido: entrenador?.apellido || "",
    cedula: entrenador?.cedula || "",
    anos_experiencia: entrenador?.anos_experiencia || "",
    especialidad: entrenador?.especialidad || "",
    telefono: entrenador?.telefono || "",
    email: entrenador?.email || "",
    activo: entrenador?.activo ?? true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const dataToSubmit: EntrenadorFormData = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        cedula: formData.cedula,
        anos_experiencia: Number.parseInt(formData.anos_experiencia),
        especialidad: formData.especialidad,
        telefono: formData.telefono || undefined,
        email: formData.email || undefined,
        activo: formData.activo,
      }

      if (entrenador) {
        await actualizarEntrenador(entrenador.id, dataToSubmit)
      } else {
        await crearEntrenador(dataToSubmit)
      }
    } catch (err: any) {
      console.error("[] Error en formulario:", err)
      setError(err.message || "Error al guardar el entrenador")
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{entrenador ? "Editar Entrenador" : "Nuevo Entrenador"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apellido">Apellido *</Label>
              <Input
                id="apellido"
                value={formData.apellido}
                onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cedula">Cédula *</Label>
              <Input
                id="cedula"
                value={formData.cedula}
                onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="anos_experiencia">Años de Experiencia *</Label>
              <Input
                id="anos_experiencia"
                type="number"
                value={formData.anos_experiencia}
                onChange={(e) => setFormData({ ...formData, anos_experiencia: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="especialidad">Especialidad</Label>
            <Select
              value={formData.especialidad}
              onValueChange={(value) => setFormData({ ...formData, especialidad: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar especialidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Kumite">Kumite (Combate)</SelectItem>
                <SelectItem value="Kata">Kata (Formas)</SelectItem>
                <SelectItem value="Ambos">Ambos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                type="tel"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="activo"
              checked={formData.activo}
              onCheckedChange={(checked) => setFormData({ ...formData, activo: checked })}
            />
            <Label htmlFor="activo">Entrenador activo</Label>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : entrenador ? "Actualizar" : "Crear Entrenador"}
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
