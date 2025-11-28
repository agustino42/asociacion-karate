"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function eliminarCombateIndividual(id: string) {
  const supabase = await createClient()

  // Primero verificar si el combate existe
  const { data: combate, error: fetchError } = await supabase
    .from("combates_individuales")
    .select("*")
    .eq("id", id)
    .single()

  if (fetchError) {
    console.error("Error al buscar combate:", fetchError)
    throw new Error("Combate no encontrado")
  }

  // Eliminar el combate
  const { error } = await supabase.from("combates_individuales").delete().eq("id", id)

  if (error) {
    console.error("Error al eliminar combate individual:", error)
    throw new Error(error.message)
  }

  // Revalidar múltiples rutas para actualizar combates en vivo
  revalidatePath("/admin/combates")
  revalidatePath("/")
  revalidatePath("/admin")
  
  return { success: true, message: "Combate eliminado correctamente" }
}

export async function eliminarCombateEquipo(id: string) {
  const supabase = await createClient()

  // Primero verificar si el combate existe
  const { data: combate, error: fetchError } = await supabase
    .from("combates_equipos")
    .select("*")
    .eq("id", id)
    .single()

  if (fetchError) {
    console.error("Error al buscar combate por equipos:", fetchError)
    throw new Error("Combate no encontrado")
  }

  // Eliminar el combate
  const { error } = await supabase.from("combates_equipos").delete().eq("id", id)

  if (error) {
    console.error("Error al eliminar combate por equipos:", error)
    throw new Error(error.message)
  }

  // Revalidar múltiples rutas para actualizar combates en vivo
  revalidatePath("/admin/combates")
  revalidatePath("/")
  revalidatePath("/admin")
  
  return { success: true, message: "Combate por equipos eliminado correctamente" }
}

// Función para eliminar combates problemáticos (que no terminan correctamente)
export async function eliminarCombatesProblematicos() {
  const supabase = await createClient()

  try {
    // Buscar combates en estado "en_curso" que llevan más de 2 horas
    const dosHorasAtras = new Date()
    dosHorasAtras.setHours(dosHorasAtras.getHours() - 2)

    const { data: combatesProblematicos, error: fetchError } = await supabase
      .from("combates_individuales")
      .select("*")
      .eq("estado", "en_curso")
      .lt("created_at", dosHorasAtras.toISOString())

    if (fetchError) {
      throw new Error(fetchError.message)
    }

    if (!combatesProblematicos || combatesProblematicos.length === 0) {
      return { success: true, message: "No hay combates problemáticos para eliminar", count: 0 }
    }

    // Eliminar combates problemáticos
    const { error: deleteError } = await supabase
      .from("combates_individuales")
      .delete()
      .eq("estado", "en_curso")
      .lt("created_at", dosHorasAtras.toISOString())

    if (deleteError) {
      throw new Error(deleteError.message)
    }

    // Revalidar rutas
    revalidatePath("/admin/combates")
    revalidatePath("/")
    revalidatePath("/admin")

    return { 
      success: true, 
      message: `Se eliminaron ${combatesProblematicos.length} combates problemáticos`, 
      count: combatesProblematicos.length 
    }
  } catch (error) {
    console.error("Error al eliminar combates problemáticos:", error)
    throw new Error("No se pudieron eliminar los combates problemáticos")
  }
}
