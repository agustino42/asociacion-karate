import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Award, Shield, Swords, Trophy, Clock, TrendingUp, Calendar } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SimuladorCombateRapido } from "@/components/admin/simulador-combate-rapido"

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Inicializar variables con valores por defecto
  let atletasCount = 0
  let entrenadoresCount = 0
  let juecesCount = 0
  let combatesCount = 0
  let atletasRecientes: any[] = []
  let entrenadoresRecientes: any[] = []
  let juecesRecientes: any[] = []

  try {
    // Verificar y obtener conteos básicos
    const atletasRes = await supabase.from("atletas").select("*", { count: "exact", head: true })
    if (!atletasRes.error) {
      atletasCount = atletasRes.count || 0
    }

    const entrenadoresRes = await supabase.from("entrenadores").select("*", { count: "exact", head: true })
    if (!entrenadoresRes.error) {
      entrenadoresCount = entrenadoresRes.count || 0
    }

    const juecesRes = await supabase.from("jueces").select("*", { count: "exact", head: true })
    if (!juecesRes.error) {
      juecesCount = juecesRes.count || 0
    }

    // Intentar obtener combates si la tabla existe
    try {
      const combatesRes = await supabase.from("combates_individuales").select("*", { count: "exact", head: true })
      if (!combatesRes.error) {
        combatesCount = combatesRes.count || 0
      }
    } catch (error) {
      console.log("Tabla combates_individuales no existe aún")
    }

    // Obtener datos recientes de atletas
    try {
      const atletasData = await supabase
        .from("atletas")
        .select("*, equipos(nombre)")
        .order("created_at", { ascending: false })
        .limit(5)
      
      if (!atletasData.error) {
        atletasRecientes = atletasData.data || []
      }
    } catch (error) {
      console.log("Error cargando atletas recientes:", error)
    }

    // Obtener datos recientes de entrenadores
    try {
      const entrenadoresData = await supabase
        .from("entrenadores")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5)
      
      if (!entrenadoresData.error) {
        entrenadoresRecientes = entrenadoresData.data || []
      }
    } catch (error) {
      console.log("Error cargando entrenadores recientes:", error)
    }

    // Obtener datos recientes de jueces
    try {
      const juecesData = await supabase
        .from("jueces")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5)
      
      if (!juecesData.error) {
        juecesRecientes = juecesData.data || []
      }
    } catch (error) {
      console.log("Error cargando jueces recientes:", error)
    }

  } catch (error) {
    console.error("Error general cargando datos del dashboard:", error)
  }

  const stats = [
    {
      title: "Atletas",
      value: atletasCount || 0,
      icon: Users,
      href: "/admin/atletas",
      color: "from-blue-500 to-blue-600",
      change: "+12%",
    },
    {
      title: "Entrenadores",
      value: entrenadoresCount || 0,
      icon: Award,
      href: "/admin/entrenadores",
      color: "from-green-500 to-green-600",
      change: "+5%",
    },
    {
      title: "Jueces",
      value: juecesCount || 0,
      icon: Shield,
      href: "/admin/jueces",
      color: "from-purple-500 to-purple-600",
      change: "+2%",
    },
    {
      title: "Combates",
      value: combatesCount || 0,
      icon: Swords,
      href: "/admin/combates",
      color: "from-red-500 to-red-600",
      change: "+18%",
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Bienvenido al panel de administración de la Asociación de Karate</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link key={stat.title} href={stat.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <div
                    className={`w-10 h-10 rounded-lg bg-linear-to-br ${stat.color} flex items-center justify-center`}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <p className="text-xs text-green-600 font-medium">{stat.change}</p>
                    <p className="text-xs text-muted-foreground">vs mes anterior</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>



      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <CardTitle>Atletas Recientes</CardTitle>
            </div>
            <CardDescription>Últimos atletas agregados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {atletasRecientes && atletasRecientes.length > 0 ? (
                atletasRecientes.map((atleta) => (
                  <div key={atleta.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {atleta.nombre} {atleta.apellido}
                      </p>
                      <p className="text-xs text-muted-foreground">{atleta.cinturon}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={atleta.activo ? "default" : "secondary"}>
                        {atleta.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No hay atletas recientes</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-green-600" />
              <CardTitle>Entrenadores Recientes</CardTitle>
            </div>
            <CardDescription>Últimos entrenadores agregados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {entrenadoresRecientes && entrenadoresRecientes.length > 0 ? (
                entrenadoresRecientes.map((entrenador) => (
                  <div key={entrenador.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {entrenador.nombre} {entrenador.apellido}
                      </p>
                      <p className="text-xs text-muted-foreground">{entrenador.especialidad}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={entrenador.activo ? "default" : "secondary"}>
                        {entrenador.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No hay entrenadores recientes</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-600" />
              <CardTitle>Jueces Recientes</CardTitle>
            </div>
            <CardDescription>Últimos jueces agregados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {juecesRecientes && juecesRecientes.length > 0 ? (
                juecesRecientes.map((juez) => (
                  <div key={juez.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {juez.nombre} {juez.apellido}
                      </p>
                      <p className="text-xs text-muted-foreground">{juez.nivel_certificacion}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={juez.activo ? "default" : "secondary"}>
                        {juez.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No hay jueces recientes</p>
              )}
            </div>
          </CardContent>
        </Card>



        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>Gestiona los elementos principales de la asociación</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/admin/atletas">
              <Button className="w-full justify-start bg-transparent" variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Gestionar Atletas
              </Button>
            </Link>
            <Link href="/admin/entrenadores">
              <Button className="w-full justify-start bg-transparent" variant="outline">
                <Award className="mr-2 h-4 w-4" />
                Gestionar Entrenadores
              </Button>
            </Link>
            <Link href="/admin/jueces">
              <Button className="w-full justify-start bg-transparent" variant="outline">
                <Shield className="mr-2 h-4 w-4" />
                Gestionar Jueces
              </Button>
            </Link>
            <Link href="/admin/combates">
              <Button className="w-full justify-start bg-transparent" variant="outline">
                <Swords className="mr-2 h-4 w-4" />
                Crear Combate
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <SimuladorCombateRapido />
      </div>
    </div>
  )
}
