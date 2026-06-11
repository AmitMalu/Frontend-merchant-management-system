// frontend/src/constants/API/productReportApi.js

import api from './axiosInstance';
import { toast } from 'react-toastify';

const productReportApi = {
  // ... existing methods ...

  // Get all scheme assignments with complete product and customer details
  getAllSchemeAssignmentsForReport: async () => {
    try {
      const response = await api.get('/outward-schemes/report/all');
      return response.data;
    } catch (error) {
      toast.error('Failed to fetch scheme assignment report data');
      throw error;
    }
  },

  // Get filtered scheme assignments for report
  getFilteredSchemeAssignmentsForReport: async (params = {}) => {
    try {
      const { customerType, productId, schemeId, categoryId, activeOnly } = params;
      const queryParams = new URLSearchParams();
      
      if (customerType) queryParams.append('customerType', customerType);
      if (productId) queryParams.append('productId', productId);
      if (schemeId) queryParams.append('schemeId', schemeId);
      if (categoryId) queryParams.append('categoryId', categoryId);
      if (activeOnly !== undefined) queryParams.append('activeOnly', activeOnly);

      const response = await api.get(`/outward-schemes/report/filtered?${queryParams}`);
      return response.data;
    } catch (error) {
      toast.error('Failed to fetch filtered scheme assignment data');
      throw error;
    }
  },

  // Get scheme assignments by customer type
  getSchemeAssignmentsByCustomerType: async (customerType) => {
    try {
      const response = await api.get(`/outward-schemes/report/customer-type/${customerType}`);
      return response.data;
    } catch (error) {
      toast.error('Failed to fetch scheme assignments by customer type');
      throw error;
    }
  },

  // Get scheme assignments by product
  getSchemeAssignmentsByProduct: async (productId) => {
    try {
      const response = await api.get(`/outward-schemes/report/product/${productId}`);
      return response.data;
    } catch (error) {
      toast.error('Failed to fetch scheme assignments by product');
      throw error;
    }
  },

  // Get active scheme assignments
  getActiveSchemeAssignments: async () => {
    try {
      const response = await api.get('/outward-schemes/report/active');
      return response.data;
    } catch (error) {
      toast.error('Failed to fetch active scheme assignments');
      throw error;
    }
  },
};

export default productReportApi;