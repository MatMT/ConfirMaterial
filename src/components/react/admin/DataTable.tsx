import React, { useState } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search } from 'lucide-react';

export default function DataTable({ data, columns, placeholder = "Buscar..." }) {
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
      {/* Search Bar */}
      <div className="flex justify-end">
        <label className="input input-bordered flex items-center gap-2 max-w-xs w-full shadow-sm">
          <Search className="w-4 h-4 opacity-50" />
          <input
            type="text"
            className="grow"
            placeholder={placeholder}
            value={globalFilter ?? ''}
            onChange={e => setGlobalFilter(e.target.value)}
          />
        </label>
      </div>

      {/* Table for Desktop */}
      <div className="hidden md:block overflow-x-auto bg-base-100 rounded-xl shadow-md border border-base-200">
        <table className="table table-zebra w-full">
          <thead className="bg-base-300 text-base-content text-sm">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id} className="cursor-pointer select-none" onClick={header.column.getToggleSortingHandler()}>
                    <div className="flex items-center gap-2">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {{
                        asc: <ChevronUp className="w-4 h-4" />,
                        desc: <ChevronDown className="w-4 h-4" />,
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
                <tr key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="text-center py-8 text-base-content/50">
                  No hay datos para mostrar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Cards for Mobile */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {table.getRowModel().rows.length > 0 ? (
          table.getRowModel().rows.map(row => (
            <div key={row.id} className="bg-base-100 p-4 rounded-xl border border-base-200 shadow-sm flex flex-col gap-3">
              {row.getVisibleCells().map(cell => {
                // Try to get header text, fallback to ID if it's a function or complex component
                const headerText = typeof cell.column.columnDef.header === 'string' 
                  ? cell.column.columnDef.header 
                  : cell.column.id.toUpperCase();
                  
                return (
                  <div key={cell.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-base-200/50 pb-2 last:border-0 last:pb-0 gap-1">
                    <span className="text-xs font-bold text-base-content/50 uppercase tracking-wider">
                      {headerText}
                    </span>
                    <div className="text-left sm:text-right">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-base-content/50 bg-base-100 rounded-xl border border-base-200">
            No hay datos para mostrar.
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-base-content/70">
          Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount() || 1}
        </div>
        <div className="join shadow-sm">
          <button
            className="join-item btn btn-sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            className="join-item btn btn-sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            className="join-item btn btn-sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            className="join-item btn btn-sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
