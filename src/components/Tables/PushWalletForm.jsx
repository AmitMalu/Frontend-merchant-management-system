import React, { useState, useEffect } from "react";
import api from "../../constants/API/axiosInstance";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PushWalletForm = () => {
  const franchiseId = localStorage.getItem("franchiseId");

  const [merchants, setMerchants] = useState([]);
  const [selectedMerchant, setSelectedMerchant] = useState("");
  const [merchantName, setMerchantName] = useState("");
  const [amount, setAmount] = useState("");
  const [formattedAmount, setFormattedAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const MAX_AMOUNT = 100000;

  useEffect(() => {
    if (franchiseId) {
      fetchMerchants();
    }
  }, []);

 const fetchMerchants = async () => {
  try {
    const res = await api.get(`/merchants/franchise/${franchiseId}`);

    console.log("Merchant API Response:", res);
    console.log("Merchant API Data:", res.data);

    const merchantData = res.data.data || res.data;

    console.log("Merchant Data:", merchantData);

    setMerchants(merchantData || []);
  } catch (error) {
    console.error("Merchant API Error:", error);
    toast.error("Failed to load merchants");
  }
};

  // Amount Formatting + Limit Check
  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    const numericValue = Number(value);

    if (numericValue > MAX_AMOUNT) {
      toast.error("Maximum allowed amount is ₹1,00,000");
      return;
    }

    setAmount(value);

    if (value) {
      const formatted = new Intl.NumberFormat("en-IN").format(value);
      setFormattedAmount(`₹${formatted}`);
    } else {
      setFormattedAmount("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedMerchant) {
      toast.error("Please select merchant");
      return;
    }

    if (!amount) {
      toast.error("Please enter amount");
      return;
    }

    if (Number(amount) > MAX_AMOUNT) {
      toast.error("Amount cannot exceed ₹1,00,000");
      return;
    }

    try {
      setLoading(true);

      await api.post("/wallet/push", {
        franchiseId,
        merchantId: selectedMerchant,
        amount,
      });

      setShowPopup(true);
      toast.success("Wallet pushed successfully!");

      setAmount("");
      setFormattedAmount("");
      setSelectedMerchant("");

      setTimeout(() => {
        setShowPopup(false);
      }, 2500);

    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to push wallet"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 relative">
      <h2 className="text-2xl font-semibold mb-6">
        Push Wallet to Merchant
      </h2>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-2 gap-4 max-w-3xl"
      >
        <div className="col-span-2">
          <label className="block mb-1 font-medium">
            Select Merchant
          </label>

          <select
            value={selectedMerchant}
            onChange={(e) => {
              setSelectedMerchant(e.target.value);
              const selected = merchants.find(
                (m) => m.id === Number(e.target.value)
              );
              setMerchantName(selected?.merchantName || "");
            }}
            className="border p-2 rounded w-full"
            required
          >
            <option value="">-- Select Merchant --</option>
            {merchants.map((merchant) => (
              <option key={merchant.id} value={merchant.id}>
                {merchant.businessName}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-2">
          <label className="block mb-1 font-medium">
            Enter Amount (Max ₹1,00,000)
          </label>

          <input
            type="text"
            value={formattedAmount}
            onChange={handleAmountChange}
            placeholder="₹0"
            className="border p-2 rounded w-full"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="col-span-2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          {loading ? "Processing..." : "Push Wallet"}
        </button>
      </form>

      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center w-96">
            <h3 className="text-lg font-semibold mb-4 text-green-600">
              ₹{new Intl.NumberFormat("en-IN").format(amount)} successfully pushed to {merchantName}
            </h3>

            <button
              onClick={() => setShowPopup(false)}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PushWalletForm;
