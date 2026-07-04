import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "../../../utils/supabase";

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const serviceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
    const accessToken = cookies.get("sb-access-token");
    const refreshToken = cookies.get("sb-refresh-token");

    if (!accessToken || !refreshToken) {
        return redirect("/login");
    }

    await supabase.auth.setSession({
        access_token: accessToken.value,
        refresh_token: refreshToken.value,
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return redirect("/login");
    }

    // Verificar rol de profesor/admin
    const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (!profile || (profile.role !== "teacher" && profile.role !== "admin")) {
        return redirect("/dashboard?error=Acceso+Denegado");
    }

    const formData = await request.formData();
    const studentId = formData.get("studentId")?.toString().trim();
    const newPassword = formData.get("newPassword")?.toString().trim();

    if (!studentId || !newPassword) {
        return redirect(`/admin/students/${studentId || ""}?error=${encodeURIComponent("Debe indicar una nueva contraseña")}`);
    }

    if (newPassword.length < 6) {
        return redirect(`/admin/students/${studentId}?error=${encodeURIComponent("La contraseña debe tener al menos 6 caracteres")}`);
    }

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(studentId, {
        password: newPassword
    });

    if (updateError) {
        console.error("Error al restablecer contraseña de alumno:", updateError);
        return redirect(`/admin/students/${studentId}?error=${encodeURIComponent("Error al restablecer: " + updateError.message)}`);
    }

    return redirect(`/admin/students/${studentId}?success=${encodeURIComponent("Contraseña restablecida exitosamente a: " + newPassword)}`);
};
