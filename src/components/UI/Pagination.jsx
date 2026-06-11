// Pagination.jsx
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({
    table,
    className = ""
}) => {
    const { pagination } = table.getState();
    const totalRows = table.getFilteredRowModel().rows.length;
    const startRow = pagination.pageIndex * pagination.pageSize + 1;
    const endRow = Math.min((pagination.pageIndex + 1) * pagination.pageSize, totalRows);
    const currentPage = pagination.pageIndex + 1;
    const totalPages = table.getPageCount();

    // Don't render if no rows
    if (table.getRowModel().rows.length === 0) {
        return;
    }

    return (
        <div className={`px-6 py-4 border-t border-gray-200 ${className}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-700">
                        Showing {startRow} to {endRow} of {totalRows} results
                    </span>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-sm text-gray-700">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Pagination;