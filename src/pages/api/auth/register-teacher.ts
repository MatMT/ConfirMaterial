import type { APIRoute } from "astro";
import { supabase } from "../../../utils/supabase";
import { createClient } from "@supabase/supabase-js";

// Usamos Admin API solo para actualizar el rol en la tabla profiles
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const serviceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
const adminPinConfig = import.meta.env.ADMIN_PIN;

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

export const POST: APIRoute = async ({ request, redirect }) => {
  const formData = await request.formData();
  const firstName = formData.get("firstName")?.toString().trim();
  const lastNames = formData.get("lastNames")?.toString().trim();
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();
  const adminPin = formData.get("adminPin")?.toString();

  if (!firstName || !lastNames || !email || !password || !adminPin) {
    return redirect("/register-teacher?error=" + encodeURIComponent("Todos los campos son obligatorios"));
  }

  if (adminPin !== adminPinConfig) {
    return redirect("/register-teacher?error=" + encodeURIComponent("PIN de administrador incorrecto"));
  }

  // Registro normal para maestro (se enviará el correo de confirmación real de Supabase)
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_names: lastNames,
        full_name: `${firstName} ${lastNames}`,
      },
    },
  });

  if (error) {
    return redirect("/register-teacher?error=" + encodeURIComponent(error.message));
  }

  // Crear perfil como teacher
  if (data.user) {
    await supabaseAdmin
      .from('profiles')
      .insert({
        id: data.user.id,
        first_name: firstName,
        last_names: lastNames,
        role: 'teacher'
      });
  }

  return redirect("/login?teacher_registered=true");
};
