import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

const TablePagination = ({ table, totalRecords }) => {
  if (!totalRecords) return null;

  const { pageIndex, pageSize } = table.getState().pagination;

  return (
    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Info */}
        <div className="text-sm text-gray-700">
          Showing{" "}
          <span className="font-medium">
            {pageIndex * pageSize + 1}
          </span>{" "}
          to{" "}
          <span className="font-medium">
            {Math.min((pageIndex + 1) * pageSize, totalRecords)}
          </span>{" "}
          of <span className="font-medium">{totalRecords}</span> results
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="p-2 rounded-lg border disabled:opacity-50"
          >
            <ChevronsLeft className="h-5 w-5" />
          </button>

          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="p-2 rounded-lg border disabled:opacity-50"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <span className="px-4 py-2 text-sm font-medium">
            Page {pageIndex + 1} of {table.getPageCount()}
          </span>

          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="p-2 rounded-lg border disabled:opacity-50"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="p-2 rounded-lg border disabled:opacity-50"
          >
            <ChevronsRight className="h-5 w-5" />
          </button>

          <select
            value={pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="ml-4 px-3 py-2 border rounded-lg text-sm"
          >
            {[10, 20, 30, 40, 50].map(size => (
              <option key={size} value={size}>
                Show {size}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default TablePagination;
