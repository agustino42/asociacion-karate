import { CombateIndividualForm } from "@/components/admin/combate-individual-form"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export default async function NuevoCombateIndividualPage() {
  const supabase = await getSupabaseServerClient()

  const [{ data: atletas }, { data: jueces }] = await Promise.all([
    supabase
      .from("atletas")
      .select("id, nombre, apellido, categoria_peso, cinturon")
      .eq("activo", true)
      .order("nombre"),
    supabase.from("jueces").select("id, nombre, apellido").eq("activo", true).order("nombre"),
  ])

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nuevo Combate Individual (1v1)</h1>
        <p className="text-muted-foreground">Configura un combate entre dos atletas</p>
      </div>

      <CombateIndividualForm atletas={atletas || []} jueces={jueces || []} />
    </div>
  )
}
