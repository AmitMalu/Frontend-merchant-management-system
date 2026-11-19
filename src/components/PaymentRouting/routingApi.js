import api from "../../constants/API/axiosInstance";

// Every /payment-routing answer is { success, message, data }.
const data = (res) => res.data?.data;

export const errorMessage = (err, fallback) => err?.response?.data?.message || fallback;

export const inputClass =
  "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white";

export const labelClass = "block text-xs font-medium text-gray-600 mb-1";

// ---- lists for the dropdowns (existing endpoints) ----
export const getProducts = async () => (await api.get("/payment-products/id-name")).data || [];
export const getAllVendors = async () => (await api.get("/payment-vendors/id-name")).data || [];
export const getMerchants = async () => (await api.get("/merchants")).data || [];
export const getFranchises = async () => (await api.get("/franchise")).data || [];

// ---- which vendors serve which product ----
export const getProductVendors = async (productId) =>
  data(await api.get("/payment-routing/product-vendors", { params: productId ? { productId } : {} })) || [];
export const saveProductVendor = (body) => api.post("/payment-routing/product-vendors", body);
export const removeProductVendor = (id) => api.delete(`/payment-routing/product-vendors/${id}`);

// ---- routings ----
export const getRoutings = async (productId) =>
  data(await api.get("/payment-routing", { params: productId ? { productId } : {} })) || [];
export const createRouting = (body) => api.post("/payment-routing", body);
export const updateRouting = (id, body) => api.put(`/payment-routing/${id}`, body);
export const deleteRouting = (id) => api.delete(`/payment-routing/${id}`);
export const setRoutingStatus = (id, value) => api.patch(`/payment-routing/${id}/status`, null, { params: { value } });

// ---- who is assigned ----
export const getAssignments = async (id) => data(await api.get(`/payment-routing/${id}/assignments`)) || [];
export const assignAccounts = (id, targets) => api.post(`/payment-routing/${id}/assignments`, { targets });
export const unassignAccounts = (id, targets) => api.post(`/payment-routing/${id}/assignments/remove`, { targets });
export const getUnassigned = async (productId, type) =>
  data(await api.get("/payment-routing/unassigned", { params: { productId, type } })) || [];

// ---- explain, set up, history ----
export const simulate = async (params) => data(await api.get("/payment-routing/simulate", { params }));
// `body` = { products: [{ productId, vendors: [{ vendorId, categories }] }] }: the admin's own choices.
export const seedDefaults = async (dryRun, body) =>
  data(await api.post("/payment-routing/seed-defaults", body, { params: { dryRun } }));
// ---- the payout engine (old flow / pilot / new flow) ----
export const getPayoutEngine = async () => data(await api.get("/payment-routing/payout-engine"));
export const savePayoutEngine = async (mode, pilotAccounts, useRouting) =>
  data(await api.post("/payment-routing/payout-engine", { mode, pilotAccounts, useRouting }));
export const getMenuRules = async () => data(await api.get("/payment-routing/menu-rules"));
export const saveMenuRules = async (mode, accounts) =>
  data(await api.post("/payment-routing/menu-rules", { mode, accounts }));
export const getCategories = async (productId) =>
  data(await api.get("/payment-routing/categories", { params: { productId } }));
export const getPayoutAttempts = async (page, size) =>
  data(await api.get("/payment-routing/payout-engine/attempts", { params: { page, size } }));

// ---- the trial run ----
export const getTrialStatus = async () => data(await api.get("/payment-routing/trial/status"));
export const setTrialEnabled = async (value) =>
  data(await api.post("/payment-routing/trial/enabled", null, { params: { value } }));
export const getTrialSummary = async () => data(await api.get("/payment-routing/trial/summary")) || [];
export const getTrialRows = async (onlyDifferent, page, size) =>
  data(await api.get("/payment-routing/trial/rows", { params: { onlyDifferent, page, size } }));
export const clearTrial = async () => data(await api.delete("/payment-routing/trial"));
export const getAudit = async (routingId, page, size) =>
  data(await api.get("/payment-routing/audit", { params: { ...(routingId ? { routingId } : {}), page, size } }));
