"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users } from "lucide-react"
import { motion } from "framer-motion"

interface Atleta {
  id: string
  nombre: string
  apellido: string
  cinturon: string
  categoria_peso: string
  equipos?: { nombre: string }
}

interface ListaAtletasProps {
  atletas: Atleta[]
}

export default function ListaAtletas({ atletas }: ListaAtletasProps) {
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
        <Users className="h-8 w-8 text-blue-600" />
        <div>
          <h2 className="text-4xl font-bold">Nuestros Atletas</h2>
          <p className="text-muted-foreground text-lg">Atletas activos de la asociación</p>
        </div>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {atletas && atletas.length > 0 ? (
          atletas.map((atleta, index) => (
            <motion.div
              key={atleta.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              viewport={{ once: true }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <Card className="hover:shadow-xl transition-all duration-300 h-full">
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
                No hay atletas registrados
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </motion.section>
  )
}