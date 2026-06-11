import { useState, useMemo, useEffect } from 'react'
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    flexRender,
} from '@tanstack/react-table'
import {
    Search,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Eye,
    Trash2,
    Package,
    TruckIcon,
    Users,
    Calendar,
} from 'lucide-react'
import ViewOutwardEntry from '../View/ViewOutwardEntry'
import { getAllOutwardTransactions } from '../../constants/API/OutwardTransAPI'
import { toast } from 'react-toastify'

const OutwardTable = ({ onEdit, onDelete, refreshTrigger }) => {
    const [globalFilter, setGlobalFilter] = useState('')
    const [sorting, setSorting] = useState([])
    const [viewData, setViewData] = useState(null)
    const [isViewOpen, setIsViewOpen] = useState(false)

    // Pagination state
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false)
    const [pageIndex, setPageIndex] = useState(0)
    const [pageSize, setPageSize] = useState(10)
    const [totalElements, setTotalElements] = useState(0)
    const [totalPages, setTotalPages] = useState(0)

    // Fetch data function
    const fetchData = async () => {
        setLoading(true)
        try {
            const sortParam = sorting.length > 0
                ? [sorting[0].id, sorting[0].desc ? "desc" : "asc"]
                : ["id", "desc"]

            const response = await getAllOutwardTransactions(pageIndex, pageSize, sortParam)

            setData(response.content || [])
            setTotalElements(response.totalElements || 0)
            setTotalPages(response.totalPages || 0)
        } catch (error) {
            console.error("Error fetching outward data:", error)
            const backendMessage = error.response?.data?.message || error.message || "Error fetching data"
            toast.error(backendMessage)
            setData([])
        } finally {
            setLoading(false)
        }
    }

    // Fetch data on mount and when dependencies change
    useEffect(() => {
        fetchData()
    }, [pageIndex, pageSize, sorting, refreshTrigger])

    // Calculate stats from current page data
    const totalDeliveries = totalElements
    const totalQuantity = data?.reduce((acc, item) => acc + (item.quantity || 0), 0) || 0
    const totalFranchises = data?.filter(item => item.franchiseId).length || 0
    const totalMerchants = data?.filter(item => item.merchantId).length || 0
    const todayDeliveries = data?.filter(item => {
        const deliveryDate = new Date(item.dispatchDate).toDateString()
        const today = new Date().toDateString()
        return deliveryDate === today
    }).length || 0

    const columns = useMemo(() => [
        {
            accessorKey: 'deliveryNumber',
            header: ({ column }) => (
                <button
                    className="flex items-center space-x-1 hover:text-blue-600"
                    onClick={() => column.toggleSorting()}
                >
                    <span>Delivery Number</span>
                    <ArrowUpDown className="h-4 w-4" />
                </button>
            ),
            cell: ({ row }) => (
                <div className="font-medium">{row.getValue('deliveryNumber')}</div>
            ),
        },
        {
            accessorKey: 'customerName',
            header: ({ column }) => (
                <button
                    className="flex items-center space-x-1 hover:text-blue-600"
                    onClick={() => column.toggleSorting()}
                >
                    <span>Customer Name</span>
                    <ArrowUpDown className="h-4 w-4" />
                </button>
            ),
            cell: ({ row }) => {
                const data = row.original;
                const customerName = data.franchiseName || data.merchantName || 'N/A';
                return <div>{customerName}</div>;
            },
        },
        {
            accessorKey: 'productName',
            header: 'Product Name',
        },
        {
            accessorKey: 'quantity',
            header: ({ column }) => (
                <button
                    className="flex items-center space-x-1 hover:text-blue-600"
                    onClick={() => column.toggleSorting()}
                >
                    <span>Quantity</span>
                    <ArrowUpDown className="h-4 w-4" />
                </button>
            ),
            cell: ({ row }) => (
                <div className="text-center font-semibold">{row.getValue('quantity')}</div>
            ),
        },
        {
            accessorKey: 'dispatchDate',
            header: ({ column }) => (
                <button
                    className="flex items-center space-x-1 hover:text-blue-600"
                    onClick={() => column.toggleSorting()}
                >
                    <span>Dispatch Date</span>
                    <ArrowUpDown className="h-4 w-4" />
                </button>
            ),
            cell: ({ row }) => (
                <div>{new Date(row.getValue('dispatchDate')).toLocaleDateString()}</div>
            ),
        },
        {
            accessorKey: 'customerType',
            header: 'Customer Type',
            cell: ({ row }) => {
                const data = row.original;
                const customerType = data.franchiseId ? 'franchise' : 'merchant';
                const customerTypeLabels = {
                    franchise: 'Franchise',
                    merchant: 'Direct Merchant'
                };
                return (
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                        {customerTypeLabels[customerType]}
                    </span>
                );
            },
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => handleView(row.original)}
                        className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                        title="View Details"
                    >
                        <Eye className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => handleDelete(row.original.id)}
                        className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                        title="Delete Entry"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            ),
        },
    ], [])

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        manualPagination: true,
        pageCount: totalPages,
        state: {
            sorting,
            globalFilter,
            pagination: {
                pageIndex,
                pageSize,
            },
        },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
    })

    const handleView = (outwardData) => {
        setViewData(outwardData)
        setIsViewOpen(true)
    }

    const handleViewClose = () => {
        setViewData(null)
        setIsViewOpen(false)
    }

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this outward transaction?")) {
            await onDelete(id)
            // Refresh data after delete
            fetchData()
        }
    }

    const handlePageChange = (newPageIndex) => {
        setPageIndex(newPageIndex)
    }

    const handlePageSizeChange = (newPageSize) => {
        setPageSize(newPageSize)
        setPageIndex(0) // Reset to first page
    }

    if (loading && data.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 pr-4">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white rounded-lg shadow-lg">
                        <div className="p-6 text-center">
                            <p className="text-gray-500">Loading...</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (!loading && data.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 pr-4">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white rounded-lg shadow-lg">
                        <div className="p-6 text-center">
                            <p className="text-gray-500">No outward entries found. Click "Add Outward Entry" to get started.</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 pr-4">
            <div className="mx-auto">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <TruckIcon className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Deliveries</p>
                                <p className="text-2xl font-bold text-gray-900">{totalDeliveries}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Package className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Page Quantity</p>
                                <p className="text-2xl font-bold text-gray-900">{totalQuantity}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Users className="h-6 w-6 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Page Customers</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {totalFranchises + totalMerchants}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <Calendar className="h-6 w-6 text-orange-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Today's Deliveries</p>
                                <p className="text-2xl font-bold text-gray-900">{todayDeliveries}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table Card */}
                <div className="bg-white rounded-lg shadow-sm">
                    {/* Table Header */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">Outward Entries</h2>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <input
                                    type="text"
                                    placeholder="Search outward entries..."
                                    value={globalFilter ?? ''}
                                    onChange={(e) => setGlobalFilter(e.target.value)}
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
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
                                            <th key={header.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                                {table.getRowModel().rows.map(row => (
                                    <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                        {row.getVisibleCells().map(cell => (
                                            <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-6 py-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-700">
                                    Page {pageIndex + 1} of {totalPages || 1}
                                </span>
                                <span className="text-sm text-gray-500">
                                    ({totalElements} total entries)
                                </span>
                                <select
                                    value={pageSize}
                                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                                    className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    {[10, 20, 30, 40, 50].map(size => (
                                        <option key={size} value={size}>
                                            Show {size}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => handlePageChange(0)}
                                    disabled={pageIndex === 0}
                                    className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                                >
                                    <ChevronsLeft className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => handlePageChange(pageIndex - 1)}
                                    disabled={pageIndex === 0}
                                    className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                <span className="text-sm text-gray-700">
                                    Page {pageIndex + 1} of {totalPages || 1}
                                </span>
                                <button
                                    onClick={() => handlePageChange(pageIndex + 1)}
                                    disabled={pageIndex >= totalPages - 1}
                                    className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => handlePageChange(totalPages - 1)}
                                    disabled={pageIndex >= totalPages - 1}
                                    className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                                >
                                    <ChevronsRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isViewOpen && (
                <ViewOutwardEntry
                    outwardData={viewData}
                    onClose={handleViewClose}
                    isOpen={isViewOpen}
                />
            )}
        </div>
    )
}

export default OutwardTable