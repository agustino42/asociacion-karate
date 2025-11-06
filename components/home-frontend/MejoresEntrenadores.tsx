"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Award, Users } from "lucide-react"
import { motion } from "framer-motion"

interface Entrenador {
  id: string
  nombre: string
  apellido: string
  especialidad: string
  anos_experiencia: number
  equipos?: Array<{ id: string; nombre: string }>
}

interface MejoresEntrenadoresProps {
  entrenadores: Entrenador[]
}

export default function MejoresEntrenadores({ entrenadores }: MejoresEntrenadoresProps) {
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
        <TrendingUp className="h-8 w-8 text-green-600" />
        <div>
          <h2 className="text-4xl font-bold">Mejores Entrenadores</h2>
          <p className="text-muted-foreground text-lg">Entrenadores destacados y sus especialidades</p>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {entrenadores && entrenadores.length > 0 ? (
          entrenadores.slice(0, 6).map((entrenador, index) => (
            <motion.div
              key={entrenador.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <Card className="hover:shadow-xl transition-all duration-300 border-2 h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {entrenador.nombre} {entrenador.apellido}
                      </CardTitle>
                      <CardDescription>{entrenador.especialidad}</CardDescription>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <Badge className="bg-green-600">{entrenador.anos_experiencia} años</Badge>
                    </motion.div>
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
                        {entrenador.equipos.map((equipo) => (
                          <motion.div
                            key={equipo.id}
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 400 }}
                          >
                            <Badge variant="secondary">
                              {equipo.nombre}
                            </Badge>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="col-span-full"
          >
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No hay entrenadores registrados
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </motion.section>
  )
}