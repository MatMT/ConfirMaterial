import React, { useEffect, useState } from 'react';
import useProgressStore from '../../stores/progressStore';
import { Icon } from '@iconify/react';

interface LessonSidebarProps {
  lessonId: string;
  lessonData: any;
  title: string;
}

export default function LessonSidebar({ lessonId, lessonData, title }: LessonSidebarProps) {
  const { isQuestionCompleted, isQuestionUnlocked, progress } = useProgressStore();
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null);

  // Scrollspy logic
  useEffect(() => {
    if (!lessonData || !lessonData.questions) return;

    const handleScroll = () => {
      let current = null;
      for (const question of lessonData.questions) {
        const element = document.getElementById(`question-${question.id}`);
        if (element) {
          const rect = element.getBoundingClientRect();
          // Offset of 150px to trigger active state before it hits the very top
          if (rect.top <= 150) {
            current = question.id;
          }
        }
      }
      
      if (current !== null) {
        setActiveQuestion(current);
      } else {
        // If scrolled above all questions, set active to 0 (or null)
        setActiveQuestion(0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, [lessonData]);

  if (!lessonData || !lessonData.questions) return null;

  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-bold text-lg mb-2 text-base-content">{title}</h3>
      
      <ul className="menu bg-base-200 rounded-box w-full p-2 space-y-1">
        {lessonData.questions.map((question: any, index: number) => {
          const isCompleted = isQuestionCompleted(lessonId, question.id);
          const isUnlocked = isQuestionUnlocked(lessonId, question.id);
          const isActive = activeQuestion === question.id;
          
          return (
            <li key={question.id}>
              <a 
                href={isUnlocked ? `#question-${question.id}` : '#'}
                className={`flex gap-3 items-start py-3 ${isActive ? 'active bg-primary text-primary-content font-bold' : ''} ${!isUnlocked ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                onClick={(e) => {
                  if (!isUnlocked) e.preventDefault();
                }}
              >
                <div className="mt-0.5">
                  {isCompleted ? (
                    <Icon icon="mdi:check-circle" className="w-5 h-5 text-success" />
                  ) : isUnlocked ? (
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] ${isActive ? 'border-primary-content' : 'border-primary text-primary'}`}>
                      {index + 1}
                    </div>
                  ) : (
                    <Icon icon="mdi:lock" className="w-5 h-5 text-base-content/40" />
                  )}
                </div>
                <span className="flex-1 text-sm line-clamp-2 leading-tight">
                  {question.text}
                </span>
              </a>
            </li>
          );
        })}
        
        {/* Enlace final a forms (si existe) */}
        {lessonData.formsUrl && (
          <li>
            <a 
              href="#forms"
              className="flex gap-3 items-start py-3 border-t border-base-300 mt-2 rounded-none hover:bg-base-300"
            >
              <div className="mt-0.5">
                <Icon icon="mdi:form-select" className="w-5 h-5 text-accent" />
              </div>
              <span className="flex-1 text-sm font-semibold text-accent">
                Evaluación Final
              </span>
            </a>
          </li>
        )}
      </ul>
    </div>
  );
}
