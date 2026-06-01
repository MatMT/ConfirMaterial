import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface LessonProgress {
  lessonId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  lastScrollPosition: number;
}

interface ProgressState {
  progress: Record<string, LessonProgress>;
  updateProgress: (lessonId: string, data: Partial<LessonProgress>) => void;
  markCompleted: (lessonId: string) => void;
  clearProgress: () => void;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      progress: {},
      
      updateProgress: (lessonId, data) => set((state) => ({
        progress: {
          ...state.progress,
          [lessonId]: {
            lessonId,
            status: state.progress[lessonId]?.status || 'in_progress',
            lastScrollPosition: state.progress[lessonId]?.lastScrollPosition || 0,
            ...data
          }
        }
      })),
      
      markCompleted: (lessonId) => set((state) => ({
        progress: {
          ...state.progress,
          [lessonId]: {
            ...state.progress[lessonId],
            lessonId,
            status: 'completed',
            lastScrollPosition: state.progress[lessonId]?.lastScrollPosition || 0,
          }
        }
      })),

      clearProgress: () => set({ progress: {} }),
    }),
    {
      name: 'confir-progress-storage', // nombre clave en localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
);
