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

/**
 * Tipo que define la estructura de un atleta en el sistema
 * @property id - Identificador único del atleta
 * @property nombre - Nombre del atleta
 * @property apellido - Apellido del atleta
 * @property cedula - Cédula de identidad (usada para búsquedas)
 * @property cinturon - Nivel de cinturón (ej: blanco, negro, etc.)
 * @property categoria_peso - Categoría de peso competitiva
 * @property activo - Estado actual del atleta en el sistema
 * @property equipos - Equipo al que pertenece (opcional)
 */
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

/**
 * Componente de tabla para gestionar y visualizar atletas
 * @param atletas - Array de objetos Atleta a mostrar en la tabla
 * 
 * CARACTERÍSTICAS PRINCIPALES:
 * - Búsqueda en tiempo real por nombre, apellido o cédula
 * - Visualización de estado con badges
 * - Acciones de edición y eliminación
 * - Confirmación modal para eliminación
 * - Manejo de estado local para filtrado
 */
export function AtletasTable({ atletas }: { atletas: Atleta[] }) {
  // Estado para el término de búsqueda
  const [searchTerm, setSearchTerm] = useState("")

  /**
   * Filtra los atletas basándose en el término de búsqueda
   * Busca en: nombre, apellido (case insensitive) y cédula (case sensitive)
   */
  const filteredAtletas = atletas.filter(
    (atleta) =>
      atleta.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      atleta.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      atleta.cedula.includes(searchTerm),
  )

  /**
   * Maneja la eliminación de un atleta
   * @param id - ID del atleta a eliminar
   */
  const handleDelete = async (id: string) => {
    try {
      await eliminarAtleta(id)
      // Nota: Se podría agregar actualización de estado o toast de confirmación
    } catch (error) {
      console.error("Error al eliminar atleta:", error)
      // Nota: Se podría agregar manejo de errores con toast o alerta
    }
  }

  return (
    <div className="space-y-4">
      {/* BARRA DE BÚSQUEDA */}
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, apellido o cédula..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* TABLA DE ATLETAS */}
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
            {/* ESTADO VACÍO */}
            {filteredAtletas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  {atletas.length === 0 
                    ? "No hay atletas registrados" 
                    : "No se encontraron atletas con los criterios de búsqueda"
                  }
                </TableCell>
              </TableRow>
            ) : (
              /* LISTA DE ATLETAS FILTRADOS */
              filteredAtletas.map((atleta) => (
                <TableRow key={atleta.id}>
                  {/* INFORMACIÓN PERSONAL */}
                  <TableCell className="font-medium">
                    {atleta.nombre} {atleta.apellido}
                  </TableCell>
                  <TableCell>{atleta.cedula}</TableCell>
                  <TableCell>{atleta.cinturon}</TableCell>
                  <TableCell>{atleta.categoria_peso}</TableCell>
                  
                  {/* EQUIPO */}
                  <TableCell>{atleta.equipos?.nombre || "Sin equipo"}</TableCell>
                  
                  {/* ESTADO */}
                  <TableCell>
                    <Badge variant={atleta.activo ? "default" : "secondary"}>
                      {atleta.activo ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  
                  {/* ACCIONES */}
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {/* BOTÓN EDITAR - Navega a página de edición */}
                      <Link href={`/admin/atletas/${atleta.id}/editar`}>
                        <Button variant="outline" size="icon" title={`Editar ${atleta.nombre}`}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      
                      {/* BOTÓN ELIMINAR - Modal de confirmación */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="icon" title={`Eliminar ${atleta.nombre}`}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Se eliminará permanentemente el atleta{" "}
                              <strong>{atleta.nombre} {atleta.apellido}</strong>.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(atleta.id)}>
                              Eliminar
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
    </div>
  )
}

/**
 * MEJORAS SUGERIDAS:
 * 
 * 1. Agregar paginación para grandes volúmenes de datos
 * 2. Implementar sorting por columnas
 * 3. Agregar loading states durante eliminación
 * 4. Implementar sistema de notificaciones (toast) para feedback
 * 5. Agregar filtros adicionales (por equipo, cinturón, estado)
 * 6. Implementar debounce en la búsqueda para mejor performance
 */