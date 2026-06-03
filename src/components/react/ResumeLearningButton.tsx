import React, { useEffect, useState } from 'react';
import useProgressStore from '../../stores/progressStore';

export default function ResumeLearningButton({ lessons }) {
    const { progress, initializeStore, isInitialized } = useProgressStore();
    const [targetLesson, setTargetLesson] = useState(null);

    useEffect(() => {
        initializeStore();
    }, []);

    useEffect(() => {
        if (!isInitialized) return;

        // Encontrar la primera lección no completada
        let foundLesson = null;
        let allCompleted = true;
        
        for (let i = 0; i < lessons.length; i++) {
            const lesson = lessons[i];
            const lessonId = lesson.data?.lessonId || lesson.id;
            
            // Comprobar si está completada (asumimos totalQuestions = 3 si no se especifica)
            // Retrocompatibilidad: lastCompletedQuestion >= 2
            const lessonData = progress[lessonId];
            const isCompleted = lessonData && (lessonData.isCompleted || lessonData.lastCompletedQuestion >= 2);
            
            if (!isCompleted) {
                foundLesson = lesson;
                allCompleted = false;
                break; // Encontramos la primera no completada
            }
        }

        if (allCompleted) {
            setTargetLesson({ isMore: true });
        } else {
            setTargetLesson(foundLesson || lessons[0]);
        }
    }, [isInitialized, progress, lessons]);

    if (!targetLesson) {
        return (
            <a href="/lessons" className="btn btn-primary h-auto min-h-[3rem] text-white border-none bg-blue-500 hover:bg-blue-600 rounded-2xl px-6 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300 w-full md:w-auto leading-tight">
                Cargando...
            </a>
        );
    }

    if (targetLesson.isMore) {
        return (
            <a href="/more" className="btn btn-primary h-auto min-h-[3rem] text-white border-none bg-blue-500 hover:bg-blue-600 rounded-2xl px-6 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300 w-full md:w-auto animate-fade-up leading-tight">
                ¡Has completado todo! Explorar Más ✨
            </a>
        );
    }

    return (
        <a href={`/lessons/${targetLesson.id}`} className="btn btn-primary h-auto min-h-[3rem] text-white border-none bg-blue-500 hover:bg-blue-600 rounded-2xl px-6 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300 w-full md:w-auto animate-fade-up leading-tight">
            Continuar: {targetLesson.data?.title || 'Siguiente Lección'}
        </a>
    );
}
