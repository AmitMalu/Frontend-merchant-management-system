// FranchiseMerchantPerformanceReport.jsx
import React, { useState, useMemo } from 'react';
import { useReactTable, getCoreRowModel, flexRender, createColumnHelper } from '@tanstack/react-table';
import { BarChart3, TrendingUp, Users, DollarSign, FileText } from 'lucide-react';
import api from '../../../constants/API/axiosInstance';
import UniversalExportButtons from '../UniversalExportButtons';
import FTransReportFilters from './FTransReportFilters';

const FranchiseMerchantPerformanceReport = ({ filters: commonFilters, isFranchise }) => {
    const [merchantData, setMerchantData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [reportInfo, setReportInfo] = useState(null);
    const [localFilters, setLocalFilters] = useState({
        ...commonFilters
    });

    const fetchMerchantPerformance = async () => {
        setLoading(true);
        try {
            const params = {
                startDate: `${localFilters.startDate}T00:00:00`,
                endDate: `${localFilters.endDate}T23:59:59`,
                franchiseId: localFilters.selectedFranchise,
                dateFilterType: localFilters.dateFilterType
            };

            const response = await api.get('/v1/reports/transactions/franchise/merchant-performance/enhanced', { params });

            if (response.data.success) {
                setMerchantData(response.data.data);
                setReportInfo({
                    reportGeneratedAt: new Date().toISOString(),
                    totalMerchants: response.data.data.length
                });
            }
        } catch (error) {
            console.error('Error fetching merchant performance:', error);
            alert('Error fetching merchant performance data');
        } finally {
            setLoading(false);
        }
    };

    // Calculate summary metrics
    const summaryMetrics = useMemo(() => {
        if (!merchantData.length) return null;

        const totalTransactions = merchantData.reduce((sum, merchant) => sum + merchant.transactionCount, 0);
        const totalCommission = merchantData.reduce((sum, merchant) => sum + merchant.totalCommission, 0);
        const totalAmount = merchantData.reduce((sum, merchant) => sum + merchant.totalAmount, 0);
        

        return {
            totalMerchants: merchantData.length,
            totalTransactions,
            totalCommission,
            totalAmount,
        };
    }, [merchantData]);

    // Table columns definition
    const columnHelper = createColumnHelper();
    const columns = useMemo(() => [
        columnHelper.accessor('merchantName', {
            header: 'Merchant Name',
            cell: info => (
                <div>
                    <span className="font-medium text-gray-900">{info.getValue()}</span>
                    <div className="text-xs text-gray-500">ID: {info.row.original.merchantId}</div>
                </div>
            )
        }),
        columnHelper.accessor('transactionCount', {
            header: 'Transactions',
            cell: info => (
                <span className="font-semibold text-blue-600">
                    {info.getValue().toLocaleString()}
                </span>
            )
        }),
        columnHelper.accessor('totalAmount', {
            header: 'Total Amount',
            cell: info => (
                <span className="font-semibold text-gray-900">
                    ₹{info.getValue().toLocaleString()}
                </span>
            )
        }),
        columnHelper.accessor('totalCommission', {
            header: 'Total Commission',
            cell: info => (
                <span className="font-semibold text-green-600">
                    ₹{info.getValue().toLocaleString()}
                </span>
            )
        }),
        columnHelper.accessor(row => (row.totalCommission / row.totalAmount * 100).toFixed(2), {
            id: 'commissionRate',
            header: 'Commission Rate',
            cell: info => (
                <span className="font-medium text-purple-600">
                    {info.getValue()}%
                </span>
            )
        }),
       
    ], [columnHelper]);

    const table = useReactTable({
        data: merchantData,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    // Handle filter changes from the ReportFilters component
    const handleFiltersChange = (newFilters) => {
        setLocalFilters(prev => ({ ...prev, ...newFilters }));
    };

    // Export functionality
    const exportColumns = {
        headers: ['Merchant Name', 'Merchant ID', 'Transactions', 'Total Amount (₹)', 'Total Commission (₹)', 'Commission Rate (%)', 'Avg Transaction (₹)'],
        keys: ['merchantName', 'merchantId', 'transactionCount', 'totalAmount', 'totalCommission', 'commissionRate']
    };

    const excelTransform = (data) => {
        return data.map(merchant => ({
            'Merchant Name': merchant.merchantName,
            'Merchant ID': merchant.merchantId,
            'Transactions': merchant.transactionCount,
            'Total Amount': merchant.totalAmount,
            'Total Commission': merchant.totalCommission,
            'Commission Rate (%)': `${(merchant.totalCommission / merchant.totalAmount * 100).toFixed(2)}`,
            
        }));
    };

    const generateFilename = () => {
        const dateRange = `${localFilters.startDate}_to_${localFilters.endDate}`;
        return `franchise_merchant_performance_${dateRange}`;
    };

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <FTransReportFilters
                    filters={localFilters}
                    onChange={handleFiltersChange}
                    isFranchise={isFranchise}
                    reportType="merchant-performance"
                    onGenerate={fetchMerchantPerformance}
                />
            </div>

            {/* Summary Cards */}
            {summaryMetrics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Merchants</p>
                                <p className="text-2xl font-bold text-gray-900">{summaryMetrics.totalMerchants}</p>
                            </div>
                            <Users className="w-8 h-8 text-purple-600" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                                <p className="text-2xl font-bold text-blue-600">{summaryMetrics.totalTransactions.toLocaleString()}</p>
                            </div>
                            <BarChart3 className="w-8 h-8 text-blue-600" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                                <p className="text-2xl font-bold text-gray-900">₹{summaryMetrics.totalAmount.toLocaleString()}</p>
                            </div>
                            <TrendingUp className="w-8 h-8 text-gray-600" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Commission</p>
                                <p className="text-2xl font-bold text-green-600">₹{summaryMetrics.totalCommission.toLocaleString()}</p>
                            </div>
                            <DollarSign className="w-8 h-8 text-green-600" />
                        </div>
                    </div>

                  
                </div>
            )}

            {/* Performance Insights */}
            {merchantData.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-green-50 rounded-lg p-4">
                            <p className="text-sm font-medium text-green-700">Top Performer</p>
                            <p className="text-lg font-bold text-green-600">
                                {merchantData.reduce((prev, current) =>
                                    (prev.totalCommission > current.totalCommission) ? prev : current
                                ).merchantName}
                            </p>
                            <p className="text-sm text-green-600">
                                ₹{merchantData.reduce((prev, current) =>
                                    (prev.totalCommission > current.totalCommission) ? prev : current
                                ).totalCommission.toLocaleString()} commission
                            </p>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4">
                            <p className="text-sm font-medium text-blue-700">Most Active</p>
                            <p className="text-lg font-bold text-blue-600">
                                {merchantData.reduce((prev, current) =>
                                    (prev.transactionCount > current.transactionCount) ? prev : current
                                ).merchantName}
                            </p>
                            <p className="text-sm text-blue-600">
                                {merchantData.reduce((prev, current) =>
                                    (prev.transactionCount > current.transactionCount) ? prev : current
                                ).transactionCount} transactions
                            </p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4">
                            <p className="text-sm font-medium text-purple-700">Highest Volume</p>
                            <p className="text-lg font-bold text-purple-600">
                                {merchantData.reduce((prev, current) =>
                                    (prev.totalAmount > current.totalAmount) ? prev : current
                                ).merchantName}
                            </p>
                            <p className="text-sm text-purple-600">
                                ₹{merchantData.reduce((prev, current) =>
                                    (prev.totalAmount > current.totalAmount) ? prev : current
                                ).totalAmount.toLocaleString()} volume
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Merchant Performance Table */}
            {merchantData.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Merchant Performance Details</h2>
                            {reportInfo && (
                                <p className="text-sm text-gray-600 mt-1">
                                    Report generated on {new Date(reportInfo.reportGeneratedAt).toLocaleString()} |
                                    Total {reportInfo.totalMerchants} merchants
                                </p>
                            )}
                        </div>
                        <UniversalExportButtons
                            data={merchantData}
                            filename={generateFilename()}
                            title="Franchise Merchant Performance Report"
                            columns={exportColumns}
                            excelTransform={excelTransform}
                            summary={summaryMetrics}
                        />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                {table.getHeaderGroups().map(headerGroup => (
                                    <tr key={headerGroup.id}>
                                        {headerGroup.headers.map(header => (
                                            <th key={header.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                                            <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* No Data Message */}
            {!loading && merchantData.length === 0 && localFilters.selectedFranchise && localFilters.startDate && localFilters.endDate && (
                <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Merchant Data Found</h3>
                    <p className="text-gray-600">No merchant performance data found for the selected criteria.</p>
                </div>
            )}
        </div>
    );
};

export default FranchiseMerchantPerformanceReport;