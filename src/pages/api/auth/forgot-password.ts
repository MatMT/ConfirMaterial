import type { APIRoute } from "astro";
import { supabase } from "../../../utils/supabase";

export const POST: APIRoute = async ({ request, redirect, url }) => {
    const formData = await request.formData();
    const email = formData.get("email")?.toString().trim();

    if (!email) {
        return redirect(`/forgot-password?error=${encodeURIComponent("Por favor ingresa tu correo electrónico")}`);
    }

    // Si intenta poner una credencial o un correo @confir.local
    if (!email.includes("@") || email.endsWith("@confir.local")) {
        return redirect(`/forgot-password?error=${encodeURIComponent("Los alumnos (usuarios con credencial) no utilizan correo electrónico. Por favor, contacta a tu Catequista o Profesor para restablecer tu contraseña desde su panel.")}`);
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${url.origin}/reset-password`,
    });

    if (error) {
        return redirect(`/forgot-password?error=${encodeURIComponent("Error al enviar el correo: " + error.message)}`);
    }

    return redirect(`/forgot-password?sent=true`);
};
