/**
 * Bill Avenue (BBPS) calls: biller info, bill fetch, bill payment, transaction status and complaints.
 * Everything here talks to the live backend; the service and provider lists come from the server too.
 */

import api from "../../constants/API/axiosInstance";

/**
 * Fetch biller info for a given billerId.
 * POST /billpay/biller-info  →  { statusCode, message, data: [ billerInfo ] }
 */
export const fetchBillerInfo = async (billerId) => {
  const res = await api.post("/billpay/config/biller-info", {
    billerId: [billerId],
  });
  // data is an array; return first element
  const list = res.data?.data || [];
  return list[0] || null;
};

/**
 * Map a BBPS dataType string to an HTML input type.
 */
export const mapDataTypeToInputType = (dataType = "") => {
  switch (dataType.toUpperCase()) {
    case "NUMERIC":
      return "number";
    case "ALPHANUMERIC":
    default:
      return "text";
  }
};

/**
 * Generate a simple unique request ID.
 */
const generateRequestId = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "";
  for (let i = 0; i < 35; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
};

/**
 * Fetch bill details for a biller.
 * POST /billpay/bill-fetch
 *
 * @param {string}   billerId       - selected biller/provider ID
 * @param {string}   customerMobile - customer mobile number
 * @param {object}   fieldValues    - { paramName: paramValue } from dynamic fields
 *
 * agentId and agentDeviceInfo are set by the backend; we pass placeholder
 * values here — the backend will override them.
 */
export const fetchBillDetails = async (billerId, customerMobile, fieldValues) => {
  const inputList = Object.entries(fieldValues).map(([paramName, paramValue]) => ({
    paramName,
    paramValue,
  }));

  const payload = {
    requestId: generateRequestId(),
    billerId,
    customerInfo: {
      customerMobile,
    },
    inputParams: {
      input: inputList,
    },
  };

  const res = await api.post("/billpay/config/bill-fetch", payload);

  // Backend wraps in CommonResponse — unwrap data
  const data = res.data?.data ?? res.data;

  // Bill Avenue returns responseCode "000" for success.
  // Any other code (e.g. "001") is a biller-level error inside a 200 OK
  // response — we must check it explicitly and throw so the UI can show it.
  if (data?.responseCode && data.responseCode !== "000") {
    const errors = data?.errorInfo?.error || [];
    const msg = errors.length
      ? errors.map((e) => `[${e.errorCode}] ${e.errorMessage}`).join(" | ")
      : `Biller error (code ${data.responseCode})`;
    const err = new Error(msg);
    err.billerErrorCode = data.responseCode;
    err.billerErrors    = errors;
    throw err;
  }

  // The payment must reuse this request id (Bill Avenue links a payment to its fetch by it).
  return { ...data, fetchRequestId: payload.requestId };
};

/**
 * Live bill payment.
 * POST /billpay/config/bill-payment  →  CommonResponse{ statusCode, message, data: <BillAvenue response> }
 *
 * amount/custConvFee are in RUPEES here — the backend converts to paise
 * before talking to Bill Avenue, matching every other rupee amount in this
 * app. billerResponse should be passed through untouched from the bill-fetch
 * result (it's already in paise, per the vendor's own contract).
 */
export const payBill = async ({
  merchantId,
  requestId,
  billerId,
  customerMobile,
  customerPan,
  inputParams,
  billerResponse,
  additionalInfo,
  billerAdhoc = "false",
  amount,
  custConvFee = 0,
  paymentMode,
  quickPay = false,
}) => {
  const payload = {
    merchantId,
    requestId,
    billerId,
    billerAdhoc,
    customerInfo: { customerMobile, ...(customerPan ? { customerPan } : {}) },
    inputParams: { input: inputParams || [] },
    billerResponse,
    // Echoed back exactly as the bill fetch returned it; Bill Avenue compares it ("additionalInfo value mismatch").
    ...(additionalInfo ? { additionalInfo } : {}),
    amountInfo: {
      amount,
      currency: "356",
      custConvFee: String(custConvFee ?? 0),
    },
    paymentMethod: {
      paymentMode,
      quickPay: quickPay ? "Y" : "N",
      splitPay: "N",
    },
  };

  const res = await api.post("/billpay/config/bill-payment", payload);
  return res.data; // { statusCode, message, data }
};

/**
 * What this payment would take from your wallet: bill amount + service charge.
 * POST /billpay/config/payment-quote  →  { data: { amount, custConvFee, charges, totalDebit } } (rupees)
 */
export const fetchPaymentQuote = async (amount, billerId) => {
  const res = await api.post("/billpay/config/payment-quote", { amount, custConvFee: "0", billerId });
  return res.data?.data;
};

/**
 * Status of one of your own bill payments, by the Bill Avenue transaction ID.
 * POST /billpay/config/transaction-status  →  CommonResponse{ statusCode, message, data: <BillAvenue response> }
 */
export const fetchTransactionStatusLive = async (txnRefId) => {
  const res = await api.post("/billpay/config/transaction-status", {
    trackingType: "TRANS_REF_ID",
    trackingValue: txnRefId,
  });
  return res.data; // { statusCode, message, data }
};

// The dispositions Bill Avenue accepts for a Transaction complaint (the server checks them too).
export const COMPLAINT_DISPOSITIONS = [
  "Transaction Successful, Amount Debited but services not received",
  "Transaction Successful, Amount Debited but Service Disconnected or Service Stopped",
  "Transaction Successful, Amount Debited but Late Payment Surcharge Charges add in next bill",
  "Erroneously paid in wrong account",
  "Duplicate Payment",
  "Erroneously paid the wrong amount",
  "Payment information not received from Biller or Delay in receiving payment information from the Biller",
  "Bill Paid but Amount not adjusted or still showing due amount",
];

/**
 * Your latest successful bill payments, to pick from when raising a complaint.
 * GET /billpay/complaints/my-transactions  →  { data: [ { txnRefId, billerName, category, amount (rupees), customerMobile, createdAt } ] }
 */
export const fetchMyBbpsTransactions = async () => {
  const res = await api.get("/billpay/complaints/my-transactions");
  return res.data?.data || [];
};

/**
 * Register a complaint about one of your own payments.
 * POST /billpay/complaints/register  →  { data: { complaintId, status, complaintAssigned, ... } }
 */
export const registerComplaint = async ({ txnRefId, disposition, description }) => {
  const res = await api.post("/billpay/complaints/register", { txnRefId, disposition, description });
  return res.data?.data;
};

/**
 * Latest status of one of your own complaints.
 * POST /billpay/complaints/track  →  { data: { complaintId, status, complaintAssigned, remarks, ... } }
 */
export const trackComplaint = async (complaintId) => {
  const res = await api.post("/billpay/complaints/track", { complaintId });
  return res.data?.data;
};

/**
 * Your complaints, newest first.
 * GET /billpay/complaints
 */
export const fetchMyComplaints = async () => {
  const res = await api.get("/billpay/complaints");
  return res.data?.data || [];
};
