"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export type EntrenadorFormData = {
  nombre: string
  apellido: string
  cedula: string
  anos_experiencia: number
  especialidad: string
  telefono?: string
  email?: string
  activo: boolean
}

export async function crearEntrenador(formData: EntrenadorFormData) {
  const supabase = await createClient()

  const { error } = await supabase.from("entrenadores").insert([formData])

  if (error) {
    console.error("[] Error al crear entrenador:", error)
    throw new Error(error.message)
  }

  revalidatePath("/admin/entrenadores")
  redirect("/admin/entrenadores")
}

export async function actualizarEntrenador(id: string, formData: EntrenadorFormData) {
  const supabase = await createClient()

  const { error } = await supabase.from("entrenadores").update(formData).eq("id", id)

  if (error) {
    console.error("[] Error al actualizar entrenador:", error)
    throw new Error(error.message)
  }

  revalidatePath("/admin/entrenadores")
  redirect("/admin/entrenadores")
}

export async function eliminarEntrenador(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("entrenadores").delete().eq("id", id)

  if (error) {
    console.error("[] Error al eliminar entrenador:", error)
    throw new Error(error.message)
  }

  revalidatePath("/admin/entrenadores")
}

export async function obtenerEntrenadores() {
  const supabase = await createClient()

  const { data, error } = await supabase.from("entrenadores").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("[] Error al obtener entrenadores:", error)
    return []
  }

  return data || []
}

export async function obtenerEntrenador(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.from("entrenadores").select("*").eq("id", id).single()

  if (error) {
    console.error("[] Error al obtener entrenador:", error)
    return null
  }

  return data
}
