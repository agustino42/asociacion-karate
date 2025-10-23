import { AtletaForm } from "@/components/admin/atleta-form"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

export default async function EditarAtletaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: atleta }, { data: equipos }] = await Promise.all([
    supabase.from("atletas").select("*").eq("id", id).single(),
    supabase.from("equipos").select("id, nombre").order("nombre"),
  ])

  if (!atleta) {
    notFound()
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Editar Atleta</h1>
        <p className="text-muted-foreground">
          Modificando información de {atleta.nombre} {atleta.apellido}
        </p>
      </div>

      <AtletaForm equipos={equipos || []} atleta={atleta} />
    </div>
  )
}
