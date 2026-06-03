import { create } from 'zustand';
import { supabase } from '../utils/supabase';

const useProgressStore = create((set, get) => ({
    progress: typeof localStorage !== 'undefined'
        ? JSON.parse(localStorage.getItem('lessonProgress') || '{}')
        : {},
    streak: 0,
    lastLessonDate: null,
    userId: null,
    isInitialized: false,
    testDangerMode: false,

    toggleTestDangerMode: () => set((state) => ({ testDangerMode: !state.testDangerMode })),

    initializeStore: async (explicitUserId) => {
        // Ignorar llamadas automáticas sin argumentos. 
        // Solo StoreInitializer enviará explícitamente null o el userId.
        if (explicitUserId === undefined) return;
        
        if (get().isInitialized) return;
        
        let localUserId = null;
        if (typeof window !== 'undefined') {
            localUserId = localStorage.getItem('lessonUserId');
        }
        
        try {
            const userId = explicitUserId; // Recibido desde Astro/SSR
            
            if (!userId) {
                console.log('No user session. Using local storage only.');
                if (typeof window !== 'undefined') {
                    if (localUserId) {
                        // User logged out. Clear their progress.
                        console.log('User logged out. Clearing local progress.');
                        localStorage.removeItem('lessonProgress');
                        localStorage.removeItem('lessonUserId');
                        set({ progress: {}, streak: 0, lastLessonDate: null });
                    } else {
                        const stored = localStorage.getItem('lessonProgress');
                        if (stored) set({ progress: JSON.parse(stored) });
                    }
                }
                set({ isInitialized: true, userId: null });
                return;
            }
            
            if (typeof window !== 'undefined') {
                // Si había un usuario registrado distinto al actual, borramos.
                // Si localUserId es null, era un invitado y hereda el progreso.
                if (localUserId && localUserId !== userId) {
                    console.log('User changed. Clearing old local progress.');
                    localStorage.removeItem('lessonProgress');
                    set({ progress: {}, streak: 0, lastLessonDate: null });
                } else {
                    const stored = localStorage.getItem('lessonProgress');
                    if (stored) set({ progress: JSON.parse(stored) });
                }
                localStorage.setItem('lessonUserId', userId);
            }

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
                        isCompleted: row.is_completed,
                        completedAt: row.completed_at
                    };
                });

                // Cargar rachas
                const { data: streakData } = await supabase
                    .from('user_streaks')
                    .select('*')
                    .eq('user_id', userId)
                    .maybeSingle();

                let currentStreak = streakData ? streakData.current_streak : 0;
                let lastLessonDate = streakData ? streakData.last_lesson_date : null;

                // Verificar si la racha ha expirado
                if (currentStreak > 0 && lastLessonDate) {
                    const lDate = new Date(lastLessonDate);
                    const daysToSaturday = 6 - lDate.getDay();
                    
                    const firstDeadline = new Date(lDate);
                    firstDeadline.setDate(firstDeadline.getDate() + daysToSaturday);
                    firstDeadline.setHours(11, 0, 0, 0);

                    // La expiración es el sábado de la SIGUIENTE semana a las 11:00 AM
                    const expirationDate = new Date(firstDeadline);
                    expirationDate.setDate(expirationDate.getDate() + 7);

                    const now = new Date();
                    if (now.getTime() > expirationDate.getTime()) {
                        console.log('La racha ha expirado. Reseteando a 0.');
                        currentStreak = 0;
                        // Actualizar en BD silenciosamente
                        supabase.from('user_streaks').update({ current_streak: 0 }).eq('user_id', userId).then();
                    }
                }

                set({ 
                    progress: newProgress,
                    streak: currentStreak,
                    lastLessonDate: lastLessonDate,
                    isInitialized: true
                });

                // Sincronizar localStorage
                if (typeof window !== 'undefined') {
                    localStorage.setItem('lessonProgress', JSON.stringify(newProgress));
                }
            } else {
                set({ isInitialized: true, userId });
            }
        } catch (error) {
            console.error('Error initializing store:', error);
            // Ensure we don't keep old progress on error if user changed
            set({ progress: {}, isInitialized: true });
        }
    },

    completeQuestion: async (lessonId, questionId, totalQuestions) => {
        set((state) => {
            const currentLessonProgress = state.progress[lessonId] || {};
            const currentMaxQuestion = currentLessonProgress.lastCompletedQuestion !== undefined 
                ? currentLessonProgress.lastCompletedQuestion 
                : -1;
            
            // Solo actualizamos si estamos avanzando o si es la primera vez
            const newMaxQuestion = Math.max(currentMaxQuestion, questionId);
            const isCompleted = newMaxQuestion >= totalQuestions - 1;
            
            // Si ya estaba completado, mantenemos la fecha de completado
            const completedAt = currentLessonProgress.isCompleted 
                ? currentLessonProgress.completedAt 
                : (isCompleted ? new Date().toISOString() : null);

            const newProgress = {
                ...state.progress,
                [lessonId]: {
                    ...currentLessonProgress,
                    lastCompletedQuestion: newMaxQuestion,
                    isCompleted: isCompleted,
                    completedAt: completedAt
                }
            };

            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('lessonProgress', JSON.stringify(newProgress));
            }

            // Sync en background con Supabase si hay usuario
            if (state.userId) {
                const payload = {
                    last_completed_question: questionId,
                    is_completed: isCompleted,
                    completed_at: isCompleted ? new Date().toISOString() : null,
                    updated_at: new Date().toISOString()
                };

                supabase.from('user_progress').select('id').eq('user_id', state.userId).eq('lesson_id', lessonId).maybeSingle()
                .then(({ data }) => {
                    if (data) {
                        supabase.from('user_progress').update(payload).eq('id', data.id).then();
                    } else {
                        supabase.from('user_progress').insert({
                            user_id: state.userId,
                            lesson_id: lessonId,
                            ...payload
                        }).then();
                    }
                });

                // Lógica de racha si se completó la lección
                if (isCompleted && (!state.progress[lessonId] || !state.progress[lessonId].isCompleted)) {
                    const now = new Date();
                    const day = now.getDay();
                    const hours = now.getHours();

                    // Bloqueo: Sábado (6) desde las 11:00 AM hasta que termina el día.
                    const isStreakBlocked = day === 6 && hours >= 11;

                    if (isStreakBlocked) {
                        // Disparar evento para que la UI muestre la "excusa creativa"
                        if (typeof window !== 'undefined') {
                            window.dispatchEvent(new CustomEvent('streak-blocked', { 
                                detail: "Lección completada, pero el Maestro del Tiempo ha cerrado el registro de rachas para esta semana. ¡Asegúrate de hacerlo antes del sábado a las 11:00 AM la próxima vez para mantener tu racha ardiendo!" 
                            }));
                        }
                    } else {
                        const newStreak = state.streak + 1;
                        const newDate = now.toISOString();
                        
                        supabase.from('user_streaks').select('user_id').eq('user_id', state.userId).maybeSingle()
                        .then(({ data, error }) => {
                            if (error) console.error("Error fetching streak:", error);
                            
                            if (data) {
                                supabase.from('user_streaks').update({
                                    current_streak: newStreak,
                                    last_lesson_date: newDate
                                }).eq('user_id', state.userId).then(({error}) => {
                                    if(error) console.error("Error updating streak", error);
                                });
                            } else {
                                supabase.from('user_streaks').insert({
                                    user_id: state.userId,
                                    current_streak: newStreak,
                                    last_lesson_date: newDate
                                }).then(({error}) => {
                                    if(error) console.error("Error inserting streak", error);
                                });
                            }
                        });
                        
                        // Actualizar el estado local de la racha inmediatamente
                        setTimeout(() => set({ streak: newStreak, lastLessonDate: newDate }), 0);
                    }
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