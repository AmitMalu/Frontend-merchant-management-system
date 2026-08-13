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
    id: "subscription_fees",
    label: "Subscription Fees",
    category: "Others",
    fields: [
      { name: "provider",    label: "Select Provider",   type: "select", required: true },
      { name: "sub_id",      label: "Subscriber ID",     type: "text",   required: true, placeholder: "Enter subscriber ID" },
      { name: "mobile",      label: "Mobile Number",     type: "tel",    required: true, placeholder: "10-digit mobile" },
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
  subscription_fees:    ["Netflix", "Amazon Prime", "Hotstar", "SonyLIV", "ZEE5"],
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
};