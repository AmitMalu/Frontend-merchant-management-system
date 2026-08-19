/**
 * Static BBPS service catalogue.
 * When live credentials are available, this can be replaced with
 * a dynamic API call to fetch the operator list per category.
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

  return data;
};

/**
 * Hardcoded UAT sample payloads, sourced from the "UAT TEST DATA_AGT" sheet
 * (Fetch&Pay sheet + quick pay sheet) provided by Bharat Connect, keyed by
 * biller category. Lets testers preview each category's Fetch and Pay /
 * Quick Pay flow — including the payment response used to build the receipt —
 * against the real BBPS UAT sandbox without needing real provider/customer
 * data. Remove once live credentials are confirmed and category/provider
 * lookups are fully dynamic.
 */
export const UAT_SAMPLES = {
  "broadband postpaid": {
    fetchAndPay: {
      billerId: "DUMMY0000DIG08",
      mobile: "9898990084",
      inputParams: [{ paramName: "CustomerId", paramValue: "h696077" }],
      payResponse: {
        txnRefId: "CC015323BAAG00032929",
        responseReason: "Successful",
        respAmount: "100000",
        custConvFee: "0",
        respCustomerName: "Srinivas",
        respBillDate: "2025-11-19",
        respBillNumber: "RCRQ/2020-07-17/6418619",
        respBillPeriod: "MONTHLY",
        respDueDate: "2025-12-04",
        approvalRefNumber: "AB123456",
      },
    },
  },
  "electricity": {
    fetchAndPay: {
      billerId: "DELECTRICITY01",
      mobile: "9898990084",
      inputParams: [{ paramName: "CustomerId", paramValue: "h696077" }],
      payResponse: {
        txnRefId: "CC015334BAAG00034083",
        responseReason: "Successful",
        respAmount: "100000",
        custConvFee: "0",
        respCustomerName: "Shrinivas",
        respBillDate: "2025-11-30",
        respBillNumber: "10001",
        respBillPeriod: "Monthly",
        respDueDate: "2025-12-15",
        approvalRefNumber: "AB123456",
      },
    },
    // From the "quick pay" sheet — OCNS00000TMN02.
    quickPay: {
      billerId: "OCNS00000TMN02",
      mobile: "9898990084",
      inputParams: [
        { paramName: "a", paramValue: "10" },
        { paramName: "a b", paramValue: "20" },
        { paramName: "a b c", paramValue: "30" },
        { paramName: "a b c d", paramValue: "40" },
        { paramName: "a b c d e", paramValue: "50" },
      ],
      payResponse: {
        txnRefId: "CC016131BAAG00058267",
        responseReason: "Successful",
        respAmount: "100000",
        custConvFee: "0",
        respCustomerName: "Ashish",
        respBillDate: "2016-07-01",
        respBillNumber: "12303037",
        respBillPeriod: "Jul",
        respDueDate: "2016-07-30",
        approvalRefNumber: "12345037",
      },
    },
  },
  "fastag": {
    fetchAndPay: {
      billerId: "DUMMYFASTAG001",
      mobile: "9898990084",
      inputParams: [{ paramName: "Vehicle Number", paramValue: "MH15AT6555" }],
      payResponse: {
        txnRefId: "CC015334BAAG00034085",
        responseReason: "Successful",
        respAmount: "100000",
        custConvFee: "0",
        respCustomerName: "VENAKATESH",
        approvalRefNumber: "AB123456",
      },
    },
  },
  "insurance": {
    fetchAndPay: {
      billerId: "DUMGI0000NAT01",
      mobile: "9892506507",
      inputParams: [{ paramName: "Policy Number", paramValue: "52157852" }],
      payResponse: {
        txnRefId: "CC015334BAAG00034089",
        responseReason: "Successful",
        respAmount: "4956400",
        custConvFee: "0",
        respCustomerName: "VAIRAMANI D",
        respBillDate: "2025-11-30",
        respDueDate: "2025-12-15",
        approvalRefNumber: "AB123456",
      },
    },
  },
  "lpg gas": {
    fetchAndPay: {
      billerId: "BAPL00000GAS01",
      mobile: "9892506507",
      inputParams: [
        { paramName: "Consumer Number", paramValue: "90881000" },
        { paramName: "Distributor ID", paramValue: "13645300" },
      ],
      payResponse: {
        txnRefId: "CC015334BAAG00034091",
        responseReason: "Successful",
        respAmount: "92300",
        custConvFee: "0",
        respCustomerName: "Ramesh Agrawal",
        respBillNumber: "1123314338567",
        approvalRefNumber: "1230466000115913",
      },
    },
  },
  "mobile postpaid": {
    fetchAndPay: {
      billerId: "DUMMY0000DIG06",
      mobile: "9898990084",
      inputParams: [{ paramName: "Mobile Number", paramValue: "9876543211" }],
      payResponse: {
        txnRefId: "CC015335BAAG00035501",
        responseReason: "Successful",
        respAmount: "54590",
        custConvFee: "0",
        respCustomerName: "Ritesh Shukla",
        respBillDate: "2025-12-01",
        respBillNumber: "RCRQ/2020-07-17/6418619",
        respBillPeriod: "MONTHLY",
        respDueDate: "2025-12-16",
        approvalRefNumber: "AB123456",
      },
    },
  },
  "mobile": {
    // OTME00005XXZ43 / OTNS00005XXZ43 — the exact Fetch and Pay / Quick Pay
    // scenario called out in the Bharat Connect brand guidelines. Mobile
    // numbers per the guidelines doc (9898990084 / 9898990083).
    fetchAndPay: {
      billerId: "OTME00005XXZ43",
      mobile: "9898990084",
      inputParams: [
        { paramName: "a", paramValue: "10" },
        { paramName: "a b", paramValue: "20" },
        { paramName: "a b c", paramValue: "30" },
        { paramName: "a b c d", paramValue: "40" },
        { paramName: "a b c d e", paramValue: "50" },
      ],
      payResponse: {
        txnRefId: "CC015335BAAG00035482",
        responseReason: "Successful",
        respAmount: "100000",
        custConvFee: "0",
        respCustomerName: "Ashish",
        respBillDate: "2016-07-01",
        respBillNumber: "12303037",
        respBillPeriod: "Jul",
        respDueDate: "2016-07-30",
        approvalRefNumber: "12345037",
      },
    },
    quickPay: {
      billerId: "OTNS00005XXZ43",
      mobile: "9898990083",
      inputParams: [
        { paramName: "a", paramValue: "10" },
        { paramName: "a b", paramValue: "20" },
        { paramName: "a b c", paramValue: "30" },
        { paramName: "a b c d", paramValue: "40" },
        { paramName: "a b c d e", paramValue: "50" },
      ],
      // No payment-response sample exists for OTNS00005XXZ43 in the sheet —
      // Quick Pay for this category falls back to the "Coming Soon" screen.
    },
  },
  "loan repayment": {
    fetchAndPay: {
      billerId: "DLOANREP000001",
      mobile: "9892506507",
      inputParams: [{ paramName: "AccNum", paramValue: "30088743370013" }],
      payResponse: {
        txnRefId: "CC015335BAAG00035468",
        responseReason: "Successful",
        respAmount: "15770000",
        custConvFee: "0",
        respCustomerName: "Srinivas",
        respBillDate: "2025-12-01",
        respDueDate: "2025-12-16",
        approvalRefNumber: "AB123456",
      },
    },
  },
};

