import api from "../../constants/API/axiosInstance";
/**
 * Settlement API service wrapper
 * Provides methods for both direct merchant and franchise settlement operations
 */

// Current user placeholder - replace with your actual user context
const getCurrentUser = () => {
  // Replace this with your actual user context/store
  return window.currentUser || { username: 'system' };
};

export const settlementApi = {
  // Direct Merchant APIs
  async getDirectMerchants() {
    const response = await api.get('/merchants/direct-merchant');
    return response.data;
  },

  async getMerchantProducts(merchantId) {
    const response = await api.get(`/merchants/products/${merchantId}`);
    return response.data;
  },

  async createOrGetBatch(merchantId, cycleKey, productId) {
    const createdBy = getCurrentUser()?.username || 'system';
    const response = await api.post(
      `/merchants/${merchantId}/settlement/batches`,
      {},
      {
        params: { cycleKey, createdBy, productId }
      }
    );
    return response.data;
  },

  async getBatchCandidates(merchantId, batchId) {
    const response = await api.get(
      `/merchants/${merchantId}/settlement/batches/${batchId}/candidates`
    );
    return response.data;
  },

  async updateBatchCandidates(merchantId, batchId, vendorTxIds) {
    const response = await api.post(
      `/merchants/${merchantId}/settlement/batches/${batchId}/candidates`,
      { vendorTxIds }
    );
    return response.data;
  },

  async cancelBatch(merchantId, batchId) {
    const response = await api.delete(
      `/merchants/${merchantId}/settlement/batches/${batchId}`
    );
    return response.data;
  },

  // Franchise APIs
  async getFranchises() {
    const response = await api.get('/franchise');
    return response.data;
  },

    async getFranchiseProducts(franchiseId) {
        const response = await api.get(`/franchise/products/${franchiseId}`)
        return response.data;    
  },

  async getFranchiseAvailableMerchants(franchiseId, cycleKey, productId) {
    const response = await api.get(
      `/franchises/${franchiseId}/bulk-settlement/merchants/available`,
      {
        params: { cycleKey, productId }
      }
    );
    return response.data;
  },

  async createFranchiseBatch(franchiseId, cycleKey, productId, merchantIds) {
    const createdBy = getCurrentUser()?.username || 'system';
    const response = await api.post(
      `/franchises/${franchiseId}/bulk-settlement/batches/selective`,
      merchantIds,
      {
        params: { cycleKey, createdBy, productId }
      }
    );
    return response.data;
  },

  async getFranchiseMerchantCandidates(franchiseId, batchId, merchantId, cycleKey, productId) {
    const response = await api.get(
      `/franchises/${franchiseId}/bulk-settlement/batches/${batchId}/merchants/${merchantId}/candidates`,
      {
        params: { cycleKey, productId }
      }
    );
    return response.data;
  },

  async processFranchiseBatch(franchiseId, batchId, merchantTransactionsMap) {
    const response = await api.post(
      `/franchises/${franchiseId}/bulk-settlement/batches/${batchId}/process-with-transactions`,
      merchantTransactionsMap
    );
    return response.data;
  },

  async getFranchiseBatchDetails(franchiseId, batchId) {
    const response = await api.get(
      `/franchises/${franchiseId}/bulk-settlement/batches/${batchId}`
    );
    return response.data;
  }
};

export default settlementApi;