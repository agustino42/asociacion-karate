"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function eliminarCombateIndividual(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("combates_individuales").delete().eq("id", id)

  if (error) {
    console.error("[0] Error al eliminar combate individual:", error)
    throw new Error(error.message)
  }

  revalidatePath("/admin/combates")
}

export async function eliminarCombateEquipo(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("combates_equipos").delete().eq("id", id)

  if (error) {
    console.error("[0] Error al eliminar combate por equipos:", error)
    throw new Error(error.message)
  }

  revalidatePath("/admin/combates")
}
