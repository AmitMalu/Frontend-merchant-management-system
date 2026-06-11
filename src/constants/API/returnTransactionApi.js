import api from './axiosInstance';

const returnTransactionAPI = {
  // Get all return transactions
  getAllReturnTransactions: async () => {
    try {
      const response = await api.get('/return-transactions');
      return response.data;
    } catch (error) {
      console.error('Error fetching return transactions:', error);
      throw error;
    }
  },

  // Get return transaction by ID
  getReturnTransactionById: async (id) => {
    try {
      const response = await api.get(`/return-transactions/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching return transaction with ID ${id}:`, error);
      throw error;
    }
  },

  // Create new return transaction
  createReturnTransaction: async (data) => {
    try {
      const response = await api.post('/return-transactions', data);
      return response.data;
    } catch (error) {
      console.error('Error creating return transaction:', error);
      throw error;
    }
  },

  // Update return transaction
  updateReturnTransaction: async (id, data) => {
    try {
      const response = await api.put(`/return-transactions/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating return transaction with ID ${id}:`, error);
      throw error;
    }
  },

  // Delete return transaction
  deleteReturnTransaction: async (id) => {
    try {
      await api.delete(`/return-transactions/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting return transaction with ID ${id}:`, error);
      throw error;
    }
  }
};

export default returnTransactionAPI;