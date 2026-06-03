import React, { useEffect, useState, useMemo } from 'react';
import useProgressStore from '../../stores/progressStore';
import { Icon } from '@iconify/react';

export default function StreakDisplay() {
    const { streak, lastLessonDate, isInitialized, progress, testDangerMode, toggleTestDangerMode, initializeStore } = useProgressStore();
    const [daysLeft, setDaysLeft] = useState(null);
    const [hasMaintainedThisWeek, setHasMaintainedThisWeek] = useState(false);
    const [deadlineDate, setDeadlineDate] = useState(null);
    const [toastMessage, setToastMessage] = useState(null);
    const [currentViewDate, setCurrentViewDate] = useState(new Date());

    useEffect(() => {
        initializeStore();
        
        const handleStreakBlocked = (e: any) => {
            setToastMessage(e.detail);
            setTimeout(() => setToastMessage(null), 8000); // Hide after 8 seconds
        };
        
        window.addEventListener('streak-blocked', handleStreakBlocked);
        return () => window.removeEventListener('streak-blocked', handleStreakBlocked);
    }, [initializeStore]);

    useEffect(() => {
        if (!isInitialized) return;

        // Calculate if streak is maintained this week and when the next deadline is
        const calculateStreakStatus = () => {
            const now = new Date();
            
            // Define the deadline for the current week: Saturday 11:00 AM
            // If today is Saturday after 11:00 AM, the deadline is NEXT Saturday.
            let nextDeadline = new Date(now);
            const currentDay = nextDeadline.getDay(); // 0 is Sunday, 6 is Saturday
            
            // Go to the closest Saturday
            const daysToSaturday = 6 - currentDay;
            nextDeadline.setDate(now.getDate() + daysToSaturday);
            nextDeadline.setHours(11, 0, 0, 0); // 11:00 AM

            // If we are already past this week's Saturday 11:00 AM, the deadline is next week
            if (now.getTime() > nextDeadline.getTime()) {
                nextDeadline.setDate(nextDeadline.getDate() + 7);
            }

            setDeadlineDate(nextDeadline);

            // Calculate days left
            const diffTime = nextDeadline.getTime() - now.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            setDaysLeft(diffDays > 0 ? diffDays : 0);

            // Check if they already maintained it this week
            // A streak is "maintained" if lastLessonDate is greater than the previous deadline
            // The previous deadline is exactly 7 days before nextDeadline
            const previousDeadline = new Date(nextDeadline);
            previousDeadline.setDate(previousDeadline.getDate() - 7);

            if (lastLessonDate && new Date(lastLessonDate).getTime() > previousDeadline.getTime()) {
                setHasMaintainedThisWeek(true);
            } else {
                setHasMaintainedThisWeek(false);
            }
        };

        calculateStreakStatus();
        const interval = setInterval(calculateStreakStatus, 1000 * 60 * 60);
        return () => clearInterval(interval);
    }, [lastLessonDate, isInitialized]);

    if (!isInitialized) return null;

    const isDanger = testDangerMode || (daysLeft !== null && daysLeft <= 1 && streak > 0 && !hasMaintainedThisWeek);

    let fireColor = "text-gray-400 opacity-50";
    if (streak > 0) fireColor = "text-orange-400";
    if (streak >= 3) fireColor = "text-orange-500 drop-shadow-md";
    if (streak >= 5) fireColor = "text-red-500 drop-shadow-lg scale-110";

    // Si está en peligro, hacemos que la llama palpite en rojo intenso
    if (isDanger) fireColor = "text-red-600 animate-pulse drop-shadow-[0_0_5px_rgba(220,38,38,0.8)] scale-110";

    // Funciones para navegar en el calendario
    const prevMonth = (e) => {
        e.stopPropagation();
        setCurrentViewDate(new Date(currentViewDate.getFullYear(), currentViewDate.getMonth() - 1, 1));
    };

    const nextMonth = (e) => {
        e.stopPropagation();
        setCurrentViewDate(new Date(currentViewDate.getFullYear(), currentViewDate.getMonth() + 1, 1));
    };

    // Generar días del mes actual para el calendario visual
    const renderCalendar = () => {
        const now = new Date();
        const year = currentViewDate.getFullYear();
        const month = currentViewDate.getMonth();
        
        const firstDay = new Date(year, month, 1).getDay(); // 0 is Sunday
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const slots = [];
        for (let i = 0; i < firstDay; i++) {
            slots.push({ type: 'empty', id: `empty-${i}` });
        }
        for (let i = 1; i <= daysInMonth; i++) {
            slots.push({ type: 'day', day: i, id: `day-${i}` });
        }
        while (slots.length % 7 !== 0) {
            slots.push({ type: 'empty', id: `empty-end-${slots.length}` });
        }

        const weeks = [];
        for (let i = 0; i < slots.length; i += 7) {
            weeks.push(slots.slice(i, i + 7));
        }

        return (
            <div className="w-full bg-base-200/50 p-4 rounded-xl shadow-inner mb-4">
                <div className="flex justify-between items-center mb-4">
                    <button onClick={prevMonth} className="btn btn-sm btn-ghost btn-circle">
                        <Icon icon="mdi:chevron-left" className="w-5 h-5" />
                    </button>
                    <div className="text-center font-bold text-base capitalize text-base-content">
                        {currentViewDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
                    </div>
                    <button onClick={nextMonth} className="btn btn-sm btn-ghost btn-circle">
                        <Icon icon="mdi:chevron-right" className="w-5 h-5" />
                    </button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                    {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'].map(d => (
                        <div key={d} className="text-[10px] font-bold text-base-content/50">{d}</div>
                    ))}
                </div>
                <div className="flex flex-col gap-1">
                    {weeks.map((week, weekIndex) => {
                        // Resaltar la fila de la semana actual
                        let isCurrentWeekRow = false;
                        week.forEach(slot => {
                            if (slot.type === 'day' && slot.day === now.getDate() && month === now.getMonth() && year === now.getFullYear()) {
                                isCurrentWeekRow = true;
                            }
                        });

                        // Para el UI visual de la semana de racha, si el alumno ya hizo la leccion (hasMaintainedThisWeek), resaltamos esa fila con fuego
                        const isStreakRow = isCurrentWeekRow && streak > 0 && hasMaintainedThisWeek;

                        return (
                            <div key={`week-${weekIndex}`} className={`grid grid-cols-7 gap-1 rounded-full p-0.5 transition-all duration-300 ${isStreakRow ? 'bg-gradient-to-r from-orange-400 to-orange-500 shadow-md border-b-2 border-orange-600/50 scale-[1.02]' : ''}`}>
                                {week.map((slot) => {
                                    if (slot.type === 'empty') {
                                        return <div key={slot.id} className="text-center py-1"></div>;
                                    }
                                    
                                    const i = slot.day;
                                    const isToday = i === now.getDate() && month === now.getMonth() && year === now.getFullYear();
                                    
                                    // Ver si este día es exactamente la ultima leccion
                                    let isLastLessonDay = false;
                                    if (lastLessonDate) {
                                        const lD = new Date(lastLessonDate);
                                        isLastLessonDay = i === lD.getDate() && month === lD.getMonth() && year === lD.getFullYear();
                                    }

                                    // Comprobar si este día es el límite de la racha
                                    let isDeadlineDay = false;
                                    if (deadlineDate) {
                                        isDeadlineDay = i === deadlineDate.getDate() && month === deadlineDate.getMonth() && year === deadlineDate.getFullYear();
                                    }
                                    
                                    return (
                                        <div key={slot.id} className={`relative text-center py-1 text-xs rounded-full flex items-center justify-center w-6 h-6 mx-auto transition-colors
                                            ${isStreakRow 
                                                ? (isLastLessonDay ? 'bg-white text-orange-600 font-extrabold shadow-sm scale-110' : 'text-white font-bold opacity-90')
                                                : (isToday ? 'bg-base-300 text-base-content font-bold shadow-inner' : 'text-base-content/70')}
                                            ${isDeadlineDay && !isStreakRow ? 'border-2 border-dashed border-red-400/60 text-red-500 font-bold bg-red-50' : ''}
                                            ${isDeadlineDay && isStreakRow ? 'border-2 border-dashed border-white' : ''}
                                        `}>
                                            {isStreakRow && isLastLessonDay && (
                                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white z-10 flex items-center justify-center">
                                                    <Icon icon="mdi:check" className="w-2 h-2 text-white" />
                                                </div>
                                            )}
                                            {i}
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="dropdown dropdown-hover dropdown-end">
            <div tabIndex={0} role="button" className={`flex items-center gap-1 px-3 py-1.5 rounded-full cursor-pointer transition-colors mr-2 ${isDanger ? 'bg-red-100 border border-red-500 animate-pulse' : 'bg-base-200'}`}>
                <Icon icon="mdi:fire" className={`w-5 h-5 transition-all duration-300 ${fireColor}`} />
                <span className={`font-bold text-sm ${isDanger ? 'text-red-700' : ''}`}>{streak}</span>
            </div> 
            
            <div tabIndex={0} className="dropdown-content z-[9999] p-4 shadow-2xl bg-base-100 rounded-2xl w-[calc(100vw-2rem)] sm:w-80 border border-base-200 cursor-default !fixed !left-1/2 !-translate-x-1/2 !top-20 sm:!absolute sm:!top-auto sm:!left-auto sm:!translate-x-0 sm:!right-0 sm:mt-2">
                <div className="flex flex-col">
                    <h3 className="font-bold text-lg mb-4 text-base-content/90 border-b border-base-200 pb-2">
                        Semana de {streak} {streak === 1 ? 'racha' : 'rachas'}.
                    </h3>
                    
                    {/* Calendario Visual */}
                    {renderCalendar()}
                    
                    <div className="flex flex-col space-y-3">
                        {/* Badge 1 */}
                        <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 flex gap-3 items-start">
                            <div className="bg-primary/20 p-1.5 rounded-lg shrink-0">
                                <Icon icon="mdi:pencil-outline" className="w-5 h-5 text-primary" />
                            </div>
                            <span className="text-xs text-base-content/80 font-medium leading-relaxed">
                                Completa tu repaso semanal de catequesis para mantener el fuego encendido.
                            </span>
                        </div>
                        
                        {/* Badge 2 */}
                        <div className={`border rounded-xl p-3 flex gap-3 items-start ${hasMaintainedThisWeek ? 'bg-orange-500/10 border-orange-500/20' : 'bg-base-200/50 border-base-200'}`}>
                            <div className={`${hasMaintainedThisWeek ? 'bg-orange-500/20' : 'bg-base-300'} p-1.5 rounded-lg shrink-0`}>
                                {hasMaintainedThisWeek ? (
                                    <Icon icon="mdi:fire" className="w-5 h-5 text-orange-500" />
                                ) : (
                                    <Icon icon="mdi:fire-alert" className="w-5 h-5 text-base-content/40" />
                                )}
                            </div>
                            <span className={`text-xs font-medium leading-relaxed ${hasMaintainedThisWeek ? 'text-orange-700 dark:text-orange-400' : 'text-base-content/60'}`}>
                                {hasMaintainedThisWeek 
                                    ? "¡Has mantenido tu racha esta semana!" 
                                    : "Aún no has completado tu repaso."}
                            </span>
                        </div>
                        
                        {/* Badge 3 */}
                        <div className="bg-secondary/10 border border-secondary/20 rounded-xl p-3 flex gap-3 items-center">
                            <div className="bg-secondary/20 p-1.5 rounded-lg shrink-0">
                                <Icon icon="mdi:calendar-clock" className="w-5 h-5 text-secondary" />
                            </div>
                            <span className="text-xs text-base-content/80 font-medium">
                                Finaliza: {deadlineDate ? deadlineDate.toLocaleString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true }) : '...'}
                            </span>
                        </div>

                        {/* Botón de prueba para desarrollador */}
                        <div className="pt-2 border-t border-base-200 mt-2">
                            <button 
                                onClick={(e) => { e.stopPropagation(); toggleTestDangerMode(); }}
                                className={`btn btn-sm w-full font-bold ${testDangerMode ? 'btn-error' : 'btn-outline'}`}
                            >
                                <Icon icon="mdi:test-tube" className="w-4 h-4" />
                                {testDangerMode ? 'Desactivar Peligro (Test)' : 'Simular Peligro (Test)'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {toastMessage && (
                <div className="toast toast-top toast-center z-[100]">
                    <div className="alert alert-warning shadow-lg max-w-md animate-fade-down">
                        <Icon icon="mdi:alert-circle-outline" className="w-6 h-6 shrink-0" />
                        <div>
                            <h3 className="font-bold">¡Aviso del Maestro del Tiempo!</h3>
                            <div className="text-sm">{toastMessage}</div>
                        </div>
                        <button onClick={() => setToastMessage(null)} className="btn btn-sm btn-ghost btn-circle ml-2">✕</button>
                    </div>
                </div>
            )}
        </div>
    );
}
