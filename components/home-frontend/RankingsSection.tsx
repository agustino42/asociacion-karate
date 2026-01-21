"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trophy, Users } from "lucide-react"
import { motion } from "framer-motion"

interface RankingAtleta {
  id: string
  atletas: { nombre: string; apellido: string; cinturon: string }
  victorias: number
  derrotas: number
  empates: number
  puntos_totales: number
}

interface RankingEquipo {
  id: string
  equipos: {
    nombre: string
    entrenadores?: { nombre: string; apellido: string }
  }
  victorias: number
  derrotas: number
  empates: number
  puntos_totales: number
}

interface RankingsSectionProps {
  rankingAtletas: RankingAtleta[]
  rankingEquipos: RankingEquipo[]
}

export default function RankingsSection({ rankingAtletas, rankingEquipos }: RankingsSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="grid lg:grid-cols-2 gap-8"
    >
      {/* RANKING DE ATLETAS */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        viewport={{ once: true }}
      >
        <Card className="hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <div className="flex items-center gap-2">

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
                        {index === 0}
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
      </motion.div>

      {/* RANKING DE EQUIPOS */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        viewport={{ once: true }}
      >
        <Card className="hover:shadow-xl transition-shadow duration-300">
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
                        {index === 0}
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
      </motion.div>
    </motion.section>
  )
}