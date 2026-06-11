// frontend/src/services/inwardAPI.js
import api from './axiosInstance'

// Inward Transaction APIs
export const inwardAPI = {
  // Get all inward transactions
  getAllInwardTransactions: async () => {
    try {
      const response = await api.get('/inward-transactions');
      return response.data;
    } catch (error) {
      console.error('Error fetching inward transactions:', error);
      throw error;
    }
  },

  // Get single inward transaction by ID
  getInwardTransactionById: async (id) => {
    try {
      const response = await api.get(`/inward-transactions/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching inward transaction:', error);
      throw error;
    }
  },

  // // Create new inward transaction
  // createInwardTransaction: async (inwardData) => {
  //   try {
  //     // Transform frontend data to backend format
  //     const transformedData = transformToBackendFormat(inwardData);
  //     //console.log(transformedData)
  //     const response = await api.post('/inward-transactions', transformedData);
  //     return response.data;
  //   } catch (error) {
  //     console.error(response?.data?.message);
  //     throw error;
  //   }
  // },

  // // Update inward transaction
  // updateInwardTransaction: async (id, inwardData) => {
  //   try {
  //     const transformedData = transformToBackendFormat(inwardData);
  //     const response = await api.put(`/inward-transactions/${id}`, transformedData);
  //     return response.data;
  //   } catch (error) {
  //     console.error('Error updating inward transaction:', error);
  //     throw error;
  //   }
  // },

// Create new inward transaction
createInwardTransaction: async (inwardData) => {
  try {
    const transformedData = transformToBackendFormat(inwardData);
    const response = await api.post('/inward-transactions', transformedData);
    return response.data;
  } catch (error) {
    // Extract backend error message
    const message = error.response?.data?.message || 'Failed to create inward transaction';
    console.error(message);
    throw new Error(message);
  }
},

// Update inward transaction
updateInwardTransaction: async (id, inwardData) => {
  try {
    const transformedData = transformToBackendFormat(inwardData);
    const response = await api.put(`/inward-transactions/${id}`, transformedData);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to update inward transaction';
    console.error(message);
    throw new Error(message);
  }
},

  // Delete inward transaction
  deleteInwardTransaction: async (id) => {
    try {
      const response = await api.delete(`/inward-transactions/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting inward transaction:', error);
      throw error;
    }
  }
};

// Transform frontend form data to backend expected format
const transformToBackendFormat = (frontendData) => {

  // Backend expected format based on your model
  const backendData = {
    ...frontendData,
    vendorId: parseInt(frontendData.vendorId),
    productId: parseInt(frontendData.productId),
    quantity: parseInt(frontendData.quantity),
    warrantyPeriod: frontendData.warrantyPeriod ? parseInt(frontendData.warrantyPeriod) : null,
  };

  return backendData;
};

// Transform backend data to frontend format for editing
export const transformToFrontendFormat = (backendData) => {
  // Create serial number grid from backend data
  const serialNumberGrid = [];
  
  if (backendData.serialNumbers && backendData.serialNumbers.length > 0) {
    backendData.serialNumbers.forEach((serial, index) => {
      serialNumberGrid.push({
        id: index + 1,
        MID: serial.mid || '',
        SID: serial.sid || '',
        TID: serial.tid || '',
        VpID: serial.vpaid || '',
        selectedFields: {
          MID: !!serial.mid,
          SID: !!serial.sid,
          TID: !!serial.tid,
          VpID: !!serial.vpaid
        }
      });
    });
  }

  return {
    id: backendData.id,
    invoiceNumber: backendData.invoiceNumber,
    vendorId: backendData.vendor?.id?.toString() || '',
    vendorName: backendData.vendor?.name || '',
    receivedDate: backendData.receivedDate,
    receivedBy: backendData.receivedBy,
    productId: backendData.product?.id?.toString() || '',
    productName: backendData.product?.name || '',
    productType: backendData.product?.type || '',
    quantity: backendData.quantity?.toString() || '',
    batchNumber: backendData.batchNumber || '',
    warrantyPeriod: backendData.warrantyPeriod?.toString() || '',
    condition: backendData.productCondition,
    remarks: backendData.remark || '',
    serialNumberGrid: serialNumberGrid,
    status: 'Received' // Default status
  };
};

export default inwardAPI;