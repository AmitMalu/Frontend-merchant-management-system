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

import { Search, ChevronLeft, ChevronRight, TrendingUp, User, User2Icon, UserCheck, UserCircle, UserMinus, UserSquare, Building, Building2, Store, LucideWashingMachine, Calculator, Package } from 'lucide-react';
import api from '../../constants/API/axiosInstance';
import UniversalExportButtons from './UniversalExportButtons';

const FranchiseReports = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [globalFilter, setGlobalFilter] = useState('');
    const [sorting, setSorting] = useState([]);

    const columnHelper = createColumnHelper();

    // Export configuration
    const exportConfig = {
        columns: {
            headers: ['Franchise Name', 'Total Merchants', 'Wallet Balance', 'Total Devices', 'Total Products','Contact Person','Contact Number','Contact Email','GST Number','PAN','Registration Number'],
            keys: ['franchiseName', 'totalMerchants', 'walletBalance', 'totalDevices', 'totalProducts','contactPersonName','contactPersonPhoneNumber','contactPersonEmail','gstNumber','panNumber','registrationNumber'],
            widths: [20, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15],
            styles: {
                0: { cellWidth: 50 },
                1: { cellWidth: 30, halign: 'center' },
                2: { cellWidth: 30, halign: 'center' },
                3: { cellWidth: 30, halign: 'center' },
                4: { cellWidth: 30, halign: 'center' },
                5: { cellWidth: 30, halign: 'center' },
                6: { cellWidth: 30, halign: 'center' },
                7: { cellWidth: 30, halign: 'center' },
                8: { cellWidth: 30, halign: 'center' },
                9: { cellWidth: 30, halign: 'center' },
                10: { cellWidth: 30, halign: 'center' }
            }
        },
        excelTransform: (data) => data.map(item => ({
            'Franchise Name': item.franchiseName,
            'Total Merchants': item.totalMerchants,
            'Wallet Balance': item.walletBalance || 0,
            'Total Devices': item.totalDevices,
            'Total Products': item.totalProducts,
            'Contact Person': item.contactPersonName,
            'Contact Number': item.contactPersonPhoneNumber,
            'Contact Email':item.contactPersonEmail,
            'GST Number':item.gstNumber,
            'PAN':item.panNumber,
            'Registration Number':item.registrationNumber 

        })),
        pdfTransform: (data) => data.map(item => ({
            franchiseName: item.franchiseName,
            totalMerchants: item.totalMerchants,
            walletBalance: item.walletBalance || 0,
            totalDevices: item.totalDevices,
            totalProducts: item.totalProducts,
            contactPerson: item.contactPersonName,
            contactPersonPhoneNumber: item.contactPersonPhoneNumber,
            contactPersonEmail: item.contactPersonEmail,
            gstNumber: item.gstNumber,
            panNumber: item.panNumber,
            registrationNumber: item.registrationNumber
        }))
    };

    const columns = useMemo(() => [
        columnHelper.accessor('franchiseName', {
            header: 'Franchise Name',
            cell: info => (
                <div className="font-medium text-gray-900">
                    {info.getValue()}
                </div>
            ),
        }),
        columnHelper.accessor('totalMerchants', {
            header: 'Total Merchants',
            cell: info => (
                <div className="text-center text-gray-700">
                    {info.getValue()}
                </div>
            ),
        }),
        columnHelper.accessor('walletBalance', {
            header: 'Wallet Balance',
            cell: info => (
                <div className="text-center text-gray-700">
                    ₹{(info.getValue() || 0).toLocaleString()}
                </div>
            ),
        }),
        columnHelper.accessor('totalDevices', {
            header: 'Total Devices',
            cell: info => (
                <div className="text-center text-gray-700">
                    {info.getValue()}
                </div>
            ),
        }),
        columnHelper.accessor('totalProducts', {
            header: 'Total Products',
            cell: info => (
                <div className="text-center text-gray-700">
                    {info.getValue()}
                </div>
            ),
        }),

        columnHelper.accessor('contactPersonName', {
            header: 'Contact Person',
            cell: info => (
                <div className=" text-gray-900">
                    {info.getValue()}
                </div>
            ),
        }),
        columnHelper.accessor('contactPersonPhoneNumber', {
            header: 'Contact Number',
            cell: info => (
                <div className=" text-gray-900">
                    {info.getValue()}
                </div>
            ),
        }),
        columnHelper.accessor('contactPersonEmail', {
            header: 'Contact Email',
            cell: info => (
                <div className=" text-gray-900">
                    {info.getValue()}
                </div>
            ),
        }),
        columnHelper.accessor('gstNumber', {
            header: 'GST Number',
            cell: info => (
                <div className=" text-gray-900">
                    {info.getValue()}
                </div>
            ),
        }),
        columnHelper.accessor('panNumber', {
            header: 'PAN Number',
            cell: info => (
                <div className=" text-gray-900">
                    {info.getValue()}
                </div>
            ),
        }),
        columnHelper.accessor('registrationNumber', {
            header: 'registrations Number',
            cell: info => (
                <div className=" text-gray-900">
                    {info.getValue()}
                </div>
            ),
        })
    
    ], [columnHelper]);

    const table = useReactTable({
        data,
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
                const response = await api.get('/stats/franchise-reports');
                setData(response.data);
            } catch (error) {
                console.error('Error fetching franchise reports:', error);
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Franchise Reports</h1>
                    <p className="text-sm text-gray-600">Overview of franchise performance metrics</p>
                </div>
                <UniversalExportButtons
                    data={data}
                    filename="franchise-reports"
                    title="Franchise Reports"
                    {...exportConfig}
                />
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="text-sm font-medium text-gray-500">Total Franchises</div>
                    <div className="text-2xl font-bold text-gray-900">{data.length}</div>
                    {/* <Building className="ml-55 -mt-9 w-8 h-8 text-gray-400" /> */}
                </div>
                <div className="bg-gradient-to-r from-red-50 to-red-100 p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="text-sm font-medium text-gray-500">Total Merchants</div>
                    <div className="text-2xl font-bold text-gray-900">
                        {data.reduce((sum, item) => sum + item.totalMerchants, 0)}
                    {/* <Store className="ml-55 -mt-9 w-8 h-8 text-gray-400"/> */}
                    </div>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="text-sm font-medium text-gray-500">Total Devices</div>
                    <div className="text-2xl font-bold text-gray-900">
                        {data.reduce((sum, item) => sum + item.totalDevices, 0)}
                    {/* <Calculator className="ml-55 -mt-9 w-8 h-8 text-gray-400"/> */}
                    </div>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="text-sm font-medium text-gray-500">Total Products</div>
                    <div className="text-2xl font-bold text-gray-900">
                        {data.reduce((sum, item) => sum + item.totalProducts, 0)}
                    {/* <Package className="ml-55 -mt-9 w-8 h-8 text-gray-400"/> */}

                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                    value={globalFilter ?? ''}
                    onChange={e => setGlobalFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Search franchises..."
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
                            {table.getRowModel().rows.map(row => (
                                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))}
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

export default FranchiseReports;