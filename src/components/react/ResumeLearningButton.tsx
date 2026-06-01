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

        // Encontrar la primera lección no completada, o la última completada si todas están completadas
        let foundLesson = lessons[0];
        
        for (let i = 0; i < lessons.length; i++) {
            const lesson = lessons[i];
            const lessonId = lesson.data?.lessonId || lesson.id;
            
            // Comprobar si está completada (asumimos totalQuestions = 3 si no se especifica)
            // Ya que `progressStore` tiene `isCompleted`, podemos usarlo directamente.
            const isCompleted = progress[lessonId]?.isCompleted;
            
            if (!isCompleted) {
                foundLesson = lesson;
                break; // Encontramos la primera no completada
            }
        }

        setTargetLesson(foundLesson);
    }, [isInitialized, progress, lessons]);

    if (!targetLesson) {
        return (
            <a href="/lessons" className="btn btn-primary text-white border-none bg-blue-500 hover:bg-blue-600 rounded-full px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300 w-full md:w-auto">
                Cargando...
            </a>
        );
    }

    return (
        <a href={`/lessons/${targetLesson.id}`} className="btn btn-primary text-white border-none bg-blue-500 hover:bg-blue-600 rounded-full px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300 w-full md:w-auto animate-fade-up">
            Continuar: {targetLesson.data?.title || 'Siguiente Lección'}
        </a>
    );
}
