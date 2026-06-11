// DataTable.jsx
import React from 'react';
import { flexRender } from '@tanstack/react-table';

const Table = ({
    table,
    columns,
    emptyState = {
        icon: null,
        message: "No data found",
        action: null
    },
    sortable = true,
    hoverable = true,
    className = ""
}) => {
    return (
        <div className={`overflow-x-auto ${className}`}>
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <th
                                    key={header.id}
                                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${sortable ? 'cursor-pointer hover:bg-gray-100 transition-colors' : ''
                                        }`}
                                    onClick={sortable ? header.column.getToggleSortingHandler() : undefined}
                                >
                                    <div className="flex items-center space-x-1">
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                        {sortable && (
                                            <>
                                                {header.column.getIsSorted() === 'asc' && ' 🔼'}
                                                {header.column.getIsSorted() === 'desc' && ' 🔽'}
                                            </>
                                        )}
                                    </div>

                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {table.getRowModel().rows.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} className="px-6 py-12 text-center">
                                <div className="flex flex-col items-center space-y-2">
                                    {emptyState.icon && (
                                        <div className="h-12 w-12 text-gray-400">
                                            {emptyState.icon}
                                        </div>
                                    )}
                                    <p className="text-gray-500">{emptyState.message}</p>
                                    {emptyState.action}
                                </div>
                            </td>
                        </tr>
                    ) : (
                        table.getRowModel().rows.map(row => (
                            <tr
                                key={row.id}
                                className={hoverable ? 'hover:bg-gray-50 transition-colors' : ''}
                            >
                                {row.getVisibleCells().map(cell => (
                                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default Table;