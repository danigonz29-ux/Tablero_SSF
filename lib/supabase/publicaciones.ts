import { createClient } from "@/lib/supabase/client"
import type { Publication } from "@/lib/types"

type DbRow = {
  id: string
  created_at: string
  fecha: string | null
  created_by: string | null
  payload: any
}

export async function fetchPublicacionesByMonthYear(month: number, year: number) {
  const supabase = createClient()

  const start = new Date(year, month - 1, 1)
  const end = new Date(year, month, 1)

  const startISO = start.toISOString().slice(0, 10)
  const endISO = end.toISOString().slice(0, 10)

  const { data, error } = await supabase
    .from("publicaciones")
    .select("id, created_at, fecha, created_by, payload")
    .gte("fecha", startISO)
    .lt("fecha", endISO)
    .order("fecha", { ascending: true })

  if (error) throw new Error(error.message)

  return (data as DbRow[]).map((row) => {
    const p = (row.payload ?? {}) as Publication
    return {
      ...p,
      id: row.id,
      date: row.fecha ?? p.date,
    } as Publication
  })
}

export async function insertPublicacion(pub: Publication) {
  const supabase = createClient()

  const { data: userData, error: userErr } = await supabase.auth.getUser()
  if (userErr) throw new Error(userErr.message)

  const userId = userData.user?.id ?? null

  const { error } = await supabase.from("publicaciones").insert({
    fecha: pub.date,
    created_by: userId,
    payload: pub,
  })

  if (error) throw new Error(error.message)
}

export async function updatePublicacion(id: string, pub: Publication) {
  const supabase = createClient()

  const { error } = await supabase
    .from("publicaciones")
    .update({
      fecha: pub.date,
      payload: pub,
    })
    .eq("id", id)

  if (error) throw new Error(error.message)
}

export async function deletePublicaciones(ids: string[]) {
  const supabase = createClient()

  const { error } = await supabase
    .from("publicaciones")
    .delete()
    .in("id", ids)

  if (error) throw new Error(error.message)
}