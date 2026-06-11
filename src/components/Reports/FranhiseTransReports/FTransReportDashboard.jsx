// FTransReportDashboard.jsx
import React, { useState, useEffect } from 'react';
import { FileText, BarChart3, TrendingUp, Users } from 'lucide-react';

import FranchiseTransactionReport from './FranchiseTransactionReports';
import FranchiseMerchantPerformanceReport from './FranchiseMerchantPerformance';
import FTransReportFilters from './FTransReportFilters';
import FranchiseTransactionWithTaxReport from './FranchiseTransactionWithTaxReport';

const FTransReportDashboard = () => {
    const [activeTab, setActiveTab] = useState('transactions');
    const userType = localStorage.getItem('userType')?.toLowerCase();
    const customerId = localStorage.getItem('customerId');
    const isFranchise = userType === 'franchise';
    const isAdmin = userType === 'admin' || userType === 'super_admin';

    const [commonFilters, setCommonFilters] = useState({
        selectedFranchise: isFranchise ? customerId : '',
        startDate: '',
        endDate: '',
        dateFilterType: 'SETTLEMENT_DATE'
    });

    useEffect(() => {
        if (isFranchise) {
            setCommonFilters(prev => ({ ...prev, selectedFranchise: customerId }));
        }
    }, [isFranchise, customerId]);

    const allReportTabs = [
        {
            id: 'transactions',
            name: 'Transaction Report',
            icon: FileText,
            component: FranchiseTransactionReport,
            description: 'View franchise commission transactions',
            allowedRoles: ['admin', 'super_admin', 'franchise'] // accessible to all
        },
        {
            id: 'transactions-tax',
            name: 'Transaction (Taxes) Report',
            icon: FileText,
            component: FranchiseTransactionWithTaxReport,
            description: 'View franchise commission transactions with taxes',
            allowedRoles: ['admin', 'super_admin'] // only admin and super_admin
        },
        {
            id: 'merchant-performance',
            name: 'Merchant Performance',
            icon: BarChart3,
            component: FranchiseMerchantPerformanceReport,
            description: 'Analyze merchant performance metrics',
            allowedRoles: ['admin', 'super_admin', 'franchise'] // accessible to all
        }
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
        <div className="p- bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <BarChart3 className="w-8 h-8 text-purple-600" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Franchise Reports Dashboard</h1>
                            <p className="text-gray-600">Comprehensive reporting and analytics for franchise operations</p>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="border-b border-gray-200 mb-3">
                        <nav className="-mb-px flex space-x-8">
                            {reportTabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                                            ? 'border-purple-500 text-purple-600'
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
                        <div className="bg-purple-50 rounded-lg p-4 mb-">
                            <div className="flex items-center gap-2">
                                <currentReport.icon className="w-5 h-5 text-purple-600" />
                                <h3 className="font-medium text-purple-900">{currentReport.name}</h3>
                            </div>
                            <p className="text-purple-700 text-sm mt-1">{currentReport.description}</p>
                        </div>
                    )}

                    {/* Common Filters */}
                    {/* <FTransReportFilters
                        filters={commonFilters}
                        onChange={handleFiltersChange}
                        isFranchise={isFranchise}
                        reportType={activeTab}
                    /> */}
                </div>

                {/* Report Content */}
                {CurrentReportComponent && (
                    <CurrentReportComponent
                        filters={commonFilters}
                        isFranchise={isFranchise}
                    />
                )}
            </div>
        </div>
    );
};

export default FTransReportDashboard;