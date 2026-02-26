"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const supabase = createClient();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMsg(error.message);
      setLoading(false);
      return;
    }

    setMsg("Contraseña actualizada. Ya puedes ingresar.");
    setLoading(false);

    setTimeout(() => {
      router.push("/");
      router.refresh();
    }, 800);
  };

  return (
    <div style={{ maxWidth: 420, margin: "64px auto", padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>
        Crear nueva contraseña
      </h1>

      <form onSubmit={updatePassword}>
        <label>Nueva contraseña</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="********"
          style={{ width: "100%", padding: 10, margin: "8px 0 16px" }}
          required
        />

        <button disabled={loading} style={{ width: "100%", padding: 12 }}>
          {loading ? "Guardando..." : "Guardar contraseña"}
        </button>

        {msg && <p style={{ marginTop: 12 }}>{msg}</p>}
      </form>
    </div>
  );
}