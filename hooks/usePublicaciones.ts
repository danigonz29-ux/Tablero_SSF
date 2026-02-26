"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

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
};

export type NuevaPublicacion = Omit<
  Publicacion,
  "id" | "created_at"
>;

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

      // Recargar desde DB para asegurar consistencia
      await fetchPublicaciones();
      return { ok: true as const };
    },
    [supabase, fetchPublicaciones]
  );

  useEffect(() => {
    fetchPublicaciones();
  }, [fetchPublicaciones]);

  return {
    items,
    loading,
    error,
    fetchPublicaciones,
    addPublicacion,
  };
}