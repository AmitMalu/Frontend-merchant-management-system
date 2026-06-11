import { useState, useMemo, useEffect } from 'react'
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    flexRender
} from '@tanstack/react-table'

import { Plus, Edit, Trash2, Eye, ChevronLeft, ChevronRight, X, Copy, DollarSign, IndianRupee, Search, Package, Users, CreditCard, Building2 } from 'lucide-react'

import { toast } from 'react-toastify'

import PricingSchemeFormModal from '../Forms/PricingForm'
import schemeApi from '../../constants/API/schemeApi'
import { set } from 'react-hook-form'

const SchemeList = () => {
    const [schemes, setSchemes] = useState([])
    const [loading, setLoading] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingScheme, setEditingScheme] = useState(null)
    const [viewingScheme, setViewingScheme] = useState(null)
    const [globalFilter, setGlobalFilter] = useState('')
    const [sorting, setSorting] = useState([])
    const [isReuse, setIsReuse] = useState(false) // Add this state
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    })
    const [totalPages, setTotalPages] = useState(0)
    const [totalElements, setTotalElements] = useState(0)

    const loadSchemes = async () => {
        try {
            setLoading(true)

            const response = await schemeApi.getAllSchemes({
                page: pagination.pageIndex,
                size: pagination.pageSize,
                sortBy: 'schemeCode',
                sortDir: 'asc',
            })

            setSchemes(response.data.content)
            setTotalPages(response.data.totalPages)
            setTotalElements(response.data.totalElements)

        } catch (error) {
            const errorMessage =
                error?.response?.data?.error || 'Failed to load pricing schemes'
            toast.error(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    // Load schemes on component mount
    useEffect(() => {
        loadSchemes()
    }, [pagination.pageIndex, pagination.pageSize])

    const columns = useMemo(() => [
        {
            accessorKey: 'schemeCode',
            header: 'Scheme Code',
            cell: ({ row }) => (
                <div className="font-medium text-gray-900">
                    {row.getValue('schemeCode')}
                </div>
            ),
        },
        {
            accessorKey: 'customerType',
            header: 'Customer Type',
            cell: ({ row }) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${row.getValue('customerType') === 'franchise'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-green-100 text-green-800'
                    }`}>
                    {row.getValue('customerType') === 'franchise' ? 'Franchise' : 'Direct Merchant'}
                </span>
            ),
        },
        {
            accessorKey: 'productCategoryName',
            header: 'Product Category',
            cell: ({ row }) => (
                <div className="text-gray-900">
                    {row.getValue('productCategoryName')}
                </div>
            ),
        },
        {
            accessorKey: 'rentalByMonth',
            header: 'Monthly Rental',
            cell: ({ row }) => (
                <div className="text-gray-900 font-medium">
                    ₹{row.getValue('rentalByMonth')}
                </div>
            ),
        },
        {
            accessorKey: 'cardRates',
            header: 'Card Types & Rates',
            cell: ({ row }) => {
                const cardRates = row.getValue('cardRates') || []
                const customerType = row.getValue('customerType')
                const maxVisible = 2

                return (
                    <div className="text-xs text-gray-600 max-w-xs">
                        {cardRates.slice(0, maxVisible).map((rate, index) => (
                            <div key={index} className="mb-1">
                                <span className="font-medium text-gray-800">{rate.cardName}:</span>
                                {customerType === 'franchise' ? (
                                    <span className="ml-1">
                                        F: {rate.franchiseRate}% | M: {rate.merchantRate}%
                                    </span>
                                ) : (
                                    <span className="ml-1">{rate.rate}%</span>
                                )}
                            </div>
                        ))}
                        {cardRates.length > maxVisible && (
                            <div className="text-gray-500 italic">
                                ...and {cardRates.length - maxVisible} more
                            </div>
                        )}
                    </div>
                )
            },
        },
        {
            accessorKey: 'description',
            header: 'Description',
            cell: ({ row }) => (
                <div className="text-gray-600 max-w-xs truncate">
                    {row.getValue('description')}
                </div>
            ),
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleView(row.original)}
                        className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="View details"
                    >
                        <Eye size={16} />
                    </button>
                    <button
                        onClick={() => handleEdit(row.original)}
                        className="p-1 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                        title="Edit scheme"
                    >
                        <Edit size={16} />
                    </button>
                    {/* <button
                        onClick={() => handleDelete(row.original.id, row.original.schemeCode)}
                        className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete scheme"
                    >
                        <Trash2 size={16} />
                    </button> */}
                    <button
                        onClick={() => handleReuse(row.original)}
                        className="p-1 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                        title="Reuse scheme"
                    >
                        <Copy size={16} />
                    </button>
                </div>
            ),
        },
    ], [])

    const table = useReactTable({
        data: schemes,
        columns,

        manualPagination: true,
        pageCount: totalPages,

        state: {
            pagination,
            sorting,
            globalFilter,
        },

        onPaginationChange: setPagination,
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,

        getCoreRowModel: getCoreRowModel(),
    })


    const handleCreate = () => {
        setEditingScheme(null)
        setIsModalOpen(true)
    }

    const handleEdit = (scheme) => {
        setEditingScheme(scheme)
        setIsModalOpen(true)
    }
    const handleReuse = (scheme) => {
        setEditingScheme(scheme)
        setIsReuse(true) // Set to true for reuse mode
        setIsModalOpen(true)
    }


    const handleView = (scheme) => {
        setViewingScheme(scheme)
    }

    const handleDelete = (schemeId, schemeCode) => {
        const confirmDelete = () => {
            toast.dismiss()
            performDelete(schemeId, schemeCode)
        }

        const cancelDelete = () => {
            toast.dismiss()
        }

        toast.warn(
            <div className="flex flex-col space-y-2">
                <span>Delete "{schemeCode}"?</span>
                <div className="flex space-x-2">
                    <button
                        onClick={confirmDelete}
                        className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    >
                        Delete
                    </button>
                    <button
                        onClick={cancelDelete}
                        className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                    >
                        Cancel
                    </button>
                </div>
            </div>,
            {
                autoClose: false,
                closeOnClick: false,
                draggable: false,
                closeButton: false
            }
        )
    }

    const performDelete = async (schemeId, schemeCode) => {
        try {
            await schemeApi.deleteScheme(schemeId)
            loadSchemes()
            toast.success(`${schemeCode} deleted successfully!`)
        } catch (error) {
            const errorMessage = error?.response?.data?.error || 'Failed to delete pricing scheme'
            toast.error(errorMessage)
        }
    }

    const handleSubmit = async (data) => {
        try {
            if (editingScheme && !isReuse) {
                await schemeApi.updateScheme(editingScheme.id, data)
                toast.success('Pricing scheme updated successfully!')
            } else {
                await schemeApi.createScheme(data)
                toast.success('Pricing scheme created successfully!')
            }
            loadSchemes()
            setIsModalOpen(false)
            setEditingScheme(null)
            setIsReuse(false) // Reset reuse state after submission
        } catch (error) {
            const errorMessage = error?.response?.data?.error ||
                (editingScheme ? 'Failed to update pricing scheme' : 'Failed to create pricing scheme')
            toast.error(errorMessage)
        }
    }

    const handleCancel = () => {
        setIsModalOpen(false)
        setEditingScheme(null)
        setIsReuse(false) // Reset reuse state on cancel
    }

    // Calculate stats
    const totalSchemes = totalElements
    const franchiseSchemes = schemes.filter(s => s.customerType === 'franchise').length
    const merchantSchemes = schemes.filter(s => s.customerType === 'direct_merchant').length
    const totalRent = totalSchemes > 0
        ? Math.round(schemes.reduce((acc, s) => acc + (s.rentalByMonth || 0), 0))
        : 0

    if (loading) {
        return (
            <div className="max-w-8xl mx-auto p-6">
                <div className="bg-white rounded-lg shadow-lg">
                    <div className="p-6 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading pricing schemes...</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 pr-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-center">
                        <div className='flex items-center space-x-3'>
                            <IndianRupee className="h-8 w-8 text-blue-600" />
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Pricing Scheme Management</h1>
                                <p className="text-gray-600">Manage pricing schemes for franchises and direct merchants</p>
                            </div>
                        </div>
                        <button
                            onClick={handleCreate}
                            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Plus size={20} />
                            <span>Add Scheme</span>
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Package className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Schemes</p>
                                <p className="text-2xl font-bold text-gray-900">{totalSchemes}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Building2 className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Franchise Schemes</p>
                                <p className="text-2xl font-bold text-gray-900">{franchiseSchemes}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Users className="h-6 w-6 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Merchant Schemes</p>
                                <p className="text-2xl font-bold text-gray-900">{merchantSchemes}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <CreditCard className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Monthly Rent</p>
                                <p className="text-2xl font-bold text-gray-900">₹{totalRent}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table Card */}
                <div className="bg-white rounded-lg shadow-sm">
                    {/* Table Header */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">Pricing Schemes List</h2>
                            <div className="flex items-center space-x-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <input
                                        value={globalFilter ?? ''}
                                        onChange={(e) => setGlobalFilter(e.target.value)}
                                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Search schemes..."
                                        disabled={loading}
                                    />
                                </div>
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
                                                    {{
                                                        asc: ' 🔼',
                                                        desc: ' 🔽',
                                                    }[header.column.getIsSorted()] ?? null}
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {table.getRowModel().rows.length === 0 ? (
                                    <tr>
                                        <td colSpan={columns.length} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center space-y-2">
                                                <Package className="h-12 w-12 text-gray-400" />
                                                <p className="text-gray-500">No pricing schemes found</p>
                                                <button
                                                    onClick={handleCreate}
                                                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                                >
                                                    Add First Scheme
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    table.getRowModel().rows.map(row => (
                                        <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                            {row.getVisibleCells().map(cell => (
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

                    {/* Pagination */}
                    {table.getRowModel().rows.length > 0 && (
                        <div className="px-6 py-4 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-700">
                                        Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
                                        {Math.min(
                                            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                                            table.getFilteredRowModel().rows.length
                                        )}{' '}
                                        of {totalElements} results
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => table.previousPage()}
                                        disabled={!table.getCanPreviousPage() || loading}
                                        className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    <span className="text-sm text-gray-700">
                                        Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                                    </span>
                                    <button
                                        onClick={() => table.nextPage()}
                                        disabled={!table.getCanNextPage() || loading}
                                        className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <PricingSchemeFormModal
                    onCancel={handleCancel}
                    onSubmit={handleSubmit}
                    initialData={editingScheme}
                    isEdit={!!editingScheme && !isReuse}
                    isReuse={isReuse}
                />
            )}

            {/* View Modal */}
            {viewingScheme && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b bg-gray-50 rounded-t-lg">
                            <h2 className="text-2xl font-bold text-gray-800">Scheme Details</h2>
                            <button
                                onClick={() => setViewingScheme(null)}
                                className="p-2 hover:bg-gray-200 rounded-md transition-colors"
                            >
                                <X size={24} className="text-gray-600" />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Scheme Code</label>
                                    <p className="text-gray-900">{viewingScheme.schemeCode}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Type</label>
                                    <p className="text-gray-900 capitalize">{viewingScheme.customerType?.replace('_', ' ')}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Rental</label>
                                    <p className="text-gray-900">₹{viewingScheme.rentalByMonth}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Card Types</label>
                                    <p className="text-gray-900">{viewingScheme.cardRates?.length || 0} types</p>
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Card Rates</label>
                                <div className="space-y-2">
                                    {viewingScheme.cardRates?.map((rate, index) => (
                                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                            <span className="font-medium">{rate.cardName}</span>
                                            <div className="text-sm text-gray-600">
                                                {viewingScheme.customerType === 'franchise'
                                                    ? `Franchise: ${rate.franchiseRate}% | Merchant: ${rate.merchantRate}%`
                                                    : `Rate: ${rate.rate}%`
                                                }
                                            </div>
                                        </div>
                                    )) || <p className="text-gray-500">No card rates configured</p>}
                                </div>
                            </div>

                            {viewingScheme.description && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <p className="text-gray-900">{viewingScheme.description}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default SchemeList