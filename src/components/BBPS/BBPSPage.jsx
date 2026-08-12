import React, { useState, useEffect } from "react";
import { MdChevronLeft, MdPayments } from "react-icons/md";
import { getBbpsIcon } from "./bbpsIcons";
import { BBPS_SERVICES } from "./bbpsServices";
import api from "../../constants/API/axiosInstance";
import { toast } from "react-toastify";

// Vendor name used in all billpay API requests
const VENDOR_NAME = "Bill Avenue";

// ─── Top bar shared across all screens ───────────────────────────────────────
const TopBar = ({ title, onBack, showBack = true }) => (
  <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shadow-sm">
    <div className="flex items-center gap-2">
      {showBack && (
        <button
          onClick={onBack}
          className="p-1 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
        >
          <MdChevronLeft className="text-2xl" />
        </button>
      )}
      <span className="text-lg font-bold text-gray-800">{title}</span>
    </div>
    {/* BharatConnect brand mark */}
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

// ─── Skeleton loader for the service grid ─────────────────────────────────────
const GridSkeleton = () => (
  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-9 gap-4 p-6">
    {Array.from({ length: 18 }).map((_, i) => (
      <div
        key={i}
        className="aspect-square bg-gray-200 rounded-2xl animate-pulse"
      />
    ))}
  </div>
);

// ─── Screen 1: Service grid (loads dynamically) ───────────────────────────────
const BBPSServiceGrid = ({ onSelectService }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await api.post("/billpay/config/services", {
          vendorName: VENDOR_NAME,
        });
        // Response: { statusCode, message, vendorName, data: [...] }
        const list = res.data?.data || [];
        setServices(list);
      } catch (err) {
        console.error("Failed to load BBPS services:", err);
        toast.error("Failed to load bill payment services. Please refresh.");
        // Fallback to static list so UI doesn't go blank
        setServices(
          BBPS_SERVICES.map((s) => ({
            serviceName: s.label,
            serviceKey:  s.id,
          }))
        );
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
              // serviceName from API e.g. "Broadband Postpaid"
              // serviceKey may or may not be present — derive it for icon lookup
              const iconKey = svc.serviceKey || svc.serviceName;
              const Icon = getBbpsIcon(iconKey);
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

// ─── Screen 2: Service form ───────────────────────────────────────────────────
const BBPSServiceForm = ({ service, onBack }) => {
  // service = { serviceName, serviceKey? }

  const [providers, setProviders]       = useState([]);
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState(null); // full provider object
  const [selectedProviderId, setSelectedProviderId] = useState("");

  // Additional dynamic fields (non-provider) from static catalogue
  // Find matching static definition by service name
  const staticDef = BBPS_SERVICES.find(
    (s) =>
      s.label.toLowerCase() === service.serviceName?.toLowerCase() ||
      s.id === service.serviceKey
  );
  const extraFields = staticDef?.fields?.filter((f) => f.name !== "provider") || [];

  const [fieldValues, setFieldValues] = useState(
    Object.fromEntries(extraFields.map((f) => [f.name, ""]))
  );

  const [fetching, setFetching]   = useState(false);
  const [billData, setBillData]   = useState(null);
  const [paying, setPaying]       = useState(false);
  const [amount, setAmount]       = useState("");
  const [amountError, setAmountError] = useState("");

  const Icon = getBbpsIcon(service.serviceKey || service.serviceName);

  // ── Fetch providers when screen loads ──────────────────────────────────────
  useEffect(() => {
    const fetchProviders = async () => {
      setLoadingProviders(true);
      try {
        const res = await api.post("/billpay/config/providers", {
          vendorName:  VENDOR_NAME,
          serviceName: service.serviceName,
        });
        // Response: { statusCode, message, vendorName, serviceName, data: [...] }
        setProviders(res.data?.data || []);
      } catch (err) {
        console.error("Failed to load providers:", err);
        toast.error("Failed to load providers for this service.");
        setProviders([]);
      } finally {
        setLoadingProviders(false);
      }
    };
    fetchProviders();
  }, [service.serviceName]);

  const handleProviderChange = (providerId) => {
    setSelectedProviderId(providerId);
    const found = providers.find(
      (p) => String(p.providerId ?? p.id ?? p.providerName) === String(providerId)
    );
    setSelectedProvider(found || null);
    setBillData(null);
  };

  const handleFieldChange = (name, value) => {
    setFieldValues((prev) => ({ ...prev, [name]: value }));
    setBillData(null);
  };

  const validate = () => {
    if (!selectedProviderId) {
      toast.error("Please select a provider");
      return false;
    }
    for (const field of extraFields) {
      if (field.required && !fieldValues[field.name]?.trim()) {
        toast.error(`${field.label} is required`);
        return false;
      }
    }
    return true;
  };

  // Simulated fetch — biller info API to be wired when live credentials arrive
  const handleFetchDetails = async () => {
    if (!validate()) return;
    setFetching(true);
    setBillData(null);
    try {
      // TODO: replace with real biller info API call using selectedProvider.providerId
      await new Promise((r) => setTimeout(r, 1200));
      setBillData({
        customerName: "RAJESH KUMAR",
        billNumber:   "BILL" + Math.floor(Math.random() * 9000000 + 1000000),
        dueDate:      "2026-08-15",
        dueAmount:    (Math.floor(Math.random() * 4000) + 500).toString(),
        status:       "UNPAID",
      });
      setAmount("");
      setAmountError("");
    } catch {
      toast.error("Failed to fetch bill details. Please try again.");
    } finally {
      setFetching(false);
    }
  };

  const handlePay = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setAmountError("Enter a valid amount");
      return;
    }
    setAmountError("");
    setPaying(true);
    try {
      // TODO: replace with real payment API
      await new Promise((r) => setTimeout(r, 1500));
      toast.success(
        `₹${Number(amount).toLocaleString("en-IN")} paid successfully for ${service.serviceName}!`
      );
      setBillData(null);
      setAmount("");
      setSelectedProviderId("");
      setSelectedProvider(null);
      setFieldValues(Object.fromEntries(extraFields.map((f) => [f.name, ""])));
    } catch {
      toast.error("Payment failed. Please try again.");
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopBar title={service.serviceName} onBack={onBack} />

      <div className="flex-1 px-6 py-8">
        <div className="max-w-md space-y-5">

          {/* Provider dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Select Provider <span className="text-red-500">*</span>
            </label>
            {loadingProviders ? (
              <div className="w-72 h-10 bg-gray-200 rounded-lg animate-pulse" />
            ) : (
              <div className="relative w-72">
                <select
                  value={selectedProviderId}
                  onChange={(e) => handleProviderChange(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none pr-8"
                >
                  <option value="">Select Provider</option>
                  {providers.map((p) => {
                    const id    = p.providerId ?? p.id ?? p.providerName;
                    const label = p.providerName ?? p.name ?? String(id);
                    return (
                      <option key={id} value={id}>
                        {label}
                      </option>
                    );
                  })}
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">
                  ▼
                </span>
              </div>
            )}
          </div>

          {/* Dynamic extra fields from static catalogue */}
          {extraFields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {field.label}{" "}
                {field.required && <span className="text-red-500">*</span>}
              </label>
              <input
                type={field.type === "select" ? "text" : field.type}
                value={fieldValues[field.name]}
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                className="w-72 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          ))}

          {/* Fetch Details button */}
          <div className="flex justify-end w-72 pt-1">
            <button
              onClick={handleFetchDetails}
              disabled={fetching || loadingProviders}
              className="px-7 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-full hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {fetching ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Fetching...
                </>
              ) : (
                "FETCH DETAILS"
              )}
            </button>
          </div>

          {/* Bill details card */}
          {billData && (
            <div className="w-full bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              {/* Card header */}
              <div className="flex items-center gap-3 bg-indigo-700 px-5 py-3">
                <Icon className="text-white text-2xl" />
                <div>
                  <p className="text-white font-bold text-sm">{service.serviceName}</p>
                  <p className="text-indigo-200 text-xs">{billData.billNumber}</p>
                </div>
              </div>

              {/* Bill info */}
              <div className="px-5 py-4 space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Customer Name</span>
                  <span className="font-semibold text-gray-800">{billData.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Bill Number</span>
                  <span className="font-medium text-gray-700">{billData.billNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Due Date</span>
                  <span className="font-semibold text-gray-800">{billData.dueDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Due Amount</span>
                  <span className="font-bold text-indigo-700 text-base">
                    ₹{Number(billData.dueAmount).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-600">
                    {billData.status}
                  </span>
                </div>
              </div>

              {/* Amount + Pay */}
              <div className="px-5 pb-5 pt-2 border-t border-gray-100">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Enter Amount (₹) <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-3 items-start">
                  <div className="flex-1">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
                      <input
                        type="number"
                        min="1"
                        value={amount}
                        onChange={(e) => { setAmount(e.target.value); setAmountError(""); }}
                        placeholder={billData.dueAmount}
                        className={`w-full pl-7 pr-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          amountError ? "border-red-400 bg-red-50" : "border-gray-300"
                        }`}
                      />
                    </div>
                    {amountError && (
                      <p className="text-red-500 text-xs mt-1">{amountError}</p>
                    )}
                  </div>
                  <button
                    onClick={handlePay}
                    disabled={paying}
                    className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-full hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 whitespace-nowrap"
                  >
                    {paying ? (
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      "PAY NOW"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Root component ───────────────────────────────────────────────────────────
const BBPSPage = () => {
  const [screen, setScreen] = useState("grid"); // skip landing, go direct to grid
  const [selectedService, setSelectedService] = useState(null);

  if (screen === "grid") {
    return (
      <BBPSServiceGrid
        onSelectService={(svc) => {
          setSelectedService(svc);
          setScreen("form");
        }}
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