/**
 * Look up the UAT sample set for a biller category label. Matches loosely —
 * any category containing "mobile" (Mobile Postpaid, Mobile Prepaid, ...)
 * resolves to the shared OTME/OTNS "mobile" sample.
 */
export const getUatSample = (serviceName = "") => {
  const key = serviceName.trim().toLowerCase();
  if (UAT_SAMPLES[key]) return UAT_SAMPLES[key];
  if (key.includes("mobile")) return UAT_SAMPLES["mobile"];
  return null;
};

// Same dummy agent used throughout the UAT test-data sheet.
const UAT_AGENT_ID = "CC01CC01513515340681";

const titleCase = (key) =>
  key.replace(/\b\w/g, (c) => c.toUpperCase());

/**
 * Flatten every UAT_SAMPLES entry (both Fetch and Pay + Quick Pay, wherever a
 * payResponse exists) into records shaped like the real Transaction Status
 * API response (<txnList> per the Bharat Bill Payment System spec: agentId,
 * amount, billerId, txnDate, txnReferenceId, txnStatus, mobile,
 * approvalRefNumber, ...). Lets the Transaction Status screen look up the
 * exact same UAT transactions the Bill Pay flow generates receipts for.
 */
export const getAllUatTransactions = () => {
  const records = [];
  Object.entries(UAT_SAMPLES).forEach(([categoryKey, sample]) => {
    ["fetchAndPay", "quickPay"].forEach((mode) => {
      const entry = sample[mode];
      const payResponse = entry?.payResponse;
      if (!entry || !payResponse) return;
      records.push({
        agentId: UAT_AGENT_ID,
        amount: payResponse.respAmount,
        billerId: entry.billerId,
        billerName: titleCase(categoryKey),
        txnDate: payResponse.respBillDate ? `${payResponse.respBillDate}T12:00:00+05:30` : null,
        txnReferenceId: payResponse.txnRefId,
        txnStatus: /success/i.test(payResponse.responseReason || "") ? "SUCCESS" : (payResponse.responseReason || "UNKNOWN").toUpperCase(),
        mobile: entry.mobile,
        approvalRefNumber: payResponse.approvalRefNumber,
        custConvFee: payResponse.custConvFee,
        respBillNumber: payResponse.respBillNumber,
        respBillPeriod: payResponse.respBillPeriod,
        respCustomerName: payResponse.respCustomerName,
        respDueDate: payResponse.respDueDate,
      });
    });
  });
  return records;
};

