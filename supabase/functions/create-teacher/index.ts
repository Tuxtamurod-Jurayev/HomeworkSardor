
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    if (request.method !== "POST") {
      return new Response(
        JSON.stringify({
          error: "Faqat POST so‘rovi qabul qilinadi.",
        }),
        {
          status: 405,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceRoleKey = Deno.env.get(
      "SUPABASE_SERVICE_ROLE_KEY",
    )!;

    const authorization = request.headers.get("Authorization");

    if (!authorization) {
      return new Response(
        JSON.stringify({
          error: "Autentifikatsiya talab qilinadi.",
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    // So‘rov yuborgan foydalanuvchini aniqlash
    const userClient = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        global: {
          headers: {
            Authorization: authorization,
          },
        },
      },
    );

    const {
      data: { user: currentUser },
      error: currentUserError,
    } = await userClient.auth.getUser();

    if (currentUserError || !currentUser) {
      return new Response(
        JSON.stringify({
          error: "Foydalanuvchi autentifikatsiyadan o‘tmadi.",
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Server uchun maxsus kalit
    const adminClient = createClient(
      supabaseUrl,
      supabaseServiceRoleKey,
    );

    // Faqat admin huquqini tekshirish
    const { data: adminAccount, error: adminError } =
      await adminClient
        .from("users")
        .select("id, role, status")
        .eq("auth_user_id", currentUser.id)
        .eq("role", "admin")
        .maybeSingle();

    if (adminError || !adminAccount) {
      return new Response(
        JSON.stringify({
          error: "Faqat admin teacher yaratishi mumkin.",
        }),
        {
          status: 403,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    if (adminAccount.status === "Nofaol") {
      return new Response(
        JSON.stringify({
          error: "Admin hisobi nofaol.",
        }),
        {
          status: 403,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    const body = await request.json();

    const firstName = String(body.firstName ?? "").trim();
    const lastName = String(body.lastName ?? "").trim();
    const login = String(body.login ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!firstName || !lastName || !login || !password) {
      return new Response(
        JSON.stringify({
          error: "Barcha majburiy maydonlarni to‘ldiring.",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    if (password.length < 6) {
      return new Response(
        JSON.stringify({
          error: "Parol kamida 6 ta belgidan iborat bo‘lishi kerak.",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Login takrorlanganini tekshirish
    const { data: existingTeacher } = await adminClient
      .from("users")
      .select("id")
      .eq("login", login)
      .maybeSingle();

    if (existingTeacher) {
      return new Response(
        JSON.stringify({
          error: "Bu login allaqachon mavjud.",
        }),
        {
          status: 409,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    const authEmail = `${login}@homework.local`;
    const fullName = `${firstName} ${lastName}`;

    // Auth account yaratish
    const {
      data: authData,
      error: authError,
    } = await adminClient.auth.admin.createUser({
      email: authEmail,
      password,
      email_confirm: true,
      user_metadata: {
        login,
        role: "teacher",
        full_name: fullName,
      },
    });

    if (authError || !authData.user) {
      return new Response(
        JSON.stringify({
          error: authError?.message ?? "Auth account yaratilmadi.",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Auth accountni users jadvali bilan bog‘lash
    const { data: teacher, error: insertError } =
      await adminClient
        .from("users")
        .insert({
          login,
          full_name: fullName,
          first_name: firstName,
          last_name: lastName,
          role: "teacher",
          status: "Faol",
          groups_count: 0,
          students_count: 0,
          auth_user_id: authData.user.id,
        })
        .select()
        .single();

    if (insertError) {
      // Jadvalga saqlashda xatolik bo‘lsa Auth accountni o‘chirish
      await adminClient.auth.admin.deleteUser(authData.user.id);

      return new Response(
        JSON.stringify({
          error: insertError.message,
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    return new Response(
      JSON.stringify({
        message: "Teacher muvaffaqiyatli yaratildi.",
        teacher,
      }),
      {
        status: 201,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("create-teacher error:", error);

    return new Response(
      JSON.stringify({
        error: "Serverda kutilmagan xatolik yuz berdi.",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }
});