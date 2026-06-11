import React, { useState, useMemo } from 'react';
import { useReactTable, getCoreRowModel, flexRender, createColumnHelper } from '@tanstack/react-table';
import { FileText, TrendingUp, TrendingDown, DollarSign, AlertCircle, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../../constants/API/axiosInstance';
import UniversalExportButtons from '../UniversalExportButtons';
import MTransReportFilters from './MTransReportFilters';

const MerchantTransactionReports = ({ filters: commonFilters, userType }) => {
    const [transactions, setTransactions] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [exportingFull, setExportingFull] = useState(false);
    const [reportInfo, setReportInfo] = useState(null);
    const [pagination, setPagination] = useState({
        currentPage: 0,
        pageSize: 100,
        totalPages: 0,
        totalElements: 0,
        hasNext: false,
        hasPrevious: false
    });
    const [localFilters, setLocalFilters] = useState({
        ...commonFilters,
        transactionType: 'CREDIT'
    });
    const [merchantType, setMerchantType] = useState('direct');
    const customerId = localStorage.getItem('customerId');
    const isMerchant = userType === 'merchant';

    const fetchTransactions = async (page = 0) => {
        setLoading(true);
        try {
            const params = {
                startDate: `${localFilters.startDate}T00:00:00`,
                endDate: `${localFilters.endDate}T23:59:59`,
                status: 'SETTLED',
                dateFilterType: localFilters.dateFilterType,
                ...(localFilters.transactionType !== 'All' && { transactionType: localFilters.transactionType }),
            };

            // If "ALL" is selected, directly trigger export instead of paginated fetch
            if (localFilters.selectedMerchant === 'ALL') {
                const exportParams = {
                    ...params,
                    merchantType: merchantType.toUpperCase(),
                    includeTaxes: false
                };

                const response = await api.get('/v1/reports/transactions/merchant/export-all', {
                    params: exportParams,
                    responseType: 'blob',
                });

                const blob = new Blob([response.data], {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                });

                const downloadUrl = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = downloadUrl;

                const disposition = response.headers['content-disposition'];
                const filename = disposition
                    ? disposition.split('filename=')[1].replace(/"/g, '')
                    : `merchant_transactions_${merchantType.toLowerCase()}_${localFilters.startDate}_to_${localFilters.endDate}.xlsx`;

                link.setAttribute('download', filename);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(downloadUrl);

                // Don't set transactions - show message instead
                setTransactions([]);
                setSummary(null);
                setReportInfo({
                    exportTriggered: true,
                    message: `Export initiated for all ${merchantType} merchants`
                });
            } else {
                // Normal paginated fetch for specific merchant
                const response = await api.get('/v1/reports/transactions/merchant/enhanced', {
                    params: {
                        ...params,
                        merchantId: isMerchant ? customerId : localFilters.selectedMerchant,
                        page: page,
                        size: pagination.pageSize,
                    }
                });

                if (response.data.success) {
                    setTransactions(response.data.data.transactions);
                    setSummary(response.data.data.summary);
                    setReportInfo({
                        reportGeneratedAt: response.data.data.reportGeneratedAt,
                        reportType: response.data.data.reportType,
                    });
                    setPagination({
                        currentPage: page,
                        pageSize: pagination.pageSize,
                        totalPages: response.data.data.totalPages,
                        totalElements: response.data.data.totalElements,
                        hasNext: response.data.data.hasNext,
                        hasPrevious: response.data.data.hasPrevious
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
            alert('Error fetching transaction data');
        } finally {
            setLoading(false);
        }
    };

    const exportFullReport = async () => {
        setExportingFull(true);
        try {
            const params = {
                startDate: `${localFilters.startDate}T00:00:00`,
                endDate: `${localFilters.endDate}T23:59:59`,
                status: 'SETTLED',
                dateFilterType: localFilters.dateFilterType,
                ...(localFilters.transactionType !== 'All' && { transactionType: localFilters.transactionType }),
                includeTaxes: false,
            };

            if (localFilters.selectedMerchant === 'ALL') {
                params.merchantType = merchantType.toUpperCase();
            } else {
                params.merchantId = isMerchant ? customerId : localFilters.selectedMerchant;
            }

            const response = await api.get('/v1/reports/transactions/merchant/export-all', {
                params,
                responseType: 'blob',
            });

            const blob = new Blob([response.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });

            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;

            const disposition = response.headers['content-disposition'];
            const filename = disposition
                ? disposition.split('filename=')[1].replace(/"/g, '')
                : `merchant_transactions_${merchantType.toLowerCase()}_${localFilters.startDate}_to_${localFilters.endDate}.xlsx`;

            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.error('Error exporting full report:', error);
            alert('Error exporting full report');
        } finally {
            setExportingFull(false);
        }
    };

    const handlePageChange = (newPage) => {
        fetchTransactions(newPage);
    };

    const availableFields = useMemo(() => {
        if (transactions.length === 0) return new Set();

        const fields = new Set();
        transactions.forEach(txn => {
            Object.keys(txn).forEach(key => {
                if (txn[key] !== null && txn[key] !== undefined && txn[key] !== '') {
                    fields.add(key);
                }
            });
        });
        return fields;
    }, [transactions]);

    const columnDefinitions = useMemo(() => {
        const columnHelper = createColumnHelper();
        return {
            customTxnId: columnHelper.accessor('customTxnId', {
                header: 'System ID',
                cell: info => <span className="font-mono text-xs text-gray-900">{info.getValue()}</span>
            }),
            txnId: columnHelper.accessor('txnId', {
                header: 'Transaction ID',
                cell: info => <span className="font-mono text-xs text-gray-900">{info.getValue()}</span>
            }),
            actionOnBalance: columnHelper.accessor('actionOnBalance', {
                header: 'Action',
                cell: info => (
                    <span className={`text-xs font-semibold ${info.getValue() === 'CREDIT' ? 'text-green-600' : 'text-red-600'}`}>
                        {info.getValue()}
                    </span>
                )
            }),
            txnDate: columnHelper.accessor('txnDate', {
                header: 'Date',
                cell: info => <span className="text-xs text-gray-700">{new Date(info.getValue()).toLocaleDateString()}</span>
            }),
            settleDate: columnHelper.accessor('settleDate', {
                header: 'Settled On',
                cell: info => <span className="text-xs text-gray-600">{new Date(info.getValue()).toLocaleDateString()}</span>
            }),
            service: columnHelper.accessor('service', {
                header: 'Service',
                cell: info => <span className="text-xs text-gray-700">{info.getValue()}</span>
            }),
            txnAmount: columnHelper.accessor('txnAmount', {
                header: 'Transaction Amount',
                cell: info => <span className="font-semibold text-xs text-blue-600">₹{(info.getValue() || 0).toLocaleString()}</span>
            }),
            settleAmount: columnHelper.accessor('settleAmount', {
                header: 'Net Amount',
                cell: info => <span className="font-semibold text-xs text-green-600">₹{(info.getValue() || 0).toLocaleString()}</span>
            }),
            systemFee: columnHelper.accessor('systemFee', {
                header: 'System Fee',
                cell: info => <span className="font-semibold text-xs text-red-600">₹{(info.getValue() || 0).toLocaleString()}</span>
            }),
            commissionAmount: columnHelper.accessor('commissionAmount', {
                header: 'Commission',
                cell: info => <span className="font-semibold text-xs text-orange-600">₹{(info.getValue() || 0).toLocaleString()}</span>
            }),
            franchiseName: columnHelper.accessor('franchiseName', {
                header: 'Franchise',
                cell: info => <span className="text-xs text-gray-700">{info.getValue() || '-'}</span>
            }),
            authCode: columnHelper.accessor('authCode', {
                header: 'Auth Code',
                cell: info => <span className="text-xs text-gray-600">{info.getValue() || '-'}</span>
            }),
            tid: columnHelper.accessor('tid', {
                header: 'TID',
                cell: info => <span className="text-xs text-gray-600">{info.getValue() || '-'}</span>
            }),
            brandType: columnHelper.accessor('brandType', {
                header: 'Brand',
                cell: info => <span className="text-xs font-medium text-purple-600">{info.getValue() || '-'}</span>
            }),
            cardType: columnHelper.accessor('cardType', {
                header: 'Card Type',
                cell: info => <span className="text-xs text-blue-600">{info.getValue() || '-'}</span>
            }),
            cardClassification: columnHelper.accessor('cardClassification', {
                header: 'Card Class',
                cell: info => <span className="text-xs text-gray-600">{info.getValue() || '-'}</span>
            }),
            merchantName: columnHelper.accessor('merchantName', {
                header: 'Merchant',
                cell: info => <span className="text-xs text-gray-900 font-medium">{info.getValue() || '-'}</span>
            }),
            state: columnHelper.accessor('state', {
                header: 'State',
                cell: info => <span className="text-xs text-gray-600">{info.getValue() || '-'}</span>
            }),
            settlementPercentage: columnHelper.accessor('settlementPercentage', {
                header: 'Settlement Rate',
                cell: info => <span className="text-xs text-indigo-600">{info.getValue() || 0}%</span>
            }),
            merchantRate: columnHelper.accessor('merchantRate', {
                header: 'Merchant Rate',
                cell: info => <span className="text-xs text-purple-600">{info.getValue() || 0}%</span>
            }),
            franchiseRate: columnHelper.accessor('franchiseRate', {
                header: 'Franchise Rate',
                cell: info => <span className="text-xs text-green-600">{info.getValue() || 0}%</span>
            }),
            commissionRate: columnHelper.accessor('commissionRate', {
                header: 'Commission Rate',
                cell: info => <span className="text-xs text-orange-600">{info.getValue() || 0}%</span>
            })
        };
    }, []);

    const columnPriority = [
        'customTxnId', 'txnId', 'actionOnBalance', 'txnDate', 'settleDate', 'service', 'txnAmount', 'settleAmount',
        'systemFee', 'commissionAmount', 'merchantName', 'franchiseName', 'brandType',
        'cardType', 'authCode', 'tid', 'cardClassification', 'state',
        'settlementPercentage', 'merchantRate', 'franchiseRate', 'commissionRate'
    ];

    const columns = useMemo(() => {
        return columnPriority
            .filter(field => availableFields.has(field))
            .map(field => columnDefinitions[field])
            .filter(Boolean);
    }, [availableFields, columnDefinitions]);

    const table = useReactTable({
        data: transactions,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    const resetReportState = () => {
        setTransactions([]);
        setSummary(null);
        setReportInfo(null);
        setPagination({
            currentPage: 0,
            pageSize: 100,
            totalPages: 0,
            totalElements: 0,
            hasNext: false,
            hasPrevious: false
        });
    };

    const handleFiltersChange = (newFilters) => {
        setLocalFilters(prev => ({ ...prev, ...newFilters }));
        resetReportState();
    };

    const exportConfig = useMemo(() => {
        const fieldMapping = {
            customTxnId: { header: 'System ID', format: val => val },
            txnId: { header: 'Transaction ID', format: val => val },
            actionOnBalance: { header: 'Action', format: val => val },
            txnDate: { header: 'Transaction Date', format: val => new Date(val).toLocaleString() },
            settleDate: { header: 'Settled On', format: val => new Date(val).toLocaleString() },
            service: { header: 'Service', format: val => val },
            txnAmount: { header: 'Transaction Amount (₹)', format: val => val },
            settleAmount: { header: 'Net Amount (₹)', format: val => val },
            systemFee: { header: 'System Fee (₹)', format: val => val },
            commissionAmount: { header: 'Commission (₹)', format: val => val },
            authCode: { header: 'Auth Code', format: val => val || '-' },
            tid: { header: 'TID', format: val => val || '-' },
            brandType: { header: 'Brand Type', format: val => val || '-' },
            cardType: { header: 'Card Type', format: val => val || '-' },
            cardClassification: { header: 'Card Classification', format: val => val || '-' },
            merchantName: { header: 'Merchant Name', format: val => val || '-' },
            franchiseName: { header: 'Franchise Name', format: val => val || '-' },
            state: { header: 'State', format: val => val || '-' },
            settlementPercentage: { header: 'Settlement Rate (%)', format: val => val },
            merchantRate: { header: 'Merchant Rate (%)', format: val => val },
            franchiseRate: { header: 'Franchise Rate (%)', format: val => val },
            commissionRate: { header: 'Commission Rate (%)', format: val => val }
        };

        const availableColumns = columnPriority.filter(field => availableFields.has(field));

        return {
            headers: availableColumns.map(field => fieldMapping[field].header),
            keys: availableColumns
        };
    }, [availableFields]);

    const excelTransform = (data) => {
        return data.map(transaction => {
            const row = {};
            exportConfig.keys.forEach(key => {
                const fieldMapping = {
                    customTxnId: { header: 'System ID', format: val => val },
                    txnId: { header: 'Transaction ID', format: val => val },
                    actionOnBalance: { header: 'Action', format: val => val },
                    txnDate: { header: 'Transaction Date', format: val => new Date(val).toLocaleString() },
                    settleDate: { header: 'Settled On', format: val => new Date(val).toLocaleString() },
                    service: { header: 'Service', format: val => val },
                    txnAmount: { header: 'Transaction Amount', format: val => val },
                    settleAmount: { header: 'Net Amount', format: val => val },
                    systemFee: { header: 'System Fee', format: val => val },
                    commissionAmount: { header: 'Commission', format: val => val },
                    authCode: { header: 'Auth Code', format: val => val || '-' },
                    tid: { header: 'TID', format: val => val || '-' },
                    brandType: { header: 'Brand Type', format: val => val || '-' },
                    cardType: { header: 'Card Type', format: val => val || '-' },
                    cardClassification: { header: 'Card Classification', format: val => val || '-' },
                    merchantName: { header: 'Merchant Name', format: val => val || '-' },
                    franchiseName: { header: 'Franchise Name', format: val => val || '-' },
                    state: { header: 'State', format: val => val || '-' },
                    settlementPercentage: { header: 'Settlement Rate', format: val => `${val || 0}%` },
                    merchantRate: { header: 'Merchant Rate', format: val => `${val || 0}%` },
                    franchiseRate: { header: 'Franchise Rate', format: val => `${val || 0}%` },
                    commissionRate: { header: 'Commission Rate', format: val => `${val || 0}%` }
                };

                const config = fieldMapping[key];
                row[config.header] = config.format(transaction[key]);
            });
            return row;
        });
    };

    const generateFilename = () => {
        const dateRange = `${localFilters.startDate}_to_${localFilters.endDate}`;
        const type = localFilters.transactionType !== 'All' ? `_${localFilters.transactionType}` : '';
        return `merchant_transaction_report${type}_${dateRange}`;
    };

    const isFranchiseMerchant = availableFields.has('franchiseName');

    const renderCardAnalysis = () => {
        const hasBrandType = availableFields.has('brandType');
        const hasCardType = availableFields.has('cardType');
        const hasActionOnBalance = availableFields.has('actionOnBalance');

        if (!hasBrandType && !hasCardType && !hasActionOnBalance) return null;

        return (
            <div className="bg-white rounded-lg shadow-sm border p-4">
                <h3 className="text-md font-semibold text-gray-900 mb-3">Transaction Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {hasBrandType && (
                        <div>
                            <h4 className="text-sm font-medium text-gray-800 mb-2">Brand Distribution</h4>
                            <div className="space-y-1">
                                {Object.entries(
                                    transactions.reduce((acc, txn) => {
                                        if (txn.brandType) {
                                            acc[txn.brandType] = (acc[txn.brandType] || 0) + 1;
                                        }
                                        return acc;
                                    }, {})
                                ).map(([brand, count]) => (
                                    <div key={brand} className="flex justify-between items-center bg-gray-50 p-2 rounded text-xs">
                                        <span className="font-medium">{brand}</span>
                                        <span className="text-gray-600">{count} txns</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {hasCardType && (
                        <div>
                            <h4 className="text-sm font-medium text-gray-800 mb-2">Card Type Distribution</h4>
                            <div className="space-y-1">
                                {Object.entries(
                                    transactions.reduce((acc, txn) => {
                                        if (txn.cardType) {
                                            acc[txn.cardType] = (acc[txn.cardType] || 0) + 1;
                                        }
                                        return acc;
                                    }, {})
                                ).map(([type, count]) => (
                                    <div key={type} className="flex justify-between items-center bg-gray-50 p-2 rounded text-xs">
                                        <span className="font-medium">{type}</span>
                                        <span className="text-gray-600">{count} txns</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        <h4 className="text-sm font-medium text-gray-800 mb-2">Summary Stats</h4>
                        <div className="space-y-1">
                            {hasActionOnBalance && (
                                <>
                                    <div className="bg-green-50 p-2 rounded text-xs">
                                        <div className="flex justify-between">
                                            <span>Credit Txns</span>
                                            <span className="font-medium">
                                                {transactions.filter(t => t.actionOnBalance === 'CREDIT').length}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="bg-red-50 p-2 rounded text-xs">
                                        <div className="flex justify-between">
                                            <span>Debit Txns</span>
                                            <span className="font-medium">
                                                {transactions.filter(t => t.actionOnBalance === 'DEBIT').length}
                                            </span>
                                        </div>
                                    </div>
                                </>
                            )}
                            <div className="bg-blue-50 p-2 rounded text-xs">
                                <div className="flex justify-between">
                                    <span>Avg Transaction</span>
                                    <span className="font-medium">
                                        ₹{summary?.totalTransactionAmount && summary?.totalTransactions
                                            ? (summary.totalTransactionAmount / summary.totalTransactions).toFixed(0)
                                            : 0}
                                    </span>
                                </div>
                            </div>
                            <div className="bg-purple-50 p-2 rounded text-xs">
                                <div className="flex justify-between">
                                    <span>Success Rate</span>
                                    <span className="font-medium">
                                        {summary?.totalTransactions && summary?.successCount
                                            ? ((summary.successCount / summary.totalTransactions) * 100).toFixed(1)
                                            : 100}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const totalCommission = transactions.reduce((sum, txn) => sum + (txn.commissionAmount || 0), 0);

    return (
        <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm border p-4">
                <MTransReportFilters
                    filters={localFilters}
                    onChange={handleFiltersChange}
                    userType={userType}
                    reportType="transactions"
                    onGenerate={() => fetchTransactions(0)}
                    merchantType={merchantType}
                    setMerchantType={setMerchantType}
                />
            </div>

            {/* Summary Cards - UPDATED TO MATCH FIRST COMPONENT */}
            {summary && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white rounded-lg shadow-sm border p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-600">Total Transactions</p>
                                    <p className="text-2xl font-bold text-gray-900">{summary.totalTransactions?.toLocaleString()}</p>
                                    <p className="text-xs text-gray-500 mt-1">Success: {summary.successCount} | Failed: {summary.failureCount}</p>
                                </div>
                                <FileText className="w-8 h-8 text-purple-600" />
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-600">Settlement Amount</p>
                                    <p className="text-2xl font-bold text-blue-900">₹{summary.totalSettlementReceived?.toLocaleString()}</p>
                                    <p className="text-xs text-blue-600 mt-1">{summary.settlementCount} settlements</p>
                                </div>
                                <TrendingUp className="w-8 h-8 text-blue-600" />
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-600">
                                        {isFranchiseMerchant ? 'Commission Paid' : 'Charges Paid'}
                                    </p>
                                    <p className="text-2xl font-bold text-red-900">
                                        ₹{(isFranchiseMerchant ? totalCommission : summary.totalChargesPaid)?.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">Net: ₹{summary.netBalance?.toLocaleString()}</p>
                                </div>
                                <DollarSign className="w-8 h-8 text-red-600" />
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-600">Payouts</p>
                                    <p className="text-2xl font-bold text-orange-900">₹{summary.totalPayoutAmount?.toLocaleString()}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Success: {summary.successfulPayouts} | Pending: {summary.pendingPayouts}
                                    </p>
                                </div>
                                <TrendingUp className="w-8 h-8 text-orange-600" />
                            </div>
                        </div>
                    </div>

                    {/* Additional Summary Info - NEW SECTION */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white rounded-lg shadow-sm border p-3">
                            <p className="text-xs font-medium text-gray-600 mb-2">Credit vs Debit</p>
                            <div className="flex justify-between text-sm">
                                <span className="text-green-600">Credit: ₹{summary.netCreditAmount?.toLocaleString()}</span>
                                <span className="text-red-600">Debit: ₹{Math.abs(summary.netDebitAmount)?.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border p-3">
                            <p className="text-xs font-medium text-gray-600 mb-2">Refunds</p>
                            <div className="text-sm">
                                <span className="text-gray-900">{summary.refundCount} refunds</span>
                                <span className="text-gray-600 ml-2">₹{summary.totalRefundAmount?.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border p-3">
                            <p className="text-xs font-medium text-gray-600 mb-2">Status Breakdown</p>
                            <div className="flex gap-3 text-sm">
                                <span className="text-gray-600">Pending: {summary.pendingCount}</span>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {transactions.length > 0 && renderCardAnalysis()}

            {transactions.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border">
                    <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                        <div>
                            <h2 className="text-md font-semibold text-gray-900">Transaction Details</h2>
                            {reportInfo && (
                                <p className="text-xs text-gray-600 mt-1">
                                    {isFranchiseMerchant ? 'Franchise Merchant' : 'Direct Merchant'} Report |
                                    Generated on {new Date(reportInfo.reportGeneratedAt).toLocaleDateString()} |
                                    Showing {transactions.length} of {pagination.totalElements} transactions
                                </p>
                            )}
                        </div>
                        <div className="flex gap-2">
                            {pagination.totalElements > 100 ? (
                                <button
                                    onClick={exportFullReport}
                                    disabled={exportingFull || loading}
                                    className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    <Download className="w-4 h-4" />
                                    {exportingFull ? 'Exporting...' : 'Export Full Report'}
                                </button>
                            ) :
                                <UniversalExportButtons
                                    data={transactions}
                                    filename={generateFilename()}
                                    title={`${isFranchiseMerchant ? 'Franchise' : 'Direct'} Merchant Transaction Report`}
                                    columns={exportConfig}
                                    excelTransform={excelTransform}
                                    summary={summary}
                                />
                            }
                        </div>
                    </div>

                    <div className="overflow-x-auto" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                        <table className="w-full min-w-max">
                            <thead className="bg-gray-50 sticky top-0">
                                {table.getHeaderGroups().map(headerGroup => (
                                    <tr key={headerGroup.id}>
                                        {headerGroup.headers.map(header => (
                                            <th key={header.id} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-widerwhitespace-nowrap">
                                                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {table.getRowModel().rows.map(row => (
                                    <tr key={row.id} className="hover:bg-gray-50">
                                        {row.getVisibleCells().map(cell => (
                                            <td key={cell.id} className="px-3 py-2 whitespace-nowrap">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div><div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            Page {pagination.currentPage + 1} of {pagination.totalPages}
                            <span className="ml-2 text-gray-500">
                                ({pagination.totalElements} total transactions)
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handlePageChange(pagination.currentPage - 1)}
                                disabled={!pagination.hasPrevious}
                                className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Previous
                            </button>
                            <button
                                onClick={() => handlePageChange(pagination.currentPage + 1)}
                                disabled={!pagination.hasNext}
                                className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                            >
                                Next
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {loading && (
                <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                    <p className="text-sm text-gray-600">Loading transactions...</p>
                </div>
            )}

            {!loading && transactions.length === 0 && summary && (
                <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                    <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-md font-medium text-gray-900 mb-2">No Transactions Found</h3>
                    <p className="text-sm text-gray-600">No transactions found for the selected criteria.</p>
                </div>
            )}
        </div>
    );
};
export default MerchantTransactionReports;