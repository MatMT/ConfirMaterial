import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";

// Necesitamos usar la llave Service Role porque el usuario podría estar cambiando su nombre,
// y si el RLS (Row Level Security) no está configurado correctamente para permitir UPDATE, fallará.
// Aunque lo ideal es que el usuario use su propio token, usamos el admin para asegurar la escritura rápida en este prototipo.
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
  // Esto previene que alguien edite el perfil de otro enviando un ID falso
  const supabase = createClient(supabaseUrl, import.meta.env.PUBLIC_SUPABASE_ANON_KEY);
  const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken.value);

  if (authError || !user) {
    return redirect("/login");
  }

  const formData = await request.formData();
  const firstName = formData.get("firstName")?.toString().trim();
  const lastNames = formData.get("lastNames")?.toString().trim();
  const birthDate = formData.get("birthDate")?.toString();

  if (!firstName || !lastNames || !birthDate) {
    return redirect("/dashboard?error=" + encodeURIComponent("Todos los campos son obligatorios"));
  }

  // Actualizar la tabla profiles usando el rol admin (o se podría usar el token del usuario si RLS lo permite)
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .update({
      first_name: firstName,
      last_names: lastNames,
      birth_date: birthDate,
      // actualizamos también un full_name compuesto por si se usa en otro lado
    })
    .eq('id', user.id);

  if (profileError) {
    console.error("Error al actualizar perfil:", profileError);
    return redirect("/dashboard?error=" + encodeURIComponent("Error al guardar los cambios: " + profileError.message));
  }

  // Opcional: También podríamos actualizar el user_metadata de auth.users si es necesario
  // await supabaseAdmin.auth.admin.updateUserById(user.id, { user_metadata: { first_name: firstName, last_names: lastNames } });

  return redirect("/dashboard?success=" + encodeURIComponent("Perfil actualizado correctamente"));
};
