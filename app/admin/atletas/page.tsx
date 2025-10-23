import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { AtletasTable } from "@/components/admin/atletas-table"

export default async function AtletasPage() {
  const supabase = await createClient()

  const { data: atletas } = await supabase
    .from("atletas")
    .select(
      `
      *,
      equipos (
        id,
        nombre
      )
    `,
    )
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Atletas</h1>
          <p className="text-muted-foreground">Gestiona los atletas de la asociación</p>
        </div>
        <Link href="/admin/atletas/nuevo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Agregar Atleta
          </Button>
        </Link>
      </div>

      <AtletasTable atletas={atletas || []} />
    </div>
  )
}
