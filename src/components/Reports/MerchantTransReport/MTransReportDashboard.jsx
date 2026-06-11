// MTransReportDashboard.jsx
import React, { useState, useEffect } from 'react';
import { FileText, BarChart3, Store, Users } from 'lucide-react';

import MerchantTransactionReports from './MerchantTransactionReports';
import MerchantTransactionWithTaxesReports from './MerchantTransactionWithTaxesReports';
// Future components can be imported here
// import MerchantSettlementReport from './MerchantSettlementReport';
// import MerchantAnalyticsReport from './MerchantAnalyticsReport';

const MTransReportDashboard = () => {
    const [activeTab, setActiveTab] = useState('transactions');
    
    const [commonFilters, setCommonFilters] = useState({
        selectedFranchise: '',
        selectedMerchant: '',
        startDate: '',
        endDate: '',
        dateFilterType: 'SETTLEMENT_DATE'
    });

    // Get user details
    const userType = localStorage.getItem('userType')?.toLowerCase();
    const customerId = localStorage.getItem('customerId');
    const isMerchant = userType === 'merchant';

    useEffect(() => {
        if (isMerchant) {
            setCommonFilters(prev => ({ ...prev, selectedMerchant: customerId }));
        }
    }, [isMerchant, customerId]);

    const allReportTabs = [
        {
            id: 'transactions',
            name: 'Transaction Report',
            icon: FileText,
            component: MerchantTransactionReports,
            description: 'View detailed merchant transaction history',
            allowedRoles: ['admin', 'super_admin', 'franchise', 'merchant'] // accessible to all
        },
        {
            id: 'transactions-tax',
            name: 'Transaction (GST) Report',
            icon: FileText,
            component: MerchantTransactionWithTaxesReports,
            description: 'View detailed merchant transaction with gst history',
            allowedRoles: ['admin', 'super_admin'] // only admin and super_admin
        },
        // Future tabs can be added here
        // {
        //     id: 'settlement',
        //     name: 'Settlement Report',
        //     icon: BarChart3,
        //     component: MerchantSettlementReport,
        //     description: 'View settlement details and history'
        // },
        // {
        //     id: 'analytics',
        //     name: 'Analytics Report',
        //     icon: TrendingUp,
        //     component: MerchantAnalyticsReport,
        //     description: 'Analyze merchant performance metrics'
        // }
    ];
    // Filter tabs based on user role
    const reportTabs = allReportTabs.filter(tab =>
        tab.allowedRoles.includes(userType)
    );
    const currentReport = reportTabs.find(tab => tab.id === activeTab);
    const CurrentReportComponent = currentReport?.component;

    const handleFiltersChange = (newFilters) => {
        setCommonFilters(prev => ({ ...prev, ...newFilters }));
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border p-6 mb-2">
                    <div className="flex items-center gap-3 mb-2">
                        <Store className="w-8 h-8 text-blue-600" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Merchant Reports Dashboard</h1>
                            <p className="text-gray-600">Comprehensive reporting and analytics for merchant operations</p>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="border-b border-gray-200 mb-2">
                        <nav className="-mb-px flex space-x-8">
                            {reportTabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {tab.name}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Current Tab Description */}
                    {currentReport && (
                        <div className="bg-blue-50 rounded-lg p-4 mb-2">
                            <div className="flex items-center gap-2">
                                <currentReport.icon className="w-5 h-5 text-blue-600" />
                                <h3 className="font-medium text-blue-900">{currentReport.name}</h3>
                            </div>
                            <p className="text-blue-700 text-sm mt-1">{currentReport.description}</p>
                        </div>
                    )}

                    {/* User Type Info */}
                    {userType && (
                        <div className="bg-gray-100 rounded-lg p-3 mb-">
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                <Users className="w-4 h-4" />
                                <span>User Type: <span className="font-medium capitalize">{userType}</span></span>
                                {isMerchant && <span className="text-green-600">• Auto-selected your merchant account</span>}
                            </div>
                        </div>
                    )}
                </div>

                {/* Report Content */}
                {CurrentReportComponent && (
                    <CurrentReportComponent
                        filters={commonFilters}
                        userType={userType}
                    />
                )}
            </div>
        </div>
    );
};

export default MTransReportDashboard;