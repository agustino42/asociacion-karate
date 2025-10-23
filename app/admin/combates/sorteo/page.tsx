import { getSupabaseServerClient } from "@/lib/supabase/server"
import { SorteoForm } from "@/components/admin/sorteo-form"

export default async function SorteoPage() {
  const supabase = await getSupabaseServerClient()

  const { data: atletas } = await supabase.from("atletas").select("*").eq("activo", true).order("nombre")

  const { data: jueces } = await supabase.from("jueces").select("*").order("nombre")

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Sistema de Sorteos</h1>
        <p className="text-muted-foreground">Genera combates automáticamente mediante sorteo aleatorio</p>
      </div>

      <SorteoForm atletas={atletas || []} jueces={jueces || []} />
    </div>
  )
}
