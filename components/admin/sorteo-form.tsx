"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Shuffle, Swords, Calendar } from "lucide-react"
import { generarSorteo } from "@/lib/karate-simulador"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function SorteoForm({ atletas, jueces }: { atletas: any[]; jueces: any[] }) {
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [atletasSeleccionados, setAtletasSeleccionados] = useState<string[]>([])
  const [parejas, setParejas] = useState<Array<[any, any]>>([])
  const [categoria, setCategoria] = useState("")
  const [duracion, setDuracion] = useState("1")
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0])
  const [juezId, setJuezId] = useState("")

  const toggleAtleta = (id: string) => {
    setAtletasSeleccionados((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]))
    setParejas([]) // Reset parejas cuando cambian los atletas
  }

  const handleGenerarSorteo = () => {
    const atletasParaSorteo = atletas.filter((a) => atletasSeleccionados.includes(a.id))

    if (atletasParaSorteo.length < 2) {
      setError("Selecciona al menos 2 atletas para el sorteo")
      return
    }

    if (atletasParaSorteo.length % 2 !== 0) {
      setError("Selecciona un número par de atletas")
      return
    }

    const nuevasParejas = generarSorteo(atletasParaSorteo)
    setParejas(nuevasParejas)
    setError(null)
  }

  const handleCrearCombates = async () => {
    if (!categoria || !juezId || parejas.length === 0) {
      setError("Completa todos los campos y genera el sorteo primero")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const combates = parejas.map(([atleta1, atleta2]) => ({
        atleta1_id: atleta1.id,
        atleta2_id: atleta2.id,
        categoria,
        duracion_minutos: Number.parseInt(duracion),
        fecha_combate: fecha,
        juez_id: juezId,
        estado: "programado",
        puntos_atleta1: 0,
        puntos_atleta2: 0,
      }))

      const { error: insertError } = await supabase.from("combates_individuales").insert(combates)

      if (insertError) throw insertError

      setSuccess(true)
      setTimeout(() => {
        router.push("/admin/combates")
        router.refresh()
      }, 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shuffle className="h-5 w-5" />
            Configuración del Sorteo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Categoría</Label>
              <Input
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                placeholder="Ej: Kumite Masculino"
              />
            </div>

            <div className="space-y-2">
              <Label>Duración (minutos)</Label>
              <Select value={duracion} onValueChange={setDuracion}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 minuto</SelectItem>
                  <SelectItem value="2">2 minutos</SelectItem>
                  <SelectItem value="3">3 minutos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Fecha del Combate</Label>
              <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Juez</Label>
              <Select value={juezId} onValueChange={setJuezId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un juez" />
                </SelectTrigger>
                <SelectContent>
                  {jueces.map((juez) => (
                    <SelectItem key={juez.id} value={juez.id}>
                      {juez.nombre} {juez.apellido}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Seleccionar Atletas ({atletasSeleccionados.length} seleccionados)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {atletas.map((atleta) => (
              <Button
                key={atleta.id}
                variant={atletasSeleccionados.includes(atleta.id) ? "default" : "outline"}
                onClick={() => toggleAtleta(atleta.id)}
                className="justify-start"
              >
                {atleta.nombre} {atleta.apellido}
              </Button>
            ))}
          </div>

          <div className="mt-4 flex gap-2">
            <Button onClick={handleGenerarSorteo} disabled={atletasSeleccionados.length < 2}>
              <Shuffle className="mr-2 h-4 w-4" />
              Generar Sorteo
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setAtletasSeleccionados([])
                setParejas([])
              }}
            >
              Limpiar Selección
            </Button>
          </div>
        </CardContent>
      </Card>

      {parejas.length > 0 && (
        <Card className="border-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Swords className="h-5 w-5 text-green-600" />
              Combates Generados ({parejas.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {parejas.map(([atleta1, atleta2], idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-red-50 to-blue-50 dark:from-red-950 dark:to-blue-950"
              >
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="text-lg">
                    #{idx + 1}
                  </Badge>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-red-600">
                      {atleta1.nombre} {atleta1.apellido}
                    </span>
                    <Swords className="h-5 w-5 text-muted-foreground" />
                    <span className="font-semibold text-blue-600">
                      {atleta2.nombre} {atleta2.apellido}
                    </span>
                  </div>
                </div>
                <Badge>{atleta1.cinturon}</Badge>
              </div>
            ))}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-500">
                <AlertDescription className="text-green-600">
                  ¡Combates creados exitosamente! Redirigiendo...
                </AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleCrearCombates}
              disabled={loading || !categoria || !juezId}
              size="lg"
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <Calendar className="mr-2 h-5 w-5" />
              Crear {parejas.length} Combates
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}