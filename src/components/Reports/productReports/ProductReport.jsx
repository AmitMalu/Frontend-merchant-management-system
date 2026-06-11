// frontend/src/components/Reports/ProductReport.jsx
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
    Package,
    TrendingUp,
    Users,
    Building,
    CheckCircle,
    XCircle,
    X,
    AlertTriangle,
    BarChart3,
    DollarSign,
    User,
    Calendar,
    FileText
} from 'lucide-react';
import UniversalExportButtons from '../UniversalExportButtons';
import productReportApi from '../../../constants/API/productReportApi';

const ProductReport = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [globalFilter, setGlobalFilter] = useState('');
    const [categories, setCategories] = useState([]);
    
    const [filters, setFilters] = useState({
        categoryId: '',
        customerType: '',
        activeOnly: false
    });

    // Fetch product scheme assignment data
    const fetchProductSchemeData = async () => {
        setLoading(true);
        setError(null);
        try {
            const schemeAssignments = await productReportApi.getFilteredSchemeAssignmentsForReport({
                categoryId: filters.categoryId || undefined,
                customerType: filters.customerType || undefined,
                activeOnly: filters.activeOnly
            });

            // Normalize the data to handle field naming differences
            const normalizedData = (schemeAssignments || []).map(item => ({
                ...item,
                // Normalize customerType field
                customerType: item.customerType || (item.schemeCustomerType ? item.schemeCustomerType.toUpperCase() : null),
                // Get customer name based on type
                customerDisplayName: item.customerType?.toUpperCase() === 'FRANCHISE' || item.schemeCustomerType?.toUpperCase() === 'FRANCHISE'
                    ? item.customerName 
                    : item.merchantBusinessName || item.customerName,
                customerContact: item.customerType?.toUpperCase() === 'FRANCHISE' || item.schemeCustomerType?.toUpperCase() === 'FRANCHISE'
                    ? item.franchiseContact
                    : item.merchantContact,
                customerAddress: item.customerType?.toUpperCase() === 'FRANCHISE' || item.schemeCustomerType?.toUpperCase() === 'FRANCHISE'
                    ? item.franchiseAddress
                    : item.merchantAddress
            }));

            setData(normalizedData);
        } catch (error) {
            console.error('Error fetching product scheme data:', error);
            setError('Failed to fetch product scheme data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProductSchemeData();
    }, []); // Only run once on mount

    // Filter data based on search
    const filteredData = useMemo(() => {
        let filtered = data;

        // Global search filter
        if (globalFilter) {
            const searchLower = globalFilter.toLowerCase();
            filtered = filtered.filter(item => 
                item.productCode?.toLowerCase().includes(searchLower) ||
                item.productName?.toLowerCase().includes(searchLower) ||
                item.productBrand?.toLowerCase().includes(searchLower) ||
                item.categoryName?.toLowerCase().includes(searchLower) ||
                item.vendorName?.toLowerCase().includes(searchLower) ||
                item.schemeCode?.toLowerCase().includes(searchLower) ||
                item.customerDisplayName?.toLowerCase().includes(searchLower) ||
                item.customerName?.toLowerCase().includes(searchLower) ||
                item.merchantBusinessName?.toLowerCase().includes(searchLower)
            );
        }

        return filtered;
    }, [data, globalFilter]);

    // Clear all filters function
    const clearFilters = () => {
        setGlobalFilter('');
        setFilters({
            categoryId: '',
            customerType: '',
            activeOnly: false
        });
    };

    // Format date helper
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    // Table columns definition - EACH ROW IS AN ASSIGNMENT
    const columns = useMemo(() => [
        {
            header: 'Assignment ID',
            accessorKey: 'assignmentId',
            cell: ({ getValue }) => (
                <span className="font-mono text-xs bg-indigo-50 px-2 py-1 rounded">
                    #{getValue()}
                </span>
            )
        },
        {
            header: 'Product',
            accessorKey: 'productName',
            cell: ({ row }) => (
                <div className="min-w-[200px]">
                    <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-blue-600">{row.original.productCode}</span>
                    </div>
                    <div className="font-medium text-gray-900 mt-1">{row.original.productName}</div>
                    <div className="text-xs text-gray-500">{row.original.productModel} • {row.original.productBrand}</div>
                </div>
            )
        },
        {
            header: 'Category',
            accessorKey: 'categoryName',
            cell: ({ getValue, row }) => (
                <div>
                    <div className="text-gray-700 font-medium">{getValue() || 'N/A'}</div>
                    {row.original.categoryCode && (
                        <div className="text-xs text-gray-500">Code: {row.original.categoryCode}</div>
                    )}
                </div>
            )
        },
        {
            header: 'Product Status',
            accessorKey: 'productStatus',
            cell: ({ getValue }) => {
                const status = getValue();
                return (
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        status
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-100 text-gray-800'
                    }`}>
                        {status ? (
                            <>
                                <CheckCircle className="w-3 h-3" />
                                Active
                            </>
                        ) : (
                            <>
                                <XCircle className="w-3 h-3" />
                                Inactive
                            </>
                        )}
                    </span>
                );
            }
        },
        {
            header: 'HSN',
            accessorKey: 'hsn',
            cell: ({ getValue }) => (
                <span className="font-mono text-xs bg-yellow-50 px-2 py-1 rounded">
                    {getValue()}
                </span>
            )
        },
        {
            header: 'Vendor',
            accessorKey: 'vendorName',
            cell: ({ getValue }) => (
                <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{getValue() || 'N/A'}</span>
                </div>
            )
        },
        {
            header: 'Warranty',
            accessorKey: 'warrantyPeriod',
            cell: ({ row }) => (
                <div className="text-sm">
                    <div className="text-gray-700 font-medium">
                        {row.original.warrantyPeriod} months
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                        {row.original.warrantyType || 'N/A'}
                    </div>
                </div>
            )
        },
         {
            header: 'Customer Type',
            accessorKey: 'customerType',
            cell: ({ getValue }) => {
                const type = getValue();
                return type ? (
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                        type === 'FRANCHISE' 
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                    }`}>
                        {type === 'FRANCHISE' ? (
                            <Building className="w-3 h-3" />
                        ) : (
                            <Users className="w-3 h-3" />
                        )}
                        {type}
                    </span>
                ) : (
                    <span className="text-sm text-gray-500">N/A</span>
                );
            }
        },
        {
            header: 'Customer Details',
            accessorKey: 'customerDisplayName',
            cell: ({ row }) => (
                <div className="min-w-[200px]">
                    <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">
                            {row.original.customerDisplayName || 'N/A'}
                        </span>
                    </div>
                    {row.original.customerContact && (
                        <div className="text-xs text-gray-600 mt-1">
                            📞 {row.original.customerContact}
                        </div>
                    )}
                    {row.original.customerAddress && (
                        <div className="text-xs text-gray-500 mt-1" title={row.original.customerAddress}>
                            📍 {row.original.customerAddress.length > 50 
                                ? row.original.customerAddress.substring(0, 50) + '...'
                                : row.original.customerAddress}
                        </div>
                    )}
                </div>
            )
        },
        
        {
            header: 'Scheme',
            accessorKey: 'schemeCode',
            cell: ({ row }) => (
                <div className="min-w-[180px]">
                    <div className="font-mono text-sm bg-purple-50 text-purple-700 px-2 py-1 rounded inline-block mb-1">
                        {row.original.schemeCode}
                    </div>
                    {row.original.schemeDescription && (
                        <div className="text-xs text-gray-600 mt-1" title={row.original.schemeDescription}>
                            {row.original.schemeDescription.length > 40 
                                ? row.original.schemeDescription.substring(0, 40) + '...' 
                                : row.original.schemeDescription}
                        </div>
                    )}
                    <div className="text-sm font-semibold text-green-600 mt-1">
                        ₹{row.original.rentalByMonth?.toLocaleString()}/month
                    </div>
                </div>
            )
        },
        
        {
            header: 'Effective Date',
            accessorKey: 'effectiveDate',
            cell: ({ getValue }) => (
                <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-green-500" />
                    <span className="text-gray-700">{formatDate(getValue())}</span>
                </div>
            )
        },
        {
            header: 'Expiry Date',
            accessorKey: 'expiryDate',
            cell: ({ getValue }) => {
                const expiryDate = getValue();
                const isExpired = expiryDate && new Date(expiryDate) < new Date();
                return (
                    <div className="flex items-center gap-2 text-sm">
                        <Calendar className={`w-4 h-4 ${isExpired ? 'text-red-500' : 'text-orange-500'}`} />
                        <span className={isExpired ? 'text-red-600 font-medium' : 'text-gray-700'}>
                            {formatDate(expiryDate)}
                        </span>
                    </div>
                );
            }
        },
         {
            header: 'Remarks',
            accessorKey: 'remarks',
            cell: ({ getValue }) => (
                <div className="max-w-[150px]">
                    {getValue() ? (
                        <span className="text-sm text-gray-600" title={getValue()}>
                            {getValue().length > 30 ? getValue().substring(0, 30) + '...' : getValue()}
                        </span>
                    ) : (
                        <span className="text-xs text-gray-400">No remarks</span>
                    )}
                </div>
            )
        }
       
        
       
    ], []);

    // Calculate summary data
    const summary = useMemo(() => {
        const totalAssignments = filteredData.length;
        const activeAssignments = filteredData.filter(a => a.active).length;
        const inactiveAssignments = totalAssignments - activeAssignments;
        const franchiseAssignments = filteredData.filter(a => a.customerType === 'FRANCHISE').length;
        const merchantAssignments = filteredData.filter(a => a.customerType === 'MERCHANT').length;
        
        // Unique counts
        const uniqueProducts = [...new Set(filteredData.map(a => a.productId))].length;
        const uniqueCustomers = [...new Set(filteredData.map(a => a.customerId))].length;
        const uniqueSchemes = [...new Set(filteredData.map(a => a.schemeId))].length;
        const uniqueCategories = [...new Set(filteredData.map(a => a.categoryName))].length;

        // Expired assignments
        const expiredAssignments = filteredData.filter(a => 
            a.expiryDate && new Date(a.expiryDate) < new Date()
        ).length;

        // Total rental value
        const totalMonthlyRental = filteredData
            .filter(a => a.active && a.rentalByMonth)
            .reduce((sum, a) => sum + (a.rentalByMonth || 0), 0);

        // Category breakdown
        const categoryBreakdown = filteredData.reduce((acc, item) => {
            const category = item.categoryName || 'Unknown';
            acc[category] = (acc[category] || 0) + 1;
            return acc;
        }, {});

        // Customer Type breakdown
        const customerTypeBreakdown = filteredData.reduce((acc, item) => {
            const type = item.customerType || 'Unknown';
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {});

        // Status breakdown
        const statusBreakdown = {
            'Active': activeAssignments,
            'Inactive': inactiveAssignments,
            'Expired': expiredAssignments
        };

        return {
            totalAssignments,
            activeAssignments,
            inactiveAssignments,
            expiredAssignments,
            franchiseAssignments,
            merchantAssignments,
            uniqueProducts,
            uniqueCustomers,
            uniqueSchemes,
            uniqueCategories,
            totalMonthlyRental,
            categoryBreakdown,
            customerTypeBreakdown,
            statusBreakdown
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
        initialState: {
            pagination: {
                pageSize: 10,
            },
        },
    });

    // Export configurations
    const exportColumns = {
        headers: [
            'Assignment ID', 'Product Code', 'Product Name', 'Product Model', 'Product Brand',
            'Category', 'Scheme Code', 'Scheme Description', 'Monthly Rental', 'Customer Type',
            'Customer Name', 'Customer Contact', 'Customer Address', 'Vendor', 
            'Effective Date', 'Expiry Date', 'Assignment Status', 'Product Status',
            'Warranty Period', 'Warranty Type', 'HSN', 'Remarks', 'Created At'
        ],
        keys: [
            'assignmentId', 'productCode', 'productName', 'productModel', 'productBrand',
            'categoryName', 'schemeCode', 'schemeDescription', 'rentalByMonth', 'customerType',
            'customerDisplayName', 'customerContact', 'customerAddress', 'vendorName',
            'effectiveDate', 'expiryDate', 'active', 'productStatus',
            'warrantyPeriod', 'warrantyType', 'hsn', 'remarks', 'createdAt'
        ],
        widths: [12, 15, 25, 15, 12, 15, 15, 25, 12, 12, 20, 15, 25, 20, 12, 12, 10, 10, 12, 12, 12, 20, 15]
    };

    const excelTransform = (data) => {
        return data.map(item => ({
            'Assignment ID': item.assignmentId,
            'Product Code': item.productCode,
            'Product Name': item.productName,
            'Product Model': item.productModel,
            'Product Brand': item.productBrand,
            'Category': item.categoryName,
            'Scheme Code': item.schemeCode,
            'Scheme Description': item.schemeDescription || '',
            'Monthly Rental': item.rentalByMonth || 0,
            'Customer Type': item.customerType || 'N/A',
            'Customer Name': item.customerDisplayName || 'N/A',
            'Customer Contact': item.customerContact || 'N/A',
            'Customer Address': item.customerAddress || 'N/A',
            'Vendor': item.vendorName,
            'Effective Date': formatDate(item.effectiveDate),
            'Expiry Date': formatDate(item.expiryDate),
            'Assignment Status': item.active ? 'Active' : 'Inactive',
            'Product Status': item.productStatus ? 'Active' : 'Inactive',
            'Warranty Period': `${item.warrantyPeriod} months`,
            'Warranty Type': item.warrantyType || 'N/A',
            'HSN': item.hsn,
            'Remarks': item.remarks || '',
            'Created At': formatDate(item.createdAt)
        }));
    };

    const summaryConfig = [
        { key: 'totalAssignments', label: 'Total Assignments', formatter: (val) => val.toLocaleString() },
        { key: 'activeAssignments', label: 'Active Assignments', formatter: (val) => val.toLocaleString() },
        { key: 'inactiveAssignments', label: 'Inactive Assignments', formatter: (val) => val.toLocaleString() },
        { key: 'expiredAssignments', label: 'Expired Assignments', formatter: (val) => val.toLocaleString() },
        { key: 'uniqueProducts', label: 'Unique Products', formatter: (val) => val.toLocaleString() },
        { key: 'uniqueCustomers', label: 'Unique Customers', formatter: (val) => val.toLocaleString() },
        { key: 'uniqueSchemes', label: 'Unique Schemes', formatter: (val) => val.toLocaleString() },
        { key: 'totalMonthlyRental', label: 'Total Monthly Rental', formatter: (val) => `₹${val.toLocaleString()}` }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <span className="ml-3 text-gray-600">Loading product scheme assignments...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <div className="text-red-600 mb-2 font-semibold">Error</div>
                    <div className="text-gray-600 mb-4">{error}</div>
                    <button
                        onClick={fetchProductSchemeData}
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
                        <FileText className="w-8 h-8 text-indigo-600" />
                        Product Scheme Assignment Report
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Detailed report showing which products are assigned to which customers using which schemes
                    </p>
                </div>
                <UniversalExportButtons
                    data={filteredData}
                    filename="product_scheme_assignment_report"
                    title="Product Scheme Assignment Report"
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
                            <p className="text-blue-100 text-sm font-medium">Total Assignments</p>
                            <p className="text-3xl font-bold">{summary.totalAssignments}</p>
                            <p className="text-xs text-blue-100 mt-1">{summary.uniqueProducts} Products</p>
                        </div>
                        <FileText className="w-8 h-8 text-blue-200" />
                    </div>
                </div>

                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-emerald-100 text-sm font-medium">Active Assignments</p>
                            <p className="text-3xl font-bold">{summary.activeAssignments}</p>
                            <p className="text-xs text-emerald-100 mt-1">{summary.uniqueCustomers} Customers</p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-emerald-200" />
                    </div>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-sm font-medium">Total Monthly Rental</p>
                            <p className="text-3xl font-bold">₹{summary.totalMonthlyRental.toLocaleString()}</p>
                            <p className="text-xs text-purple-100 mt-1">{summary.uniqueSchemes} Schemes</p>
                        </div>
                        <DollarSign className="w-8 h-8 text-purple-200" />
                    </div>
                </div>

                <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-orange-100 text-sm font-medium">Customer Distribution</p>
                            <div className="flex items-center gap-3 mt-2">
                                <div>
                                    <p className="text-xl font-bold">{summary.franchiseAssignments}</p>
                                    <p className="text-xs text-orange-100">Franchise</p>
                                </div>
                                <div className="h-8 w-px bg-orange-300"></div>
                                <div>
                                    <p className="text-xl font-bold">{summary.merchantAssignments}</p>
                                    <p className="text-xs text-orange-100">Merchant</p>
                                </div>
                            </div>
                        </div>
                        <Users className="w-8 h-8 text-orange-200" />
                    </div>
                </div>
            </div>

            {/* Breakdown Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Category Breakdown */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-indigo-600" />
                        Category Distribution
                    </h3>
                    <div className="space-y-3 max-h-48 overflow-y-auto">
                        {Object.entries(summary.categoryBreakdown).length > 0 ? (
                            Object.entries(summary.categoryBreakdown)
                                .sort(([, a], [, b]) => b - a)
                                .map(([category, count]) => (
                                    <div key={category} className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-600 truncate" title={category}>
                                            {category}
                                        </span>
                                        <span className="text-lg font-bold text-gray-900">{count}</span>
                                    </div>
                                ))
                        ) : (
                            <p className="text-sm text-gray-500">No categories found</p>
                        )}
                    </div>
                </div>

                {/* Customer Type Breakdown */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-green-600" />
                        Customer Type Distribution
                    </h3>
                    <div className="space-y-3">
                        {Object.entries(summary.customerTypeBreakdown).map(([type, count]) => (
                            <div key={type} className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600">{type}</span>
                                <span className="text-lg font-bold text-gray-900">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Status Breakdown */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                        Assignment Status
                    </h3>
                    <div className="space-y-3">
                        {Object.entries(summary.statusBreakdown).map(([status, count]) => (
                            <div key={status} className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600">{status}</span>
                                <span className="text-lg font-bold text-gray-900">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            
            {/* Filters and Search */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div className="relative md:col-span-2">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={globalFilter ?? ''}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>

                    <select
                        value={filters.categoryId}
                        onChange={(e) => setFilters(prev => ({ ...prev, categoryId: e.target.value }))}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        disabled={categories.length === 0}
                    >
                        <option value="">All Categories</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.categoryName}
                            </option>
                        ))}
                    </select>

                    <select
                        value={filters.customerType}
                        onChange={(e) => setFilters(prev => ({ ...prev, customerType: e.target.value }))}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                        <option value="">All Customer Types</option>
                        <option value="FRANCHISE">Franchise</option>
                        <option value="MERCHANT">Merchant</option>
                    </select>

                    <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                            type="checkbox"
                            checked={filters.activeOnly}
                            onChange={(e) => setFilters(prev => ({ ...prev, activeOnly: e.target.checked }))}
                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700">Active Only</span>
                    </label>

                    <button
                        onClick={fetchProductSchemeData}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                    >
                        Apply Filters
                    </button>

                    {(globalFilter || filters.categoryId || filters.customerType || filters.activeOnly) && (
                        <button
                            onClick={clearFilters}
                            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium flex items-center gap-2 justify-center"
                        >
                            <X className="w-4 h-4" />
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {filteredData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                        <Package className="w-16 h-16 mb-4 text-gray-300" />
                        <p className="text-lg font-medium">No products found</p>
                        <p className="text-sm">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <>
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
                                        <tr key={row.id} className="hover:bg-gray-50 transition-colors">
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
                                    Showing{' '}
                                    <span className="font-medium">
                                        {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
                                    </span>
                                    {' '}-{' '}
                                    <span className="font-medium">
                                        {Math.min(
                                            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                                            table.getFilteredRowModel().rows.length
                                        )}
                                    </span>
                                    {' '}of{' '}
                                    <span className="font-medium">
                                        {table.getFilteredRowModel().rows.length}
                                    </span>
                                    {' '}results
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => table.setPageIndex(0)}
                                    disabled={!table.getCanPreviousPage()}
                                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    First
                                </button>
                                
                                <button
                                    onClick={() => table.previousPage()}
                                    disabled={!table.getCanPreviousPage()}
                                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>

                                <span className="text-sm text-gray-700">
                                    Page{' '}
                                    <span className="font-medium">{table.getState().pagination.pageIndex + 1}</span>
                                    {' '}of{' '}
                                    <span className="font-medium">{table.getPageCount()}</span>
                                </span>

                                <button
                                    onClick={() => table.nextPage()}
                                    disabled={!table.getCanNextPage()}
                                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                                
                                <button
                                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                    disabled={!table.getCanNextPage()}
                                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Last
                                </button>

                                <select
                                    value={table.getState().pagination.pageSize}
                                    onChange={(e) => table.setPageSize(Number(e.target.value))}
                                    className="text-sm border border-gray-300 rounded px-2 py-1 ml-2"
                                >
                                    {[10, 20, 30, 40, 50, 100].map((pageSize) => (
                                        <option key={pageSize} value={pageSize}>
                                            Show {pageSize}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ProductReport;