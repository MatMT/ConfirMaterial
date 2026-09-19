import React, { useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight, 
  Search, 
  X 
} from 'lucide-react';

export interface FilterChipOption {
  id: string;
  label: string;
  count?: number;
}

interface DataTableProps<T> {
  data: T[];
  columns: any[];
  placeholder?: string;
  renderMobileCard?: (item: T) => React.ReactNode;
  filterChips?: FilterChipOption[];
  activeChip?: string;
  onChipChange?: (chipId: string) => void;
}

export default function DataTable<T>({ 
  data, 
  columns, 
  placeholder = "Buscar por nombre o carné...",
  renderMobileCard,
  filterChips,
  activeChip,
  onChipChange
}: DataTableProps<T>) {
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
      sorting,
    },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
  });

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Search Bar & Quick Filter Chips */}
      <div className="flex flex-col gap-3">
        {/* Search Bar */}
        <div className="flex justify-end w-full">
          <div className="relative w-full sm:max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              className="input input-bordered w-full pl-10 pr-9 text-sm rounded-xl bg-base-100 border-base-300 focus:border-primary focus:outline-none shadow-xs text-slate-800 placeholder:text-slate-400"
              placeholder={placeholder}
              value={globalFilter ?? ''}
              onChange={e => setGlobalFilter(e.target.value)}
              aria-label="Buscar alumnos"
            />
            {globalFilter && (
              <button
                type="button"
                onClick={() => setGlobalFilter('')}
                aria-label="Limpiar búsqueda"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Fila de chips horizontales deslizables para filtrado rápido */}
        {filterChips && filterChips.length > 0 && (
          <div 
            className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar scroll-smooth"
            role="tablist"
            aria-label="Filtros rápidos"
          >
            {filterChips.map(chip => {
              const isActive = activeChip === chip.id;
              return (
                <button
                  key={chip.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => onChipChange?.(chip.id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all border select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 ${
                    isActive
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'bg-base-200/80 text-base-content/80 border-base-300 hover:bg-base-300'
                  }`}
                >
                  <span>{chip.label}</span>
                  {chip.count !== undefined && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isActive ? 'bg-white/20 text-white' : 'bg-base-300 text-base-content/70'
                    }`}>
                      {chip.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Table for Desktop */}
      <div className="hidden md:block overflow-x-auto bg-base-100 rounded-2xl shadow-sm border border-base-200">
        <table className="table table-zebra w-full">
          <thead className="bg-base-200/70 text-base-content/80 text-xs uppercase tracking-wider font-bold">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th 
                    key={header.id} 
                    className="cursor-pointer select-none py-3.5 px-4" 
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-2">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {{
                        asc: <ChevronUp className="w-4 h-4 text-primary" />,
                        desc: <ChevronDown className="w-4 h-4 text-primary" />,
                      }[header.column.getIsSorted()] ?? null}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map(row => (
                <tr key={row.id} className="hover:bg-base-200/40 transition-colors">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="py-3 px-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="text-center py-12 text-base-content/50">
                  No hay datos para mostrar con los filtros aplicados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Cards for Mobile */}
      <div className="grid grid-cols-1 gap-2.5 md:hidden">
        {table.getRowModel().rows.length > 0 ? (
          table.getRowModel().rows.map(row => {
            if (renderMobileCard) {
              return (
                <React.Fragment key={row.id}>
                  {renderMobileCard(row.original)}
                </React.Fragment>
              );
            }

            // Fallback generic card if renderMobileCard is not provided
            return (
              <div key={row.id} className="bg-base-100 p-4 rounded-xl border border-base-200 shadow-xs flex flex-col gap-2.5">
                {row.getVisibleCells().map(cell => {
                  const headerText = typeof cell.column.columnDef.header === 'string' 
                    ? cell.column.columnDef.header 
                    : cell.column.id.toUpperCase();
                    
                  return (
                    <div key={cell.id} className="flex justify-between items-center border-b border-base-200/50 pb-2 last:border-0 last:pb-0 gap-2">
                      <span className="text-xs font-semibold text-base-content/60">
                        {headerText}
                      </span>
                      <div className="text-right">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })
        ) : (
          <div className="text-center py-10 text-base-content/50 bg-base-100 rounded-2xl border border-base-200 text-sm">
            No se encontraron alumnos con los criterios seleccionados.
          </div>
        )}
      </div>

      {/* Accessible Pagination (WCAG AA) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 pt-2 pb-8 sm:pb-2">
        <div className="text-xs sm:text-sm font-medium text-slate-600">
          Página <span className="font-bold text-slate-800">{table.getState().pagination.pageIndex + 1}</span> de <span className="font-bold text-slate-800">{table.getPageCount() || 1}</span>
          {data.length > 0 && (
            <span className="text-slate-500 ml-1">
              ({data.length} {data.length === 1 ? 'resultado' : 'resultados'})
            </span>
          )}
        </div>
        <nav aria-label="Navegación de páginas" className="flex items-center gap-1.5">
          <button
            type="button"
            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-colors shadow-xs disabled:opacity-30 disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            aria-label="Ir a la primera página"
            title="Primera página"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-colors shadow-xs disabled:opacity-30 disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Ir a la página anterior"
            title="Página anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-colors shadow-xs disabled:opacity-30 disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Ir a la página siguiente"
            title="Página siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-colors shadow-xs disabled:opacity-30 disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            aria-label="Ir a la última página"
            title="Última página"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </nav>
      </div>
    </div>
  );
}
