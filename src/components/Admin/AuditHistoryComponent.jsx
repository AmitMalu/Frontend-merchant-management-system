import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Clock, User, X, ChevronDown, ChevronRight } from 'lucide-react';
import {
    useReactTable,
    getCoreRowModel,
    getExpandedRowModel,
    flexRender,
} from '@tanstack/react-table';
import api from '../../constants/API/axiosInstance';

const AuditHistoryComponent = () => {
    const [historyData, setHistoryData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [isFirst, setIsFirst] = useState(true);
    const [isLast, setIsLast] = useState(false);
    const PAGE_SIZE = 20;

    useEffect(() => {
        fetchHistory();
    }, [currentPage]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            let url = `/history?page=${currentPage}&size=${PAGE_SIZE}`;
            if (startDate && endDate) {
                url += `&startDate=${startDate}T00:00:00&endDate=${endDate}T23:59:59`;
            }
            const response = await api.get(url);
            const data = response.data;
            setHistoryData(data.content);
            setTotalElements(data.totalElements);
            setTotalPages(data.totalPages);
            setIsFirst(data.first);
            setIsLast(data.last);
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilter = () => {
        if (!startDate || !endDate) {
            alert('Please select both dates');
            return;
        }
        setCurrentPage(0);
        fetchHistory();
    };

    const clearFilters = () => {
        setStartDate('');
        setEndDate('');
        setCurrentPage(0);
        setTimeout(fetchHistory, 0);
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getChangeTypeBadge = (fieldName, oldValue, newValue) => {
        if (fieldName === 'RECORD_ADDED') return { label: 'Added', color: 'bg-green-100 text-green-700' };
        if (fieldName === 'RECORD_DELETED') return { label: 'Deleted', color: 'bg-red-100 text-red-700' };
        if (oldValue === null) return { label: 'Added', color: 'bg-green-100 text-green-700' };
        if (newValue === null) return { label: 'Deleted', color: 'bg-red-100 text-red-700' };
        return { label: 'Modified', color: 'bg-blue-100 text-blue-700' };
    };

    const columns = useMemo(
        () => [
            {
                id: 'expander',
                header: () => null,
                cell: ({ row }) => {
                    const hasDetails = row.original.entityDetails && Object.keys(row.original.entityDetails).length > 0;
                    const hasParent = row.original.parentEntityName;
                    if (!hasDetails && !hasParent) return null;

                    return (
                        <button
                            onClick={row.getToggleExpandedHandler()}
                            className="p-1 hover:bg-gray-100 rounded"
                        >
                            {row.getIsExpanded() ? (
                                <ChevronDown className="w-4 h-4 text-gray-600" />
                            ) : (
                                <ChevronRight className="w-4 h-4 text-gray-600" />
                            )}
                        </button>
                    );
                },
                size: 40,
            },
            {
                accessorKey: 'changedAt',
                header: 'Time',
                cell: ({ getValue }) => (
                    <div className="flex items-center gap-1 text-gray-600">
                        <Clock className="w-3 h-3" />
                        <span className="text-xs">{formatDateTime(getValue())}</span>
                    </div>
                ),
                size: 150,
            },
            {
                accessorKey: 'entityName',
                header: 'Entity',
                cell: ({ getValue, row }) => (
                    <div>
                        <div className="font-medium text-gray-900">{getValue()}</div>
                        {row.original.parentEntityName && (
                            <div className="text-xs text-gray-500">
                                in {row.original.parentEntityName}
                            </div>
                        )}
                    </div>
                ),
                size: 150,
            },
            {
                accessorKey: 'fieldName',
                header: 'Field',
                cell: ({ getValue }) => (
                    <span className="font-medium text-gray-700">{getValue()}</span>
                ),
                size: 120,
            },
            {
                id: 'change',
                header: 'Change',
                cell: ({ row }) => {
                    const badge = getChangeTypeBadge(
                        row.original.fieldName,
                        row.original.oldValue,
                        row.original.newValue
                    );
                    return (
                        <div>
                            <span className={`text-xs px-2 py-1 rounded-full ${badge.color}`}>
                                {badge.label}
                            </span>
                            {badge.label === 'Modified' && (
                                <div className="mt-1 text-xs">
                                    <span className="text-red-600 font-mono">{row.original.oldValue}</span>
                                    {' → '}
                                    <span className="text-green-600 font-mono">{row.original.newValue}</span>
                                </div>
                            )}
                        </div>
                    );
                },
                size: 200,
            },
            {
                accessorKey: 'changedBy',
                header: 'User',
                cell: ({ getValue }) => (
                    <div className="flex items-center gap-1 text-gray-600">
                        <User className="w-3 h-3" />
                        <span className="text-xs">{getValue()}</span>
                    </div>
                ),
                size: 150,
            },
        ],
        []
    );

    const table = useReactTable({
        data: historyData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        getRowCanExpand: (row) => {
            const hasDetails = row.original.entityDetails && Object.keys(row.original.entityDetails).length > 0;
            const hasParent = row.original.parentEntityName;
            return hasDetails || hasParent;
        },
    });

    const renderDetailSection = (title, details) => {
        if (!details || Object.keys(details).length === 0) return null;

        return (
            <div className="mb-2">
                <div className="text-xs font-semibold text-gray-700 mb-2">{title}</div>
                <div className="grid grid-cols-2 md:grid-cols-3 ">
                    {Object.entries(details).map(([key, value]) => (
                        <div key={key} className="text-xs">
                            <span className="text-gray-500">{key}:</span>{' '}
                            <span className="text-gray-800 font-medium">{value?.toString() || 'N/A'}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-8xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-xl font-bold text-gray-900">Audit History</h1>
                        <span className="text-sm text-gray-500">{totalElements} records</span>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-3 items-end">
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-3 py-2 text-sm shadow-xl rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-600 mb-1">End Date</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-3 py-2 text-sm shadow-xl rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <button
                            onClick={handleFilter}
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                        >
                            <Calendar className="w-4 h-4 inline mr-1" />
                            Filter
                        </button>
                        {(startDate || endDate) && (
                            <button
                                onClick={clearFilters}
                                className="px-3 py-2 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 "></div>
                    </div>
                ) : historyData.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
                        No records found
                    </div>
                ) : (
                    <>
                        {/* Table */}
                        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50">
                                        {table.getHeaderGroups().map((headerGroup) => (
                                            <tr key={headerGroup.id}>
                                                {headerGroup.headers.map((header) => (
                                                    <th
                                                        key={header.id}
                                                        className="px-4 py-3 text-left font-medium text-gray-600"
                                                        style={{ width: header.getSize() }}
                                                    >
                                                        {header.isPlaceholder
                                                            ? null
                                                            : flexRender(
                                                                header.column.columnDef.header,
                                                                header.getContext()
                                                            )}
                                                    </th>
                                                ))}
                                            </tr>
                                        ))}
                                    </thead>
                                    <tbody className="">
                                        {table.getRowModel().rows.map((row) => (
                                            <React.Fragment key={row.id}>
                                                <tr className="hover:bg-gray-50">
                                                    {row.getVisibleCells().map((cell) => (
                                                        <td key={cell.id} className="px-4 py-3">
                                                            {flexRender(
                                                                cell.column.columnDef.cell,
                                                                cell.getContext()
                                                            )}
                                                        </td>
                                                    ))}
                                                </tr>
                                                {row.getIsExpanded() && (
                                                    <tr>
                                                        <td colSpan={columns.length} className="px-4 py-4 bg-gray-50">
                                                            <div className="ml-8">
                                                                {renderDetailSection('Entity Details', row.original.entityDetails)}
                                                                {row.original.parentEntityName && renderDetailSection(
                                                                    `Parent: ${row.original.parentEntityName}`,
                                                                    row.original.parentEntityDetails
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Pagination */}
                        {totalPages >= 1 && (
                            <div className="bg-white rounded-lg shadow-sm p-3 mt-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">
                                        Showing {currentPage * PAGE_SIZE + 1} - {Math.min((currentPage + 1) * PAGE_SIZE, totalElements)} of {totalElements}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setCurrentPage(0)}
                                            disabled={isFirst}
                                                    className="px-3 py-1  rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-xs"
                                        >
                                            First
                                        </button>
                                        <button
                                            onClick={() => setCurrentPage(currentPage - 1)}
                                            disabled={isFirst}
                                                    className="px-3 py-1   rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                        >
                                            Previous
                                        </button>
                                        <span className="text-gray-600">
                                            Page {currentPage + 1} of {totalPages}
                                        </span>
                                        <button
                                            onClick={() => setCurrentPage(currentPage + 1)}
                                            disabled={isLast}
                                                    className="px-3 py-1  rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                        >
                                            Next
                                        </button>
                                        <button
                                            onClick={() => setCurrentPage(totalPages - 1)}
                                            disabled={isLast}
                                            className="px-3 py-1   rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-xs"
                                        >
                                            Last
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default AuditHistoryComponent;