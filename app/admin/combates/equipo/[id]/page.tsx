import { getSupabaseServerClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { GestionarCombateEquipo } from "@/components/admin/gestionar-combate-equipo"

export default async function CombateEquipoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await getSupabaseServerClient()

  const { data: combate } = await supabase
    .from("combates_equipos")
    .select(
      `
      *,
      equipo1:equipos!combates_equipos_equipo1_id_fkey(id, nombre),
      equipo2:equipos!combates_equipos_equipo2_id_fkey(id, nombre),
      equipo_ganador:equipos!combates_equipos_equipo_ganador_id_fkey(id, nombre),
      juez:jueces(id, nombre, apellido)
    `,
    )
    .eq("id", id)
    .single()

  if (!combate) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestionar Combate por Equipos</h1>
        <p className="text-muted-foreground">
          {combate.equipo1.nombre} vs {combate.equipo2.nombre}
        </p>
      </div>

      <GestionarCombateEquipo combate={combate} />
    </div>
  )
}
