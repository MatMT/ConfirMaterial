import React, { useState } from 'react';
import { Snowflake } from 'lucide-react';

export default function HolidayToggle({ initialHolidayMode }: { initialHolidayMode: boolean }) {
  const [isHolidayMode, setIsHolidayMode] = useState(initialHolidayMode);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ holidayMode: !isHolidayMode }),
      });
      if (res.ok) {
        const data = await res.json();
        setIsHolidayMode(data.holidayMode);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border transition-all shadow-sm ${
      isHolidayMode 
        ? 'bg-info/15 border-info/40 text-info font-bold shadow-info/10' 
        : 'bg-base-200/60 border-base-300 text-base-content/70 hover:bg-base-200'
    }`}>
      <Snowflake className={`w-5 h-5 shrink-0 ${isHolidayMode ? 'animate-spin text-info' : 'text-base-content/50'}`} style={{ animationDuration: '10s' }} />
      <div className="flex flex-col text-left mr-1">
        <span className="text-xs sm:text-sm font-extrabold leading-tight">
          {isHolidayMode ? 'Modo Vacaciones: ACTIVO (❄️)' : 'Modo Vacaciones: Inactivo'}
        </span>
        <span className="text-[10px] sm:text-xs opacity-75 font-normal">
          {isHolidayMode ? 'Rachas congeladas para todos.' : 'Rachas caducan normal.'}
        </span>
      </div>
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`btn btn-xs sm:btn-sm ml-auto rounded-xl font-bold transition-all ${
          isHolidayMode ? 'btn-info text-white shadow-md hover:scale-105' : 'btn-outline btn-primary'
        }`}
      >
        {loading ? (
          <span className="loading loading-spinner loading-xs"></span>
        ) : isHolidayMode ? (
          'Desactivar'
        ) : (
          '❄️ Congelar Todo'
        )}
      </button>
    </div>
  );
}
