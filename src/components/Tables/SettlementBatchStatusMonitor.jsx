import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import api from "../../constants/API/axiosInstance";

const SettlementBatchStatusMonitor = () => {
    const { register, watch, reset } = useForm({
        defaultValues: {
            customerType: "",
            franchiseId: "",
            merchantId: ""
        }
    });

    const [availableFranchises, setAvailableFranchises] = useState([]);
    const [availableDirectMerchants, setAvailableDirectMerchants] = useState([]);
    const [availableFranchiseMerchants, setAvailableFranchiseMerchants] = useState([]);
    const [selectedEntity, setSelectedEntity] = useState(null);
    const [settlementBatches, setSettlementBatches] = useState([]);
    const [batchDetails, setBatchDetails] = useState({});
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState({});

    const customerType = watch("customerType");
    const franchiseId = watch("franchiseId");
    const merchantId = watch("merchantId");

    // Fetch initial data
    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                const [franchisesResponse, directMerchantsResponse] = await Promise.all([
                    api.get("/franchise"),
                    api.get("/merchants/direct-merchant")
                ]);

                setAvailableFranchises(franchisesResponse.data);
                setAvailableDirectMerchants(directMerchantsResponse.data);
            } catch (error) {
                console.error("Error fetching initial data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    // Reset form when customer type changes
    useEffect(() => {
        if (customerType) {
            setAvailableFranchiseMerchants([]);
            setSelectedEntity(null);
            setSettlementBatches([]);
            setBatchDetails({});
        }
    }, [customerType]);

    // Fetch franchise merchants when franchise is selected
    useEffect(() => {
        const fetchFranchiseMerchants = async () => {
            if (!franchiseId || customerType !== "franchise") return;

            setLoading(true);
            try {
                const response = await api.get(`/merchants/franchise/${franchiseId}`);
                setAvailableFranchiseMerchants(response.data);

                // Set selected franchise entity
                const franchise = availableFranchises.find(f => f.id === parseInt(franchiseId));
                setSelectedEntity(franchise);
            } catch (error) {
                console.error("Error fetching franchise merchants:", error);
                setAvailableFranchiseMerchants([]);
            } finally {
                setLoading(false);
            }
        };

        fetchFranchiseMerchants();
    }, [franchiseId, customerType, availableFranchises]);

    // Set selected entity for direct merchant
    useEffect(() => {
        if (customerType === "direct" && merchantId) {
            const merchant = availableDirectMerchants.find(m => m.id === parseInt(merchantId));
            setSelectedEntity(merchant);
        }
    }, [merchantId, customerType, availableDirectMerchants]);

    // Fetch settlement batches when merchant is selected
    useEffect(() => {
        const fetchSettlementBatches = async () => {
            if (!merchantId) {
                setSettlementBatches([]);
                setBatchDetails({});
                return;
            }

            setLoading(true);
            try {
                const response = await api.get(`/merchants/${merchantId}/settlement/batches`);
                setSettlementBatches(response.data);

                // Fetch details for each batch (status endpoint)
                const batchDetailsPromises = response.data.map(async (batch) => {
                    try {
                        const statusResponse = await api.get(
                            `/merchants/${merchantId}/settlement/batches/${batch.batchId}`
                        );
                        return { batchId: batch.batchId, details: statusResponse.data };
                    } catch (error) {
                        console.error(`Error fetching details for batch ${batch.batchId}:`, error);
                        return { batchId: batch.batchId, details: null, error: true };
                    }
                });

                const allBatchDetails = await Promise.all(batchDetailsPromises);
                const batchDetailsMap = {};
                allBatchDetails.forEach(({ batchId, details, error }) => {
                    batchDetailsMap[batchId] = { details, error };
                });
                setBatchDetails(batchDetailsMap);

            } catch (error) {
                console.error("Error fetching settlement batches:", error);
                setSettlementBatches([]);
            } finally {
                setLoading(false);
            }
        };

        fetchSettlementBatches();
    }, [merchantId]);

    const refreshBatchStatus = async (batchId) => {
        if (!merchantId) return;

        setRefreshing(prev => ({ ...prev, [batchId]: true }));
        try {
            const statusResponse = await api.get(
                `/merchants/${merchantId}/settlement/batches/${batchId}`
            );

            setBatchDetails(prev => ({
                ...prev,
                [batchId]: { details: statusResponse.data, error: false }
            }));
        } catch (error) {
            console.error(`Error refreshing batch ${batchId} status:`, error);
            setBatchDetails(prev => ({
                ...prev,
                [batchId]: { details: null, error: true }
            }));
        } finally {
            setRefreshing(prev => ({ ...prev, [batchId]: false }));
        }
    };

    const refreshAllBatches = async () => {
        if (!merchantId || !settlementBatches.length) return;

        setLoading(true);
        try {
            const batchDetailsPromises = settlementBatches.map(async (batch) => {
                try {
                    const statusResponse = await api.get(
                        `/merchants/${merchantId}/settlement/batches/${batch.batchId}`
                    );
                    return { batchId: batch.batchId, details: statusResponse.data };
                } catch (error) {
                    console.error(`Error fetching details for batch ${batch.batchId}:`, error);
                    return { batchId: batch.batchId, details: null, error: true };
                }
            });

            const allBatchDetails = await Promise.all(batchDetailsPromises);
            const batchDetailsMap = {};
            allBatchDetails.forEach(({ batchId, details, error }) => {
                batchDetailsMap[batchId] = { details, error };
            });
            setBatchDetails(batchDetailsMap);
        } catch (error) {
            console.error("Error refreshing all batches:", error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        reset();
        setSelectedEntity(null);
        setAvailableFranchiseMerchants([]);
        setSettlementBatches([]);
        setBatchDetails({});
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        switch (status?.toUpperCase()) {
            case 'OPEN':
                return 'bg-blue-100 text-blue-800';
            case 'PROCESSING':
                return 'bg-yellow-100 text-yellow-800';
            case 'COMPLETED':
            case 'SETTLED':
                return 'bg-green-100 text-green-800';
            case 'FAILED':
            case 'ERROR':
                return 'bg-red-100 text-red-800';
            case 'CANCELLED':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getMerchantsForSelection = () => {
        return customerType === "franchise" ? availableFranchiseMerchants : availableDirectMerchants;
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Settlement Batch Status Monitor</h1>
                    <p className="text-gray-600">Monitor the status of settlement batches and their progress</p>
                </div>

                <div className="space-y-6">
                    {/* Selection Fields */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Batch Monitoring Parameters</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Customer Type Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Customer Type</label>
                                <select
                                    {...register("customerType", { required: true })}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    disabled={loading}
                                >
                                    <option value="">Select type...</option>
                                    <option value="direct">Direct Merchant</option>
                                    <option value="franchise">Franchise</option>
                                </select>
                            </div>

                            {/* Franchise Selection (only for franchise type) */}
                            {customerType === "franchise" && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Franchise</label>
                                    <select
                                        {...register("franchiseId", { required: customerType === "franchise" })}
                                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        disabled={loading}
                                    >
                                        <option value="">Choose franchise...</option>
                                        {availableFranchises.map((franchise) => (
                                            <option key={franchise.id} value={franchise.id}>
                                                {franchise.franchiseName} - {franchise.contactPersonName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Merchant Selection */}
                            {customerType && (customerType === "direct" || franchiseId) && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Merchant</label>
                                    <select
                                        {...register("merchantId", { required: true })}
                                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        disabled={loading}
                                    >
                                        <option value="">Choose merchant...</option>
                                        {getMerchantsForSelection().map((merchant) => (
                                            <option key={merchant.id} value={merchant.id}>
                                                {merchant.businessName} - {merchant.contactPersonName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Selected Entity Details */}
                    {selectedEntity && (
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">Monitoring Details</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-500">
                                        {customerType === "franchise" ? "Franchise:" : "Business:"}
                                    </span>
                                    <p className="font-medium">
                                        {customerType === "franchise" ? selectedEntity.franchiseName : selectedEntity.businessName}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-gray-500">Contact Person:</span>
                                    <p className="font-medium">{selectedEntity.contactPersonName}</p>
                                </div>
                                <div>
                                    <span className="text-gray-500">Email:</span>
                                    <p className="font-medium">{selectedEntity.contactPersonEmail}</p>
                                </div>
                                <div>
                                    <span className="text-gray-500">Total Batches:</span>
                                    <p className="font-medium text-blue-600">{settlementBatches.length}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Settlement Batches */}
                    {settlementBatches.length > 0 && (
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-medium text-gray-900">
                                    Settlement Batches ({settlementBatches.length})
                                </h2>
                                <button
                                    onClick={refreshAllBatches}
                                    disabled={loading}
                                    className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 border border-blue-600 hover:border-blue-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? "Refreshing..." : "Refresh All"}
                                </button>
                            </div>

                            <div className="space-y-4">
                                {settlementBatches.map((batch) => {
                                    const batchDetail = batchDetails[batch.batchId];
                                    const hasError = batchDetail?.error;

                                    return (
                                        <div key={batch.batchId} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                            {/* Batch Header */}
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3">
                                                        <h3 className="text-lg font-medium text-gray-900">
                                                            Batch #{batch.batchId}
                                                        </h3>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(batch.status)}`}>
                                                            {batch.status}
                                                        </span>
                                                        {hasError && (
                                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                                Status Error
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        Window: {formatDate(batch.windowStart)} - {formatDate(batch.windowEnd)}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => refreshBatchStatus(batch.batchId)}
                                                    disabled={refreshing[batch.batchId]}
                                                    className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {refreshing[batch.batchId] ? "..." : "Refresh"}
                                                </button>
                                            </div>

                                            {/* Batch Details Grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                                {/* Transaction Info */}
                                                <div className="space-y-2">
                                                    <div>
                                                        <span className="text-gray-500">Total Transactions:</span>
                                                        <p className="font-medium">{batch.totalTransactions}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Processed:</span>
                                                        <p className="font-medium text-green-600">{batch.processedTransactions}</p>
                                                    </div>
                                                </div>

                                                {/* Amount Info */}
                                                <div className="space-y-2">
                                                    <div>
                                                        <span className="text-gray-500">Total Amount:</span>
                                                        <p className="font-medium">₹{batch.totalAmount.toLocaleString('en-IN')}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Net Amount:</span>
                                                        <p className="font-medium text-green-600">₹{batch.totalNetAmount.toLocaleString('en-IN')}</p>
                                                    </div>
                                                </div>

                                                {/* Fees & Failed */}
                                                <div className="space-y-2">
                                                    <div>
                                                        <span className="text-gray-500">Total Fees:</span>
                                                        <p className="font-medium">₹{batch.totalFees.toLocaleString('en-IN')}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Failed Transactions:</span>
                                                        <p className="font-medium text-red-600">{batch.failedTransactions}</p>
                                                    </div>
                                                </div>

                                                {/* Processing Times */}
                                                <div className="space-y-2">
                                                    <div>
                                                        <span className="text-gray-500">Started:</span>
                                                        <p className="font-medium">{formatDate(batch.processingStartedAt)}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Completed:</span>
                                                        <p className="font-medium">{formatDate(batch.processingCompletedAt)}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Progress Bar */}
                                            {batch.totalTransactions > 0 && (
                                                <div className="mt-4">
                                                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                                                        <span>Processing Progress</span>
                                                        <span>
                                                            {batch.processedTransactions} / {batch.totalTransactions}
                                                            ({Math.round((batch.processedTransactions / batch.totalTransactions) * 100)}%)
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                                            style={{
                                                                width: `${Math.min((batch.processedTransactions / batch.totalTransactions) * 100, 100)}%`
                                                            }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Error Messages */}
                                            {batch.errorMessage && (
                                                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                                                    <p className="text-sm text-red-800">
                                                        <strong>Error:</strong> {batch.errorMessage}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Last Updated from status API */}
                                            {batchDetail?.details?.lastUpdated && (
                                                <div className="mt-4 pt-4 border-t border-gray-200">
                                                    <div className="text-sm">
                                                        <span className="text-gray-500">Last Status Check:</span>
                                                        <span className="font-medium ml-2">{formatDate(batchDetail.details.lastUpdated)}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* No Batches Message */}
                    {merchantId && !loading && settlementBatches.length === 0 && (
                        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
                            <div className="text-gray-500">
                                <p className="text-lg">No settlement batches found</p>
                                <p className="text-sm mt-2">
                                    No settlement batches have been created for {selectedEntity?.businessName || selectedEntity?.franchiseName}.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Loading Indicator */}
                    {loading && !settlementBatches.length && (
                        <div className="text-center py-8">
                            <div className="inline-flex items-center">
                                <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full mr-3"></div>
                                <span className="text-gray-600">Loading settlement batches...</span>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={resetForm}
                            className="px-6 py-3 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        >
                            Reset
                        </button>

                        <div className="text-sm text-gray-600">
                            {settlementBatches.length > 0 && (
                                <span>Total batches: {settlementBatches.length}</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettlementBatchStatusMonitor;