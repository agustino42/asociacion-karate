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
      atleta1:atletas!combates_individuales_atleta1_id_fkey(id, nombre, apellido, cinturon),
      atleta2:atletas!combates_individuales_atleta2_id_fkey(id, nombre, apellido, cinturon),
      ganador:atletas!combates_individuales_ganador_id_fkey(id, nombre, apellido),
      juez:jueces(id, nombre, apellido)
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
