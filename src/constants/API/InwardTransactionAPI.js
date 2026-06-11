import api from "./axiosInstance";

const ENDPOINT = "/inward-transactions";

export const getAllInwardTransactions = async () => {
  const res = await api.get(ENDPOINT);
  return res.data;
};

export const getInwardTransactionById = async (id) => {
  const res = await api.get(`${ENDPOINT}/${id}`);
  return res.data;
};

export const createInwardTransaction = async (data) => {
  const res = await api.post(ENDPOINT, data);
  return res.data;
};

export const updateInwardTransaction = async (id, data) => {
  const res = await api.put(`${ENDPOINT}/${id}`, data);
  return res.data;
};

export const deleteInwardTransaction = async (id) => {
  await api.delete(`${ENDPOINT}/${id}`);
};