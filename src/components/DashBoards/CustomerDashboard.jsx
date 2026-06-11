import React, { useState, useEffect, useCallback } from 'react';
import {
    Store,
    Package,
    Users,
    Wallet,
    ShoppingCart,
    ArrowUpRight,
    ArrowDownLeft,
    RefreshCw,
    AlertCircle,
    CheckCircle,
    Clock,
    Target,
    TrendingUp,
    Box,
    CreditCard,
    Activity
} from 'lucide-react';
import api from '../../constants/API/axiosInstance';

const CustomerDashboard = ({ userType }) => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userId, setUserId] = useState(null);

    // Function to get userId from localStorage with retry logic
    const getUserId = useCallback(() => {
        const id = localStorage.getItem("customerId");
        return id && id !== 'null' && id !== 'undefined' ? id : null;
    }, []);

    // Effect to monitor localStorage changes and set userId
    useEffect(() => {
        const checkUserId = () => {
            const id = getUserId();
            if (id !== userId) {
                setUserId(id);
            }
        };

        // Check immediately
        checkUserId();

        // Set up interval to check for userId (useful for async login scenarios)
        const intervalId = setInterval(checkUserId, 100);

        // Listen for storage events (when localStorage changes)
        const handleStorageChange = (e) => {
            if (e.key === 'customerId') {
                checkUserId();
            }
        };

        window.addEventListener('storage', handleStorageChange);

        // Cleanup
        return () => {
            clearInterval(intervalId);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [getUserId, userId]);

    const fetchDashboardData = useCallback(async () => {
        // Don't fetch if userId is not available
        if (!userId) {
            setLoading(true);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const endpoint = userType === 'franchise'
                ? `/stats/franchises/${userId}`
                : `/stats/merchants/${userId}`;

            const response = await api.get(endpoint);
            setDashboardData(response.data);
        } catch (err) {
            setError(`Failed to fetch ${userType} dashboard data`);
            console.error('Dashboard fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [userType, userId]);

    // Effect to fetch data when userId or userType changes
    useEffect(() => {
        if (userId) {
            fetchDashboardData();
        }
    }, [userId, fetchDashboardData]);

    // Show loading state while waiting for userId
    if (!userId) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
                <div className="flex items-center space-x-3 text-slate-600">
                    <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
                    <span className="text-xl font-medium">Initializing Dashboard...</span>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
                <div className="flex items-center space-x-3 text-slate-600">
                    <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
                    <span className="text-xl font-medium">Loading Dashboard...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md shadow-lg">
                    <div className="flex items-center space-x-3 text-red-700 mb-4">
                        <AlertCircle className="w-6 h-6" />
                        <span className="font-medium">{error}</span>
                    </div>
                    <button
                        onClick={fetchDashboardData}
                        className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const StatCard = ({ title, value, icon: Icon, color = "blue", subtitle = null, bgGradient = null }) => (
        <div className={`${bgGradient || 'bg-white'} rounded-xl shadow-lg border-0 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600 mb-2">{title}</p>
                    <p className={`text-3xl font-bold mb-1 ${bgGradient ? 'text-white' : `text-${color}-600`}`}>
                        {value}
                    </p>
                    {subtitle && (
                        <p className={`text-sm ${bgGradient ? 'text-white text-opacity-80' : 'text-slate-500'}`}>
                            {subtitle}
                        </p>
                    )}
                </div>
                <div className={`p-3 rounded-xl ${bgGradient ? 'bg-white bg-opacity-20' : `bg-${color}-50`}`}>
                    <Icon className={`w-6 h-6 ${bgGradient ? 'text-white' : `text-${color}-600`}`} />
                </div>
            </div>
        </div>
    );

    const ProductCard = ({ product, userType }) => {
        const isDirectMerchant = userType === 'merchant' && product.outwardId;
        const isFranchiseMerchant = userType === 'merchant' && !product.outwardId;
        const isFranchiseProduct = userType === 'franchise';

        return (
            <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <h4 className="text-lg font-bold text-slate-900 mb-1">{product.productName}</h4>
                        <p className="text-sm text-slate-500 mb-2">Code: {product.productCode}</p>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {product.productCategory}
                        </span>
                    </div>
                    <Package className="w-8 h-8 text-blue-600" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {isFranchiseProduct && (
                        <>
                            <div className="text-center p-3 bg-green-50 rounded-lg">
                                <p className="text-2xl font-bold text-green-600">{product.totalQuantity}</p>
                                <p className="text-xs text-green-700">Total Qty</p>
                            </div>
                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                                <p className="text-2xl font-bold text-blue-600">{product.remainingQuantity}</p>
                                <p className="text-xs text-blue-700">Remaining</p>
                            </div>
                        </>
                    )}

                    {(isDirectMerchant || isFranchiseMerchant) && (
                        <div className="col-span-2 text-center p-4 bg-purple-50 rounded-lg">
                            <p className="text-3xl font-bold text-purple-600">{product.totalQuantity}</p>
                            <p className="text-sm text-purple-700">Allocated Quantity</p>
                        </div>
                    )}
                </div>

                {product.outwardId && (
                    <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">Outward ID:</span>
                            <span className="text-sm font-mono font-medium text-slate-900">#{product.outwardId}</span>
                        </div>
                    </div>
                )}

                {!product.outwardId && userType === 'merchant' && (
                    <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-orange-600" />
                            <span className="text-sm text-orange-700 font-medium">Allocated via Franchise</span>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const getUserTypeDisplay = () => {
        return userType === 'franchise' ? 'Franchise Partner' : 'Merchant Partner';
    };

    const getUserIcon = () => {
        return userType === 'franchise' ? Store : Users;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <div className="container mx-auto px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center space-x-3 mb-2">
                                {React.createElement(getUserIcon(), { className: "w-8 h-8 text-blue-600" })}
                                <h1 className="text-4xl font-bold text-slate-900">
                                    {getUserTypeDisplay()} Dashboard
                                </h1>
                            </div>
                            <p className="text-slate-600">
                                {userType === 'franchise'
                                    ? `Franchise ID: ${dashboardData?.franchiseId || userId}`
                                    : `Merchant ID: ${dashboardData?.merchantId || userId}`
                                }
                            </p>
                        </div>
                        <button
                            onClick={fetchDashboardData}
                            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            <RefreshCw className="w-4 h-4" />
                            <span>Refresh</span>
                        </button>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {userType === 'franchise' ? (
                        <>
                            <StatCard
                                title="Total Merchants"
                                value={dashboardData?.merchantCount || 0}
                                icon={Users}
                                color="blue"
                                subtitle="Under your franchise"
                                bgGradient="bg-gradient-to-br from-blue-500 to-blue-600"
                            />
                            <StatCard
                                title="Outward Transactions"
                                value={dashboardData?.outwardTransactions || 0}
                                icon={ArrowUpRight}
                                color="green"
                                subtitle="Products distributed"
                            />
                            <StatCard
                                title="Active Products"
                                value={dashboardData?.products?.length || 0}
                                icon={Package}
                                color="orange"
                                subtitle="In your inventory"
                                bgGradient="bg-gradient-to-br from-orange-500 to-red-500"
                            />
                        </>
                    ) : (
                        <>
                            <StatCard
                                title="Outward Transactions"
                                value={dashboardData?.outwardTransactions || 0}
                                icon={ShoppingCart}
                                color="green"
                                subtitle="Total transactions"
                                bgGradient="bg-gradient-to-br from-green-500 to-emerald-600"
                            />
                            <StatCard
                                title="Products Allocated"
                                value={dashboardData?.productsAllocated || 0}
                                icon={Package}
                                color="blue"
                                subtitle="Products assigned"
                            />
                            <StatCard
                                title="Active Products"
                                value={dashboardData?.products?.length || 0}
                                icon={Box}
                                color="orange"
                                subtitle="Currently allocated"
                            />
                        </>
                    )}
                </div>

                {/* Products Section */}
                <div className="bg-white rounded-2xl shadow-xl border-0 p-8 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Package className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900">
                                    {userType === 'franchise' ? 'Inventory Management' : 'Allocated Products'}
                                </h3>
                                <p className="text-slate-600">
                                    {userType === 'franchise'
                                        ? 'Manage your franchise product inventory'
                                        : 'View your allocated products and status'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>

                    {dashboardData?.products && dashboardData.products.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {dashboardData.products.map((product, index) => (
                                <ProductCard
                                    key={product.productId || index}
                                    product={product}
                                    userType={userType}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <h4 className="text-lg font-medium text-slate-500 mb-2">No Products Found</h4>
                            <p className="text-slate-400">
                                {userType === 'franchise'
                                    ? 'No products in your franchise inventory yet.'
                                    : 'No products have been allocated to you yet.'
                                }
                            </p>
                        </div>
                    )}
                </div>

                {/* Transaction Summary */}
                <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl shadow-lg border border-slate-200 p-8">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                            <Activity className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-slate-900">Transaction Summary</h3>
                            <p className="text-slate-600">Overview of your transaction activity</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-xl p-6 shadow-md">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600 mb-1">Outward Transactions</p>
                                    <p className="text-2xl font-bold text-blue-600">{dashboardData?.outwardTransactions || 0}</p>
                                </div>
                                <ArrowUpRight className="w-8 h-8 text-blue-600" />
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-md">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600 mb-1">Return Transactions</p>
                                    <p className="text-2xl font-bold text-red-600">{dashboardData?.returnTransactions || 0}</p>
                                </div>
                                <ArrowDownLeft className="w-8 h-8 text-red-600" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerDashboard;