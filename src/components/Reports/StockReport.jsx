// StockReport.jsx
import React, { useState, useEffect } from 'react';
import { 
    useReactTable, 
    getCoreRowModel, 
    getFilteredRowModel, 
    getPaginationRowModel,
    getSortedRowModel,
    flexRender 
} from '@tanstack/react-table';
import { 
    Search, 
    Filter, 
    Package, 
    TrendingUp, 
    Users, 
    RotateCcw,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    ArrowUpDown
} from 'lucide-react';
import UniversalExportButtons from './UniversalExportButtons';
import api from '../../constants/API/axiosInstance';

const StockReport = () => {
    const [data, setData] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: '',
        productId: '',
        merchantId: '',
        franchiseId: '',
        fromDate: '',
        toDate: ''
    });
    const [globalFilter, setGlobalFilter] = useState('');
    const [sorting, setSorting] = useState([]);

    useEffect(() => {
        fetchStockReport();
    }, []);

    const fetchStockReport = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams();
            
            // Add filters to query params
            if (filters.status) queryParams.append('status', filters.status);
            if (filters.productId) queryParams.append('productId', filters.productId);
            if (filters.merchantId) queryParams.append('merchantId', filters.merchantId);
            if (filters.franchiseId) queryParams.append('franchiseId', filters.franchiseId);
            
            // Format dates to ISO format if present
            if (filters.fromDate) {
                const fromDateTime = new Date(filters.fromDate + 'T00:00:00').toISOString();
                queryParams.append('fromDate', fromDateTime);
            }
            if (filters.toDate) {
                const toDateTime = new Date(filters.toDate + 'T23:59:59').toISOString();
                queryParams.append('toDate', toDateTime);
            }

            const response = await api.get(`/reports/stock?${queryParams.toString()}`);
            
            setData(response.data.stockReports || []);
            setSummary(response.data.summary || {});
        } catch (error) {
            console.error('Error fetching stock report:', error);
            // Optional: Add toast notification here
            alert('Failed to fetch stock report. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            accessorKey: 'serialNumberId',
            header: 'ID',
            size: 80,
        },
        {
            accessorKey: 'sid',
            header: 'SID',
            size: 120,
        },
        {
            accessorKey: 'mid',
            header: 'MID',
            size: 120,
        },
        {
            accessorKey: 'tid',
            header: 'TID',
            size: 120,
        },
        {
            accessorKey: 'mobNumber',
            header: 'Mobile',
            size: 120,
        },
        {
            accessorKey: 'productName',
            header: 'Product',
            size: 150,
        },
        {
            accessorKey: 'status',
            header: 'Status',
            size: 130,
            cell: ({ getValue }) => {
                const status = getValue();
                const statusStyles = {
                    'AVAILABLE': 'bg-green-100 text-green-800 border-green-200',
                    'ALLOCATED': 'bg-blue-100 text-blue-800 border-blue-200',
                    'RETURNED': 'bg-yellow-100 text-yellow-800 border-yellow-200'
                };
                return (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
                        {status?.replace(/_/g, ' ')}
                    </span>
                );
            }
        },
        {
            accessorKey: 'allocatedToName',
            header: 'Allocated To',
            size: 150,
            cell: ({ row }) => {
                const name = row.original.allocatedToName;
                const type = row.original.allocatedToType;
                return name ? (
                    <div>
                        <div className="font-medium">{name}</div>
                        <div className="text-xs text-gray-500">{type}</div>
                    </div>
                ) : '-';
            }
        },
        {
            accessorKey: 'inwardReceivedDate',
            header: 'Inward Date',
            size: 140,
            cell: ({ getValue }) => {
                const date = getValue();
                return date ? new Date(date).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                }) : '-';
            }
        },
        {
            accessorKey: 'dispatchDate',
            header: 'Dispatch Date',
            size: 140,
            cell: ({ getValue }) => {
                const date = getValue();
                return date ? new Date(date).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                }) : '-';
            }
        }
    ];

    const table = useReactTable({
        data,
        columns,
        state: {
            globalFilter,
            sorting,
        },
        onGlobalFilterChange: setGlobalFilter,
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        initialState: {
            pagination: {
                pageSize: 10,
            },
        },
    });

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const applyFilters = () => {
        fetchStockReport();
    };

    const resetFilters = () => {
        setFilters({
            status: '',
            productId: '',
            merchantId: '',
            franchiseId: '',
            fromDate: '',
            toDate: ''
        });
        setTimeout(() => fetchStockReport(), 100);
    };

    // Export configurations
    const excelTransform = (data) => {
        return data.map(item => ({
            'ID': item.serialNumberId,
            'SID': item.sid || '-',
            'MID': item.mid || '-',
            'TID': item.tid || '-',
            'VPAID': item.vpaid || '-',
            'Product': item.productName || '-',
            'Brand': item.brand || '-',
            'Model': item.model || '-',
            'Category': item.productCategory || '-',
            'Status': item.status || '-',
            'Allocated To': item.allocatedToName || '-',
            'Allocation Type': item.allocatedToType || '-',
            'Mobile Number': item.mobNumber || '-',
            'Invoice Number': item.invoiceNumber || '-',
            'Delivery Number': item.deliveryNumber || '-',
            'Inward Date': item.inwardReceivedDate ? new Date(item.inwardReceivedDate).toLocaleDateString() : '-',
            'Dispatch Date': item.dispatchDate ? new Date(item.dispatchDate).toLocaleDateString() : '-',
            'Return Date': item.returnDate ? new Date(item.returnDate).toLocaleDateString() : '-',
            'Product Condition': item.productCondition || '-',
            'Return Reason': item.returnReason || '-',
        }));
    };

    const pdfTransform = (data) => {
        return data.map(item => ({
            id: item.serialNumberId,
            sid: item.sid || '-',
            product: item.productName || '-',
            status: item.status || '-',
            allocatedTo: item.allocatedToName || '-',
            mobile: item.mobNumber || '-',
            inwardDate: item.inwardReceivedDate ? new Date(item.inwardReceivedDate).toLocaleDateString() : '-',
        }));
    };

    const exportColumns = {
        headers: ['ID', 'SID', 'Product', 'Status', 'Allocated To', 'Mobile', 'Inward Date'],
        keys: ['id', 'sid', 'product', 'status', 'allocatedTo', 'mobile', 'inwardDate'],
        widths: [10, 15, 20, 15, 20, 15, 15]
    };

    const summaryConfig = [
        { key: 'totalStock', label: 'Total Stock', formatter: (val) => val.toLocaleString() },
        { key: 'availableStock', label: 'Available Stock', formatter: (val) => val.toLocaleString() },
        { key: 'allocatedStock', label: 'Allocated Stock', formatter: (val) => val.toLocaleString() },
        { key: 'returnedStock', label: 'Returned Stock', formatter: (val) => val.toLocaleString() },
        { key: 'allocatedToMerchants', label: 'Allocated to Merchants', formatter: (val) => val.toLocaleString() },
        { key: 'allocatedToFranchises', label: 'Allocated to Franchises', formatter: (val) => val.toLocaleString() },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 font-medium">Loading stock report...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Stock Report</h1>
                    <p className="text-gray-600">Comprehensive inventory tracking and allocation overview</p>
                </div>

                {/* Summary Cards */}
                {summary && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Stock</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">
                                        {summary.totalStock?.toLocaleString() || 0}
                                    </p>
                                </div>
                                <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                                    <Package className="h-6 w-6 text-indigo-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Available Stock</p>
                                    <p className="text-3xl font-bold text-green-600 mt-2">
                                        {summary.availableStock?.toLocaleString() || 0}
                                    </p>
                                </div>
                                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                                    <TrendingUp className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Allocated Stock</p>
                                    <p className="text-3xl font-bold text-blue-600 mt-2">
                                        {summary.allocatedStock?.toLocaleString() || 0}
                                    </p>
                                </div>
                                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Users className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Returned Stock</p>
                                    <p className="text-3xl font-bold text-yellow-600 mt-2">
                                        {summary.returnedStock?.toLocaleString() || 0}
                                    </p>
                                </div>
                                <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                    <RotateCcw className="h-6 w-6 text-yellow-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 md:col-span-2 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Allocated to Merchants</p>
                                    <p className="text-3xl font-bold text-purple-600 mt-2">
                                        {summary.allocatedToMerchants?.toLocaleString() || 0}
                                    </p>
                                </div>
                                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <Users className="h-6 w-6 text-purple-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 md:col-span-2 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Allocated to Franchises</p>
                                    <p className="text-3xl font-bold text-pink-600 mt-2">
                                        {summary.allocatedToFranchises?.toLocaleString() || 0}
                                    </p>
                                </div>
                                <div className="h-12 w-12 bg-pink-100 rounded-lg flex items-center justify-center">
                                    <Users className="h-6 w-6 text-pink-600" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters Section */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
                    <div className="flex items-center gap-2 mb-4">
                        <Filter className="h-5 w-5 text-gray-600" />
                        <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Status
                            </label>
                            <select
                                name="status"
                                value={filters.status}
                                onChange={handleFilterChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            >
                                <option value="">All Status</option>
                                <option value="AVAILABLE">Available</option>
                                <option value="ALLOCATED">Allocated</option>
                                <option value="RETURNED">Returned</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Product ID
                            </label>
                            <input
                                type="number"
                                name="productId"
                                value={filters.productId}
                                onChange={handleFilterChange}
                                placeholder="Enter product ID"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Merchant ID
                            </label>
                            <input
                                type="number"
                                name="merchantId"
                                value={filters.merchantId}
                                onChange={handleFilterChange}
                                placeholder="Enter merchant ID"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Franchise ID
                            </label>
                            <input
                                type="number"
                                name="franchiseId"
                                value={filters.franchiseId}
                                onChange={handleFilterChange}
                                placeholder="Enter franchise ID"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                From Date
                            </label>
                            <input
                                type="date"
                                name="fromDate"
                                value={filters.fromDate}
                                onChange={handleFilterChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                To Date
                            </label>
                            <input
                                type="date"
                                name="toDate"
                                value={filters.toDate}
                                onChange={handleFilterChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button
                            onClick={applyFilters}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm hover:shadow-md"
                        >
                            Apply Filters
                        </button>
                        <button
                            onClick={resetFilters}
                            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                        >
                            Reset
                        </button>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex-1 max-w-md">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={globalFilter ?? ''}
                                        onChange={(e) => setGlobalFilter(e.target.value)}
                                        placeholder="Search across all columns..."
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>
                            
                            <UniversalExportButtons
                                data={data}
                                filename="stock_report"
                                title="Stock Report"
                                columns={exportColumns}
                                excelTransform={excelTransform}
                                pdfTransform={pdfTransform}
                                summary={summary}
                                summaryConfig={summaryConfig}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                {table.getHeaderGroups().map(headerGroup => (
                                    <tr key={headerGroup.id}>
                                        {headerGroup.headers.map(header => (
                                            <th
                                                key={header.id}
                                                className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                                            >
                                                {header.isPlaceholder ? null : (
                                                    <div
                                                        className={`flex items-center gap-2 ${
                                                            header.column.getCanSort() ? 'cursor-pointer select-none hover:text-indigo-600' : ''
                                                        }`}
                                                        onClick={header.column.getToggleSortingHandler()}
                                                    >
                                                        {flexRender(
                                                            header.column.columnDef.header,
                                                            header.getContext()
                                                        )}
                                                        {header.column.getCanSort() && (
                                                            <ArrowUpDown className="h-4 w-4 text-gray-400" />
                                                        )}
                                                    </div>
                                                )}
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {table.getRowModel().rows.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={columns.length}
                                            className="px-6 py-12 text-center text-gray-500"
                                        >
                                            <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                            <p className="text-lg font-medium">No stock records found</p>
                                            <p className="text-sm mt-1">Try adjusting your filters</p>
                                        </td>
                                    </tr>
                                ) : (
                                    table.getRowModel().rows.map(row => (
                                        <tr
                                            key={row.id}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            {row.getVisibleCells().map(cell => (
                                                <td
                                                    key={cell.id}
                                                    className="px-6 py-4 text-sm text-gray-900"
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

                    {/* Pagination */}
                    {data.length > 0 && (
                        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div className="text-sm text-gray-700">
                                    Showing{' '}
                                    <span className="font-medium">
                                        {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
                                    </span>{' '}
                                    to{' '}
                                    <span className="font-medium">
                                        {Math.min(
                                            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                                            data.length
                                        )}
                                    </span>{' '}
                                    of <span className="font-medium">{data.length}</span> results
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => table.setPageIndex(0)}
                                        disabled={!table.getCanPreviousPage()}
                                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronsLeft className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => table.previousPage()}
                                        disabled={!table.getCanPreviousPage()}
                                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </button>
                                    
                                    <span className="px-4 py-2 text-sm font-medium text-gray-700">
                                        Page {table.getState().pagination.pageIndex + 1} of{' '}
                                        {table.getPageCount()}
                                    </span>

                                    <button
                                        onClick={() => table.nextPage()}
                                        disabled={!table.getCanNextPage()}
                                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronRight className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                        disabled={!table.getCanNextPage()}
                                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronsRight className="h-5 w-5" />
                                    </button>

                                    <select
                                        value={table.getState().pagination.pageSize}
                                        onChange={(e) => table.setPageSize(Number(e.target.value))}
                                        className="ml-4 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                    >
                                        {[10, 20, 30, 40, 50].map((pageSize) => (
                                            <option key={pageSize} value={pageSize}>
                                                Show {pageSize}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StockReport;