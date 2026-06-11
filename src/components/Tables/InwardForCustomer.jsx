import React, { useState, useEffect, useMemo } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    flexRender,
    createColumnHelper,
} from '@tanstack/react-table';
import api from '../../constants/API/axiosInstance';
import PsnModal from '../View/PsnModal';
import { Eye } from 'lucide-react';

const InwardForCustomer = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [buttonLoading, setButtonLoading] = useState({});
    const [error, setError] = useState(null);
    const [selectedPsn, setSelectedPsn] = useState([]);
    const [selectedProductName, setSelectedProductName] = useState('');
    const [modalOpen, setModalOpen] = useState(false);

    const openPsnModal = (row) => {
        setSelectedPsn(row.productSerialNumbers);
        setSelectedProductName(row.productName);
        setModalOpen(true);
    };

    // Fetch data on component mount
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                const userType = localStorage.getItem('userType').toLowerCase();
                const customerId = localStorage.getItem('customerId');

                if (!userType || !customerId) {
                    throw new Error('User type or customer ID not found in localStorage');
                }

                const endpoint = userType === 'franchise'
                    ? `/outward-transactions/franchise/${customerId}`
                    : `/outward-transactions/merchant/${customerId}`;

                const response = await api.get(endpoint);

                // Sort data with null receivedDate first
                const sortedData = response.data.sort((a, b) => {
                    if (a.receivedDate === null && b.receivedDate !== null) return -1;
                    if (a.receivedDate !== null && b.receivedDate === null) return 1;
                    return 0;
                });

                setData(sortedData);
            } catch (err) {
                console.error('Error fetching outward transactions:', err);
                setError(err.response?.data?.message || err.message || 'Failed to fetch data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleMarkAsReceived = async (outwardId) => {
        setButtonLoading(prev => ({ ...prev, [outwardId]: true }));

        try {
            const response = await api.patch(`/outward-transactions/${outwardId}/received`);

            // Update the data to reflect the change
            setData(prevData =>
                prevData.map(item =>
                    item.outwardId === outwardId
                        ? { ...item, receivedDate: new Date().toISOString() }
                        : item
                ).sort((a, b) => {
                    // Re-sort after update
                    if (a.receivedDate === null && b.receivedDate !== null) return -1;
                    if (a.receivedDate !== null && b.receivedDate === null) return 1;
                    return 0;
                })
            );

            console.log('Success:', response.data);
        } catch (error) {
            console.error('Error marking as received:', error);
            alert('Failed to mark as received. Please try again.');
        } finally {
            setButtonLoading(prev => ({ ...prev, [outwardId]: false }));
        }
    };

    const columnHelper = createColumnHelper();

    const columns = useMemo(() => [
        columnHelper.accessor('outwardId', {
            header: 'ID',
            cell: info => (
                <span className="font-medium text-gray-900">
                    #{info.getValue()}
                </span>
            ),
        }),
        columnHelper.accessor('productName', {
            header: 'Product',
            cell: info => (
                <div className="font-medium text-gray-900">
                    {info.getValue()}
                </div>
            ),
        }),
        columnHelper.accessor('quantity', {
            header: 'Qty',
            cell: info => (
                <span className="text-sm font-medium text-gray-700">
                    {info.getValue()}
                </span>
            ),
        }),
        columnHelper.accessor('deliveryMethod', {
            header: 'Delivery',
            cell: info => (
                <span className="text-sm text-gray-600 capitalize">
                    {info.getValue()}
                </span>
            ),
        }),
        columnHelper.accessor('trackingNumber', {
            header: 'Tracking',
            cell: info => (
                <code className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded font-mono">
                    {info.getValue()}
                </code>
            ),
        }),
        columnHelper.accessor('dispatchDate', {
            header: 'Dispatched',
            cell: info => (
                <span className="text-sm text-gray-600">
                    {new Date(info.getValue()).toLocaleDateString()}
                </span>
            ),
        }),
        columnHelper.accessor('expectedDeliveryDate', {
            header: 'Expected',
            cell: info => (
                <span className="text-sm text-gray-600">
                    {new Date(info.getValue()).toLocaleDateString()}
                </span>
            ),
        }),
        columnHelper.accessor('receivedDate', {
            header: 'Status',
            cell: info => {
                const receivedDate = info.getValue();
                const row = info.row.original;

                if (receivedDate === null) {
                    return (
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                                In Transit
                            </span>
                            <button
                                onClick={() => handleMarkAsReceived(row.outwardId)}
                                disabled={buttonLoading[row.outwardId]}
                                className="px-3 py-1 text-xs font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed rounded transition-colors duration-200"
                            >
                                {buttonLoading[row.outwardId] ? 'Marking...' : 'Mark Received'}
                            </button>
                        </div>
                    );
                }

                return (
                    <div>
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            Received
                        </span>
                        <div className="text-xs text-gray-500 mt-1">
                            {new Date(receivedDate).toLocaleDateString()} at {new Date(receivedDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                );
            },
        }),
        columnHelper.display({
            id: 'actions',
            header: 'View',
            cell: info => {
                const row = info.row.original;

                return (
                    <button
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => openPsnModal(row)}
                        title="View Serial Numbers"
                    >
                        <Eye size={16} />
                    </button>
                );
            },
        }),
    ], [buttonLoading]);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    if (loading) {
        return (
            <div className="w-full flex items-center justify-center py-12">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-600">Loading transactions...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 text-red-500">⚠</div>
                    <h3 className="text-red-800 font-medium">Error Loading Data</h3>
                </div>
                <p className="text-red-700 mt-1 text-sm">{error}</p>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Outward Transactions</h2>
                <div className="flex gap-4 text-sm text-gray-600">
                    <span>
                        <span className="font-medium text-yellow-700">
                            {data.filter(item => item.receivedDate === null).length}
                        </span> In Transit
                    </span>
                    <span>
                        <span className="font-medium text-green-700">
                            {data.filter(item => item.receivedDate !== null).length}
                        </span> Received
                    </span>
                    <span>
                        <span className="font-medium text-gray-700">
                            {data.length}
                        </span> Total
                    </span>
                </div>
            </div>

            {data.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        📦
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Transactions Found</h3>
                    <p className="text-gray-500">There are no outward transactions to display.</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
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
                                                <div className="flex items-center gap-2">
                                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                                    {{
                                                        asc: <span className="text-gray-400 text-sm">↑</span>,
                                                        desc: <span className="text-gray-400 text-sm">↓</span>,
                                                    }[header.column.getIsSorted()] ?? null}
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {table.getRowModel().rows.map(row => (
                                    <tr
                                        key={row.id}
                                        className={`hover:bg-gray-50 transition-colors ${row.original.receivedDate === null ? 'bg-yellow-50 border-l-4 border-l-yellow-400' : ''
                                            }`}
                                    >
                                        {row.getVisibleCells().map(cell => (
                                            <td
                                                key={cell.id}
                                                className="px-6 py-4 whitespace-nowrap text-sm"
                                            >
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            <PsnModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                productName={selectedProductName}
                serialNumbers={selectedPsn}
            />

        </div>
    );
};

export default InwardForCustomer;