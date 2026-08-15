import React, { useState, useEffect } from "react";
import { MdChevronLeft, MdPayments, MdClose } from "react-icons/md";
import { getBbpsIcon } from "./bbpsIcons";
import { BBPS_SERVICES, fetchBillerInfo, fetchBillDetails, mapDataTypeToInputType } from "./bbpsServices";
import api from "../../constants/API/axiosInstance";
import { toast } from "react-toastify";

const VENDOR_NAME = "Bill Avenue";

// ─── Top bar ──────────────────────────────────────────────────────────────────
const TopBar = ({ title, onBack, showBack = true }) => (
  <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shadow-sm">
    <div className="flex items-center gap-2">
      {showBack && (
        <button onClick={onBack} className="p-1 rounded-lg hover:bg-gray-100 transition-colors text-gray-600">
          <MdChevronLeft className="text-2xl" />
        </button>
      )}
      <span className="text-lg font-bold text-gray-800">{title}</span>
    </div>
    <div className="flex items-center gap-1.5">
      <div className="text-right leading-none">
        <p className="text-[11px] font-extrabold text-orange-500 tracking-tight">Bharat</p>
        <p className="text-[11px] font-extrabold text-indigo-700 tracking-tight">Connect</p>
      </div>
      <div className="w-7 h-7 bg-indigo-700 rounded-md flex items-center justify-center">
        <MdPayments className="text-white text-base" />
      </div>
    </div>
  </div>
);

// ─── Grid skeleton ────────────────────────────────────────────────────────────
const GridSkeleton = () => (
  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-9 gap-4 p-6">
    {Array.from({ length: 18 }).map((_, i) => (
      <div key={i} className="aspect-square bg-gray-200 rounded-2xl animate-pulse" />
    ))}
  </div>
);

// ─── Floating label read-only field ──────────────────────────────────────────
const ReadOnlyField = ({ label, value }) => (
  <div className="relative border border-gray-300 rounded-lg px-3 pt-4 pb-2 bg-white">
    <span className="absolute top-1 left-3 text-[10px] text-gray-400 font-medium">{label}</span>
    <p className="text-sm text-gray-800 font-medium mt-0.5">{value ?? "—"}</p>
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
const BillDetailsModal = ({ billResult, service, billerInfo, onClose, onPay }) => {
  const [amount, setAmount]         = useState("");
  const [amountError, setAmountError] = useState("");
  const [paying, setPaying]         = useState(false);
  const [comingSoon, setComingSoon] = useState(false);

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

  const handlePay = async (method) => {
    const err = validateAmount(amount);
    if (err) { setAmountError(err); return; }
    setAmountError("");
    setComingSoon(true);
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

        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Bill Details</h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <div className="text-right leading-none">
                <p className="text-[10px] font-extrabold text-orange-500">Bharat</p>
                <p className="text-[10px] font-extrabold text-indigo-700">Connect</p>
              </div>
              <div className="w-6 h-6 bg-indigo-700 rounded flex items-center justify-center">
                <MdPayments className="text-white text-xs" />
              </div>
            </div>
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

          {comingSoon ? (
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

        {/* Modal footer — single Pay button (hidden on Coming Soon screen) */}
        {!comingSoon && (
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

// ─── Screen 1: Service grid ───────────────────────────────────────────────────
const BBPSServiceGrid = ({ onSelectService }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading]   = useState(true);

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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopBar title="Bharat Bill Payment" showBack={false} />
      {loading ? (
        <GridSkeleton />
      ) : services.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
          No services available at the moment.
        </div>
      ) : (
        <div className="flex-1 p-6">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-9 gap-4">
            {services.map((svc) => {
              const Icon = getBbpsIcon(svc.serviceKey || svc.serviceName);
              return (
                <button
                  key={svc.serviceName}
                  onClick={() => onSelectService(svc)}
                  className="flex flex-col items-center justify-center w-full aspect-square bg-white border-2 border-indigo-100 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-200 group px-2 py-3"
                >
                  <Icon className="text-indigo-700 text-3xl mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-semibold text-indigo-800 text-center leading-tight">
                    {svc.serviceName}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Screen 2: Service form (horizontal fields + modal result) ────────────────
const BBPSServiceForm = ({ service, onBack }) => {
  const [providers, setProviders]                   = useState([]);
  const [loadingProviders, setLoadingProviders]     = useState(true);
  const [selectedProviderId, setSelectedProviderId] = useState("");
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

  // ── Sample Fetch (UAT) — remove once live confirmed ─────────────────────────
  const handleSampleFetch = async () => {
    setSampleFetching(true);
    setBillResult(null);
    setFetchError(null);
    const payload = {
      agentId: "CC01CC01513515340681",
      agentDeviceInfo: { ip: "192.168.2.73", initChannel: "AGT", mac: "01-23-45-67-89-ab" },
      customerInfo: { customerMobile: "9898990084", customerEmail: "", customerAdhaar: "", customerPan: "" },
      billerId: "DUMMYFASTAG001",
      inputParams: { input: [{ paramName: "Vehicle Number", paramValue: "MH15AT6555" }] },
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopBar title={service.serviceName} onBack={onBack} />

      <div className="flex-1 px-6 py-8">

        {/* ── Horizontal fields row ────────────────────────────────────────── */}
        <div className="flex flex-wrap items-end gap-4">

          {/* Provider */}
          <div className="min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Select Provider <span className="text-red-500">*</span>
            </label>
            {loadingProviders ? (
              <div className="h-11 w-48 bg-gray-200 rounded-lg animate-pulse" />
            ) : (
              <div className="relative">
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

          {/* Customer Mobile — always shown once provider selected */}
          {(billerInfo || loadingBiller) && (
            <div className="min-w-[180px]">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Customer Mobile Number <span className="text-red-500">*</span>
              </label>
              {loadingBiller ? (
                <div className="h-11 w-48 bg-gray-200 rounded-lg animate-pulse" />
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
          )}

          {/* Dynamic biller fields */}
          {!loadingBiller && dynamicFields
            .filter((p) => p.visibility !== "false")
            .map((param) => (
              <div key={param.paramName} className="min-w-[160px]">
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

          {/* Fetch + Sample buttons — aligned to the right end */}
          {billerInfo && !loadingBiller && (
            <div className="flex gap-2 ml-auto">
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
            </div>
          )}
        </div>

        {/* Inline fetch error */}
        {fetchError && (
          <div className="mt-4 max-w-xl rounded-xl border border-red-200 bg-red-50 px-4 py-3">
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
