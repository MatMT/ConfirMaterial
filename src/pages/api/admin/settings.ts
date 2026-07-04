import type { APIRoute } from 'astro';
import { fetchFromGitHub, saveToGitHub } from '../../../utils/github';
import { supabase } from '../../../utils/supabase';

const checkAuth = async (cookies: any) => {
    const accessToken = cookies.get("sb-access-token");
    const refreshToken = cookies.get("sb-refresh-token");
    if (!accessToken || !refreshToken) return false;

    await supabase.auth.setSession({
        access_token: accessToken.value,
        refresh_token: refreshToken.value,
    });
    
    const { data: { user } } = await supabase.auth.getUser();
    return !!user;
};

export const GET: APIRoute = async () => {
    try {
        const fileData = await fetchFromGitHub('src/content/data/settings.json');
        if (!fileData || !fileData.content) {
            return new Response(JSON.stringify({ holidayMode: false }), { status: 200 });
        }
        const jsonStr = Buffer.from(fileData.content, 'base64').toString('utf-8');
        const data = JSON.parse(jsonStr);
        return new Response(JSON.stringify(data), { status: 200 });
    } catch (e: any) {
        return new Response(JSON.stringify({ holidayMode: false, error: e.message }), { status: 200 });
    }
};

export const POST: APIRoute = async ({ request, cookies }) => {
    try {
        const isAuth = await checkAuth(cookies);
        if (!isAuth) {
            return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
        }

        const body = await request.json();
        const { holidayMode } = body;

        const newSettings = {
            holidayMode: !!holidayMode,
            updatedAt: new Date().toISOString()
        };

        const jsonContent = JSON.stringify(newSettings, null, 2);
        await saveToGitHub('src/content/data/settings.json', jsonContent, `Update holiday mode to ${holidayMode}`);

        return new Response(JSON.stringify({ success: true, ...newSettings }), { status: 200 });
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
};
