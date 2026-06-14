import React, { useState, useMemo } from 'react';
import { Icon } from '@iconify/react';

interface AdminStreakDisplayProps {
    streak: number;
    longestStreak?: number;
    progressData: Record<string, any>; // El json de progreso del alumno
    lastLessonDate: string | null;
}

export default function AdminStreakDisplay({ streak, longestStreak = 0, progressData, lastLessonDate }: AdminStreakDisplayProps) {
    // Recolectar fechas completadas
    const completedDates = useMemo(() => {
        const dates = new Set();
        if (progressData) {
            Object.values(progressData).forEach((p: any) => {
                if (p.completedAt) {
                    const d = new Date(p.completedAt);
                    dates.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
                }
            });
        }
        return dates;
    }, [progressData]);

    const [currentDate, setCurrentDate] = useState(() => new Date());

    let fireColor = "text-gray-400 opacity-50";
    if (streak > 0) fireColor = "text-orange-400";
    if (streak >= 3) fireColor = "text-orange-500 drop-shadow-md";
    if (streak >= 5) fireColor = "text-red-500 drop-shadow-lg scale-110";

    // Lógica del calendario
    const today = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay(); // 0 es Domingo
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    // Celdas vacías y días agrupados
    const allSlots = [];
    for (let i = 0; i < firstDay; i++) {
        allSlots.push({ type: 'empty', id: `empty-${i}` });
    }
    for (let i = 1; i <= daysInMonth; i++) {
        allSlots.push({ type: 'day', day: i, id: `day-${i}` });
    }
    while (allSlots.length % 7 !== 0) {
        allSlots.push({ type: 'empty', id: `empty-end-${allSlots.length}` });
    }

    const weeks = [];
    for (let i = 0; i < allSlots.length; i += 7) {
        weeks.push(allSlots.slice(i, i + 7));
    }

    const nextMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    };

    return (
        <div className="flex flex-col items-center bg-base-100 p-6 rounded-3xl shadow-xl border border-base-200 max-w-sm mx-auto w-full">
            <h3 className="font-bold text-2xl mb-1 flex items-center gap-2">
                <Icon icon="mdi:fire" className="text-orange-500 w-8 h-8" /> 
                Racha: {streak} {streak === 1 ? 'semana' : 'semanas'}
            </h3>
            {longestStreak > 0 && (
                <div className="badge bg-red-500 text-white border-none gap-1 font-bold mb-3 shadow-sm py-3 px-4">
                    <Icon icon="mdi:fire-circle" className="w-4 h-4 shrink-0" />
                    Racha Máxima: {longestStreak} {longestStreak === 1 ? 'semana' : 'semanas'}
                </div>
            )}
            <p className="text-sm text-base-content/70 mb-6 text-center">
                Última lección: {lastLessonDate ? new Date(lastLessonDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Nunca'}
            </p>
            
            {/* Mini Calendar */}
            <div className="w-full bg-base-200/50 p-4 rounded-xl shadow-inner">
                <div className="flex justify-between items-center mb-4">
                    <button onClick={prevMonth} className="btn btn-sm btn-ghost btn-circle">
                        <Icon icon="mdi:chevron-left" className="w-5 h-5" />
                    </button>
                    <div className="text-center font-bold text-lg capitalize text-base-content">
                        {currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
                    </div>
                    <button onClick={nextMonth} className="btn btn-sm btn-ghost btn-circle">
                        <Icon icon="mdi:chevron-right" className="w-5 h-5" />
                    </button>
                </div>
                <div className="grid grid-cols-7 gap-2 text-center mb-2 px-1">
                    {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'].map(d => (
                        <div key={d} className="text-xs font-bold text-base-content/50">{d}</div>
                    ))}
                </div>
                <div className="flex flex-col gap-1">
                    {weeks.map((week, weekIndex) => {
                        let isStreakWeek = false;
                        if (lastLessonDate && streak > 0) {
                            const lastD = new Date(lastLessonDate);
                            isStreakWeek = week.some(slot => slot.type === 'day' && slot.day === lastD.getDate() && currentMonth === lastD.getMonth() && currentYear === lastD.getFullYear());
                        }

                        return (
                            <div key={`week-${weekIndex}`} className={`grid grid-cols-7 gap-2 rounded-full p-1 transition-all duration-300 ${isStreakWeek ? 'bg-gradient-to-r from-orange-400 to-orange-500 shadow-md border-b-4 border-orange-600/50 scale-[1.02]' : ''}`}>
                                {week.map((slot) => {
                                    if (slot.type === 'empty') {
                                        return <div key={slot.id} className="text-center py-1"></div>;
                                    }
                                    
                                    const day = slot.day;
                                    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                    const isCompleted = completedDates.has(dateStr);
                                    const isLastLesson = lastLessonDate && day === new Date(lastLessonDate).getDate() && currentMonth === new Date(lastLessonDate).getMonth() && currentYear === new Date(lastLessonDate).getFullYear();
                                    const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
                                    
                                    return (
                                        <div key={slot.id} className={`relative text-center py-1 text-sm rounded-full flex items-center justify-center w-8 h-8 mx-auto transition-colors
                                            ${isStreakWeek 
                                                ? (isLastLesson ? 'bg-white text-orange-600 font-extrabold shadow-sm scale-110' : 'text-white font-bold opacity-90')
                                                : (isCompleted ? 'bg-orange-100 text-orange-600 font-bold border border-orange-300' : 
                                                   isToday ? 'bg-primary text-white font-bold shadow-md' : 'text-base-content/70 hover:bg-base-200')}
                                        `}>
                                            {isStreakWeek && isLastLesson && (
                                                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white z-10 flex items-center justify-center">
                                                    <Icon icon="mdi:check" className="w-2.5 h-2.5 text-white" />
                                                </div>
                                            )}
                                            {day}
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
