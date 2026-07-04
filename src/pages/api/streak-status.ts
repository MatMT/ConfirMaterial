import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { createClient } from "@supabase/supabase-js";
import { getStreakStatus } from '../../utils/streakHelper';
import { fetchFromGitHub } from '../../utils/github';

const supabaseAdmin = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

export const GET: APIRoute = async ({ request }) => {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Falta userId' }), { status: 400 });
    }

    // 1. Obtener datos de racha del usuario
    const { data: streakData } = await supabaseAdmin
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (!streakData) {
      return new Response(JSON.stringify({
        streak: 0,
        longestStreak: 0,
        lastLessonDate: null,
        isFrozen: false,
        reason: null
      }), { status: 200 });
    }

    const rawStreak = streakData.current_streak || 0;
    const lastDate = streakData.last_lesson_date || null;

    // 2. Obtener configuración de Modo Vacaciones
    let isHolidayMode = false;
    try {
      const fileData = await fetchFromGitHub('src/content/data/settings.json');
      if (fileData && fileData.content) {
        const jsonStr = Buffer.from(fileData.content, 'base64').toString('utf-8');
        const settings = JSON.parse(jsonStr);
        isHolidayMode = !!settings.holidayMode;
      }
    } catch (e) {}

    // 3. Obtener lecciones publicadas para ver la fecha más reciente
    const allLessons = await getCollection('lessons', ({ data }) => !data.draft);
    let latestLessonDate: string | null = null;
    if (allLessons && allLessons.length > 0) {
      const maxTime = Math.max(...allLessons.map(l => new Date(l.data.pubDate).getTime()));
      latestLessonDate = new Date(maxTime).toISOString();
    }

    // 4. Evaluar estado de la racha
    const status = getStreakStatus(rawStreak, lastDate, latestLessonDate, isHolidayMode);

    // 5. Si realmente expiró (y no está congelada), reseteamos en BD
    if (rawStreak > 0 && status.streak === 0 && !status.isFrozen) {
      await supabaseAdmin
        .from('user_streaks')
        .update({ current_streak: 0 })
        .eq('user_id', userId);
    }

    return new Response(JSON.stringify({
      streak: status.streak,
      longestStreak: streakData.longest_streak || 0,
      lastLessonDate: lastDate,
      isFrozen: status.isFrozen,
      reason: status.reason
    }), { status: 200 });

  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
