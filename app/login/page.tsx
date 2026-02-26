"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMsg(error.message);
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  };

  const resetPassword = async () => {
    if (!email) {
      setMsg("Escribe tu email primero.");
      return;
    }

    setLoading(true);
    setMsg(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setMsg(error.message);
    } else {
      setMsg("Te enviamos un correo para crear tu contraseña.");
    }

    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 420, margin: "64px auto", padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>
        Ingresar
      </h1>

      <form onSubmit={signIn}>
        <label>Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="correo@..."
          style={{ width: "100%", padding: 10, margin: "8px 0 16px" }}
          required
        />

        <label>Contraseña</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="********"
          style={{ width: "100%", padding: 10, margin: "8px 0 16px" }}
          required
        />

        <button disabled={loading} style={{ width: "100%", padding: 12 }}>
          {loading ? "Ingresando..." : "Ingresar"}
        </button>

        <button
          type="button"
          onClick={resetPassword}
          disabled={loading}
          style={{ width: "100%", padding: 12, marginTop: 10 }}
        >
          Olvidé mi contraseña
        </button>

        {msg && <p style={{ marginTop: 12 }}>{msg}</p>}
      </form>
    </div>
  );
}