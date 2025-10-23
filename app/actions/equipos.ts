"use server"

import { createClient } from "@/lib/supabase/server"

export async function obtenerEquipos() {
  const supabase = await createClient()

  const { data, error } = await supabase.from("equipos").select("*").order("nombre", { ascending: true })

  if (error) {
    console.error("[0] Error al obtener equipos:", error)
    return []
  }

  return data || []
}
