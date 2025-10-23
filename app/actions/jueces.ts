"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export type JuezFormData = {
  nombre: string
  apellido: string
  cedula: string
  nivel_certificacion: string
  anos_experiencia: number
  telefono?: string
  email?: string
  activo: boolean
}

export async function crearJuez(formData: JuezFormData) {
  const supabase = await createClient()

  const { error } = await supabase.from("jueces").insert([formData])

  if (error) {
    console.error("[v0] Error al crear juez:", error)
    throw new Error(error.message)
  }

  revalidatePath("/admin/jueces")
  redirect("/admin/jueces")
}

export async function actualizarJuez(id: string, formData: JuezFormData) {
  const supabase = await createClient()

  const { error } = await supabase.from("jueces").update(formData).eq("id", id)

  if (error) {
    console.error("[v0] Error al actualizar juez:", error)
    throw new Error(error.message)
  }

  revalidatePath("/admin/jueces")
  redirect("/admin/jueces")
}

export async function eliminarJuez(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("jueces").delete().eq("id", id)

  if (error) {
    console.error("[v0] Error al eliminar juez:", error)
    throw new Error(error.message)
  }

  revalidatePath("/admin/jueces")
}

export async function obtenerJueces() {
  const supabase = await createClient()

  const { data, error } = await supabase.from("jueces").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("[0] Error al obtener jueces:", error)
    return []
  }

  return data || []
}

export async function obtenerJuez(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.from("jueces").select("*").eq("id", id).single()

  if (error) {
    console.error("[0] Error al obtener juez:", error)
    return null
  }

  return data
}
