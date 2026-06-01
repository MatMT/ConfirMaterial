import React, { useEffect, useRef, useState } from 'react';
import useProgressStore from '../../stores/progressStore';
import { Icon } from '@iconify/react';

interface LessonPathProps {
  lessons: any[];
}

function useInView(options = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsIntersecting(true);
        observer.unobserve(entry.target); // Solo anima la primera vez
      }
    }, { threshold: 0.2, ...options });

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, []);

  return [ref, isIntersecting] as const;
}

const religiousIcons = {
  completed: ['mdi:dove', 'mdi:heart', 'mdi:church'],
  current: ['mdi:cross', 'mdi:fire', 'mdi:star-four-points'],
  locked: ['mdi:candle', 'mdi:lock-outline']
};

const getIcon = (type: 'completed' | 'current' | 'locked', index: number) => {
  const icons = religiousIcons[type];
  return icons[index % icons.length];
};

function LessonNode({ lesson, index, isCompleted, isCurrent, isLocked }) {
  const [ref, inView] = useInView();
  
  // Pattern: Center(0), Left(1), Center(2), Right(3), Center(4)...
  const offsetCycle = index % 4;
  let translateX = "translate-x-0";
  if (offsetCycle === 1) translateX = "-translate-x-16 sm:-translate-x-28";
  if (offsetCycle === 3) translateX = "translate-x-16 sm:translate-x-28";

  const heroImage = lesson.data.heroImage;
  const currentIcon = getIcon(isCompleted ? 'completed' : isCurrent ? 'current' : 'locked', index);

  return (
    <div 
      ref={ref}
      id={isCurrent ? "current-lesson" : undefined}
      className={`relative z-10 flex flex-col items-center mb-16 transition-all duration-700 ease-out 
        ${translateX} 
        ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
    >
      {/* Tooltip / Título */}
      <div className={`mb-3 px-4 py-2 rounded-xl text-sm font-bold shadow-md whitespace-nowrap transition-transform duration-500 delay-200
        ${inView ? 'scale-100' : 'scale-0'}
        ${isCompleted ? 'bg-primary text-primary-content' : 
          isCurrent ? 'bg-accent text-accent-content' : 
          'bg-base-300 text-base-content/50'}
      `}>
        {lesson.data.title}
      </div>

      {/* Contenedor del Nodo Circular */}
      <div className="relative">
        <a 
          href={isLocked ? '#' : `/lessons/${lesson.id}/`}
          className={`relative flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-full shadow-2xl border-4 
            ${isCompleted ? 'border-primary cursor-pointer hover:scale-105' : 
              isCurrent ? 'border-accent cursor-pointer scale-110 shadow-accent/40 hover:scale-125 animate-bounce-subtle' : 
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
          <div className={`absolute inset-0 opacity-60 mix-blend-multiply transition-colors duration-300
            ${isCompleted ? 'bg-primary group-hover:bg-primary-focus' : isCurrent ? 'bg-accent group-hover:bg-accent-focus' : 'bg-base-300'}
          `}></div>

          {/* Icono central */}
          <div className="relative z-10 text-white drop-shadow-md">
            {isCompleted ? (
              <Icon icon={currentIcon} className="w-10 h-10 sm:w-12 sm:h-12 text-primary-content" />
            ) : isCurrent ? (
              <Icon icon={currentIcon} className="w-12 h-12 sm:w-14 sm:h-14 text-accent-content animate-pulse drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
            ) : (
              <Icon icon={currentIcon} className="w-8 h-8 sm:w-10 sm:h-10 text-base-content/40" />
            )}
          </div>
          
          {/* Borde brillante 3D */}
          <div className="absolute inset-0 rounded-full border-[6px] border-white/20 group-hover:border-white/40 transition-colors duration-300"></div>
        </a>

        {/* Botón flotante "Continuar" a la par */}
        {isCurrent && (
            <a href={`/lessons/${lesson.id}/`} 
               className={`absolute top-1/2 -translate-y-1/2 hidden md:flex btn btn-sm btn-accent rounded-full shadow-xl font-bold text-accent-content whitespace-nowrap hover:scale-110 transition-transform z-20 animate-pulse
                ${offsetCycle === 3 ? 'right-full mr-6' : 'left-full ml-6'}
               `}>
                Continuar ➜
            </a>
        )}
      </div>
    </div>
  );
}

export default function LessonPath({ lessons }: LessonPathProps) {
  const { progress, initializeStore } = useProgressStore();

  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  const bounceAnimation = `
    @keyframes bounce-subtle {
      0%, 100% { top: 0px; }
      50% { top: -12px; }
    }
    .animate-bounce-subtle {
      animation: bounce-subtle 2.5s infinite ease-in-out;
    }
  `;

  const isLessonCompleted = (lessonId: string) => {
    const lessonData = progress[lessonId];
    if (!lessonData) return false;
    if (lessonData.isCompleted) return true;
    return lessonData.lastCompletedQuestion >= 2;
  };

  return (
    <div className="relative py-12 flex flex-col items-center min-h-[60vh] overflow-hidden">
      <style>{bounceAnimation}</style>
      
      {/* Botón rápido para ir a la lección actual */}
      <div className="fixed bottom-6 right-6 z-50 transition-transform">
        <button 
          onClick={() => {
            const el = document.getElementById('current-lesson');
            if (el) {
              const y = el.getBoundingClientRect().top + window.scrollY - 150;
              window.scrollTo({ top: y, behavior: 'smooth' });
            }
          }}
          className="btn btn-primary shadow-lg shadow-primary/30 rounded-full h-14 animate-pulse flex items-center justify-center px-6"
        >
          <Icon icon="mdi:target" className="w-5 h-5 mr-2" />
          Mi Lección
        </button>
      </div>

      {/* Línea conectora de fondo */}
      <div className="absolute top-0 bottom-0 w-4 bg-base-300 rounded-full z-0 translate-x-[-50%] left-1/2 shadow-inner"></div>

      {lessons.map((lesson, index) => {
        const actualLessonId = lesson.data.lessonId || lesson.id;
        
        let isCompleted = isLessonCompleted(actualLessonId);
        let isLocked = false;
        let isCurrent = false;

        if (index === 0) {
          if (!isCompleted) isCurrent = true;
        } else {
          const prevLesson = lessons[index - 1];
          const prevLessonId = prevLesson.data.lessonId || prevLesson.id;
          const prevCompleted = isLessonCompleted(prevLessonId);

          if (isCompleted) {
            isLocked = false;
          } else if (prevCompleted) {
            isCurrent = true;
          } else {
            isLocked = true;
          }
        }

        return (
          <LessonNode 
            key={lesson.id}
            lesson={lesson}
            index={index}
            isCompleted={isCompleted}
            isCurrent={isCurrent}
            isLocked={isLocked}
          />
        );
      })}

      {/* Nodo Próximamente */}
      <div className="relative z-10 flex flex-col items-center mt-8 mb-16 opacity-50 blur-[1px]">
        <div className="mb-3 px-4 py-2 rounded-xl text-sm font-bold shadow-md whitespace-nowrap bg-base-300 text-base-content/50">
          Próximamente...
        </div>
        <div className="relative flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-full shadow-lg border-4 border-base-300 bg-base-200">
          <Icon icon="mdi:dots-horizontal" className="w-10 h-10 sm:w-12 sm:h-12 text-base-content/30" />
        </div>
      </div>
    </div>
  );
}
