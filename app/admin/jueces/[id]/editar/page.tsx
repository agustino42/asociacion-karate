import { JuezForm } from "@/components/admin/juez-form"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

export default async function EditarJuezPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await getSupabaseServerClient()

  const { data: juez } = await supabase.from("jueces").select("*").eq("id", id).single()

  if (!juez) {
    notFound()
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Editar Juez</h1>
        <p className="text-muted-foreground">
          Modificando información de {juez.nombre} {juez.apellido}
        </p>
      </div>

      <JuezForm juez={juez} />
    </div>
  )
}
