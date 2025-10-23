"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"
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
import { eliminarEntrenador } from "@/app/actions/entrenadores"

type Entrenador = {
  id: string
  nombre: string
  apellido: string
  cedula: string
  anos_experiencia: number
  especialidad: string
  activo: boolean
}

export function EntrenadoresTable({ entrenadores }: { entrenadores: Entrenador[] }) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredEntrenadores = entrenadores.filter(
    (entrenador) =>
      entrenador.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entrenador.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entrenador.cedula.includes(searchTerm),
  )

  const handleDelete = async (id: string) => {
    try {
      await eliminarEntrenador(id)
    } catch (error) {
      console.error("[v0] Error al eliminar entrenador:", error)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, apellido o cédula..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Cédula</TableHead>
              <TableHead>Experiencia</TableHead>
              <TableHead>Especialidad</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEntrenadores.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No se encontraron entrenadores
                </TableCell>
              </TableRow>
            ) : (
              filteredEntrenadores.map((entrenador) => (
                <TableRow key={entrenador.id}>
                  <TableCell className="font-medium">
                    {entrenador.nombre} {entrenador.apellido}
                  </TableCell>
                  <TableCell>{entrenador.cedula}</TableCell>
                  <TableCell>{entrenador.anos_experiencia} años</TableCell>
                  <TableCell>{entrenador.especialidad}</TableCell>
                  <TableCell>
                    <Badge variant={entrenador.activo ? "default" : "secondary"}>
                      {entrenador.activo ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/entrenadores/${entrenador.id}/editar`}>
                        <Button variant="outline" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
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
                              Esta acción no se puede deshacer. Se eliminará permanentemente el entrenador{" "}
                              {entrenador.nombre} {entrenador.apellido}.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(entrenador.id)}>Eliminar</AlertDialogAction>
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
    </div>
  )
}
