import { create } from 'zustand';
import { supabase } from '../utils/supabase';

const useProgressStore = create((set, get) => ({
    progress: typeof localStorage !== 'undefined'
        ? JSON.parse(localStorage.getItem('lessonProgress') || '{}')
        : {},
    streak: 0,
    userId: null,
    isInitialized: false,

    initializeStore: async () => {
        if (get().isInitialized) return;

        // Cargar primero de localStorage para UI rápida
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('lessonProgress');
            if (stored) {
                set({ progress: JSON.parse(stored) });
            }
        }

        // Obtener usuario actual
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            const userId = session.user.id;
            set({ userId });

            // Cargar progreso desde Supabase
            const { data: progressData, error: progressError } = await supabase
                .from('user_progress')
                .select('*')
                .eq('user_id', userId);

            if (!progressError && progressData) {
                const newProgress = {};
                progressData.forEach(row => {
                    newProgress[row.lesson_id] = {
                        lastCompletedQuestion: row.last_completed_question,
                        isCompleted: row.is_completed
                    };
                });

                // Cargar rachas
                const { data: streakData } = await supabase
                    .from('user_streaks')
                    .select('*')
                    .eq('user_id', userId)
                    .single();

                set({ 
                    progress: newProgress,
                    streak: streakData ? streakData.current_streak : 0,
                    isInitialized: true
                });

                // Sincronizar localStorage
                if (typeof window !== 'undefined') {
                    localStorage.setItem('lessonProgress', JSON.stringify(newProgress));
                }
            }
        }
    },

    completeQuestion: async (lessonId, questionId, totalQuestions) => {
        set((state) => {
            const isCompleted = questionId >= totalQuestions - 1;
            const newProgress = {
                ...state.progress,
                [lessonId]: {
                    lastCompletedQuestion: questionId,
                    isCompleted: isCompleted
                }
            };

            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('lessonProgress', JSON.stringify(newProgress));
            }

            // Sync en background con Supabase si hay usuario
            if (state.userId) {
                supabase.from('user_progress').upsert({
                    user_id: state.userId,
                    lesson_id: lessonId,
                    last_completed_question: questionId,
                    is_completed: isCompleted,
                    completed_at: isCompleted ? new Date().toISOString() : null,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id,lesson_id' }).then();

                // Lógica de racha si se completó la lección
                if (isCompleted && (!state.progress[lessonId] || !state.progress[lessonId].isCompleted)) {
                    supabase.rpc('increment_streak', { p_user_id: state.userId }).then(({ data }) => {
                        if (data !== null) set({ streak: data });
                    });
                }
            }

            return { progress: newProgress };
        });
    },

    isQuestionUnlocked: (lessonId, questionId) => {
        const state = get();
        const lessonProgress = state.progress[lessonId];

        if (questionId === 0) return true;
        if (!lessonProgress) return false;
        return lessonProgress.lastCompletedQuestion >= questionId - 1;
    },

    areAllQuestionsCompleted: (lessonId, totalQuestions) => {
        const state = get();
        const lessonProgress = state.progress[lessonId];
        if (!lessonProgress) return false;
        return lessonProgress.lastCompletedQuestion === totalQuestions - 1;
    },

    isQuestionCompleted: (lessonId, questionId) => {
        const state = get();
        const lessonProgress = state.progress[lessonId];
        if (!lessonProgress) return false;
        return questionId <= lessonProgress.lastCompletedQuestion;
    }
}));

export default useProgressStore;