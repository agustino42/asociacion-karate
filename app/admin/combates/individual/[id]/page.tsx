import { getSupabaseServerClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { GestionarCombateIndividual } from "@/components/admin/gestionar-combate-individual"

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
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestionar Combate Individual</h1>
        <p className="text-muted-foreground">
          {combate.atleta1.nombre} {combate.atleta1.apellido} vs {combate.atleta2.nombre} {combate.atleta2.apellido}
        </p>
      </div>

      <GestionarCombateIndividual combate={combate} />
    </div>
  )
}
