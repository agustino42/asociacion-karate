import { CombateEquipoForm } from "@/components/admin/combate-equipo-form"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export default async function NuevoCombateEquipoPage() {
  const supabase = await getSupabaseServerClient()

  const [{ data: equipos }, { data: jueces }] = await Promise.all([
    supabase
      .from("equipos")
      .select(
        `
        id, 
        nombre,
        entrenadores(nombre, apellido)
      `,
      )
      .order("nombre"),
    supabase.from("jueces").select("id, nombre, apellido").eq("activo", true).order("nombre"),
  ])

  // Transform equipos data to match expected type
  const equiposTransformed = equipos?.map(equipo => ({
    ...equipo,
    entrenadores: Array.isArray(equipo.entrenadores) && equipo.entrenadores.length > 0 
      ? equipo.entrenadores[0] 
      : null
  })) || []

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nuevo Combate por Equipos</h1>
        <p className="text-muted-foreground">Configura un combate entre dos equipos (3 atletas cada uno)</p>
      </div>

      <CombateEquipoForm equipos={equiposTransformed} jueces={jueces || []} />
    </div>
  )
}
