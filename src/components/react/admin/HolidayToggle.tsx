import React, { useState } from 'react';
import { Snowflake } from 'lucide-react';

export default function HolidayToggle({ initialHolidayMode }: { initialHolidayMode: boolean }) {
  const [isHolidayMode, setIsHolidayMode] = useState(initialHolidayMode);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

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
        setShowModal(false);
      }
    } catch (e) {
      console.error("Error toggling holiday mode:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border transition-all shadow-sm ${isHolidayMode
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
          onClick={() => setShowModal(true)}
          disabled={loading}
          className={`btn btn-xs sm:btn-sm ml-auto rounded-xl font-bold transition-all ${isHolidayMode ? 'btn-info text-white shadow-md hover:scale-105' : 'btn-outline btn-primary'
            }`}
        >
          {loading ? (
            <span className="loading loading-spinner loading-xs"></span>
          ) : isHolidayMode ? (
            '☀️ Descongelar'
          ) : (
            '❄️ Congelar Todo'
          )}
        </button>
      </div>

      {/* Modal de Confirmación */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade">
          <div className="bg-base-100 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-base-200 text-left animate-fade-down">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${isHolidayMode ? 'bg-primary/10 text-primary' : 'bg-info/10 text-info'}`}>
                <Snowflake className={`w-6 h-6 ${!isHolidayMode ? 'animate-spin' : ''}`} style={{ animationDuration: '10s' }} />
              </div>
              <h3 className="text-xl font-extrabold text-base-content">
                {isHolidayMode ? '¿Desactivar Modo Vacaciones?' : '¿Activar Modo Vacaciones?'}
              </h3>
            </div>

            <div className="space-y-3 text-sm text-base-content/80 my-6 leading-relaxed">
              {isHolidayMode ? (
                <>
                  <p>
                    Al desactivar el Modo Vacaciones, el sistema <strong>volverá a evaluar las rachas de forma normal</strong> cada fin de semana.
                  </p>
                  <div className="alert alert-warning text-xs py-3 px-4 rounded-2xl shadow-sm border border-warning/30">
                    <span>⚠️ <strong>Aviso:</strong> Asegúrate de que ya haya lecciones disponibles para que los alumnos puedan continuar su progreso sin perder la racha.</span>
                  </div>
                </>
              ) : (
                <>
                  <p>
                    Al activar esta opción, <strong>ningún estudiante perderá su racha</strong> durante este periodo (receso escolar o semanas sin lección nueva).
                  </p>
                  <div className="bg-base-200/80 p-4 rounded-2xl border border-base-300 text-xs text-base-content/70 space-y-1">
                    <strong className="text-base-content block text-sm">💡 Sin cambios en los registros:</strong>
                    Esta acción <strong>NO modifica ni sobreescribe </strong>los registros de rachas de los alumnos. Únicamente activa una protección global para que se mantengan congeladas (❄️) y protegidas.
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-base-200">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                disabled={loading}
                className="btn btn-ghost font-bold rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleToggle}
                disabled={loading}
                className={`btn font-bold px-6 rounded-xl shadow-md ${isHolidayMode ? 'btn-primary' : 'btn-info text-white'}`}
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    <span>Procesando...</span>
                  </>
                ) : isHolidayMode ? (
                  'Sí, Descongelar Rachas'
                ) : (
                  '❄️ Sí, Congelar Rachas'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
