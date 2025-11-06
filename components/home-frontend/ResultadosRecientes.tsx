"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy } from "lucide-react"
import { motion } from "framer-motion"

interface CombateReciente {
  id: string
  atleta1: { nombre: string; apellido: string }
  atleta2: { nombre: string; apellido: string }
  ganador?: { nombre: string; apellido: string }
  puntos_atleta1: number
  puntos_atleta2: number
  fecha_combate: string
}

interface ResultadosRecientesProps {
  combates: CombateReciente[]
}

export default function ResultadosRecientes({ combates }: ResultadosRecientesProps) {
  return (
    <motion.section 
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="space-y-8"
    >
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        viewport={{ once: true }}
        className="flex items-center gap-3"
      >
        <Trophy className="h-8 w-8 text-yellow-600" />
        <div>
          <h2 className="text-4xl font-bold">Resultados Recientes</h2>
          <p className="text-muted-foreground text-lg">Ganadores y perdedores de las últimas batallas</p>
        </div>
      </motion.div>

      <div className="grid gap-6">
        {combates && combates.length > 0 ? (
          combates.map((combate, index) => {
            // Determinar ganador para estilos condicionales
            const ganadorEsAtleta1 = combate.ganador?.nombre === combate.atleta1.nombre
            const ganadorEsAtleta2 = combate.ganador?.nombre === combate.atleta2.nombre

            return (
              <motion.div
                key={combate.id}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
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
              </motion.div>
            )
          })
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No hay resultados recientes
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </motion.section>
  )
}