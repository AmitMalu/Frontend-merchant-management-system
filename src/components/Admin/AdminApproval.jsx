import React, { useState, useMemo, useEffect } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    flexRender,
} from '@tanstack/react-table';
import {
    Eye,
    Check,
    X,
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Building2,
    User,
    Phone,
    Mail,
    MapPin,
    FileText,
    CreditCard,
    Calendar,
    AlertCircle,
    CheckCircle,
    Clock,
    Download
} from 'lucide-react';
import { DocumentPreview } from '../Tables/CustomerList'; 
import api from '../../constants/API/axiosInstance'; 
import { toast } from 'react-toastify';
// Business type mapping
const businessTypeMap = {
    retail: 'Retail Store',
    restaurant: 'Restaurant/Food',
    services: 'Services',
    grocery: 'Grocery/Supermarket',
    pharmacy: 'Pharmacy',
    other: 'Other'
};

// Status badge component
const StatusBadge = ({ approved }) => {
    // approved: false = Pending, approved: true = Approved
    // Rejected records are deleted from backend, so they won't appear
    const displayStatus = approved === true ? 'approved' : 'pending';

    const statusConfig = {
        pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
        approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Approved' }
    };

    const config = statusConfig[displayStatus];
    const Icon = config.icon;

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
            <Icon className="w-3 h-3" />
            {config.label}
        </span>
    );
};

// Action buttons component
const ActionButtons = ({ merchant, onView, onApprove, onReject }) => {
    const isPending = merchant.approved === false; // Only pending merchants have approve/reject buttons

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={() => onView(merchant)}
                className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="View Details"
            >
                <Eye className="w-4 h-4" />
            </button>
            {isPending && (
                <>
                    <button
                        onClick={() => onApprove(merchant)}
                        className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                        title="Approve"
                    >
                        <Check className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onReject(merchant)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Reject"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </>
            )}
        </div>
    );
};

