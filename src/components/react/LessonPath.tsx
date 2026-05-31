import React, { useEffect } from 'react';
import useProgressStore from '../../stores/progressStore';
import { Icon } from '@iconify/react';

// Las lecciones vienen desde Astro como props
interface LessonPathProps {
  lessons: any[];
}

export default function LessonPath({ lessons }: LessonPathProps) {
  const { progress } = useProgressStore();

  // Animación para el nodo actual
  const bounceAnimation = `
    @keyframes bounce-subtle {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    .animate-bounce-subtle {
      animation: bounce-subtle 2s infinite ease-in-out;
    }
  `;

  // Helper para verificar si una lección está completada (todas las 3 preguntas contestadas)
  const isLessonCompleted = (lessonId: string) => {
    // Aquí podrías leer "totalQuestions" de la lección, pero por ahora asumimos 3.
    const totalQuestions = 3; 
    return progress[lessonId] && progress[lessonId].completedQuestions.length >= totalQuestions;
  };

  return (
    <div className="relative py-12 flex flex-col items-center min-h-[60vh] overflow-hidden">
      <style>{bounceAnimation}</style>
      
      {/* Línea conectora de fondo */}
      <div className="absolute top-0 bottom-0 w-4 bg-base-300 rounded-full z-0 translate-x-[-50%] left-1/2"></div>

      {lessons.map((lesson, index) => {
        const actualLessonId = lesson.data.lessonId || lesson.id;
        
        let isCompleted = isLessonCompleted(actualLessonId);
        let isLocked = false;
        let isCurrent = false;

        // La primera siempre está desbloqueada
        if (index === 0) {
          if (!isCompleted) {
            isCurrent = true;
          }
        } else {
          // Si no es la primera, depende de la anterior
          const prevLesson = lessons[index - 1];
          const prevLessonId = prevLesson.data.lessonId || prevLesson.id;
          const prevCompleted = isLessonCompleted(prevLessonId);

          if (isCompleted) {
            // Ya está hecha
            isLocked = false;
          } else if (prevCompleted) {
            // La anterior está hecha, pero esta no, entonces es la actual
            isCurrent = true;
          } else {
            // La anterior no está hecha
            isLocked = true;
          }
        }

        // Alternar izquierda y derecha para el diseño en forma de S
        // Pattern: Center, Right, Center, Left, Center...
        const offsetCycle = index % 4;
        let translateX = "translate-x-0";
        if (offsetCycle === 1) translateX = "translate-x-16 sm:translate-x-24";
        if (offsetCycle === 3) translateX = "-translate-x-16 sm:-translate-x-24";

        const heroImage = lesson.data.heroImage;

        return (
          <div 
            key={lesson.id} 
            className={`relative z-10 flex flex-col items-center mb-16 transition-transform duration-300 ${translateX} ${isCurrent ? 'animate-bounce-subtle' : ''}`}
          >
            {/* Tooltip / Título */}
            <div className={`mb-3 px-4 py-2 rounded-xl text-sm font-bold shadow-md whitespace-nowrap 
              ${isCompleted ? 'bg-primary text-primary-content' : 
                isCurrent ? 'bg-accent text-accent-content' : 
                'bg-base-300 text-base-content/50'}
            `}>
              {lesson.data.title}
            </div>

            {/* Nodo Circular */}
            <a 
              href={isLocked ? '#' : `/lessons/${lesson.id}/`}
              className={`relative flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-full shadow-2xl border-4 
                ${isCompleted ? 'border-primary cursor-pointer' : 
                  isCurrent ? 'border-accent cursor-pointer scale-110 shadow-accent/40' : 
                  'border-base-300 opacity-80 cursor-not-allowed grayscale'}
                transition-all duration-300 overflow-hidden group
              `}
              onClick={(e) => {
                if (isLocked) e.preventDefault();
              }}
            >
              {/* Imagen de fondo difuminada */}
              {heroImage ? (
                <img 
                  src={heroImage} 
                  alt="" 
                  className="absolute inset-0 w-full h-full object-cover blur-[2px] group-hover:blur-0 transition-all opacity-40 group-hover:opacity-60"
                />
              ) : (
                <div className="absolute inset-0 w-full h-full bg-base-200"></div>
              )}
              
              {/* Capa de color overlay */}
              <div className={`absolute inset-0 opacity-60 mix-blend-multiply
                ${isCompleted ? 'bg-primary' : isCurrent ? 'bg-accent' : 'bg-base-300'}
              `}></div>

              {/* Icono central */}
              <div className="relative z-10 text-white drop-shadow-md">
                {isCompleted ? (
                  <Icon icon="mdi:check" className="w-10 h-10 sm:w-12 sm:h-12 text-primary-content" />
                ) : isCurrent ? (
                  <Icon icon="mdi:star" className="w-12 h-12 sm:w-14 sm:h-14 text-accent-content animate-pulse" />
                ) : (
                  <Icon icon="mdi:lock" className="w-8 h-8 sm:w-10 sm:h-10 text-base-content/40" />
                )}
              </div>
              
              {/* Borde brillante 3D */}
              <div className="absolute inset-0 rounded-full border-[6px] border-white/20"></div>
            </a>
          </div>
        );
      })}
    </div>
  );
}
