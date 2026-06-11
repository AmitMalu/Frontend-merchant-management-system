import React, { useState, useEffect } from 'react';
import {
    Users,
    Store,
    Package,
    CreditCard,
    TrendingUp,
    Wallet,
    ShoppingCart,
    ArrowUpRight,
    ArrowDownLeft,
    RefreshCw,
    AlertCircle,
    CheckCircle,
    Clock,
    Handshake
} from 'lucide-react';
import api from '../../constants/API/axiosInstance';

const AdminDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await api.get('/admin-dashboard/stats');
            setDashboardData(response.data);
        } catch (err) {
            setError('Failed to fetch dashboard data');
            console.error('Dashboard fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <div className="flex items-center space-x-3 text-slate-600">
                    <RefreshCw className="w-8 h-8 animate-spin" />
                    <span className="text-xl font-medium">Loading Dashboard...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
                    <div className="flex items-center space-x-3 text-red-700">
                        <AlertCircle className="w-6 h-6" />
                        <span className="font-medium">{error}</span>
                    </div>
                    <button
                        onClick={fetchAllData}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // Destructure the consolidated data
    const { franchiseStats, transactionStats, pricingSchemeStats, productStats,expiringSchemes } = dashboardData || {};

    const StatCard = ({ title, value, icon: Icon, color = "blue", subtitle = null, trend = null }) => (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
                    <p className={`text-3xl font-bold text-${color}-600 mb-1`}>{value}</p>
                    {subtitle && (
                        <p className="text-xs text-slate-500">{subtitle}</p>
                    )}
                </div>
                <div className={`p-3 rounded-lg bg-${color}-50`}>
                    <Icon className={`w-6 h-6 text-${color}-600`} />
                </div>
            </div>
            {trend && (
                <div className="flex items-center mt-3 text-sm">
                    {trend > 0 ? (
                        <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                    ) : (
                        <ArrowDownLeft className="w-4 h-4 text-red-500 mr-1" />
                    )}
                    <span className={trend > 0 ? "text-green-600" : "text-red-600"}>
                        {Math.abs(trend)}%
                    </span>
                    <span className="text-slate-500 ml-1">vs last month</span>
                </div>
            )}
        </div>
    );

    const CategoryCard = ({ category }) => (
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg p-4 border border-slate-200">
            <div className="flex justify-between items-center">
                <div>
                    <h4 className="font-medium text-slate-800">{category.categoryName}</h4>
                    <p className="text-sm text-slate-500">Code: {category.categoryCode}</p>
                </div>
                <span className="text-2xl font-bold text-blue-600">{category.productCount}</span>
            </div>
        </div>
    );

    const StatusBadge = ({ status, count }) => {
        const colors = {
            AVAILABLE: 'bg-green-100 text-green-800 border-green-200',
            ALLOCATED: 'bg-blue-100 text-blue-800 border-blue-200',
            ACTIVE: 'bg-green-100 text-green-800 border-green-200',
            INACTIVE: 'bg-red-100 text-red-800 border-red-200'
        };

        return (
            <div className={`px-3 py-1 rounded-full border text-sm font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
                {status}: {count}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <div className=" mx-auto px-6">
                {/* Header */}
                <div className="mb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 mb-1">Admin Dashboard</h1>
                            <p className="text-slate-600">Overview of your business operations</p>
                        </div>
                        <button
                            onClick={fetchAllData}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            <span>Refresh</span>
                        </button>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Total Franchises"
                        value={franchiseStats?.totalFranchises || 0}
                        icon={Handshake}
                        color="blue"
                        subtitle="Active franchise locations"
                    />
                    <StatCard
                        title="Total Merchants"
                        value={franchiseStats?.totalMerchants || 0}
                        icon={Users}
                        color="green"
                        subtitle={`${franchiseStats?.totalDirectMerchants || 0} direct, ${franchiseStats?.totalFranchiseMerchants || 0} franchise`}
                    />
                    <StatCard
                        title="Total Products"
                        value={productStats?.totalProducts || 0}
                        icon={Package}
                        color="purple"
                        subtitle={`${productStats?.activeProducts || 0} active, ${productStats?.inactiveProducts || 0} inactive`}
                    />
                    <StatCard
                        title="Pricing Schemes"
                        value={pricingSchemeStats?.totalSchemes || 0}
                        icon={CreditCard}
                        color="orange"
                        subtitle={`${pricingSchemeStats?.totalDirectMerchantSchemes || 0} direct, ${pricingSchemeStats?.totalFranchiseSchemes || 0} franchise`}
                    />
                </div>

                {/*Expiring Schemes  & Wallet Balance Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Expiring Schemes */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-slate-900">Expiring Schemes</h3>
                            <CreditCard className="w-6 h-6 text-orange-600" />
                        </div>

                        <div className="max-h-64 overflow-y-auto">
                            {dashboardData?.expiringSchemes && dashboardData.expiringSchemes.length > 0 ? (
                                <div className="space-y-3">
                                    {dashboardData.expiringSchemes.map((scheme) => (
                                        <div key={scheme.id} className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-sm font-semibold text-slate-900">{scheme.schemeCode}</span>
                                                <span className="text-xs px-2 py-1 bg-orange-200 text-orange-800 rounded">
                                                    {scheme.customerType}
                                                </span>
                                            </div>
                                            <p className="text-xs mb-1">
                                                <span className="text-slate-600">{scheme.productName} - {scheme.customerName}</span> :
                                                <span className="font-medium text-orange-600 ml-1">Expires: {scheme.expiryDate}</span>
                                            </p>

                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-slate-500">
                                    <p className="text-sm">No expiring schemes</p>
                                </div>
                            )}
                        </div>
                    </div>
                    

                    {/* Wallet Balance Overview */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-slate-900">Wallet Balances</h3>
                            <Wallet className="w-6 h-6 text-green-600" />
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <span className="text-blue-700 font-medium">Franchise Wallets</span>
                                        <span className="text-xl font-semibold text-black">
                                            ₹{franchiseStats?.totalFranchiseWalletBalance?.toFixed(2) || '0.00'}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-4 bg-green-50 rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <span className="text-green-700 font-medium">Direct Merchant Wallets</span>
                                        <span className="text-xl font-semibold text-black">
                                            ₹{franchiseStats?.totalDirectMerchantWalletBalance?.toFixed(2) || '0.00'}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-4 bg-purple-50 rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <span className="text-purple-700 font-medium">Franchise Merchant Wallets</span>
                                        <span className="text-xl font-semibold text-black">
                                            ₹{franchiseStats?.totalFranchiseMerchantWalletBalance?.toFixed(2) || '0.00'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Settlement Activity Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Franchise Settlements */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-slate-900">Today's Franchise Settlements</h3>
                            <Store className="w-6 h-6 text-blue-600" />
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-blue-700 mb-1">Total Batches</p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {dashboardData?.settlementActivity?.franchiseSettlements?.totalBatches || 0}
                                    </p>
                                </div>
                                <div className="p-4 bg-green-50 rounded-lg">
                                    <p className="text-sm text-green-700 mb-1">Transactions</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {dashboardData?.settlementActivity?.franchiseSettlements?.totalProcessedTransactions || 0}
                                    </p>
                                </div>
                            </div>

                            <div className="border-t border-slate-200 pt-4 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-600">Total Amount</span>
                                    <span className="text-lg font-bold text-slate-900">
                                        ₹{dashboardData?.settlementActivity?.franchiseSettlements?.totalAmount?.toFixed(2) || '0.00'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-600">Total Fees</span>
                                    <span className="text-lg font-semibold text-red-600">
                                        -₹{dashboardData?.settlementActivity?.franchiseSettlements?.totalFees?.toFixed(2) || '0.00'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                                    <span className="text-sm font-medium text-slate-700">Net Amount</span>
                                    <span className="text-xl font-bold text-green-600">
                                        ₹{dashboardData?.settlementActivity?.franchiseSettlements?.totalNetAmount?.toFixed(2) || '0.00'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Direct Merchant Settlements */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-slate-900">Today's Direct Merchant Settlements</h3>
                            <Users className="w-6 h-6 text-purple-600" />
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-purple-50 rounded-lg">
                                    <p className="text-sm text-purple-700 mb-1">Total Batches</p>
                                    <p className="text-2xl font-bold text-purple-600">
                                        {dashboardData?.settlementActivity?.directMerchantSettlements?.totalBatches || 0}
                                    </p>
                                </div>
                                <div className="p-4 bg-green-50 rounded-lg">
                                    <p className="text-sm text-green-700 mb-1">Transactions</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {dashboardData?.settlementActivity?.directMerchantSettlements?.totalProcessedTransactions || 0}
                                    </p>
                                </div>
                            </div>

                            <div className="border-t border-slate-200 pt-4 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-600">Total Amount</span>
                                    <span className="text-lg font-bold text-slate-900">
                                        ₹{dashboardData?.settlementActivity?.directMerchantSettlements?.totalAmount?.toFixed(2) || '0.00'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-600">Total Fees</span>
                                    <span className="text-lg font-semibold text-red-600">
                                        -₹{dashboardData?.settlementActivity?.directMerchantSettlements?.totalFees?.toFixed(2) || '0.00'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                                    <span className="text-sm font-medium text-slate-700">Net Amount</span>
                                    <span className="text-xl font-bold text-green-600">
                                        ₹{dashboardData?.settlementActivity?.directMerchantSettlements?.totalNetAmount?.toFixed(2) || '0.00'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Categories, Franchise Details & Transaction */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 ">
                    {/* Product Categories */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-slate-900">Product Categories</h3>
                            <Package className="w-6 h-6 text-green-600" />
                        </div>

                        <div className="space-y-4 max-h-64 overflow-y-auto">
                            {productStats?.categoryBreakdown?.map((category) => (
                                <CategoryCard key={category.id} category={category} />
                            ))}
                        </div>
                    </div>

                    {/* Franchise Distribution */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-slate-900">Franchise Distribution</h3>
                            <Store className="w-6 h-6 text-blue-600" />
                        </div>

                        <div className="space-y-4 max-h-64 overflow-y-auto">
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <p className="text-2xl font-bold text-blue-600">{franchiseStats?.totalDirectMerchants || 0}</p>
                                    <p className="text-xs text-blue-700">Direct</p>
                                </div>
                                <div className="p-3 bg-green-50 rounded-lg">
                                    <p className="text-2xl font-bold text-green-600">{franchiseStats?.totalFranchiseMerchants || 0}</p>
                                    <p className="text-xs text-green-700">Franchise</p>
                                </div>
                                <div className="p-3 bg-purple-50 rounded-lg">
                                    <p className="text-2xl font-bold text-purple-600">{franchiseStats?.totalFranchises || 0}</p>
                                    <p className="text-xs text-purple-700">Locations</p>
                                </div>
                            </div>

                            {franchiseStats?.merchantsPerFranchise && (
                                <div className="mt-6">
                                    <p className="text-sm font-medium text-slate-600 mb-3">Merchants per Franchise:</p>
                                    <div className="space-y-2">
                                        {Object.entries(franchiseStats.merchantsPerFranchise).map(([franchiseName, count]) => (
                                            <div key={franchiseName} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                                <span className="text-slate-700">{franchiseName}</span>
                                                <span className="font-semibold text-slate-900">{count} merchants</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Transaction Stats */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-slate-900">Transaction Overview</h3>
                            <ShoppingCart className="w-6 h-6 text-blue-600" />
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <p className="text-2xl font-bold text-green-600">{transactionStats?.totalInwardTransactions || 0}</p>
                                <p className="text-sm text-green-700">Inward</p>
                            </div>
                            <div className="text-center p-4 bg-red-50 rounded-lg">
                                <p className="text-2xl font-bold text-red-600">{transactionStats?.totalOutwardTransactions || 0}</p>
                                <p className="text-sm text-red-700">Outward</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600">Total Product Serials:</span>
                                <span className="font-semibold">{transactionStats?.totalProductSerials || 0}</span>
                            </div>

                            {transactionStats?.productSerialStatus && (
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(transactionStats.productSerialStatus).map(([status, count]) => (
                                        <StatusBadge key={status} status={status} count={count} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

              
            </div>
        </div>
    );
};

export default AdminDashboard;