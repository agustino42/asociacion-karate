import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Plus, Shuffle, Trophy, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CombatesIndividualesTable } from "@/components/admin/combates-individuales-table"
import { CombatesEquiposTable } from "@/components/admin/combates-equipos-table"
import { LimpiarCombatesButton } from "@/components/admin/limpiar-combates-button"

type SearchParams = {
  pageInd?: string
  pageEq?: string
  pageCamp?: string
}

export default async function CombatesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const supabase = await getSupabaseServerClient()
  const resolvedSearchParams = await searchParams
  
  const pageInd = parseInt(resolvedSearchParams.pageInd || '1')
  const pageEq = parseInt(resolvedSearchParams.pageEq || '1')
  const pageCamp = parseInt(resolvedSearchParams.pageCamp || '1')
  const itemsPerPage = 5
  
  const fromInd = (pageInd - 1) * itemsPerPage
  const toInd = fromInd + itemsPerPage - 1
  const fromEq = (pageEq - 1) * itemsPerPage
  const toEq = fromEq + itemsPerPage - 1
  const fromCamp = (pageCamp - 1) * itemsPerPage
  const toCamp = fromCamp + itemsPerPage - 1

  const [{ data: combatesIndividuales, count: countInd }, { data: combatesEquipos, count: countEq }, { data: combatesCampeonatos, count: countCamp }] = await Promise.all([
    supabase
      .from("combates_individuales")
      .select(
        `
        *,
        atleta1:atleta1_id(id, nombre, apellido),
        atleta2:atleta2_id(id, nombre, apellido),
        ganador:ganador_id(id, nombre, apellido),
        juez:juez_principal_id(id, nombre, apellido)
      `,
        { count: 'exact' }
      )
      .not('categoria', 'like', 'Campeonato%')
      .order("fecha_combate", { ascending: false })
      .range(fromInd, toInd),
    supabase
      .from("combates_equipos")
      .select(
        `
        *,
        equipo1:equipo1_id(id, nombre),
        equipo2:equipo2_id(id, nombre),
        equipo_ganador:equipo_ganador_id(id, nombre),
        juez:juez_principal_id(id, nombre, apellido)
      `,
        { count: 'exact' }
      )
      .order("fecha_combate", { ascending: false })
      .range(fromEq, toEq),
    supabase
      .from("combates_individuales")
      .select(
        `
        *,
        atleta1:atleta1_id(id, nombre, apellido),
        atleta2:atleta2_id(id, nombre, apellido),
        ganador:ganador_id(id, nombre, apellido),
        juez:juez_principal_id(id, nombre, apellido)
      `,
        { count: 'exact' }
      )
      .like('categoria', 'Campeonato%')
      .order("fecha_combate", { ascending: false })
      .range(fromCamp, toCamp),
  ])
  
  const totalPagesInd = Math.ceil((countInd || 0) / itemsPerPage)
  const totalPagesEq = Math.ceil((countEq || 0) / itemsPerPage)
  const totalPagesCamp = Math.ceil((countCamp || 0) / itemsPerPage)

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
            <TabsTrigger value="campeonatos">🏆 Campeonatos</TabsTrigger>
            <TabsTrigger value="equipos">Combates por Equipos</TabsTrigger>
          </TabsList>
          <div className="flex gap-2 flex-wrap">
            <LimpiarCombatesButton />
            <Link href="/admin/combates/campionatos">
              <Button variant="secondary">
                <Trophy className="mr-2 h-4 w-4" />
                Campionatos
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
            pageParam="pageInd"
          />
        </TabsContent>

        <TabsContent value="campeonatos">
          <CombatesIndividualesTable 
            combates={combatesCampeonatos || []} 
            currentPage={pageCamp}
            totalPages={totalPagesCamp}
            totalItems={countCamp || 0}
            pageParam="pageCamp"
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
