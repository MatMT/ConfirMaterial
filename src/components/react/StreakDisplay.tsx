import React, { useEffect, useState, useMemo } from 'react';
import useProgressStore from '../../stores/progressStore';
import { Icon } from '@iconify/react';

export default function StreakDisplay() {
    const { streak, lastLessonDate, isInitialized, progress, initializeStore } = useProgressStore();
    const [daysLeft, setDaysLeft] = useState(null);

    useEffect(() => {
        initializeStore();
    }, [initializeStore]);

    useEffect(() => {
        if (!isInitialized || !lastLessonDate) return;

        const calculateDaysLeft = () => {
            const lastDate = new Date(lastLessonDate);
            const now = new Date();
            const deadline = new Date(lastDate);
            deadline.setDate(deadline.getDate() + 10);
            
            const diffTime = deadline.getTime() - now.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            setDaysLeft(diffDays > 0 ? diffDays : 0);
        };

        calculateDaysLeft();
        const interval = setInterval(calculateDaysLeft, 1000 * 60 * 60);
        return () => clearInterval(interval);
    }, [lastLessonDate, isInitialized]);

    // Recolectar fechas completadas
    const completedDates = useMemo(() => {
        const dates = new Set();
        if (progress) {
            Object.values(progress).forEach((p) => {
                if (p.completedAt) {
                    const d = new Date(p.completedAt);
                    dates.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
                }
            });
        }
        return dates;
    }, [progress]);

    const [currentDate, setCurrentDate] = useState(() => new Date());

    if (!isInitialized) return null;

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
    
    const blanks = Array.from({ length: firstDay }).map((_, i) => <div key={`blank-${i}`} className="w-6 h-6"></div>);
    const calendarDays = Array.from({ length: daysInMonth }).map((_, i) => {
        const day = i + 1;
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isCompleted = completedDates.has(dateStr);
        const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
        
        return (
            <div key={`day-${day}`} 
                 className={`w-6 h-6 flex items-center justify-center rounded-full text-xs mx-auto
                    ${isCompleted ? 'bg-orange-100 text-orange-600 font-bold border border-orange-300' : ''}
                    ${isToday && !isCompleted ? 'bg-base-200 font-bold' : ''}
                 `}>
                {day}
            </div>
        );
    });

    const nextMonth = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    };

    const prevMonth = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    };

    return (
        <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="flex items-center gap-1 bg-base-200 px-3 py-1.5 rounded-full cursor-pointer hover:bg-base-300 transition-colors mr-2">
                <Icon icon="mdi:fire" className={`w-5 h-5 transition-all duration-300 ${fireColor}`} />
                <span className="font-bold text-sm">{streak}</span>
            </div>
            
            <div tabIndex={0} className="dropdown-content z-[1] menu p-4 shadow-2xl bg-base-100 rounded-2xl w-64 mt-2 border border-base-200 cursor-default">
                <div className="flex flex-col items-center">
                    <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                        <Icon icon="mdi:fire" className="text-orange-500 w-6 h-6" /> 
                        Racha: {streak} {streak === 1 ? 'semana' : 'semanas'}
                    </h3>
                    <p className="text-xs text-base-content/70 mb-4 text-center">
                        {daysLeft !== null && streak > 0 ? `¡Haz una lección en los próximos ${daysLeft} días para mantener tu racha!` : 'Completa tu primera lección para iniciar tu racha.'}
                    </p>
                    
                    {/* Mini Calendar */}
                    <div className="w-full bg-base-50 p-3 rounded-xl border border-base-200 shadow-sm">
                        <div className="flex justify-between items-center mb-3">
                            <button onClick={prevMonth} className="btn btn-xs btn-ghost btn-circle">
                                <Icon icon="mdi:chevron-left" className="w-4 h-4" />
                            </button>
                            <div className="text-center font-bold text-sm capitalize text-base-content">
                                {currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
                            </div>
                            <button onClick={nextMonth} className="btn btn-xs btn-ghost btn-circle">
                                <Icon icon="mdi:chevron-right" className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-center mb-2">
                            {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'].map(d => (
                                <div key={d} className="text-[10px] font-bold text-base-content/50">{d}</div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-y-2 gap-x-1">
                            {blanks}
                            {calendarDays}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
