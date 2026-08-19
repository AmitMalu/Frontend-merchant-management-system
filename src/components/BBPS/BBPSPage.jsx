import React, { useState, useEffect, useRef } from "react";
import { MdChevronLeft, MdClose } from "react-icons/md";
import { BBPS_SERVICES, fetchBillerInfo, fetchBillDetails, mapDataTypeToInputType, getUatSample } from "./bbpsServices";
import { BharatConnectLogo, BeAssuredLogo } from "./brandLogos";
import bharatConnectSonic from "../../assets/bbps-brand/bharat-connect-sonic.mp3";
import api from "../../constants/API/axiosInstance";
import { toast } from "react-toastify";

const VENDOR_NAME = "Bill Avenue";

// ─── Top bar ──────────────────────────────────────────────────────────────────
// Bharat Connect logo: fixed top-right, same size/markup on every screen
// (Biller Selection, Bill Fetch, Bill Payment) per brand guidelines.
export const TopBar = ({ title, onBack, showBack = true }) => (
  <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shadow-sm">
    <div className="flex items-center gap-2">
      {showBack && (
        <button onClick={onBack} className="p-1 rounded-lg hover:bg-gray-100 transition-colors text-gray-600">
          <MdChevronLeft className="text-2xl" />
        </button>
      )}
      <span className="text-lg font-bold text-gray-800">{title}</span>
    </div>
    <BharatConnectLogo />
  </div>
);

// ─── Floating label read-only field ──────────────────────────────────────────
const ReadOnlyField = ({ label, value }) => (
  <div className="relative border border-gray-300 rounded-lg px-3 pt-4 pb-2 bg-white">
    <span className="absolute top-1 left-3 text-[10px] text-gray-400 font-medium">{label}</span>
    <p className="text-sm text-gray-800 font-medium mt-0.5">{value ?? "—"}</p>
  </div>
);

// ─── Receipt row (label/value pair) ───────────────────────────────────────────
export const ReceiptRow = ({ label, value, mono = false, bold = false }) => (
  <div className="flex items-center justify-between border-b border-gray-100 py-2">
    <span className="text-gray-500">{label}</span>
    <span className={`text-right text-gray-800 ${mono ? "font-mono" : ""} ${bold ? "font-bold" : "font-medium"}`}>
      {value || "—"}
    </span>
  </div>
);

// ─── Floating label input ─────────────────────────────────────────────────────
const FloatingInput = ({ label, value, onChange, type = "text", placeholder = "", required = false, error = "" }) => (
  <div className="relative border border-gray-300 rounded-lg px-3 pt-4 pb-2 bg-white focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
    <span className="absolute top-1 left-3 text-[10px] text-gray-400 font-medium">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </span>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full text-sm text-gray-800 bg-transparent focus:outline-none mt-0.5 placeholder-gray-300"
    />
    {error && <p className="text-red-500 text-[10px] mt-1">{error}</p>}
  </div>
);

