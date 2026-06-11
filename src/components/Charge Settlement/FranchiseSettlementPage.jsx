import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import SettlementFilters from './SettlementFilters';
import CandidatesTable from './CandidatesTable';
import SettlementFooter from './SettlementFooter';
import MerchantTabs from './MerchantTabs';
import { useBatch } from './useBatch';
import { useBeforeUnload } from './useBeforeUnload';
import settlementApi from './settlementApi';
import { formatCurrency } from './formatters';

/**
 * Franchise Settlement Page Component - FIXED & COMPACT VERSION
 * Now properly tracks and calculates merchant totals with working cache
 */
const FranchiseSettlementPage = () => {
    // Form state
    const [selectedFranchiseId, setSelectedFranchiseId] = useState('');
    const [cycleKey, setCycleKey] = useState('');
    const [productId, setProductId] = useState('');
    const [selectedMerchantIds, setSelectedMerchantIds] = useState([]);
    const [activeTab, setActiveTab] = useState('');

    // Cache all candidates data per merchant
    const [merchantCandidatesCache, setMerchantCandidatesCache] = useState({});

    // Loading state for candidates
    const [candidatesLoading, setCandidatesLoading] = useState(false);

    // Merchant-specific selections: { merchantId: [txId1, txId2, ...] }
    const [merchantSelections, setMerchantSelections] = useState({});

    // Data state
    const [franchises, setFranchises] = useState([]);
    const [availableMerchants, setAvailableMerchants] = useState([]);
    const [products, setProducts] = useState([]);
    const [isLoadingFranchises, setIsLoadingFranchises] = useState(false);
    const [isLoadingMerchants, setIsLoadingMerchants] = useState(false);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);

    // Custom hooks
    const {
        batch,
        isLoading: batchLoading,
        createFranchiseBatch,
        processFranchiseBatch,
        resetBatch
    } = useBatch();

    // Check for unsaved changes
    const hasUnsavedChanges = Boolean(batch && Object.keys(merchantSelections).some(id => merchantSelections[id].length > 0));
    useBeforeUnload(hasUnsavedChanges, 'You have unsaved franchise settlement selections. Are you sure you want to leave?');

    // Get current merchant candidates from cache
    const candidates = useMemo(() => {
        return merchantCandidatesCache[activeTab] || [];
    }, [merchantCandidatesCache, activeTab]);

    // Load franchises on mount
    useEffect(() => {
        const loadFranchises = async () => {
            setIsLoadingFranchises(true);
            try {
                const franchisesData = await settlementApi.getFranchises();
                setFranchises(franchisesData || []);
            } catch (error) {
                toast.error('Failed to load franchises');
                setFranchises([]);
            } finally {
                setIsLoadingFranchises(false);
            }
        };
        loadFranchises();
    }, []);

    // Load products when franchise is selected
    useEffect(() => {
        const loadProducts = async () => {
            if (!selectedFranchiseId) {
                setProducts([]);
                return;
            }

            setIsLoadingProducts(true);
            try {
                const productsData = await settlementApi.getFranchiseProducts(selectedFranchiseId);
                setProducts(productsData || []);
            } catch (error) {
                toast.error('Failed to load products for franchise');
                setProducts([]);
            } finally {
                setIsLoadingProducts(false);
            }
        };
        loadProducts();
    }, [selectedFranchiseId]);

    // Load available merchants
    useEffect(() => {
        const loadAvailableMerchants = async () => {
            if (!selectedFranchiseId || !cycleKey || !productId) {
                setAvailableMerchants([]);
                return;
            }

            setIsLoadingMerchants(true);
            try {
                const merchantsData = await settlementApi.getFranchiseAvailableMerchants(
                    selectedFranchiseId,
                    cycleKey,
                    productId
                );
                setAvailableMerchants(merchantsData || []);
            } catch (error) {
                toast.error('Failed to load available merchants');
                setAvailableMerchants([]);
            } finally {
                setIsLoadingMerchants(false);
            }
        };
        loadAvailableMerchants();
    }, [selectedFranchiseId, cycleKey, productId]);

    // Create franchise batch
    const handleCreateFranchiseBatch = useCallback(async () => {
        if (!selectedFranchiseId || !cycleKey || !productId || !selectedMerchantIds.length) return;

        try {
            await createFranchiseBatch(selectedFranchiseId, cycleKey, productId, selectedMerchantIds);

            // Set first merchant as active tab
            if (selectedMerchantIds.length > 0) {
                setActiveTab(selectedMerchantIds[0]);
            }
        } catch (error) {
            // Error handled in useBatch
        }
    }, [selectedFranchiseId, cycleKey, productId, selectedMerchantIds, createFranchiseBatch]);

    // Load and CACHE candidates for active merchant tab
    useEffect(() => {
        const loadMerchantCandidates = async () => {
            if (!batch || !activeTab || !cycleKey || !productId) {
                return;
            }

            // Check if already cached - if so, just use it (candidates computed via useMemo)
            if (merchantCandidatesCache[activeTab]) {
                return;
            }

            // Fetch from API
            setCandidatesLoading(true);
            try {
                const candidatesData = await settlementApi.getFranchiseMerchantCandidates(
                    selectedFranchiseId,
                    batch.batchId,
                    activeTab,
                    cycleKey,
                    productId
                );

                // CACHE the candidates
                setMerchantCandidatesCache(prev => ({
                    ...prev,
                    [activeTab]: candidatesData || []
                }));
            } catch (error) {
                const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch merchant candidates';
                toast.error(errorMessage);
                // Cache empty array to prevent repeated failed requests
                setMerchantCandidatesCache(prev => ({
                    ...prev,
                    [activeTab]: []
                }));
            } finally {
                setCandidatesLoading(false);
            }
        };

        loadMerchantCandidates();
    }, [batch, activeTab, selectedFranchiseId, cycleKey, productId, merchantCandidatesCache]);

    // Handle merchant selection for batch creation
    const handleMerchantSelection = useCallback((merchantId, checked) => {
        if (checked) {
            setSelectedMerchantIds(prev => [...prev, merchantId]);
        } else {
            setSelectedMerchantIds(prev => prev.filter(id => id !== merchantId));
            // Clear selections and cache for removed merchant
            setMerchantSelections(prev => {
                const newSelections = { ...prev };
                delete newSelections[merchantId];
                return newSelections;
            });
            setMerchantCandidatesCache(prev => {
                const newCache = { ...prev };
                delete newCache[merchantId];
                return newCache;
            });
        }
    }, []);

    // Handle transaction selection for current merchant
    const handleTransactionSelection = useCallback((txIds) => {
        if (activeTab) {
            setMerchantSelections(prev => ({
                ...prev,
                [activeTab]: txIds
            }));
        }
    }, [activeTab]);

    // Calculate merchant summaries with ACTUAL amounts
    const merchantSelectionSummaries = useMemo(() => {
        const summaries = {};

        selectedMerchantIds.forEach(merchantId => {
            const selections = merchantSelections[merchantId] || [];
            const merchantCandidates = merchantCandidatesCache[merchantId] || [];
            const validCandidates = merchantCandidates.filter(c => !c.error);

            // Get selected candidates with their data
            const selectedCandidates = validCandidates.filter(c =>
                selections.includes(c.transactionReferenceId)
            );

            summaries[merchantId] = {
                selectedCount: selectedCandidates.length,
                totalCount: validCandidates.length,
                amount: selectedCandidates.reduce((sum, c) => sum + (c.amount || 0), 0),
                fees: selectedCandidates.reduce((sum, c) => sum + (c.fee || 0), 0),
                net: selectedCandidates.reduce((sum, c) => sum + (c.netAmount || 0), 0)
            };
        });

        return summaries;
    }, [selectedMerchantIds, merchantSelections, merchantCandidatesCache]);

    // Calculate global totals from merchant summaries
    const globalTotals = useMemo(() => {
        const summaries = Object.values(merchantSelectionSummaries);

        return {
            merchants: selectedMerchantIds.length,
            transactions: summaries.reduce((sum, s) => sum + s.selectedCount, 0),
            amount: summaries.reduce((sum, s) => sum + s.amount, 0),
            fees: summaries.reduce((sum, s) => sum + s.fees, 0),
            net: summaries.reduce((sum, s) => sum + s.net, 0)
        };
    }, [merchantSelectionSummaries, selectedMerchantIds]);

    // Current merchant selection totals (for active tab)
    const currentSelectionTotals = useMemo(() => {
        const currentSelections = merchantSelections[activeTab] || [];
        const validCandidates = candidates.filter(c => !c.error);
        const selectedCandidates = validCandidates.filter(c =>
            currentSelections.includes(c.transactionReferenceId)
        );

        return {
            selectedCount: selectedCandidates.length,
            totalCount: validCandidates.length,
            selectedAmount: selectedCandidates.reduce((sum, c) => sum + (c.amount || 0), 0),
            selectedFees: selectedCandidates.reduce((sum, c) => sum + (c.fee || 0), 0),
            selectedNet: selectedCandidates.reduce((sum, c) => sum + (c.netAmount || 0), 0),
        };
    }, [activeTab, merchantSelections, candidates]);

    // Handle select all for current merchant
    const handleSelectAll = useCallback((checked) => {
        if (!activeTab) return;

        if (checked) {
            const validTxIds = candidates.filter(c => !c.error).map(c => c.transactionReferenceId);
            handleTransactionSelection(validTxIds);
        } else {
            handleTransactionSelection([]);
        }
    }, [activeTab, candidates, handleTransactionSelection]);

    // Handle franchise settlement start
    const handleStartSettlement = useCallback(async () => {
        if (!batch || !Object.keys(merchantSelections).length) return;

        // Filter out empty selections
        const filteredSelections = {};
        Object.entries(merchantSelections).forEach(([merchantId, txIds]) => {
            if (txIds.length > 0) {
                filteredSelections[Number(merchantId)] = txIds;
            }
        });

        if (!Object.keys(filteredSelections).length) {
            toast.warning('Please select at least one transaction for settlement');
            return;
        }

        // NEW: Validate that ALL selected merchants have transactions
        const merchantsWithoutSelections = selectedMerchantIds.filter(
            merchantId => !filteredSelections[merchantId] || filteredSelections[merchantId].length === 0
        );

        if (merchantsWithoutSelections.length > 0) {
            const merchantNames = merchantsWithoutSelections
                .map(id => {
                    const merchant = availableMerchants.find(m => m.merchantId === id);
                    return merchant?.businessName || `Merchant ${id}`;
                })
                .join(', ');

            toast.error(
                `Please select transactions for all merchants. Missing selections for: ${merchantNames}`,
                { autoClose: 6000 }
            );
            return;
        }

        try {
            await processFranchiseBatch(selectedFranchiseId, batch.batchId, filteredSelections);

            // Clear all state
            setMerchantSelections({});
            setMerchantCandidatesCache({});
            setSelectedMerchantIds([]);
            setActiveTab('');
            setCycleKey('');        // ← ADD THIS
            setProductId('');       // ← ADD THIS
            setAvailableMerchants([]); // ← ADD THIS
            resetBatch();

            toast.success('Franchise settlement completed successfully!', {
                autoClose: 5000,
            });
        } catch (error) {
            // Error handled in useBatch
            // ✅ PARTIAL RESET on failure - keep filters, clear selections
            setMerchantSelections({});
            setMerchantCandidatesCache({});
            setActiveTab('');
            // Don't reset filters/merchants so user can retry
        }
    }, [batch, merchantSelections, selectedFranchiseId, processFranchiseBatch, resetBatch]);

    // Handle batch cancellation
    const handleCancelBatch = useCallback(() => {
        if (hasUnsavedChanges) {
            const confirmed = window.confirm(
                'You have unsaved selections across multiple merchants. Are you sure you want to cancel this batch?'
            );
            if (!confirmed) return;
        }

        setMerchantSelections({});
        setMerchantCandidatesCache({});
        setSelectedMerchantIds([]);
        setActiveTab('');
        setCycleKey('');           // ← ADD THIS
        setProductId('');          // ← ADD THIS
        setAvailableMerchants([]); // ← ADD THIS
        resetBatch();

        toast.info('Franchise batch cancelled');
    }, [hasUnsavedChanges, resetBatch]);

    // Reset state when filters change
    const handleFiltersChange = useCallback(() => {
        setMerchantSelections({});
        setMerchantCandidatesCache({});
        setSelectedMerchantIds([]);
        setActiveTab('');
        resetBatch();
    }, [resetBatch]);

    const isSelectAllChecked = currentSelectionTotals.selectedCount === currentSelectionTotals.totalCount && currentSelectionTotals.totalCount > 0;
    const isSelectAllIndeterminate = currentSelectionTotals.selectedCount > 0 && currentSelectionTotals.selectedCount < currentSelectionTotals.totalCount;
    const isProcessing = batchLoading;
    const selectedMerchants = availableMerchants.filter(m => selectedMerchantIds.includes(m.merchantId));

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-2">
                    <h1 className="text-xl font-bold text-gray-900 mb-2">Franchise Settlement</h1>
                    <p className="text-gray-600">
                        Process bulk settlement across multiple merchants in a franchise
                    </p>
                </div>

                {/* Franchise Selection & Filters Combined */}
                <div className="bg-white grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg shadow-sm mb-2">
                    {/* Franchise Selector */}
                    <div>
                        <h3 className="font-medium text-gray-900 mb-4">Select Franchise</h3>
                        <div className="max-w-md">
                            <select
                                value={selectedFranchiseId}
                                onChange={(e) => {
                                    setSelectedFranchiseId(e.target.value);
                                    handleFiltersChange();
                                }}
                                disabled={isLoadingFranchises}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                                <option value="">Select a franchise</option>
                                {franchises.map((franchise) => (
                                    <option key={franchise.id} value={franchise.id}>
                                        {franchise.franchiseName || `Franchise ${franchise.id}`}
                                    </option>
                                ))}
                            </select>
                            {isLoadingFranchises && (
                                <p className="mt-1 text-sm text-gray-500">Loading franchises...</p>
                            )}
                        </div>
                    </div>

                    {/* Settlement Filters */}
                    {selectedFranchiseId && (
                        <SettlementFilters
                            cycleKey={cycleKey}
                            setCycleKey={setCycleKey}
                            productId={productId}
                            setProductId={setProductId}
                            products={products}
                            isLoading={isLoadingProducts}
                            onFiltersChange={handleFiltersChange}
                        />
                    )}
                </div>

                {/* Merchant Selection */}
                {selectedFranchiseId && cycleKey && productId && (
                    <div className="bg-white p-4 rounded-lg shadow-sm mb-2">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-medium text-gray-900">
                                Select Merchants ({selectedMerchantIds.length} selected)
                            </h3>
                            <button
                                onClick={handleCreateFranchiseBatch}
                                disabled={!selectedMerchantIds.length || batchLoading || batch}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {batch ? 'Batch Created' : 'Create Batch'}
                            </button>
                        </div>

                        {isLoadingMerchants ? (
                            <div className="text-center py-8">
                                <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                                <p className="text-gray-600">Loading available merchants...</p>
                            </div>
                        ) : availableMerchants.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-60 overflow-y-auto">
                                {availableMerchants.map((merchant) => (
                                    <label
                                        key={merchant.merchantId}
                                        className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedMerchantIds.includes(merchant.merchantId)}
                                            onChange={(e) => handleMerchantSelection(merchant.merchantId, e.target.checked)}
                                            disabled={Boolean(batch)}
                                            className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                                        />
                                        <div className="min-w-0 flex-1">
                                            <div className="text-sm font-medium text-gray-900">
                                                {merchant.businessName || `Merchant ${merchant.merchantId}`}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {merchant.availableTransactions} transactions • {merchant.totalAmount}
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <p>No merchants available for the selected cycle and product</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Merchant Tabs */}
                {batch && selectedMerchants.length > 0 && (
                    <MerchantTabs
                        merchants={selectedMerchants}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        merchantSelections={merchantSelectionSummaries}
                        className="mb-2"
                    />
                )}

                {/* Candidates Table */}
                {batch && activeTab && (
                    <div className="mb-15">
                        <CandidatesTable
                            candidates={candidates}
                            selectedTxIds={merchantSelections[activeTab] || []}
                            onSelectionChange={handleTransactionSelection}
                            onSelectAll={handleSelectAll}
                            isSelectAllChecked={isSelectAllChecked}
                            isSelectAllIndeterminate={isSelectAllIndeterminate}
                            isLoading={candidatesLoading}
                        />
                    </div>
                )}

                {/* Settlement Footer */}
                {batch && (
                    <SettlementFooter
                        selectedCount={currentSelectionTotals.selectedCount}
                        totalCount={currentSelectionTotals.totalCount}
                        selectedAmount={currentSelectionTotals.selectedAmount}
                        selectedFees={currentSelectionTotals.selectedFees}
                        selectedNet={currentSelectionTotals.selectedNet}
                        onStartSettlement={handleStartSettlement}
                        onCancel={handleCancelBatch}
                        isProcessing={isProcessing}
                        disabled={globalTotals.transactions === 0}
                        showGlobalTotals={true}
                        globalTotals={globalTotals}
                    />
                )}
            </div>
        </div>
    );
};

export default FranchiseSettlementPage;