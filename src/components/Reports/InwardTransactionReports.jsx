import React, { useState, useEffect, useMemo } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    flexRender,
} from '@tanstack/react-table';
import { 
    ChevronUp, 
    ChevronDown, 
    Search, 
    Calendar,
    Package,
    TrendingUp,
    FileBarChart,
    X
} from 'lucide-react';
import UniversalExportButtons from './UniversalExportButtons';
import { format } from 'date-fns';
import { getAllInwardTransactions } from '../../constants/API/InwardTransactionAPI';

const InwardTransactionReport = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [globalFilter, setGlobalFilter] = useState('');
    const [dateRange, setDateRange] = useState({
        startDate: '',
        endDate: ''
    });
    const [filters, setFilters] = useState({
        vendor: '',
        product: '',
        condition: ''
    });

    // Fetch inward transactions data with date filtering
    const fetchInwardTransactions = async () => {
        setLoading(true);
        setError(null);
        try {
            const transactions = await getAllInwardTransactions();
            
            // Apply date filtering if dates are provided
            let filteredTransactions = transactions;
            
            if (dateRange.startDate || dateRange.endDate) {
                filteredTransactions = transactions.filter(transaction => {
                    const transactionDate = new Date(transaction.receivedDate);
                    const startDate = dateRange.startDate ? new Date(dateRange.startDate) : null;
                    const endDate = dateRange.endDate ? new Date(dateRange.endDate) : null;
                    
                    // Set end date to end of day to include the entire end date
                    if (endDate) {
                        endDate.setHours(23, 59, 59, 999);
                    }
                    
                    let withinRange = true;
                    
                    if (startDate && transactionDate < startDate) {
                        withinRange = false;
                    }
                    
                    if (endDate && transactionDate > endDate) {
                        withinRange = false;
                    }
                    
                    return withinRange;
                });
            }
            
            // Transform filtered data to include serial numbers in flat structure
            const transformedData = [];
            
            filteredTransactions.forEach(transaction => {
                if (transaction.serialNumbers && transaction.serialNumbers.length > 0) {
                    // Create a row for each serial number
                    transaction.serialNumbers.forEach(serial => {
                        transformedData.push({
                            id: `${transaction.id}-${serial.id}`,
                            transactionId: transaction.id,
                            invoiceNumber: transaction.invoiceNumber,
                            vendorName: transaction.vendorName,
                            productCode: transaction.productCode,
                            productName: transaction.productName,
                            receivedDate: transaction.receivedDate,
                            receivedBy: transaction.receivedBy,
                            quantity: transaction.quantity,
                            batchNumber: transaction.batchNumber,
                            warrantyPeriod: transaction.warrantyPeriod,
                            productCondition: transaction.productCondition,
                            remark: transaction.remark,
                            // Serial number details
                            serialId: serial.id,
                            sid: serial.sid,
                            mid: serial.mid,
                            tid: serial.tid,
                            vpaid: serial.vpaid
                        });
                    });
                } else {
                    // If no serial numbers, show transaction without serial details
                    transformedData.push({
                        id: transaction.id,
                        transactionId: transaction.id,
                        invoiceNumber: transaction.invoiceNumber,
                        vendorName: transaction.vendorName,
                        productCode: transaction.productCode,
                        productName: transaction.productName,
                        receivedDate: transaction.receivedDate,
                        receivedBy: transaction.receivedBy,
                        quantity: transaction.quantity,
                        batchNumber: transaction.batchNumber,
                        warrantyPeriod: transaction.warrantyPeriod,
                        productCondition: transaction.productCondition,
                        remark: transaction.remark,
                        // Empty serial details
                        serialId: null,
                        sid: '-',
                        mid: '-',
                        tid: '-',
                        vpaid: '-'
                    });
                }
            });
            
            setData(transformedData);
        } catch (error) {
            console.error('Error fetching inward transactions:', error);
            setError('Failed to fetch inward transactions. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Initial load without date filters
    useEffect(() => {
        fetchInwardTransactions();
    }, []); // Only run on component mount

    // Handle fetch button click
    const handleFetch = () => {
        fetchInwardTransactions();
    };

    // Clear date filters
    const clearDateFilters = () => {
        setDateRange({ startDate: '', endDate: '' });
    };

    // Handle clear all filters
    const clearAllFilters = () => {
        setDateRange({ startDate: '', endDate: '' });
        setGlobalFilter('');
    };

    // Table columns definition
    const columns = useMemo(() => [
        {
            header: 'Transaction ID',
            accessorKey: 'transactionId',
            cell: ({ getValue }) => (
                <span className="font-mono text-sm">{getValue()}</span>
            )
        },
        {
            header: 'Invoice Number',
            accessorKey: 'invoiceNumber',
            cell: ({ getValue }) => (
                <span className="font-semibold text-blue-600">{getValue()}</span>
            )
        },
        {
            header: 'Vendor',
            accessorKey: 'vendorName',
        },
        {
            header: 'Product Code',
            accessorKey: 'productCode',
            cell: ({ getValue }) => (
                <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                    {getValue()}
                </span>
            )
        },
        {
            header: 'Product Name',
            accessorKey: 'productName',
        },
        {
            header: 'Received Date',
            accessorKey: 'receivedDate',
            cell: ({ getValue }) => {
                const date = getValue();
                return date ? format(new Date(date), 'dd MMM yyyy') : '-';
            }
        },
        {
            header: 'Received By',
            accessorKey: 'receivedBy',
        },
        {
            header: 'Batch Number',
            accessorKey: 'batchNumber',
            cell: ({ getValue }) => getValue() || '-'
        },
        {
            header: 'Warranty (Months)',
            accessorKey: 'warrantyPeriod',
            cell: ({ getValue }) => getValue() || '-'
        },
        {
            header: 'Condition',
            accessorKey: 'productCondition',
            cell: ({ getValue }) => {
                const condition = getValue();
                const colorMap = {
                    'New': 'bg-green-100 text-green-800',
                    'Used': 'bg-yellow-100 text-yellow-800',
                    'Refurbished': 'bg-blue-100 text-blue-800',
                    'Damaged': 'bg-red-100 text-red-800'
                };
                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorMap[condition] || 'bg-gray-100 text-gray-800'}`}>
                        {condition}
                    </span>
                );
            }
        },
        {
            header: 'SID',
            accessorKey: 'sid',
            cell: ({ getValue }) => (
                <span className="font-mono text-xs bg-indigo-50 px-2 py-1 rounded">
                    {getValue()}
                </span>
            )
        },
        {
            header: 'MID',
            accessorKey: 'mid',
            cell: ({ getValue }) => (
                <span className="font-mono text-xs bg-purple-50 px-2 py-1 rounded">
                    {getValue()}
                </span>
            )
        },
        {
            header: 'TID',
            accessorKey: 'tid',
            cell: ({ getValue }) => (
                <span className="font-mono text-xs bg-emerald-50 px-2 py-1 rounded">
                    {getValue()}
                </span>
            )
        },
        {
            header: 'VPAID',
            accessorKey: 'vpaid',
            cell: ({ getValue }) => (
                <span className="font-mono text-xs bg-orange-50 px-2 py-1 rounded">
                    {getValue()}
                </span>
            )
        },
        {
            header: 'Remarks',
            accessorKey: 'remark',
            cell: ({ getValue }) => {
                const remark = getValue();
                return remark ? (
                    <span className="text-xs text-gray-600 max-w-xs truncate" title={remark}>
                        {remark}
                    </span>
                ) : '-';
            }
        }
    ], []);

    // Calculate summary data - FIXED VERSION
    const summary = useMemo(() => {
        // Get unique transactions to avoid counting quantity multiple times
        const uniqueTransactionsMap = new Map();
        
        data.forEach(item => {
            if (!uniqueTransactionsMap.has(item.transactionId)) {
                uniqueTransactionsMap.set(item.transactionId, {
                    id: item.transactionId,
                    vendorName: item.vendorName,
                    productCode: item.productCode,
                    productName: item.productName,
                    productCondition: item.productCondition,
                    quantity: item.quantity // This is the actual transaction quantity
                });
            }
        });
        
        const uniqueTransactions = Array.from(uniqueTransactionsMap.values());
        const totalSerials = data.filter(item => item.serialId).length;
        const uniqueVendors = [...new Set(data.map(item => item.vendorName))];
        const uniqueProducts = [...new Set(data.map(item => item.productCode))];
        
        // Calculate condition breakdown from unique transactions, not flattened data
        const conditionBreakdown = uniqueTransactions.reduce((acc, transaction) => {
            acc[transaction.productCondition] = (acc[transaction.productCondition] || 0) + transaction.quantity;
            return acc;
        }, {});

        // Calculate total quantity from unique transactions only
        const totalQuantity = uniqueTransactions.reduce((sum, transaction) => sum + (transaction.quantity || 0), 0);

        return {
            totalTransactions: uniqueTransactions.length,
            totalSerialNumbers: totalSerials,
            totalVendors: uniqueVendors.length,
            totalProducts: uniqueProducts.length,
            totalQuantity: totalQuantity, // Now correctly calculated
            conditionBreakdown, // Now shows quantity per condition, not row count
            averageQuantityPerTransaction: uniqueTransactions.length > 0 ? 
                (totalQuantity / uniqueTransactions.length).toFixed(2) : 0
        };
    }, [data]);

    // Initialize table
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        state: {
            globalFilter,
        },
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: 'includesString',
    });

    // Export configurations
    const exportColumns = {
        headers: [
            'Transaction ID', 'Invoice Number', 'Vendor', 'Product Code', 'Product Name',
            'Received Date', 'Received By', 'Batch Number', 'Warranty (Months)',
            'Condition', 'SID', 'MID', 'TID', 'VPAID', 'Remarks'
        ],
        keys: [
            'transactionId', 'invoiceNumber', 'vendorName', 'productCode', 'productName',
            'receivedDate', 'receivedBy', 'batchNumber', 'warrantyPeriod',
            'productCondition', 'sid', 'mid', 'tid', 'vpaid', 'remark'
        ],
        widths: [12, 15, 20, 15, 25, 12, 15, 12, 10, 12, 15, 15, 15, 15, 30]
    };

    const excelTransform = (data) => {
        return data.map(item => ({
            'Transaction ID': item.transactionId,
            'Invoice Number': item.invoiceNumber,
            'Vendor': item.vendorName,
            'Product Code': item.productCode,
            'Product Name': item.productName,
            'Received Date': item.receivedDate ? format(new Date(item.receivedDate), 'dd MMM yyyy') : '',
            'Received By': item.receivedBy,
            'Batch Number': item.batchNumber || '',
            'Warranty (Months)': item.warrantyPeriod || '',
            'Condition': item.productCondition,
            'SID': item.sid,
            'MID': item.mid,
            'TID': item.tid,
            'VPAID': item.vpaid,
            'Remarks': item.remark || ''
        }));
    };

    const summaryConfig = [
        { key: 'totalTransactions', label: 'Total Transactions', formatter: (val) => val.toLocaleString() },
        { key: 'totalVendors', label: 'Total Vendors', formatter: (val) => val.toLocaleString() },
        { key: 'totalProducts', label: 'Total Products', formatter: (val) => val.toLocaleString() },
        { key: 'totalQuantity', label: 'Total Quantity', formatter: (val) => val.toLocaleString() },
        { key: 'averageQuantityPerTransaction', label: 'Avg Qty/Transaction', formatter: (val) => val }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <span className="ml-3 text-gray-600">Loading inward transactions...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="text-red-600 mb-2">⚠️ Error</div>
                    <div className="text-gray-600 mb-4">{error}</div>
                    <button
                        onClick={fetchInwardTransactions}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <FileBarChart className="w-8 h-8 text-indigo-600" />
                        Inward Transaction Report
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Comprehensive report of all inward transactions with serial number details
                    </p>
                    {/* Date Range Indicator */}
                    {(dateRange.startDate || dateRange.endDate) && (
                        <div className="mt-2 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-indigo-600" />
                            <span className="text-sm text-indigo-600 font-medium">
                                Filtered: {dateRange.startDate ? format(new Date(dateRange.startDate), 'dd MMM yyyy') : 'All'} 
                                {' → '}
                                {dateRange.endDate ? format(new Date(dateRange.endDate), 'dd MMM yyyy') : 'All'}
                            </span>
                            <button
                                onClick={clearDateFilters}
                                className="text-red-500 hover:text-red-700 p-1"
                                title="Clear date filters"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
                <UniversalExportButtons
                    data={data}
                    filename="inward_transactions_report"
                    title="Inward Transaction Report"
                    columns={exportColumns}
                    excelTransform={excelTransform}
                    summary={summary}
                    summaryConfig={summaryConfig}
                />
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm font-medium">Total Transactions</p>
                            <p className="text-3xl font-bold">{summary.totalTransactions}</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-blue-200" />
                    </div>
                </div>

                {/* <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-emerald-100 text-sm font-medium">Serial Numbers</p>
                            <p className="text-3xl font-bold">{summary.totalSerialNumbers}</p>
                        </div>
                        <Package className="w-8 h-8 text-emerald-200" />
                    </div>
                </div> */}

                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-sm font-medium">Total Quantity</p>
                            <p className="text-3xl font-bold">{summary.totalQuantity}</p>
                        </div>
                        <Package className="w-8 h-8 text-purple-200" />
                    </div>
                </div>

                <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-orange-100 text-sm font-medium">Unique Vendors</p>
                            <p className="text-3xl font-bold">{summary.totalVendors}</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-orange-200" />
                    </div>
                </div>
            </div>

            {/* Condition Breakdown */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Condition Breakdown (by Quantity)</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(summary.conditionBreakdown).map(([condition, quantity]) => (
                        <div key={condition} className="text-center">
                            <div className="text-2xl font-bold text-gray-900">{quantity}</div>
                            <div className="text-sm text-gray-600">{condition}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search all fields..."
                            value={globalFilter ?? ''}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>

                    <div className="relative">
                        <Calendar className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="date"
                            placeholder="Start Date"
                            value={dateRange.startDate}
                            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>

                    <div className="relative">
                        <Calendar className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="date"
                            placeholder="End Date"
                            value={dateRange.endDate}
                            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>

                    <button
                        onClick={handleFetch}
                        disabled={loading}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Fetching...
                            </>
                        ) : (
                            <>
                                <Calendar className="w-4 h-4" />
                                Fetch
                            </>
                        )}
                    </button>

                    <button
                        onClick={clearAllFilters}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                    >
                        <X className="w-4 h-4" />
                        Clear All
                    </button>
                </div>

                {/* Active Filters Display */}
                <div className="mt-4 flex flex-wrap gap-2">
                    {dateRange.startDate && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                            From: {format(new Date(dateRange.startDate), 'dd MMM yyyy')}
                            <button
                                onClick={() => setDateRange(prev => ({ ...prev, startDate: '' }))}
                                className="ml-1 text-indigo-600 hover:text-indigo-800"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    )}
                    {dateRange.endDate && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                            To: {format(new Date(dateRange.endDate), 'dd MMM yyyy')}
                            <button
                                onClick={() => setDateRange(prev => ({ ...prev, endDate: '' }))}
                                className="ml-1 text-indigo-600 hover:text-indigo-800"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    )}
                    {globalFilter && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                            Search: "{globalFilter}"
                            <button
                                onClick={() => setGlobalFilter('')}
                                className="ml-1 text-gray-600 hover:text-gray-800"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <th
                                            key={header.id}
                                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                            onClick={header.column.getToggleSortingHandler()}
                                        >
                                            <div className="flex items-center gap-2">
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                                {{
                                                    asc: <ChevronUp className="w-4 h-4" />,
                                                    desc: <ChevronDown className="w-4 h-4" />,
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
                                    <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">
                                        {dateRange.startDate || dateRange.endDate ? 
                                            'No transactions found for the selected date range.' : 
                                            'No transactions found.'
                                        }
                                    </td>
                                </tr>
                            ) : (
                                table.getRowModel().rows.map((row) => (
                                    <tr key={row.id} className="hover:bg-gray-50">
                                        {row.getVisibleCells().map((cell) => (
                                            <td key={cell.id} className="px-4 py-3 whitespace-nowrap text-sm">
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
                <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-700">
                            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
                            {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)}{' '}
                            of {table.getFilteredRowModel().rows.length} results
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        
                        <span className="text-sm text-gray-700">
                            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                        </span>
                        
                        <button
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                        
                        <select
                            value={table.getState().pagination.pageSize}
                            onChange={(e) => table.setPageSize(Number(e.target.value))}
                            className="text-sm border border-gray-300 rounded px-2 py-1"
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
        </div>
    );
};

export default InwardTransactionReport;