// ─── Bill Details Modal ───────────────────────────────────────────────────────
const BillDetailsModal = ({ billResult, service, billerInfo, customerMobile, uatSampleEntry, onClose, onPay }) => {
  const [amount, setAmount]         = useState("");
  const [amountError, setAmountError] = useState("");
  const [paying, setPaying]         = useState(false);
  const [comingSoon, setComingSoon] = useState(false);
  const [receipt, setReceipt]       = useState(null);
  const sonicRef                    = useRef(null);

  const billerResp     = billResult?.billerResponse   || {};
  const inputEcho      = billResult?.inputParams?.input || [];
  const additionalInfo = billResult?.additionalInfo?.info || [];

  // Pre-fill amount from billAmount (paise → rupees)
  useEffect(() => {
    if (billerResp.billAmount) {
      setAmount((Number(billerResp.billAmount) / 100).toFixed(2));
    }
  }, []);

  // Amount constraints from additionalInfo
  const getConstraints = () => {
    let min = null, max = null;
    additionalInfo.forEach((item) => {
      const n = item.infoName?.toLowerCase() || "";
      if (n.includes("minimum")) min = parseFloat(item.infoValue);
      if (n.includes("maximum")) max = parseFloat(item.infoValue);
    });
    return { min, max };
  };

  const validateAmount = (val) => {
    const num = Number(val);
    if (!val || isNaN(num) || num <= 0) return "Enter a valid amount";
    const { min, max } = getConstraints();
    if (min !== null && num < min) return `Min ₹${min}`;
    if (max !== null && num > max) return `Max ₹${max}`;
    return "";
  };

  // UAT-hardcoded payment response for this category/mode (if any) — used to
  // build a real receipt instead of the "Coming Soon" placeholder. Remove
  // once a live payment API + provider lookups are wired up.
  const uatPayResponse = uatSampleEntry?.payResponse;

  const handlePay = async (method) => {
    const err = validateAmount(amount);
    if (err) { setAmountError(err); return; }
    setAmountError("");

    if (!uatPayResponse) {
      setComingSoon(true);
      return;
    }

    const billAmountRupees = uatPayResponse.respAmount ? Number(uatPayResponse.respAmount) / 100 : Number(amount) || 0;
    const ccfRupees        = uatPayResponse.custConvFee ? Number(uatPayResponse.custConvFee) / 100 : 0;

    setReceipt({
      txnRefId: uatPayResponse.txnRefId,
      billerId: uatSampleEntry?.billerId,
      billerName: service?.serviceName,
      customerName: uatPayResponse.respCustomerName || billerResp.customerName,
      customerNumber: uatSampleEntry?.mobile || customerMobile,
      billDate: uatPayResponse.respBillDate || billerResp.billDate,
      billPeriod: uatPayResponse.respBillPeriod || billerResp.billPeriod,
      billNumber: uatPayResponse.respBillNumber || billerResp.billNumber,
      dueDate: uatPayResponse.respDueDate || billerResp.dueDate,
      billAmount: billAmountRupees,
      ccf: ccfRupees,
      totalAmount: billAmountRupees + ccfRupees,
      txnDateTime: new Date().toLocaleString("en-IN"),
      initiatingChannel: "WEB",
      paymentMode: method,
      status: uatPayResponse.responseReason || "Successful",
      approvalNumber: uatPayResponse.approvalRefNumber,
    });

    // Sonic branding must play simultaneously with the B Assured display —
    // trigger it here, inside the click handler, so it counts as
    // user-initiated for browser autoplay policies.
    sonicRef.current?.play().catch(() => {});
  };

  // Build all display fields:
  // 1. inputParams echo (read-only)
  // 2. billerResponse fields (all read-only except billAmount)
  // 3. additionalInfo (read-only)
  const billerRespFields = Object.entries(billerResp).filter(([k]) => k !== "billAmount");
  const dueAmountRupees  = billerResp.billAmount ? Number(billerResp.billAmount) / 100 : null;
  const { min, max }     = getConstraints();

  // Merge inputEcho + billerRespFields + additionalInfo into a flat read-only grid
  const readOnlyRows = [
    ...inputEcho.map((i) => ({ label: i.paramName, value: i.paramValue })),
    ...billerRespFields.map(([k, v]) => ({
      label: k.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()).trim(),
      value: v,
    })),
    ...additionalInfo.map((i) => ({ label: i.infoName, value: i.infoValue })),
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* Sonic branding — plays alongside the B Assured display on payment success */}
        <audio ref={sonicRef} src={bharatConnectSonic} preload="auto" />

        {/* Modal header — Bharat Connect logo (Bill Details) or Be-Assured logo (Coming Soon placeholder).
            The real receipt carries its own B Assured logo top-left, per brand guidelines, not the header. */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">{receipt ? "Bill Pay Receipt" : "Bill Details"}</h2>
          <div className="flex items-center gap-3">
            {!receipt && (comingSoon ? <BeAssuredLogo /> : <BharatConnectLogo />)}
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
            >
              <MdClose className="text-lg" />
            </button>
          </div>
        </div>

        {/* Modal body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">

          {receipt ? (
            /* ── Receipt screen — B Assured logo top-left, per brand guidelines (digital receipt) ── */
            <div>
              <div className="flex items-center justify-between mb-2">
                <BeAssuredLogo />
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                  {receipt.status}
                </span>
              </div>
              <div className="flex flex-col items-center gap-2 py-2">
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-3xl">✓</div>
                <h3 className="text-xl font-bold text-gray-800">Transaction Successful!</h3>
              </div>
              <div className="border border-gray-100 rounded-xl px-4">
                <ReceiptRow label="BBPS Transaction ID" value={receipt.txnRefId} mono />
                <ReceiptRow label="Biller ID" value={receipt.billerId} />
                <ReceiptRow label="Biller Name" value={receipt.billerName} />
                <ReceiptRow label="Customer Name" value={receipt.customerName} />
                <ReceiptRow label="Customer Number" value={receipt.customerNumber} />
                <ReceiptRow label="Bill Date" value={receipt.billDate} />
                <ReceiptRow label="Bill Period" value={receipt.billPeriod} />
                <ReceiptRow label="Bill Number" value={receipt.billNumber} />
                <ReceiptRow label="Due Date" value={receipt.dueDate} />
                <ReceiptRow label="Bill Amount" value={`₹${receipt.billAmount.toFixed(2)}`} />
                <ReceiptRow label="Customer Convenience Fees" value={`₹${receipt.ccf.toFixed(2)}`} />
                <ReceiptRow label="Total Amount" value={`₹${receipt.totalAmount.toFixed(2)}`} bold />
                <ReceiptRow label="Transaction Date and Time" value={receipt.txnDateTime} />
                <ReceiptRow label="Initiating Channel" value={receipt.initiatingChannel} />
                <ReceiptRow label="Payment Mode" value={receipt.paymentMode} />
                <ReceiptRow label="Transaction Status" value={receipt.status} />
                <ReceiptRow label="Approval Number" value={receipt.approvalNumber} />
              </div>
            </div>
          ) : comingSoon ? (
            /* ── Coming Soon screen ── */
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="text-6xl">🚀</div>
              <h3 className="text-2xl font-bold text-indigo-700 tracking-wide">Coming Soon!</h3>
              <p className="text-sm text-gray-500 text-center max-w-xs">
                Payment integration is under review by Bill Avenue.<br />
                Live credentials will be activated shortly.
              </p>
              <button
                onClick={() => setComingSoon(false)}
                className="mt-2 px-6 py-2 border border-indigo-300 text-indigo-600 text-sm rounded-full hover:bg-indigo-50 transition-colors"
              >
                Go Back
              </button>
            </div>
          ) : (
            <>
              {/* Read-only fields grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {readOnlyRows.map((row, i) => (
                  <ReadOnlyField key={i} label={row.label} value={row.value} />
                ))}
              </div>

              {/* Editable amount field */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative border border-indigo-400 rounded-lg px-3 pt-4 pb-2 bg-white focus-within:ring-1 focus-within:ring-indigo-500 transition-all sm:col-span-2">
                  <span className="absolute top-1 left-3 text-[10px] text-indigo-500 font-medium">
                    Amount
                    {(min !== null || max !== null) && (
                      <span className="text-gray-400 font-normal ml-1">
                        {min !== null && `Min ₹${min}`}
                        {min !== null && max !== null && " — "}
                        {max !== null && `Max ₹${max}`}
                      </span>
                    )}
                  </span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      setAmountError(validateAmount(e.target.value));
                    }}
                    placeholder={dueAmountRupees?.toFixed(2) || "0.00"}
                    className="w-full text-sm text-gray-800 bg-transparent focus:outline-none mt-0.5"
                  />
                  {amountError && <p className="text-red-500 text-[10px] mt-1">{amountError}</p>}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal footer */}
        {receipt ? (
          <div className="flex items-center justify-end px-6 py-4 border-t border-gray-100 bg-gray-50">
            <button
              onClick={onClose}
              className="px-10 py-2.5 bg-indigo-700 text-white text-sm font-bold rounded-full hover:bg-indigo-800 transition-colors"
            >
              Close
            </button>
          </div>
        ) : !comingSoon && (
          <div className="flex items-center justify-end px-6 py-4 border-t border-gray-100 bg-gray-50">
            <button
              onClick={() => handlePay("WALLET")}
              disabled={paying}
              className="px-10 py-2.5 bg-indigo-700 text-white text-sm font-bold rounded-full hover:bg-indigo-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {paying && <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />}
              Pay
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Screen 1: Biller category dropdown ────────────────────────────────────────
const BBPSServiceGrid = ({ onSelectService }) => {
  const [services, setServices]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [selectedKey, setSelectedKey]     = useState("");

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await api.post("/billpay/config/services", { vendorName: VENDOR_NAME });
        setServices(res.data?.data || []);
      } catch {
        setServices(BBPS_SERVICES.map((s) => ({ serviceName: s.label, serviceKey: s.id })));
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const handleCategoryChange = (e) => {
    const key = e.target.value;
    setSelectedKey(key);
    if (!key) return;
    const svc = services.find((s) => (s.serviceKey || s.serviceName) === key);
    if (svc) onSelectService(svc);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopBar title="Bharat Bill Payment" showBack={false} />
      <div className="flex-1 px-6 py-10">
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
          <h2 className="text-sm font-bold text-gray-800 mb-4">Bharat Connect Billers</h2>

          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
            Biller Category <span className="text-red-500">*</span>
          </label>

          {loading ? (
            <div className="h-11 w-full bg-gray-200 rounded-lg animate-pulse" />
          ) : services.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No services available at the moment.</p>
          ) : (
            <div className="relative">
              <select
                value={selectedKey}
                onChange={handleCategoryChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none pr-8"
              >
                <option value="">Select Biller Category</option>
                {services.map((svc) => (
                  <option key={svc.serviceName} value={svc.serviceKey || svc.serviceName}>
                    {svc.serviceName}
                  </option>
                ))}
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">▼</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Screen 2: Service form (horizontal fields + modal result) ────────────────
const BBPSServiceForm = ({ service, onBack }) => {
  const [providers, setProviders]                   = useState([]);
  const [loadingProviders, setLoadingProviders]     = useState(true);
  const [selectedProviderId, setSelectedProviderId] = useState("");
  const [payMode, setPayMode]                       = useState("FETCH_AND_PAY"); // FETCH_AND_PAY | QUICK_PAY
  const [billerInfo, setBillerInfo]                 = useState(null);
  const [loadingBiller, setLoadingBiller]           = useState(false);
  const [dynamicFields, setDynamicFields]           = useState([]);
  const [fieldValues, setFieldValues]               = useState({});
  const [customerMobile, setCustomerMobile]         = useState("");
  const [mobileError, setMobileError]               = useState("");
  const [fieldErrors, setFieldErrors]               = useState({});
  const [fetching, setFetching]                     = useState(false);
  const [sampleFetching, setSampleFetching]         = useState(false);
  const [billResult, setBillResult]                 = useState(null);
  const [fetchError, setFetchError]                 = useState(null);
  const [showModal, setShowModal]                   = useState(false);

  // ── Load providers ──────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoadingProviders(true);
      try {
        const res = await api.post("/billpay/config/providers", {
          vendorName: VENDOR_NAME,
          serviceName: service.serviceName,
        });
        setProviders(res.data?.data || []);
      } catch {
        setProviders([]);
      } finally {
        setLoadingProviders(false);
      }
    };
    load();
  }, [service.serviceName]);

  // ── Provider change → load biller input params ──────────────────────────────
  const handleProviderChange = async (providerId) => {
    setSelectedProviderId(providerId);
    setPayMode("FETCH_AND_PAY");
    setBillerInfo(null);
    setDynamicFields([]);
    setFieldValues({});
    setFieldErrors({});
    setBillResult(null);
    setFetchError(null);
    if (!providerId) return;

    setLoadingBiller(true);
    try {
      const biller = await fetchBillerInfo(providerId);
      if (!biller) return;
      setBillerInfo(biller);
      const params =
        biller.billerInputParams?.[0]?.paramsList ||
        biller.billerInputParams?.paramsList || [];
      setDynamicFields(params);
      setFieldValues(Object.fromEntries(params.map((p) => [p.paramName, ""])));
    } catch (err) {
      console.error("Failed to fetch biller info:", err);
    } finally {
      setLoadingBiller(false);
    }
  };

  // ── Validate ────────────────────────────────────────────────────────────────
  const validate = () => {
    let valid = true;
    const newFieldErrors = {};

    if (!selectedProviderId) { toast.error("Please select a provider"); return false; }

    if (!/^\d{10}$/.test(customerMobile.trim())) {
      setMobileError("Enter a valid 10-digit mobile number");
      valid = false;
    } else {
      setMobileError("");
    }

    for (const f of dynamicFields) {
      if (f.isOptional === "true" || f.visibility === "false") continue;
      const val = fieldValues[f.paramName]?.trim() || "";
      if (!val) {
        newFieldErrors[f.paramName] = `${f.paramName} is required`;
        valid = false;
      } else if (f.minLength && val.length < Number(f.minLength)) {
        newFieldErrors[f.paramName] = `Min ${f.minLength} characters`;
        valid = false;
      } else if (f.maxLength && val.length > Number(f.maxLength)) {
        newFieldErrors[f.paramName] = `Max ${f.maxLength} characters`;
        valid = false;
      }
    }
    setFieldErrors(newFieldErrors);
    return valid;
  };

  // ── Apply result → open modal ───────────────────────────────────────────────
  const applyBillResult = (data) => {
    setBillResult(data);
    setFetchError(null);
    setShowModal(true);
  };

  // ── Fetch Details ───────────────────────────────────────────────────────────
  const handleFetchDetails = async () => {
    if (!validate()) return;
    setFetching(true);
    setBillResult(null);
    setFetchError(null);
    try {
      const result = await fetchBillDetails(selectedProviderId, customerMobile.trim(), fieldValues);
      if (!result) throw new Error("Empty response");
      // Unwrap outer envelope if present
      const inner = result?.data ?? result;
      if (inner?.responseCode && inner.responseCode !== "000") {
        setFetchError({ message: `Error code: ${inner.responseCode}`, errors: inner.errorList || [] });
      } else {
        applyBillResult(inner);
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Failed to fetch bill details.";
      setFetchError({ message: msg, errors: err.billerErrors || [] });
    } finally {
      setFetching(false);
    }
  };

  // ── Quick Pay — skip bill fetch, go straight to the payment screen ──────────
  const handleQuickPay = () => {
    if (!validate()) return;
    const inputList = Object.entries(fieldValues).map(([paramName, paramValue]) => ({ paramName, paramValue }));
    applyBillResult({ billerResponse: {}, inputParams: { input: inputList } });
  };

  // ── Sample Quick Pay (UAT) — remove once live confirmed ─────────────────────
  const handleSampleQuickPay = () => {
    const sample = getUatSample(service.serviceName)?.quickPay;
    if (!sample) return;
    applyBillResult({ billerResponse: {}, inputParams: { input: sample.inputParams } });
  };

  // ── Sample Fetch (UAT) — remove once live confirmed ─────────────────────────
  // Payload is looked up per biller category from the UAT test-data sheet,
  // so every category with a known sample (Fastag, Loan Repayment, Mobile,
  // Broadband Postpaid, ...) can be previewed, not just one hardcoded biller.
  const handleSampleFetch = async () => {
    const sample = getUatSample(service.serviceName)?.fetchAndPay;
    if (!sample) return;

    setSampleFetching(true);
    setBillResult(null);
    setFetchError(null);
    const payload = {
      agentId: "CC01CC01513515340681",
      agentDeviceInfo: { ip: "192.168.2.73", initChannel: "AGT", mac: "01-23-45-67-89-ab" },
      customerInfo: { customerMobile: sample.mobile, customerEmail: "", customerAdhaar: "", customerPan: "" },
      billerId: sample.billerId,
      inputParams: { input: sample.inputParams },
    };
    console.log("🧪 Sample payload:", JSON.stringify(payload, null, 2));
    try {
      const res = await api.post("/billpay/config/bill-fetch", payload);
      console.log("🧪 Sample response:", res.data);
      // Backend wraps response: { statusCode, message, data: { responseCode, billerResponse, ... } }
      const inner = res.data?.data ?? res.data;
      if (inner?.responseCode && inner.responseCode !== "000") {
        setFetchError({ message: `Error code: ${inner.responseCode}`, errors: inner.errorList || [] });
      } else if (inner?.billerResponse) {
        applyBillResult(inner);
      } else {
        setFetchError({ message: `Unexpected: ${JSON.stringify(res.data).slice(0, 200)}`, errors: [] });
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Sample fetch failed";
      setFetchError({ message: String(msg), errors: [] });
    } finally {
      setSampleFetching(false);
    }
  };

  // ── Pay handler (called from modal) ────────────────────────────────────────
  const handlePay = async (amount, method) => {
    await new Promise((r) => setTimeout(r, 1500)); // TODO: wire real payment API
    toast.success(`₹${Number(amount).toLocaleString("en-IN")} paid successfully!`);
    setShowModal(false);
    setBillResult(null);
    setSelectedProviderId("");
    setBillerInfo(null);
    setDynamicFields([]);
    setFieldValues({});
    setCustomerMobile("");
    setFetchError(null);
  };

  const isLoading = fetching || sampleFetching || loadingBiller;
  const uatSample = getUatSample(service.serviceName);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopBar title={service.serviceName} onBack={onBack} />

      <div className="flex-1 px-6 py-8">
        <div className="max-w-4xl bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-5">

          {/* Provider */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Select Provider <span className="text-red-500">*</span>
            </label>
            {loadingProviders ? (
              <div className="h-11 w-full sm:w-80 bg-gray-200 rounded-lg animate-pulse" />
            ) : (
              <div className="relative w-full sm:w-80">
                <select
                  value={selectedProviderId}
                  onChange={(e) => handleProviderChange(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none pr-8"
                >
                  <option value="">Select Provider</option>
                  {providers.map((p) => {
                    const id    = p.providerId ?? p.id ?? p.providerName;
                    const label = p.providerName ?? p.name ?? String(id);
                    return <option key={id} value={id}>{label}</option>;
                  })}
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">▼</span>
              </div>
            )}
          </div>

          {/* Bill details — payment mode, mobile, dynamic biller fields */}
          {(billerInfo || loadingBiller) && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-5">

              {/* Fetch and Pay / Quick Pay */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Payment Mode <span className="text-red-500">*</span>
                </label>
                {loadingBiller ? (
                  <div className="h-11 w-64 bg-gray-200 rounded-lg animate-pulse" />
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {[
                      { value: "FETCH_AND_PAY", label: "Fetch and Pay" },
                      { value: "QUICK_PAY", label: "Quick Pay" },
                    ].map((opt) => (
                      <label
                        key={opt.value}
                        className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-medium cursor-pointer transition-colors ${
                          payMode === opt.value
                            ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                            : "border-gray-300 bg-white text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        <input
                          type="radio"
                          name="payMode"
                          checked={payMode === opt.value}
                          onChange={() => setPayMode(opt.value)}
                          className="accent-indigo-700"
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile + dynamic biller fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Customer Mobile Number <span className="text-red-500">*</span>
                  </label>
                  {loadingBiller ? (
                    <div className="h-11 w-full bg-gray-200 rounded-lg animate-pulse" />
                  ) : (
                    <>
                      <input
                        type="tel"
                        value={customerMobile}
                        onChange={(e) => { setCustomerMobile(e.target.value.replace(/\D/g, "").slice(0, 10)); setMobileError(""); }}
                        placeholder="Enter Number"
                        maxLength={10}
                        className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${mobileError ? "border-red-400" : "border-gray-300"}`}
                      />
                      {mobileError && <p className="text-red-500 text-xs mt-1">{mobileError}</p>}
                    </>
                  )}
                </div>

                {!loadingBiller && dynamicFields
                  .filter((p) => p.visibility !== "false")
                  .map((param) => (
                    <div key={param.paramName}>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        {param.paramName}
                        {param.isOptional !== "true" && <span className="text-red-500"> *</span>}
                      </label>
                      <input
                        type={mapDataTypeToInputType(param.dataType)}
                        value={fieldValues[param.paramName] || ""}
                        onChange={(e) => {
                          setFieldValues((prev) => ({ ...prev, [param.paramName]: e.target.value }));
                          setFieldErrors((prev) => ({ ...prev, [param.paramName]: "" }));
                        }}
                        placeholder={`Enter ${param.paramName}`}
                        maxLength={param.maxLength ? Number(param.maxLength) : undefined}
                        className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          fieldErrors[param.paramName] ? "border-red-400" : "border-gray-300"
                        }`}
                      />
                      {fieldErrors[param.paramName] && (
                        <p className="text-red-500 text-xs mt-1">{fieldErrors[param.paramName]}</p>
                      )}
                    </div>
                  ))
                }
              </div>

              {/* Fetch/Quick Pay + Sample buttons */}
              {!loadingBiller && (
                <div className="flex flex-wrap justify-end gap-2 pt-4 border-t border-gray-200">
                  {payMode === "QUICK_PAY" ? (
                    <>
                      <button
                        onClick={handleQuickPay}
                        disabled={isLoading}
                        className="px-7 py-2.5 bg-indigo-700 text-white text-sm font-bold rounded-full hover:bg-indigo-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 uppercase tracking-wide"
                      >
                        Proceed to Pay
                      </button>

                      {/* 🧪 UAT ONLY — remove once live confirmed */}
                      {uatSample?.quickPay && (
                        <button
                          onClick={handleSampleQuickPay}
                          disabled={isLoading}
                          title="Use hardcoded UAT Quick Pay data"
                          className="px-4 py-2.5 bg-amber-500 text-white text-xs font-bold rounded-full hover:bg-amber-600 transition-colors disabled:opacity-50 border-2 border-amber-300 flex items-center gap-1"
                        >
                          🧪 SAMPLE
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleFetchDetails}
                        disabled={isLoading}
                        className="px-7 py-2.5 bg-indigo-700 text-white text-sm font-bold rounded-full hover:bg-indigo-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 uppercase tracking-wide"
                      >
                        {fetching ? (
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                        ) : null}
                        Fetch Details
                      </button>

                      {/* 🧪 UAT ONLY — remove once live confirmed */}
                      {uatSample?.fetchAndPay && (
                        <button
                          onClick={handleSampleFetch}
                          disabled={isLoading}
                          title="Send hardcoded UAT payload"
                          className="px-4 py-2.5 bg-amber-500 text-white text-xs font-bold rounded-full hover:bg-amber-600 transition-colors disabled:opacity-50 border-2 border-amber-300 flex items-center gap-1"
                        >
                          {sampleFetching
                            ? <div className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
                            : "🧪"
                          }
                          SAMPLE
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Inline fetch error */}
        {fetchError && (
          <div className="mt-4 max-w-4xl rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <div className="flex items-start gap-2">
              <span className="text-red-500 shrink-0">⚠</span>
              <div className="flex-1 min-w-0 space-y-1">
                <p className="font-semibold text-red-700 text-xs">Bill fetch failed</p>
                {fetchError.errors?.length > 0
                  ? fetchError.errors.map((e, i) => (
                      <p key={i} className="text-red-600 text-xs">
                        <span className="font-mono font-bold">{e.errorCode}</span> — {e.errorMessage}
                      </p>
                    ))
                  : <p className="text-red-600 text-xs">{fetchError.message}</p>
                }
              </div>
              <button onClick={() => setFetchError(null)} className="text-red-300 hover:text-red-500 text-lg shrink-0">×</button>
            </div>
          </div>
        )}
      </div>

      {/* ── Bill Details Modal ──────────────────────────────────────────────── */}
      {showModal && billResult && (
        <BillDetailsModal
          billResult={billResult}
          service={service}
          billerInfo={billerInfo}
          customerMobile={customerMobile}
          uatSampleEntry={payMode === "QUICK_PAY" ? uatSample?.quickPay : uatSample?.fetchAndPay}
          onClose={() => setShowModal(false)}
          onPay={handlePay}
        />
      )}
    </div>
  );
};

// ─── Root component ───────────────────────────────────────────────────────────
const BBPSPage = () => {
  const [screen, setScreen]               = useState("grid");
  const [selectedService, setSelectedService] = useState(null);

  if (screen === "grid") {
    return (
      <BBPSServiceGrid
        onSelectService={(svc) => { setSelectedService(svc); setScreen("form"); }}
      />
    );
  }

  return (
    <BBPSServiceForm
      service={selectedService}
      onBack={() => { setScreen("grid"); setSelectedService(null); }}
    />
  );
};

export default BBPSPage;
