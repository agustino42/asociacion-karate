"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export type AtletaFormData = {
  nombre: string
  apellido: string
  cedula: string
  fecha_nacimiento: string
  peso?: number
  categoria_peso: string
  cinturon: string
  equipo_id?: string
  activo: boolean
  genero?: string
}

export async function crearAtleta(formData: AtletaFormData) {
  const supabase = await createClient()

  const dataToInsert = {
    ...formData,
    equipo_id: formData.equipo_id || null,
    peso: formData.peso || null,
  }

  const { error } = await supabase.from("atletas").insert([dataToInsert])

  if (error) {
    console.error("[0] Error al crear atleta:", error)
    throw new Error(error.message)
  }

  revalidatePath("/admin/atletas")
  redirect("/admin/atletas")
}

export async function actualizarAtleta(id: string, formData: AtletaFormData) {
  const supabase = await createClient()

  const dataToUpdate = {
    ...formData,
    equipo_id: formData.equipo_id || null,
    peso: formData.peso || null,
  }

  const { error } = await supabase.from("atletas").update(dataToUpdate).eq("id", id)

  if (error) {
    console.error("[0] Error al actualizar atleta:", error)
    throw new Error(error.message)
  }

  revalidatePath("/admin/atletas")
  redirect("/admin/atletas")
}

export async function eliminarAtleta(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("atletas").delete().eq("id", id)

  if (error) {
    console.error("[0] Error al eliminar atleta:", error)
    throw new Error(error.message)
  }

  revalidatePath("/admin/atletas")
}

export async function obtenerAtletas() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("atletas")
    .select("*, equipos(nombre)")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[] Error al obtener atletas:", error)
    return []
  }

  return data || []
}

export async function obtenerAtleta(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.from("atletas").select("*").eq("id", id).single()

  if (error) {
    console.error("[0] Error al obtener atleta:", error)
    return null
  }

  return data
}