// Merchant details modal
const MerchantDetailsModal = ({ merchant, isOpen, onClose, onApprove, onReject }) => {
    const [previewDocument, setPreviewDocument] = useState(null);

    if (!isOpen || !merchant) return null;

    const isPending = merchant.approved === false; // Only pending merchants show action buttons

    const InfoSection = ({ title, icon: Icon, children }) => (
        <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
                <Icon className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-800">{title}</h3>
            </div>
            {children}
        </div>
    );

    const InfoRow = ({ label, value }) => (
        <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-200 last:border-b-0">
            <span className="text-sm font-medium text-gray-600">{label}:</span>
            <span className="text-sm text-gray-900 sm:text-right">{value || 'N/A'}</span>
        </div>
    );

    const handleDocumentPreview = (documentPath, documentName) => {
        setPreviewDocument({ path: documentPath, name: documentName });
    };

    const handleApprove = async () => {
        await onApprove(merchant);
        onClose();
    };

    const handleReject = async () => {
        await onReject(merchant);
        onClose();
    };

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{merchant.businessName}</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <StatusBadge approved={merchant.approved} />
                                <span className="text-sm text-gray-500">ID: {merchant.id}</span>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Basic Details */}
                        <InfoSection title="Business Details" icon={Building2}>
                            <div className="space-y-1">
                                <InfoRow label="Business Name" value={merchant.businessName} />
                                <InfoRow label="Legal Entity Name" value={merchant.legalName} />
                                <InfoRow label="Business Type" value={businessTypeMap[merchant.businessType] || merchant.businessType} />
                                <InfoRow label="Franchise" value={merchant.franchise?.legalName || 'N/A'} />
                                <InfoRow label="GST Number" value={merchant.gstNumber} />
                                <InfoRow label="PAN Number" value={merchant.panNumber} />
                                <InfoRow label="Registration Number" value={merchant.registrationNumber} />
                            </div>
                        </InfoSection>

                        {/* Address */}
                        <InfoSection title="Business Address" icon={MapPin}>
                            <InfoRow label="Address" value={merchant.address} />
                        </InfoSection>

                        {/* Contact Details */}
                        <InfoSection title="Contact Information" icon={User}>
                            <div className="space-y-1">
                                <InfoRow label="Primary Contact" value={merchant.contactPerson?.name} />
                                <InfoRow label="Mobile" value={merchant.contactPerson?.phoneNumber} />
                                <InfoRow label="Email" value={merchant.contactPerson?.email} />
                                <InfoRow label="Alternate Mobile" value={merchant.contactPerson?.alternatePhoneNum} />
                                <InfoRow label="Landline" value={merchant.contactPerson?.landlineNumber} />
                            </div>
                        </InfoSection>

                        {/* Bank Details */}
                        <InfoSection title="Bank Account Details" icon={CreditCard}>
                            <div className="space-y-1">
                                <InfoRow label="Bank Name" value={merchant.bankDetails?.bankName} />
                                <InfoRow label="Account Holder" value={merchant.bankDetails?.accountHolderName} />
                                <InfoRow label="Account Number" value={merchant.bankDetails?.accountNumber} />
                                <InfoRow label="IFSC Code" value={merchant.bankDetails?.ifsc} />
                                <InfoRow label="Branch" value={merchant.bankDetails?.branchName} />
                                <InfoRow label="Account Type" value={merchant.bankDetails?.accountType?.toLowerCase()} />
                            </div>
                        </InfoSection>

                        {/* Documents */}
                        {merchant.uploadDocuments && (
                            <InfoSection title="Documents" icon={FileText}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {Object.entries(merchant.uploadDocuments).map(([key, filename]) => {
                                        if (!filename) return null;

                                        const displayName = key.replace(/([A-Z])/g, ' $1')
                                            .replace(/^./, str => str.toUpperCase())
                                            .replace(/Proof$/, ' Proof');

                                        return (
                                            <div key={key} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="w-4 h-4 text-gray-500" />
                                                    <span className="text-sm font-medium text-gray-700">
                                                        {displayName}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => handleDocumentPreview(filename, displayName)}
                                                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                                                >
                                                    <Eye className="w-3 h-3" />
                                                    View
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </InfoSection>
                        )}

                        {/* Status Information */}
                        <InfoSection title="Status Information" icon={Calendar}>
                            <div className="space-y-1">
                                <InfoRow label="Created Date" value={merchant.createdAt ? new Date(merchant.createdAt).toLocaleDateString() : 'N/A'} />
                                <InfoRow label="Updated Date" value={merchant.updatedAt ? new Date(merchant.updatedAt).toLocaleDateString() : 'N/A'} />
                                <InfoRow label="Status" value={merchant.approved === true ? 'Approved' : 'Pending'} />
                            </div>
                        </InfoSection>
                    </div>

                    {/* Action buttons in modal */}
                    {isPending && (
                        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex gap-4">
                            <button
                                onClick={handleApprove}
                                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <Check className="w-4 h-4" />
                                Approve
                            </button>
                            <button
                                onClick={handleReject}
                                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <X className="w-4 h-4" />
                                Reject
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Document Preview Modal */}
            {previewDocument && (
                <DocumentPreview
                    documentPath={previewDocument.path}
                    documentName={previewDocument.name}
                    onClose={() => setPreviewDocument(null)}
                />
            )}
        </>
    );
};

// Main AdminApproval component
const AdminApproval = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [globalFilter, setGlobalFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedMerchant, setSelectedMerchant] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Fetch merchants from API
    const fetchMerchants = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/merchants/unapproved');
            setData(response.data);
        } catch (err) {
            setError('Failed to fetch merchants');
            console.error('Error fetching merchants:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMerchants();
    }, []);

    // Handle actions
    const handleView = (merchant) => {
        setSelectedMerchant(merchant);
        setIsModalOpen(true);
    };

    const handleApprove = async (merchant) => {
        try {
            await api.put(`/merchants/${merchant.id}/approve`);
            // Refresh the data
            await fetchMerchants();
        } catch (err) {
            console.error('Error approving merchant:', err);
            toast.error('Failed to approve merchant. Please try again.');
        }
    };

    // show confirm toast with action buttons
    const handleReject = async (merchant) => {
        toast.warn(
            ({ closeToast }) => (
                <div className="space-y-2">
                    <p>
                        Are you sure you want to <b>reject and delete</b> this merchant?
                        <br />
                        <span className="text-red-500">This action cannot be undone.</span>
                    </p>
                    <div className="flex gap-2">
                        <button
                            className="px-3 py-1 bg-red-600 text-white rounded-md"
                            onClick={async () => {
                                try {
                                    await api.delete(`/merchants/${merchant.id}/reject`);
                                    await fetchMerchants();
                                    toast.success("Merchant rejected & deleted.");
                                } catch (err) {
                                    console.error("Error rejecting merchant:", err);
                                    toast.error("Failed to reject merchant. Please try again.");
                                } finally {
                                    closeToast();
                                }
                            }}
                        >
                            Yes, Reject
                        </button>
                        <button
                            className="px-3 py-1 bg-gray-300 rounded-md"
                            onClick={closeToast}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ),
            { autoClose: false }
        );
    };


    // Table columns
    const columns = useMemo(() => [
        {
            accessorKey: 'id',
            header: 'Merchant ID',
            cell: ({ row }) => (
                <span className="font-mono text-sm">{row.original.id}</span>
            )
        },
        {
            accessorKey: 'businessName',
            header: 'Business Name',
            cell: ({ row }) => (
                <div>
                    <div className="font-medium">{row.original.businessName}</div>
                    <div className="text-sm text-gray-500">{row.original.legalName}</div>
                </div>
            )
        },
        {
            accessorKey: 'franchise',
            header: 'Franchise',
            cell: ({ row }) => (
                <div>
                    <div className="font-medium">{row.original.franchise?.legalName || 'N/A'}</div>
                    {row.original.franchise?.id && (
                        <div className="text-sm text-gray-500">ID: {row.original.franchise.id}</div>
                    )}
                </div>
            )
        },
        {
            accessorKey: 'businessType',
            header: 'Type',
            cell: ({ row }) => businessTypeMap[row.original.businessType] || row.original.businessType
        },
        {
            accessorKey: 'contactPerson.name',
            header: 'Contact',
            cell: ({ row }) => (
                <div>
                    <div className="font-medium">{row.original.contactPerson?.name || 'N/A'}</div>
                    <div className="text-sm text-gray-500">{row.original.contactPerson?.phoneNumber || 'N/A'}</div>
                </div>
            )
        },
        {
            accessorKey: 'createdAt',
            header: 'Created',
            cell: ({ row }) => row.original.createdAt ? new Date(row.original.createdAt).toLocaleDateString() : 'N/A'
        },
        {
            accessorKey: 'approved',
            header: 'Status',
            cell: ({ row }) => <StatusBadge approved={row.original.approved} />
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <ActionButtons
                    merchant={row.original}
                    onView={handleView}
                    onApprove={handleApprove}
                    onReject={handleReject}
                />
            )
        }
    ], []);

    // Filter data based on status
    const filteredData = useMemo(() => {
        let filtered = data;

        if (statusFilter !== 'all') {
            filtered = filtered.filter(merchant => {
                const status = merchant.approved === true ? 'approved' : 'pending';
                return status === statusFilter;
            });
        }

        return filtered;
    }, [data, statusFilter]);

    // Table instance
    const table = useReactTable({
        data: filteredData,
        columns,
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

    // Stats
    const stats = useMemo(() => {
        const pending = data.filter(m => m.approved === false).length;
        const approved = data.filter(m => m.approved === true).length;
        // Rejected merchants are deleted from backend, so no rejected count needed
        return { pending, approved, total: data.length };
    }, [data]);

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading merchants...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                        <span className="text-red-700">{error}</span>
                    </div>
                    <button
                        onClick={fetchMerchants}
                        className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Merchant Approval</h1>
                    <p className="text-gray-600">Review and approve merchant applications</p>
                </div>
                <button
                    onClick={fetchMerchants}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Refresh
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Merchants</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                        <Building2 className="w-8 h-8 text-gray-400" />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Pending</p>
                            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                        </div>
                        <Clock className="w-8 h-8 text-yellow-400" />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Approved</p>
                            <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-400" />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                value={globalFilter ?? ''}
                                onChange={(e) => setGlobalFilter(e.target.value)}
                                placeholder="Search merchants..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <th
                                            key={header.id}
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                            onClick={header.column.getToggleSortingHandler()}
                                        >
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {table.getRowModel().rows.map(row => (
                                <tr key={row.id} className="hover:bg-gray-50">
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-700">
                            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
                            {Math.min(
                                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                                table.getFilteredRowModel().rows.length
                            )}{' '}
                            of {table.getFilteredRowModel().rows.length} results
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => table.setPageIndex(0)}
                            disabled={!table.getCanPreviousPage()}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronsLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-sm text-gray-700">
                            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                        </span>
                        <button
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                            disabled={!table.getCanNextPage()}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronsRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Merchant Details Modal */}
            <MerchantDetailsModal
                merchant={selectedMerchant}
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedMerchant(null);
                }}
                onApprove={handleApprove}
                onReject={handleReject}
            />
        </div>
    );
};

export default AdminApproval;