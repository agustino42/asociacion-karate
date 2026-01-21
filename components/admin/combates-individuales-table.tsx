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
import { eliminarCombateIndividual } from "@/app/actions/combates"
import { useToast } from "@/hooks/use-toast"

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
  pageParam?: string
}

export function CombatesIndividualesTable({ combates, currentPage, totalPages, totalItems, pageParam = 'pageInd' }: Props) {
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
      const result = await eliminarCombateIndividual(id)
      toast({
        title: "Combate eliminado",
        description: "El combate ha sido eliminado correctamente y ya no aparecerá en combates en vivo.",
      })
      router.refresh()
    } catch (error) {
      console.error("Error al eliminar combate individual:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el combate. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(pageParam, page.toString())
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
              <TableHead>Tipo</TableHead>
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
                <TableCell colSpan={9} className="text-center text-muted-foreground">
                  No hay combates registrados
                </TableCell>
              </TableRow>
            ) : (
              combates.map((combate) => {
                const esCampeonato = combate.categoria.startsWith('Campeonato')
                return (
                  <TableRow key={combate.id}>
                    <TableCell>
                      <Badge variant={esCampeonato ? "default" : "secondary"} className={esCampeonato ? "bg-yellow-600 hover:bg-yellow-700" : ""}>
                        {esCampeonato ? "Campeonato" : "Individual"}
                      </Badge>
                    </TableCell>
                    <TableCell className={`font-medium ${combate.ganador?.id === combate.atleta1.id && combate.estado === 'finalizado' ? 'bg-green-50 text-green-800 font-bold' : ''}`}>
                      {combate.atleta1.nombre} {combate.atleta1.apellido}
                      {combate.ganador?.id === combate.atleta1.id}
                    </TableCell>
                    <TableCell className="text-center font-bold text-muted-foreground">VS</TableCell>
                    <TableCell className={`font-medium ${combate.ganador?.id === combate.atleta2.id && combate.estado === 'finalizado' ? 'bg-green-50 text-green-800 font-bold' : ''}`}>
                      {combate.atleta2.nombre} {combate.atleta2.apellido}
                      {combate.ganador?.id === combate.atleta2.id}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <span className="font-mono text-lg font-bold">
                          {combate.puntos_atleta1} - {combate.puntos_atleta2}
                        </span>
                        {combate.estado === 'finalizado' && (
                          <div className="text-xs text-muted-foreground">
                            {combate.ganador ? (
                              <span className="text-green-600 font-medium">
                                ✓ Ganador: {combate.ganador.nombre} {combate.ganador.apellido}
                              </span>
                            ) : (
                              <span className="text-yellow-600 font-medium">Empate</span>
                            )}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{combate.categoria}</TableCell>
                    <TableCell>{new Date(combate.fecha_combate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={getEstadoBadge(combate.estado)}>{combate.estado.replace("_", " ")}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2 items-center">
                        {combate.estado === "finalizado" ? (
                          <div className="text-sm mr-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">

                                Finalizado
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {combate.ganador ? (
                                <span className="text-green-600 font-medium">
                                  {combate.ganador.nombre} {combate.ganador.apellido}
                                </span>
                              ) : (
                                <span className="text-yellow-600 font-medium">Empate</span>
                              )}
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
                              <AlertDialogTitle>¿Eliminar combate?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. Se eliminará permanentemente el combate entre{" "}
                                <strong>{combate.atleta1.nombre} {combate.atleta1.apellido}</strong> y{" "}
                                <strong>{combate.atleta2.nombre} {combate.atleta2.apellido}</strong>.
                                <br /><br />
                                {combate.estado === "en_curso" && (
                                  <span className="text-orange-600 font-medium">
                                    Este combate está en curso y se eliminará también de "Combates en Vivo".
                                  </span>
                                )}
                                {combate.estado === "finalizado" && (
                                  <span className="text-blue-600 font-medium">
                                    Este combate ya está finalizado. El resultado se perderá permanentemente.
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
                )
              })
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
