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
        let msg = error.message;
        if (msg.toLowerCase().includes("rate limit") || msg.toLowerCase().includes("limit exceeded")) {
            msg = "Has superado el límite de intentos de seguridad por hora. Por favor, espera entre 15 a 60 minutos antes de solicitar otro correo de recuperación.";
        } else {
            msg = "Error al enviar el correo: " + msg;
        }
        return redirect(`/forgot-password?error=${encodeURIComponent(msg)}`);
    }

    return redirect(`/forgot-password?sent=true`);
};
