import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";

// Necesitamos usar la llave Service Role para crear al usuario con el correo auto-confirmado
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const serviceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export const POST: APIRoute = async ({ request, redirect }) => {
  const formData = await request.formData();
  const firstName = formData.get("firstName")?.toString().trim();
  const lastName1 = formData.get("lastName1")?.toString().trim();
  const lastName2 = formData.get("lastName2")?.toString().trim() || "";
  const birthDate = formData.get("birthDate")?.toString(); // Formato YYYY-MM-DD
  const password = formData.get("password")?.toString();

  if (!firstName || !lastName1 || !birthDate || !password) {
    return redirect("/register?error=" + encodeURIComponent("Los campos obligatorios deben estar completos"));
  }
  
  const lastNames = lastName2 ? `${lastName1} ${lastName2}` : lastName1;

  // Lógica de generación de credencial
  // 1. Iniciales de apellidos
  let initials = lastName1[0].toUpperCase();
  if (lastName2) {
    initials += lastName2[0].toUpperCase();
  } else {
    // Si solo tiene un apellido, usamos las dos primeras letras de ese apellido
    initials = lastName1.substring(0, 2).toUpperCase();
  }

  // 2. Año actual (ultimos 2 digitos)
  const currentYear = new Date().getFullYear().toString().slice(-2);
  
  // 3. Mes de nacimiento
  const birthMonth = birthDate.split("-")[1]; // YYYY-MM-DD -> MM
  
  // 4. Secuencia aleatoria (01 al 99)
  const randomSeq = Math.floor(Math.random() * 90 + 10).toString();

  // Credencial Final (Ej: LP261027)
  const credential = `${initials}${currentYear}${birthMonth}${randomSeq}`;
  const fakeEmail = `${credential.toLowerCase()}@confir.local`;

  // Crear usuario usando admin API para auto-confirmar el correo falso
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: fakeEmail,
    password: password,
    email_confirm: true, // ¡Clave para que no pida confirmar correo falso!
    user_metadata: {
      first_name: firstName,
      last_names: lastNames,
      full_name: `${firstName} ${lastNames}`,
      credential: credential,
      birth_date: birthDate
    }
  });

  if (error) {
    return redirect("/register?error=" + encodeURIComponent(error.message));
  }

  // Crear el perfil recién creado
  if (data.user) {
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: data.user.id,
        first_name: firstName,
        last_names: lastNames,
        credential: credential,
        birth_date: birthDate,
        role: 'student'
      });

    if (profileError) {
      console.error("Error creando perfil:", profileError);
    }
  }

  // Redirigir a una página de éxito que le muestre su credencial (o pasarla por URL temporalmente)
  return redirect(`/login?credential=${credential}&registered=true`);
};
