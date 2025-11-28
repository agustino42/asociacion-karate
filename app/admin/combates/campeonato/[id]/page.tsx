import { getSupabaseServerClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import JuecesControlPanel from "@/components/admin/JuecesControlPanel"

export default async function CombateCampeonatoPage({ params }: { params: Promise<{ id: string }> }) {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black">
      <div className="container mx-auto px-4 py-6">
        {/* Header del combate */}
        <div className="mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-xl shadow-xl">
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              🥋 COMBATE DE CAMPEONATO
            </h1>
            <div className="text-lg md:text-xl">
              <span className="bg-blue-500/30 px-3 py-1 rounded-full mr-2">
                {combate.atleta1.nombre} {combate.atleta1.apellido}
              </span>
              <span className="text-yellow-300 font-bold">VS</span>
              <span className="bg-red-500/30 px-3 py-1 rounded-full ml-2">
                {combate.atleta2.nombre} {combate.atleta2.apellido}
              </span>
            </div>
            <div className="text-sm mt-2 opacity-80">
              Ronda {combate.ronda} - Posición {combate.posicion}
              {combate.juez && ` • Juez: ${combate.juez.nombre} ${combate.juez.apellido}`}
            </div>
          </div>
        </div>

        <JuecesControlPanel 
          combateData={combate}
        />
      </div>
    </div>
  )
}