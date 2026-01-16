"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Loader2, Trash2 } from "lucide-react"
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
import { eliminarCombatesProblematicos } from "@/app/actions/combates"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export function LimpiarCombatesButton() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleLimpiarCombates = async () => {
    setIsLoading(true)
    try {
      const result = await eliminarCombatesProblematicos()
      
      if (result.count === 0) {
        toast({
          title: "Sin combates problemáticos",
          description: "No se encontraron combates que necesiten ser eliminados.",
        })
      } else {
        toast({
          title: "Combates eliminados",
          description: `Se eliminaron ${result.count} combates problemáticos. Ya no aparecerán en combates en vivo.`,
        })
      }
      
      router.refresh()
    } catch (error) {
      console.error("Error al limpiar combates:", error)
      toast({
        title: "Error",
        description: "No se pudieron eliminar los combates problemáticos. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <AlertTriangle className="mr-2 h-4 w-4" />
          )}
          Limpiar Combates Problemáticos
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Limpiar combates problemáticos?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción eliminará todos los combates que estén en estado "en curso" por más de 2 horas.
            <br /><br />
            <strong>Esto incluye:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Combates que no terminaron correctamente</li>
              <li>Combates "colgados" o con errores</li>
              <li>Combates que aparecen en "Combates en Vivo" pero ya no están activos</li>
            </ul>
            <br />
            <span className="text-orange-600 font-medium">
              ⚠️ Esta acción no se puede deshacer.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleLimpiarCombates}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Limpiando...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Limpiar Combates
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}