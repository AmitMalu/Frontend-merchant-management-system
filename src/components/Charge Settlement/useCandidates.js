import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import settlementApi from './settlementApi';

/**
 * Custom hook for managing settlement candidates
 * Handles fetching and state management for both direct and franchise flows
 */
export const useCandidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch candidates for direct merchant batch
  const fetchMerchantCandidates = useCallback(async (merchantId, batchId) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const candidatesData = await settlementApi.getBatchCandidates(merchantId, batchId);
      setCandidates(candidatesData || []);
      return candidatesData;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch candidates';
      setError(errorMessage);
      toast.error(errorMessage);
      setCandidates([]);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch candidates for franchise merchant
  const fetchFranchiseMerchantCandidates = useCallback(async (franchiseId, batchId, merchantId, cycleKey, productId) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const candidatesData = await settlementApi.getFranchiseMerchantCandidates(
        franchiseId, 
        batchId, 
        merchantId, 
        cycleKey, 
        productId
      );
      setCandidates(candidatesData || []);
      return candidatesData;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch merchant candidates';
      setError(errorMessage);
      toast.error(errorMessage);
      setCandidates([]);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Clear candidates
  const clearCandidates = useCallback(() => {
    setCandidates([]);
    setError(null);
  }, []);

  // Filter valid candidates (no errors)
  const getValidCandidates = useCallback(() => {
    return candidates.filter(candidate => !candidate.error);
  }, [candidates]);

  // Get candidate totals
  const getCandidateTotals = useCallback(() => {
    const validCandidates = getValidCandidates();
    
    return {
      totalCount: candidates.length,
      validCount: validCandidates.length,
      invalidCount: candidates.length - validCandidates.length,
      totalAmount: validCandidates.reduce((sum, c) => sum + (c.amount || 0), 0),
      totalFees: validCandidates.reduce((sum, c) => sum + (c.fee || 0), 0),
      totalNet: validCandidates.reduce((sum, c) => sum + (c.netAmount || 0), 0),
    };
  }, [candidates, getValidCandidates]);

  return {
    candidates,
    isLoading,
    error,
    fetchMerchantCandidates,
    fetchFranchiseMerchantCandidates,
    clearCandidates,
    getValidCandidates,
    getCandidateTotals,
  };
};