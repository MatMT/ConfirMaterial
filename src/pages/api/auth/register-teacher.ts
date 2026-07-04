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
  const confirmPassword = formData.get("confirmPassword")?.toString();
  const adminPin = formData.get("adminPin")?.toString();

  const buildErrorUrl = (msg: string) => {
    const params = new URLSearchParams({
      error: msg,
      firstName: firstName || "",
      lastNames: lastNames || "",
      email: email || ""
    });
    return `/register-teacher?${params.toString()}`;
  };

  if (!firstName || !lastNames || !email || !password || !confirmPassword || !adminPin) {
    return redirect(buildErrorUrl("Todos los campos son obligatorios"));
  }

  if (password !== confirmPassword) {
    return redirect(buildErrorUrl("Las contraseñas no coinciden"));
  }

  if (adminPin !== adminPinConfig) {
    return redirect(buildErrorUrl("PIN de administrador incorrecto"));
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
    let msg = error.message;
    if (msg.toLowerCase().includes("rate limit") || msg.toLowerCase().includes("limit exceeded")) {
      msg = "Has superado el límite de intentos de registro por hora. Por favor, espera entre 15 a 60 minutos antes de intentar crear otra cuenta.";
    } else if (msg.toLowerCase().includes("already registered") || msg.toLowerCase().includes("already exists")) {
      msg = "Ya existe una cuenta registrada con este correo electrónico.";
    } else if (msg.toLowerCase().includes("at least 6 characters")) {
      msg = "La contraseña debe tener al menos 6 caracteres.";
    } else {
      msg = "Error al registrar la cuenta: " + msg;
    }
    return redirect(buildErrorUrl(msg));
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
