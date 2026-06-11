import React, { useState, useEffect, useMemo } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    flexRender,
    createColumnHelper,
} from '@tanstack/react-table';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../constants/API/axiosInstance';
import UniversalExportButtons from './UniversalExportButtons';

const VendorReports = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [globalFilter, setGlobalFilter] = useState('');
    const [sorting, setSorting] = useState([]);

    const columnHelper = createColumnHelper();

    // Transform vendor data for flat table display
    const flattenedData = useMemo(() => {
        const flattened = [];
        data.forEach(vendor => {
            
                
                    flattened.push({
                        vendorName: vendor.vendorName,
                        
                        totalDevices: vendor.totalDevices,
                        
                        totalProducts: vendor.totalProducts,

                        agreementStartDate: vendor.agreementStartDate,

                        agreementEndDate: vendor.agreementEndDate,

                        creditPeriodDays: vendor.creditPeriodDays
                        
                    });
        
            }
        );
        return flattened;
    }, [data]);

    // Export configurations - no IDs
    const exportConfig = {
        columns: {
            headers: ['Vendor Name', 'Total Products', 'Total Devices','Agreement Start Date','Agreement End Date','Credit Period Days'],
            keys: ['vendorName', 'totalProducts', 'totalDevices','agreementStartDate,','agreementEndDate','creditPeriodDays'],
            widths: [30, 30, 20, 20, 20, 20],
            styles: {
                0: { cellWidth: 60 },
                1: { cellWidth: 60 },
                2: { cellWidth: 30, halign: 'center' },
                3: { cellWidth: 60 },
                4: { cellWidth: 60 },
                5: { cellWidth: 60 }
            }
        },
        excelTransform: (data) => flattenedData.map(item => ({
            'Vendor Name': item.vendorName,
            'Total Products': item.totalProducts,
            'Total Devices': item.totalDevices,
            'Agreement Start Date': item.agreementStartDate,
            'Agreement End Date': item.agreementEndDate,
            'Credit Period': item.creditPeriodDays
        })),
        pdfTransform: (data) => flattenedData
    };

    const columns = useMemo(() => [
        columnHelper.accessor('vendorName', {
            header: 'Vendor Name',
            cell: ({ row }) => {
                
                return (
                    <div className="font-medium text-gray-900">
                        {row.original.vendorName}
                    </div>
                );
            },
        }),
        columnHelper.accessor('totalProducts', {
            header: 'Total Products',
            cell: ({ row }) => {
                
                return (
                    <div className="text-center text-gray-700">
                        {row.original.totalProducts}
                    </div>
                );
            },
        }),
       
        columnHelper.accessor('totalDevices', {
            header: 'Total Devices',
            cell: ({ row }) => (
                <div className="text-center text-gray-700 ">
                    {row.original.totalDevices}
                </div>
            ),
        }),
        columnHelper.accessor('agreementStartDate', {
            header: 'Agreement Start Date',
            cell: ({ row }) => (
                <div className="text-center text-gray-700 ">
                    {row.original.agreementStartDate}
                </div>
            ),
        }),
        columnHelper.accessor('agreementEndDate', {
            header: 'Agreement end Date',
            cell: ({ row }) => (
                <div className="text-center text-gray-700 ">
                    {row.original.agreementEndDate}
                </div>
            ),
        }),
        columnHelper.accessor('creditPeriodDays', {
            header: 'credit Period Days',
            cell: ({ row }) => (
                <div className="text-center text-gray-700 ">
                    {row.original.creditPeriodDays}
                </div>
            ),
        })
        
       
    ], [columnHelper]);

    const table = useReactTable({
        data: flattenedData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
            globalFilter,
        },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        initialState: {
            pagination: {
                pageSize: 10,
            },
        },
    });

    useEffect(() => {
        const fetchReports = async () => {
            try {
                setLoading(true);
                const response = await api.get('/stats/vendor-reports');
                // Handle the response structure with vendors array
                setData(response.data.vendors || []);
            } catch (error) {
                console.error('Error fetching vendor reports:', error);
                setData([]); // Set empty array on error
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }
    const totalProducts = data.reduce((sum, v) => sum + (v.totalProducts || 0), 0);
    const totalDevices = data.reduce((sum, v) => sum + (v.totalDevices || 0), 0);

    

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Vendor Reports</h1>
                    <p className="text-sm text-gray-600">Overview of vendor products and device distribution</p>
                </div>
                <UniversalExportButtons
                    data={flattenedData}
                    filename="vendor-reports"
                    title="Vendor Reports"
                    {...exportConfig}
                />
            </div>


            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="text-sm font-medium text-gray-500">Total Vendors</div>
                    <div className="text-2xl font-bold text-gray-900">{data.length}</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="text-sm font-medium text-gray-500">Total Products</div>
                    <div className="text-2xl font-bold text-gray-900">{totalProducts}</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="text-sm font-medium text-gray-500">Total Devices</div>
                    <div className="text-2xl font-bold text-gray-900">{totalDevices}</div>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                    value={globalFilter ?? ''}
                    onChange={e => setGlobalFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Search vendors..."
                />
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <th
                                            key={header.id}
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                            onClick={header.column.getToggleSortingHandler()}
                                        >
                                            <div className="flex items-center gap-2">
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(header.column.columnDef.header, header.getContext())}
                                                {{
                                                    asc: <span className="text-indigo-600">↑</span>,
                                                    desc: <span className="text-indigo-600">↓</span>,
                                                }[header.column.getIsSorted()] ?? null}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {table.getRowModel().rows.map((row, index) => {
                                const nextRow = table.getRowModel().rows[index + 1];
                                const isLastProductOfVendor = !nextRow || nextRow.original.vendorName !== row.original.vendorName;

                                return (
                                    <tr key={row.id} className={`hover:bg-gray-50 transition-colors ${isLastProductOfVendor ? 'border-b-2 border-gray-300' : ''}`}>
                                        {row.getVisibleCells().map((cell, cellIndex) => {
                                            const shouldShowCell = cell.getValue() !== null;
                                            let rowSpan = 1;

                                            // Calculate rowspan for vendor columns (0, 1, 4)
                                            if (row.original.isFirstProduct && (cellIndex === 0 || cellIndex === 1 || cellIndex === 4)) {
                                                rowSpan = row.original.productCount || 1;
                                            }

                                            if (!shouldShowCell && (cellIndex === 0 || cellIndex === 1 || cellIndex === 4)) {
                                                return null;
                                            }

                                            return (
                                                <td
                                                    key={cell.id}
                                                    className="px-6 py-4 whitespace-nowrap border-r border-gray-200 last:border-r-0"
                                                    rowSpan={rowSpan}
                                                    style={rowSpan > 1 ? { verticalAlign: 'top' } : {}}
                                                >
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
                    <div className="text-sm text-gray-700">
                        Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
                        {Math.min(
                            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                            table.getFilteredRowModel().rows.length
                        )}{' '}
                        of {table.getFilteredRowModel().rows.length} results
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                            className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Previous
                        </button>
                        <span className="text-sm text-gray-700">
                            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                        </span>
                        <button
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            
        </div>
    );
};

export default VendorReports;