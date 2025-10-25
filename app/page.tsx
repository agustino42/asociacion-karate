import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Swords, Users, Award, Shield, Clock, Flame, TrendingUp } from "lucide-react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ThemeToggle } from "@/components/theme-toggle"

/**
 * Página principal (Dashboard público) de la aplicación de Karate
 * 
 * CARACTERÍSTICAS PRINCIPALES:
 * - Dashboard público con métricas y estadísticas
 * - Visualización en tiempo real de combates en vivo
 * - Rankings de atletas y equipos
 * - Información de entrenadores y atletas
 * - Diseño responsive y moderno
 * 
 * NOTA: Esta es una Server Component que ejecuta todas las queries en el servidor
 */
export default async function HomePage() {
  const supabase = await getSupabaseServerClient()

  /**
   * OBTENCIÓN DE DATOS EN PARALELO:
   * Se ejecutan todas las consultas simultáneamente para mejor performance
   * Cada consulta obtiene datos específicos para diferentes secciones del dashboard
   */
  const [
    { data: rankingAtletas },      // Top 10 atletas por puntos
    { data: rankingEquipos },      // Top 5 equipos por puntos  
    { data: combatesRecientes },   // Últimos 5 combates finalizados
    { data: combatesEnVivo },      // Combates actualmente en curso
    { data: atletas },             // 12 atletas activos para mostrar
    { data: entrenadores },        // Todos los entrenadores activos
    { data: proximosCombates },    // Próximos 5 combates programados
  ] = await Promise.all([
    // CONSULTA 1: Ranking de atletas (top 10)
    supabase
      .from("rankings_atletas")
      .select(
        `
        *,
        atletas(nombre, apellido, cinturon, categoria_peso)
      `,
      )
      .order("puntos_totales", { ascending: false })
      .limit(10),
    
    // CONSULTA 2: Ranking de equipos (top 5)  
    supabase
      .from("rankings_equipos")
      .select(
        `
        *,
        equipos(nombre, entrenadores(nombre, apellido))
      `,
      )
      .order("puntos_totales", { ascending: false })
      .limit(5),
    
    // CONSULTA 3: Combates recientes finalizados
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
    
    // CONSULTA 4: Combates actualmente en vivo
    supabase
      .from("combates_individuales")
      .select(
        `
        *,
        atleta1:atletas!combates_individuales_atleta1_id_fkey(nombre, apellido, cinturon),
        atleta2:atletas!combates_individuales_atleta2_id_fkey(nombre, apellido, cinturon)
      `,
      )
      .eq("estado", "en_curso")
      .order("fecha_combate", { ascending: false }),
    
    // CONSULTA 5: Atletas activos (limitado a 12)
    supabase
      .from("atletas")
      .select(
        `
        *,
        equipos(nombre)
      `,
      )
      .eq("activo", true)
      .order("nombre")
      .limit(12),
    
    // CONSULTA 6: Entrenadores activos
    supabase
      .from("entrenadores")
      .select(
        `
        *,
        equipos(id, nombre)
      `,
      )
      .eq("activo", true)
      .order("anos_experiencia", { ascending: false }),
    
    // CONSULTA 7: Próximos combates programados
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
  ])

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted/20">
      {/* ===== HEADER ===== */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* LOGO Y NOMBRE */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-linear-to-br from-red-600 to-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-2xl text-white font-bold">空</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">Asociación de Karate</h1>
                <p className="text-sm text-muted-foreground">Excelencia en Artes Marciales</p>
              </div>
            </div>
            
            {/* CONTROLES DEL HEADER */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link href="/login">
                <Button variant="outline">
                  <Shield className="mr-2 h-4 w-4" />
                  Acceso Admin
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ===== CONTENIDO PRINCIPAL ===== */}
      <main className="container mx-auto px-4 py-12 space-y-16">
        
        {/* === HERO BANNER === */}
        <section className="text-center space-y-4 py-12">
          <h2 className="text-5xl font-bold bg-linear-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
            ASO-KARATE 
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Promoviendo la disciplina, el respeto y la excelencia en el arte del Karate
          </p>
          
          {/* MÉTRICAS PRINCIPALES */}
          <div className="flex justify-center gap-4 pt-4">
            <Card className="w-32">
              <CardContent className="pt-6 text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <p className="text-2xl font-bold">{atletas?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Atletas</p>
              </CardContent>
            </Card>
            <Card className="w-32">
              <CardContent className="pt-6 text-center">
                <Award className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <p className="text-2xl font-bold">{entrenadores?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Entrenadores</p>
              </CardContent>
            </Card>
            <Card className="w-32">
              <CardContent className="pt-6 text-center">
                <Swords className="h-8 w-8 mx-auto mb-2 text-red-600" />
                <p className="text-2xl font-bold">{combatesRecientes?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Combates</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* === COMBATES EN VIVO (Condicional) === */}
        {combatesEnVivo && combatesEnVivo.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <Flame className="h-8 w-8 text-orange-600 animate-pulse" />
              <div>
                <h2 className="text-3xl font-bold">Combates en Vivo</h2>
                <p className="text-muted-foreground">Batallas en curso ahora mismo</p>
              </div>
            </div>

            <div className="grid gap-4">
              {combatesEnVivo.map((combate) => (
                <Card
                  key={combate.id}
                  className="border-2 border-orange-500 hover:shadow-xl transition-shadow animate-pulse"
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        {/* ATLETA 1 */}
                        <div className="text-right flex-1">
                          <p className="font-semibold text-xl">
                            {combate.atleta1.nombre} {combate.atleta1.apellido}
                          </p>
                          <Badge variant="outline" className="mt-1">
                            {combate.atleta1.cinturon}
                          </Badge>
                        </div>
                        
                        {/* MARCADOR CENTRAL */}
                        <div className="text-center px-6">
                          <Badge className="mb-2 bg-orange-600">
                            <Clock className="h-3 w-3 mr-1" />
                            EN VIVO
                          </Badge>
                          <div className="flex items-center gap-3">
                            <span className="text-4xl font-bold text-red-600">{combate.puntos_atleta1}</span>
                            <span className="text-3xl text-muted-foreground font-bold">VS</span>
                            <span className="text-4xl font-bold text-blue-600">{combate.puntos_atleta2}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            {combate.categoria} • {combate.duracion_minutos} min
                          </p>
                        </div>
                        
                        {/* ATLETA 2 */}
                        <div className="text-left flex-1">
                          <p className="font-semibold text-xl">
                            {combate.atleta2.nombre} {combate.atleta2.apellido}
                          </p>
                          <Badge variant="outline" className="mt-1">
                            {combate.atleta2.cinturon}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* === RESULTADOS RECIENTES === */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <Trophy className="h-8 w-8 text-yellow-600" />
            <div>
              <h2 className="text-3xl font-bold">Resultados Recientes</h2>
              <p className="text-muted-foreground">Ganadores y perdedores de las últimas batallas</p>
            </div>
          </div>

          <div className="grid gap-4">
            {combatesRecientes && combatesRecientes.length > 0 ? (
              combatesRecientes.map((combate) => {
                // Determinar ganador para estilos condicionales
                const ganadorEsAtleta1 = combate.ganador?.nombre === combate.atleta1.nombre
                const ganadorEsAtleta2 = combate.ganador?.nombre === combate.atleta2.nombre

                return (
                  <Card key={combate.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          {/* ATLETA 1 CON INDICADOR DE GANADOR */}
                          <div className={`text-right flex-1 ${ganadorEsAtleta1 ? "opacity-100" : "opacity-50"}`}>
                            <p className="font-semibold text-lg">
                              {combate.atleta1.nombre} {combate.atleta1.apellido}
                            </p>
                            {ganadorEsAtleta1 && (
                              <Badge className="mt-1 bg-green-600">
                                <Trophy className="h-3 w-3 mr-1" />
                                Ganador
                              </Badge>
                            )}
                            {!ganadorEsAtleta1 && !ganadorEsAtleta2 && (
                              <Badge variant="outline" className="mt-1">
                                Empate
                              </Badge>
                            )}
                          </div>
                          
                          {/* MARCADOR Y FECHA */}
                          <div className="text-center px-6">
                            <div className="flex items-center gap-3">
                              <span className={`text-3xl font-bold ${ganadorEsAtleta1 ? "text-green-600" : ""}`}>
                                {combate.puntos_atleta1}
                              </span>
                              <span className="text-2xl text-muted-foreground font-bold">-</span>
                              <span className={`text-3xl font-bold ${ganadorEsAtleta2 ? "text-green-600" : ""}`}>
                                {combate.puntos_atleta2}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(combate.fecha_combate).toLocaleDateString()}
                            </p>
                          </div>
                          
                          {/* ATLETA 2 CON INDICADOR DE GANADOR */}
                          <div className={`text-left flex-1 ${ganadorEsAtleta2 ? "opacity-100" : "opacity-50"}`}>
                            <p className="font-semibold text-lg">
                              {combate.atleta2.nombre} {combate.atleta2.apellido}
                            </p>
                            {ganadorEsAtleta2 && (
                              <Badge className="mt-1 bg-green-600">
                                <Trophy className="h-3 w-3 mr-1" />
                                Ganador
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            ) : (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No hay resultados recientes
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        {/* === PRÓXIMOS COMBATES (Condicional) === */}
        {proximosCombates && proximosCombates.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-blue-600" />
              <div>
                <h2 className="text-3xl font-bold">Próximos Combates</h2>
                <p className="text-muted-foreground">Batallas programadas</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {proximosCombates.map((combate) => (
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
        )}

        {/* === MEJORES ENTRENADORES === */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <div>
              <h2 className="text-3xl font-bold">Mejores Entrenadores</h2>
              <p className="text-muted-foreground">Entrenadores destacados y sus especialidades</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {entrenadores && entrenadores.length > 0 ? (
              entrenadores.slice(0, 6).map((entrenador) => (
                <Card key={entrenador.id} className="hover:shadow-lg transition-shadow border-2">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>
                          {entrenador.nombre} {entrenador.apellido}
                        </CardTitle>
                        <CardDescription>{entrenador.especialidad}</CardDescription>
                      </div>
                      <Badge className="bg-green-600">{entrenador.anos_experiencia} años</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">Especialidad: {entrenador.especialidad}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">{entrenador.equipos?.length || 0} equipo(s)</span>
                      </div>
                    </div>
                    
                    {/* LISTA DE EQUIPOS DEL ENTRENADOR */}
                    {entrenador.equipos && entrenador.equipos.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Equipos:</p>
                        <div className="flex flex-wrap gap-2">
                          {entrenador.equipos.map((equipo: any) => (
                            <Badge key={equipo.id} variant="secondary">
                              {equipo.nombre}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="col-span-full">
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No hay entrenadores registrados
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        {/* === RANKINGS (Doble columna) === */}
        <section className="grid lg:grid-cols-2 gap-8">
          {/* RANKING DE ATLETAS */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Trophy className="h-6 w-6 text-yellow-600" />
                <div>
                  <CardTitle>Ranking de Atletas</CardTitle>
                  <CardDescription>Top 10 atletas por puntos</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Atleta</TableHead>
                    <TableHead className="text-center">V-D-E</TableHead>
                    <TableHead className="text-right">Puntos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rankingAtletas && rankingAtletas.length > 0 ? (
                    rankingAtletas.map((ranking, index) => (
                      <TableRow key={ranking.id}>
                        <TableCell className="font-bold">
                          {index + 1}
                          {index === 0 && <Trophy className="inline ml-1 h-4 w-4 text-yellow-500" />}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {ranking.atletas.nombre} {ranking.atletas.apellido}
                            </p>
                            <p className="text-xs text-muted-foreground">{ranking.atletas.cinturon}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-mono text-sm">
                          {ranking.victorias}-{ranking.derrotas}-{ranking.empates}
                        </TableCell>
                        <TableCell className="text-right font-bold">{ranking.puntos_totales}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No hay datos de ranking
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* RANKING DE EQUIPOS */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-6 w-6 text-blue-600" />
                <div>
                  <CardTitle>Ranking de Equipos</CardTitle>
                  <CardDescription>Top equipos por puntos</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Equipo</TableHead>
                    <TableHead className="text-center">V-D-E</TableHead>
                    <TableHead className="text-right">Puntos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rankingEquipos && rankingEquipos.length > 0 ? (
                    rankingEquipos.map((ranking, index) => (
                      <TableRow key={ranking.id}>
                        <TableCell className="font-bold">
                          {index + 1}
                          {index === 0 && <Trophy className="inline ml-1 h-4 w-4 text-yellow-500" />}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{ranking.equipos.nombre}</p>
                            <p className="text-xs text-muted-foreground">
                              {ranking.equipos.entrenadores
                                ? `${ranking.equipos.entrenadores.nombre} ${ranking.equipos.entrenadores.apellido}`
                                : "Sin entrenador"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-mono text-sm">
                          {ranking.victorias}-{ranking.derrotas}-{ranking.empates}
                        </TableCell>
                        <TableCell className="text-right font-bold">{ranking.puntos_totales}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No hay datos de ranking
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>

        {/* === LISTA DE ATLETAS === */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-600" />
            <div>
              <h2 className="text-3xl font-bold">Nuestros Atletas</h2>
              <p className="text-muted-foreground">Atletas activos de la asociación</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {atletas && atletas.length > 0 ? (
              atletas.map((atleta) => (
                <Card key={atleta.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {atleta.nombre} {atleta.apellido}
                    </CardTitle>
                    <CardDescription>{atleta.cinturon}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Categoría:</span>
                      <span className="font-medium">{atleta.categoria_peso}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Equipo:</span>
                      <span className="font-medium">{atleta.equipos?.nombre || "Sin equipo"}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="col-span-full">
                <CardContent className="pt-6 text-center text-muted-foreground">No hay atletas registrados</CardContent>
              </Card>
            )}
          </div>
        </section>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="border-t bg-card mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <div className="w-8 h-8 bg-linear-to-br from-red-600 to-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-lg text-white font-bold">空</span>
              </div>
              <p className="font-semibold">Asociación de Karate</p>
            </div>
            <p className="text-sm text-muted-foreground">Promoviendo la excelencia en artes marciales desde 2024</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

/**
 * ESTRUCTURA DEL COMPONENTE:
 * 
 * 1. HEADER
 *    - Logo y nombre de la asociación
 *    - Toggle de tema + botón de acceso admin
 * 
 * 2. MAIN CONTENT
 *    - Hero Banner (métricas principales)
 *    - Combates en Vivo (condicional)
 *    - Resultados Recientes
 *    - Próximos Combates (condicional)
 *    - Mejores Entrenadores
 *    - Rankings (Atletas + Equipos)
 *    - Lista de Atletas
 * 
 * 3. FOOTER
 *    - Información de la asociación
 * 
 * CARACTERÍSTICAS TÉCNICAS:
 * - Server Component (Next.js 13+)
 * - Consultas paralelizadas con Promise.all
 * - Diseño completamente responsive
 * - Estados condicionales para secciones sin datos
 * - Iconografía consistente con Lucide React
 * - Sistema de diseño con shadcn/ui
 */