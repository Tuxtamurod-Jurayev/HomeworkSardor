
import { useEffect, useState } from "react";
import { testSupabaseConnection } from "../lib/supabaseTest";

export default function SupabaseConnectionTest() {
  const [status, setStatus] = useState("Tekshirilmoqda...");
  const [error, setError] = useState("");

  useEffect(() => {
    async function checkConnection() {
      const result = await testSupabaseConnection();

      if (result.success) {
        setStatus("Supabase muvaffaqiyatli ulandi!");
      } else {
        setStatus("Supabase ulanishida xatolik!");
        setError(result.error || "Noma'lum xatolik");
      }
    }

    checkConnection();
  }, []);

  return (
    <div
      style={{
        padding: "20px",
        margin: "20px",
        borderRadius: "12px",
        background: "#f3f4f6",
        color: "#111827",
      }}
    >
      <h2>Supabase ulanishi</h2>

      <p>{status}</p>

      {error && (
        <p style={{ color: "red" }}>
          Xatolik: {error}
        </p>
      )}
    </div>
  );
}