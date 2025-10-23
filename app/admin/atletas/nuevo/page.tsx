import { AtletaForm } from "@/components/admin/atleta-form"
import { createClient } from "@/lib/supabase/server"

export default async function NuevoAtletaPage() {
  const supabase = await createClient()

  const { data: equipos } = await supabase.from("equipos").select("id, nombre").order("nombre")

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Agregar Atleta</h1>
        <p className="text-muted-foreground">Completa el formulario para registrar un nuevo atleta</p>
      </div>

      <AtletaForm equipos={equipos || []} />
    </div>
  )
}
