import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import SettlementFilters from './SettlementFilters';
import CandidatesTable from './CandidatesTable';
import SettlementFooter from './SettlementFooter';
import { useBatch } from './useBatch';
import { useCandidates } from './useCandidates';
import { useBeforeUnload } from './useBeforeUnload';
import settlementApi from './settlementApi';

/**
 * Direct Settlement Page Component
 * Handles settlement flow for individual merchants
 */
const DirectSettlementPage = () => {
    // Form state
    const [selectedMerchantId, setSelectedMerchantId] = useState('');
    const [cycleKey, setCycleKey] = useState('');
    const [productId, setProductId] = useState('');
    const [selectedTxIds, setSelectedTxIds] = useState([]);

    // Data state
    const [merchants, setMerchants] = useState([]);
    const [products, setProducts] = useState([]);
    const [isLoadingMerchants, setIsLoadingMerchants] = useState(false);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);

    // Custom hooks
    const {
        batch,
        isLoading: batchLoading,
        createMerchantBatch,
        updateBatchCandidates,
        cancelBatch,
        resetBatch
    } = useBatch();

    const {
        candidates,
        isLoading: candidatesLoading,
        fetchMerchantCandidates,
        clearCandidates,
        getValidCandidates,
        getCandidateTotals
    } = useCandidates();

    // Check for unsaved changes
    const hasUnsavedChanges = Boolean(batch && selectedTxIds.length > 0);
    useBeforeUnload(hasUnsavedChanges, 'You have unsaved settlement selections. Are you sure you want to leave?');

    // Load merchants on component mount
    useEffect(() => {
        const loadMerchants = async () => {
            setIsLoadingMerchants(true);
            try {
                const merchantsData = await settlementApi.getDirectMerchants();
                setMerchants(merchantsData || []);
            } catch (error) {
                toast.error('Failed to load merchants');
                setMerchants([]);
            } finally {
                setIsLoadingMerchants(false);
            }
        };

        loadMerchants();
    }, []);

    // Load products when merchant is selected
    useEffect(() => {
        const loadProducts = async () => {
            if (!selectedMerchantId) {
                setProducts([]);
                return;
            }

            setIsLoadingProducts(true);
            try {
                const productsData = await settlementApi.getMerchantProducts(selectedMerchantId);
                setProducts(productsData || []);
            } catch (error) {
                toast.error('Failed to load products for merchant');
                setProducts([]);
            } finally {
                setIsLoadingProducts(false);
            }
        };

        loadProducts();
    }, [selectedMerchantId]);

    // Create batch when filters are complete
    const handleCreateBatch = useCallback(async () => {
        if (!selectedMerchantId || !cycleKey || !productId) return;

        try {
            const batchData = await createMerchantBatch(selectedMerchantId, cycleKey, productId);

            // Fetch candidates for the created batch
            await fetchMerchantCandidates(selectedMerchantId, batchData.batchId);
        } catch (error) {
            // Error already handled in useBatch hook
        }
    }, [selectedMerchantId, cycleKey, productId, createMerchantBatch, fetchMerchantCandidates]);

    // Handle filters change
    const handleFiltersChange = useCallback(() => {
        // Reset state when filters change
        setSelectedTxIds([]);
        resetBatch();
        clearCandidates();

      
    }, [selectedMerchantId, cycleKey, productId, resetBatch, clearCandidates, handleCreateBatch]);

    // Calculate selection totals
    const selectionTotals = useMemo(() => {
        const validCandidates = getValidCandidates();
        const selected = validCandidates.filter(candidate =>
            selectedTxIds.includes(candidate.transactionReferenceId)
        );

        return {
            selectedCount: selected.length,
            totalCount: validCandidates.length,
            selectedAmount: selected.reduce((sum, c) => sum + (c.amount || 0), 0),
            selectedFees: selected.reduce((sum, c) => sum + (c.fee || 0), 0),
            selectedNet: selected.reduce((sum, c) => sum + (c.netAmount || 0), 0),
        };
    }, [selectedTxIds, getValidCandidates]);

    // Handle select all
    const handleSelectAll = useCallback((checked) => {
        if (checked) {
            const validTxIds = getValidCandidates().map(c => c.transactionReferenceId);
            setSelectedTxIds(validTxIds);
        } else {
            setSelectedTxIds([]);
        }
    }, [getValidCandidates]);

    // Handle settlement start
    const handleStartSettlement = useCallback(async () => {
        if (!batch || !selectedTxIds.length) return;

        try {
            await updateBatchCandidates(selectedMerchantId, batch.batchId, selectedTxIds);

            // ✅ COMPLETE RESET - Success path
            setSelectedTxIds([]);
            setCycleKey('');              // ← ADD THIS
            setProductId('');             // ← ADD THIS
            setSelectedMerchantId('');    // ← ADD THIS (optional - depends on UX preference)
            setProducts([]);              // ← ADD THIS
            resetBatch();
            clearCandidates();

            toast.success('Settlement completed successfully!', {
                autoClose: 5000,
            });
        } catch (error) {
            // Error already handled in useBatch hook
            // ✅ PARTIAL RESET on failure - keep merchant/filters, clear selections
            setSelectedTxIds([]);
            clearCandidates();
            // Don't reset merchant/filters so user can retry
        }
    }, [batch, selectedTxIds, selectedMerchantId, updateBatchCandidates, resetBatch, clearCandidates]);

    // Handle batch cancellation
    const handleCancelBatch = useCallback(async () => {
        if (!batch) return;

        if (selectedTxIds.length > 0) {
            const confirmed = window.confirm(
                'You have unsaved selections. Are you sure you want to cancel this batch?'
            );
            if (!confirmed) return;
        }

        try {
            await cancelBatch(selectedMerchantId, batch.batchId);
            // ✅ COMPLETE RESET
            setSelectedTxIds([]);
            setCycleKey('');           // ← ADD THIS
            setProductId('');          // ← ADD THIS
            setProducts([]);           // ← ADD THIS
            clearCandidates();
        } catch (error) {
            // Error already handled in useBatch hook
        }
    }, [batch, selectedTxIds, selectedMerchantId, cancelBatch, clearCandidates]);

    const isSelectAllChecked = selectionTotals.selectedCount === selectionTotals.totalCount && selectionTotals.totalCount > 0;
    const isSelectAllIndeterminate = selectionTotals.selectedCount > 0 && selectionTotals.selectedCount < selectionTotals.totalCount;
    const isProcessing = batchLoading;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className=" mx-auto px-4 sm:px-6 lg:px-8 ">
                {/* Header */}
                <div className="mb-2">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Direct Settlement</h1>
                    <p className="text-gray-600">
                        Process settlement for individual merchant transactions
                    </p>
                </div>

                {/* Merchant Selection */}
                <div className="bg-white grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg shadow-sm mb-2">
                    <div>
                        <h3 className="font-medium text-gray-900 mb-4">Select Merchant</h3>
                        <div className="max-w-md">
                            <select
                                value={selectedMerchantId}
                                onChange={(e) => {
                                    setSelectedMerchantId(e.target.value);
                                    // Reset dependent state
                                    setProductId('');
                                    setCycleKey('');
                                    setSelectedTxIds([]);
                                    resetBatch();
                                    clearCandidates();
                                }}
                                disabled={isLoadingMerchants}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                                <option value="">Select a merchant</option>
                                {merchants.map((merchant) => (
                                    <option key={merchant.id} value={merchant.id}>
                                        {merchant.businessName || `Merchant ${merchant.id}`}
                                    </option>
                                ))}
                            </select>
                            {isLoadingMerchants && (
                                <p className="mt-1 text-sm text-gray-500">Loading merchants...</p>
                            )}
                        </div>
                    </div>
                     {/* Settlement Filters */}
                {selectedMerchantId && (
                    <div className="">
                        <SettlementFilters
                            cycleKey={cycleKey}
                            setCycleKey={setCycleKey}
                            productId={productId}
                            setProductId={setProductId}
                            products={products}
                            isLoading={isLoadingProducts}
                            onFiltersChange={handleFiltersChange}
                        />

                        {/* Create Batch button */}
                        {cycleKey && productId>0 && (
                            <button
                                onClick={handleCreateBatch}
                                disabled={batchLoading}
                                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 disabled:bg-gray-400"
                            >
                                {batchLoading ? 'Creating Batch...' : 'Create Batch'}
                            </button>
                        )}
                    </div>
                )}

                </div>

               

                {/* Candidates Table */}
                {batch && (
                    <div className="mb-15"> {/* Extra bottom margin for sticky footer */}
                        <CandidatesTable
                            candidates={candidates}
                            selectedTxIds={selectedTxIds}
                            onSelectionChange={setSelectedTxIds}
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
                        selectedCount={selectionTotals.selectedCount}
                        totalCount={selectionTotals.totalCount}
                        selectedAmount={selectionTotals.selectedAmount}
                        selectedFees={selectionTotals.selectedFees}
                        selectedNet={selectionTotals.selectedNet}
                        onStartSettlement={handleStartSettlement}
                        onCancel={handleCancelBatch}
                        isProcessing={isProcessing}
                        disabled={selectionTotals.selectedCount === 0}
                    />
                )}
            </div>
        </div>
    );
};

export default DirectSettlementPage;