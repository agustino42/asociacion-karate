import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { EntrenadoresTable } from "@/components/admin/entrenadores-table"

export default async function EntrenadoresPage() {
  const supabase = await createClient()

  const { data: entrenadores } = await supabase
    .from("entrenadores")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Entrenadores</h1>
          <p className="text-muted-foreground">Gestiona los entrenadores de la asociación</p>
        </div>
        <Link href="/admin/entrenadores/nuevo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Agregar Entrenador
          </Button>
        </Link>
      </div>

      <EntrenadoresTable entrenadores={entrenadores || []} />
    </div>
  )
}
