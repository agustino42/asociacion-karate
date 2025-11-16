import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Plus, Shuffle } from "lucide-react"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CombatesIndividualesTable } from "@/components/admin/combates-individuales-table"
import { CombatesEquiposTable } from "@/components/admin/combates-equipos-table"

type SearchParams = {
  pageInd?: string
  pageEq?: string
}

export default async function CombatesPage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = await getSupabaseServerClient()
  
  const pageInd = parseInt(searchParams.pageInd || '1')
  const pageEq = parseInt(searchParams.pageEq || '1')
  const itemsPerPage = 5
  
  const fromInd = (pageInd - 1) * itemsPerPage
  const toInd = fromInd + itemsPerPage - 1
  const fromEq = (pageEq - 1) * itemsPerPage
  const toEq = fromEq + itemsPerPage - 1

  const [{ data: combatesIndividuales, count: countInd }, { data: combatesEquipos, count: countEq }] = await Promise.all([
    supabase
      .from("combates_individuales")
      .select(
        `
        *,
        atleta1:atletas!combates_individuales_atleta1_id_fkey(id, nombre, apellido),
        atleta2:atletas!combates_individuales_atleta2_id_fkey(id, nombre, apellido),
        ganador:atletas!combates_individuales_ganador_id_fkey(id, nombre, apellido),
        juez:jueces(id, nombre, apellido)
      `,
        { count: 'exact' }
      )
      .order("fecha_combate", { ascending: false })
      .range(fromInd, toInd),
    supabase
      .from("combates_equipos")
      .select(
        `
        *,
        equipo1:equipos!combates_equipos_equipo1_id_fkey(id, nombre),
        equipo2:equipos!combates_equipos_equipo2_id_fkey(id, nombre),
        equipo_ganador:equipos!combates_equipos_equipo_ganador_id_fkey(id, nombre),
        juez:jueces(id, nombre, apellido)
      `,
        { count: 'exact' }
      )
      .order("fecha_combate", { ascending: false })
      .range(fromEq, toEq),
  ])
  
  const totalPagesInd = Math.ceil((countInd || 0) / itemsPerPage)
  const totalPagesEq = Math.ceil((countEq || 0) / itemsPerPage)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sistema de Combates</h1>
          <p className="text-muted-foreground">Gestiona combates individuales y por equipos</p>
        </div>
      </div>

      <Tabs defaultValue="individuales" className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <TabsList>
            <TabsTrigger value="individuales">Combates 1v1</TabsTrigger>
            <TabsTrigger value="equipos">Combates por Equipos</TabsTrigger>
          </TabsList>
          <div className="flex gap-2 flex-wrap">
            <Link href="/admin/combates/sorteo">
              <Button variant="secondary">
                <Shuffle className="mr-2 h-4 w-4" />
                Generar Sorteo
              </Button>
            </Link>
            <Link href="/admin/combates/nuevo-individual">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Combate 1v1
              </Button>
            </Link>
            <Link href="/admin/combates/nuevo-equipo">
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Combate por Equipos
              </Button>
            </Link>
          </div>
        </div>

        <TabsContent value="individuales">
          <CombatesIndividualesTable 
            combates={combatesIndividuales || []} 
            currentPage={pageInd}
            totalPages={totalPagesInd}
            totalItems={countInd || 0}
          />
        </TabsContent>

        <TabsContent value="equipos">
          <CombatesEquiposTable 
            combates={combatesEquipos || []} 
            currentPage={pageEq}
            totalPages={totalPagesEq}
            totalItems={countEq || 0}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
