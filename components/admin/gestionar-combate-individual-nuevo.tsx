"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import JuecesControlPanel from "./JuecesControlPanel"

export function GestionarCombateIndividualNuevo({ combate }: { combate: any }) {
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFinalizarCombate = async (ganador: any, razon: string) => {
    setLoading(true)
    setError(null)

    try {
      // Determinar el ID del ganador basado en el nombre
      let ganadorId = null
      if (ganador.name.includes(combate.atleta1.nombre) && ganador.name.includes(combate.atleta1.apellido)) {
        ganadorId = combate.atleta1.id
      } else if (ganador.name.includes(combate.atleta2.nombre) && ganador.name.includes(combate.atleta2.apellido)) {
        ganadorId = combate.atleta2.id
      }

      // Actualizar el combate en la base de datos
      const { error: combateError } = await supabase
        .from("combates_individuales")
        .update({
          ganador_id: ganadorId,
          estado: "finalizado",
          resultado: razon
        })
        .eq("id", combate.id)

      if (combateError) throw combateError

      // Actualizar rankings si hay ganador
      if (ganadorId) {
        const perdedorId = ganadorId === combate.atleta1.id ? combate.atleta2.id : combate.atleta1.id

        await Promise.all([
          supabase.rpc("actualizar_ranking_atleta", {
            p_atleta_id: ganadorId,
            p_resultado: "victoria",
            p_puntos: 3,
          }),
          supabase.rpc("actualizar_ranking_atleta", {
            p_atleta_id: perdedorId,
            p_resultado: "derrota",
            p_puntos: 0,
          }),
        ])

        await supabase.rpc("recalcular_posiciones_atletas")
      }

      // Redirigir de vuelta
      router.push("/admin/combates")
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Panel de Control del Combate</h2>
          <p className="text-muted-foreground">
            {combate.atleta1.nombre} {combate.atleta1.apellido} vs {combate.atleta2.nombre} {combate.atleta2.apellido}
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          disabled={loading}
        >
          Volver
        </Button>
      </div>

      <JuecesControlPanel 
        combateData={combate}
        onFinalizarCombate={handleFinalizarCombate}
      />
    </div>
  )
}