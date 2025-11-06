"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Flame, Clock } from "lucide-react"
import { motion } from "framer-motion"

interface CombateEnVivo {
  id: string
  atleta1: { nombre: string; apellido: string; cinturon: string }
  atleta2: { nombre: string; apellido: string; cinturon: string }
  puntos_atleta1: number
  puntos_atleta2: number
  categoria: string
  duracion_minutos: number
}

interface CombatesEnVivoProps {
  combates: CombateEnVivo[]
}

export default function CombatesEnVivo({ combates }: CombatesEnVivoProps) {
  if (!combates || combates.length === 0) return null

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
        <Flame className="h-8 w-8 text-orange-600 animate-pulse" />
        <div>
          <h2 className="text-4xl font-bold">Combates en Vivo</h2>
          <p className="text-muted-foreground text-lg">Batallas en curso ahora mismo</p>
        </div>
      </motion.div>

      <div className="grid gap-6">
        {combates.map((combate, index) => (
          <motion.div
            key={combate.id}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            <Card className="border-2 border-orange-500 hover:shadow-2xl transition-all duration-300 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {/* ATLETA 1 */}
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="text-right flex-1"
                    >
                      <p className="font-semibold text-xl">
                        {combate.atleta1.nombre} {combate.atleta1.apellido}
                      </p>
                      <Badge variant="outline" className="mt-1">
                        {combate.atleta1.cinturon}
                      </Badge>
                    </motion.div>
                    
                    {/* MARCADOR CENTRAL */}
                    <div className="text-center px-6">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Badge className="mb-2 bg-orange-600">
                          <Clock className="h-3 w-3 mr-1" />
                          EN VIVO
                        </Badge>
                      </motion.div>
                      <div className="flex items-center gap-3">
                        <motion.span 
                          animate={{ color: ['#dc2626', '#ea580c', '#dc2626'] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="text-4xl font-bold"
                        >
                          {combate.puntos_atleta1}
                        </motion.span>
                        <span className="text-3xl text-muted-foreground font-bold">VS</span>
                        <motion.span 
                          animate={{ color: ['#2563eb', '#1d4ed8', '#2563eb'] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="text-4xl font-bold"
                        >
                          {combate.puntos_atleta2}
                        </motion.span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {combate.categoria} • {combate.duracion_minutos} min
                      </p>
                    </div>
                    
                    {/* ATLETA 2 */}
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="text-left flex-1"
                    >
                      <p className="font-semibold text-xl">
                        {combate.atleta2.nombre} {combate.atleta2.apellido}
                      </p>
                      <Badge variant="outline" className="mt-1">
                        {combate.atleta2.cinturon}
                      </Badge>
                    </motion.div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}