export const findUatTransactionByRefId = (refId = "") =>
  getAllUatTransactions().find(
    (t) => t.txnReferenceId?.toLowerCase() === refId.trim().toLowerCase()
  ) || null;

export const findUatTransactionsByMobile = (mobile = "") =>
  getAllUatTransactions().filter((t) => t.mobile === mobile.trim());

/**
 * The 8 official BBPS complaint dispositions, verbatim from the Bharat
 * Connect frontend demo spec.
 */
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

const randomAlphaNumeric = (length) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let out = "";
  for (let i = 0; i < length; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
  return out;
};

/**
 * UAT ONLY — simulates the Complaint Registration API response shape
 * (complaintAssigned / complaintId), since /billpay/extComplaints/register
 * isn't wired up on the backend yet. Remove once live credentials + a real
 * backend endpoint are in place.
 */
export const registerUatComplaint = () => ({
  complaintAssigned: "OU12",
  complaintId: `CC01${randomAlphaNumeric(11)}`,
  responseCode: "000",
  responseReason: "SUCCESS",
});

/**
 * UAT ONLY — simulates the Complaint Tracking API response shape, keyed off
 * complaintId. Remove once live credentials + a real backend endpoint are
 * in place.
 */
export const trackUatComplaint = (complaintId = "") => ({
  complaintId: complaintId.trim(),
  complaintAssigned: "OU12",
  complaintStatus: "ASSIGNED",
  complaintRemarks: "NA",
  responseCode: "000",
  responseReason: "SUCCESS",
});

