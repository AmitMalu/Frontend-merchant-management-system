import React, { useState, useEffect, useMemo } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    flexRender,
    createColumnHelper
} from '@tanstack/react-table';
import {
    Search,
    Edit3,
    Trash2,
    Shield,
    ChevronDown,
    ChevronUp,
    ChevronLeft,
    ChevronRight,
    Filter,
    RefreshCw,
    AlertTriangle
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../constants/API/axiosInstance';

const AdminManagementTable = ({ onEditPermissions, onRefresh }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [globalFilter, setGlobalFilter] = useState('');
    const [sorting, setSorting] = useState([]);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10
    });

    const columnHelper = createColumnHelper();

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        setLoading(true);
        try {
            const response = await api.get("/admin/admins");
            setData(response.data || []);
        } catch (error) {
            console.error("Failed to fetch admins:", error);
            toast.error("Failed to load administrators");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAdmin = async (userId, adminEmail) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete admin "${adminEmail}"? This action cannot be undone.`
        );

        if (!confirmed) return;

        try {
            await api.delete(`/admin/admins/${userId}`);
            setData((prev) => prev.filter((admin) => admin.id !== userId));
            toast.success("Admin deleted successfully");
        } catch (error) {
            console.error("Failed to delete admin:", error);
            const message = error.response?.data?.message || "Failed to delete admin";
            toast.error(message);
        }
    };

    const getRoleDisplay = (user) => {
        const userType = user.role || localStorage.getItem('userType');

        if (userType === 'SUPER_ADMIN') {
            return { label: 'SUPER ADMIN', color: 'bg-red-100 text-red-800' };
        } else if (userType === 'ADMIN') {
            return { label: 'ADMIN', color: 'bg-blue-100 text-blue-800' };
        } else {
            return { label: 'USER', color: 'bg-gray-100 text-gray-800' };
        }
    };

    const columns = useMemo(() => [
        columnHelper.accessor('email', {
            header: 'Admin Details',
            cell: ({ row }) => (
                <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                                {row.original.email?.charAt(0).toUpperCase() || 'U'}
                            </span>
                        </div>
                    </div>
                    <div>
                        <div className="text-sm font-medium text-gray-900">
                            {row.original.email}
                        </div>
                        <div className="text-sm text-gray-500">
                            ID: {row.original.id}
                        </div>
                    </div>
                </div>
            )
        }),

        columnHelper.accessor('role', {
            header: 'Role',
            cell: ({ row }) => {
                const roleInfo = getRoleDisplay(row.original);
                const isSuperAdmin = row.original.role === 'SUPER_ADMIN';

                return (
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <Shield className="w-4 h-4 text-gray-400" />
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${roleInfo.color}`}>
                                {roleInfo.label}
                            </span>
                        </div>
                        {!isSuperAdmin && (
                            <div className="text-xs text-gray-500">
                                {row.original.permissions?.length || 0} permissions
                            </div>
                        )}
                    </div>
                );
            }
        }),

        columnHelper.accessor('createdAt', {
            header: 'Created',
            cell: ({ row }) => (
                <div className="text-sm text-gray-900">
                    {row.original.createdAt ?
                        new Date(row.original.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        }) :
                        'N/A'
                    }
                </div>
            )
        }),

        columnHelper.accessor('updatedAt', {
            header: 'Last Updated',
            cell: ({ row }) => (
                <div className="text-sm text-gray-900">
                    {row.original.updatedAt ?
                        new Date(row.original.updatedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        }) :
                        'N/A'
                    }
                </div>
            )
        }),

        columnHelper.display({
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const isSuperAdmin = row.original.role === 'SUPER_ADMIN';
                const currentUserEmail = localStorage.getItem('userEmail');
                const isCurrentUser = row.original.email === currentUserEmail;

                if (isSuperAdmin && !isCurrentUser) {
                    return (
                        <div className="flex items-center space-x-1 text-gray-400">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="text-xs">Protected</span>
                        </div>
                    );
                }

                return (
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => onEditPermissions(row.original)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Permissions"
                        >
                            <Edit3 className="w-4 h-4" />
                        </button>
                        
                        {!isSuperAdmin && (
                            <button
                                onClick={() => handleDeleteAdmin(row.original.id, row.original.email)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete Admin"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                );
            }
        })
    ], [onEditPermissions]);

    const table = useReactTable({
        data,
        columns,
        state: {
            globalFilter,
            sorting,
            pagination
        },
        onGlobalFilterChange: setGlobalFilter,
        onSortingChange: setSorting,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        globalFilterFn: 'includesString'
    });

    const handleRefresh = () => {
        fetchAdmins();
        if (onRefresh) onRefresh();
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading administrators...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                    <h3 className="text-lg font-medium text-gray-900">
                        Administrator Management ({data.length})
                    </h3>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <input
                                value={globalFilter ?? ''}
                                onChange={(e) => setGlobalFilter(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Search administrators..."
                            />
                        </div>

                        {/* Refresh */}
                        <button
                            onClick={handleRefresh}
                            className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th
                                        key={header.id}
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                        onClick={header.column.getToggleSortingHandler()}
                                    >
                                        <div className="flex items-center space-x-1">
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                            {header.column.getCanSort() && (
                                                <div className="flex flex-col">
                                                    <ChevronUp
                                                        className={`w-3 h-3 ${header.column.getIsSorted() === 'asc' ? 'text-gray-900' : 'text-gray-400'}`}
                                                    />
                                                    <ChevronDown
                                                        className={`w-3 h-3 -mt-1 ${header.column.getIsSorted() === 'desc' ? 'text-gray-900' : 'text-gray-400'}`}
                                                    />
                                                </div>
                                            )}
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

            {/* Empty State */}
            {table.getRowModel().rows.length === 0 && !loading && (
                <div className="text-center py-12">
                    <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {globalFilter ? 'No administrators found' : 'No administrators yet'}
                    </h3>
                    <p className="text-gray-500">
                        {globalFilter ? 'Try adjusting your search criteria' : 'Create your first administrator to get started'}
                    </p>
                </div>
            )}

            {/* Pagination */}
            {table.getPageCount() > 1 && (
                <div className="px-6 py-4 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
                        <div className="text-sm text-gray-700">
                            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
                            {Math.min(
                                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                                table.getFilteredRowModel().rows.length
                            )}{' '}
                            of {table.getFilteredRowModel().rows.length} results
                        </div>

                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>

                            <span className="text-sm text-gray-700">
                                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                            </span>

                            <button
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminManagementTable;