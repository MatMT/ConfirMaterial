import React, { useMemo } from 'react';
import DataTable from './DataTable';
import { createColumnHelper } from '@tanstack/react-table';
import { Flame } from 'lucide-react';

const columnHelper = createColumnHelper();

export default function StudentsTable({ students }) {
  const columns = useMemo(() => [
    columnHelper.accessor(row => row.full_name || `${row.first_name || ''} ${row.last_names || ''}`, {
      id: 'name',
      header: 'Nombre Completo',
      cell: info => <span className="font-medium">{info.getValue()}</span>,
    }),
    columnHelper.accessor('credential', {
      header: 'Credencial',
      cell: info => <div className="badge badge-ghost font-mono">{info.getValue()}</div>,
    }),
    columnHelper.accessor('last_connection', {
      header: 'Última Conexión',
      cell: info => {
        const val = info.getValue();
        return val 
          ? new Date(val).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) 
          : 'Nunca';
      },
      sortingFn: 'datetime'
    }),
    columnHelper.accessor('streak', {
      header: 'Racha',
      cell: info => (
        <div className="flex items-center text-orange-500 font-bold gap-1">
          <Flame className="w-4 h-4 fill-current" /> {info.getValue()}
        </div>
      ),
    }),
    columnHelper.accessor('longestStreak', {
      header: 'Racha Máx.',
      cell: info => (
        <div className="flex items-center text-red-500 font-bold gap-1">
          <Flame className="w-4 h-4 fill-current animate-pulse" /> {info.getValue()}
        </div>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Acciones',
      cell: props => (
        <a href={`/admin/students/${props.row.original.id}`} className="btn btn-sm btn-outline btn-info">
          Ver Progreso
        </a>
      ),
    })
  ], []);

  return (
    <DataTable 
      data={students} 
      columns={columns} 
      placeholder="Buscar alumno por nombre, credencial..." 
    />
  );
}