export const BBPS_SERVICES = [
  // ── Banking ──────────────────────────────────────────────────────────────
  {
    id: "loan_repayment",
    label: "Loan Repayment",
    category: "Banking",
    fields: [
      { name: "provider",    label: "Select Provider",  type: "select",  required: true  },
      { name: "loan_number", label: "Loan Account No.", type: "text",    required: true,  placeholder: "Enter loan account number" },
      { name: "mobile",      label: "Mobile Number",    type: "tel",     required: true,  placeholder: "10-digit mobile" },
    ],
  },
  {
    id: "broadband_postpaid",
    label: "Broadband Postpaid",
    category: "Internet / TV",
    fields: [
      { name: "provider",    label: "Select Provider",   type: "select", required: true },
      { name: "account_id",  label: "Account / User ID", type: "text",   required: true, placeholder: "Enter account ID" },
      { name: "mobile",      label: "Mobile Number",     type: "tel",    required: true, placeholder: "10-digit mobile" },
    ],
  },
  {
    id: "housing_society",
    label: "Housing Society",
    category: "Home",
    fields: [
      { name: "provider",     label: "Select Provider",    type: "select", required: true },
      { name: "consumer_no",  label: "Consumer Number",    type: "text",   required: true, placeholder: "Enter consumer number" },
      { name: "mobile",       label: "Mobile Number",      type: "tel",    required: true, placeholder: "10-digit mobile" },
    ],
  },
  {
    id: "municipal_taxes",
    label: "Municipal Taxes",
    category: "Home",
    fields: [
      { name: "provider",       label: "Select Provider",      type: "select", required: true },
      { name: "property_id",    label: "Property / Ward ID",   type: "text",   required: true, placeholder: "Enter property ID" },
      { name: "mobile",         label: "Mobile Number",        type: "tel",    required: true, placeholder: "10-digit mobile" },
    ],
  },
  {
    id: "clubs_and_associations",
    label: "Clubs and Associations",
    category: "Others",
    fields: [
      { name: "provider",     label: "Select Provider",  type: "select", required: true },
      { name: "member_id",    label: "Member ID",        type: "text",   required: true, placeholder: "Enter member ID" },
      { name: "mobile",       label: "Mobile Number",    type: "tel",    required: true, placeholder: "10-digit mobile" },
    ],
  },
  {
    id: "donation",
    label: "Donation",
    category: "Others",
    fields: [
      { name: "provider",    label: "Select Provider",  type: "select", required: true },
      { name: "donor_id",    label: "Donor ID",         type: "text",   required: false, placeholder: "Enter donor ID (optional)" },
      { name: "mobile",      label: "Mobile Number",    type: "tel",    required: true,  placeholder: "10-digit mobile" },
    ],
  },
  {
    id: "insurance",
    label: "Insurance",
    category: "Banking",
    fields: [
      { name: "provider",     label: "Select Provider",  type: "select", required: true },
      { name: "policy_no",    label: "Policy Number",    type: "text",   required: true, placeholder: "Enter policy number" },
      { name: "mobile",       label: "Mobile Number",    type: "tel",    required: true, placeholder: "10-digit mobile" },
    ],
  },
  {
    id: "gas",
    label: "Gas",
    category: "Utilities",
    fields: [
      { name: "provider",    label: "Select Provider",   type: "select", required: true },
      { name: "consumer_no", label: "Consumer Number",   type: "text",   required: true, placeholder: "Enter consumer number" },
      { name: "mobile",      label: "Mobile Number",     type: "tel",    required: true, placeholder: "10-digit mobile" },
    ],
  },
  {
    id: "electricity",
    label: "Electricity",
    category: "Utilities",
    fields: [
      { name: "provider",    label: "Select Provider",        type: "select", required: true },
      { name: "consumer_no", label: "Consumer / CA Number",   type: "text",   required: true, placeholder: "Enter consumer number" },
      { name: "mobile",      label: "Mobile Number",          type: "tel",    required: true, placeholder: "10-digit mobile" },
    ],
  },
  {
    id: "dth",
    label: "DTH",
    category: "Internet / TV",
    fields: [
      { name: "provider",      label: "Select Provider",  type: "select", required: true },
      { name: "subscriber_id", label: "Subscriber ID",    type: "text",   required: true, placeholder: "Enter subscriber ID" },
      { name: "mobile",        label: "Mobile Number",    type: "tel",    required: true, placeholder: "10-digit mobile" },
    ],
  },
  {
    id: "ncmc_recharge",
    label: "NCMC Recharge",
    category: "Banking",
    fields: [
      { name: "provider",   label: "Select Provider",  type: "select", required: true },
      { name: "card_no",    label: "Card Number",      type: "text",   required: true, placeholder: "Enter NCMC card number" },
      { name: "mobile",     label: "Mobile Number",    type: "tel",    required: true, placeholder: "10-digit mobile" },
    ],
  },
  {
    id: "subscription",
    label: "Subscription",
    category: "Others",
    fields: [
      { name: "provider",  label: "Select Provider",  type: "select", required: true },
      { name: "sub_id",    label: "Subscriber ID",    type: "text",   required: true, placeholder: "Enter subscriber ID" },
      { name: "mobile",    label: "Mobile Number",    type: "tel",    required: true, placeholder: "10-digit mobile" },
    ],
  },
  {
    id: "fastag",
    label: "Fastag",
    category: "Banking",
    fields: [
      { name: "provider",   label: "Select Provider",   type: "select", required: true },
      { name: "vehicle_no", label: "Vehicle Number",    type: "text",   required: true, placeholder: "e.g. MH12AB1234" },
      { name: "mobile",     label: "Mobile Number",     type: "tel",    required: true, placeholder: "10-digit mobile" },
    ],
  },
  {
    id: "cable_tv",
    label: "Cable TV",
    category: "Internet / TV",
    fields: [
      { name: "provider",     label: "Select Provider",   type: "select", required: true },
      { name: "subscriber_id",label: "Subscriber ID",     type: "text",   required: true, placeholder: "Enter subscriber ID" },
      { name: "mobile",       label: "Mobile Number",     type: "tel",    required: true, placeholder: "10-digit mobile" },
    ],
  },
  {
    id: "echallan",
    label: "eChallan",
    category: "Others",
    fields: [
      { name: "provider",    label: "Select Provider",   type: "select", required: true },
      { name: "challan_no",  label: "Challan Number",    type: "text",   required: true, placeholder: "Enter challan number" },
      { name: "mobile",      label: "Mobile Number",     type: "tel",    required: true, placeholder: "10-digit mobile" },
    ],
  },
  {
    id: "landline_postpaid",
    label: "Landline Postpaid",
    category: "Mobile",
    fields: [
      { name: "provider",    label: "Select Provider",   type: "select", required: true },
      { name: "landline_no", label: "Landline Number",   type: "tel",    required: true, placeholder: "Enter landline number" },
      { name: "mobile",      label: "Mobile Number",     type: "tel",    required: true, placeholder: "10-digit mobile" },
    ],
  },
  {
    id: "mobile_postpaid",
    label: "Mobile Postpaid",
    category: "Mobile",
    fields: [
      { name: "provider",  label: "Select Provider",   type: "select", required: true },
      { name: "mobile_no", label: "Mobile Number",     type: "tel",    required: true, placeholder: "10-digit mobile number" },
      { name: "mobile",    label: "Registered Mobile", type: "tel",    required: true, placeholder: "10-digit registered mobile" },
    ],
  },
  {
    id: "credit_card",
    label: "Credit Card",
    category: "Banking",
    fields: [
      { name: "provider",  label: "Select Provider",   type: "select", required: true },
      { name: "card_no",   label: "Card Number",       type: "text",   required: true, placeholder: "16-digit card number" },
      { name: "mobile",    label: "Mobile Number",     type: "tel",    required: true, placeholder: "10-digit mobile" },
    ],
  },
  {
    id: "prepaid_meter",
    label: "Prepaid Meter",
    category: "Utilities",
    fields: [
      { name: "provider",    label: "Select Provider",    type: "select", required: true },
      { name: "meter_no",    label: "Meter Number",       type: "text",   required: true, placeholder: "Enter meter number" },
      { name: "mobile",      label: "Mobile Number",      type: "tel",    required: true, placeholder: "10-digit mobile" },
    ],
  },
  {
    id: "agent_collection",
    label: "Agent Collection",
    category: "Others",
    fields: [
      { name: "provider",  label: "Select Provider",  type: "select", required: true },
      { name: "ref_no",    label: "Reference Number", type: "text",   required: true, placeholder: "Enter reference number" },
      { name: "mobile",    label: "Mobile Number",    type: "tel",    required: true, placeholder: "10-digit mobile" },
    ],
  },
  {
    id: "rental",
    label: "Rental",
    category: "Home",
    fields: [
      { name: "provider",   label: "Select Provider",  type: "select", required: true },
      { name: "account_id", label: "Account / Ref ID", type: "text",   required: true, placeholder: "Enter account ID" },
      { name: "mobile",     label: "Mobile Number",    type: "tel",    required: true, placeholder: "10-digit mobile" },
    ],
  },
  {
    id: "lpg_gas",
    label: "LPG Gas",
    category: "Utilities",
    fields: [
      { name: "provider",      label: "Select Provider",   type: "select", required: true },
      { name: "consumer_no",   label: "Consumer Number",   type: "text",   required: true, placeholder: "Enter consumer number" },
      { name: "mobile",        label: "Mobile Number",     type: "tel",    required: true, placeholder: "10-digit mobile" },
    ],
  },
  {
    id: "mobile_prepaid",
    label: "Mobile Prepaid",
    category: "Mobile",
    fields: [
      { name: "provider",  label: "Select Provider",  type: "select", required: true },
      { name: "mobile_no", label: "Mobile Number",    type: "tel",    required: true, placeholder: "10-digit mobile number" },
    ],
  },
  {
    id: "water",
    label: "Water",
    category: "Utilities",
    fields: [
      { name: "provider",    label: "Select Provider",   type: "select", required: true },
      { name: "consumer_no", label: "Consumer Number",   type: "text",   required: true, placeholder: "Enter consumer number" },
      { name: "mobile",      label: "Mobile Number",     type: "tel",    required: true, placeholder: "10-digit mobile" },
    ],
  },
  {
    id: "municipal_services",
    label: "Municipal Services",
    category: "Home",
    fields: [
      { name: "provider",    label: "Select Provider",   type: "select", required: true },
      { name: "consumer_no", label: "Consumer Number",   type: "text",   required: true, placeholder: "Enter consumer number" },
      { name: "mobile",      label: "Mobile Number",     type: "tel",    required: true, placeholder: "10-digit mobile" },
    ],
  },
  {
    id: "national_pension_system",
    label: "National Pension System",
    category: "Banking",
    fields: [
      { name: "provider",   label: "Select Provider",  type: "select", required: true },
      { name: "pran",       label: "PRAN Number",      type: "text",   required: true, placeholder: "12-digit PRAN number" },
      { name: "mobile",     label: "Mobile Number",    type: "tel",    required: true, placeholder: "10-digit mobile" },
    ],
  },
  {
    id: "ev_recharge",
    label: "EV Recharge",
    category: "Others",
    fields: [
      { name: "provider",    label: "Select Provider",   type: "select", required: true },
      { name: "vehicle_no",  label: "Vehicle Number",    type: "text",   required: true, placeholder: "e.g. MH12AB1234" },
      { name: "mobile",      label: "Mobile Number",     type: "tel",    required: true, placeholder: "10-digit mobile" },
    ],
  },
  {
    id: "education_fees",
    label: "Education Fees",
    category: "Others",
    fields: [
      { name: "provider",    label: "Select Provider",       type: "select", required: true },
      { name: "student_id",  label: "Student/Admission ID",  type: "text",   required: true, placeholder: "Enter student/admission ID" },
      { name: "mobile",      label: "Mobile Number",         type: "tel",    required: true, placeholder: "10-digit mobile" },
    ],
  },
  {
    id: "fleet_card_recharge",
    label: "Fleet Card Recharge",
    category: "Banking",
    fields: [
      { name: "provider",  label: "Select Provider",    type: "select", required: true },
      { name: "card_no",   label: "Fleet Card Number",  type: "text",   required: true, placeholder: "Enter fleet card number" },
      { name: "mobile",    label: "Mobile Number",      type: "tel",    required: true, placeholder: "10-digit mobile" },
    ],
  },
  {
    id: "recurring_deposit",
    label: "Recurring Deposit",
    category: "Banking",
    fields: [
      { name: "provider",   label: "Select Provider",     type: "select", required: true },
      { name: "account_no", label: "RD Account Number",   type: "text",   required: true, placeholder: "Enter RD account number" },
      { name: "mobile",     label: "Mobile Number",       type: "tel",    required: true, placeholder: "10-digit mobile" },
    ],
  },
];

