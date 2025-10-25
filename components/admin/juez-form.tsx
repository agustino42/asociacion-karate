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
import { crearJuez, actualizarJuez, type JuezFormData } from "@/app/actions/jueces"
import { useRouter } from "next/navigation"

type JuezFormProps = {
  juez?: any
}

export function JuezForm({ juez }: JuezFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    nombre: juez?.nombre || "",
    apellido: juez?.apellido || "",
    cedula: juez?.cedula || "",
    nivel_certificacion: juez?.nivel_certificacion || "",
    anos_experiencia: juez?.anos_experiencia || "",
    telefono: juez?.telefono || "",
    email: juez?.email || "",
    activo: juez?.activo ?? true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const dataToSubmit: JuezFormData = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        cedula: formData.cedula,
        nivel_certificacion: formData.nivel_certificacion,
        anos_experiencia: Number.parseInt(formData.anos_experiencia),
        telefono: formData.telefono || undefined,
        email: formData.email || undefined,
        activo: formData.activo,
      }

      if (juez) {
        await actualizarJuez(juez.id, dataToSubmit)
      } else {
        await crearJuez(dataToSubmit)
      }
    } catch (err: any) {
      console.error("[] Error en formulario:", err)
      setError(err.message || "Error al guardar el juez")
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{juez ? "Editar Juez" : "Nuevo Juez"}</CardTitle>
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
            <Label htmlFor="nivel_certificacion">Nivel de Certificación *</Label>
            <Select
              value={formData.nivel_certificacion}
              onValueChange={(value) => setFormData({ ...formData, nivel_certificacion: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar nivel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Regional Nivel C">Regional Nivel C</SelectItem>
                <SelectItem value="Nacional Nivel B">Nacional Nivel B</SelectItem>
                <SelectItem value="Internacional Nivel A">Internacional Nivel A</SelectItem>
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
            <Label htmlFor="activo">Juez activo</Label>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : juez ? "Actualizar" : "Crear Juez"}
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
