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

  // Obtener estadísticas
  const [
    { count: atletasCount },
    { count: entrenadoresCount },
    { count: juecesCount },
    { count: combatesCount },
    { data: combatesRecientes },
    { data: combatesEnVivo },
    { data: proximosCombates },
    { data: topAtletas },
    { data: atletasRecientes },
    { data: entrenadoresRecientes },
    { data: juecesRecientes },
  ] = await Promise.all([
    supabase.from("atletas").select("*", { count: "exact", head: true }),
    supabase.from("entrenadores").select("*", { count: "exact", head: true }),
    supabase.from("jueces").select("*", { count: "exact", head: true }),
    supabase.from("combates_individuales").select("*", { count: "exact", head: true }),
    supabase
      .from("combates_individuales")
      .select(
        `
        *,
        atleta1:atletas!combates_individuales_atleta1_id_fkey(nombre, apellido),
        atleta2:atletas!combates_individuales_atleta2_id_fkey(nombre, apellido),
        ganador:atletas!combates_individuales_ganador_id_fkey(nombre, apellido)
      `,
      )
      .eq("estado", "finalizado")
      .order("fecha_combate", { ascending: false })
      .limit(5),
    supabase
      .from("combates_individuales")
      .select(
        `
        *,
        atleta1:atletas!combates_individuales_atleta1_id_fkey(nombre, apellido),
        atleta2:atletas!combates_individuales_atleta2_id_fkey(nombre, apellido)
      `,
      )
      .eq("estado", "en_curso"),
    supabase
      .from("combates_individuales")
      .select(
        `
        *,
        atleta1:atletas!combates_individuales_atleta1_id_fkey(nombre, apellido),
        atleta2:atletas!combates_individuales_atleta2_id_fkey(nombre, apellido)
      `,
      )
      .eq("estado", "programado")
      .order("fecha_combate", { ascending: true })
      .limit(5),
    supabase
      .from("rankings_atletas")
      .select(
        `
        *,
        atletas(nombre, apellido, cinturon)
      `,
      )
      .order("puntos_totales", { ascending: false })
      .limit(5),
    supabase
      .from("atletas")
      .select("*, equipos(nombre)")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("entrenadores")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("jueces")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5),
  ])

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
                    className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}
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

      {combatesEnVivo && combatesEnVivo.length > 0 && (
        <Card className="border-2 border-orange-500">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse" />
              <CardTitle>Combates en Vivo</CardTitle>
              <Badge className="ml-auto bg-orange-600">{combatesEnVivo.length} activo(s)</Badge>
            </div>
            <CardDescription>Batallas en curso ahora mismo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {combatesEnVivo.map((combate) => (
                <Link key={combate.id} href={`/admin/combates/individual/${combate.id}`}>
                  <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Swords className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="font-medium">
                          {combate.atleta1.nombre} vs {combate.atleta2.nombre}
                        </p>
                        <p className="text-sm text-muted-foreground">{combate.categoria}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        {combate.puntos_atleta1} - {combate.puntos_atleta2}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        Ver detalles
                      </Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              <CardTitle>Combates Recientes</CardTitle>
            </div>
            <CardDescription>Últimos resultados finalizados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {combatesRecientes && combatesRecientes.length > 0 ? (
                combatesRecientes.map((combate) => (
                  <div key={combate.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {combate.atleta1.nombre} vs {combate.atleta2.nombre}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(combate.fecha_combate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        {combate.puntos_atleta1} - {combate.puntos_atleta2}
                      </p>
                      {combate.ganador && <p className="text-xs text-green-600">Ganador: {combate.ganador.nombre}</p>}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No hay combates recientes</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <CardTitle>Próximos Torneos</CardTitle>
            </div>
            <CardDescription>Combates programados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {proximosCombates && proximosCombates.length > 0 ? (
                proximosCombates.map((combate) => (
                  <div key={combate.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium">
                          {combate.atleta1.nombre} vs {combate.atleta2.nombre}
                        </p>
                        <p className="text-xs text-muted-foreground">{combate.categoria}</p>
                      </div>
                    </div>
                    <Badge variant="secondary">{new Date(combate.fecha_combate).toLocaleDateString()}</Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No hay combates programados</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              <CardTitle>Top Atletas</CardTitle>
            </div>
            <CardDescription>Ranking de los mejores 5</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Atleta</TableHead>
                  <TableHead className="text-right">Puntos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topAtletas && topAtletas.length > 0 ? (
                  topAtletas.map((ranking, index) => (
                    <TableRow key={ranking.id}>
                      <TableCell className="font-bold">
                        {index + 1}
                        {index === 0 && <Trophy className="inline ml-1 h-3 w-3 text-yellow-500" />}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">
                            {ranking.atletas.nombre} {ranking.atletas.apellido}
                          </p>
                          <p className="text-xs text-muted-foreground">{ranking.atletas.cinturon}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-bold">{ranking.puntos_totales}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground text-sm">
                      No hay datos de ranking
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
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
