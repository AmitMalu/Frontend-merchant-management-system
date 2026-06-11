import api from './axiosInstance';
const vendorApi = {
  // Get all vendors
  async getAllVendors() {
    try {
      const response = await api.get('/vendors');
      return response.data;
    } catch (error) {
      console.warn('Backend unavailable, using dummy data:', error);
      // Fallback to dummy data if backend is unavailable
      throw new Error('BACKEND_UNAVAILABLE');
    }
  },

  // Create new vendor
  async createVendor(vendorData) {
    try {
      const response = await api.post('/vendors', vendorData);
      return response.data;
    } catch (error) {
      console.error('Failed to create vendor:', error);
      throw new Error('BACKEND_UNAVAILABLE');
    }
  },

  // Update existing vendor
  async updateVendor(id, vendorData) {
    try {
      const response = await api.put(`/vendors/${id}`, vendorData);
      return response.data;
    } catch (error) {
      console.error('Failed to update vendor:', error);
      throw new Error('BACKEND_UNAVAILABLE');
    }
  },

  // Delete vendor
  async deleteVendor(id) {
    try {
      await api.delete(`/vendors/${id}`);
      return true;
    } catch (error) {
      console.error('Failed to delete vendor:', error);
      throw new Error('BACKEND_UNAVAILABLE');
    }
  },

  // Get vendor by ID
  async getVendorById(id) {
    try {
      const response = await api.get(`/vendors/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch vendor:', error);
      throw new Error('BACKEND_UNAVAILABLE');
    }
  }
};

export default vendorApi;