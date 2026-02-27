"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// --------- DB row shape (Supabase) ----------
export type Publicacion = {
  id: string;
  created_at: string;
  fecha: string | null;
  plataforma: string | null;
  titulo: string | null;
  copy: string | null;
  link_pieza: string | null;
  alcance: number | null;
  interacciones: number | null;
  clics: number | null;
  created_by: string | null;

  // si ya estás usando payload en la tabla, lo dejamos opcional
  payload?: any | null;
};

export type NuevaPublicacion = Omit<Publicacion, "id" | "created_at">;

// --------- UI shape (lo que necesita PublicationCalendar / dashboard) ----------
export type PublicationUI = {
  id: string;
  date: string; // ISO date string
  theme: string;
  description: string;
  objective: string; // "informar" etc.
  networks: any[]; // si tienes enum en types, cámbialo por SocialNetwork[]
  time: string; // "HH:mm"
  format: string; // "imagen" | "video" ...
  responsibles: string[];
  status: string; // "pendiente" | "publicado" ...
  caption?: string;
  hashtags: string[];
  links: { network: any; url: string }[];
  attachments?: any[];

  // esto es lo clave para tu modal:
  metrics: {
    reach: number;
    interactions: number;
    likes: number;
    comments: number;
    shares: number;
    impressions: number;
    engagement: number;
  };

  // opcional: conservar columnas directas por compatibilidad
  alcance?: number;
  interacciones?: number;
};

function toISODateOrToday(fecha: string | null) {
  if (!fecha) return new Date().toISOString();
  // si fecha ya viene ISO, lo respetamos
  const d = new Date(fecha);
  if (!Number.isNaN(d.getTime())) return d.toISOString();
  return new Date().toISOString();
}

function safeNumber(v: any) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function mapRowToUI(row: Publicacion): PublicationUI {
  const payload = row.payload ?? {};

  // fallback a payload si existe
  const time = payload.time ?? "--";
  const format = payload.format ?? payload.tipo ?? "--";
  const status = payload.status ?? "pendiente";
  const objective = payload.objective ?? "informar";
  const networks = Array.isArray(payload.networks) ? payload.networks : [];
  const responsibles = Array.isArray(payload.responsibles) ? payload.responsibles : [];
  const hashtags = Array.isArray(payload.hashtags) ? payload.hashtags : [];
  const links = Array.isArray(payload.links) ? payload.links : [];
  const caption = payload.caption ?? undefined;
  const attachments = Array.isArray(payload.attachments) ? payload.attachments : undefined;

  const reach = safeNumber(row.alcance);
  const interactions = safeNumber(row.interacciones);

  return {
    id: row.id,
    date: toISODateOrToday(row.fecha),
    theme: row.titulo ?? "",
    description: row.copy ?? "",
    objective,
    networks,
    time,
    format,
    responsibles,
    status,
    caption,
    hashtags,
    links,
    attachments,
    metrics: {
      reach,
      interactions,
      likes: safeNumber(payload.metrics?.likes),
      comments: safeNumber(payload.metrics?.comments),
      shares: safeNumber(payload.metrics?.shares),
      impressions: safeNumber(payload.metrics?.impressions),
      engagement: safeNumber(payload.metrics?.engagement),
    },
    alcance: reach,
    interacciones: interactions,
  };
}

export function usePublicaciones() {
  const supabase = createClient();

  const [items, setItems] = useState<Publicacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPublicaciones = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("publicaciones")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setItems((data || []) as Publicacion[]);
    setLoading(false);
  }, [supabase]);

  const addPublicacion = useCallback(
    async (payload: Omit<NuevaPublicacion, "created_by">) => {
      setError(null);

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) {
        setError(userError.message);
        return { ok: false as const };
      }

      const userId = userData.user?.id || null;

      const { error: insertError } = await supabase
        .from("publicaciones")
        .insert({
          ...payload,
          created_by: userId,
        });

      if (insertError) {
        setError(insertError.message);
        return { ok: false as const };
      }

      await fetchPublicaciones();
      return { ok: true as const };
    },
    [supabase, fetchPublicaciones]
  );

  useEffect(() => {
    fetchPublicaciones();
  }, [fetchPublicaciones]);

  // ✅ esto es lo que debe consumir tu dashboard / PublicationCalendar
  const publicationsUI = useMemo(() => {
    return items.map(mapRowToUI);
  }, [items]);

  return {
    // raw DB rows (por si los necesitas)
    items,
    // UI-ready (usa este en el dashboard)
    publications: publicationsUI,

    loading,
    error,
    fetchPublicaciones,
    addPublicacion,
  };
}