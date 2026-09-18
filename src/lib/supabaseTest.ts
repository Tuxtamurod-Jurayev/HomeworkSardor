
import { supabase } from "./supabaseClient";

export async function testSupabaseConnection() {
  const { error } = await supabase
    .from("users")
    .select("id")
    .limit(1);

  if (error) {
    console.error("Supabase ulanish xatosi:", error);
    return {
      success: false,
      error: error.message,
    };
  }

  console.log("Supabase muvaffaqiyatli ulandi!");

  return {
    success: true,
    error: null,
  };
}