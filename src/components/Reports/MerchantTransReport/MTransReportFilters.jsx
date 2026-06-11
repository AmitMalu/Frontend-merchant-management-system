// MTransReportFilters.jsx
import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import api from '../../../constants/API/axiosInstance';

const MTransReportFilters = ({ filters, onChange, userType, reportType, onGenerate, merchantType, setMerchantType }) => {
    const [merchants, setMerchants] = useState([]);
    const [franchises, setFranchises] = useState([]);
    const [loading, setLoading] = useState(false);
    // const [merchantType, setMerchantType] = useState('direct'); // 'direct' or 'franchise'

    const isAdmin = ['admin', 'super_admin'].includes(userType);
    const isFranchise = userType === 'franchise';
    const isMerchant = userType === 'merchant';

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
        }
        // Add more report configurations as needed
    };

    const currentConfig = reportConfigs[reportType] || {};

    // Fetch data based on user type
    useEffect(() => {
        if (isAdmin) {
            // Admin can see both direct and franchise merchants
            if (merchantType === 'direct') {
                fetchDirectMerchants();
            } else {
                fetchFranchises();
            }
        } else if (isFranchise) {
            // Franchise user sees only their merchants
            fetchFranchiseMerchants();
        }
        // Merchant user doesn't need to fetch anything as they use customerId
    }, [isAdmin, isFranchise, merchantType]);

    // Fetch franchise merchants when franchise is selected (for admin)
    useEffect(() => {
        if (isAdmin && merchantType === 'franchise' && filters.selectedFranchise) {
            fetchFranchiseMerchants(filters.selectedFranchise);
        }
    }, [filters.selectedFranchise, merchantType]);

    const fetchDirectMerchants = async () => {
        try {
            const response = await api.get('/merchants/direct-merchant');
            setMerchants(response.data);
        } catch (error) {
            console.error('Error fetching direct merchants:', error);
        }
    };

    const fetchFranchises = async () => {
        try {
            const response = await api.get('/franchise');
            setFranchises(response.data);
        } catch (error) {
            console.error('Error fetching franchises:', error);
        }
    };

    const fetchFranchiseMerchants = async (franchiseId = null) => {
        try {
            const customerId = localStorage.getItem('customerId');
            const id = franchiseId || customerId;
            const response = await api.get(`/merchants/franchise/${id}`);
            setMerchants(response.data);
        } catch (error) {
            console.error('Error fetching franchise merchants:', error);
        }
    };

    const handleInputChange = (field, value) => {
        onChange({ [field]: value });
    };

    const handleMerchantTypeChange = (type) => {
        setMerchantType(type);
        // Reset related filters when merchant type changes
        onChange({
            selectedFranchise: '',
            selectedMerchant: ''
        });
        setMerchants([]);
    };

    const handleGenerate = async () => {
        // validate start & end dates always
        if (!filters.startDate || !filters.endDate || !filters.dateFilterType) {
            alert('Please select start and end dates');
            return;
        }

        // validate merchant selection only if not a merchant user
        if (!isMerchant && !filters.selectedMerchant || !filters.dateFilterType) {
            alert('Please select a merchant');
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
            {/* Merchant Type Selection - Only for Admin */}
            {isAdmin && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Merchant Type
                    </label>
                    <div className="flex gap-4">
                        <label className="flex items-center">
                            <input
                                type="radio"
                                value="direct"
                                checked={merchantType === 'direct'}
                                onChange={(e) => handleMerchantTypeChange(e.target.value)}
                                className="mr-2"
                            />
                            Direct Merchant
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                value="franchise"
                                checked={merchantType === 'franchise'}
                                onChange={(e) => handleMerchantTypeChange(e.target.value)}
                                className="mr-2"
                            />
                            Franchise Merchant
                        </label>
                    </div>
                </div>
            )}

            {/* Filter Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Franchise Selection - Show for admin when franchise type selected */}
                {isAdmin && merchantType === 'franchise' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Franchise
                        </label>
                        <select
                            value={filters.selectedFranchise}
                            onChange={(e) => handleInputChange('selectedFranchise', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Choose Franchise</option>
                            {franchises.map((franchise) => (
                                <option key={franchise.id} value={franchise.id}>
                                    {franchise.franchiseName} - {franchise.contactPersonName}
                                </option>
                            ))}
                            
                        </select>
                    </div>
                )}

                {/* Merchant Selection - Show based on user type */}
                {!isMerchant && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Merchant
                        </label>
                        <select
                            value={filters.selectedMerchant}
                            onChange={(e) => handleInputChange('selectedMerchant', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            disabled={isAdmin && merchantType === 'franchise' && !filters.selectedFranchise}
                        >
                            <option value="">Choose Merchant</option>
                            {merchants.map((merchant) => (
                                <option key={merchant.id} value={merchant.id}>
                                    {merchant.businessName} - {merchant.contactPersonName}
                                </option>
                            ))}
                            {merchantType === "direct" && 
                                <option value="ALL">ALL</option>}
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                            value={filters.dateFilterType || "SETTLEMENT_DATE"}
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
                    className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <Search className="w-4 h-4" />
                    {loading ? 'Loading...' : 'Generate Report'}
                </button>
            )}
        </div>
    );
};

export default MTransReportFilters;