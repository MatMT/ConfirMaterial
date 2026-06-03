import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const serviceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const accessToken = cookies.get("sb-access-token");
  
  if (!accessToken) {
    return redirect("/login");
  }

  // Verificar quién es el usuario actual usando su token real
  const supabase = createClient(supabaseUrl, import.meta.env.PUBLIC_SUPABASE_ANON_KEY);
  const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken.value);

  if (authError || !user) {
    return redirect("/login");
  }

  const formData = await request.formData();
  const newPassword = formData.get("newPassword")?.toString().trim();
  const confirmPassword = formData.get("confirmPassword")?.toString().trim();

  if (!newPassword || !confirmPassword) {
    return redirect("/dashboard?error=" + encodeURIComponent("Todos los campos son obligatorios"));
  }

  if (newPassword !== confirmPassword) {
    return redirect("/dashboard?error=" + encodeURIComponent("Las contraseñas no coinciden"));
  }

  if (newPassword.length < 6) {
    return redirect("/dashboard?error=" + encodeURIComponent("La contraseña debe tener al menos 6 caracteres"));
  }

  // Actualizar la contraseña del usuario
  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, { 
    password: newPassword
  });

  if (updateError) {
    console.error("Error al actualizar contraseña:", updateError);
    return redirect("/dashboard?error=" + encodeURIComponent("Error al actualizar contraseña: " + updateError.message));
  }

  return redirect("/dashboard?success=" + encodeURIComponent("Contraseña actualizada exitosamente"));
};
