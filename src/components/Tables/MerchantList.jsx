import React, { useState, useMemo, useEffect } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    flexRender,
    createColumnHelper,
} from '@tanstack/react-table';
import {
    Search,
    Eye,
    Edit,
    Trash2,
    Store,
    MapPin,
    Package,
    Wallet,
    TrendingUp,
    Mail,
    Phone,
    Plus,
    X
} from 'lucide-react';
import CustomerOnboarding from '../Forms/CustomerOnboarding/CustomerOnborading';


import api from '../../constants/API/axiosInstance';
import ViewMerchantEntry from '../View/ViewMerchantEntry';

// Modal Component
const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">Add New Merchant</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

// Reusable Components
const StatusBadge = ({ status }) => {
    const statusConfig = {
        active: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
        inactive: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
        pending: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
        suspended: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' }
    };

    const config = statusConfig[status] || statusConfig.inactive;

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
};

const ActionButton = ({ icon: Icon, onClick, variant = 'ghost', size = 'sm', className = '' }) => {
    const variants = {
        ghost: 'hover:bg-gray-50 text-gray-600 hover:text-gray-900',
        primary: 'bg-blue-600 text-white hover:bg-blue-700',
        danger: 'hover:bg-red-50 text-red-600 hover:text-red-700'
    };

    return (
        <button
            onClick={onClick}
            className={`p-2 rounded-lg transition-colors ${variants[variant]} ${className}`}
        >
            <Icon className="w-4 h-4" />
        </button>
    );
};

const TableHeader = ({ title, count, searchValue, onSearchChange, onAddMerchant }) => (
    <div className="flex items-center justify-between mb-6">
        <div>
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <p className="text-gray-600 mt-1">{count} total merchants</p>
        </div>
        <div className="flex items-center space-x-4">
            <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search merchants..."
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>
            <button
                onClick={onAddMerchant}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
                <Plus className="w-4 h-4" />
                <span>Add Merchant</span>
            </button>
        </div>
    </div>
);

