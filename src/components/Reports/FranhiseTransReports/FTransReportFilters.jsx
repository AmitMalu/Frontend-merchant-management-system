// FTransReportFilters.jsx
import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import api from '../../../constants/API/axiosInstance';

const FTransReportFilters = ({ filters, onChange, isFranchise, reportType, onGenerate }) => {
    const [franchises, setFranchises] = useState([]);
    const [loading, setLoading] = useState(false);

    // Report-specific filter configurations
    const reportConfigs = {
        'transactions': {
            showTransactionType: true,
            transactionTypeOptions: [
                { value: 'CREDIT', label: 'Credit' },
                { value: 'DEBIT', label: 'Debit' },
                { value: 'All', label: 'All' }
            ],
            showDateFilterType: true,
            dateFilterOptions: [
                { value: 'SETTLEMENT_DATE', label: 'Settlement Date' },
                { value: 'TRANSACTION_DATE', label: 'Transaction Date' }
            ]
        },
        'merchant-performance': {
            showTransactionType: false,
            showDateFilterType: true,
            dateFilterOptions: [
                { value: 'TRANSACTION_DATE', label: 'Transaction Date' },
                { value: 'SETTLEMENT_DATE', label: 'Settlement Date' }
            ]
        }
        // Add more report configurations as needed
    };

    const currentConfig = reportConfigs[reportType] || {};

    // Fetch franchises on component mount (only if not a franchise user)
    useEffect(() => {
        if (!isFranchise) {
            fetchFranchises();
        }
    }, [isFranchise]);

    const fetchFranchises = async () => {
        try {
            const response = await api.get('/franchise');
            setFranchises(response.data);
        } catch (error) {
            console.error('Error fetching franchises:', error);
        }
    };

    const handleInputChange = (field, value) => {
        onChange({ [field]: value });
    };

    const handleGenerate = async () => {
        if ((!isFranchise & !filters.selectedFranchise) || !filters.startDate || !filters.endDate) {
            alert('Please fill all required fields');
            return;
        }
        if (!filters.startDate || !filters.endDate) {
            alert('Please fill all required fields');
            return;
        }

        if (onGenerate) {
            setLoading(true);
            try {
                await onGenerate();
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="space-y-4">
            {/* Filter Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Franchise Selection - Only show if not franchise user */}
                {!isFranchise && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Franchise
                        </label>
                        <select
                            value={filters.selectedFranchise}
                            onChange={(e) => handleInputChange('selectedFranchise', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        >
                            <option value="">Choose Franchise</option>
                            {franchises.map((franchise) => (
                                <option key={franchise.id} value={franchise.id}>
                                    {franchise.franchiseName} - {franchise.contactPersonName}
                                </option>
                                
                            ))}
                            <option value="ALL">ALL</option>
                        </select>
                    </div>
                )}

                {/* Start Date */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date
                    </label>
                    <input
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => handleInputChange('startDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                </div>

                {/* End Date */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Date
                    </label>
                    <input
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => handleInputChange('endDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                </div>

                {/* Transaction Type - Show based on report type */}
                {currentConfig.showTransactionType && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Transaction Type
                        </label>
                        <select
                            value={filters.transactionType || 'CREDIT'}
                            onChange={(e) => handleInputChange('transactionType', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        >
                            {currentConfig.transactionTypeOptions?.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Date Filter Type - Show based on report type */}
                {currentConfig.showDateFilterType && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Date Filter Type
                        </label>
                        <select
                            value={filters.dateFilterType}
                            onChange={(e) => handleInputChange('dateFilterType', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        >
                            {currentConfig.dateFilterOptions?.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Generate Button */}
            {onGenerate && (
                <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <Search className="w-4 h-4" />
                    {loading ? 'Loading...' : 'Generate Report'}
                </button>
            )}
        </div>
    );
};

export default FTransReportFilters;