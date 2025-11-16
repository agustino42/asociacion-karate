"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Trophy, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { eliminarCombateIndividual } from "@/app/actions/combates"

type CombateIndividual = {
  id: string
  atleta1: { id: string; nombre: string; apellido: string }
  atleta2: { id: string; nombre: string; apellido: string }
  ganador: { id: string; nombre: string; apellido: string } | null
  puntos_atleta1: number
  puntos_atleta2: number
  categoria: string
  fecha_combate: string
  estado: string
}

type Props = {
  combates: CombateIndividual[]
  currentPage: number
  totalPages: number
  totalItems: number
}

export function CombatesIndividualesTable({ combates, currentPage, totalPages, totalItems }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const getEstadoBadge = (estado: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      programado: "secondary",
      en_curso: "default",
      finalizado: "outline",
      cancelado: "destructive",
    }
    return variants[estado] || "secondary"
  }

  const handleDelete = async (id: string) => {
    try {
      await eliminarCombateIndividual(id)
    } catch (error) {
      console.error("[] Error al eliminar combate individual:", error)
    }
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('pageInd', page.toString())
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Mostrando {combates.length} de {totalItems} combates individuales
        </p>
      </div>
      
      <div className="border rounded-lg">
        <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Atleta 1</TableHead>
            <TableHead>VS</TableHead>
            <TableHead>Atleta 2</TableHead>
            <TableHead>Puntos</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {combates.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground">
                No hay combates registrados
              </TableCell>
            </TableRow>
          ) : (
            combates.map((combate) => (
              <TableRow key={combate.id}>
                <TableCell className="font-medium">
                  {combate.atleta1.nombre} {combate.atleta1.apellido}
                  {combate.ganador?.id === combate.atleta1.id && (
                    <Trophy className="inline ml-2 h-4 w-4 text-yellow-500" />
                  )}
                </TableCell>
                <TableCell className="text-center font-bold text-muted-foreground">VS</TableCell>
                <TableCell className="font-medium">
                  {combate.atleta2.nombre} {combate.atleta2.apellido}
                  {combate.ganador?.id === combate.atleta2.id && (
                    <Trophy className="inline ml-2 h-4 w-4 text-yellow-500" />
                  )}
                </TableCell>
                <TableCell>
                  <span className="font-mono">
                    {combate.puntos_atleta1} - {combate.puntos_atleta2}
                  </span>
                </TableCell>
                <TableCell>{combate.categoria}</TableCell>
                <TableCell>{new Date(combate.fecha_combate).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge variant={getEstadoBadge(combate.estado)}>{combate.estado.replace("_", " ")}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2 items-center">
                    {combate.estado === "finalizado" ? (
                      <div className="text-sm text-muted-foreground mr-2">
                        <div className="font-medium">Combate Terminado</div>
                        <div className="text-xs">
                          Ganador: {combate.ganador ? `${combate.ganador.nombre} ${combate.ganador.apellido}` : "Empate"}
                        </div>
                      </div>
                    ) : (
                      <Link href={`/admin/combates/individual/${combate.id}`}>
                        <Button variant="outline" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará permanentemente el combate entre{" "}
                            {combate.atleta1.nombre} {combate.atleta1.apellido} y {combate.atleta2.nombre}{" "}
                            {combate.atleta2.apellido}.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(combate.id)}>Eliminar</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      </div>
      
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          
          <div className="flex items-center space-x-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={page === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(page)}
                className="w-8 h-8 p-0"
              >
                {page}
              </Button>
            ))}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
