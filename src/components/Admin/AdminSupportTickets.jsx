import React, { useState, useEffect } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
} from '@tanstack/react-table';
import api from '../../constants/API/axiosInstance';
import { Eye, CheckCircle } from 'lucide-react';
import ViewTicketModal from '../View/ViewTicketModal';
import ResolveTicketModal from '../Forms/ResolveTicketModal';

const AdminSupportTickets = () => {
    const [activeTab, setActiveTab] = useState('unresolved');
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [error, setError] = useState('');

    const columns = [
        {
            accessorKey: 'id',
            header: 'Ticket ID',
            cell: (info) => `#${info.getValue()}`,
        },
        {
            accessorKey: 'customerType',
            header: 'Customer Type',
            cell: (info) => (
                <span className="px-2 py-1 rounded bg-gray-100 text-xs font-medium">
                    {info.getValue()}
                </span>
            ),
        },
        {
            accessorKey: 'customerName',
            header: 'Customer Name',
        },
        {
            accessorKey: 'phoneNumber',
            header: 'Phone Number',
        },
        {
            accessorKey: 'issueType',
            header: 'Issue Type',
        },
        {
            accessorKey: 'description',
            header: 'Description',
            cell: (info) => (
                <div className="max-w-xs truncate" title={info.getValue()}>
                    {info.getValue()}
                </div>
            ),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: (info) => (
                <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${info.getValue() === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                >
                    {info.getValue()}
                </span>
            ),
        },
        {
            accessorKey: 'createdAt',
            header: 'Created At',
            cell: (info) => new Date(info.getValue()).toLocaleString(),
        },
        ...(activeTab === 'resolved'
            ? [
                {
                    accessorKey: 'resolvedAt',
                    header: 'Resolved At',
                    cell: (info) =>
                        info.getValue()
                            ? new Date(info.getValue()).toLocaleString()
                            : '-',
                },
                {
                    accessorKey: 'resolvedBy',
                    header: 'Resolved By',
                    cell: (info) => info.getValue() || '-',
                },
                {
                    accessorKey: 'adminRemarks',
                    header: 'Admin Remarks',
                    cell: (info) => (
                        <div className="max-w-xs truncate" title={info.getValue()}>
                            {info.getValue() || '-'}
                        </div>
                    ),
                },
            ]
            : []),
        {
            accessorKey: 'action',
            header: 'Action',
            cell: (info) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => handleView(info.row.original)}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                        title="View Details"
                    >
                        <Eye className="h-4 w-4" />
                    </button>
                    {activeTab === 'unresolved' && (
                        <button
                            onClick={() => handleResolve(info.row.original)}
                            className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
                            title="Resolve Ticket"
                        >
                            <CheckCircle className="h-4 w-4" />
                        </button>
                    )}
                </div>
            ),
        },
    ];

    const table = useReactTable({
        data: tickets,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    const fetchTickets = async (status) => {
        setLoading(true);
        setError('');
        try {
            const endpoint =
                status === 'unresolved'
                    ? '/support-tickets/admin/unresolved'
                    : '/support-tickets/admin/resolved';
            const response = await api.get(endpoint);
            setTickets(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch tickets');
        } finally {
            setLoading(false);
        }
    };

    const handleView = (ticket) => {
        setSelectedTicket(ticket);
        setIsViewModalOpen(true);
    };

    const handleViewClose = () => {
        setSelectedTicket(null);
        setIsViewModalOpen(false);
    };

    const handleResolve = (ticket) => {
        setSelectedTicket(ticket);
        setIsResolveModalOpen(true);
    };

    const handleResolveClose = () => {
        setSelectedTicket(null);
        setIsResolveModalOpen(false);
    };

    const handleTicketResolved = () => {
        fetchTickets(activeTab);
        handleResolveClose();
    };

    useEffect(() => {
        fetchTickets(activeTab);
    }, [activeTab]);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Support Tickets Management</h1>
            </div>

            <div className="mb-6 border-b border-gray-200">
                <div className="flex gap-4">
                    <button
                        onClick={() => handleTabChange('unresolved')}
                        className={`px-4 py-2 font-medium ${activeTab === 'unresolved'
                                ? 'border-b-2 border-blue-600 text-blue-600'
                                : 'text-gray-600 hover:text-gray-800'
                            }`}
                    >
                        Unresolved Tickets
                    </button>
                    <button
                        onClick={() => handleTabChange('resolved')}
                        className={`px-4 py-2 font-medium ${activeTab === 'resolved'
                                ? 'border-b-2 border-blue-600 text-blue-600'
                                : 'text-gray-600 hover:text-gray-800'
                            }`}
                    >
                        Resolved Tickets
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="text-center py-8">Loading...</div>
            ) : (
                <div className="overflow-x-auto bg-white rounded-lg shadow">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <th
                                            key={header.id}
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            {flexRender(
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
                                    <td
                                        colSpan={columns.length}
                                        className="px-6 py-4 text-center text-gray-500"
                                    >
                                        No tickets found
                                    </td>
                                </tr>
                            ) : (
                                table.getRowModel().rows.map((row) => (
                                    <tr key={row.id} className="hover:bg-gray-50">
                                        {row.getVisibleCells().map((cell) => (
                                            <td
                                                key={cell.id}
                                                className="px-6 py-4 whitespace-nowrap"
                                            >
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            <ViewTicketModal
                isOpen={isViewModalOpen}
                onClose={handleViewClose}
                ticket={selectedTicket}
            />

            <ResolveTicketModal
                isOpen={isResolveModalOpen}
                onClose={handleResolveClose}
                ticket={selectedTicket}
                onTicketResolved={handleTicketResolved}
            />
        </div>
    );
};

export default AdminSupportTickets;