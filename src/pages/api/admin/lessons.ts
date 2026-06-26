import type { APIRoute } from 'astro';
import { saveToGitHub, deleteFromGitHub } from '../../../utils/github';
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

export const POST: APIRoute = async ({ request, cookies }) => {
    try {
        const isAuth = await checkAuth(cookies);
        if (!isAuth) {
            return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
        }

        const body = await request.json();
        const { id, title, description, author, draft, date, blocks, formsUrl } = body;
        
        // 1. Generate JSON Content
        const questionsJson = {
            lessonId: id,
            title,
            questions: blocks.paragraphs.map((p: any, i: number) => ({
                id: i,
                text: p.question.text,
                options: [
                    { text: p.question.correctOption, correct: true },
                    ...p.question.incorrectOptions.map((opt: string) => ({ text: opt, correct: false }))
                ].sort(() => Math.random() - 0.5) // basic shuffle
            })),
            formsUrl: formsUrl || ""
        };

        const jsonContent = JSON.stringify(questionsJson, null, 2);

        // 2. Generate MDX Content
        let mdxContent = `---
title: '${title.replace(/'/g, "''")}'
description: '${description.replace(/'/g, "''")}'
pubDate: '${date}'
heroImage: '../../images/lessons/blog-placeholder-1.webp'
lessonId: '${id}'
author: '${author.replace(/'/g, "''")}'
totalQuestions: ${blocks.paragraphs.length}
draft: ${draft ? 'true' : 'false'}
---

import lessonData from '../data/questions/${id}.json';
import Question from "../../components/react/Question";
import LessonForms from '../../components/react/LessonForm';

## 🌟 Introducción

${blocks.intro}

---

`;

        blocks.paragraphs.forEach((p: any, i: number) => {
            mdxContent += `### Párrafo ${i + 1}\n\n${p.text}\n\n<Question\n    client:only="react"\n    lessonId={lessonData.lessonId}\n    questionData={lessonData.questions[${i}]}\n    totalQuestions={lessonData.questions.length}\n/>\n\n---\n\n`;
        });

        mdxContent += `## 🛐 Conclusión\n\n${blocks.conclusion}\n\n---\n\n<LessonForms\n    client:only="react"\n    lessonId={lessonData.lessonId}\n    formsUrl={lessonData.formsUrl}\n    totalQuestions={lessonData.questions.length}\n    nextLessonUrl="/lessons"\n/>\n`;

        // 3. Save both files
        // We need to figure out a filename for the MDX. Since we use `[...slug].astro`, the filename determines the URL.
        // It could be `id.mdx` or we can let the UI specify a filename/slug. Let's use `slug` from body, or default to `id`.
        const slug = body.slug || id;
        
        await saveToGitHub(`src/content/data/questions/${id}.json`, jsonContent, `Update questions for lesson ${id}`);
        await saveToGitHub(`src/content/lessons/${slug}.mdx`, mdxContent, `Update content for lesson ${id}`);

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
};

export const DELETE: APIRoute = async ({ request, cookies }) => {
    try {
        const isAuth = await checkAuth(cookies);
        if (!isAuth) {
            return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const slug = searchParams.get('slug');

        if (!id || !slug) return new Response(JSON.stringify({ error: 'Missing id or slug' }), { status: 400 });

        await deleteFromGitHub(`src/content/data/questions/${id}.json`, `Delete questions for lesson ${id}`);
        await deleteFromGitHub(`src/content/lessons/${slug}.mdx`, `Delete content for lesson ${id}`);

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
