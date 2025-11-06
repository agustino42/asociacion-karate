import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"

interface ProximoCombate {
  id: string
  atleta1: { nombre: string; apellido: string }
  atleta2: { nombre: string; apellido: string }
  fecha_combate: string
  categoria: string
}

interface ProximosCombatesProps {
  combates: ProximoCombate[]
}

export default function ProximosCombates({ combates }: ProximosCombatesProps) {
  if (!combates || combates.length === 0) return null

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3">
        <Clock className="h-8 w-8 text-blue-600" />
        <div>
          <h2 className="text-3xl font-bold">Próximos Combates</h2>
          <p className="text-muted-foreground">Batallas programadas</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {combates.map((combate) => (
          <Card key={combate.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="space-y-3">
                {/* INFORMACIÓN DEL COMBATE */}
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{new Date(combate.fecha_combate).toLocaleDateString()}</Badge>
                  <Badge variant="outline">{combate.categoria}</Badge>
                </div>
                
                {/* NOMBRES DE LOS ATLETAS */}
                <div className="text-center">
                  <p className="font-semibold">
                    {combate.atleta1.nombre} {combate.atleta1.apellido}
                  </p>
                  <p className="text-sm text-muted-foreground my-2">VS</p>
                  <p className="font-semibold">
                    {combate.atleta2.nombre} {combate.atleta2.apellido}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}