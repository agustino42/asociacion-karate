"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Trophy, Trash2, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
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
import { eliminarCombateEquipo } from "@/app/actions/combates"
import { useToast } from "@/hooks/use-toast"

type CombateEquipo = {
  id: string
  equipo1: { id: string; nombre: string }
  equipo2: { id: string; nombre: string }
  equipo_ganador: { id: string; nombre: string } | null
  puntos_equipo1: number
  puntos_equipo2: number
  fecha_combate: string
  estado: string
}

type Props = {
  combates: CombateEquipo[]
  currentPage: number
  totalPages: number
  totalItems: number
}
// componente de tabla para combates por equipos
export function CombatesEquiposTable({ combates, currentPage, totalPages, totalItems }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  
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
    setDeletingId(id)
    try {
      const result = await eliminarCombateEquipo(id)
      toast({
        title: "Combate eliminado",
        description: "El combate por equipos ha sido eliminado correctamente.",
      })
      router.refresh()
    } catch (error) {
      console.error("Error al eliminar combate por equipos:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el combate. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }
// manejo de paginacion
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('pageEq', page.toString())
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Mostrando {combates.length} de {totalItems} combates por equipos
        </p>
      </div>
      
      <div className="border rounded-lg">
        <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Equipo 1</TableHead>
            <TableHead>VS</TableHead>
            <TableHead>Equipo 2</TableHead>
            <TableHead>Puntos</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {combates.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                No hay combates por equipos registrados
              </TableCell>
            </TableRow>
          ) : (
            combates.map((combate) => (
              <TableRow key={combate.id}>
                <TableCell className="font-medium">
                  {combate.equipo1.nombre}
                  {combate.equipo_ganador?.id === combate.equipo1.id && (
                    <Trophy className="inline ml-2 h-4 w-4 text-yellow-500" />
                  )}
                </TableCell>
                <TableCell className="text-center font-bold text-muted-foreground">VS</TableCell>
                <TableCell className="font-medium">
                  {combate.equipo2.nombre}
                  {combate.equipo_ganador?.id === combate.equipo2.id && (
                    <Trophy className="inline ml-2 h-4 w-4 text-yellow-500" />
                  )}
                </TableCell>
                <TableCell>
                  <span className="font-mono">
                    {combate.puntos_equipo1} - {combate.puntos_equipo2}
                  </span>
                </TableCell>
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
                          Ganador: {combate.equipo_ganador ? combate.equipo_ganador.nombre : "Empate"}
                        </div>
                      </div>
                    ) : (
                      <Link href={`/admin/combates/equipo/${combate.id}`}>
                        <Button variant="outline" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="icon"
                          disabled={deletingId === combate.id}
                        >
                          {deletingId === combate.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar combate por equipos?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará permanentemente el combate entre{" "}
                            <strong>{combate.equipo1.nombre}</strong> y <strong>{combate.equipo2.nombre}</strong>.
                            <br /><br />
                            {combate.estado === "en_curso" && (
                              <span className="text-orange-600 font-medium">
                                ⚠️ Este combate está en curso y se eliminará también de "Combates en Vivo".
                              </span>
                            )}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel disabled={deletingId === combate.id}>
                            Cancelar
                          </AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDelete(combate.id)}
                            disabled={deletingId === combate.id}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            {deletingId === combate.id ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Eliminando...
                              </>
                            ) : (
                              "Eliminar Combate"
                            )}
                          </AlertDialogAction>
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
