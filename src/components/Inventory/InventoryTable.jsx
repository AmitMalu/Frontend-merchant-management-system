import { useState, useMemo, useEffect } from 'react'
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    flexRender,
} from '@tanstack/react-table'
import {
    Search,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Loader2,
    Package,
    Archive,
    AlertTriangle,
    CheckCircle,
} from 'lucide-react'
import api from '../../constants/API/axiosInstance'

const InventoryTable = () => {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [globalFilter, setGlobalFilter] = useState('')
    const [searchInput, setSearchInput] = useState('')
    const [sorting, setSorting] = useState([])
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    })
    const [totalPages, setTotalPages] = useState(0)
    const [totalElements, setTotalElements] = useState(0)

    const columns = useMemo(() => [
        {
            accessorKey: 'productCode',
            header: ({ column }) => (
                <button
                    className="flex items-center space-x-1 hover:text-blue-600"
                    onClick={() => column.toggleSorting()}
                >
                    <span>Product Code</span>
                    <ArrowUpDown className="h-4 w-4" />
                </button>
            ),
            cell: ({ row }) => (
                <div className="font-medium">{row.getValue('productCode')}</div>
            ),
        },
        {
            accessorKey: 'productName',
            header: ({ column }) => (
                <button
                    className="flex items-center space-x-1 hover:text-blue-600"
                    onClick={() => column.toggleSorting()}
                >
                    <span>Product Name</span>
                    <ArrowUpDown className="h-4 w-4" />
                </button>
            ),
        },
        {
            accessorKey: 'vendorName',
            header: ({ column }) => (
                <button
                    className="flex items-center space-x-1 hover:text-blue-600"
                    onClick={() => column.toggleSorting()}
                >
                    <span>Vendor Name</span>
                    <ArrowUpDown className="h-4 w-4" />
                </button>
            ),
        },
        {
            accessorKey: 'totalQuantity',
            header: ({ column }) => (
                <button
                    className="flex items-center space-x-1 hover:text-blue-600"
                    onClick={() => column.toggleSorting()}
                >
                    <span>Total Quantity</span>
                    <ArrowUpDown className="h-4 w-4" />
                </button>
            ),
            cell: ({ row }) => (
                <div className="text-center font-semibold">{row.getValue('totalQuantity')}</div>
            ),
        },
        {
            accessorKey: 'returned',
            header: 'Returned',
            cell: ({ row }) => (
                <div className="text-center text-yellow-600 font-medium">{row.getValue('returned')}</div>
            ),
        },
        {
            accessorKey: 'available',
            header: 'Available',
            cell: ({ row }) => (
                <div className="text-center text-green-600 font-semibold">{row.getValue('available')}</div>
            ),
        },
        {
            id: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const available = row.getValue('available')
                const total = row.getValue('totalQuantity')
                const percentage = total > 0 ? (available / total) * 100 : 0

                let status = 'In Stock'
                let colorClass = 'bg-green-100 text-green-800'

                if (percentage <= 10) {
                    status = 'Low Stock'
                    colorClass = 'bg-red-100 text-red-800'
                } else if (percentage <= 30) {
                    status = 'Medium Stock'
                    colorClass = 'bg-yellow-100 text-yellow-800'
                }

                return (
                    <span className={`px-2 py-1 text-xs rounded-full ${colorClass}`}>
                        {status}
                    </span>
                )
            },
        },
    ], [])

    const fetchInventory = async () => {
        setLoading(true)
        setError(null)

        try {
            const sortBy = sorting.length > 0 ? sorting[0].id : 'productName'
            const sortDir = sorting.length > 0 && sorting[0].desc ? 'desc' : 'asc'

            const params = {
                page: pagination.pageIndex,
                size: pagination.pageSize,
                sortBy,
                sortDir,
            }

            if (globalFilter && globalFilter.trim()) {
                params.search = globalFilter.trim()
            }

            const response = await api.get('/inventory', { params })

            setData(response.data.content)
            setTotalPages(response.data.totalPages)
            setTotalElements(response.data.totalElements)
        } catch (err) {
            setError('Failed to fetch inventory data')
            console.error('Inventory fetch error:', err)
        } finally {
            setLoading(false)
        }
    }

    // Fetch data on component mount and when pagination/sorting/search changes
    useEffect(() => {
        fetchInventory()
    }, [pagination.pageIndex, pagination.pageSize, sorting, globalFilter])

    const handleSearchKeyPress = (e) => {
        if (e.key === 'Enter') {
            setGlobalFilter(searchInput.trim())
            setPagination(prev => ({ ...prev, pageIndex: 0 }))
        }
    }

    const handleSearchClear = () => {
        setSearchInput('')
        setGlobalFilter('')
        setPagination(prev => ({ ...prev, pageIndex: 0 }))
    }

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        manualPagination: true,
        manualSorting: true,
        pageCount: totalPages,
        state: {
            sorting,
            globalFilter,
            pagination,
        },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        onPaginationChange: setPagination,
    })

    const canPreviousPage = pagination.pageIndex > 0
    const canNextPage = pagination.pageIndex < totalPages - 1

    // Calculate stats
    const totalItems = data.length
    const totalQuantity = data.reduce((acc, item) => acc + (item.totalQuantity || 0), 0)
    const totalReserved = data.reduce((acc, item) => acc + (item.reserved || 0), 0)
    const totalAvailable = data.reduce((acc, item) => acc + (item.available || 0), 0)
    const lowStockItems = data.filter(item => {
        const percentage = item.totalQuantity > 0 ? (item.available / item.totalQuantity) * 100 : 0
        return percentage <= 10
    }).length

    if (loading && data.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 pr-4">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white rounded-lg shadow-lg">
                        <div className="p-6 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600">Loading inventory...</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 pr-4">
            <div className=" mx-auto">
               

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Package className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Quantity</p>
                                <p className="text-2xl font-bold text-gray-900">{totalQuantity}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Available</p>
                                <p className="text-2xl font-bold text-gray-900">{totalAvailable}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <Archive className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Reserved</p>
                                <p className="text-2xl font-bold text-gray-900">{totalReserved}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <AlertTriangle className="h-6 w-6 text-red-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                                <p className="text-2xl font-bold text-gray-900">{lowStockItems}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {/* Table Card */}
                <div className="bg-white rounded-lg shadow-sm">
                    {/* Table Header */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">Inventory List</h2>
                            <div className="flex items-center space-x-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <input
                                        type="text"
                                        placeholder="Search inventory (Press Enter)..."
                                        value={searchInput}
                                        onChange={(e) => setSearchInput(e.target.value)}
                                        onKeyPress={handleSearchKeyPress}
                                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    {searchInput && (
                                        <button
                                            onClick={handleSearchClear}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                                {loading && (
                                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                                )}
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
                                {loading ? (
                                    <tr>
                                        <td colSpan={columns.length} className="px-6 py-12 text-center">
                                            <div className="flex items-center justify-center space-x-2">
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                                <span className="text-gray-500">Loading inventory...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : data.length === 0 ? (
                                    <tr>
                                        <td colSpan={columns.length} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center space-y-2">
                                                <Package className="h-12 w-12 text-gray-400" />
                                                <p className="text-gray-500">No inventory items found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    table.getRowModel().rows.map(row => (
                                        <tr key={row.id} className="hover:bg-gray-50 transition-colors">
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

                    {/* Pagination */}
                    {data.length > 0 && (
                        <div className="px-6 py-4 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-700">
                                        Showing {pagination.pageIndex * pagination.pageSize + 1} to{' '}
                                        {Math.min(
                                            (pagination.pageIndex + 1) * pagination.pageSize,
                                            totalElements
                                        )}{' '}
                                        of {totalElements} results
                                    </span>
                                    <select
                                        value={pagination.pageSize}
                                        onChange={(e) => setPagination(prev => ({
                                            ...prev,
                                            pageSize: Number(e.target.value),
                                            pageIndex: 0
                                        }))}
                                        className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        {[10, 20, 30, 40, 50].map(pageSize => (
                                            <option key={pageSize} value={pageSize}>
                                                Show {pageSize}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => setPagination(prev => ({ ...prev, pageIndex: 0 }))}
                                        disabled={!canPreviousPage || loading}
                                        className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                                    >
                                        <ChevronsLeft className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => setPagination(prev => ({ ...prev, pageIndex: prev.pageIndex - 1 }))}
                                        disabled={!canPreviousPage || loading}
                                        className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    <span className="text-sm text-gray-700">
                                        Page {pagination.pageIndex + 1} of {totalPages || 1}
                                    </span>
                                    <button
                                        onClick={() => setPagination(prev => ({ ...prev, pageIndex: prev.pageIndex + 1 }))}
                                        disabled={!canNextPage || loading}
                                        className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => setPagination(prev => ({ ...prev, pageIndex: totalPages - 1 }))}
                                        disabled={!canNextPage || loading}
                                        className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                                    >
                                        <ChevronsRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default InventoryTable