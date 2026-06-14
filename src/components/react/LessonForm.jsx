import { useState, useEffect } from 'react';
import useProgressStore from '../../stores/progressStore.js';
import { Icon } from '@iconify/react';

export default function LessonForm({ lessonId, nextLessonUrl, totalQuestions }) {
    const { progress, streak, lastLessonDate, initializeStore } = useProgressStore();
    const [isClient, setIsClient] = useState(false);
    const [isExploreMode, setIsExploreMode] = useState(false);
    const [showCelebration, setShowCelebration] = useState(false);

    useEffect(() => {
        setIsClient(true);
        initializeStore();
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            if (params.get('mode') === 'explore') setIsExploreMode(true);
        }
    }, [initializeStore]);

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
        setShowCelebration(true);
    };

    const handleNextLesson = (e) => {
        e.preventDefault();
        setShowCelebration(true);
    };

    if (showCelebration) {
        return (
            <div className="fixed inset-0 z-[1000] bg-base-300 flex flex-col items-center justify-center p-4 animate-fade-in">
                <div className="flex flex-col items-center max-w-sm w-full gap-8">
                    <div className="text-center mb-2 mt-4">
                        <h2 className="text-7xl md:text-8xl font-black text-orange-500 drop-shadow-lg mb-1 tracking-tighter">
                            {streak || 0}
                        </h2>
                        <p className="text-lg md:text-xl font-bold text-base-content uppercase tracking-widest">
                            {streak === 1 ? 'semana de racha' : 'semanas de racha'}
                        </p>
                    </div>

                    {/* Mascot with Animated Flame Aura */}
                    <div className="relative flex items-center justify-center w-40 h-40">
                        {/* Capas del Aura de Fuego */}
                        <div className="absolute inset-0 bg-gradient-to-t from-red-500 via-orange-500 to-yellow-400 blur-2xl opacity-60 rounded-full mix-blend-screen animate-pulse scale-125"></div>
                        <div className="absolute inset-0 bg-orange-400 blur-3xl opacity-40 rounded-full animate-ping" style={{ animationDuration: '2s' }}></div>
                        <div className="absolute inset-4 bg-yellow-300 blur-xl opacity-50 rounded-full animate-pulse" style={{ animationDuration: '1.5s' }}></div>
                        
                        {/* Imagen de Confi */}
                        <img 
                            src="/images/confi/Confi.png" 
                            alt="Confi Mascot" 
                            className="w-36 h-36 drop-shadow-[0_0_25px_rgba(255,140,0,0.8)] hover:scale-110 transition-transform duration-500 relative z-10 object-contain animate-bounce" 
                            style={{ animationDuration: '2.5s' }}
                        />
                    </div>
                    
                    {/* Week Timeline Tracker */}
                    <div className="w-full bg-base-200 rounded-2xl p-4 shadow-inner border border-base-100 flex flex-col gap-4 mt-2">
                        <div className="flex justify-between items-center relative px-4">
                            {/* Línea conectora */}
                            <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-base-300 -z-0 -translate-y-1/2 rounded-full mx-8"></div>
                            
                            {/* Semana Anterior */}
                            <div className="flex flex-col items-center gap-1.5 relative z-10">
                                <span className="text-[10px] font-bold text-base-content/50 uppercase tracking-wider">
                                    Sem {Math.max(1, (streak || 1) - 1)}
                                </span>
                                <div className="w-8 h-8 rounded-full bg-orange-500 shadow-md flex items-center justify-center border-2 border-white">
                                    <Icon icon="mdi:check-bold" className="w-4 h-4 text-white" />
                                </div>
                            </div>
                            
                            {/* Semana Actual */}
                            <div className="flex flex-col items-center gap-1.5 relative z-10">
                                <span className="text-[10px] font-extrabold text-orange-600 uppercase tracking-wider">
                                    Sem {streak || 1} - {lastLessonDate ? new Date(lastLessonDate).toLocaleString('es-ES', { month: 'short' }) : 'Hoy'}
                                </span>
                                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-orange-400 to-red-500 shadow-lg shadow-orange-500/40 flex items-center justify-center border-4 border-white animate-pulse">
                                    <Icon icon="mdi:fire" className="w-6 h-6 text-white animate-bounce" style={{ animationDuration: '2s' }} />
                                </div>
                            </div>

                            {/* Próxima Semana */}
                            <div className="flex flex-col items-center gap-1.5 relative z-10 opacity-70">
                                <span className="text-[10px] font-bold text-base-content/40 uppercase tracking-wider">
                                    Sem {(streak || 1) + 1}
                                </span>
                                <div className="w-8 h-8 rounded-full bg-base-300 shadow-inner flex items-center justify-center border-2 border-base-100">
                                    <Icon icon="mdi:lock-outline" className="w-4 h-4 text-base-content/30" />
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-orange-100/80 text-orange-900 text-xs font-medium p-3 rounded-xl flex items-start gap-2 border border-orange-200">
                            <Icon icon="mdi:alert-circle" className="w-5 h-5 shrink-0 mt-0.5 text-orange-600" />
                            <p className="leading-relaxed">¡Tu racha está activa! Completa una lección cada semana para no perder tu fuego.</p>
                        </div>
                    </div>

                    <div className="flex flex-col w-full gap-3 mt-8">
                        <button 
                            onClick={() => window.location.href = nextLessonUrl || "/lessons#current-lesson"}
                            className="btn btn-primary btn-lg w-full rounded-2xl shadow-xl shadow-primary/20 font-extrabold uppercase tracking-wide border-b-4 border-primary-focus hover:translate-y-1 hover:border-b-0 transition-all text-white"
                        >
                            Siguiente Lección
                        </button>
                        <button 
                            onClick={() => window.location.href = "/lessons"}
                            className="btn btn-ghost btn-lg w-full rounded-2xl font-bold uppercase text-base-content/70 hover:bg-base-200"
                        >
                            Ir al Roadmap
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (isExploreMode) {
        return (
            <div className="relative my-8 p-8 md:p-10 bg-base-100 rounded-3xl shadow-xl border-2 border-primary/30 flex flex-col items-center overflow-hidden">
                <div className="relative z-10 w-20 h-20 rounded-full bg-base-200 flex items-center justify-center mb-6 border-4 border-base-100 shadow-md">
                    <span className="text-4xl drop-shadow-sm">🧭</span>
                </div>
                <h3 className="relative z-10 text-2xl font-black text-center text-base-content mb-3 tracking-tight">Modo Explorador</h3>
                <p className="relative z-10 text-center text-lg text-base-content/70 mb-8 max-w-md font-medium">
                    Has terminado de explorar esta lección. Tu progreso y racha no se registrarán en este modo.
                </p>
                <button
                    onClick={() => window.location.href = "/lessons?view=grid"}
                    className="relative z-10 btn btn-primary btn-lg w-full max-w-sm rounded-2xl shadow-md uppercase tracking-wide transition-all"
                >
                    Continuar Explorando
                </button>
            </div>
        );
    }

    if (isUnlocked) {
        return (
            <div className="relative my-8 p-8 md:p-10 bg-base-100 rounded-3xl shadow-xl border-2 border-orange-400/30 flex flex-col items-center overflow-hidden">
                {/* Fondo brillante decorativo */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 via-transparent to-yellow-400/10 opacity-60"></div>
                
                <div className="relative z-10 w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-yellow-400 flex items-center justify-center mb-6 shadow-xl shadow-orange-500/30 animate-bounce border-4 border-base-100">
                    <span className="text-5xl drop-shadow-md">🏆</span>
                </div>
                
                <h3 className="relative z-10 text-3xl font-black text-center text-base-content mb-3 tracking-tight">¡Lección Completada!</h3>
                <p className="relative z-10 text-center text-lg text-base-content/70 mb-8 max-w-md font-medium">
                    Excelente trabajo. Has dominado los conceptos de esta lección y estás listo para avanzar.
                </p>
                
                <button
                    onClick={handleNextLesson}
                    className="relative z-10 btn btn-primary btn-lg w-full max-w-sm rounded-2xl shadow-xl shadow-primary/30 font-extrabold uppercase tracking-wide border-b-4 border-primary-focus hover:translate-y-1 hover:border-b-0 transition-all text-white"
                >
                    Siguiente Lección
                </button>
            </div>
        );
    }

    if (totalQuestions === 0 && !isUnlocked) {
        return (
            <div className="relative my-8 p-8 md:p-10 bg-base-200 rounded-3xl shadow-lg border border-base-300 flex flex-col items-center overflow-hidden">
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-6 animate-pulse border-2 border-primary/30">
                    <span className="text-4xl drop-shadow-sm">🏁</span>
                </div>
                <h3 className="text-2xl font-black text-center text-base-content mb-3 tracking-tight">¡Has llegado al final!</h3>
                <p className="text-center font-medium text-base-content/70 mb-8 max-w-md">
                    Has leído todo el material de esta lección. Para avanzar, márcala como completada.
                </p>
                <button
                    onClick={handleManualComplete}
                    className="btn btn-primary btn-lg w-full max-w-sm rounded-2xl shadow-lg shadow-primary/20 font-extrabold uppercase tracking-wide border-b-4 border-primary-focus hover:translate-y-1 hover:border-b-0 transition-all text-white"
                >
                    Completar Lección
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