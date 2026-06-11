import api from './axiosInstance';
import { toast } from 'react-toastify';

const endpoint = '/products';

export const getProducts = async (page = 0, size = 10, sortBy = 'productName', sortDir = 'asc', search = '') => {
  try {
    let url = `${endpoint}?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`;
    if (search.trim()) {
      url = `${endpoint}/search?q=${encodeURIComponent(search)}&page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`;
    }

    const res = await api.get(url);
    return res.data;
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to load products from server');
    throw err;
  }
};

export const getProductById = async (id) => {
  try {
    const res = await api.get(`${endpoint}/${id}`);
    return res.data;
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to fetch product details');
    throw err;
  }
};

export const createProduct = async (productData) => {
  try {
    const res = await api.post(endpoint, productData);
    toast.success('Product created successfully!');
    return res.data;
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to create product');
    throw err;
  }
};

export const updateProduct = async (id, productData) => {
  try {
    const res = await api.patch(`${endpoint}/${id}`, productData);
    toast.success('Product updated successfully!');
    return res.data;
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to update product');
    throw err;
  }
};

export const deleteProduct = async (id) => {
  try {
    await api.delete(`${endpoint}/${id}`);
    toast.success('Product deleted successfully!');
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to delete product');
    throw err;
  }
};
