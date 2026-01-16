import { getSupabaseServerClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { GestionarCombateIndividualNuevo } from "@/components/admin/gestionar-combate-individual-nuevo"

export default async function CombateIndividualPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await getSupabaseServerClient()

  const { data: combate } = await supabase
    .from("combates_individuales")
    .select(
      `
      *,
      atleta1:atleta1_id(id, nombre, apellido, cinturon, equipo:equipo_id(nombre)),
      atleta2:atleta2_id(id, nombre, apellido, cinturon, equipo:equipo_id(nombre)),
      ganador:ganador_id(id, nombre, apellido),
      juez:juez_principal_id(id, nombre, apellido)
    `,
    )
    .eq("id", id)
    .single()

  if (!combate) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <GestionarCombateIndividualNuevo combate={combate} />
    </div>
  )
}