/**
 * Static provider list per service (UAT demo data).
 * Replace with API call when live credentials are available.
 */
export const BBPS_PROVIDERS = {
  loan_repayment:       ["SBI", "HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak Mahindra Bank", "PNB", "Bank of Baroda"],
  broadband_postpaid:   ["Jio Fiber", "Airtel Broadband", "BSNL Broadband", "ACT Fibernet", "Hathway"],
  housing_society:      ["NoBrokerHood", "MyGate", "Apnacomplex", "Society Connect"],
  municipal_taxes:      ["MCGM Mumbai", "BBMP Bengaluru", "NDMC Delhi", "AMC Ahmedabad", "PMC Pune"],
  clubs_and_associations: ["BCCI", "Golf Club India", "Lions Club", "Rotary Club"],
  donation:             ["PM CARES Fund", "CRY", "Help Age India", "UNICEF India"],
  insurance:            ["LIC", "SBI Life", "HDFC Life", "ICICI Prudential", "Bajaj Allianz"],
  gas:                  ["IGL Delhi", "MGL Mumbai", "Gujarat Gas", "Adani Gas"],
  electricity:          ["MSEDCL", "BESCOM", "TPDDL Delhi", "CESC Kolkata", "UPPCL"],
  dth:                  ["Tata Play", "Airtel Digital TV", "Sun Direct", "Dish TV", "D2H"],
  ncmc_recharge:        ["DMRC", "MMRDA", "BMRCL", "Chennai Metro"],
  subscription:         ["Netflix", "Amazon Prime", "Hotstar", "SonyLIV"],
  fastag:               ["Paytm Payments Bank", "HDFC Bank FASTag", "ICICI Bank FASTag", "SBI FASTag", "Axis Bank FASTag"],
  cable_tv:             ["Hathway Cable", "SITI Networks", "DEN Networks", "IN Digital"],
  echallan:             ["MoRTH eChallan", "Delhi Traffic Police", "Maharashtra Police"],
  landline_postpaid:    ["BSNL", "MTNL Mumbai", "MTNL Delhi"],
  mobile_postpaid:      ["Jio", "Airtel", "Vi (Vodafone Idea)", "BSNL", "MTNL"],
  credit_card:          ["SBI Card", "HDFC Credit Card", "ICICI Credit Card", "Axis Bank", "Kotak Mahindra"],
  prepaid_meter:        ["MSEDCL", "BESCOM", "TPDDL", "UPPCL", "CESC"],
  agent_collection:     ["General Collection"],
  rental:               ["NoBroker", "MagicBricks", "Housing.com"],
  lpg_gas:              ["HP Gas", "Bharat Gas", "Indane (IOC)"],
  mobile_prepaid:       ["Jio", "Airtel", "Vi (Vodafone Idea)", "BSNL"],
  water:                ["MCGM", "BWSSB Bengaluru", "DJB Delhi", "PMC Pune"],
  municipal_services:   ["MCGM Mumbai", "BBMP Bengaluru", "NDMC Delhi", "AMC Ahmedabad"],
  national_pension_system: ["NPS Trust (NSDL)", "NPS Trust (CAMS)"],
  ev_recharge:          ["Tata Power EZ Charge", "EESL", "Ather Grid", "ChargeZone", "BPCL"],
  fleet_card_recharge:  ["HPCL Fleet Card", "IOCL Fleet Card", "BPCL Fleet Card"],
  education_fees:       ["DPS", "Ryan International", "Amity University", "Manipal University", "VIT"],
  recurring_deposit:    ["SBI", "HDFC Bank", "ICICI Bank", "Axis Bank", "Post Office"],
};
