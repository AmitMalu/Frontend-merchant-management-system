import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  SlidersHorizontal,
  IndianRupee,
  ToggleLeft,
  ToggleRight,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from "lucide-react";
import api from "../../constants/API/axiosInstance";
import { toast } from "react-toastify";

// ─── Boolean Toggle ───────────────────────────────────────────────────────────
const BooleanToggle = ({ label, description, value, onChange }) => (
  <div className="flex items-start justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
    <div className="flex-1">
      <p className="text-sm font-medium text-gray-800">{label}</p>
      {description && (
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      )}
    </div>
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ml-4 ${
        value
          ? "bg-green-100 text-green-700 border border-green-300 hover:bg-green-200"
          : "bg-red-100 text-red-700 border border-red-300 hover:bg-red-200"
      }`}
    >
      {value ? (
        <>
          <ToggleRight className="h-4 w-4" />
          Enabled
        </>
      ) : (
        <>
          <ToggleLeft className="h-4 w-4" />
          Disabled
        </>
      )}
    </button>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const MerchantSettings = () => {
  const { register, watch, reset } = useForm({
    defaultValues: {
      customerType: "",
      franchiseId: "",
      merchantId: "",
    },
  });

  const [availableFranchises, setAvailableFranchises] = useState([]);
  const [availableDirectMerchants, setAvailableDirectMerchants] = useState([]);
  const [availableFranchiseMerchants, setAvailableFranchiseMerchants] =
    useState([]);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form values
  const [lienAmount, setLienAmount] = useState("");
  const [isPayout, setIsPayout] = useState(false);
  const [isCreditCardBillPayment, setIsCreditCardBillPayment] = useState(false);

  // Errors
  const [errors, setErrors] = useState({});

  const customerType = watch("customerType");
  const franchiseId = watch("franchiseId");
  const merchantId = watch("merchantId");

  // ── Fetch initial data ─────────────────────────────────────────────────────
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [franchisesRes, directMerchantsRes] = await Promise.all([
          api.get("/franchise"),
          api.get("/merchants/direct-merchant"),
        ]);
        setAvailableFranchises(franchisesRes.data);
        setAvailableDirectMerchants(directMerchantsRes.data);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        toast.error("Failed to load data. Please refresh.");
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // ── Reset franchise merchants when customer type changes ───────────────────
  useEffect(() => {
    if (customerType) {
      setAvailableFranchiseMerchants([]);
    }
  }, [customerType]);

  // ── Fetch franchise merchants ──────────────────────────────────────────────
  useEffect(() => {
    const fetchFranchiseMerchants = async () => {
      if (!franchiseId || customerType !== "franchise") return;
      setLoading(true);
      try {
        const response = await api.get(`/merchants/franchise/${franchiseId}`);
        setAvailableFranchiseMerchants(response.data);
      } catch (error) {
        console.error("Error fetching franchise merchants:", error);
        setAvailableFranchiseMerchants([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFranchiseMerchants();
  }, [franchiseId, customerType]);

  // ── Merchant list for dropdown ─────────────────────────────────────────────
  const getMerchantsForSelection = () => {
    return customerType === "franchise"
      ? availableFranchiseMerchants
      : availableDirectMerchants;
  };

  // ── Validate ───────────────────────────────────────────────────────────────
  const validate = () => {
    const newErrors = {};

    if (!customerType) newErrors.customerType = "Please select a customer type";
    if (customerType === "franchise" && !franchiseId)
      newErrors.franchiseId = "Please select a franchise";
    if (!merchantId) newErrors.merchantId = "Please select a merchant";
    if (!lienAmount && lienAmount !== 0)
      newErrors.lienAmount = "Please enter a lien amount";
    if (lienAmount !== "" && isNaN(Number(lienAmount)))
      newErrors.lienAmount = "Lien amount must be a valid number";
    if (lienAmount !== "" && Number(lienAmount) < 0)
      newErrors.lienAmount = "Lien amount cannot be negative";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await api.put(`/merchants/${merchantId}/settings`, {
        lienAmount: Number(lienAmount),
        isPayout,
        isCreditCardBillPayment,
      });
      toast.success("Merchant settings updated successfully!");
    } catch (error) {
      console.error("Error updating merchant settings:", error);
      const message =
        error?.response?.data?.message ||
        error?.response?.data ||
        error.message ||
        "Failed to update settings. Please try again.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Reset form ─────────────────────────────────────────────────────────────
  const handleReset = () => {
    reset();
    setAvailableFranchiseMerchants([]);
    setLienAmount("");
    setIsPayout(false);
    setIsCreditCardBillPayment(false);
    setErrors({});
  };

  const showMerchantDropdown =
    customerType &&
    (customerType === "direct" || (customerType === "franchise" && franchiseId));

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* ── Page Header ── */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <SlidersHorizontal className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                Merchant Settings
              </h1>
              <p className="text-indigo-100 text-sm mt-0.5">
                Configure lien amount and feature toggles for a merchant
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* ── Selection Section ── */}
          <div>
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4 flex items-center gap-2">
              <span className="w-5 h-0.5 bg-indigo-500 rounded" />
              Select Merchant
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Customer Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Customer Type <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("customerType")}
                  disabled={loading}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.customerType ? "border-red-400" : "border-gray-300"
                  } ${loading ? "bg-gray-100" : "bg-white"}`}
                >
                  <option value="">Select type...</option>
                  <option value="direct">Direct Merchant</option>
                  <option value="franchise">Franchise</option>
                </select>
                {errors.customerType && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.customerType}
                  </p>
                )}
              </div>

              {/* Franchise (conditional) */}
              {customerType === "franchise" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Franchise <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register("franchiseId")}
                    disabled={loading}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors.franchiseId ? "border-red-400" : "border-gray-300"
                    } ${loading ? "bg-gray-100" : "bg-white"}`}
                  >
                    <option value="">Choose franchise...</option>
                    {availableFranchises.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.franchiseName} — {f.contactPersonName}
                      </option>
                    ))}
                  </select>
                  {errors.franchiseId && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.franchiseId}
                    </p>
                  )}
                </div>
              )}

              {/* Merchant */}
              {showMerchantDropdown && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Merchant <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register("merchantId")}
                    disabled={loading}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors.merchantId ? "border-red-400" : "border-gray-300"
                    } ${loading ? "bg-gray-100" : "bg-white"}`}
                  >
                    <option value="">Choose merchant...</option>
                    {getMerchantsForSelection().map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.businessName} — {m.contactPersonName}
                      </option>
                    ))}
                  </select>
                  {errors.merchantId && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.merchantId}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Loading indicator */}
            {loading && (
              <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                <div className="animate-spin h-3.5 w-3.5 border-2 border-indigo-500 border-t-transparent rounded-full" />
                Loading...
              </div>
            )}
          </div>

          {/* ── Settings Section (visible once merchant is selected) ── */}
          {merchantId && (
            <>
              <hr className="border-gray-200" />

              {/* Lien Amount */}
              <div>
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <span className="w-5 h-0.5 bg-indigo-500 rounded" />
                  Lien Amount
                </h2>

                <div className="max-w-sm">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Lien Amount (₹){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <IndianRupee className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={lienAmount}
                      onChange={(e) => {
                        setLienAmount(e.target.value);
                        if (errors.lienAmount)
                          setErrors((prev) => ({ ...prev, lienAmount: "" }));
                      }}
                      placeholder="Enter lien amount"
                      className={`w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.lienAmount
                          ? "border-red-400 bg-red-50"
                          : "border-gray-300 bg-white"
                      }`}
                    />
                  </div>
                  {errors.lienAmount && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.lienAmount}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    The lien amount will be held against the merchant's wallet
                    balance.
                  </p>
                </div>
              </div>

              <hr className="border-gray-200" />

              {/* Feature Toggles */}
              <div>
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <span className="w-5 h-0.5 bg-indigo-500 rounded" />
                  Feature Settings
                </h2>

                <div className="space-y-3">
                  <BooleanToggle
                    label="Payout"
                    description="Allow this merchant to initiate payout transactions"
                    value={isPayout}
                    onChange={setIsPayout}
                  />
                  <BooleanToggle
                    label="Credit Card Bill Payment"
                    description="Allow this merchant to accept credit card bill payments"
                    value={isCreditCardBillPayment}
                    onChange={setIsCreditCardBillPayment}
                  />
                </div>
              </div>

              {/* ── Summary Card ── */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-indigo-800 mb-2">
                  Summary
                </h3>
                <ul className="text-sm text-indigo-700 space-y-1">
                  <li className="flex items-center gap-2">
                    <IndianRupee className="h-3.5 w-3.5" />
                    Lien Amount:{" "}
                    <span className="font-medium">
                      ₹{lienAmount !== "" ? Number(lienAmount).toLocaleString("en-IN") : "—"}
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    {isPayout ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-red-500" />
                    )}
                    Payout:{" "}
                    <span
                      className={`font-medium ${
                        isPayout ? "text-green-700" : "text-red-600"
                      }`}
                    >
                      {isPayout ? "Enabled" : "Disabled"}
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    {isCreditCardBillPayment ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-red-500" />
                    )}
                    Credit Card Bill Payment:{" "}
                    <span
                      className={`font-medium ${
                        isCreditCardBillPayment
                          ? "text-green-700"
                          : "text-red-600"
                      }`}
                    >
                      {isCreditCardBillPayment ? "Enabled" : "Disabled"}
                    </span>
                  </li>
                </ul>
              </div>
            </>
          )}

          {/* ── Actions ── */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <button
              type="button"
              onClick={handleReset}
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className="h-4 w-4" />
              Reset
            </button>

            <button
              type="submit"
              disabled={submitting || !merchantId}
              className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Saving...
                </>
              ) : (
                <>
                  <SlidersHorizontal className="h-4 w-4" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MerchantSettings;
