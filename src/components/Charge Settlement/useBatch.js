import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import settlementApi from './settlementApi';

/**
 * Custom hook for managing settlement batch operations
 * Handles both direct merchant and franchise batch management
 */
export const useBatch = () => {
  const [batch, setBatch] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Create or get active batch for direct merchant
  const createMerchantBatch = useCallback(async (merchantId, cycleKey, productId) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const batchData = await settlementApi.createOrGetBatch(merchantId, cycleKey, productId);
      setBatch(batchData);
      toast.success('Batch created successfully');
      return batchData;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create batch';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create franchise batch
  const createFranchiseBatch = useCallback(async (franchiseId, cycleKey, productId, merchantIds) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const batchData = await settlementApi.createFranchiseBatch(franchiseId, cycleKey, productId, merchantIds);
      setBatch(batchData);
      toast.success(`Franchise batch created with ${merchantIds.length} merchants`);
      return batchData;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create franchise batch';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update batch candidates for merchant
  const updateBatchCandidates = useCallback(async (merchantId, batchId, vendorTxIds) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await settlementApi.updateBatchCandidates(merchantId, batchId, vendorTxIds);
      toast.success(`Updated batch with ${vendorTxIds.length} transactions`);
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to update batch';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Process franchise batch with transactions
  const processFranchiseBatch = useCallback(async (franchiseId, batchId, merchantTransactionsMap) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await settlementApi.processFranchiseBatch(franchiseId, batchId, merchantTransactionsMap);
      
      const totalTransactions = Object.values(merchantTransactionsMap)
        .reduce((sum, txs) => sum + txs.length, 0);
      
      toast.success(`Settlement started for ${Object.keys(merchantTransactionsMap).length} merchants, ${totalTransactions} transactions`);
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to process batch';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cancel batch
  const cancelBatch = useCallback(async (merchantId, batchId) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await settlementApi.cancelBatch(merchantId, batchId);
      setBatch(null);
      toast.success('Batch cancelled successfully');
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to cancel batch';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Reset batch state
  const resetBatch = useCallback(() => {
    setBatch(null);
    setError(null);
  }, []);

  return {
    batch,
    isLoading,
    error,
    createMerchantBatch,
    createFranchiseBatch,
    updateBatchCandidates,
    processFranchiseBatch,
    cancelBatch,
    resetBatch,
  };
};