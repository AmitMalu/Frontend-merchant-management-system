import React, { useState, useEffect } from 'react';
import { Plus, Package, Calendar, User, Building2, X } from 'lucide-react';
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    flexRender,
} from '@tanstack/react-table';
import api from '../../constants/API/axiosInstance';
import { toast } from 'react-toastify';
import ProductDistribution from '../Forms/ProductDistribution';

const ProductDistributionList = () => {
    const [distributions, setDistributions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const [viewDevices, setViewDevices] = useState(null);

    const userType = localStorage.getItem("userType")?.toLowerCase();
    const customerId = localStorage.getItem("customerId");

    const fetchDistributions = async () => {
        setLoading(true);
        try {
            let response;
            if (userType === 'franchise' && customerId) {
                response = await api.get(`/product-distribution/franchise/${customerId}`);
            } else {
                response = await api.get('/product-distribution');
            }
            setDistributions(response.data || []);
        } catch (error) {
            console.error('Error fetching distributions:', error);
            toast.error('Failed to load distribution records');
            setDistributions([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDistributions();
    }, [userType, customerId]);

    const columns = [
        {
            accessorKey: 'id',
            header: 'ID',
            cell: ({ getValue }) => <span className="font-medium">#{getValue()}</span>,
            size: 80,
        },
        {
            accessorKey: 'franchiseName',
            header: 'Franchise',
            cell: ({ getValue }) => (
                <div className="flex items-center space-x-2">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <span>{getValue()}</span>
                </div>
            ),
        },
        {
            accessorKey: 'merchantName',
            header: 'Merchant',
            cell: ({ getValue }) => (
                <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span>{getValue()}</span>
                </div>
            ),
        },
        {
            accessorKey: 'quantity',
            header: 'Quantity',
            cell: ({ getValue }) => (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {getValue()} devices
                </span>
            ),
            size: 100,
        },
        {
            accessorKey: 'distributedBy',
            header: 'Distributed By',
            cell: ({ getValue }) => getValue() || 'N/A',
        },
        {
            accessorKey: 'distributedDate',
            header: 'Distribution Date',
            cell: ({ getValue }) => {
                const value = getValue();
                return value ? (
                    <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{new Date(value).toLocaleDateString()}</span>
                    </div>
                ) : 'N/A';
            },
        },
        {
            accessorKey: 'receivedDate',
            header: 'Received Date',
            cell: ({ getValue }) => {
                const value = getValue();
                return value ? (
                    <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{new Date(value).toLocaleDateString()}</span>
                    </div>
                ) : (
                    <span className="text-yellow-600 text-sm">Pending</span>
                );
            },
        },
        {
            accessorKey: 'serialNumbers',
            header: 'Devices',
            cell: ({ getValue, row }) => {
                const devices = getValue() || [];
                return (
                    <button
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        onClick={() => setViewDevices({ devices, id: row.original.id })}
                    >
                        View ({devices.length})
                    </button>
                );
            },
        },
    ];

    const visibleColumns = columns.filter(col => {
        if (userType === 'franchise' && col.accessorKey === 'franchiseName') {
            return false;
        }
        return true;
    });

    const table = useReactTable({
        data: distributions,
        columns: visibleColumns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        state: {
            globalFilter,
        },
        onGlobalFilterChange: setGlobalFilter,
        initialState: {
            pagination: {
                pageSize: 10,
            },
        },
    });

    const handleModalClose = () => {
        setIsModalOpen(false);
        fetchDistributions();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
          <div className="min-h-screen bg-gray-50 pr-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="p-2  rounded-lg">
                            <Package className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Distribution Records</h1>
                            <p className="text-gray-600">
                                {userType === 'franchise'
                                    ? 'View your product distribution history'
                                    : 'Manage and track product distributions'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        <span>New Distribution</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-white rounded-lg shadow-sm  p-4">
                    <div className="text-sm text-gray-600">Total Distributions</div>
                    <div className="text-2xl font-bold text-gray-900 mt-1">{distributions.length}</div>
                </div>
                <div className="bg-white rounded-lg shadow-sm  p-4">
                    <div className="text-sm text-gray-600">Total Devices</div>
                    <div className="text-2xl font-bold text-gray-900 mt-1">
                        {distributions.reduce((sum, d) => sum + (d.quantity || 0), 0)}
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm  p-4">
                    <div className="text-sm text-gray-600">Pending Receipts</div>
                    <div className="text-2xl font-bold text-yellow-600 mt-1">
                        {distributions.filter(d => !d.receivedDate).length}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm ">
                <div className="p-4 ">
                    <input
                        type="text"
                        placeholder="Search distributions..."
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        className=" px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <th
                                            key={header.id}
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                            onClick={header.column.getToggleSortingHandler()}
                                        >
                                            <div className="flex items-center space-x-1">
                                                {flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                                <span className="text-gray-400">
                                                    {{
                                                        asc: ' ↑',
                                                        desc: ' ↓',
                                                    }[header.column.getIsSorted()] ?? ''}
                                                </span>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {table.getRowModel().rows.length === 0 ? (
                                <tr>
                                    <td colSpan={visibleColumns.length} className="px-6 py-12 text-center">
                                        <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">No distribution records found</p>
                                    </td>
                                </tr>
                            ) : (
                                table.getRowModel().rows.map(row => (
                                    <tr key={row.id} className="hover:bg-gray-50">
                                        {row.getVisibleCells().map(cell => (
                                            <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="px-6 py-4 flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                        Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
                        {Math.min(
                            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                            distributions.length
                        )}{' '}
                        of {distributions.length} results
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                            className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-gray-700">
                            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                        </span>
                        <button
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* Form Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={handleModalClose} />
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="relative bg-gray-50 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
                            <button
                                onClick={handleModalClose}
                                className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-600" />
                            </button>
                            <div className="p-6">
                                <ProductDistribution onSuccess={handleModalClose} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* View Devices Modal */}
            {viewDevices && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setViewDevices(null)} />
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-3xl">
                            <div className="flex items-center justify-between p-6 border-b">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Distribution #{viewDevices.id} - Devices
                                </h3>
                                <button
                                    onClick={() => setViewDevices(null)}
                                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>
                            <div className="p-6 max-h-96 overflow-y-auto">
                                <div className="space-y-3">
                                    {viewDevices.devices.map((device, index) => (
                                        <div key={device.id || index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <span className="text-xs text-gray-500">MID</span>
                                                    <p className="text-sm font-medium text-gray-900">{device.mid || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <span className="text-xs text-gray-500">TID</span>
                                                    <p className="text-sm font-medium text-gray-900">{device.tid || 'N/A'}</p>
                                                </div>
                                                {device.sid && (
                                                    <div>
                                                        <span className="text-xs text-gray-500">SID</span>
                                                        <p className="text-sm font-medium text-gray-900">{device.sid}</p>
                                                    </div>
                                                )}
                                                {device.vpaid && (
                                                    <div>
                                                        <span className="text-xs text-gray-500">VPA ID</span>
                                                        <p className="text-sm font-medium text-gray-900">{device.vpaid}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDistributionList;