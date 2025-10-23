import { EntrenadorForm } from "@/components/admin/entrenador-form"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

export default async function EditarEntrenadorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await getSupabaseServerClient()

  const { data: entrenador } = await supabase.from("entrenadores").select("*").eq("id", id).single()

  if (!entrenador) {
    notFound()
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Editar Entrenador</h1>
        <p className="text-muted-foreground">
          Modificando información de {entrenador.nombre} {entrenador.apellido}
        </p>
      </div>

      <EntrenadorForm entrenador={entrenador} />
    </div>
  )
}
