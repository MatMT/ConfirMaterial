import { useState, useEffect } from 'react';
import useProgressStore from '../../stores/progressStore.js';

export default function LessonForm({ lessonId, nextLessonUrl, totalQuestions }) {
    const progress = useProgressStore((state) => state.progress);
    const [isClient, setIsClient] = useState(false);
    const [isExploreMode, setIsExploreMode] = useState(false);

    useEffect(() => {
        setIsClient(true);
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            if (params.get('mode') === 'explore') setIsExploreMode(true);
        }
    }, []);

    if (!isClient) {
        return null;
    }

    const lessonProgress = progress[lessonId];
    const isUnlocked = totalQuestions === 0 
        ? (lessonProgress?.isCompleted || false)
        : (lessonProgress?.lastCompletedQuestion === totalQuestions - 1);

    const handleManualComplete = () => {
        if (!isExploreMode) {
            useProgressStore.getState().completeQuestion(lessonId, 0, 1);
        }
        // Redirect to next lesson
        window.location.href = nextLessonUrl || "/lessons#current-lesson";
    };

    if (isExploreMode || isUnlocked) {
        return (
            <div className="my-8 p-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow-lg border border-green-200 flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4 animate-bounce">
                    <span className="text-3xl">🎉</span>
                </div>
                <h3 className="text-2xl font-bold text-center text-green-800 mb-3">¡Felicitaciones!</h3>
                <p className="text-center text-lg text-gray-700 mb-6 max-w-md">
                    Has completado esta lección. Ya puedes continuar con la siguiente.
                </p>
                <a
                    href={nextLessonUrl || "/lessons#current-lesson"}
                    className="btn text-teal-700 bg-white btn-lg gap-2 shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105"
                >
                    <span>Siguiente Lección ➜</span>
                </a>
                <p className="mt-4 text-sm text-center text-gray-500">Haz clic para avanzar en tu preparación</p>
            </div>
        );
    }

    if (totalQuestions === 0 && !isUnlocked) {
        return (
            <div className="my-8 p-8 bg-base-200 rounded-lg shadow-md border border-base-300 flex flex-col items-center justify-center">
                <h3 className="text-xl font-bold text-center text-base-content mb-2">¡Has llegado al final!</h3>
                <p className="text-center font-medium text-base-content/80 mb-6">
                    Marca esta lección como completada para continuar con la siguiente.
                </p>
                <button
                    onClick={handleManualComplete}
                    className="btn btn-primary btn-lg shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105"
                >
                    Completar Lección ✓
                </button>
            </div>
        );
    }

    return (
        <div className="my-8 p-8 bg-base-200 rounded-lg shadow-md border border-base-300 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                <span className="text-2xl">🧐</span>
            </div>
            <h3 className="text-xl font-bold text-center text-base-content mb-2">Continúa tu aprendizaje</h3>
            <p className="text-center font-medium text-base-content/80">
                Completa todas las preguntas de la lección para desbloquear el siguiente paso.
            </p>
        </div>
    );
}