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
    RotateCcw,
    Users,
    X,
    DollarSign
} from 'lucide-react';
import UniversalExportButtons from './UniversalExportButtons';
import { format } from 'date-fns';
import returnTransactionAPI from '../../constants/API/returnTransactionApi';

const ReturnTransactionReport = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [globalFilter, setGlobalFilter] = useState('');
    const [dateRange, setDateRange] = useState({
        startDate: '',
        endDate: ''
    });
    const [filters, setFilters] = useState({
        franchise: '',
        merchant: '',
        product: '',
        returnReason: ''
    });

    // Fetch return transactions data using the API function
    const fetchReturnTransactions = async () => {
        setLoading(true);
        setError(null);
        try {
            const transactions = await returnTransactionAPI.getAllReturnTransactions();
            
            // Transform data to include serial numbers in flat structure
            const transformedData = [];
            
            transactions.forEach(transaction => {
                if (transaction.serialNumbers && transaction.serialNumbers.length > 0) {
                    // Create a row for each serial number
                    transaction.serialNumbers.forEach(serial => {
                        transformedData.push({
                            id: `${transaction.id}-${serial.id}`,
                            transactionId: transaction.id,
                            returnNumber: transaction.returnNumber,
                            originalDeliveryNumber: transaction.originalDeliveryNumber,
                            franchiseId: transaction.franchiseId,
                            franchiseName: transaction.franchiseName,
                            merchantId: transaction.merchantId,
                            merchantName: transaction.merchantName,
                            productCode: transaction.productCode,
                            productName: transaction.productName,
                            returnDate: transaction.returnDate,
                            receivedBy: transaction.receivedBy,
                            originalQuantity: transaction.originalQuantity,
                            returnedQuantity: transaction.returnedQuantity,
                            returnReason: transaction.returnReason,
                            returnCondition: transaction.returnCondition,
                            actionTaken: transaction.actionTaken,
                            refundAmount: transaction.refundAmount,
                            approvedBy: transaction.approvedBy,
                            isWarrantyReturn: transaction.isWarrantyReturn,
                            isReplacementRequired: transaction.isReplacementRequired,
                            inspectionNotes: transaction.inspectionNotes,
                            remarks: transaction.remarks,
                            // Serial number details
                            serialId: serial.id,
                            sid: serial.sid,
                            mid: serial.mid,
                            tid: serial.tid,
                            vpaid: serial.vpaid,
                        });
                    });
                } else {
                    // If no serial numbers, show transaction without serial details
                    transformedData.push({
                        id: transaction.id,
                        transactionId: transaction.id,
                        returnNumber: transaction.returnNumber,
                        originalDeliveryNumber: transaction.originalDeliveryNumber,
                        franchiseId: transaction.franchiseId,
                        franchiseName: transaction.franchiseName,
                        merchantId: transaction.merchantId,
                        merchantName: transaction.merchantName,
                        productCode: transaction.productCode,
                        productName: transaction.productName,
                        returnDate: transaction.returnDate,
                        receivedBy: transaction.receivedBy,
                        originalQuantity: transaction.originalQuantity,
                        returnedQuantity: transaction.returnedQuantity,
                        returnReason: transaction.returnReason,
                        returnCondition: transaction.returnCondition,
                        actionTaken: transaction.actionTaken,
                        refundAmount: transaction.refundAmount,
                        approvedBy: transaction.approvedBy,
                        isWarrantyReturn: transaction.isWarrantyReturn,
                        isReplacementRequired: transaction.isReplacementRequired,
                        inspectionNotes: transaction.inspectionNotes,
                        remarks: transaction.remarks,
                        // Empty serial details
                        serialId: null,
                        sid: '-',
                        mid: '-',
                        tid: '-',
                        vpaid: '-',
                    });
                }
            });
            
            setData(transformedData);
        } catch (error) {
            console.error('Error fetching return transactions:', error);
            setError('Failed to fetch return transactions. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReturnTransactions();
    }, []);

    // Filter data based on date range
    const filteredData = useMemo(() => {
        let filtered = data;
        
        if (dateRange.startDate) {
            filtered = filtered.filter(item => 
                !item.returnDate || new Date(item.returnDate) >= new Date(dateRange.startDate)
            );
        }
        
        if (dateRange.endDate) {
            filtered = filtered.filter(item => 
                !item.returnDate || new Date(item.returnDate) <= new Date(dateRange.endDate)
            );
        }
        
        return filtered;
    }, [data, dateRange]);

    // Clear all filters function
    const clearFilters = () => {
        setGlobalFilter('');
        setDateRange({ startDate: '', endDate: '' });
        setFilters({
            franchise: '',
            merchant: '',
            product: '',
            returnReason: ''
        });
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
            header: 'Return Number',
            accessorKey: 'returnNumber',
            cell: ({ getValue }) => (
                <span className="font-semibold text-blue-600">{getValue()}</span>
            )
        },
        {
            header: 'Original Delivery',
            accessorKey: 'originalDeliveryNumber',
            cell: ({ getValue }) => (
                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                    {getValue()}
                </span>
            )
        },
        {
            header: 'Customer Type',
            accessorKey: 'customerType',
            cell: ({ row }) => {
                const franchiseName = row.original.franchiseName;
                const merchantName = row.original.merchantName;
                if (franchiseName) {
                    return <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">Franchise</span>;
                } else if (merchantName) {
                    return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Merchant</span>;
                }
                return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">Unknown</span>;
            }
        },
        {
            header: 'Customer Name',
            accessorKey: 'customerName',
            cell: ({ row }) => {
                const franchiseName = row.original.franchiseName;
                const merchantName = row.original.merchantName;
                return franchiseName || merchantName || '-';
            }
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
            header: 'Return Date',
            accessorKey: 'returnDate',
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
            header: 'Original Qty',
            accessorKey: 'originalQuantity',
            cell: ({ getValue }) => (
                <span className="text-center font-semibold text-gray-600">{getValue()}</span>
            )
        },
        {
            header: 'Returned Qty',
            accessorKey: 'returnedQuantity',
            cell: ({ getValue }) => (
                <span className="text-center font-semibold text-red-600">{getValue()}</span>
            )
        },
        {
            header: 'Return Reason',
            accessorKey: 'returnReason',
            cell: ({ getValue }) => {
                const reason = getValue();
                const colorMap = {
                    'Defective': 'bg-red-100 text-red-800',
                    'Wrong Product': 'bg-orange-100 text-orange-800',
                    'Not Satisfied': 'bg-yellow-100 text-yellow-800',
                    'Warranty Claim': 'bg-blue-100 text-blue-800',
                    'Damaged': 'bg-red-100 text-red-800'
                };
                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorMap[reason] || 'bg-gray-100 text-gray-800'}`}>
                        {reason || '-'}
                    </span>
                );
            }
        },
        {
            header: 'Return Condition',
            accessorKey: 'returnCondition',
            cell: ({ getValue }) => {
                const condition = getValue();
                const colorMap = {
                    'Good': 'bg-green-100 text-green-800',
                    'Fair': 'bg-yellow-100 text-yellow-800',
                    'Poor': 'bg-red-100 text-red-800',
                    'Damaged': 'bg-red-100 text-red-800'
                };
                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorMap[condition] || 'bg-gray-100 text-gray-800'}`}>
                        {condition || '-'}
                    </span>
                );
            }
        },
        {
            header: 'Action Taken',
            accessorKey: 'actionTaken',
            cell: ({ getValue }) => {
                const action = getValue();
                const colorMap = {
                    'Refund': 'bg-green-100 text-green-800',
                    'Replace': 'bg-blue-100 text-blue-800',
                    'Repair': 'bg-yellow-100 text-yellow-800',
                    'No Action': 'bg-gray-100 text-gray-800'
                };
                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorMap[action] || 'bg-gray-100 text-gray-800'}`}>
                        {action || '-'}
                    </span>
                );
            }
        },
        {
            header: 'Refund Amount',
            accessorKey: 'refundAmount',
            cell: ({ getValue }) => {
                const amount = getValue();
                return amount ? (
                    <span className="font-semibold text-green-600">₹{amount.toLocaleString()}</span>
                ) : '-';
            }
        },
        {
            header: 'Approved By',
            accessorKey: 'approvedBy',
            cell: ({ getValue }) => getValue() || '-'
        },
        {
            header: 'Warranty Return',
            accessorKey: 'isWarrantyReturn',
            cell: ({ getValue }) => {
                const isWarranty = getValue();
                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${isWarranty ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                        {isWarranty ? 'Yes' : 'No'}
                    </span>
                );
            }
        },
        {
            header: 'Replacement Required',
            accessorKey: 'isReplacementRequired',
            cell: ({ getValue }) => {
                const isReplacement = getValue();
                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${isReplacement ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'}`}>
                        {isReplacement ? 'Yes' : 'No'}
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
            header: 'Inspection Notes',
            accessorKey: 'inspectionNotes',
            cell: ({ getValue }) => {
                const notes = getValue();
                return notes ? (
                    <span className="text-xs text-gray-600 max-w-xs truncate" title={notes}>
                        {notes}
                    </span>
                ) : '-';
            }
        },
        {
            header: 'Remarks',
            accessorKey: 'remarks',
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

    // Calculate summary data - CORRECTED VERSION
    const summary = useMemo(() => {
        // Get unique transactions first to avoid double counting
        const uniqueTransactions = [...new Set(filteredData.map(item => item.transactionId))];
        const uniqueTransactionData = uniqueTransactions.map(transactionId => 
            filteredData.find(item => item.transactionId === transactionId)
        );
        
        const totalSerials = filteredData.filter(item => item.serialId).length;
        const uniqueFranchises = [...new Set(filteredData.filter(item => item.franchiseName).map(item => item.franchiseName))];
        const uniqueMerchants = [...new Set(filteredData.filter(item => item.merchantName).map(item => item.merchantName))];
        const uniqueProducts = [...new Set(filteredData.map(item => item.productCode))];
        
        // Calculate customer type breakdown based on unique transactions
        const customerTypeBreakdown = uniqueTransactionData.reduce((acc, item) => {
            if (item.franchiseName) {
                acc['Franchise'] = (acc['Franchise'] || 0) + 1;
            } else if (item.merchantName) {
                acc['Merchant'] = (acc['Merchant'] || 0) + 1;
            } else {
                acc['Unknown'] = (acc['Unknown'] || 0) + 1;
            }
            return acc;
        }, {});

        // Calculate return reason breakdown based on unique transactions
        const returnReasonBreakdown = uniqueTransactionData.reduce((acc, item) => {
            const reason = item.returnReason || 'Unknown';
            acc[reason] = (acc[reason] || 0) + 1;
            return acc;
        }, {});

        // Calculate action taken breakdown based on unique transactions
        const actionTakenBreakdown = uniqueTransactionData.reduce((acc, item) => {
            const action = item.actionTaken || 'Unknown';
            acc[action] = (acc[action] || 0) + 1;
            return acc;
        }, {});

        // Calculate return condition breakdown based on unique transactions
        const returnConditionBreakdown = uniqueTransactionData.reduce((acc, item) => {
            const condition = item.returnCondition || 'Unknown';
            acc[condition] = (acc[condition] || 0) + 1;
            return acc;
        }, {});

        // Calculate totals from unique transactions only
        const totalOriginalQuantity = uniqueTransactionData.reduce((sum, item) => sum + (item.originalQuantity || 0), 0);
        const totalReturnedQuantity = uniqueTransactionData.reduce((sum, item) => sum + (item.returnedQuantity || 0), 0);
        const totalRefundAmount = uniqueTransactionData.reduce((sum, item) => sum + (item.refundAmount || 0), 0);
        
        // Calculate warranty and replacement counts
        const warrantyReturns = uniqueTransactionData.filter(item => item.isWarrantyReturn).length;
        const replacementRequired = uniqueTransactionData.filter(item => item.isReplacementRequired).length;

        return {
            totalTransactions: uniqueTransactions.length,
            totalSerialNumbers: totalSerials,
            totalFranchises: uniqueFranchises.length,
            totalMerchants: uniqueMerchants.length,
            totalProducts: uniqueProducts.length,
            totalOriginalQuantity,
            totalReturnedQuantity,
            totalRefundAmount,
            warrantyReturns,
            replacementRequired,
            returnRate: totalOriginalQuantity > 0 ? ((totalReturnedQuantity / totalOriginalQuantity) * 100).toFixed(2) : 0,
            averageRefundAmount: uniqueTransactions.length > 0 ? (totalRefundAmount / uniqueTransactions.length).toFixed(2) : 0,
            customerTypeBreakdown,
            returnReasonBreakdown,
            actionTakenBreakdown,
            returnConditionBreakdown
        };
    }, [filteredData]);

    // Initialize table with filtered data
    const table = useReactTable({
        data: filteredData,
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
            'Transaction ID', 'Return Number', 'Original Delivery', 'Customer Type', 'Customer Name', 
            'Product Code', 'Product Name', 'Return Date', 'Received By', 'Original Qty', 'Returned Qty',
            'Return Reason', 'Return Condition', 'Action Taken', 'Refund Amount', 'Approved By',
            'Warranty Return', 'Replacement Required', 'SID', 'MID', 'TID', 'VPAID',
            'Inspection Notes', 'Remarks'
        ],
        keys: [
            'transactionId', 'returnNumber', 'originalDeliveryNumber', 'customerType', 'customerName',
            'productCode', 'productName', 'returnDate', 'receivedBy', 'originalQuantity', 'returnedQuantity',
            'returnReason', 'returnCondition', 'actionTaken', 'refundAmount', 'approvedBy',
            'isWarrantyReturn', 'isReplacementRequired', 'sid', 'mid', 'tid', 'vpaid',
            'inspectionNotes', 'remarks'
        ],
        widths: [12, 15, 15, 12, 20, 15, 25, 12, 15, 10, 10, 15, 12, 12, 15, 15, 12, 15, 15, 15, 15, 15, 30, 25]
    };

    const excelTransform = (data) => {
        return data.map(item => ({
            'Transaction ID': item.transactionId,
            'Return Number': item.returnNumber,
            'Original Delivery': item.originalDeliveryNumber,
            'Customer Type': item.franchiseName ? 'Franchise' : item.merchantName ? 'Merchant' : 'Unknown',
            'Customer Name': item.franchiseName || item.merchantName || '',
            'Product Code': item.productCode,
            'Product Name': item.productName,
            'Return Date': item.returnDate ? format(new Date(item.returnDate), 'dd MMM yyyy') : '',
            'Received By': item.receivedBy,
            'Original Qty': item.originalQuantity,
            'Returned Qty': item.returnedQuantity,
            'Return Reason': item.returnReason || '',
            'Return Condition': item.returnCondition || '',
            'Action Taken': item.actionTaken || '',
            'Refund Amount': item.refundAmount || '',
            'Approved By': item.approvedBy || '',
            'Warranty Return': item.isWarrantyReturn ? 'Yes' : 'No',
            'Replacement Required': item.isReplacementRequired ? 'Yes' : 'No',
            'SID': item.sid,
            'MID': item.mid,
            'TID': item.tid,
            'VPAID': item.vpaid,
            'Inspection Notes': item.inspectionNotes || '',
            'Remarks': item.remarks || ''
        }));
    };

    const summaryConfig = [
        { key: 'totalTransactions', label: 'Total Return Transactions', formatter: (val) => val.toLocaleString() },
        { key: 'totalOriginalQuantity', label: 'Total Original Quantity', formatter: (val) => val.toLocaleString() },
        { key: 'totalReturnedQuantity', label: 'Total Returned Quantity', formatter: (val) => val.toLocaleString() },
        { key: 'totalRefundAmount', label: 'Total Refund Amount (₹)', formatter: (val) => val.toLocaleString() },
        { key: 'returnRate', label: 'Return Rate (%)', formatter: (val) => val },
        { key: 'warrantyReturns', label: 'Warranty Returns', formatter: (val) => val.toLocaleString() },
        { key: 'replacementRequired', label: 'Replacements Required', formatter: (val) => val.toLocaleString() },
        { key: 'averageRefundAmount', label: 'Avg Refund Amount (₹)', formatter: (val) => val }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <span className="ml-3 text-gray-600">Loading return transactions...</span>
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
                        onClick={fetchReturnTransactions}
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
                        <RotateCcw className="w-8 h-8 text-indigo-600" />
                        Return Transaction Report
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Comprehensive report of all return transactions with detailed analysis and serial number tracking
                    </p>
                </div>
                <UniversalExportButtons
                    data={filteredData}
                    filename="return_transactions_report"
                    title="Return Transaction Report"
                    columns={exportColumns}
                    excelTransform={excelTransform}
                    summary={summary}
                    summaryConfig={summaryConfig}
                />
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-red-100 text-sm font-medium">Total Returns</p>
                            <p className="text-3xl font-bold">{summary.totalTransactions}</p>
                        </div>
                        <RotateCcw className="w-8 h-8 text-red-200" />
                    </div>
                </div>

                <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-orange-100 text-sm font-medium">Returned Quantity</p>
                            <p className="text-3xl font-bold">{summary.totalReturnedQuantity}</p>
                        </div>
                        <Package className="w-8 h-8 text-orange-200" />
                    </div>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-sm font-medium">Total Refunds</p>
                            <p className="text-3xl font-bold">₹{summary.totalRefundAmount.toLocaleString()}</p>
                        </div>
                        <DollarSign className="w-8 h-8 text-green-200" />
                    </div>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-sm font-medium">Return Rate</p>
                            <p className="text-3xl font-bold">{summary.returnRate}%</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-purple-200" />
                    </div>
                </div>
            </div>

            {/* Breakdown Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Customer Type Breakdown */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Type</h3>
                    <div className="space-y-3">
                        {Object.entries(summary.customerTypeBreakdown).map(([type, count]) => (
                            <div key={type} className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600">{type}</span>
                                <span className="text-lg font-bold text-gray-900">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Return Reason Breakdown */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Return Reasons</h3>
                    <div className="space-y-3">
                        {Object.entries(summary.returnReasonBreakdown).map(([reason, count]) => (
                            <div key={reason} className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600">{reason}</span>
                                <span className="text-lg font-bold text-gray-900">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Action Taken Breakdown */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions Taken</h3>
                    <div className="space-y-3">
                        {Object.entries(summary.actionTakenBreakdown).map(([action, count]) => (
                            <div key={action} className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600">{action}</span>
                                <span className="text-lg font-bold text-gray-900">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Return Condition Breakdown */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Return Condition</h3>
                    <div className="space-y-3">
                        {Object.entries(summary.returnConditionBreakdown).map(([condition, count]) => (
                            <div key={condition} className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600">{condition}</span><span className="text-lg font-bold text-gray-900">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Additional Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Return Analysis</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">Warranty Returns</span>
                            <span className="text-lg font-bold text-blue-600">{summary.warrantyReturns}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">Replacements Required</span>
                            <span className="text-lg font-bold text-orange-600">{summary.replacementRequired}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">Average Refund</span>
                            <span className="text-lg font-bold text-green-600">₹{summary.averageRefundAmount}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quantity Analysis</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">Original Quantity</span>
                            <span className="text-lg font-bold text-gray-600">{summary.totalOriginalQuantity}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">Returned Quantity</span>
                            <span className="text-lg font-bold text-red-600">{summary.totalReturnedQuantity}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">Return Rate</span>
                            <span className="text-lg font-bold text-purple-600">{summary.returnRate}%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="relative">
                        {/* <label className="block text-xs font-medium text-gray-700 mb-1">Search</label> */}
                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search all fields..."
                            value={globalFilter ?? ''}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        {/* <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label> */}
                        <input
                            type="date"
                            value={dateRange.startDate}
                            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        {/* <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label> */}
                        <input
                            type="date"
                            value={dateRange.endDate}
                            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>

                    <button
                        onClick={fetchReturnTransactions}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                    >
                        Fetch
                    </button>

                    <button
                        onClick={clearFilters}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium flex items-center gap-2"
                    >
                        <X className="w-4 h-4" />
                        Clear Filters
                    </button>
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
                            {table.getRowModel().rows.map((row) => (
                                <tr key={row.id} className="hover:bg-gray-50">
                                    {row.getVisibleCells().map((cell) => (
                                        <td key={cell.id} className="px-4 py-3 whitespace-nowrap text-sm">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))}
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

export default ReturnTransactionReport;