import React, { useState, useMemo } from 'react';
import { Icon } from '@iconify/react';

interface AdminStreakDisplayProps {
    streak: number;
    progressData: Record<string, any>; // El json de progreso del alumno
    lastLessonDate: string | null;
}

export default function AdminStreakDisplay({ streak, progressData, lastLessonDate }: AdminStreakDisplayProps) {
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
    
    const blanks = Array.from({ length: firstDay }).map((_, i) => <div key={`blank-${i}`} className="w-8 h-8"></div>);
    const calendarDays = Array.from({ length: daysInMonth }).map((_, i) => {
        const day = i + 1;
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isCompleted = completedDates.has(dateStr);
        const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
        
        return (
            <div key={`day-${day}`} 
                 className={`w-8 h-8 flex items-center justify-center rounded-full text-sm mx-auto
                    ${isCompleted ? 'bg-orange-100 text-orange-600 font-bold border border-orange-300' : ''}
                    ${isToday && !isCompleted ? 'bg-base-200 font-bold' : ''}
                 `}>
                {day}
            </div>
        );
    });

    const nextMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    };

    return (
        <div className="flex flex-col items-center bg-base-100 p-6 rounded-2xl shadow-lg border border-base-200 max-w-sm mx-auto">
            <h3 className="font-bold text-2xl mb-2 flex items-center gap-2">
                <Icon icon="mdi:fire" className="text-orange-500 w-8 h-8" /> 
                Racha: {streak} {streak === 1 ? 'semana' : 'semanas'}
            </h3>
            <p className="text-sm text-base-content/70 mb-6 text-center">
                Última lección: {lastLessonDate ? new Date(lastLessonDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Nunca'}
            </p>
            
            {/* Mini Calendar */}
            <div className="w-full bg-base-50 p-4 rounded-xl border border-base-200 shadow-sm">
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
                <div className="grid grid-cols-7 gap-2 text-center mb-2">
                    {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'].map(d => (
                        <div key={d} className="text-xs font-bold text-base-content/50">{d}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-y-3 gap-x-2">
                    {blanks}
                    {calendarDays}
                </div>
            </div>
        </div>
    );
}
