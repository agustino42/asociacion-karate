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
import { eliminarAtleta } from "@/app/actions/atletas"

type Atleta = {
  id: string
  nombre: string
  apellido: string
  cedula: string
  cinturon: string
  categoria_peso: string
  activo: boolean
  equipos?: {
    id: string
    nombre: string
  } | null
}

export function AtletasTable({ atletas }: { atletas: Atleta[] }) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredAtletas = atletas.filter(
    (atleta) =>
      atleta.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      atleta.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      atleta.cedula.includes(searchTerm),
  )

  const handleDelete = async (id: string) => {
    try {
      await eliminarAtleta(id)
    } catch (error) {
      console.error("[v0] Error al eliminar atleta:", error)
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
              <TableHead>Cinturón</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Equipo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAtletas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No se encontraron atletas
                </TableCell>
              </TableRow>
            ) : (
              filteredAtletas.map((atleta) => (
                <TableRow key={atleta.id}>
                  <TableCell className="font-medium">
                    {atleta.nombre} {atleta.apellido}
                  </TableCell>
                  <TableCell>{atleta.cedula}</TableCell>
                  <TableCell>{atleta.cinturon}</TableCell>
                  <TableCell>{atleta.categoria_peso}</TableCell>
                  <TableCell>{atleta.equipos?.nombre || "Sin equipo"}</TableCell>
                  <TableCell>
                    <Badge variant={atleta.activo ? "default" : "secondary"}>
                      {atleta.activo ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/atletas/${atleta.id}/editar`}>
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
                              Esta acción no se puede deshacer. Se eliminará permanentemente el atleta {atleta.nombre}{" "}
                              {atleta.apellido}.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(atleta.id)}>Eliminar</AlertDialogAction>
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
