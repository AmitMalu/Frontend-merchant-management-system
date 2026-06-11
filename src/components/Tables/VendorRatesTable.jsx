import { useState, useMemo, useEffect } from 'react'
import { useReactTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel, flexRender, createColumnHelper } from '@tanstack/react-table'
import { Plus, Edit, Trash2, ChevronLeft, ChevronRight, Search, Eye, Building2, CreditCard, Calendar, DollarSign, Users, Loader2, Copy } from 'lucide-react'
import VendorRateForm from '../Forms/VendorRate'
import { getAllVendorRates, createVendorRate, updateVendorRate, deleteVendorRate } from '../../constants/API/vendorRates'
import VendorRateView from '../View/VendorRateView'
import { set } from 'react-hook-form'

const VendorRateList = () => {
    const [data, setData] = useState([])
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingData, setEditingData] = useState(null)
    const [isEdit, setIsEdit] = useState(false)
    const [globalFilter, setGlobalFilter] = useState('')
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [viewData, setViewData] = useState(null)
    const [isViewOpen, setIsViewOpen] = useState(false)
    const [isReuse, setIsReuse] = useState(false)


    const columnHelper = createColumnHelper()

    const handleView = (vendorData) => {
        setViewData(vendorData)
        setIsViewOpen(true)
    }

    const handleViewClose = () => {
        setViewData(null)
        setIsViewOpen(false)
    }

    // Fetch data on component mount
    useEffect(() => {
        fetchVendorRates()
    }, [])

    const fetchVendorRates = async () => {
        try {
            setLoading(true)
            const response = await getAllVendorRates()
            setData(response.data || response || [])
        } catch (error) {
            console.error('Error fetching vendor rates:', error)
            setData([])
        } finally {
            setLoading(false)
        }
    }

    const columns = useMemo(() => [
        columnHelper.accessor('id', {
            header: 'ID',
            cell: info => (
                <span className="font-mono text-sm">{info.getValue()}</span>
            ),
            size: 80
        }),
        columnHelper.accessor('vendorName', {
            header: 'Vendor Name',
            cell: info => (
                <div>
                    <div className="font-medium text-gray-900">{info.getValue() || 'N/A'}</div>
                    <div className="text-sm text-gray-500">{info.row.original.vendorId || 'N/A'}</div>
                </div>
            ),
        }),
        columnHelper.accessor('productName', {
            header: 'Product',
            cell: info => (
                <div>
                    <div className="font-medium text-gray-900">{info.getValue() || 'N/A'}</div>
                    <div className="text-sm text-gray-500">{info.row.original.productCode || 'N/A'}</div>
                </div>
            ),
        }),
        columnHelper.accessor('monthlyRent', {
            header: 'Monthly Rent',
            cell: info => (
                <div className="font-semibold text-green-700">
                    ₹{info.getValue() ? parseFloat(info.getValue()).toLocaleString('en-IN') : 'N/A'}
                </div>
            ),
            size: 120
        }),
        columnHelper.accessor('vendorCardRates', {
            header: 'Card Rates',
            cell: info => {
                const rates = info.getValue() || []
                const displayRates = rates.slice(0, 2)
                const hasMore = rates.length > 2

                return (
                    <div className="space-y-1">
                        {displayRates.length > 0 ? (
                            displayRates.map((rate, index) => (
                                <div key={index} className="text-xs">
                                    <span className="text-gray-600">{rate.cardType}:</span>{' '}
                                    <span className="font-medium">{rate.rate}%</span>
                                </div>
                            ))
                        ) : (
                            <span className="text-xs text-gray-500">No rates</span>
                        )}
                        {hasMore && (
                            <div className="text-xs text-gray-500">
                                +{rates.length - 2} more...
                            </div>
                        )}
                    </div>
                )
            },
            size: 150
        }),
        columnHelper.accessor('effectiveDate', {
            header: 'Effective Date',
            cell: info => (
                <div>
                    <div className="font-medium text-gray-900">
                        {info.getValue() ? new Date(info.getValue()).toLocaleDateString('en-IN') : 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500">
                        {info.row.original.expiryDate
                            ? `Exp: ${new Date(info.row.original.expiryDate).toLocaleDateString('en-IN')}`
                            : 'No expiry'
                        }
                    </div>
                </div>
            ),
        }),
        columnHelper.accessor(row => {
            // Calculate status based on dates
            const currentDate = new Date()
            const effectiveDate = new Date(row.effectiveDate)
            const expiryDate = row.expiryDate ? new Date(row.expiryDate) : null

            if (expiryDate && currentDate > expiryDate) {
                return 'Expired'
            } else if (currentDate >= effectiveDate) {
                return 'Active'
            } else {
                return 'Pending'
            }
        }, {
            id: 'status',
            header: 'Status',
            cell: info => {
                const status = info.getValue()
                let statusClass = ''

                switch (status) {
                    case 'Active':
                        statusClass = 'bg-green-100 text-green-800'
                        break
                    case 'Expired':
                        statusClass = 'bg-red-100 text-red-800'
                        break
                    case 'Pending':
                        statusClass = 'bg-yellow-100 text-yellow-800'
                        break
                    default:
                        statusClass = 'bg-gray-100 text-gray-800'
                }

                return (
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusClass}`}>
                        {status}
                    </span>
                )
            },
            size: 100
        }),
        columnHelper.display({
            id: 'actions',
            header: 'Actions',
            cell: info => (
                <div className="flex space-x-2">
                    <button
                        onClick={() => handleView(info.row.original)}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                        title="View Details"
                        disabled={submitting}
                    >
                        <Eye className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => handleEdit(info.row.original)}
                        className="p-1 text-green-600 hover:bg-green-100 rounded"
                        title="Edit Rate"
                        disabled={submitting}
                    >
                        <Edit className="h-4 w-4" />
                    </button>
                    {/* <button
                        onClick={() => handleDelete(info.row.original.id)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                        title="Delete Rate"
                        disabled={submitting}
                    >
                        <Trash2 className="h-4 w-4" />
                    </button> */}
                    <button
                        onClick={() => handleReuse(info.row.original)}
                        className="p-1 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                        title="Reuse Rates"
                    >
                        <Copy size={16} />
                    </button>
                </div>
            ),
            size: 100
        })
    ], [submitting])

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            globalFilter,
        },
        onGlobalFilterChange: setGlobalFilter,
        initialState: {
            pagination: {
                pageSize: 10
            }
        }
    })

    const handleAddVendorRate = () => {
        setEditingData(null)
        setIsEdit(false)
        setIsFormOpen(true)
    }

    const handleEdit = (vendorData) => {
        setEditingData(vendorData)
        setIsEdit(true)
        setIsFormOpen(true)
    }

    const handleReuse = (vendorData) => {
        setEditingData(vendorData)
        setIsReuse(true)
        setIsFormOpen(true)
    }


    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this vendor rate?')) {
            try {
                setSubmitting(true)
                await deleteVendorRate(id)
                await fetchVendorRates() // Refresh the data
            } catch (error) {
                console.error('Error deleting vendor rate:', error)
            } finally {
                setSubmitting(false)
            }
        }
    }

    const handleFormSubmit = async (formData) => {
        try {
            setSubmitting(true)
            let success = false

            if (isEdit) {
                await updateVendorRate(editingData.id, formData)
                success = true
            } else {
                await createVendorRate(formData)
                success = true
            }

            // Only close form and refresh data on success
            if (success) {
                await fetchVendorRates() // Refresh the data
                setIsFormOpen(false)
                setEditingData(null)
                setIsEdit(false)
                setIsReuse(false)
            }
        } catch (error) {
            console.error('Error submitting form:', error)
            // Don't close the form on error - let user retry
        } finally {
            setSubmitting(false)
        }
    }

    const handleFormCancel = () => {
        setIsFormOpen(false)
        setEditingData(null)
        setIsEdit(false)
        setIsReuse(false)
    }

    // Calculate stats safely based on backend structure
    const stats = useMemo(() => {
        const totalVendors = data.length

        // Calculate status for each record
        const currentDate = new Date()
        const activeRates = data.filter(d => {
            const effectiveDate = new Date(d.effectiveDate)
            const expiryDate = d.expiryDate ? new Date(d.expiryDate) : null
            return currentDate >= effectiveDate && (!expiryDate || currentDate <= expiryDate)
        }).length

        const expiredRates = data.filter(d =>
            d.expiryDate && new Date(d.expiryDate) < currentDate
        ).length

       

        return { totalVendors, activeRates, expiredRates }
    }, [data])

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading vendor rates...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 pr-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <CreditCard className="h-8 w-8 text-blue-600" />
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Vendor Rate Management</h1>
                                <p className="text-gray-600">Manage vendor rates and device rental pricing</p>
                            </div>
                        </div>
                        <button
                            onClick={handleAddVendorRate}
                            disabled={submitting}
                            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <Plus className="h-5 w-5" />
                            )}
                            <span>Add Rate</span>
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Users className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Rates</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalVendors}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Building2 className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Active Rates</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.activeRates}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <Calendar className="h-6 w-6 text-red-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Expired Rates</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.expiredRates}</p>
                            </div>
                        </div>
                    </div>
                   
                </div>

                {/* Table Card */}
                <div className="bg-white rounded-lg shadow">
                    {/* Table Header */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">Vendor Rate List</h2>
                            <div className="flex items-center space-x-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <input
                                        value={globalFilter ?? ''}
                                        onChange={(e) => setGlobalFilter(e.target.value)}
                                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Search vendor rates..."
                                        disabled={submitting}
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
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
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
                                {data.length === 0 ? (
                                    <tr>
                                        <td colSpan={columns.length} className="px-6 py-12 text-center">
                                            <div className="text-gray-500">
                                                <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                                <p className="text-lg font-medium">No vendor rates found</p>
                                                <p className="text-sm">Get started by adding a new vendor rate.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    table.getRowModel().rows.map(row => (
                                        <tr key={row.id} className="hover:bg-gray-50">
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
                    {data.length > 0 && (
                        <div className="px-6 py-4 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-700">
                                        Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
                                        {Math.min(
                                            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                                            table.getFilteredRowModel().rows.length
                                        )}{' '}
                                        of {table.getFilteredRowModel().rows.length} results
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => table.previousPage()}
                                        disabled={!table.getCanPreviousPage() || submitting}
                                        className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    <span className="text-sm text-gray-700">
                                        Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                                    </span>
                                    <button
                                        onClick={() => table.nextPage()}
                                        disabled={!table.getCanNextPage() || submitting}
                                        className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {/* Form Modal */}
            {isFormOpen && (
                <VendorRateForm
                    onSubmit={handleFormSubmit}
                    onCancel={handleFormCancel}
                    initialData={editingData}
                    isEdit={isEdit}
                    isReuse={isReuse}
                    submitting={submitting}
                />
            )}
            {/* View Modal */}
            <VendorRateView
                vendorData={viewData}
                onClose={handleViewClose}
                isOpen={isViewOpen}
            />
        </div>
    )
}

export default VendorRateList