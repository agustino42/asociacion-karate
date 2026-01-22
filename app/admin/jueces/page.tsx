import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { JuecesTable } from "@/components/admin/jueces-table"
import JuecesControlPanel from "@/components/admin/JuecesControlPanel"
import KataControlPanel from "@/components/home-frontend/KataControlPanel"


export default async function JuecesPage() {
  const supabase = await createClient()

  const { data: jueces } = await supabase.from("jueces").select("*").order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Jueces</h1>
          <p className="text-muted-foreground">Gestiona los jueces de la asociación</p>
        </div>
        <Link href="/admin/jueces/nuevo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Agregar Juez
          </Button>
        </Link>
      </div>

      <JuecesTable jueces={jueces || []} />
      <KataControlPanel />
    </div>
  )
}
