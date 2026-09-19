import React, { useMemo, useState } from 'react';
import DataTable, { type FilterChipOption } from './DataTable';
import { createColumnHelper } from '@tanstack/react-table';
import { Flame, Snowflake, ChevronRight } from 'lucide-react';

const columnHelper = createColumnHelper<any>();

const getInitials = (fullName: string, firstName?: string, lastName?: string) => {
  if (firstName && lastName) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }
  if (!fullName) return 'AL';
  const clean = fullName.trim().replace(/\s+/g, ' ');
  const parts = clean.split(' ');
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
};

const getAvatarColor = (initials: string) => {
  const palettes = [
    'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200 border-blue-200 dark:border-blue-800',
    'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-200 border-purple-200 dark:border-purple-800',
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800',
    'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200 border-amber-200 dark:border-amber-800',
    'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-200 border-rose-200 dark:border-rose-800',
    'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-200 border-indigo-200 dark:border-indigo-800',
    'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-200 border-teal-200 dark:border-teal-800',
  ];
  const hash = (initials.charCodeAt(0) || 0) + (initials.charCodeAt(1) || 0);
  return palettes[hash % palettes.length];
};

const formatConnectionDate = (val?: string) => {
  if (!val) return 'Sin registro';
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return 'Sin registro';
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return 'Sin registro';
  }
};

export default function StudentsTable({ students = [] }: { students: any[] }) {
  const [activeChip, setActiveChip] = useState<'all' | 'active' | 'inactive'>('all');

  // Desktop columns
  const columns = useMemo(() => [
    columnHelper.accessor(row => row.full_name || `${row.first_name || ''} ${row.last_names || ''}`.trim() || 'Sin nombre', {
      id: 'name',
      header: 'Nombre Completo',
      cell: info => {
        const student = info.row.original;
        const name = String(info.getValue());
        const initials = getInitials(name, student.first_name, student.last_names);
        return (
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border ${getAvatarColor(initials)}`}>
              {initials}
            </div>
            <span className="font-semibold text-slate-900 dark:text-slate-100">{name}</span>
          </div>
        );
      },
    }),
    columnHelper.accessor('credential', {
      header: 'Credencial',
      cell: info => <div className="badge badge-ghost font-mono text-xs font-semibold">{info.getValue() || '—'}</div>,
    }),
    columnHelper.accessor('last_connection', {
      header: 'Última Conexión',
      cell: info => {
        const val = info.getValue();
        return (
          <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            {formatConnectionDate(val)}
          </span>
        );
      },
      sortingFn: 'datetime'
    }),
    columnHelper.accessor('streak', {
      header: 'Racha',
      cell: info => {
        const isFrozen = info.row.original.isFrozen;
        const val = Number(info.getValue()) || 0;
        return (
          <div className={`inline-flex items-center font-bold gap-1 px-2.5 py-1 rounded-full text-xs border ${
            isFrozen
              ? 'bg-info/10 text-info border-info/30'
              : val > 0
              ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50'
              : 'bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700'
          }`}>
            {isFrozen ? (
              <Snowflake className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '8s' }} />
            ) : (
              <Flame className={`w-3.5 h-3.5 ${val > 0 ? 'fill-current' : ''}`} />
            )}
            <span>{val}</span>
            {isFrozen && <span className="text-[10px] opacity-80">(❄️)</span>}
          </div>
        );
      },
    }),
    columnHelper.accessor('longestStreak', {
      header: 'Racha Máx.',
      cell: info => (
        <div className="inline-flex items-center text-slate-700 dark:text-slate-300 font-bold gap-1 text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <span>🏆</span>
          <span>{info.getValue() || 0}</span>
        </div>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Acciones',
      cell: props => (
        <a 
          href={`/admin/students/${props.row.original.id}`} 
          className="btn btn-xs sm:btn-sm btn-outline btn-info rounded-xl font-bold"
        >
          Ver Progreso
        </a>
      ),
    })
  ], []);

  // Quick filter chips with live counts
  const filterChips = useMemo<FilterChipOption[]>(() => {
    const totalCount = students.length;
    const activeCount = students.filter(s => (s.streak || 0) > 0).length;
    const inactiveCount = students.filter(s => (s.streak || 0) === 0).length;

    return [
      { id: 'all', label: 'Todos', count: totalCount },
      { id: 'active', label: 'Racha activa', count: activeCount },
      { id: 'inactive', label: 'Inactivos', count: inactiveCount },
    ];
  }, [students]);

  // Filtered dataset for table and cards
  const filteredStudents = useMemo(() => {
    if (activeChip === 'active') {
      return students.filter(s => (s.streak || 0) > 0);
    }
    if (activeChip === 'inactive') {
      return students.filter(s => (s.streak || 0) === 0);
    }
    return students;
  }, [students, activeChip]);

  // Mobile Card Renderer
  const renderMobileCard = (student: any) => {
    const fullName = student.full_name || `${student.first_name || ''} ${student.last_names || ''}`.trim() || 'Sin nombre';
    const initials = getInitials(fullName, student.first_name, student.last_names);
    const credential = student.credential || 'Sin carné';
    const lastConnection = formatConnectionDate(student.last_connection);
    const currentStreak = Number(student.streak) || 0;
    const maxStreak = Number(student.longestStreak) || 0;

    return (
      <a
        key={student.id}
        href={`/admin/students/${student.id}`}
        className="group bg-base-100 p-3.5 sm:p-4 rounded-2xl border border-base-200 hover:border-primary/40 shadow-xs hover:shadow-md transition-all flex items-center justify-between gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.99]"
        aria-label={`Ver progreso de ${fullName}`}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Avatar Circular con Iniciales */}
          <div 
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center shrink-0 font-bold text-xs sm:text-sm select-none border shadow-2xs ${getAvatarColor(initials)}`}
            aria-hidden="true"
          >
            {initials}
          </div>

          {/* Información del Estudiante */}
          <div className="min-w-0 flex-1 space-y-1">
            {/* Nombre Completo */}
            <h3 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-slate-100 truncate group-hover:text-primary transition-colors leading-snug">
              {fullName}
            </h3>

            {/* Metadatos en una sola línea horizontal */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 truncate">
              <span className="font-mono font-medium">{credential}</span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span className="truncate">Conectado: {lastConnection}</span>
            </div>

            {/* Rachas: Chips compactos en línea */}
            <div className="flex items-center gap-2 pt-0.5">
              {/* Racha actual */}
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border transition-colors ${
                student.isFrozen
                  ? 'bg-info/10 text-info border-info/30'
                  : currentStreak > 0
                  ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50'
                  : 'bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700'
              }`}>
                {student.isFrozen ? (
                  <>
                    <Snowflake className="w-3 h-3 text-info" />
                    <span>{currentStreak}</span>
                  </>
                ) : (
                  <>
                    <span>🔥</span>
                    <span>{currentStreak}</span>
                  </>
                )}
              </span>

              {/* Racha máxima */}
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                <span>🏆</span>
                <span>{maxStreak}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Acción: Botón secundario sutil con ChevronRight */}
        <div 
          className="shrink-0 p-1.5 rounded-xl text-slate-400 group-hover:text-primary group-hover:bg-primary/5 transition-all"
          aria-hidden="true"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </a>
    );
  };

  return (
    <DataTable 
      data={filteredStudents} 
      columns={columns} 
      placeholder="Buscar por nombre o carné..."
      renderMobileCard={renderMobileCard}
      filterChips={filterChips}
      activeChip={activeChip}
      onChipChange={(id) => setActiveChip(id as any)}
    />
  );
}
