import type { APIRoute } from "astro";
import { supabase } from "../../../utils/supabase";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const formData = await request.formData();
  const identifier = formData.get("identifier")?.toString();
  const password = formData.get("password")?.toString();

  if (!identifier || !password) {
    return redirect(`/login?error=${encodeURIComponent("Credencial y contraseña obligatorios")}&credential=${encodeURIComponent(identifier || "")}`);
  }

  // Si no tiene '@', asumimos que es una credencial (ej: EL231027)
  // y le agregamos nuestro dominio interno para que Supabase lo acepte como email
  const email = identifier.includes("@") ? identifier : `${identifier.toLowerCase()}@confir.local`;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return redirect(`/login?error=${encodeURIComponent(error.message)}&credential=${encodeURIComponent(identifier)}`);
  }

  const { access_token, refresh_token } = data.session;
  
  cookies.set("sb-access-token", access_token, {
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 1 semana
  });
  cookies.set("sb-refresh-token", refresh_token, {
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 dias
  });

  return redirect("/lessons");
};
