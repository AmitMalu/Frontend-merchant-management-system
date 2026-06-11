import api from "./axiosInstance";

const schemeApi = {
  // Get all pricing schemes with pagination and sorting
  getAllSchemes: (params = {}) => {
    const { page = 0, size = 10, sortBy = 'schemeCode', sortDir = 'asc' } = params;
    return api.get('/pricing-schemes', {
      params: { page, size, sortBy, sortDir }
    });
  },

  // Search pricing schemes
  searchSchemes: (query, params = {}) => {
    const { page = 0, size = 10, sortBy = 'schemeCode', sortDir = 'asc' } = params;
    return api.get('/pricing-schemes/search', {
      params: { q: query, page, size, sortBy, sortDir }
    });
  },

  // Get pricing scheme by ID
  getSchemeById: (id) => {
    return api.get(`/pricing-schemes/${id}`);
  },

  // Get pricing scheme by code
  getSchemeByCode: (schemeCode) => {
    return api.get(`/pricing-schemes/code/${schemeCode}`);
  },

  // Create new pricing scheme
  createScheme: (schemeData) => {
    return api.post('/pricing-schemes', schemeData);
  },

  // Update pricing scheme
  updateScheme: (id, schemeData) => {
    return api.put(`/pricing-schemes/${id}`, schemeData);
  },

  // Delete pricing scheme
  deleteScheme: (id) => {
    return api.delete(`/pricing-schemes/${id}`);
  },

  // Get schemes by customer type
  getSchemesByCustomerType: (customerType) => {
    return api.get(`/pricing-schemes/customer-type/${customerType}`);
  },

  // Check if scheme code exists
  checkSchemeCodeExists: (schemeCode) => {
    return api.get(`/pricing-schemes/exists/${schemeCode}`);
  },

  // Get dashboard statistics
  getSchemeStats: () => {
    return api.get('/pricing-schemes/stats');
  }
};

export default schemeApi;