const MerchantListComponent = () => {
    const [globalFilter, setGlobalFilter] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const customerId = localStorage.getItem("customerId");

    const [viewData, setViewData] = useState(null);
    const [isViewOpen, setIsViewOpen] = useState(false);

   
    const [merchantData, setMerchantData] = useState([]);

    const fetchMerchants = async () => {
        const response = await api.get(`/merchants/franchise/${customerId}`);
        console.log(response);
        setMerchantData(response.data || []);
    }

    useEffect(() => {
       fetchMerchants() 
    }, [])
    
    const handleView = (merchantData) => {
        setViewData(merchantData);
        setIsViewOpen(true);
    };

    const handleViewClose = () => {
        setViewData(null);
        setIsViewOpen(false);
    };
    // Column Helper
    const columnHelper = createColumnHelper();

    // Merchant Columns
    const merchantColumns = useMemo(() => [
        columnHelper.accessor('id', {
            header: 'ID',
            cell: (info) => (
                <span className="font-mono text-sm text-gray-600">{info.getValue()}</span>
            ),
            size: 80,
        }),
        columnHelper.accessor('businessName', {
            header: 'Merchant Name',
            cell: (info) => (
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-50 rounded-lg">
                        <Store className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                        <div className="font-medium text-gray-900">{info.getValue()}</div>
                        <div className="text-sm text-gray-500">{info.row.original.businessType}</div>
                    </div>
                </div>
            ),
            size: 250,
        }),
        columnHelper.accessor('contactPersonName', {
            header: 'Contact Person',
            cell: (info) => (
                <div>
                    <div className="font-medium text-gray-900">{info.getValue()}</div>
                    <div className="text-sm text-gray-500 flex items-center space-x-1">
                        <Mail className="w-3 h-3" />
                        <span>{info.row.original.contactPersonEmail}</span>
                    </div>
                </div>
            ),
            size: 200,
        }),
        columnHelper.accessor('address', {
            header: 'Location',
            cell: (info) => (
                <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{info.getValue()}</span>
                </div>
            ),
            size: 150,
        }),
        columnHelper.accessor('products', {
            header: 'Products',
            cell: (info) => (
                <div className="flex items-center space-x-2">
                    <Package className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{info.getValue()}</span>
                </div>
            ),
            size: 100,
        }),
        columnHelper.accessor('walletBalance', {
            header: 'Wallet Balance',
            cell: (info) => (
                <div className="flex items-center space-x-2">
                    <Wallet className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">₹{info.getValue().toLocaleString()}</span>
                </div>
            ),
            size: 120,
        }),
        columnHelper.accessor('monthlyRevenue', {
            header: 'Monthly Revenue',
            cell: (info) => (
                <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">₹{info.getValue().toLocaleString()}</span>
                </div>
            ),
            size: 130,
        }),
        columnHelper.accessor('status', {
            header: 'Status',
            cell: (info) => <StatusBadge status={info.getValue()} />,
            size: 100,
        }),
        columnHelper.display({
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <div className="flex items-center space-x-1">
                    <ActionButton icon={Eye} onClick={() => handleView(row.original)} />
                    {/* <ActionButton icon={Edit} onClick={() => console.log('Edit', row.original.id)} /> */}
                    {/* <ActionButton icon={Trash2} onClick={() => console.log('Delete', row.original.id)} variant="danger" /> */}
                </div>
            ),
            size: 120,
        }),
    ], [columnHelper]);

    // Table instance
    const table = useReactTable({
        data: merchantData,
        columns: merchantColumns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        state: {
            globalFilter,
        },
        onGlobalFilterChange: setGlobalFilter,
        initialState: {
            pagination: {
                pageSize: 5,
            },
        },
    });

    const handleAddMerchant = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <TableHeader
                    title="Merchant Management"
                    count={merchantData.length}
                    searchValue={globalFilter}
                    onSearchChange={setGlobalFilter}
                    onAddMerchant={handleAddMerchant}
                />

                {/* Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <tr key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => (
                                            <th
                                                key={header.id}
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                                onClick={header.column.getToggleSortingHandler()}
                                                style={{ width: header.getSize() }}
                                            >
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(header.column.columnDef.header, header.getContext())}
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {table.getRowModel().rows.map((row) => (
                                    <tr key={row.id} className="hover:bg-gray-50">
                                        {row.getVisibleCells().map((cell) => (
                                            <td
                                                key={cell.id}
                                                className="px-6 py-4 whitespace-nowrap"
                                                style={{ width: cell.column.getSize() }}
                                            >
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Showing{' '}
                                    <span className="font-medium">
                                        {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
                                    </span>{' '}
                                    to{' '}
                                    <span className="font-medium">
                                        {Math.min(
                                            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                                            table.getFilteredRowModel().rows.length
                                        )}
                                    </span>{' '}
                                    of{' '}
                                    <span className="font-medium">{table.getFilteredRowModel().rows.length}</span> results
                                </p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => table.setPageIndex(0)}
                                    disabled={!table.getCanPreviousPage()}
                                    className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {'<<'}
                                </button>
                                <button
                                    onClick={() => table.previousPage()}
                                    disabled={!table.getCanPreviousPage()}
                                    className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {'<'}
                                </button>
                                <span className="flex items-center space-x-1">
                                    <span>Page</span>
                                    <strong>
                                        {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                                    </strong>
                                </span>
                                <button
                                    onClick={() => table.nextPage()}
                                    disabled={!table.getCanNextPage()}
                                    className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {'>'}
                                </button>
                                <button
                                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                    disabled={!table.getCanNextPage()}
                                    className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {'>>'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Add Merchant Modal */}
                <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
                    <CustomerOnboarding onClose={handleCloseModal} isFranchiseContext={true} isModal={true } />
                </Modal>
            </div>
            {isViewOpen && (
                <ViewMerchantEntry
                    merchantData={viewData}
                    onClose={handleViewClose}
                    isOpen={isViewOpen}
                />
            )}
        </div>
    );
};

export default MerchantListComponent;