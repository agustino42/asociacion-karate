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
import { crearAtleta, actualizarAtleta, type AtletaFormData } from "@/app/actions/atletas"
import { useRouter } from "next/navigation"

type Equipo = {
  id: string
  nombre: string
}

type AtletaFormProps = {
  equipos: Equipo[]
  atleta?: any
}

export function AtletaForm({ equipos, atleta }: AtletaFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    nombre: atleta?.nombre || "",
    apellido: atleta?.apellido || "",
    cedula: atleta?.cedula || "",
    fecha_nacimiento: atleta?.fecha_nacimiento || "",
    peso: atleta?.peso || "",
    categoria_peso: atleta?.categoria_peso || "Ligero",
    cinturon: atleta?.cinturon || "Blanco",
    equipo_id: atleta?.equipo_id || "default",
    activo: atleta?.activo ?? true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const dataToSubmit: AtletaFormData = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        cedula: formData.cedula,
        fecha_nacimiento: formData.fecha_nacimiento,
        peso: formData.peso ? Number.parseFloat(formData.peso) : undefined,
        categoria_peso: formData.categoria_peso,
        cinturon: formData.cinturon,
        equipo_id: formData.equipo_id || undefined,
        activo: formData.activo,
      }

      if (atleta) {
        await actualizarAtleta(atleta.id, dataToSubmit)
      } else {
        await crearAtleta(dataToSubmit)
      }
    } catch (err: any) {
      console.error("[v0] Error en formulario:", err)
      setError(err.message || "Error al guardar el atleta")
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{atleta ? "Editar Atleta" : "Nuevo Atleta"}</CardTitle>
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
              <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento *</Label>
              <Input
                id="fecha_nacimiento"
                type="date"
                value={formData.fecha_nacimiento}
                onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="peso">Peso (kg)</Label>
              <Input
                id="peso"
                type="number"
                step="0.1"
                value={formData.peso}
                onChange={(e) => setFormData({ ...formData, peso: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoria_peso">Categoría de Peso</Label>
              <Select
                value={formData.categoria_peso}
                onValueChange={(value) => setFormData({ ...formData, categoria_peso: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ligero">Ligero</SelectItem>
                  <SelectItem value="Medio">Medio</SelectItem>
                  <SelectItem value="Pesado">Pesado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cinturon">Cinturón *</Label>
              <Select
                value={formData.cinturon}
                onValueChange={(value) => setFormData({ ...formData, cinturon: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cinturón" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Blanco">Blanco</SelectItem>
                  <SelectItem value="Amarillo">Amarillo</SelectItem>
                  <SelectItem value="Naranja">Naranja</SelectItem>
                  <SelectItem value="Verde">Verde</SelectItem>
                  <SelectItem value="Azul">Azul</SelectItem>
                  <SelectItem value="Marrón">Marrón</SelectItem>
                  <SelectItem value="Negro 1er Dan">Negro 1er Dan</SelectItem>
                  <SelectItem value="Negro 2do Dan">Negro 2do Dan</SelectItem>
                  <SelectItem value="Negro 3er Dan">Negro 3er Dan</SelectItem>
                  <SelectItem value="Negro 4to Dan">Negro 4to Dan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="equipo_id">Equipo</Label>
              <Select
                value={formData.equipo_id}
                onValueChange={(value) => setFormData({ ...formData, equipo_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar equipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Sin equipo</SelectItem>
                  {equipos.map((equipo) => (
                    <SelectItem key={equipo.id} value={equipo.id}>
                      {equipo.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="activo"
              checked={formData.activo}
              onCheckedChange={(checked) => setFormData({ ...formData, activo: checked })}
            />
            <Label htmlFor="activo">Atleta activo</Label>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : atleta ? "Actualizar" : "Crear Atleta"}
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
