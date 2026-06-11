import React, { useState, useEffect } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    flexRender,
} from '@tanstack/react-table';
import { Package, CheckCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../../constants/API/axiosInstance'; 
import { toast } from 'react-toastify';

const MerchantDistributionHistory = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [markingReceived, setMarkingReceived] = useState({});
    const [sorting, setSorting] = useState([
        { id: 'receivedDate', desc: false } // null values first
    ]);

    const customerId = localStorage.getItem('customerId');
    const fetchDistributionHistory = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/product-distribution/merchant/${customerId}`);

            // Sort data: null receivedDate first, then by date
            const sortedData = response.data.sort((a, b) => {
                if (a.receivedDate === null && b.receivedDate !== null) return -1;
                if (a.receivedDate !== null && b.receivedDate === null) return 1;
                if (a.receivedDate === null && b.receivedDate === null) return 0;
                return new Date(b.receivedDate) - new Date(a.receivedDate);
            });

            setData(sortedData);
        } catch (error) {
            console.error('Error fetching distribution history:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch distribution history
    useEffect(() => {
      
        if (customerId) {
            fetchDistributionHistory();
        }
    }, [customerId]);

    // Mark as received
    const handleMarkReceived = async (distributionId) => {
        try {
            setMarkingReceived(prev => ({ ...prev, [distributionId]: true }));

            await api.patch(`/product-distribution/${distributionId}/mark-received`);
            fetchDistributionHistory()
            // Update local state
            // setData(prevData =>
            //     prevData.map(item =>
            //         item.id === distributionId
            //             ? { ...item, receivedDate: new Date().toISOString() }
            //             : item
            //     )
            // );
        } catch (error) {
            console.error('Error marking as received:', error);
            toast.error('Failed to mark as received. Please try again.');
        } finally {
            setMarkingReceived(prev => ({ ...prev, [distributionId]: false }));
        }
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Table columns
    const columns = [
        {
            accessorKey: 'id',
            header: 'Distribution ID',
            cell: ({ getValue }) => (
                <span className="font-medium text-gray-900">#{getValue()}</span>
            ),
        },
        {
            accessorKey: 'franchiseName',
            header: 'Franchise',
            cell: ({ getValue }) => (
                <span className="text-gray-700">{getValue()}</span>
            ),
        },
        {
            accessorKey: 'quantity',
            header: 'Quantity',
            cell: ({ getValue }) => (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {getValue()}
                </span>
            ),
        },
        {
            accessorKey: 'distributedBy',
            header: 'Distributed By',
            cell: ({ getValue }) => (
                <span className="text-gray-600 text-sm">{getValue()}</span>
            ),
        },
        {
            accessorKey: 'distributedDate',
            header: 'Distributed Date',
            cell: ({ getValue }) => (
                <span className="text-sm text-gray-600">
                    {formatDate(getValue())}
                </span>
            ),
        },
        {
            accessorKey: 'receivedDate',
            header: ({ column }) => {
                return (
                    <button
                        className="flex items-center space-x-1 hover:text-gray-900"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        <span>Status</span>
                        {column.getIsSorted() === "asc" ? (
                            <ChevronUp className="w-4 h-4" />
                        ) : column.getIsSorted() === "desc" ? (
                            <ChevronDown className="w-4 h-4" />
                        ) : null}
                    </button>
                );
            },
            cell: ({ getValue, row }) => {
                const receivedDate = getValue();
                const distributionId = row.original.id;
                const isMarking = markingReceived[distributionId];

                if (receivedDate) {
                    return (
                        <div className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <div>
                                <div className="text-sm font-medium text-green-700">Received</div>
                                <div className="text-xs text-gray-500">{formatDate(receivedDate)}</div>
                            </div>
                        </div>
                    );
                }

                return (
                    <button
                        onClick={() => handleMarkReceived(distributionId)}
                        disabled={isMarking}
                        className="flex items-center space-x-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    >
                        {isMarking ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-orange-600"></div>
                        ) : (
                            <Clock className="w-4 h-4" />
                        )}
                        <span>{isMarking ? 'Marking...' : 'Mark Received'}</span>
                    </button>
                );
            },
            sortingFn: (rowA, rowB) => {
                const a = rowA.original.receivedDate;
                const b = rowB.original.receivedDate;

                // Null values first (pending items)
                if (a === null && b !== null) return -1;
                if (a !== null && b === null) return 1;
                if (a === null && b === null) return 0;

                // Then sort by date
                return new Date(a) - new Date(b);
            },
        },
        {
            accessorKey: 'serialNumbers',
            header: 'Device Details',
            cell: ({ getValue }) => {
                const serialNumbers = getValue();
                if (!serialNumbers || serialNumbers.length === 0) return '-';

                return (
                    <div className="space-y-1">
                        {serialNumbers.map((device, index) => (
                            <div key={index} className="text-xs bg-gray-50 p-2 rounded border">
                                <div><strong>MID:</strong> {device.mid}</div>
                                <div><strong>TID:</strong> {device.tid}</div>
                                {device.sid && <div><strong>SID:</strong> {device.sid}</div>}
                                {device.vpaid && <div><strong>VPA:</strong> {device.vpaid}</div>}
                            </div>
                        ))}
                    </div>
                );
            },
        },
    ];

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto p-6">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <Package className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Distribution History</h1>
                        <p className="text-gray-600">View and manage your product distributions</p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Distributions</p>
                            <p className="text-2xl font-bold text-gray-900">{data.length}</p>
                        </div>
                        <Package className="w-8 h-8 text-blue-500" />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Pending</p>
                            <p className="text-2xl font-bold text-orange-600">
                                {data.filter(item => !item.receivedDate).length}
                            </p>
                        </div>
                        <Clock className="w-8 h-8 text-orange-500" />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Received</p>
                            <p className="text-2xl font-bold text-green-600">
                                {data.filter(item => item.receivedDate).length}
                            </p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <th
                                            key={header.id}
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
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
                        <tbody className="bg-white divide-y divide-gray-200">
                            {table.getRowModel().rows.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length} className="px-6 py-4 text-center text-gray-500">
                                        No distribution history found
                                    </td>
                                </tr>
                            ) : (
                                table.getRowModel().rows.map((row) => (
                                    <tr key={row.id} className="hover:bg-gray-50">
                                        {row.getVisibleCells().map((cell) => (
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
            </div>
        </div>
    );
};

export default MerchantDistributionHistory;