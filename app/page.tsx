import { getSupabaseServerClient } from "@/lib/supabase/server"
import Navigation from "@/components/home-frontend/Navigation"
import HeroBanner from "@/components/home-frontend/HeroBanner"
import CombatesEnVivo from "@/components/home-frontend/CombatesEnVivo"
import ResultadosRecientes from "@/components/home-frontend/ResultadosRecientes"
import ProximosCombates from "@/components/home-frontend/ProximosCombates"
import MejoresEntrenadores from "@/components/home-frontend/MejoresEntrenadores"
import RankingsSection from "@/components/home-frontend/RankingsSection"
import ListaAtletas from "@/components/home-frontend/ListaAtletas"
import Footer from "@/components/home-frontend/Footer"
import FAQSection from "@/components/home-frontend/FAQSection"
import JuecesControlPanel from "@/components/admin/JuecesControlPanel"
import type { Metadata } from "next"
import Script from "next/script"


/**
 * Landing Page de ASO-KARATE
 * 
 * CARACTERÍSTICAS PRINCIPALES:
 * - Landing page moderna con navegación suave
 * - Animaciones con Framer Motion
 * - Visualización en tiempo real de combates en vivo
 * - Rankings de atletas y equipos
 * - Información de entrenadores y atletas
 * - Diseño responsive y SEO optimizado
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
    { data: proximosCombates },  
      // Próximos 5 combates programados
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
    <>
      {/* EStructura Principal.. */}
      
      
      <div className="min-h-screen bg-linear-to-b from-background to-muted/20">
        {/* ===== NAVIGATION ===== */}
        <Navigation />

      {/* ===== CONTENIDO PRINCIPAL ===== */}
      <main className="pt-16">
        
        {/* === HERO BANNER === */}
        <section id="inicio">
          <HeroBanner 
            atletasCount={atletas?.length || 0}
            entrenadoresCount={entrenadores?.length || 0}
            combatesCount={combatesRecientes?.length || 0}
          />
        </section>

        <div className="container mx-auto px-4 space-y-24">
         

          {/* === COMBATES EN VIVO === */}
          <section id="combates-vivo">
            <CombatesEnVivo combates={combatesEnVivo || []} />
          </section>

          {/* === RESULTADOS RECIENTES === */}
          <section id="resultados">
            <ResultadosRecientes combates={combatesRecientes || []} />
          </section>

          {/* === PRÓXIMOS COMBATES === */}
          <ProximosCombates combates={proximosCombates || []} />

          {/* === MEJORES ENTRENADORES === */}
          <section id="entrenadores">
            <MejoresEntrenadores entrenadores={entrenadores || []} />
          </section>

          {/* === RANKINGS === */}
          <section id="rankings">
            <RankingsSection 
              rankingAtletas={rankingAtletas || []}
              rankingEquipos={rankingEquipos || []}
            />
          </section>

          {/* === LISTA DE ATLETAS === */}
          <section id="atletas">
            <ListaAtletas atletas={atletas || []} />
          </section>

          {/* === TESTIMONIOS === */}
          <section className="py-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Lo Que Dicen Nuestros Atletas</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Experiencias reales de quienes forman parte de nuestra comunidad
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-card p-6 rounded-lg border">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                    <span className="text-primary font-bold">MR</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">María Rodríguez</h4>
                    <p className="text-sm text-muted-foreground">Cinturón Negro 2° Dan</p>
                  </div>
                </div>
                <p className="text-muted-foreground italic">
                  "ASO-KARATE me ha dado la disciplina y confianza que necesitaba. Los entrenadores son excepcionales y el ambiente es muy profesional."
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                    <span className="text-primary font-bold">CL</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Carlos López</h4>
                    <p className="text-sm text-muted-foreground">Cinturón Negro 1° Dan</p>
                  </div>
                </div>
                <p className="text-muted-foreground italic">
                  "Gracias a ASO-KARATE he participado en competencias nacionales. La preparación técnica y mental es de primer nivel."
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                    <span className="text-primary font-bold">AS</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Ana Silva</h4>
                    <p className="text-sm text-muted-foreground">Cinturón Marrón</p>
                  </div>
                </div>
                <p className="text-muted-foreground italic">
                  "El karate cambió mi vida. Aquí encontré no solo un deporte, sino una filosofía de vida y una segunda familia."
                </p>
              </div>
            </div>
          </section>

          {/* === NOTICIAS Y EVENTOS ===
          <section className="py-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Últimas Noticias y Eventos</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Mantente al día con las últimas novedades de nuestra asociación
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <article className="bg-card rounded-lg overflow-hidden border hover:shadow-lg transition-shadow">
                <div className="h-48 bg-linear-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <span className="text-6xl">🥋</span>
                </div>
                <div className="p-6">
                  <span className="text-xs text-primary font-semibold">TORNEO</span>
                  <h3 className="font-bold text-lg mb-2 mt-1">Campeonato Regional 2024</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Se acerca el torneo más importante del año. Inscripciones abiertas para todas las categorías.
                  </p>
                  <span className="text-xs text-muted-foreground">15 de Marzo, 2024</span>
                </div>
              </article>
              <article className="bg-card rounded-lg overflow-hidden border hover:shadow-lg transition-shadow">
                <div className="h-48 bg-linear-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <span className="text-6xl">🏆</span>
                </div>

                <div className="p-6">
                  <span className="text-xs text-primary font-semibold">LOGRO</span>
                  <h3 className="font-bold text-lg mb-2 mt-1">Nuevos Cinturones Negros</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Felicitamos a nuestros atletas que alcanzaron el grado de cinturón negro en el último examen.
                  </p>
                  <span className="text-xs text-muted-foreground">10 de Marzo, 2024</span>
                </div>

              </article>
              <article className="bg-card rounded-lg overflow-hidden border hover:shadow-lg transition-shadow">
                <div className="h-48 bg-linear-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <span className="text-6xl">📚</span>
                </div>
                <div className="p-6">
                  <span className="text-xs text-primary font-semibold">SEMINARIO</span>
                  <h3 className="font-bold text-lg mb-2 mt-1">Seminario de Kata Avanzado</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Masterclass con sensei internacional. Perfecciona tu técnica y conocimiento del kata tradicional.
                  </p>
                  <span className="text-xs text-muted-foreground">5 de Marzo, 2024</span>
                </div>
              </article>
            </div>
          </section>*/}

          {/* === PREGUNTAS FRECUENTES === */}
          <FAQSection />

          {/* ===  === */}
         
          {/*Aqui va el panel de los jueces  */}
          <JuecesControlPanel />
        </div>
      </main>

        {/* ===== FOOTER ===== */}
        <Footer />
      </div>
    </>
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