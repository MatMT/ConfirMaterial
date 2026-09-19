import React, { useState, useEffect, useRef } from 'react';
import { Snowflake, Sun, AlertTriangle } from 'lucide-react';

export default function HolidayToggle({ initialHolidayMode }: { initialHolidayMode: boolean }) {
  const [isHolidayMode, setIsHolidayMode] = useState(initialHolidayMode);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  // Close dialog on Escape key
  useEffect(() => {
    if (!showModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) {
        setShowModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal, loading]);

  // Focus cancel button on open for a11y
  useEffect(() => {
    if (showModal) {
      setTimeout(() => {
        cancelButtonRef.current?.focus();
      }, 50);
    }
  }, [showModal]);

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
      <div className={`flex items-center justify-between sm:justify-start gap-3.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl border transition-all shadow-sm w-full sm:w-auto ${
        isHolidayMode
          ? 'bg-info/15 border-info/40 text-info font-bold shadow-info/10'
          : 'bg-base-200/70 border-base-300 text-base-content/80'
      }`}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
            isHolidayMode ? 'bg-info/20 text-info' : 'bg-base-300 text-base-content/60'
          }`}>
            {isHolidayMode ? (
              <Snowflake className="w-4 h-4 animate-spin" style={{ animationDuration: '10s' }} />
            ) : (
              <Sun className="w-4 h-4" />
            )}
          </div>
          <div className="flex flex-col text-left">
            <span id="holiday-switch-label" className="text-xs sm:text-sm font-extrabold leading-tight text-slate-900 dark:text-slate-100 truncate">
              {isHolidayMode ? 'Modo Vacaciones: Activo' : 'Modo Vacaciones: Inactivo'}
            </span>
            <span className="text-[10px] sm:text-xs text-base-content/60 font-normal truncate">
              {isHolidayMode ? 'Rachas congeladas (❄️)' : 'Rachas caducan normal'}
            </span>
          </div>
        </div>

        {/* Accessible Switch Component (Radix-like WAI-ARIA Switch) */}
        <button
          type="button"
          role="switch"
          aria-checked={isHolidayMode}
          aria-labelledby="holiday-switch-label"
          disabled={loading}
          onClick={() => setShowModal(true)}
          className={`relative inline-flex h-6 w-11 sm:h-7 sm:w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ml-auto sm:ml-2 ${
            isHolidayMode ? 'bg-info' : 'bg-slate-300 dark:bg-slate-700'
          }`}
        >
          <span className="sr-only">Alternar Modo Vacaciones</span>
          <span
            aria-hidden="true"
            className={`pointer-events-none inline-block h-5 w-5 sm:h-6 sm:w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
              isHolidayMode ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Accessible AlertDialog de Confirmación */}
      {showModal && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade"
          role="dialog"
          aria-modal="true"
          aria-labelledby="holiday-dialog-title"
          aria-describedby="holiday-dialog-desc"
        >
          <div 
            className="bg-base-100 rounded-3xl p-5 sm:p-7 max-w-lg w-full shadow-2xl border border-base-200 text-left animate-fade-down"
            role="alertdialog"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                isHolidayMode ? 'bg-primary/10 text-primary' : 'bg-info/10 text-info'
              }`}>
                {isHolidayMode ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Snowflake className="w-5 h-5 animate-spin" style={{ animationDuration: '10s' }} />
                )}
              </div>
              <div>
                <h3 id="holiday-dialog-title" className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100">
                  {isHolidayMode ? '¿Desactivar Modo Vacaciones?' : '¿Activar Modo Vacaciones?'}
                </h3>
                <span className="text-xs text-base-content/60 font-medium">
                  Afecta a todos los estudiantes de la plataforma
                </span>
              </div>
            </div>

            <div id="holiday-dialog-desc" className="space-y-3 text-xs sm:text-sm text-base-content/80 my-5 leading-relaxed">
              {isHolidayMode ? (
                <>
                  <p>
                    Al desactivar el Modo Vacaciones, las rachas de los alumnos <strong>volverán a evaluarse normalmente</strong> cada fin de semana.
                  </p>
                  <div className="alert alert-warning text-xs py-2.5 px-3.5 rounded-xl shadow-xs border border-warning/30 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                    <span>Asegúrate de que haya una nueva lección disponible antes de descongelar para que nadie pierda su racha.</span>
                  </div>
                </>
              ) : (
                <>
                  <p>
                    Al activar el Modo Vacaciones, <strong>ningún estudiante perderá su racha</strong> durante este receso o periodo vacacional.
                  </p>
                  <div className="bg-base-200/80 p-3.5 rounded-xl border border-base-300 text-xs text-base-content/70 space-y-1">
                    <strong className="text-base-content block font-bold">💡 Protección segura de rachas:</strong>
                    Esta acción protege a todos los alumnos congelando (❄️) sus rachas sin modificar sus registros individuales.
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end gap-2.5 pt-3.5 border-t border-base-200">
              <button
                ref={cancelButtonRef}
                type="button"
                onClick={() => setShowModal(false)}
                disabled={loading}
                className="btn btn-ghost btn-sm sm:btn-md font-bold rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleToggle}
                disabled={loading}
                className={`btn btn-sm sm:btn-md font-bold px-5 rounded-xl shadow-md ${
                  isHolidayMode ? 'btn-primary' : 'btn-info text-white'
                }`}
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-xs"></span>
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
