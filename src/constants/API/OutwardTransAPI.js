import api from "./axiosInstance";

const ENDPOINT = "/outward-transactions";

export const getAllOutwardTransactions = async (page = 0, size = 10, sortBy = "id", sortDir = "desc") => {
  const res = await api.get(`${ENDPOINT}/ad`, {
    params: { page, size, sortBy, sortDir }
  });
  return res.data; // Returns { content: [], totalElements, totalPages, number, size, ... }
};



export const getOutwardTransactionById = async (id) => {
  const res = await api.get(`${ENDPOINT}/${id}`);
  return res.data;
};

export const createOutwardTransaction = async (data) => {
  const res = await api.post(ENDPOINT, data);
  return res.data;
};

export const updateOutwardTransaction = async (id, data) => {
  const res = await api.put(`${ENDPOINT}/${id}`, data);
  return res.data;
};

export const deleteOutwardTransaction = async (id) => {
  await api.delete(`${ENDPOINT}/${id}`);
};
