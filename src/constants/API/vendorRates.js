// src/constants/API/vendorRates.js
import api from './axiosInstance';
import { toast } from 'react-toastify';

const endpoint = '/vendor-rates';

export const getAllVendorRates = async () => {
  try {
    const res = await api.get(endpoint);
    return res.data;
  } catch (err) {
    toast.error(err.response?.data?.message || "Failed to fetch vendor rates");
    throw err;
  }
};

export const getVendorRateById = async (id) => {
  try {
    const res = await api.get(`${endpoint}/${id}`);
    return res.data;
  } catch (err) {
    toast.error(err.response?.data?.message || "Failed to fetch vendor rate details");
    throw err;
  }
};

export const createVendorRate = async (vendorRateData) => {
  try {
    const res = await api.post(endpoint, vendorRateData);
    toast.success("Vendor rate created successfully!");
    return res.data;
  } catch (err) {
    toast.error(err.response?.data?.message || "Failed to create vendor rate");
    throw err;
  }
};

export const updateVendorRate = async (id, vendorRateData) => {
  try {
    const res = await api.put(`${endpoint}/${id}`, vendorRateData);
    toast.success("Vendor rate updated successfully!");
    return res.data;
  } catch (err) {
    toast.error(err.response?.data?.message || "Failed to update vendor rate");
    throw err;
  }
};

export const deleteVendorRate = async (id) => {
  try {
    await api.delete(`${endpoint}/${id}`);
    toast.success("Vendor rate deleted successfully!");
  } catch (err) {
    toast.error(err.response?.data?.message || "Failed to delete vendor rate");
    throw err;
  }
};
